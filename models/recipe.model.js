module.exports = (sequelize, Sequelize) => {
  const Recipe = sequelize.define("recipe", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: '',
    },
    instruction: {
      type: Sequelize.TEXT,
      allowNull: false,
      defaultValue: '',
    },
    preptime: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
    serving: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 0,
    }
  });

  return Recipe;
};