// Import Model
const { DayOfWeek } = require('../models');

// Function to seed days of the week
const seedDaysOfWeek = async () => {
  const days = [
    'monday',
    'tuesday',
    'wednesday',
    'thursday',
    'friday',
    'saturday',
    'sunday',
  ];

  for (const day of days) {
    // Check if the day already exists
    const existingDay = await DayOfWeek.findOne({ where: { day } });

    // Create the day if it doesn't exist
    if (!existingDay) {
      await DayOfWeek.create({ day });
    }
  }

  console.log('Days of the week have been seeded');
};

module.exports = seedDaysOfWeek;
