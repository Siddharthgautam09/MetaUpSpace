const mongoose = require('mongoose');
require('dotenv').config();

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask';

async function migrateManagerToAdmin() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Update all users with 'manager' role to 'admin'
    const result = await mongoose.connection.db.collection('users').updateMany(
      { role: 'manager' },
      { $set: { role: 'admin' } }
    );

    console.log(`✅ Migration completed! Updated ${result.modifiedCount} users from 'manager' to 'admin' role.`);

    // Check if there are any remaining users with manager role
    const remainingManagers = await mongoose.connection.db.collection('users').find({ role: 'manager' }).toArray();
    
    if (remainingManagers.length === 0) {
      console.log('✅ No remaining users with manager role found.');
    } else {
      console.log(`⚠️ Warning: ${remainingManagers.length} users still have manager role.`);
    }

    // List all users and their roles
    const allUsers = await mongoose.connection.db.collection('users').find({}, { projection: { email: 1, role: 1, firstName: 1, lastName: 1 } }).toArray();
    console.log('\n📋 Current users and roles:');
    console.log('─'.repeat(60));
    allUsers.forEach(user => {
      console.log(`${user.firstName} ${user.lastName} (${user.email}) - Role: ${user.role}`);
    });
    console.log('─'.repeat(60));

  } catch (error) {
    console.error('Error during migration:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

migrateManagerToAdmin();