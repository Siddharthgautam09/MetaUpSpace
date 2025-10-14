const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask');

// Define schemas
const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', taskSchema);

async function assignTask() {
  try {
    console.log('Assigning task to team member...');
    
    // Get the task
    const task = await Task.findOne();
    console.log(`Found task: ${task.title}`);
    
    // Assign it to the first team member
    const teamMemberId = '68edeb3f786550f5df3a361c'; // First team member from the project
    
    await Task.findByIdAndUpdate(task._id, {
      assignedTo: teamMemberId
    });
    
    console.log(`Task "${task.title}" assigned to user: ${teamMemberId}`);
    
    // Verify the update
    const updatedTask = await Task.findById(task._id);
    console.log(`Verification - AssignedTo: ${updatedTask.assignedTo}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

assignTask();