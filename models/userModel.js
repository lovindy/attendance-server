const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { Model } = require('sequelize');

module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Check if entered password is correct
     * @param {string} candidatePassword - Entered password
     * @param {string} userPassword - Hashed password from DB
     * @returns {boolean} - True if passwords match
     */
    async correctPassword(candidatePassword, userPassword) {
      return await bcrypt.compare(candidatePassword, userPassword);
    }

    /**
     * Check if password was changed after JWT was issued
     * @param {number} JWTTimestamp - JWT issuance timestamp
     * @returns {boolean} - True if password was changed after JWT issuance
     */
    changedPasswordAfter(JWTTimestamp) {
      if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
          this.passwordChangedAt.getTime() / 1000,
          10
        );
        return JWTTimestamp < changedTimestamp;
      }
      return false; // False means NOT changed
    }

    /**
     * Create password reset token
     * @returns {string} - Reset token to be sent to user
     */
    createPasswordResetToken() {
      const resetToken = crypto.randomBytes(32).toString('hex');

      this.passwordResetToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

      this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

      return resetToken;
    }
  }

  // Define user model
  User.init(
    {
      user_id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true,
      },
      name: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'A name is required' },
          notEmpty: { msg: 'Name cannot be empty' },
        },
      },
      email: {
        type: DataTypes.STRING,
        allowNull: false,
        unique: {
          msg: 'Email address already in use',
        },
        validate: {
          notNull: { msg: 'An email is required' },
          notEmpty: { msg: 'Email cannot be empty' },
          isEmail: {
            msg: 'Please provide a valid email address',
          },
        },
      },
      password: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notNull: { msg: 'A password is required' },
          notEmpty: { msg: 'Password cannot be empty' },
          len: {
            args: [8],
            msg: 'Password must be at least 8 characters long',
          },
        },
      },
      passwordConfirm: {
        type: DataTypes.VIRTUAL,
        validate: {
          notEmpty: { msg: 'Password confirmation cannot be empty' },
          isMatch(value) {
            if (value !== this.password) {
              throw new Error('Passwords do not match');
            }
          },
        },
      },
      role: {
        type: DataTypes.ENUM('admin', 'teacher', 'student'),
        allowNull: false,
        defaultValue: 'student',
        validate: {
          isIn: {
            args: [['admin', 'teacher', 'student']],
            msg: 'Invalid role',
          },
        },
      },
      passwordChangedAt: {
        type: DataTypes.DATE,
      },
      passwordResetToken: {
        type: DataTypes.STRING,
      },
      passwordResetExpires: {
        type: DataTypes.DATE,
      },
      active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false,
      },
    },
    {
      sequelize,
      tableName: 'users',
      timestamps: true,
      underscored: true,
      defaultScope: {
        // Exclude password and inactive users by default
        attributes: {
          exclude: [
            'password',
            'passwordConfirm',
            'passwordResetToken',
            'passwordResetExpires',
          ],
        },
        where: {
          active: true,
        },
      },
      scopes: {
        // Include password for authentication purposes
        withPassword: {
          attributes: {},
        },
      },
    }
  );

  /**
   * HASH PASSWORD BEFORE SAVING
   */
  User.addHook('beforeSave', async (user) => {
    if (user.changed('password')) {
      user.password = await bcrypt.hash(user.password, 12);
      user.passwordConfirm = undefined;
      if (!user.isNewRecord) {
        user.passwordChangedAt = new Date(Date.now() - 1000); // Subtract 1s to account for token issuance delay
      }
    }
  });

  /**
   * ASSOCIATE MODELS
   */
  User.associate = (models) => {
    User.hasOne(models.Student, {
      foreignKey: 'user_id',
      as: 'StudentProfile',
      onDelete: 'CASCADE',
    });
    User.hasOne(models.Teacher, {
      foreignKey: 'user_id',
      as: 'TeacherProfile',
      onDelete: 'CASCADE',
    });
    User.hasOne(models.Admin, {
      foreignKey: 'user_id',
      as: 'AdminProfile',
      onDelete: 'CASCADE',
    });

    // This association ensures that a user can have one profile (admin, teacher, or student) based on the role.
  };

  return User;
};
