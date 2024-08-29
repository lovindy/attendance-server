module.exports = (sequelize, DataTypes) => {
  const Admin = sequelize.define(
    'Admin',
    {
      admin_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'admins',
      timestamps: true,
      underscored: true,
    }
  );

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
  };

  return Admin;
};
