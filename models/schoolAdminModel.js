const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class SchoolAdmin extends Model {
    // instance or class methods here if needed
  }

  SchoolAdmin.init(
    {
      school_admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'Principal',
      },
    },
    {
      sequelize,
      tableName: 'school_admin',
      timestamps: true,
      underscored: true,
    }
  );

  SchoolAdmin.associate = (models) => {
    SchoolAdmin.belongsTo(models.Admin, {
      foreignKey: 'admin_id',
      as: 'Admin',
    });

    SchoolAdmin.belongsTo(models.School, {
      foreignKey: 'school_id',
      as: 'School',
    });

    SchoolAdmin.hasMany(models.Teacher, {
      foreignKey: 'school_admin_id',
      as: 'Teachers',
    });

    SchoolAdmin.hasMany(models.Student, {
      foreignKey: 'school_admin_id',
      as: 'Students',
    });

    SchoolAdmin.hasMany(models.Session, {
      foreignKey: 'school_admin_id',
      as: 'Sessions',
      onDelete: 'CASCADE',
    });
  };

  return SchoolAdmin;
};
