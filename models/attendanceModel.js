module.exports = (sequelize, DataTypes) => {
  const Attendance = sequelize.define(
    'Attendance',
    {
      attendance_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      date: {
        type: DataTypes.DATEONLY,
        allowNull: false,
      },
      status: {
        type: DataTypes.ENUM(
          'late',
          'present',
          'absent',
          'absent_with_permission'
        ),
        allowNull: false,
        defaultValue: 'absent',
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'attendances',
      timestamps: true,
      underscored: true,
    }
  );

  Attendance.associate = (models) => {
    Attendance.belongsTo(models.Student, {
      foreignKey: 'student_id',
      as: 'Student',
      onDelete: 'CASCADE',
    });

    Attendance.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'Class',
      onDelete: 'CASCADE',
    });

    Attendance.belongsTo(models.Schedule, {
      foreignKey: 'schedule_id',
      as: 'Schedule',
      onDelete: 'CASCADE',
    });
  };

  return Attendance;
};
