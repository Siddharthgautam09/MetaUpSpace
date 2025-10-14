const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask';

// User schema
const UserSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  role: { type: String, enum: ['admin', 'team_member'], default: 'team_member' },
  isActive: { type: Boolean, default: true },
  department: String,
  phoneNumber: String
}, { timestamps: true });

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

async function createUsers() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 12);
    const adminUser = new User({
      email: 'admin@company.com',
      password: adminPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'admin',
      department: 'IT',
      isActive: true
    });

    // Create manager user
    const managerPassword = await bcrypt.hash('manager123', 12);
    const managerUser = new User({
      email: 'manager@company.com',
      password: managerPassword,
      firstName: 'Manager',
      lastName: 'User',
      role: 'manager',
      department: 'Operations',
      isActive: true
    });

    // Create team member user
    const memberPassword = await bcrypt.hash('member123', 12);
    const memberUser = new User({
      email: 'member@company.com',
      password: memberPassword,
      firstName: 'Team',
      lastName: 'Member',
      role: 'team_member',
      department: 'Development',
      isActive: true
    });

    // Save users
    await adminUser.save();
    await managerUser.save();
    await memberUser.save();

    console.log('\n✅ Users created successfully!');
    console.log('\n🔐 Login Credentials:');
    console.log('─'.repeat(40));
    console.log('Admin User:');
    console.log('  Email: admin@company.com');
    console.log('  Password: admin123');
    console.log('─'.repeat(40));
    console.log('Manager User:');
    console.log('  Email: manager@company.com');
    console.log('  Password: manager123');
    console.log('─'.repeat(40));
    console.log('Team Member User:');
    console.log('  Email: member@company.com');
    console.log('  Password: member123');
    console.log('─'.repeat(40));

  } catch (error) {
    if (error.code === 11000) {
      console.log('Users already exist. Here are the credentials to try:');
      console.log('─'.repeat(40));
      console.log('Try these login credentials:');
      console.log('  admin@company.com / admin123');
      console.log('  manager@company.com / manager123');
      console.log('  member@company.com / member123');
      console.log('  test@example.com / password123');
      console.log('─'.repeat(40));
    } else {
      console.error('Error creating users:', error.message);
    }
  } finally {
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  }
}

createUsers();