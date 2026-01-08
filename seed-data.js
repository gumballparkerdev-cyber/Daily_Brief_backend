// Simple data seeder for testing
const mongoose = require('mongoose');
const Brief = require('./models/Brief');

const sampleBriefs = [
  { text: "Take a 10-minute walk outside", difficulty: "easy" },
  { text: "Write down 3 things you're grateful for", difficulty: "easy" },
  { text: "Do 20 push-ups", difficulty: "normal" },
  { text: "Read for 30 minutes", difficulty: "normal" },
  { text: "Meditate for 15 minutes", difficulty: "normal" },
  { text: "Run for 30 minutes", difficulty: "hard" },
  { text: "Write a 500-word journal entry", difficulty: "hard" },
];

async function seedData() {
  try {
    // Check if we already have data
    const existingBriefs = await Brief.countDocuments();
    
    if (existingBriefs === 0) {
      await Brief.insertMany(sampleBriefs);
      console.log(`✅ Seeded ${sampleBriefs.length} sample briefs`);
    } else {
      console.log(`ℹ️ Database already has ${existingBriefs} briefs`);
    }
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  }
}

module.exports = seedData;