import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

console.log('🧪 Testing email verification endpoint...\n');

// Generate a test verification token (same as what's sent in email)
const testToken = jwt.sign(
  { email: 'jaredmoodley1212@gmail.com', type: 'email-verification' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('📧 Testing with email: jaredmoodley1212@gmail.com');
console.log('🔑 Generated token:', testToken.substring(0, 50) + '...\n');

(async () => {
  try {
    console.log('📤 Sending verification request to http://localhost:5000/api/auth/verify-email');
    
    const response = await fetch('http://localhost:5000/api/auth/verify-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ token: testToken }),
    });

    const data = await response.json();
    
    console.log('\n✅ Response Status:', response.status);
    console.log('📦 Response Data:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n🎉 VERIFICATION SUCCESSFUL!');
      console.log('✅ The verify endpoint is working correctly!');
      console.log('📧 Welcome email should have been sent');
    } else {
      console.log('\n❌ VERIFICATION FAILED:', data.error);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure the backend server is running on port 5000');
  }
})();
