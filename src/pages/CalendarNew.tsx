import React from 'react';
import { Calendar, Video, Users, Clock, ChevronRight, CheckCircle, Plus } from 'lucide-react';

export default function CalendarPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A1F5E] text-white">
        <div className="max-w-[1920px] mx-auto px-12 sm:px-16 lg:px-20 py-12">
          <div className="text-center">
            <h1 className="text-4xl text-white font-bold mb-3">Calendar & Scheduling</h1>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Manage all your mentorship sessions and meetings in Microsoft Teams Calendar
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-16">
        {/* Info Card */}
        <div className="bg-white -2xl shadow-xl p-12 mb-12 border border-gray-200">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Schedule via Microsoft Teams</h2>
            <p className="text-lg text-gray-600">
              Microsoft Teams Calendar provides seamless scheduling, reminders, and video conferencing integration all in one place.
            </p>
          </div>

          {/* Features Grid */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#0072CE] -lg flex items-center justify-center flex-shrink-0">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Smart Scheduling</h3>
                  <p className="text-gray-600">Check availability, send invites, and get automatic reminders for all your sessions</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#0072CE] -lg flex items-center justify-center flex-shrink-0">
                  <Video className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">One-Click Meetings</h3>
                  <p className="text-gray-600">Join video calls directly from calendar invites with a single click</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#1A1F5E] -lg flex items-center justify-center flex-shrink-0">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Group Coordination</h3>
                  <p className="text-gray-600">Schedule group mentorship sessions and see everyone's availability</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F4F4F4] border-2 border-[#E5E7EB] -xl p-6">
              <div className="flex items-start space-x-4">
                <div className="w-12 h-12 bg-[#1A1F5E] -lg flex items-center justify-center flex-shrink-0">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">Time Zone Support</h3>
                  <p className="text-gray-600">Automatic time zone detection for global team coordination</p>
                </div>
              </div>
            </div>
          </div>

          {/* What You Can Do Section */}
          <div className="bg-gradient-to-br from-[#F4F4F4] to-[#F4F4F4] border-2 border-[#0072CE]/30 -xl p-8 mb-8">
            <h3 className="text-xl font-semibold text-gray-900 mb-6 text-center">What You Can Do in Teams Calendar</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {[
                'Schedule one-on-one mentorship sessions',
                'Create recurring meeting series',
                'Set up group mentoring events',
                'View mentor availability in real-time',
                'Get meeting reminders and notifications',
                'Reschedule with automatic updates',
                'Add meeting agendas and notes',
                'Sync with Outlook Calendar'
              ].map((feature, index) => (
                <div key={index} className="flex items-center space-x-3">
                  <CheckCircle className="w-5 h-5 text-[#0072CE] flex-shrink-0" />
                  <span className="text-gray-700">{feature}</span>
                </div>
              ))}\n            </div>
          </div>

          {/* CTA Buttons */}
          <div className="text-center space-y-4">
            <a
              href="https://teams.microsoft.com/l/meeting/new"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center space-x-3 bg-[#1A1F5E] hover:opacity-90 text-white px-10 py-5 -xl font-bold text-xl shadow-2xl hover:shadow-3xl transition-all transform hover:scale-105"
            >
              <Plus className="w-8 h-8" />
              <span>Schedule New Meeting</span>
              <ChevronRight className="w-6 h-6" />
            </a>
            
            <div className="flex items-center justify-center space-x-4">
              <a
                href="https://teams.microsoft.com/l/calendar"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white border-2 border-[#0072CE] text-[#0072CE] hover:bg-[#1A1F5E]/5 px-6 py-3 -lg font-semibold transition-colors"
              >
                <Calendar className="w-5 h-5" />
                <span>View Calendar</span>
              </a>
              
              <a
                href="https://teams.microsoft.com/l/meeting/join"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 bg-white border-2 border-green-600 text-green-600 hover:bg-green-50 px-6 py-3 -lg font-semibold transition-colors"
              >
                <Video className="w-5 h-5" />
                <span>Join Meeting</span>
              </a>
            </div>
            
            <p className="text-sm text-gray-500 mt-4">
              You'll be redirected to Microsoft Teams. Make sure you're signed in with your work account.
            </p>
          </div>
        </div>

        {/* Help Section */}
        <div className="bg-gray-50 border border-gray-200 -xl p-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            If you're having trouble accessing Teams Calendar or need assistance scheduling meetings, please contact your IT administrator or visit the Microsoft Teams help center.
          </p>
          <a
            href="https://support.microsoft.com/en-us/office/schedule-a-meeting-in-microsoft-teams-943507a9-8583-4c58-b5d2-8ec8265e04e5"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#0072CE] hover:text-[#1A1F5E] font-medium inline-flex items-center space-x-1"
          >
            <span>Learn How to Schedule in Teams</span>
            <ChevronRight className="w-4 h-4" />
          </a>
        </div>
      </div>
    </div>
  );
}
