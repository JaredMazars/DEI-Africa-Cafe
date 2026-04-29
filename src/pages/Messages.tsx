import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Send, MessageSquare, Search, RefreshCw, User } from 'lucide-react';
import { messagesAPI } from '../services/api';

interface Connection {
  id: string;
  name: string;
  role: string;
  status: string;
  avatar?: string;
}

interface Message {
  id: string;
  sender_id: string;
  sender_name: string;
  message_text: string;
  sent_at: string;
  is_read: boolean;
}

const Messages: React.FC = () => {
  const [searchParams] = useSearchParams();
  const initialConnectionId = searchParams.get('connectionId') || '';

  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedId, setSelectedId] = useState<string>(initialConnectionId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loadingConns, setLoadingConns] = useState(true);
  const [loadingMsgs, setLoadingMsgs] = useState(false);
  const [search, setSearch] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Get current user id from token
  useEffect(() => {
    try {
      const token = localStorage.getItem('token');
      if (token) {
        const payload = JSON.parse(atob(token.split('.')[1]));
        setCurrentUserId(payload.id || payload.user_id || payload.sub || '');
      }
    } catch { /* ignore */ }
  }, []);

  // Load connections
  useEffect(() => {
    const load = async () => {
      setLoadingConns(true);
      try {
        const token = localStorage.getItem('token');
        const res = await fetch('/api/connections', {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const raw: any[] = data.data?.connections || [];
        const mapped: Connection[] = raw
          .filter(c => c.status === 'accepted')
          .map(c => ({
            id: c.id,
            name: c.mentor_name || c.mentee_name || c.name || 'Connection',
            role: c.role || (c.mentor_user_id ? 'mentor' : 'mentee'),
            status: c.status,
            avatar: c.mentor_avatar || c.mentee_avatar || c.avatar_url || '',
          }));
        setConnections(mapped);
        // Auto-select first if no id in query
        if (!initialConnectionId && mapped.length > 0) {
          setSelectedId(mapped[0].id);
        }
      } catch {
        setError('Failed to load connections.');
      } finally {
        setLoadingConns(false);
      }
    };
    load();
  }, []);

  // Load messages for selected connection
  const loadMessages = useCallback(async (connId: string) => {
    if (!connId) return;
    setLoadingMsgs(true);
    try {
      const res = await messagesAPI.getConnectionMessages(connId);
      setMessages(res.data?.messages || []);
    } catch {
      setMessages([]);
    } finally {
      setLoadingMsgs(false);
    }
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    loadMessages(selectedId);
    // Poll for new messages every 8s
    if (pollRef.current) clearInterval(pollRef.current);
    pollRef.current = setInterval(() => loadMessages(selectedId), 8000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [selectedId, loadMessages]);

  // Scroll to bottom on new messages
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    if (!text.trim() || !selectedId) return;
    setSending(true);
    try {
      await messagesAPI.sendMessage(selectedId, text.trim());
      setText('');
      await loadMessages(selectedId);
    } catch {
      setError('Failed to send message. Please try again.');
      setTimeout(() => setError(null), 4000);
    } finally {
      setSending(false);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
  };

  const selectedConn = connections.find(c => c.id === selectedId);
  const filteredConns = connections.filter(c =>
    !search || c.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F4F4F4] via-white to-[#F4F4F4]">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">

        {/* Header */}
        <div className="mb-6">
          <div className="h-1 w-10 bg-[#E83E2D] rounded-full mb-3" />
          <h1 className="text-3xl font-bold text-[#1A1F5E]">Messages</h1>
          <p className="text-[#8C8C8C] mt-1 text-sm">Chat with your mentors and mentees</p>
        </div>

        {error && (
          <div className="mb-4 flex items-center gap-3 bg-[#E83E2D]/10 border border-[#E83E2D]/30 text-[#E83E2D] px-5 py-3 rounded-2xl text-sm font-medium">
            {error}
          </div>
        )}

        <div className="bg-white rounded-3xl shadow-xl border border-[#E5E7EB] overflow-hidden flex" style={{ height: '70vh' }}>

          {/* Sidebar — Connection List */}
          <div className="w-72 border-r border-[#E5E7EB] flex flex-col flex-shrink-0">
            <div className="p-4 border-b border-[#E5E7EB]">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8C8C8C]" />
                <input
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  placeholder="Search connections…"
                  className="w-full pl-9 pr-3 py-2 text-sm rounded-xl border-2 border-[#E5E7EB] focus:outline-none focus:border-[#1A1F5E] transition-all"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {loadingConns ? (
                <div className="flex items-center justify-center py-12">
                  <RefreshCw className="w-6 h-6 animate-spin text-[#1A1F5E]" />
                </div>
              ) : filteredConns.length === 0 ? (
                <div className="p-6 text-center text-[#8C8C8C]">
                  <MessageSquare className="w-10 h-10 mx-auto mb-2 text-[#E5E7EB]" />
                  <p className="text-sm">No accepted connections yet.</p>
                  <p className="text-xs mt-1">Connect with a mentor first.</p>
                </div>
              ) : (
                filteredConns.map(conn => (
                  <button
                    key={conn.id}
                    onClick={() => setSelectedId(conn.id)}
                    className={`w-full text-left px-4 py-3.5 flex items-center gap-3 border-b border-[#E5E7EB]/60 transition-colors ${
                      selectedId === conn.id ? 'bg-[#1A1F5E]/5 border-l-4 border-l-[#1A1F5E]' : 'hover:bg-[#F4F4F4]'
                    }`}
                  >
                    <div className="w-10 h-10 rounded-full bg-[#1A1F5E]/10 flex items-center justify-center flex-shrink-0 text-[#1A1F5E] font-bold text-sm">
                      {conn.avatar
                        ? <img src={conn.avatar} alt="" className="w-10 h-10 rounded-full object-cover" />
                        : conn.name.charAt(0).toUpperCase()
                      }
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-[#333333] text-sm truncate">{conn.name}</p>
                      <p className="text-xs text-[#8C8C8C] capitalize">{conn.role}</p>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Chat Panel */}
          {!selectedId ? (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center text-[#8C8C8C]">
                <MessageSquare className="w-14 h-14 mx-auto mb-3 text-[#E5E7EB]" />
                <p className="font-semibold text-[#333333]">Select a conversation</p>
                <p className="text-sm mt-1">Choose a connection from the left to start chatting</p>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-w-0">
              {/* Chat Header */}
              <div className="px-6 py-4 border-b border-[#E5E7EB] flex items-center gap-3 bg-white">
                <div className="w-9 h-9 rounded-full bg-[#1A1F5E]/10 flex items-center justify-center text-[#1A1F5E] font-bold text-sm flex-shrink-0">
                  {selectedConn?.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="font-bold text-[#1A1F5E]">{selectedConn?.name}</p>
                  <p className="text-xs text-[#8C8C8C] capitalize">{selectedConn?.role}</p>
                </div>
              </div>

              {/* Messages */}
              <div className="flex-1 overflow-y-auto px-6 py-4 space-y-3">
                {loadingMsgs ? (
                  <div className="flex items-center justify-center py-10">
                    <RefreshCw className="w-5 h-5 animate-spin text-[#1A1F5E]" />
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center text-[#8C8C8C]">
                    <MessageSquare className="w-10 h-10 mb-2 text-[#E5E7EB]" />
                    <p className="font-medium text-[#333333]">No messages yet</p>
                    <p className="text-sm mt-1">Send the first message to start the conversation.</p>
                  </div>
                ) : (
                  messages.map(msg => {
                    const isMine = msg.sender_id === currentUserId;
                    return (
                      <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'}`}>
                        {!isMine && (
                          <div className="w-7 h-7 rounded-full bg-[#1A1F5E]/10 flex items-center justify-center text-[#1A1F5E] text-xs font-bold flex-shrink-0 mr-2 mt-1">
                            {msg.sender_name?.charAt(0)?.toUpperCase() || <User className="w-3 h-3" />}
                          </div>
                        )}
                        <div className={`max-w-[70%] ${isMine ? '' : ''}`}>
                          {!isMine && <p className="text-xs text-[#8C8C8C] mb-1 ml-1">{msg.sender_name}</p>}
                          <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${
                            isMine
                              ? 'bg-[#1A1F5E] text-white rounded-br-sm'
                              : 'bg-[#F4F4F4] text-[#333333] rounded-bl-sm'
                          }`}>
                            {msg.message_text}
                          </div>
                          <p className={`text-xs text-[#8C8C8C] mt-1 ${isMine ? 'text-right' : 'text-left ml-1'}`}>
                            {new Date(msg.sent_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </p>
                        </div>
                      </div>
                    );
                  })
                )}
                <div ref={bottomRef} />
              </div>

              {/* Input */}
              <div className="px-4 py-4 border-t border-[#E5E7EB] bg-white">
                <div className="flex items-end gap-3">
                  <textarea
                    value={text}
                    onChange={e => setText(e.target.value)}
                    onKeyDown={handleKey}
                    placeholder="Type a message… (Enter to send)"
                    rows={1}
                    className="flex-1 px-4 py-3 rounded-2xl border-2 border-[#E5E7EB] text-sm text-[#333333] resize-none focus:outline-none focus:border-[#1A1F5E] focus:ring-2 focus:ring-[#1A1F5E]/20 transition-all"
                    style={{ maxHeight: '100px', overflowY: 'auto' }}
                  />
                  <button
                    onClick={handleSend}
                    disabled={sending || !text.trim()}
                    className="flex-shrink-0 w-11 h-11 rounded-2xl bg-[#1A1F5E] text-white flex items-center justify-center hover:opacity-90 active:scale-95 disabled:opacity-40 transition-all shadow-lg"
                  >
                    {sending ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Messages;
