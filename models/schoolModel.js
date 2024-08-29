module.exports = (sequelize, DataTypes) => {
  const School = sequelize.define(
    'School',
    {
      school_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: DataTypes.STRING,
      address: DataTypes.STRING,
      logo_url: DataTypes.STRING,
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'schools',
      timestamps: true,
      underscored: true,
    }
  );

  School.associate = (models) => {
    School.belongsToMany(models.Admin, {
      through: models.SchoolAdmin,
      foreignKey: 'school_id',
      as: 'Admins',
    });
  };

  return School;
};
