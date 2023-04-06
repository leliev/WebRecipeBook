module.exports = (sequelize, Sequelize) => {
  const Recipe = sequelize.define("recipe", {
    name: {
      type: Sequelize.STRING
    },
    instruction: {
      type: Sequelize.TEXT
    },
    preptime: {
      type: Sequelize.SMALLINT
    }
  });

  return Recipe;
};