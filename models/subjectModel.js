const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Subject extends Model {
    // instance or class methods here if needed
  }

  Subject.init(
    {
      subject_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      description: {
        type: DataTypes.STRING,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'subjects',
      timestamps: true,
      underscored: true,
    }
  );

  Subject.associate = (models) => {
    Subject.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });

    Subject.hasMany(models.Session, {
      foreignKey: 'subject_id',
      as: 'Sessions',
      onDelete: 'CASCADE',
    });
  };

  return Subject;
};
