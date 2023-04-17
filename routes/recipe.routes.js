const controller = require("../controllers/recipe.controler");

module.exports = function(app) {
  /*Expected request body format:
      name: STRING,
      instruction: STRING,
      preptime: INTEGER,
      serving: INTEGER,
      ingredients: OBJ {KEY: STRING, VALUE: INTEGER},
      courseId: INTEGER (1 <= x <= 3)*/
  app.post("/api/recipe", controller.createRecipe);

  app.get("/api/recipe", controller.getAllRecipes);

  //Request params id: INTEGER
  app.get("/api/recipe/:recipeId", controller.getRecipeById);

  //Request params id: INTEGER
  app.get("/api/ingredient/:ingredientId", controller.getRecipesByIngredient);

  //Request params id: INTEGER
  app.get("/api/course/:courseId", controller.getRecipesByCourse);

  /*Request params id: INTEGER
    Expected request body format (all fields are optional but need at least 1 change to confirm):
      name: STRING,
      instruction: STRING,
      preptime: INTEGER,
      serving: INTEGER,
      courseId: INTEGER (1 <= x <= 3)*/
  app.put("/api/recipe/:recipeId", controller.updateRecipe);
  
  //Request params id: INTEGER
  app.delete("/api/recipe/:recipeId", controller.deleteRecipe);
};