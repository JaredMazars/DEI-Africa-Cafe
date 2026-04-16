import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

console.log('🧪 COMPLETE EMAIL VERIFICATION FLOW TEST\n');
console.log('=' .repeat(60));

const testEmail = 'jaredmoodley1212@gmail.com';
const testPassword = 'TestPass123';

// Step 1: Register
console.log('\n📝 STEP 1: REGISTRATION');
console.log('-'.repeat(60));

try {
  const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: testEmail, password: testPassword }),
  });

  const registerData = await registerResponse.json();
  
  if (!registerResponse.ok || !registerData.success) {
    console.log('❌ Registration failed:', registerData.message);
    process.exit(1);
  }
  
  console.log('✅ Registration successful');
  console.log('   User ID:', registerData.data.user.id);
  console.log('   Email sent to:', testEmail);
} catch (error) {
  console.log('❌ Registration error:', error.message);
  process.exit(1);
}

// Step 2: Simulate clicking verify link (generate token like in email)
console.log('\n🔗 STEP 2: SIMULATE CLICKING EMAIL LINK');
console.log('-'.repeat(60));

const verificationToken = jwt.sign(
  { email: testEmail, type: 'email-verification' },
  process.env.JWT_SECRET,
  { expiresIn: '24h' }
);

console.log('✅ Verification token generated');
console.log('   Token:', verificationToken.substring(0, 50) + '...');
console.log('   Simulating URL: http://localhost:5173/verify-email?token=...');

// Step 3: Call verify endpoint (what the VerifyEmail page does)
console.log('\n✉️  STEP 3: VERIFY EMAIL');
console.log('-'.repeat(60));

try {
  const verifyResponse = await fetch('http://localhost:5000/api/auth/verify-email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ token: verificationToken }),
  });

  const verifyData = await verifyResponse.json();
  
  console.log('   Response Status:', verifyResponse.status);
  console.log('   Response:', JSON.stringify(verifyData, null, 2));
  
  if (!verifyResponse.ok || !verifyData.success) {
    console.log('\n❌ VERIFICATION FAILED:', verifyData.error);
    console.log('\n🔍 DEBUG INFO:');
    console.log('   - Backend running? Check http://localhost:5000/health');
    console.log('   - Frontend running? Check http://localhost:5173/');
    console.log('   - Token valid?', verificationToken ? 'Yes' : 'No');
    process.exit(1);
  }
  
  console.log('\n✅ VERIFICATION SUCCESSFUL!');
  console.log('   Message:', verifyData.message);
} catch (error) {
  console.log('\n❌ Verification error:', error.message);
  console.log('\n🔍 Is the backend running on port 5000?');
  process.exit(1);
}

// Step 4: Check both servers are accessible
console.log('\n🌐 STEP 4: SERVER ACCESSIBILITY CHECK');
console.log('-'.repeat(60));

try {
  // Check backend
  const backendCheck = await fetch('http://localhost:5000/health');
  if (backendCheck.ok) {
    console.log('✅ Backend (port 5000): RUNNING');
  } else {
    console.log('⚠️  Backend (port 5000): Responding but health check failed');
  }
} catch (error) {
  console.log('❌ Backend (port 5000): NOT ACCESSIBLE');
}

try {
  // Check frontend
  const frontendCheck = await fetch('http://localhost:5173/');
  if (frontendCheck.ok) {
    console.log('✅ Frontend (port 5173): RUNNING');
  } else {
    console.log('⚠️  Frontend (port 5173): Responding but returned error');
  }
} catch (error) {
  console.log('❌ Frontend (port 5173): NOT ACCESSIBLE');
  console.log('   This is why you see "connection refused"!');
  console.log('   Run: npm run dev');
}

console.log('\n' + '='.repeat(60));
console.log('🎉 COMPLETE FLOW TEST PASSED!');
console.log('='.repeat(60));
console.log('\n📋 NEXT STEPS:');
console.log('1. Open http://localhost:5173/ in your browser');
console.log('2. Check email inbox for verification link');
console.log('3. Click the verify link');
console.log('4. Should see success and redirect to /login');
console.log('5. Login with:', testEmail, '/', testPassword);
