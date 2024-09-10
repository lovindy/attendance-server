// Import Model
const { Status } = require('../models');

// Function to seed status values
const seedStatus = async () => {
  const statuses = ['late', 'present', 'absent', 'permission'];

  for (const status of statuses) {
    // Check if the status already exists
    const existingStatus = await Status.findOne({ where: { status } });

    // Create the status if it doesn't exist
    if (!existingStatus) {
      await Status.create({ status });
    }
  }

  console.log('Statuses have been seeded');
};

module.exports = seedStatus;
