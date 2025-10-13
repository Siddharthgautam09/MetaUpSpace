const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// MongoDB connection
const MONGODB_URI = 'mongodb+srv://siddharth123:test123@metaupspacetask.rrub2ox.mongodb.net/?retryWrites=true&w=majority&appName=MetaUpSpaceTask';

// User schema (simplified)
const UserSchema = new mongoose.Schema({
  email: String,
  password: String,
  firstName: String,
  lastName: String,
  role: String,
  isActive: { type: Boolean, default: true }
});

UserSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);

async function debugLogin() {
  try {
    // Connect to database
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');

    // Check if there are any users
    const userCount = await User.countDocuments();
    console.log(`Total users in database: ${userCount}`);

    // List all users (without passwords)
    const users = await User.find({}, { password: 0 });
    console.log('Users:', JSON.stringify(users, null, 2));

    // Try to create a test user if none exist
    if (userCount === 0) {
      console.log('No users found. Creating a test user...');
      
      const hashedPassword = await bcrypt.hash('password123', 12);
      const testUser = new User({
        email: 'test@example.com',
        password: hashedPassword,
        firstName: 'Test',
        lastName: 'User',
        role: 'team_member',
        isActive: true
      });

      await testUser.save();
      console.log('Test user created successfully');
      console.log('Email: test@example.com');
      console.log('Password: password123');
    } else {
      // Test login with the first user
      const firstUser = await User.findOne().select('+password');
      if (firstUser) {
        console.log(`\nTesting login for user: ${firstUser.email}`);
        
        // Test with common passwords
        const testPasswords = ['password123', 'admin123', 'test123', '12345678'];
        
        for (const testPassword of testPasswords) {
          const isValid = await firstUser.comparePassword(testPassword);
          console.log(`Password "${testPassword}": ${isValid ? 'VALID' : 'INVALID'}`);
        }
      }
    }

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

debugLogin();