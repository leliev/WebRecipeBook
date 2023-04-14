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
  const course = req.body.course;
  //If missing data reject request
  if (!name || !instruction || !preptime || !serving || !course) {
    console.log({message: "recipe incomplete"})
    return res.send({message: "Recipe incomplete"});
  };

  const recipe = {
    name: name,
    instruction: instruction,
    preptime: preptime,
    serving: serving
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
          //Add relation between current ingredient(dreated or not) and recipe
          newRecipe.addRelIngredients(data[0], {through: {quantity: value}});
          console.log({message: "ingredient " + key + " added with quantity " + value});
        });
      });
      //Create entry if don't exist
      FoCName(Course, course).then(data => {
        //Set relation between given course and recipe
        newRecipe.setCourse(data[0]);
        console.log({message: "Course " + course + " added to " + newRecipe.name});
      });
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
  console.log({message: "ID:" + parseInt(req.params.recipeId)})
  const recipeId = parseInt(req.params.recipeId);

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
  const id = parseInt(req.params.ingredientId)
  console.log({message: "ID:" + parseInt(req.params.ingredientId)})

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

exports.updateRecipe = async (req, res) => {

  if (!newName && !newInstruction && !newPreptime && !newServing && !newCourse && ! newIngredients) {
    console.log({message: "You need to update at least one value"})
    return res.send({message: "You need to update at least one value"});
  };

  try {
    const newRecipe = {};
    const recipeId = parseInt(req.params.recipeId);
    console.log({message: "id"+recipeId})
    
    const oldRecipe = await Recipe.findByPk(recipeId, {
      attributes: {exclude: ["courseId"]},
      include: [
        {model: Ingredient, as: 'relIngredients', attributes: ["name"],
          through: {attributes: ["quantity"]}
        },
        {model: Course, attributes: ["name"]}
      ]
    });
  
    function newFieldHandler(attribute, value) {

      console.log({message:"value:"+ value + "for attribute:" + attribute});
      if (!value || value.length === 0 || oldRecipe[attribute] === value) {
        return newRecipe;
      } else {
        newRecipe[attribute] = value;
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

    const rows = await Recipe.update({...newRecipe}, {
      where: {id: recipeId}
    });

    const newCourse = req.body.course;
    const updatedRecipe = await Recipe.findByPk(recipeId, {
      attributes: {exclude: ["courseId"]},
      include: [
        {model: Ingredient, as: 'relIngredients', attributes: ["name"],
          through: {attributes: ["quantity"]}
        },
        {model: Course, attributes: ["name"]}
      ]
    });

    if (newCourse && newCourse != oldRecipe.course.name) {
      const [course, created] = await FoCName(Course, newCourse);
    
      updatedRecipe.setCourse(course);
      console.log({message: "Course " + newCourse + " added to " + updatedRecipe.name});
    };

    if (rows == 1) {
      return res.json({updatedRecipe})
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
