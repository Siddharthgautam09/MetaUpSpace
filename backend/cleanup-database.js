const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask';

async function cleanupDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check all collections that might have role references
    const collections = ['users', 'projects', 'tasks'];
    
    for (const collectionName of collections) {
      console.log(`\n=== Checking ${collectionName} collection ===`);
      
      const collection = mongoose.connection.db.collection(collectionName);
      
      // Find any documents with 'manager' role
      const managerDocs = await collection.find({ role: 'manager' }).toArray();
      console.log(`Found ${managerDocs.length} documents with 'manager' role`);
      
      if (managerDocs.length > 0) {
        // Update all 'manager' roles to 'admin'
        const result = await collection.updateMany(
          { role: 'manager' },
          { $set: { role: 'admin' } }
        );
        console.log(`Updated ${result.modifiedCount} documents from 'manager' to 'admin'`);
      }
      
      // List all unique roles in this collection
      const distinctRoles = await collection.distinct('role');
      console.log(`Distinct roles in ${collectionName}:`, distinctRoles);
    }

    // Also check for any schema validation issues
    console.log('\n=== Checking for schema validation issues ===');
    
    // Try to find any documents that might cause validation errors
    const users = await mongoose.connection.db.collection('users').find({}).toArray();
    console.log(`Total users: ${users.length}`);
    
    for (const user of users) {
      if (!['admin', 'team_member'].includes(user.role)) {
        console.log(`⚠️ Invalid role found: ${user.email} has role '${user.role}'`);
      }
    }

    console.log('\n✅ Database cleanup completed!');

  } catch (error) {
    console.error('Error during cleanup:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

cleanupDatabase();