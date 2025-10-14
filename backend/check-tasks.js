const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask');

// Define Task schema (simplified)
const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', taskSchema);

// Define User schema (simplified)
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkTasks() {
  try {
    console.log('Checking tasks in database...');
    
    // Check tasks
    const taskCount = await Task.countDocuments();
    console.log(`Total tasks in database: ${taskCount}`);
    
    if (taskCount > 0) {
      const tasks = await Task.find().limit(5);
      console.log('Sample tasks:');
      tasks.forEach((task, index) => {
        console.log(`${index + 1}. Title: ${task.title || 'N/A'}`);
        console.log(`   Status: ${task.status || 'N/A'}`);
        console.log(`   AssignedTo: ${task.assignedTo || 'N/A'}`);
        console.log(`   ProjectId: ${task.projectId || 'N/A'}`);
        console.log(`   CreatedBy: ${task.createdBy || 'N/A'}`);
        console.log(`   Created: ${task.createdAt || 'N/A'}`);
        console.log('---');
      });
    }
    
    // Check users
    const userCount = await User.countDocuments();
    console.log(`\nTotal users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().limit(5);
      console.log('Sample users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}`);
        console.log(`   Email: ${user.email || 'N/A'}`);
        console.log(`   Role: ${user.role || 'N/A'}`);
        console.log(`   ID: ${user._id}`);
        console.log('---');
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkTasks();