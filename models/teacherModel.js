module.exports = (sequelize, DataTypes) => {
  const Teacher = sequelize.define(
    'Teacher',
    {
      teacher_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      subject: {
        type: DataTypes.STRING,
        defaultValue: null,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'teachers',
      timestamps: true,
      underscored: true,
    }
  );

  Teacher.associate = (models) => {
    Teacher.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'User',
    });

    Teacher.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });

    Teacher.belongsToMany(models.Schedule, {
      through: 'teacher_schedules',
      foreignKey: 'teacher_id',
      otherKey: 'schedule_id',
      as: 'Schedules',
    });
  };

  return Teacher;
};
