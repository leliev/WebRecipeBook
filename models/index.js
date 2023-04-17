const config = require("../config/db.config.js");

const Sequelize = require("sequelize");

const sequelize = new Sequelize(
  config.DB,
  config.USER,
  config.PASSWORD,
  {
    host: config.HOST,
    port: config.PORT,
    dialect: config.dialect,
    operatorsAliases: false,

    pool:{
      max: config.pool.max,
      min: config.pool.min,
      acquire: config.pool.acquire,
      idle: config.pool.idle,
    }
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

//Instantiate models
db.recipe = require("./recipe.model.js")(sequelize, Sequelize);
db.course = require("./course.model.js")(sequelize, Sequelize);
db.ingredient = require("./ingredient.model.js")(sequelize, Sequelize);
db.recipeIngredients = require("./recipeIngredients.model.js")(sequelize, Sequelize);

//Declaring super Many-to-Many association
db.recipe.belongsToMany(db.ingredient, {
  as: 'relIngredients',
  through: db.recipeIngredients
});
db.ingredient.belongsToMany(db.recipe, {
  as: 'relRecipes',
  through: db.recipeIngredients
});
db.recipe.hasMany(db.recipeIngredients);
db.recipeIngredients.belongsTo(db.recipe)

db.ingredient.hasMany(db.recipeIngredients)
db.recipeIngredients.belongsTo(db.ingredient)

//Recipe/Course One-to-Many association
db.recipe.belongsTo(db.course, { foreignKey: { allowNull: false }});
db.course.hasMany(db.recipe, { foreignKey: { allowNull: false }});


module.exports = db;