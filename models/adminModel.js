const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class Admin extends Model {
    // instance or class methods here if needed
  }

  Admin.init(
    {
      admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
    },
    {
      sequelize,
      tableName: 'admins',
      timestamps: true,
      underscored: true,
    }
  );

  // Define associations
  Admin.associate = (models) => {
    Admin.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'User',
    });

    Admin.belongsToMany(models.School, {
      through: models.SchoolAdmin,
      foreignKey: 'admin_id',
      as: 'Schools',
    });

    Admin.belongsTo(models.Info, {
      foreignKey: 'info_id',
      as: 'Info',
    });
  };

  return Admin;
};
