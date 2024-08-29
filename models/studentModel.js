module.exports = (sequelize, DataTypes) => {
  const Student = sequelize.define(
    'Student',
    {
      student_id: {
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
      tableName: 'students',
      timestamps: true,
      underscored: true,
    }
  );

  Student.associate = (models) => {
    Student.belongsTo(models.User, {
      foreignKey: 'user_id',
      as: 'User',
    });
    Student.belongsTo(models.Class, {
      foreignKey: 'class_id',
      as: 'Class',
    });
    Student.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });
  };

  return Student;
};
