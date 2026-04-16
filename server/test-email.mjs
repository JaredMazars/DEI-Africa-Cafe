console.log('🧪 Testing email registration...');

const timestamp = Date.now();
const testEmail = `jaredmoodley1212+${timestamp}@gmail.com`;

(async () => {
  try {
    console.log('📧 Sending registration request to http://localhost:5000/api/auth/register');
    console.log('Email:', testEmail);
    console.log('');
    
    const response = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: testEmail,
        password: 'TestPass123'
      }),
    });

    const data = await response.json();
    
    console.log('✅ Response received:');
    console.log(JSON.stringify(data, null, 2));
    
    if (data.success) {
      console.log('\n🎉 SUCCESS! Check the server logs above to confirm email was sent!');
      console.log('📬 Check your inbox at jaredmoodley1212@gmail.com');
      console.log('\n📋 To test verification:');
      console.log('1. Open your email inbox');
      console.log('2. Click the verification link');
      console.log('3. Should see success page and redirect to /login');
      console.log('4. Login with the test credentials');
    } else {
      console.log('\n❌ Registration failed:', data.message);
    }
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.log('\n⚠️  Make sure the server is running on port 5000');
  }
})();
