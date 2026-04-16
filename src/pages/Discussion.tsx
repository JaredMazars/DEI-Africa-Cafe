import React, { useState } from 'react';
import { useEffect } from 'react';
import { Plus, Search, Users, Lock, Globe, Send, MoreVertical, UserPlus, Settings } from 'lucide-react';
import { messagesAPI, connectionsAPI } from '../services/api';

interface ChatChannel {
  id: string;
  name: string;
  description: string;
  type: 'public' | 'private';
  memberCount: number;
  creator: string;
  createdAt: string;
  lastMessage?: {
    user: string;
    content: string;
    timestamp: string;
  };
}

interface Message {
  id: string;
  user: string;
  avatar: string;
  content: string;
  timestamp: string;
}

const Chat: React.FC = () => {
  const [selectedChannel, setSelectedChannel] = useState<string | null>('1');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [newMessage, setNewMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [channels, setChannels] = useState<ChatChannel[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);

  // Load discussion data from API
  useEffect(() => {
    const loadDiscussionData = async () => {
      try {
        setLoading(true);
        const connectionsResponse = await connectionsAPI.getConnections();
        
        // Transform connections into chat channels
        const transformedChannels = connectionsResponse.data.connections.slice(0, 4).map((conn: any, index: number) => ({
          id: conn.connection_id,
          name: `${conn.mentor_name} & ${conn.mentee_name}`,
          description: `Private conversation between mentor and mentee`,
          type: 'private' as const,
          memberCount: 2,
          creator: conn.mentor_name,
          createdAt: new Date(conn.created_at).toLocaleDateString(),
          lastMessage: {
            user: conn.mentor_name,
            content: 'Looking forward to our next session!',
            timestamp: new Date(conn.updated_at).toLocaleTimeString()
          }
        }));

        // Add some default public channels
        const defaultChannels = [
          {
            id: 'general',
            name: 'General Discussion',
            description: 'General mentorship discussions and announcements',
            type: 'public' as const,
            memberCount: 150,
            creator: 'Admin',
            createdAt: '2024-01-01',
            lastMessage: {
              user: 'Community Manager',
              content: 'Welcome to the DEI Cafe community!',
              timestamp: '10:00 AM'
            }
          }
        ];

        setChannels([...defaultChannels, ...transformedChannels]);
        
        // Load messages for first channel if available
        if (selectedChannel && transformedChannels.length > 0) {
          const messagesResponse = await messagesAPI.getConnectionMessages(selectedChannel);
          const transformedMessages = messagesResponse.data.messages.map((msg: any) => ({
            id: msg.message_id,
            user: msg.sender_name,
            avatar: msg.sender_avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            content: msg.message_text,
            timestamp: new Date(msg.created_at).toLocaleTimeString()
          }));
          setMessages(transformedMessages);
        }
        
      } catch (error) {
        console.error('Error loading discussion data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadDiscussionData();
  }, []);

  const filteredChannels = channels.filter(channel =>
    channel.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    channel.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSendMessage = () => {
    const sendMessage = async () => {
      if (newMessage.trim() && selectedChannel) {
        try {
          await messagesAPI.sendMessage(selectedChannel, newMessage);
          setNewMessage('');
          
          // Reload messages
          const messagesResponse = await messagesAPI.getConnectionMessages(selectedChannel);
          const transformedMessages = messagesResponse.data.messages.map((msg: any) => ({
            id: msg.message_id,
            user: msg.sender_name,
            avatar: msg.sender_avatar || 'https://images.pexels.com/photos/3785079/pexels-photo-3785079.jpeg?auto=compress&cs=tinysrgb&w=50&h=50&fit=crop',
            content: msg.message_text,
            timestamp: new Date(msg.created_at).toLocaleTimeString()
          }));
          setMessages(transformedMessages);
          
        } catch (error) {
          console.error('Error sending message:', error);
          alert('Failed to send message. Please try again.');
        }
      }
    };
    
    sendMessage();
  };

  return (
    
    <div className="w-screen h-screen px-4 sm:px-6 lg:px-8 py-8">
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden h-full">
        <div className="flex h-full">

          {/* Sidebar */}
          <div className="w-80 border-r border-gray-200 flex flex-col bg-gray-50">
            {/* Header */}
            <div className="p-6 border-b border-gray-200 bg-white">
              <div className="flex items-center justify-between mb-4">
                <h1 className="text-2xl font-bold text-gray-900">Chat Channels</h1>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                >
                  <Plus className="w-5 h-5" />
                </button>
              </div>
              
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <input
                  type="text"
                  placeholder="Search channels..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            {/* Channels List - Scrollable */}
            <div className="flex-1 overflow-y-auto"
                 style={{ maxHeight: 'calc(100vh - 250px)' }}>
              {filteredChannels.map((channel) => (
                <div
                  key={channel.id}
                  onClick={() => setSelectedChannel(channel.id)}
                  className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 transition-colors ${
                    selectedChannel === channel.id ? 'bg-blue-50 border-r-2 border-r-blue-600' : ''
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      {channel.type === 'private' ? (
                        <Lock className="w-4 h-4 text-gray-500" />
                      ) : (
                        <Globe className="w-4 h-4 text-gray-500" />
                      )}
                      <h3 className="font-semibold text-gray-900 text-sm">{channel.name}</h3>
                    </div>
                    <div className="flex items-center space-x-1 text-xs text-gray-500">
                      <Users className="w-3 h-3" />
                      <span>{channel.memberCount}</span>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 mb-2 line-clamp-2">{channel.description}</p>
                  {channel.lastMessage && (
                    <div className="text-xs text-gray-500">
                      <span className="font-medium">{channel.lastMessage.user}:</span>
                      <span className="ml-1">{channel.lastMessage.content.substring(0, 40)}...</span>
                      <span className="ml-2">{channel.lastMessage.timestamp}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Chat Area */}
          {selectedChannel ? (
            <div className="flex-1 flex flex-col">
              {/* Chat Header */}
              <div className="p-4 border-b border-gray-200 bg-gray-50">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900">
                      {channels.find(c => c.id === selectedChannel)?.name}
                    </h2>
                    <p className="text-sm text-gray-600">
                      {channels.find(c => c.id === selectedChannel)?.memberCount} members
                    </p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => setShowInviteModal(true)}
                      className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                    >
                      <UserPlus className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <Settings className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors">
                      <MoreVertical className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className="flex items-start space-x-3">
                    <img
                      src={message.avatar}
                      alt={message.user}
                      className="w-10 h-10 rounded-full object-cover"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-1">
                        <span className="font-semibold text-gray-900 text-sm">{message.user}</span>
                        <span className="text-xs text-gray-500">{message.timestamp}</span>
                      </div>
                      <p className="text-gray-700 text-sm leading-relaxed">{message.content}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
                <div className="flex items-center space-x-3">
                  <input
                    type="text"
                    placeholder="Type your message..."
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <button
                    onClick={handleSendMessage}
                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-lg transition-colors"
                  >
                    <Send className="w-5 h-5" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a Channel</h3>
                <p className="text-gray-600">Choose a channel to start chatting with professionals</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Create Channel Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Create New Channel</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Name</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter channel name"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Describe what this channel is about"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Channel Type</label>
                <select className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent">
                  <option value="public">Public - Anyone can join</option>
                  <option value="private">Private - Invite only</option>
                </select>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowCreateModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Create Channel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Invite Modal */}
      {showInviteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl max-w-md w-full p-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-4">Invite People</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Users</label>
                <input
                  type="text"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Search by name or email"
                />
              </div>
              
              <div className="max-h-48 overflow-y-auto">
                <div className="space-y-2">
                  {['Thabo Mthembu', 'Nomsa Dlamini', 'Sipho Ndaba', 'Lerato Molefe'].map((user) => (
                    <div key={user} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg">
                      <span className="text-sm text-gray-900">{user}</span>
                      <button className="text-blue-600 hover:text-blue-700 text-sm font-medium">
                        Invite
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="flex space-x-3 mt-6">
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowInviteModal(false)}
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Send Invites
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Chat;