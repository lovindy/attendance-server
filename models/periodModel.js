const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Period extends Model {
    // instance or class methods here if needed
  }

  Period.init(
    {
      period_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      period_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      end_time: {
        type: DataTypes.TIME,
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
      tableName: 'periods',
      timestamps: true,
      underscored: true,
    }
  );

  Period.associate = (models) => {
    Period.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });

    Period.hasMany(models.Session, {
      foreignKey: 'period_id',
      as: 'Sessions',
      onDelete: 'CASCADE',
    });
  };

  return Period;
};
