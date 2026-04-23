import React from 'react';
import { MessageSquare, Video, Users, Calendar, ChevronRight, CheckCircle } from 'lucide-react';

const Chat: React.FC = () => {

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-[#1A1F5E] via-[#0072CE] to-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl text-white font-bold mb-3">Discussions & Chat</h1>
            <p className="text-xl text-white/80 max-w-4xl mx-auto">
              All conversations and discussions now happen in Microsoft Teams for better collaboration
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Info Card */}
        <div className="bg-white rounded-2xl shadow-xl p-12 mb-12 border border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Connect via Microsoft Teams</h2>
            <p className="text-lg text-gray-600">
              Microsoft Teams provides a comprehensive platform for all your communication needs with advanced features and security.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#0072CE] rounded-lg flex items-center justify-center flex-shrink-0">
                  <MessageSquare className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Chat & Messaging</h3>
                  <p className="text-gray-600">Real-time messaging, threaded conversations, and file sharing with your mentors and peers</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#0072CE] rounded-lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Video Calls</h3>
                  <p className="text-gray-600">HD video calls with screen sharing, recording, and virtual backgrounds</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 border-2 border-green-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Channels</h3>
                  <p className="text-gray-600">Create dedicated channels for different topics, teams, and mentorship groups</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 border-2 border-orange-200 rounded-xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-orange-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Meeting Scheduling</h3>
                  <p className="text-gray-600">Integrated calendar for scheduling mentorship sessions and group discussions</p>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Do Section */}
          <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 rounded-xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">What You Can Do in Teams</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Chat one-on-one with your mentor',
                'Join group discussions and channels',
                'Share files, documents, and resources',
                'Start instant video meetings',
                'Schedule mentorship sessions',
                'Record meetings for later review',
                'Use reactions and emojis',
                'Search conversation history'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#0072CE] flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}
            </div>
          </div>

          {/* CTA Button */}
          <div className="text-center">
            <a
              href="https://teams.microsoft.com/l/team/19%3amentor_discussions"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-gradient-to-r from-[#0072CE] to-[#1A1F5E] hover:opacity-90 text-white px-10 py-5 rounded-xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              <svg className="w-8 h-8" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17 3H7C5.89543 3 5 3.89543 5 5V19C5 20.1046 5.89543 21 7 21H17C18.1046 21 19 20.1046 19 19V5C19 3.89543 18.1046 3 17 3Z"/>
              </svg>
              <span>Open Microsoft Teams</span>
              <ChevronRight className="w-6 h-6" />
            </a>
            <p className="text-sm text-gray-500 mt-4">
              You'll be redirected to Microsoft Teams. Make sure you're signed in with your work account.
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're having trouble accessing Teams or need assistance setting up your account, please contact your IT administrator or visit the Microsoft Teams help center.
          </p>
          <a
            href="https://support.microsoft.com/en-us/teams"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0072CE] hover:text-[#1A1F5E] font-medium inline-flex items-center space-x-1"
          >
            <span>Visit Teams Help Center</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
};

export default Chat;
