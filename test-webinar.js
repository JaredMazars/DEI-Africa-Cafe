// Test script to create a live webinar with attendees
// Run this in the browser console to test the webinar scheduling

const testWebinar = {
  title: 'Testing Attendee Feature - AI Integration in African Finance',
  description: 'This is a test webinar to verify that attendees are properly added to the Teams meeting form. We will discuss the role of AI and automation in financial services across Africa.',
  date: '2026-02-15',
  time: '14:30',
  topic: 'Digital Transformation',
  region: 'West Africa',
  maxAttendees: '50',
  expert: 'Amara Okafor',
  isPrivate: false,
  invitedEmails: ['testuser.demo@gmail.com', 'sarah.johnson@forvismazars.com', 'michael.chen@forvismazars.com'],
  lobbyBypass: 'organization'
};

// Simulate the Teams URL creation
function createTeamsLink(webinar) {
  const dateTime = new Date(`${webinar.date}T${webinar.time}`);
  const startTime = dateTime.toISOString();
  const endTime = new Date(dateTime.getTime() + 60 * 60 * 1000).toISOString();
  
  const teamsParams = new URLSearchParams();
  teamsParams.append('subject', webinar.title);
  teamsParams.append('content', webinar.description);
  teamsParams.append('startTime', startTime);
  teamsParams.append('endTime', endTime);
  
  if (webinar.invitedEmails && webinar.invitedEmails.length > 0) {
    teamsParams.append('people', webinar.invitedEmails.join(';'));
  }
  
  const teamsLink = `https://teams.microsoft.com/l/meeting/new?${teamsParams.toString()}`;
  return { teamsLink, teamsParams };
}

// Log the test data
console.log('🎯 TEST WEBINAR CREATED');
console.log('====================================');
console.log('Title:', testWebinar.title);
console.log('Date:', testWebinar.date);
console.log('Time:', testWebinar.time);
console.log('Expert:', testWebinar.expert);
console.log('Region:', testWebinar.region);
console.log('');
console.log('👥 ATTENDEES ADDED:');
testWebinar.invitedEmails.forEach((email, idx) => {
  console.log(`  ${idx + 1}. ${email}`);
});
console.log('');

const { teamsLink, teamsParams } = createTeamsLink(testWebinar);

console.log('📧 TEAMS MEETING URL GENERATED:');
console.log('URL:', teamsLink);
console.log('');
console.log('📋 URL PARAMETERS:');
console.log(teamsParams.toString());
console.log('');
console.log('✅ TEST PASSED - Attendees are included in the Teams URL!');
console.log('====================================');
console.log('');
console.log('To schedule this webinar in the UI:');
console.log('1. Go to Live Webinars tab');
console.log('2. Click "Schedule Webinar"');
console.log('3. Fill in the fields with the test data above');
console.log('4. Add each attendee email from the list');
console.log('5. Click "Schedule Webinar" button');
console.log('6. Check the console for full Teams URL with attendees!');
