module.exports = (sequelize, DataTypes) => {
  const Schedule = sequelize.define(
    'Schedule',
    {
      schedule_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
      },
      start_time: DataTypes.TIME,
      end_time: DataTypes.TIME,
    },
    {
      tableName: 'schedules',
      timestamps: true,
      underscored: true,
    }
  );

  Schedule.associate = (models) => {
    Schedule.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'Class',
      onDelete: 'CASCADE',
    });

    Schedule.belongsTo(models.DayOfWeek, {
      foreignKey: 'day_id',
      as: 'Day',
      onDelete: 'CASCADE',
    });

    Schedule.belongsTo(models.Session, {
      foreignKey: 'session_id',
      as: 'Session',
      onDelete: 'CASCADE',
    });

    Schedule.belongsToMany(models.Teacher, {
      through: 'teacher_schedules',
      foreignKey: 'schedule_id',
      otherKey: 'teacher_id',
      as: 'Teachers',
    });

    Schedule.belongsToMany(models.Subject, {
      through: 'schedule_subjects',
      foreignKey: 'schedule_id',
      otherKey: 'subject_id',
      as: 'Subjects',
    });
  };

  return Schedule;
};
