const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Student extends Model {
    // instance or class methods here if needed
  }

  Student.init(
    {
      student_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      guardian_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      guardian_email: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      guardian_relationship: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      guardian_contact: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'students',
      timestamps: true,
      underscored: true,
    }
  );

  Student.associate = (models) => {
    Student.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });

    Student.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'Class',
    });

    Student.belongsTo(models.Info, {
      foreignKey: 'info_id',
      as: 'Info',
    });
  };

  return Student;
};
