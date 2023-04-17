module.exports = (sequelize, Sequelize) => {
  const Ingredient = sequelize.define("ingredient", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, { timestamps: false });

  return Ingredient;
};