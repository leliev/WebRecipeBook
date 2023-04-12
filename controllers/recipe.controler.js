const db = require("../models");
const Ingredient = db.ingredient;
const Recipe = db.recipe;
const Course = db.course;

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
    res.send({message: "Recipe incomplete"});
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
      res.send({message: "Recipe already exist"});
    } else {
      //Create entry if don't exist for each recipe's ingredients
      Object.entries(ingredients).forEach(([key, value]) => {
        FoCName(Ingredient, key).then(data => {
          //Add relation between current ingredient(dreated or not) and recipe
          newRecipe.addIngredient(data[0], {through: {quantity: value}});
          console.log({message: "ingredient " + key + " added with quantity " + value});
        });
      });
      //Create entry if don't exist
      FoCName(Course, course).then(data => {
        //Set relation between given course and recipe
        newRecipe.setCourse(data[0]);
        console.log({message: "Course " + course + " added to " + newRecipe.name});
      });
      res.send({message: "Recipe created "});
    };
  } catch(error) {
    console.error(error);
  };
};
