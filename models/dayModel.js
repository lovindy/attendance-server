const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class DayOfWeek extends Model {
    // instance or class methods here if needed
  }

  DayOfWeek.init(
    {
      day_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      day: {
        type: DataTypes.ENUM(
          'monday',
          'tuesday',
          'wednesday',
          'thursday',
          'friday',
          'saturday',
          'sunday'
        ),
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
      tableName: 'days',
      timestamps: true,
      underscored: true,
    }
  );

  DayOfWeek.associate = (models) => {
    DayOfWeek.hasMany(models.Session, {
      foreignKey: 'day_id',
      as: 'Sessions',
      onDelete: 'CASCADE',
    });
  };

  return DayOfWeek;
};
