import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Briefcase, Target, User, Clock, ArrowLeft, ArrowRight, Building2, Loader } from 'lucide-react';
import axios from 'axios';

interface OnboardingData {
  role: 'mentor' | 'mentee' | '';
  name: string;
  location: string;
  expertise: string[];
  interests: string[];
  experience: string;
  goals: string[];
  availability: string;
  languages: string[];
}

const expertiseOptions = [
  'Technology', 'Business', 'Finance', 'Marketing', 'Design', 'Engineering',
  'Healthcare', 'Education', 'Agriculture', 'Law', 'Arts & Culture', 'Media'
];

const locationOptions = [
  'Nigeria', 'South Africa', 'Kenya', 'Ghana', 'Egypt', 'Morocco',
  'Ethiopia', 'Uganda', 'Tanzania', 'Algeria', 'Other African Country', 'Diaspora'
];

const languageOptions = [
  'English', 'French', 'Arabic', 'Swahili', 'Portuguese', 'Hausa',
  'Yoruba', 'Igbo', 'Zulu', 'Amharic', 'Wolof', 'Other'
];

export default function SimpleOnboardingForm() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [data, setData] = useState<OnboardingData>({
    role: '',
    name: '',
    location: '',
    expertise: [],
    interests: [],
    experience: '',
    goals: [],
    availability: '',
    languages: [],
  });

  const totalSteps = 6;

  const handleNext = () => {
    if (currentStep < totalSteps) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleArrayToggle = (field: keyof Pick<OnboardingData, 'expertise' | 'interests' | 'goals' | 'languages'>, value: string) => {
    const currentArray = data[field] as string[];
    if (currentArray.includes(value)) {
      setData({ ...data, [field]: currentArray.filter(item => item !== value) });
    } else {
      setData({ ...data, [field]: [...currentArray, value] });
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Get registration data from session storage
      const email = sessionStorage.getItem('registrationEmail');
      const password = sessionStorage.getItem('registrationPassword');
      
      if (!email || !password) {
        setError('Registration data not found. Please start registration again.');
        setLoading(false);
        return;
      }

      // Send registration request to backend
      const response = await axios.post('http://localhost:5000/api/auth/register', {
        email,
        password,
        profile: {
          name: data.name,
          role: data.role,
          location: data.location,
          expertise: data.expertise,
          interests: data.interests,
          experience: data.experience,
          goals: data.goals,
          availability: data.availability,
          languages: data.languages,
        }
      });

      if (response.data.success) {
        // Clear session storage
        sessionStorage.removeItem('registrationEmail');
        sessionStorage.removeItem('registrationPassword');
        
        // Store user data temporarily (not verified yet)
        localStorage.setItem('pendingVerification', JSON.stringify({
          email,
          password,
          profile: data
        }));
        
        // Navigate to verification pending page
        navigate('/verification-pending');
      } else {
        setError(response.data.message || 'Registration failed');
      }
    } catch (err: any) {
      console.error('Registration error:', err);
      setError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.role !== '';
      case 2: return data.name.trim() !== '' && data.location !== '';
      case 3: return data.expertise.length > 0;
      case 4: return data.interests.length > 0;
      case 5: return data.experience !== '';
      case 6: return data.goals.length > 0 && data.availability !== '' && data.languages.length > 0;
      default: return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-blue-50 to-blue-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-2xl shadow-2xl p-8 border border-blue-100">
          {/* Header */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Complete Your Profile</h1>
            <p className="text-gray-600">Help us personalize your experience</p>
            <div className="mt-4">
              <div className="flex items-center justify-center space-x-2">
                {[...Array(totalSteps)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-2 rounded-full transition-all ${
                      i + 1 <= currentStep ? 'w-12 bg-blue-600' : 'w-8 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-gray-500 mt-2">Step {currentStep} of {totalSteps}</p>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Step Content */}
          <div className="mb-8">
            {/* Step 1: Role Selection */}
            {currentStep === 1 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Users className="w-6 h-6 mr-2 text-blue-600" />
                  Choose Your Role
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={() => setData({ ...data, role: 'mentee' })}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      data.role === 'mentee'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <User className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="text-xl font-semibold mb-2">Mentee</h3>
                    <p className="text-gray-600 text-sm">
                      I'm seeking guidance and mentorship to grow professionally
                    </p>
                  </button>
                  <button
                    onClick={() => setData({ ...data, role: 'mentor' })}
                    className={`p-6 rounded-xl border-2 transition-all ${
                      data.role === 'mentor'
                        ? 'border-blue-600 bg-blue-50'
                        : 'border-gray-200 hover:border-blue-300'
                    }`}
                  >
                    <Briefcase className="w-12 h-12 mx-auto mb-3 text-blue-600" />
                    <h3 className="text-xl font-semibold mb-2">Mentor</h3>
                    <p className="text-gray-600 text-sm">
                      I want to share my experience and guide others
                    </p>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Basic Information */}
            {currentStep === 2 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <User className="w-6 h-6 mr-2 text-blue-600" />
                  Basic Information
                </h2>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Full Name
                  </label>
                  <input
                    type="text"
                    value={data.name}
                    onChange={(e) => setData({ ...data, name: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="Enter your full name"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Location
                  </label>
                  <select
                    value={data.location}
                    onChange={(e) => setData({ ...data, location: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your location</option>
                    {locationOptions.map((location) => (
                      <option key={location} value={location}>
                        {location}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            )}

            {/* Step 3: Expertise */}
            {currentStep === 3 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Briefcase className="w-6 h-6 mr-2 text-blue-600" />
                  {data.role === 'mentor' ? 'Your Expertise' : 'Areas of Interest'}
                </h2>
                <p className="text-gray-600">Select all that apply</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {expertiseOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleArrayToggle('expertise', option)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        data.expertise.includes(option)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 4: Interests */}
            {currentStep === 4 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Target className="w-6 h-6 mr-2 text-blue-600" />
                  Additional Interests
                </h2>
                <p className="text-gray-600">What else are you interested in?</p>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                  {expertiseOptions.map((option) => (
                    <button
                      key={option}
                      onClick={() => handleArrayToggle('interests', option)}
                      className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                        data.interests.includes(option)
                          ? 'border-blue-600 bg-blue-50 text-blue-700'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      {option}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 5: Experience */}
            {currentStep === 5 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Building2 className="w-6 h-6 mr-2 text-blue-600" />
                  Experience Level
                </h2>
                <div className="space-y-3">
                  {['Junior (0-2 years)', 'Mid-level (3-5 years)', 'Senior (6-10 years)', 'Expert (10+ years)'].map((level) => (
                    <button
                      key={level}
                      onClick={() => setData({ ...data, experience: level })}
                      className={`w-full px-6 py-4 rounded-lg border-2 transition-all text-left ${
                        data.experience === level
                          ? 'border-blue-600 bg-blue-50'
                          : 'border-gray-200 hover:border-blue-300'
                      }`}
                    >
                      <span className="font-medium">{level}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 6: Goals, Availability & Languages */}
            {currentStep === 6 && (
              <div className="space-y-6">
                <h2 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Clock className="w-6 h-6 mr-2 text-blue-600" />
                  Final Details
                </h2>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Your Goals (Select all that apply)
                  </label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {['Career Growth', 'Skill Development', 'Networking', 'Leadership', 'Knowledge Sharing', 'Industry Insights'].map((goal) => (
                      <button
                        key={goal}
                        onClick={() => handleArrayToggle('goals', goal)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          data.goals.includes(goal)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {goal}
                      </button>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Availability
                  </label>
                  <select
                    value={data.availability}
                    onChange={(e) => setData({ ...data, availability: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">Select your availability</option>
                    <option value="1-2 hours/week">1-2 hours/week</option>
                    <option value="3-5 hours/week">3-5 hours/week</option>
                    <option value="5-10 hours/week">5-10 hours/week</option>
                    <option value="10+ hours/week">10+ hours/week</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Languages (Select all that apply)
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {languageOptions.map((language) => (
                      <button
                        key={language}
                        onClick={() => handleArrayToggle('languages', language)}
                        className={`px-4 py-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          data.languages.includes(language)
                            ? 'border-blue-600 bg-blue-50 text-blue-700'
                            : 'border-gray-200 hover:border-blue-300'
                        }`}
                      >
                        {language}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center pt-6 border-t">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center px-6 py-3 text-gray-600 hover:text-gray-900 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Previous
            </button>
            
            {currentStep < totalSteps ? (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
                <ArrowRight className="w-5 h-5 ml-2" />
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={!canProceed() || loading}
                className="flex items-center px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-600 text-white rounded-lg hover:from-blue-700 hover:to-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                {loading ? (
                  <>
                    <Loader className="w-5 h-5 animate-spin mr-2" />
                    Completing...
                  </>
                ) : (
                  'Complete Registration'
                )}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
