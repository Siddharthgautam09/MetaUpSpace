const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask');

// Define schemas
const taskSchema = new mongoose.Schema({}, { strict: false });
const Task = mongoose.model('Task', taskSchema);

const projectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.model('Project', projectSchema);

async function checkTaskProject() {
  try {
    console.log('Checking task-project relationship...');
    
    // Get the task
    const task = await Task.findOne();
    console.log('Task details:');
    console.log(`  Title: ${task.title}`);
    console.log(`  ProjectId: ${task.projectId}`);
    console.log(`  AssignedTo: ${task.assignedTo || 'None'}`);
    
    // Get the project
    const project = await Project.findById(task.projectId);
    if (project) {
      console.log('\nProject details:');
      console.log(`  Title: ${project.title}`);
      console.log(`  ManagerId: ${project.managerId}`);
      console.log(`  TeamMembers: ${JSON.stringify(project.teamMembers)}`);
      console.log(`  TeamMembers Count: ${project.teamMembers?.length || 0}`);
    } else {
      console.log('\nProject not found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkTaskProject();