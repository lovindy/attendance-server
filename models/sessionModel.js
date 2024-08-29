module.exports = (sequelize, DataTypes) => {
  const Session = sequelize.define(
    'Session',
    {
      session_id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      session_name: {
        type: DataTypes.STRING,
        allowNull: false,
      },
      session_start_time: {
        type: DataTypes.TIME,
        allowNull: false,
      },
      session_end_time: {
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
      tableName: 'sessions',
      timestamps: true,
      underscored: true,
    }
  );

  Session.associate = (models) => {
    Session.hasMany(models.Schedule, {
      foreignKey: 'session_id',
      as: 'Schedules',
      onDelete: 'CASCADE',
    });
  };

  return Session;
};
