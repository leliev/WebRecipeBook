const controller = require("../controllers/recipe.controler");

module.exports = function(app) {
  app.post("/api/recipe", controller.createRecipe);
};