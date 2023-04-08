module.exports = (sequelize, Sequelize) => {
  const Course = sequelize.define("course", {
    name: {
      type: Sequelize.STRING,
      allowNull: false,
      defaultValue: ''
    }
  }, { timestamps: false });

  return Course;
};