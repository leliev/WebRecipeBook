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

db.recipe = require("./recipe.model.js")(sequelize, Sequelize);
db.course = require("./course.model.js")(sequelize, Sequelize);
db.ingredient = require("./ingredient.model.js")(sequelize, Sequelize);

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


db.recipe.belongsToMany(db.ingredient, {
  through: RecipeIngredients
});
db.ingredient.belongsToMany(db.recipe, {
  through: RecipeIngredients
});

db.recipe.belongsTo(db.course);
db.course.hasMany(db.recipe);


module.exports = db;