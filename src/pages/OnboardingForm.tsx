import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Users, Briefcase, Target, User, Clock, ArrowLeft, ArrowRight, Building2 } from 'lucide-react';
import { authAPI } from '../services/api';

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

export default function OnboardingForm() {
  const { updateProfile } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
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

  const handleSubmit = () => {
    const submitProfile = async () => {
      try {
        const profile = {
          role: data.role as 'mentor' | 'mentee',
          name: data.name,
          location: data.location,
          expertise: data.expertise,
          interests: data.interests,
          experience: data.experience,
          goals: data.goals,
          availability: data.availability,
          languages: data.languages,
        };
        
        await updateProfile(profile);
      } catch (error) {
        console.error('Error completing profile:', error);
        alert('Failed to complete profile. Please try again.');
      }
    };
    
    submitProfile();
  };

  const canProceed = () => {
    switch (currentStep) {
      case 1: return data.role !== '';
      case 2: return data.name.trim() !== '' && data.location !== '';
      case 3: return data.expertise.length > 0;
      case 4: return data.interests.length > 0;
      case 5: return data.experience !== '' && data.goals.length > 0;
      case 6: return data.availability !== '' && data.languages.length > 0;
      default: return false;
    }
  };

  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
                <Building2 className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Welcome to DEI Cafe!</h2>
              <p className="text-lg text-gray-600">Let's start by understanding how you'd like to participate</p>
            </div>

            <div className="grid gap-6">
              <button
                onClick={() => setData({ ...data, role: 'mentor' })}
                className={`p-6 -2xl border-2 transition-all duration-200 text-left ${
                  data.role === 'mentor' 
                    ? 'border-[#0072CE] bg-[#F4F4F4] shadow-lg scale-[1.02]' 
                    : 'border-gray-200 hover:border-[#0072CE]/40 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 -xl flex items-center justify-center ${
                    data.role === 'mentor' ? 'bg-[#0072CE]' : 'bg-gray-100'
                  }`}>
                    <Briefcase className={`w-6 h-6 ${data.role === 'mentor' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">I want to be a Mentor</h3>
                    <p className="text-gray-600">Share your expertise and guide others on their journey</p>
                  </div>
                </div>
              </button>

              <button
                onClick={() => setData({ ...data, role: 'mentee' })}
                className={`p-6 -2xl border-2 transition-all duration-200 text-left ${
                  data.role === 'mentee' 
                    ? 'border-[#0072CE] bg-[#F4F4F4] shadow-lg scale-[1.02]' 
                    : 'border-gray-200 hover:border-[#0072CE]/40 hover:shadow-md'
                }`}
              >
                <div className="flex items-center space-x-4">
                  <div className={`w-12 h-12 -xl flex items-center justify-center ${
                    data.role === 'mentee' ? 'bg-[#0072CE]' : 'bg-gray-100'
                  }`}>
                    <Target className={`w-6 h-6 ${data.role === 'mentee' ? 'text-white' : 'text-gray-600'}`} />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900">I want to be a Mentee</h3>
                    <p className="text-gray-600">Learn from experienced professionals and grow your skills</p>
                  </div>
                </div>
              </button>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
                <User className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Tell us about yourself</h2>
              <p className="text-lg text-gray-600">Help us personalize your experience</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Your Name</label>
                <input
                  type="text"
                  value={data.name}
                  onChange={(e) => setData({ ...data, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Location</label>
                <select
                  value={data.location}
                  onChange={(e) => setData({ ...data, location: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                >
                  <option value="">Select your location</option>
                  {locationOptions.map((location) => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
                <Briefcase className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Your Expertise</h2>
              <p className="text-lg text-gray-600">
                {data.role === 'mentor' 
                  ? 'What areas can you mentor others in?' 
                  : 'What fields are you interested in learning about?'
                }
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {expertiseOptions.map((expertise) => (
                <button
                  key={expertise}
                  onClick={() => handleArrayToggle('expertise', expertise)}
                  className={`p-4 -xl border-2 transition-all duration-200 text-sm font-medium ${
                    data.expertise.includes(expertise)
                      ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E] scale-95'
                      : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                  }`}
                >
                  {expertise}
                </button>
              ))}
            </div>
          </div>
        );

      case 4:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Your Interests</h2>
              <p className="text-lg text-gray-600">What topics excite you the most?</p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {expertiseOptions.map((interest) => (
                <button
                  key={interest}
                  onClick={() => handleArrayToggle('interests', interest)}
                  className={`p-4 -xl border-2 transition-all duration-200 text-sm font-medium ${
                    data.interests.includes(interest)
                      ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E] scale-95'
                      : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                  }`}
                >
                  {interest}
                </button>
              ))}
            </div>
          </div>
        );

      case 5:
        const goalOptions = data.role === 'mentor' 
          ? ['Share knowledge', 'Build network', 'Give back to community', 'Develop leadership skills', 'Learn from mentees']
          : ['Advance career', 'Learn new skills', 'Build network', 'Get guidance', 'Improve confidence'];

        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
                <Target className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Experience & Goals</h2>
              <p className="text-lg text-gray-600">Help us match you with the right people</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  {data.role === 'mentor' ? 'Your Experience Level' : 'Current Stage'}
                </label>
                <select
                  value={data.experience}
                  onChange={(e) => setData({ ...data, experience: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                >
                  <option value="">Select your level</option>
                  {data.role === 'mentor' ? (
                    <>
                      <option value="junior">Junior (1-3 years)</option>
                      <option value="mid">Mid-level (3-7 years)</option>
                      <option value="senior">Senior (7+ years)</option>
                      <option value="executive">Executive/Leadership</option>
                    </>
                  ) : (
                    <>
                      <option value="student">Student</option>
                      <option value="graduate">Recent Graduate</option>
                      <option value="earlycareer">Early Career</option>
                      <option value="career-change">Career Transition</option>
                    </>
                  )}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Your Goals</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {goalOptions.map((goal) => (
                    <button
                      key={goal}
                      onClick={() => handleArrayToggle('goals', goal)}
                      className={`p-4 -xl border-2 transition-all duration-200 text-sm font-medium text-left ${
                        data.goals.includes(goal)
                          ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                          : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                      }`}
                    >
                      {goal}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-8">
            <div className="text-center space-y-4">
              <div className="w-16 h-16 bg-gradient-to-br from-[#0072CE] to-[#1A1F5E] -full flex items-center justify-center mx-auto">
                <Clock className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl font-bold text-gray-900">Final Details</h2>
              <p className="text-lg text-gray-600">Let's complete your profile</p>
            </div>

            <div className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Availability</label>
                <select
                  value={data.availability}
                  onChange={(e) => setData({ ...data, availability: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 -xl focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                >
                  <option value="">Select your availability</option>
                  <option value="1-2 hours/week">1-2 hours per week</option>
                  <option value="3-5 hours/week">3-5 hours per week</option>
                  <option value="6+ hours/week">6+ hours per week</option>
                  <option value="flexible">Flexible schedule</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-3">Languages</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {languageOptions.map((language) => (
                    <button
                      key={language}
                      onClick={() => handleArrayToggle('languages', language)}
                      className={`p-3 -xl border-2 transition-all duration-200 text-sm font-medium ${
                        data.languages.includes(language)
                          ? 'border-[#0072CE] bg-[#F4F4F4] text-[#1A1F5E]'
                          : 'border-gray-200 text-gray-700 hover:border-[#0072CE]/40'
                      }`}
                    >
                      {language}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4] py-8 px-4">
      <div className="max-w-3xl mx-auto">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between text-sm text-gray-500 mb-2">
            <span>Step {currentStep} of {totalSteps}</span>
            <span>{Math.round((currentStep / totalSteps) * 100)}% Complete</span>
          </div>
          <div className="w-full bg-gray-200 -full h-2">
            <div
              className="bg-[#1A1F5E] h-2 -full transition-all duration-500 ease-out"
              style={{ width: `${(currentStep / totalSteps) * 100}%` }}
            />
          </div>
        </div>

        {/* Form Content */}
        <div className="bg-white -2xl shadow-2xl p-8 border border-[#E5E7EB]">
          {renderStep()}

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="flex items-center space-x-2 px-6 py-3 text-gray-600 hover:text-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ArrowLeft className="w-5 h-5" />
              <span>Previous</span>
            </button>

            {currentStep === totalSteps ? (
              <button
                onClick={handleSubmit}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-8 py-3 bg-[#1A1F5E] text-white font-semibold -xl shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span>Complete Profile</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            ) : (
              <button
                onClick={handleNext}
                disabled={!canProceed()}
                className="flex items-center space-x-2 px-8 py-3 bg-[#1A1F5E] text-white font-semibold -xl shadow-lg hover:opacity-90 transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:transform-none"
              >
                <span>Next</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}