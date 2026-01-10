// Simple test to verify model imports work
console.log('Testing model imports...');

try {
  const Brief = require('./models/Brief');
  console.log('✅ Brief model imported successfully');
  
  const UserState = require('./models/UserState');
  console.log('✅ UserState model imported successfully');
  
  console.log('🎉 All models imported successfully!');
} catch (error) {
  console.error('❌ Model import failed:', error.message);
  process.exit(1);
}