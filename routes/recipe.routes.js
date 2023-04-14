const controller = require("../controllers/recipe.controler");

module.exports = function(app) {
  app.post("/api/recipe", controller.createRecipe);

  app.get("/api/recipe", controller.getAllRecipes);

  app.get("/api/recipe/:recipeId", controller.getRecipeById);

  app.get("/api/ingredient/:ingredientId", controller.getRecipesByIngredient);

  app.put("/api/recipe/:recipeId", controller.updateRecipe);
};