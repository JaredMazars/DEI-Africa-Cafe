import React, { useState } from 'react';
import { useEffect } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, MapPin, Video } from 'lucide-react';
import { sessionsAPI } from '../services/api';

interface Session {
  id: string;
  date: string;
  time: string;
  duration: number;
  mentor: {
    name: string;
    avatar: string;
    title: string;
  };
  topic: string;
  type: 'video' | 'in-person';
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
}

const Calendar: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [loading, setLoading] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);

  // Load sessions from API
  useEffect(() => {
    const loadSessions = async () => {
      try {
        setLoading(true);
        const response = await sessionsAPI.getSessions();
        
        // Transform backend data to frontend format
        const transformedSessions = response.data.sessions.map((session: any) => ({
          id: session.session_id,
          date: new Date(session.scheduled_at).toISOString().split('T')[0],
          time: new Date(session.scheduled_at).toLocaleTimeString('en-US', { 
            hour: '2-digit', 
            minute: '2-digit',
            hour12: false 
          }),
          duration: session.duration_minutes,
          mentor: {
            name: session.mentor_name,
            avatar: session.mentor_avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=100&h=100&fit=crop',
            title: 'Mentor'
          },
          topic: session.title,
          type: 'video',
          status: session.status
        }));

        setSessions(transformedSessions);
      } catch (error) {
        console.error('Error loading sessions:', error);
      } finally {
        setLoading(false);
      }
    };

    loadSessions();
  }, []);

  const getDaysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay();
  };

  const formatDate = (date: Date) => {
    return date.toISOString().split('T')[0];
  };

  const getSessionsForDate = (date: string) => {
    return sessions.filter(session => session.date === date);
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev);
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1);
      } else {
        newDate.setMonth(prev.getMonth() + 1);
      }
      return newDate;
    });
  };

  const renderCalendarDays = () => {
    const daysInMonth = getDaysInMonth(currentDate);
    const firstDay = getFirstDayOfMonth(currentDate);
    const days = [];

    // Empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      days.push(<div key={`empty-${i}`} className="h-24"></div>);
    }

    // Days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day);
      const dateString = formatDate(date);
      const daysSessions = getSessionsForDate(dateString);
      const isSelected = selectedDate === dateString;
      const isToday = dateString === formatDate(new Date());

      days.push(
        <div
          key={day}
          className={`h-24 p-2 border border-gray-100 cursor-pointer transition-colors ${
            isSelected ? 'bg-[#0072CE]/10 border-[#0072CE]/30' : 'hover:bg-gray-50'
          } ${isToday ? 'bg-[#1A1F5E]/10' : ''}`}
          onClick={() => setSelectedDate(dateString)}
        >
          <div className={`text-sm font-medium ${isToday ? 'text-[#0072CE]' : 'text-gray-900'}`}>
            {day}
          </div>
          {daysSessions.map(session => (
            <div
              key={session.id}
              className={`mt-1 p-1 rounded text-xs truncate ${
                session.status === 'completed'
                  ? 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
                  : session.status === 'cancelled'
                  ? 'bg-red-100 text-red-800'
                  : 'bg-[#1A1F5E]/10 text-[#1A1F5E]'
              }`}
            >
              {session.time} - {session.mentor.name}
            </div>
          ))}
        </div>
      );
    }

    return days;
  };

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-gray-600 mt-1">Manage your mentoring sessions</p>
        </div>
        <button
          onClick={() => setShowBookingModal(true)}
          className="bg-[#0072CE] hover:bg-[#1A1F5E] text-white px-6 py-2 rounded-lg font-medium transition-colors"
        >
          Book New Session
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-100">
          {/* Calendar Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-100">
            <h2 className="text-xl font-semibold text-gray-900">
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </h2>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => navigateMonth('prev')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={() => setCurrentDate(new Date())}
                className="px-4 py-2 text-sm font-medium text-[#0072CE] hover:bg-[#1A1F5E]/5 rounded-lg transition-colors"
              >
                Today
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Calendar Grid */}
          <div className="p-6">
            {/* Day Headers */}
            <div className="grid grid-cols-7 mb-2">
              {dayNames.map(day => (
                <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7 gap-px bg-gray-200">
              {renderCalendarDays()}
            </div>
          </div>
        </div>

        {/* Session Details */}
        <div className="space-y-6">
          {/* Selected Date Sessions */}
          {selectedDate && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {new Date(selectedDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric'
                })}
              </h3>

              {getSessionsForDate(selectedDate).length > 0 ? (
                <div className="space-y-4">
                  {getSessionsForDate(selectedDate).map(session => (
                    <div key={session.id} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center space-x-3 mb-3">
                        <img
                          src={session.mentor.avatar}
                          alt={session.mentor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                        <div>
                          <p className="font-medium text-gray-900">{session.mentor.name}</p>
                          <p className="text-sm text-gray-600">{session.mentor.title}</p>
                        </div>
                      </div>
                      
                      <p className="font-medium text-gray-900 mb-2">{session.topic}</p>
                      
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                          <Clock className="w-4 h-4" />
                          <span>{session.time} ({session.duration}min)</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          {session.type === 'video' ? (
                            <Video className="w-4 h-4" />
                          ) : (
                            <MapPin className="w-4 h-4" />
                          )}
                          <span>{session.type === 'video' ? 'Video Call' : session.location}</span>
                        </div>
                      </div>
                      
                      {session.status === 'scheduled' && (
                        <div className="mt-3 flex space-x-2">
                          <button className="flex-1 bg-[#0072CE] hover:bg-[#1A1F5E] text-white py-1 px-3 rounded text-sm font-medium transition-colors">
                            Join Call
                          </button>
                          <button className="px-3 py-1 text-gray-600 hover:text-gray-800 text-sm transition-colors">
                            Reschedule
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-4">No sessions scheduled for this date</p>
              )}
            </div>
          )}

          {/* Upcoming Sessions */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Sessions</h3>
            
            <div className="space-y-4">
              {sessions.filter(s => s.status === 'scheduled').slice(0, 3).map(session => (
                <div key={session.id} className="flex items-center space-x-3 p-3 border border-gray-200 rounded-lg">
                  <img
                    src={session.mentor.avatar}
                    alt={session.mentor.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 text-sm">{session.mentor.name}</p>
                    <p className="text-sm text-gray-600 truncate">{session.topic}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(session.date + 'T' + session.time).toLocaleDateString()} at {session.time}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Book a Session</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Select Mentor</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]">
                  <option>Choose a mentor...</option>
                  <option>Dr. Emily Rodriguez - Leadership</option>
                  <option>James Wilson - Technical Skills</option>
                  <option>Sarah Johnson - Product Management</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Date</label>
                <input
                  type="date"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Time</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]">
                  <option>9:00 AM</option>
                  <option>10:00 AM</option>
                  <option>11:00 AM</option>
                  <option>2:00 PM</option>
                  <option>3:00 PM</option>
                  <option>4:00 PM</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Duration</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#1A1F5E]/20 focus:border-[#1A1F5E]">
                  <option>30 minutes</option>
                  <option>45 minutes</option>
                  <option>60 minutes</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowBookingModal(false)}
                className="flex-1 px-4 py-2 bg-[#0072CE] hover:bg-[#1A1F5E] text-white rounded-lg transition-colors"
              >
                Book Session
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Calendar;