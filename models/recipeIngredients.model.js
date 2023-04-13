module.exports = (sequelize, Sequelize) => {
  const RecipeIngredients = sequelize.define("recipe_ingredients", {
    id: {
      type: Sequelize.INTEGER,
      primaryKey: true,
      autoIncrement: true,
      allowNull: false
    },
    quantity: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  }, { timestamps: false });
  
  return RecipeIngredients;
};