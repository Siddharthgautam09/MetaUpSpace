const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask');

// Define schemas
const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', taskSchema);

const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

const projectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.model('Project', projectSchema);

async function checkTaskPermissions() {
  try {
    console.log('Checking task update permissions...');
    
    // Get the task
    const task = await Task.findOne();
    console.log('\nTask details:');
    console.log(`  ID: ${task._id}`);
    console.log(`  Title: ${task.title}`);
    console.log(`  Status: ${task.status}`);
    console.log(`  AssignedTo: ${task.assignedTo}`);
    console.log(`  CreatedBy: ${task.createdBy}`);
    console.log(`  ProjectId: ${task.projectId}`);
    
    // Get the project
    const project = await Project.findById(task.projectId);
    console.log('\nProject details:');
    console.log(`  Title: ${project.title}`);
    console.log(`  ManagerId: ${project.managerId}`);
    console.log(`  TeamMembers: ${JSON.stringify(project.teamMembers)}`);
    
    // Get all users
    const users = await User.find({}, 'firstName lastName email role _id');
    console.log('\nUsers:');
    users.forEach(user => {
      const canUpdateTask = 
        user.role === 'admin' ||
        project.managerId.toString() === user._id.toString() ||
        task.assignedTo?.toString() === user._id.toString() ||
        task.createdBy.toString() === user._id.toString();
      
      console.log(`  ${user.firstName} ${user.lastName} (${user.role}): ${canUpdateTask ? 'CAN' : 'CANNOT'} update task`);
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkTaskPermissions();