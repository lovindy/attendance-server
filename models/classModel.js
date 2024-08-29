module.exports = (sequelize, DataTypes) => {
  const Class = sequelize.define(
    'Class',
    {
      class_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      grade: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      tableName: 'classes',
      timestamps: true,
      underscored: true,
    }
  );

  Class.associate = (models) => {
    Class.belongsTo(models.Teacher, {
      foreignKey: 'teacher_id',
      as: 'Teacher',
    });

    Class.belongsTo(models.SchoolAdmin, {
      foreignKey: 'school_admin_id',
      as: 'SchoolAdmin',
    });

    Class.hasMany(models.Student, {
      foreignKey: 'class_id',
      as: 'Students',
    });

    Class.hasMany(models.Schedule, {
      foreignKey: 'class_id',
      as: 'Schedules',
      onDelete: 'CASCADE',
    });

    Class.belongsToMany(models.Subject, {
      through: 'class_subjects',
      foreignKey: 'class_id',
      otherKey: 'subject_id',
      as: 'Subjects',
    });
  };

  return Class;
};
