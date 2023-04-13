module.exports = (sequelize, Sequelize) => {
  const Ingredient = sequelize.define("ingredient", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue:''
    }
  }, { timestamps: false });

  return Ingredient;
};