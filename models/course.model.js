module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define("course", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    }
  }, { timestamps: false });

  return Course;
};