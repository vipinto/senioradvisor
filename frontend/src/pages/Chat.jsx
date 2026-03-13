import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { io } from 'socket.io-client';
import { Send, ArrowLeft, User, Circle, MessageCircle, Lock, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import api, { API_BASE } from '@/lib/api';
import SubscriptionCard from '@/components/SubscriptionCard';

const Chat = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [typing, setTyping] = useState({});
  const [connected, setConnected] = useState(false);
  
  const socketRef = useRef(null);
  const messagesEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  // Initialize socket connection
  useEffect(() => {
    const backendUrl = process.env.REACT_APP_BACKEND_URL || '';
    
    socketRef.current = io(backendUrl, {
      path: '/socket.io',
      transports: ['websocket', 'polling'],
      withCredentials: true
    });

    socketRef.current.on('connect', () => {
      console.log('Socket connected');
      setConnected(true);
    });

    socketRef.current.on('disconnect', () => {
      console.log('Socket disconnected');
      setConnected(false);
    });

    socketRef.current.on('authenticated', (data) => {
      console.log('Authenticated:', data);
    });

    socketRef.current.on('new_message', (data) => {
      console.log('New message received:', data);
      setMessages(prev => [...prev, data]);
      // Reload conversations to update last message
      loadConversations();
    });

    socketRef.current.on('message_sent', (data) => {
      console.log('Message sent confirmation:', data);
    });

    socketRef.current.on('user_typing', (data) => {
      setTyping(prev => ({
        ...prev,
        [data.user_id]: data.is_typing
      }));
    });

    socketRef.current.on('error', (data) => {
      console.error('Socket error:', data);
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  // Check auth and load data
  useEffect(() => {
    checkAuth();
  }, []);

  // Authenticate with socket after user is loaded
  useEffect(() => {
    if (user && socketRef.current && connected) {
      socketRef.current.emit('authenticate', { user_id: user.user_id });
    }
  }, [user, connected]);

  // Load messages when conversation is selected
  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation.conversation_id);
    }
  }, [selectedConversation]);

  // Scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Check for provider_id in URL params to start a new conversation
  useEffect(() => {
    const providerId = searchParams.get('provider');
    if (providerId && user) {
      startConversationWithProvider(providerId);
    }
  }, [searchParams, user]);

  const checkAuth = async () => {
    try {
      const response = await api.get('/auth/me');
      setUser(response.data);
      
      // Load conversations for subscribed users OR for providers (free providers can respond)
      if (response.data.has_subscription || response.data.role === 'provider') {
        await loadConversations();
      }
    } catch (error) {
      navigate('/login');
    } finally {
      setLoading(false);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await api.get('/chat/conversations');
      setConversations(response.data);
    } catch (error) {
      console.error('Error loading conversations:', error);
    }
  };

  const loadMessages = async (conversationId) => {
    try {
      const response = await api.get(`/chat/messages/${conversationId}`);
      setMessages(response.data);
    } catch (error) {
      console.error('Error loading messages:', error);
    }
  };

  const startConversationWithProvider = async (providerId) => {
    // Check if conversation already exists
    const existing = conversations.find(c => 
      c.other_user?.user_id === providerId
    );
    
    if (existing) {
      setSelectedConversation(existing);
    } else {
      // Create new conversation placeholder
      try {
        const providerResponse = await api.get(`/providers/${providerId}`);
        const provider = providerResponse.data;
        
        const newConv = {
          conversation_id: `${user.user_id}_${provider.user_id}`,
          other_user: {
            user_id: provider.user_id,
            name: provider.business_name,
            picture: provider.photos?.[0]
          },
          last_message: null,
          unread_count: 0
        };
        
        setSelectedConversation(newConv);
        setMessages([]);
      } catch (error) {
        console.error('Error starting conversation:', error);
      }
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    
    if (!newMessage.trim() || !selectedConversation) return;
    
    const messageData = {
      message_id: `msg_${Date.now()}`,
      conversation_id: selectedConversation.conversation_id,
      sender_id: user.user_id,
      receiver_id: selectedConversation.other_user.user_id,
      message: newMessage,
      created_at: new Date().toISOString()
    };

    // Send via socket for real-time delivery
    if (socketRef.current && connected) {
      socketRef.current.emit('send_message', messageData);
    }

    // Also save to database via API
    try {
      await api.post('/chat/messages', {
        receiver_id: selectedConversation.other_user.user_id,
        message: newMessage
      });
    } catch (error) {
      console.error('Error saving message:', error);
    }

    // Add to local state immediately
    setMessages(prev => [...prev, messageData]);
    setNewMessage('');
    
    // Stop typing indicator
    handleStopTyping();
  };

  const handleTyping = () => {
    if (!selectedConversation || !socketRef.current || !connected) return;

    // Send typing indicator
    socketRef.current.emit('typing', {
      sender_id: user.user_id,
      receiver_id: selectedConversation.other_user.user_id,
      is_typing: true
    });

    // Clear previous timeout
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Set timeout to stop typing
    typingTimeoutRef.current = setTimeout(handleStopTyping, 2000);
  };

  const handleStopTyping = () => {
    if (!selectedConversation || !socketRef.current || !connected) return;

    socketRef.current.emit('typing', {
      sender_id: user.user_id,
      receiver_id: selectedConversation.other_user.user_id,
      is_typing: false
    });
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (date.toDateString() === today.toDateString()) {
      return 'Hoy';
    } else if (date.toDateString() === yesterday.toDateString()) {
      return 'Ayer';
    } else {
      return date.toLocaleDateString('es-CL', { day: 'numeric', month: 'short' });
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-16 h-16 border-4 border-[#00e7ff] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  // Show subscription required message for non-subscribed clients only
  // Free providers can still see and respond to client-initiated conversations
  if (!user?.has_subscription && user?.role !== 'provider') {
    return (
      <div className="min-h-screen bg-gray-100 py-12" data-testid="chat-blocked">
        <div className="max-w-2xl mx-auto px-4">
          <div className="bg-white rounded-2xl p-8 shadow-lg text-center">
            <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-10 h-10 text-[#00e7ff]" />
            </div>
            <h1 className="text-2xl font-bold text-[#33404f] mb-4">
              Mensajeria Bloqueada
            </h1>
            <p className="text-gray-600 mb-8">
              Para enviar y recibir mensajes necesitas una suscripcion activa.
              Como cliente, podras contactar cuidadores directamente.
            </p>
            <SubscriptionCard 
              userType="client"
              hasSubscription={false} 
            />
            <Link to="/dashboard" className="inline-block mt-6 text-gray-500 hover:text-gray-700">
              Volver al panel
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100" data-testid="chat-page">
      {/* Banner for free providers */}
      {user?.role === 'provider' && !user?.has_subscription && (
        <div className="bg-amber-50 border-b border-amber-200 px-4 py-3 flex items-center justify-between" data-testid="free-provider-chat-banner">
          <p className="text-sm text-amber-800">
            <strong>Cuenta gratuita:</strong> Puedes responder mensajes de clientes que te contacten. Para enviar propuestas e iniciar conversaciones, actualiza a Premium.
          </p>
          <Link to="/provider/dashboard" className="text-sm font-bold text-[#00e7ff] hover:underline whitespace-nowrap ml-4">
            Ver Premium $7.500/mes
          </Link>
        </div>
      )}
      <div className="max-w-6xl mx-auto h-[calc(100vh-64px)] flex">
        {/* Conversations List */}
        <div className={`w-full md:w-80 bg-white border-r flex flex-col ${selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          <div className="p-4 border-b">
            <h2 className="text-xl font-bold text-[#33404f]">Mensajes</h2>
            <div className="flex items-center gap-2 mt-2 text-sm">
              <Circle className={`w-3 h-3 ${connected ? 'fill-green-500 text-green-500' : 'fill-gray-300 text-gray-300'}`} />
              <span className="text-gray-500">{connected ? 'Conectado' : 'Desconectado'}</span>
            </div>
          </div>
          
          <ScrollArea className="flex-1">
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                <MessageCircle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>No tienes conversaciones aún</p>
                <p className="text-sm mt-2">Visita el perfil de un proveedor para iniciar un chat</p>
              </div>
            ) : (
              conversations.map((conv) => (
                <button
                  key={conv.conversation_id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors border-b ${
                    selectedConversation?.conversation_id === conv.conversation_id ? 'bg-red-50' : ''
                  }`}
                  data-testid="conversation-item"
                >
                  <div className="w-12 h-12 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                    {conv.other_user?.picture ? (
                      <img 
                        src={conv.other_user.picture} 
                        alt={conv.other_user?.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-400" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0 text-left">
                    <h3 className="font-semibold text-[#33404f] truncate">
                      {conv.other_user?.name || 'Usuario'}
                    </h3>
                    <p className="text-sm text-gray-500 truncate">
                      {conv.last_message?.message || 'Sin mensajes'}
                    </p>
                  </div>
                  {conv.unread_count > 0 && (
                    <span className="bg-[#00e7ff] text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center">
                      {conv.unread_count}
                    </span>
                  )}
                </button>
              ))
            )}
          </ScrollArea>
        </div>

        {/* Chat Area */}
        <div className={`flex-1 flex flex-col bg-white ${!selectedConversation ? 'hidden md:flex' : 'flex'}`}>
          {selectedConversation ? (
            <>
              {/* Chat Header */}
              <div className="p-4 border-b flex items-center gap-3">
                <button
                  onClick={() => setSelectedConversation(null)}
                  className="md:hidden p-2 hover:bg-gray-100 rounded-full"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden flex-shrink-0">
                  {selectedConversation.other_user?.picture ? (
                    <img 
                      src={selectedConversation.other_user.picture} 
                      alt={selectedConversation.other_user?.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <User className="w-5 h-5 text-gray-400" />
                    </div>
                  )}
                </div>
                <div>
                  <h3 className="font-semibold text-[#33404f]">
                    {selectedConversation.other_user?.name || 'Usuario'}
                  </h3>
                  {typing[selectedConversation.other_user?.user_id] && (
                    <p className="text-sm text-[#00e7ff]">Escribiendo...</p>
                  )}
                </div>
              </div>

              {/* Messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {messages.map((msg, index) => {
                    const isOwn = msg.sender_id === user.user_id;
                    const showDate = index === 0 || 
                      formatDate(msg.created_at) !== formatDate(messages[index - 1]?.created_at);
                    
                    return (
                      <React.Fragment key={msg.message_id || index}>
                        {showDate && (
                          <div className="flex justify-center">
                            <span className="text-xs text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                              {formatDate(msg.created_at)}
                            </span>
                          </div>
                        )}
                        <div className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}>
                          <div
                            className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                              isOwn
                                ? 'bg-[#00e7ff] text-white rounded-br-none'
                                : 'bg-gray-100 text-[#33404f] rounded-bl-none'
                            }`}
                          >
                            <p className="break-words">{msg.message}</p>
                            <p className={`text-xs mt-1 ${isOwn ? 'text-red-200' : 'text-gray-500'}`}>
                              {formatTime(msg.created_at)}
                            </p>
                          </div>
                        </div>
                      </React.Fragment>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              </ScrollArea>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="p-4 border-t">
                <div className="flex gap-2">
                  <Input
                    type="text"
                    value={newMessage}
                    onChange={(e) => {
                      setNewMessage(e.target.value);
                      handleTyping();
                    }}
                    placeholder="Escribe un mensaje..."
                    className="flex-1"
                    data-testid="message-input"
                  />
                  <Button 
                    type="submit" 
                    disabled={!newMessage.trim()}
                    className="bg-[#00e7ff] hover:bg-[#00c4d4]"
                    data-testid="send-message-btn"
                  >
                    <Send className="w-5 h-5" />
                  </Button>
                </div>
              </form>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <MessageCircle className="w-16 h-16 mx-auto mb-4 text-gray-300" />
                <p className="text-lg">Selecciona una conversación</p>
                <p className="text-sm mt-2">O visita el perfil de un proveedor para iniciar un chat</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Chat;
