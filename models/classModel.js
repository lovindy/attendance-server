const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Class extends Model {
    // instance or class methods here if needed
  }

  Class.init(
    {
      class_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      class_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      grade: {
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
      tableName: 'classes',
      timestamps: true,
      underscored: true,
    }
  );

  Class.associate = (models) => {
    Class.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });

    Class.hasMany(models.Student, {
      foreignKey: 'class_id',
      as: 'Students',
      onDelete: 'CASCADE',
    });

    Class.hasMany(models.Session, {
      foreignKey: 'class_id',
      as: 'Sessions',
      onDelete: 'CASCADE',
    });
  };

  return Class;
};
