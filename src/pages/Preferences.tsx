import React, { useState, useEffect } from 'react';
import { Settings, Save, RefreshCw, Target, MapPin, Clock, Languages, Briefcase, User } from 'lucide-react';
import { authAPI } from '../services/api';

interface UserPreferences {
  mentorPreferences: {
    preferredExpertise: string[];
    preferredLocation: string[];
    preferredExperience: string[];
    preferredLanguages: string[];
    sessionFrequency: string;
    communicationStyle: string;
  };
  availability: {
    timeSlots: string[];
    timezone: string;
    maxSessionsPerWeek: number;
  };
  notifications: {
    emailNotifications: boolean;
    sessionReminders: boolean;
    newConnectionRequests: boolean;
    weeklyDigest: boolean;
  };
}

const expertiseOptions = [
  'Technology', 'Business', 'Finance', 'Marketing', 'Design', 'Engineering',
  'Healthcare', 'Education', 'Agriculture', 'Law', 'Arts & Culture', 'Media',
  'Consulting', 'Entrepreneurship', 'Project Management', 'Data Science'
];

const locationOptions = [
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Egypt', 'Morocco',
  'Ethiopia', 'Uganda', 'Tanzania', 'Algeria', 'Rwanda', 'Botswana',
  'Zambia', 'Zimbabwe', 'Senegal', 'Côte d\'Ivoire', 'Other African Country', 'Diaspora'
];

const experienceOptions = [
  'Junior (1-3 years)', 'Mid-level (3-7 years)', 'Senior (7+ years)', 'Executive/Leadership'
];

const languageOptions = [
  'English', 'French', 'Arabic', 'Swahili', 'Portuguese', 'Hausa',
  'Yoruba', 'Igbo', 'Zulu', 'Amharic', 'Wolof', 'Afrikaans', 'Other'
];

const Preferences: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  
  // Hardcoded user data
  const user = {
    profile: {
      interests: ['Technology', 'Business'],
      location: 'South Africa',
      languages: ['English']
    }
  };
  
  const [preferences, setPreferences] = useState<UserPreferences>({
    mentorPreferences: {
      preferredExpertise: user.profile.interests || [],
      preferredLocation: user.profile.location ? [user.profile.location] : [],
      preferredExperience: [],
      preferredLanguages: user.profile.languages || ['English'],
      sessionFrequency: '1-2 sessions/week',
      communicationStyle: 'structured'
    },
    availability: {
      timeSlots: ['morning', 'afternoon'],
      timezone: 'GMT+1',
      maxSessionsPerWeek: 2
    },
    notifications: {
      emailNotifications: true,
      sessionReminders: true,
      newConnectionRequests: true,
      weeklyDigest: true
    }
  });

  const [activeTab, setActiveTab] = useState('mentor-preferences');

  useEffect(() => {
    // Load user preferences from backend if available
    const loadPreferences = async () => {
      try {
        setLoading(true);
        // In a real implementation, you would fetch preferences from backend
        // const response = await preferencesAPI.getUserPreferences();
        // setPreferences(response.data.preferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPreferences();
  }, []);

  const handleArrayToggle = (
    section: keyof UserPreferences,
    field: string,
    value: string
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: prev[section][field].includes(value)
          ? prev[section][field].filter(item => item !== value)
          : [...prev[section][field], value]
      }
    }));
  };

  const handleFieldChange = (
    section: keyof UserPreferences,
    field: string,
    value: string | number | boolean
  ) => {
    setPreferences(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleSave = async () => {
    setSaving(true);
    setMessage('');
    
    try {
      // Save preferences to backend
      // await preferencesAPI.updateUserPreferences(preferences);
      
      // For now, we'll update the user profile with the mentor preferences
      if (user?.profile) {
        const updatedProfile = {
          ...user.profile,
          interests: preferences.mentorPreferences.preferredExpertise,
          languages: preferences.mentorPreferences.preferredLanguages,
          availability: `${preferences.availability.maxSessionsPerWeek} sessions/week`
        };
        
        await authAPI.completeProfile(updatedProfile);
      }
      
      setMessage('Preferences saved successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error saving preferences:', error);
      setMessage('Failed to save preferences. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const renderMentorPreferences = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Mentor Preferences</h2>
        <p className="text-lg text-gray-600">Customize your mentor discovery experience</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Expertise Areas
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {expertiseOptions.map((expertise) => (
              <button
                key={expertise}
                onClick={() => handleArrayToggle('mentorPreferences', 'preferredExpertise', expertise)}
                className={`p-4 -xl border-2 transition-all duration-200 text-sm font-medium ${
                  preferences.mentorPreferences.preferredExpertise.includes(expertise)
                    ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                    : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                }`}
              >
                {expertise}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Mentor Location
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {locationOptions.map((location) => (
              <button
                key={location}
                onClick={() => handleArrayToggle('mentorPreferences', 'preferredLocation', location)}
                className={`p-3 -xl border-2 transition-all duration-200 text-sm font-medium ${
                  preferences.mentorPreferences.preferredLocation.includes(location)
                    ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                    : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                }`}
              >
                {location}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Experience Level
          </label>
          <div className="grid grid-cols-2 gap-3">
            {experienceOptions.map((experience) => (
              <button
                key={experience}
                onClick={() => handleArrayToggle('mentorPreferences', 'preferredExperience', experience)}
                className={`p-4 -xl border-2 transition-all duration-200 text-sm font-medium ${
                  preferences.mentorPreferences.preferredExperience.includes(experience)
                    ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                    : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                }`}
              >
                {experience}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Languages
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {languageOptions.map((language) => (
              <button
                key={language}
                onClick={() => handleArrayToggle('mentorPreferences', 'preferredLanguages', language)}
                className={`p-3 -xl border-2 transition-all duration-200 text-sm font-medium ${
                  preferences.mentorPreferences.preferredLanguages.includes(language)
                    ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                    : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                }`}
              >
                {language}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Session Frequency
            </label>
            <select
              value={preferences.mentorPreferences.sessionFrequency}
              onChange={(e) => handleFieldChange('mentorPreferences', 'sessionFrequency', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
            >
              <option value="1 session/week">1 session per week</option>
              <option value="1-2 sessions/week">1-2 sessions per week</option>
              <option value="2-3 sessions/week">2-3 sessions per week</option>
              <option value="flexible">Flexible schedule</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Communication Style
            </label>
            <select
              value={preferences.mentorPreferences.communicationStyle}
              onChange={(e) => handleFieldChange('mentorPreferences', 'communicationStyle', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
            >
              <option value="structured">Structured sessions</option>
              <option value="casual">Casual conversations</option>
              <option value="goal-oriented">Goal-oriented</option>
              <option value="mixed">Mixed approach</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderAvailability = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
          <Clock className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Availability Settings</h2>
        <p className="text-lg text-gray-600">Set your preferred meeting times</p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            Preferred Time Slots
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['early-morning', 'morning', 'afternoon', 'evening'].map((slot) => (
              <button
                key={slot}
                onClick={() => handleArrayToggle('availability', 'timeSlots', slot)}
                className={`p-4 -xl border-2 transition-all duration-200 text-sm font-medium ${
                  preferences.availability.timeSlots.includes(slot)
                    ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                    : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                }`}
              >
                {slot.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Timezone
            </label>
            <select
              value={preferences.availability.timezone}
              onChange={(e) => handleFieldChange('availability', 'timezone', e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
            >
              <option value="GMT+0">GMT+0 (West Africa)</option>
              <option value="GMT+1">GMT+1 (Central Africa)</option>
              <option value="GMT+2">GMT+2 (South Africa)</option>
              <option value="GMT+3">GMT+3 (East Africa)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Max Sessions Per Week
            </label>
            <select
              value={preferences.availability.maxSessionsPerWeek}
              onChange={(e) => handleFieldChange('availability', 'maxSessionsPerWeek', parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
            >
              <option value={1}>1 session</option>
              <option value={2}>2 sessions</option>
              <option value={3}>3 sessions</option>
              <option value={4}>4 sessions</option>
              <option value={5}>5+ sessions</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderNotifications = () => (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
          <Settings className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900">Notification Settings</h2>
        <p className="text-lg text-gray-600">Choose how you want to stay updated</p>
      </div>

      <div className="space-y-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-50 -xl">
            <div>
              <h4 className="font-medium text-gray-900">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive updates via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.emailNotifications}
                onChange={(e) => handleFieldChange('notifications', 'emailNotifications', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 -full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0072CE]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 -xl">
            <div>
              <h4 className="font-medium text-gray-900">Session Reminders</h4>
              <p className="text-sm text-gray-600">Get reminded before sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.sessionReminders}
                onChange={(e) => handleFieldChange('notifications', 'sessionReminders', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 -full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0072CE]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 -xl">
            <div>
              <h4 className="font-medium text-gray-900">New Connection Requests</h4>
              <p className="text-sm text-gray-600">Notify when someone wants to connect</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.newConnectionRequests}
                onChange={(e) => handleFieldChange('notifications', 'newConnectionRequests', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 -full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0072CE]"></div>
            </label>
          </div>

          <div className="flex items-center justify-between p-4 bg-gray-50 -xl">
            <div>
              <h4 className="font-medium text-gray-900">Weekly Digest</h4>
              <p className="text-sm text-gray-600">Weekly summary of platform activity</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={preferences.notifications.weeklyDigest}
                onChange={(e) => handleFieldChange('notifications', 'weeklyDigest', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 -full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0072CE]"></div>
            </label>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Preferences</h1>
          <p className="text-xl text-gray-600">Customize your mentorship experience</p>
        </div>

        {/* Success/Error Message */}
        {message && (
          <div className={`mb-6 p-4 -xl ${
            message.includes('success') 
              ? 'bg-green-50 border border-green-200 text-green-700' 
              : 'bg-red-50 border border-red-200 text-red-700'
          }`}>
            {message}
          </div>
        )}

        {/* Tab Navigation */}
        <div className="bg-white -2xl shadow-2xl border border-[#E5E7EB] overflow-hidden">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-8">
              {[
                { id: 'mentor-preferences', label: 'Mentor Preferences', icon: Target },
                { id: 'availability', label: 'Availability', icon: Clock },
                { id: 'notifications', label: 'Notifications', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-[#0072CE] text-[#0072CE]'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Tab Content */}
          <div className="p-8">
            {loading && (
              <div className="text-center py-8">
                <div className="w-8 h-8 border-2 border-[#0072CE] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600">Loading preferences...</p>
              </div>
            )}

            {!loading && (
              <>
                {activeTab === 'mentor-preferences' && renderMentorPreferences()}
                {activeTab === 'availability' && renderAvailability()}
                {activeTab === 'notifications' && renderNotifications()}
              </>
            )}
          </div>

          {/* Save Button */}
          <div className="px-8 pb-8">
            <div className="flex justify-end space-x-4">
              <button
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 transition-colors"
              >
                <RefreshCw className="w-5 h-5" />
                <span>Reset</span>
              </button>
              <button
                onClick={handleSave}
                disabled={saving}
                className="flex items-center space-x-2 px-8 py-3 bg-[#1A1F5E] text-white font-semibold -xl shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                {saving ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    <span>Save Preferences</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Preferences;