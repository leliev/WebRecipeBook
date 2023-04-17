const db = require("../models");
const Ingredient = db.ingredient;
const Recipe = db.recipe;
const Course = db.course;
const RecipeIngredients= db.recipeIngredients;

async function FoCName(dbModel, name) {
  const data = await dbModel.findOrCreate({
    where: {name: name},
    default: {name: name}
  });
  if (!data[1]) {
    console.log({message: "Element "+ name + " already exist"});
  };
  return data;
};

//Recipe creation controler
exports.createRecipe = async (req, res) => {

  const name = req.body.name;
  const instruction = req.body.instruction;
  const preptime = parseInt(req.body.preptime);
  const serving = parseInt(req.body.serving);
  const ingredients = req.body.ingredients;
  const courseId = parseInt(req.body.courseId);

  //If missing data reject request(front check also)
  if (!name || !instruction || !preptime || !serving || !courseId) {
    console.log({message: "recipe incomplete"})
    return res.send({message: "Recipe incomplete"});
  };

  const recipe = {
    name: name,
    instruction: instruction,
    preptime: preptime,
    serving: serving,
    courseId: courseId
  };

  try {
    //Create entry if don't exist and ALWAYS return instance of data and boolean (created or not)
    const [newRecipe, created] = await Recipe.findOrCreate({ 
      where: {name: name},
      defaults: {...recipe}
    });
    
    //If data exist reject request
    if (!created) {
      console.log("Recipe already exist")
      return res.send({message: "Recipe already exist"});

    } else {
      //Create entry if don't exist for each recipe's ingredients
      Object.entries(ingredients).forEach(([key, value]) => {
        FoCName(Ingredient, key).then(data => {
          //Add relation between current ingredient(created or not) and recipe
          newRecipe.addRelIngredients(data[0], {through: {quantity: value}}).then(relCreated => {
            if (!relCreated) {
              return res.send({message: `Could not associate ingredient ${data[0].name}`});
            };
            console.log({message: "ingredient " + key + " added with quantity " + value});
          });
        });
      });

      console.log({message: "Course " + courseId + " added to " + newRecipe.name});
      return res.send({message: "Recipe created "});
    };
  } catch(error) {
    console.error(error);
    return res.send({
      message: error.message || "Some error occurred while creating recipe."
    });
  };
};

//Retrieve all recipes in DB
exports.getAllRecipes = (req, res) => {
  Recipe.findAll({
    //Exclude unused attribute
    attributes: {exclude: ["courseId"]},
    //Include recipe ingredients and course name
    include: [
      {model: Ingredient, as: "relIngredients", attributes: ["name"],
        through: {attributes: ["quantity"]}
      },
      {model: Course, attributes: ["name"]}
    ]
  }).then(recipeList => {
    //Special case no recipe in DB
    if (recipeList.length === 0 || !recipeList) {
      return res.send({message: "No recipe to display"});
    };
    return res.json(recipeList);
  }).catch(error => {
    console.error(error);
    return res.send({
      message: error.message || "Some error occurred while retrieving recipes."
    });
  });
};

//Retrieve one recipe by ID (request parameter)
exports.getRecipeById = (req, res) => {
  const recipeId = parseInt(req.params.recipeId);
  console.log({message: "ID:" + recipeId})

  if (!recipeId) {
    //Terminate if no ID found in params
    return res.send({message: "No proper Id provided"});
  };

  Recipe.findByPk(recipeId, {
    attributes: {exclude: ["courseId"]},
    include: [
      {model: Ingredient, as: 'relIngredients', attributes: ["name"],
        through: {attributes: ["quantity"]}
      },
      {model: Course, attributes: ["name"]}
    ]
  }).then(recipe => {
    if (!recipe) {
      //Terminate if given ID don't exist
      return res.send({message: "No recipe found for this Id"});
    };
    return res.json(recipe);
  }).catch(error => {
    console.error(error);
    return res.send({
      message: error.message || "Some error occurred while retrieving recipe."
    });
  });
};

//Retrieve all recipes containing given ingredient ID (request parameter)
exports.getRecipesByIngredient = (req, res) => {
  console.log(req.params);
  const id = parseInt(req.params.ingredientId);
  console.log({message: "ID:" + id});

  Recipe.findAll({
    include: [
      {model: RecipeIngredients,
        where: {ingredientId: id}
      },
      {model: Ingredient, as: 'relIngredients'}
    ]
  }).then(list => {
    if (list.length === 0 || !list) {
      return res.send({message: "No recipe with given ingredient found"});
    };
    return res.json(list)
  });
};

//Find recipe by course type
exports.getRecipesByCourse = (req, res) => {
  console.log(req.params);
  const id = parseInt(req.params.courseId);

  Recipe.findAll({
    where: {courseId: id},
    include: [
      {model: Ingredient, as: "relIngredients", attributes: ["name"],
        through: {attributes: ["quantity"]}
      },
      {model: Course, attributes: ["name"]}
    ]
  }).then(list => {
    if (list.length === 0 || !list) {
      return res.send({message: "No recipe with given course found"});
    };
    return res.json(list)
  })
},

//Works but is ugly and need work, update recipe except ingredients (separate route and controller)
exports.updateRecipe = async (req, res) => {

  try {
    const newRecipe = {};
    const recipeId = parseInt(req.params.recipeId);
    //Fetch instance of tageted recipe for comparison
    const oldRecipe = await Recipe.findByPk(recipeId, {
      include: [
        {model: Ingredient, as: 'relIngredients', attributes: ["name"],
          through: {attributes: ["quantity"]}
        },
        {model: Course, attributes: ["name"]}
      ]
    });

    //Evaluates attributes if to be updated or not and store value in recipe object
    function newFieldHandler(attribute, value) {
      if (!value || value.length === 0 || oldRecipe[attribute] === value) {
        console.log({message:`Didn't update attribute: ${attribute} with value: ${value}`});
        return newRecipe;
      } else {
        newRecipe[attribute] = value;
        console.log({message:`Attribute: ${attribute} updated to value: ${value}`});
        return newRecipe;
      };
    };
    const newName = req.body.name;
    newFieldHandler("name", newName);

    const newInstruction = req.body.instruction;
    newFieldHandler("instruction", newInstruction);

    const newPreptime = parseInt(req.body.preptime);
    newFieldHandler("preptime", newPreptime);

    const newServing = parseInt(req.body.serving);
    newFieldHandler("serving", newServing);

    //Course update logic
    const newCourse = parseInt(req.body.courseId);
    //Must be a valid preexisting id
    if (newCourse < 1 || newCourse > 3) {
      return res.send({message: `invalid course`});
    };
    //Set new course if relevant
    async function courseUpdate() {
      if (newCourse && (newCourse != oldRecipe.courseId)) {
        const updateData = await oldRecipe.setCourse(newCourse);
        if (updateData) {
          console.log({message: "Course " + newCourse + " added to " + oldRecipe.name});
          return true
        };
      };
      return false
    };
    //Update target recipe with recipe object values
    const rows = await Recipe.update({...newRecipe}, {
      where: {id: recipeId}
    });
    //If anything was changed send confirmation
    const update = await courseUpdate();
    if (rows == 1 || update) {
      return res.send({message: `Recipe updated`});
    } else {
      //Send error if no row modified
      res.status(500).send({
        message: `Cannot update recipe with id=${recipeId}`
      });
    };
  } catch(error) {
    console.error(error);
    return res.send({
      message: error.message || "Some error occurred while updating recipe."
    });
  };
};

//Recipe delete controller
exports.deleteRecipe = async (req, res) => {
  const recipeId = parseInt(req.params.recipeId);

  try {
    //Try to destroy recipe with given Id
    const row = await Recipe.destroy({where: {id: recipeId}});
    //Ids are unique so if affected row number not 1 => error
    if (row != 1) {
      return res.status(500).send({
        message: `Cannot delete recipe with id=${recipeId}`
      });
    };
    //Confirm if expected value
    console.log({'recipe deleted': row});
    return res.send({message: `Recipe deleted`});

  } catch(error) {
    console.error(error);
    return res.send({
      message: error.message || "Some error occurred while deleting recipe."
    });
  };
};