const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect('mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask');

// Define Project schema (simplified)
const projectSchema = new mongoose.Schema({}, { strict: false });
const Project = mongoose.model('Project', projectSchema);

// Define User schema (simplified)
const userSchema = new mongoose.Schema({}, { strict: false });
const User = mongoose.model('User', userSchema);

async function checkDatabase() {
  try {
    console.log('Checking database connection...');
    
    // Check projects
    const projectCount = await Project.countDocuments();
    console.log(`Total projects in database: ${projectCount}`);
    
    if (projectCount > 0) {
      const projects = await Project.find().limit(5);
      console.log('Sample projects:');
      projects.forEach((project, index) => {
        console.log(`${index + 1}. Title: ${project.title || 'N/A'}, Status: ${project.status || 'N/A'}, Created: ${project.createdAt || 'N/A'}`);
      });
    }
    
    // Check users
    const userCount = await User.countDocuments();
    console.log(`\nTotal users in database: ${userCount}`);
    
    if (userCount > 0) {
      const users = await User.find().limit(5);
      console.log('Sample users:');
      users.forEach((user, index) => {
        console.log(`${index + 1}. Name: ${user.firstName || 'N/A'} ${user.lastName || 'N/A'}, Email: ${user.email || 'N/A'}, Role: ${user.role || 'N/A'}`);
      });
    }
    
  } catch (error) {
    console.error('Error checking database:', error);
  } finally {
    mongoose.connection.close();
  }
}

checkDatabase();