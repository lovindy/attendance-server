module.exports = (sequelize, DataTypes) => {
  const Subject = sequelize.define(
    'Subject',
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
      tableName: 'subjects',
      timestamps: true,
      underscored: true,
    }
  );

  Subject.associate = (models) => {
    Subject.belongsToMany(models.Class, {
      through: 'class_subjects',
      foreignKey: 'subject_id',
      otherKey: 'class_id',
      as: 'Classes',
    });

    Subject.belongsToMany(models.Schedule, {
      through: 'schedule_subjects',
      foreignKey: 'subject_id',
      otherKey: 'schedule_id',
      as: 'Schedules',
    });
  };

  return Subject;
};
