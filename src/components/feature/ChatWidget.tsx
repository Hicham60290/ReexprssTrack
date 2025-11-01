
import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../../lib/supabase';
import { useAuth } from '../../contexts/AuthContext';
import Button from '../base/Button';

interface Message {
  id: string;
  message: string;
  created_at: string;
  is_support: boolean;
  message_type: string;
}

interface Conversation {
  id: string;
  title: string;
  status: string;
  category: string;
  priority: string;
  created_at: string;
  last_message: Message | null;
  unread_count: number;
}

export default function ChatWidget() {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [showNewChat, setShowNewChat] = useState(false);
  const [newChatMessage, setNewChatMessage] = useState('');
  const [newChatCategory, setNewChatCategory] = useState('general');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const categories = {
    general: 'Question générale',
    shipping: 'Expédition',
    billing: 'Facturation',
    technical: 'Support technique',
    package: 'Suivi de colis'
  };

  useEffect(() => {
    if (user && isOpen) {
      loadConversations();
    }
  }, [user, isOpen]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const makeApiCall = async (body: any) => {
    try {
      // Récupération de la session avec gestion d'erreur améliorée
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error('Session error:', sessionError);
        throw new Error('Erreur de session - Veuillez vous reconnecter');
      }

      if (!sessionData?.session?.access_token) {
        console.error('No valid session found');
        throw new Error('Session expirée - Veuillez vous reconnecter');
      }

      // Tentative d'appel API avec retry automatique
      let response;
      let attempt = 0;
      const maxRetries = 2;

      while (attempt < maxRetries) {
        try {
          response = await fetch(`${import.meta.env.VITE_PUBLIC_SUPABASE_URL}/functions/v1/chat-manager`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${sessionData.session.access_token}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(body)
          });

          if (response.ok) {
            break;
          }

          // Si erreur 401, on tente de rafraîchir la session
          if (response.status === 401 && attempt === 0) {
            console.log('Token expired, refreshing session...');
            const { data: refreshData, error: refreshError } = await supabase.auth.refreshSession();
            
            if (refreshError || !refreshData?.session?.access_token) {
              throw new Error('Impossible de rafraîchir la session - Veuillez vous reconnecter');
            }
            
            // Mise à jour du token pour le prochain essai
            sessionData.session.access_token = refreshData.session.access_token;
          }

          attempt++;
        } catch (fetchError) {
          console.error(`API call attempt ${attempt + 1} failed:`, fetchError);
          if (attempt >= maxRetries - 1) {
            throw new Error('Erreur de connexion - Vérifiez votre connexion internet');
          }
          attempt++;
        }
      }

      if (!response || !response.ok) {
        throw new Error('Erreur de communication avec le serveur');
      }

      const result = await response.json();
      
      if (!result.success) {
        console.error('API Error:', result);
        throw new Error(result.error || result.details || 'Erreur API inconnue');
      }

      return result;

    } catch (error: any) {
      console.error('makeApiCall error:', error);
      
      // Messages d'erreur plus user-friendly
      if (error.message.includes('Invalid authentication') || error.message.includes('401')) {
        throw new Error('Session expirée - Veuillez vous reconnecter');
      } else if (error.message.includes('Network') || error.message.includes('fetch')) {
        throw new Error('Problème de connexion - Vérifiez votre connexion internet');
      } else {
        throw error;
      }
    }
  };

  const loadConversations = async () => {
    if (!user) return;

    try {
      setError(null);
      const result = await makeApiCall({ action: 'get_conversations' });
      setConversations(result.conversations || []);
    } catch (error: any) {
      console.error('Error loading conversations:', error);
      setError(error.message || 'Erreur lors du chargement des conversations');
    }
  };

  const loadMessages = async (conversationId: string) => {
    if (!user) return;

    try {
      setError(null);
      const result = await makeApiCall({ 
        action: 'get_messages',
        conversationId 
      });
      setMessages(result.messages || []);
    } catch (error: any) {
      console.error('Error loading messages:', error);
      setError(error.message || 'Erreur lors du chargement des messages');
    }
  };

  const createConversation = async () => {
    if (!user || !newChatMessage.trim()) {
      setError('Veuillez saisir un message');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const result = await makeApiCall({
        action: 'create_conversation',
        message: newChatMessage.trim(),
        category: newChatCategory,
        priority: 'normal'
      });

      setNewChatMessage('');
      setNewChatCategory('general');
      setShowNewChat(false);
      
      await loadConversations();
      
      if (result.conversation?.id) {
        setActiveConversation(result.conversation.id);
        await loadMessages(result.conversation.id);
      }
    } catch (error: any) {
      console.error('Error creating conversation:', error);
      setError(error.message || 'Erreur lors de la création de la conversation');
    } finally {
      setLoading(false);
    }
  };

  const sendMessage = async () => {
    if (!user || !newMessage.trim() || !activeConversation) {
      setError('Veuillez saisir un message');
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      await makeApiCall({
        action: 'send_message',
        conversationId: activeConversation,
        message: newMessage.trim()
      });

      setNewMessage('');
      await loadMessages(activeConversation);
      await loadConversations();
    } catch (error: any) {
      console.error('Error sending message:', error);
      setError(error.message || 'Erreur lors de l\'envoi du message');
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Hier';
    } else if (days < 7) {
      return `Il y a ${days} jours`;
    } else {
      return date.toLocaleDateString('fr-FR');
    }
  };

  const totalUnreadCount = conversations.reduce((total, conv) => total + conv.unread_count, 0);

  if (!user) return null;

  return (
    <>
      {/* Bouton flottant */}
      <div className="fixed bottom-6 right-6 z-50">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 bg-blue-600 hover:bg-blue-700 text-white rounded-full shadow-lg flex items-center justify-center cursor-pointer transition-all duration-200 relative"
        >
          {totalUnreadCount > 0 && (
            <div className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
              {totalUnreadCount > 9 ? '9+' : totalUnreadCount}
            </div>
          )}
          {isOpen ? (
            <i className="ri-close-line text-xl"></i>
          ) : (
            <i className="ri-chat-3-line text-xl"></i>
          )}
        </button>
      </div>

      {/* Fenêtre de chat */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-96 h-[500px] bg-white rounded-lg shadow-2xl border z-50 flex flex-col">
          {/* En-tête */}
          <div className="bg-blue-600 text-white px-4 py-3 rounded-t-lg flex items-center justify-between">
            <div className="flex items-center">
              <i className="ri-customer-service-2-line text-xl mr-2"></i>
              <div>
                <h3 className="font-semibold">Support Client</h3>
                <p className="text-xs opacity-75">Nous répondons rapidement</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="text-white hover:text-gray-200 cursor-pointer"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>

          {/* Affichage des erreurs avec boutons d'action */}
          {error && (
            <div className="bg-red-50 border-l-4 border-red-400 p-3 m-2">
              <div className="flex flex-col">
                <div className="flex items-start">
                  <i className="ri-error-warning-line text-red-400 mr-2 mt-0.5"></i>
                  <div className="flex-1">
                    <p className="text-sm text-red-700">{error}</p>
                    {error.includes('reconnecter') && (
                      <div className="mt-2 flex space-x-2">
                        <button
                          onClick={() => window.location.reload()}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 cursor-pointer"
                        >
                          Recharger la page
                        </button>
                        <button
                          onClick={async () => {
                            await supabase.auth.signOut();
                            window.location.href = '/connexion';
                          }}
                          className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded hover:bg-red-200 cursor-pointer"
                        >
                          Se reconnecter
                        </button>
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => setError(null)}
                    className="text-red-400 hover:text-red-600 cursor-pointer ml-2"
                  >
                    <i className="ri-close-line"></i>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Contenu */}
          <div className="flex-1 flex flex-col overflow-hidden">
            {!activeConversation ? (
              <>
                {/* Liste des conversations */}
                <div className="flex-1 overflow-y-auto">
                  {showNewChat ? (
                    <div className="p-4 space-y-4">
                      <div className="flex items-center justify-between">
                        <h4 className="font-semibold text-gray-900">Nouvelle conversation</h4>
                        <button
                          onClick={() => setShowNewChat(false)}
                          className="text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <i className="ri-arrow-left-line"></i>
                        </button>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Catégorie
                        </label>
                        <select
                          value={newChatCategory}
                          onChange={(e) => setNewChatCategory(e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm pr-8"
                        >
                          {Object.entries(categories).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Votre message
                        </label>
                        <textarea
                          value={newChatMessage}
                          onChange={(e) => setNewChatMessage(e.target.value)}
                          placeholder="Décrivez votre question ou problème..."
                          rows={4}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm resize-none"
                          maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                          {newChatMessage.length}/500 caractères
                        </div>
                      </div>

                      <Button
                        onClick={createConversation}
                        disabled={!newChatMessage.trim() || loading}
                        className="w-full"
                      >
                        {loading ? (
                          <>
                            <i className="ri-loader-4-line animate-spin mr-2"></i>
                            Création...
                          </>
                        ) : (
                          'Démarrer la conversation'
                        )}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-1">
                      {conversations.length > 0 ? (
                        conversations.map((conv) => (
                          <div
                            key={conv.id}
                            onClick={() => {
                              setActiveConversation(conv.id);
                              loadMessages(conv.id);
                            }}
                            className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100"
                          >
                            <div className="flex items-center justify-between mb-1">
                              <span className="font-medium text-gray-900 text-sm truncate flex-1">
                                {conv.title}
                              </span>
                              {conv.unread_count > 0 && (
                                <span className="w-5 h-5 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold ml-2">
                                  {conv.unread_count}
                                </span>
                              )}
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-xs text-gray-500">
                                {categories[conv.category as keyof typeof categories]}
                              </span>
                              <span className="text-xs text-gray-400">
                                {formatDate(conv.last_message?.created_at || conv.created_at)}
                              </span>
                            </div>
                            {conv.last_message && (
                              <p className="text-xs text-gray-600 mt-1 truncate">
                                {conv.last_message.is_support ? '📧 ' : ''}
                                {conv.last_message.message}
                              </p>
                            )}
                          </div>
                        ))
                      ) : (
                        <div className="p-8 text-center">
                          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <i className="ri-chat-3-line text-2xl text-gray-400"></i>
                          </div>
                          <p className="text-gray-600 text-sm mb-4">
                            Aucune conversation pour le moment
                          </p>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bouton nouvelle conversation */}
                {!showNewChat && (
                  <div className="p-4 border-t">
                    <Button
                      onClick={() => setShowNewChat(true)}
                      className="w-full"
                    >
                      <i className="ri-add-line mr-2"></i>
                      Nouvelle conversation
                    </Button>
                  </div>
                )}
              </>
            ) : (
              <>
                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  <div className="flex items-center justify-between mb-4">
                    <button
                      onClick={() => {
                        setActiveConversation(null);
                        setMessages([]);
                        setError(null);
                      }}
                      className="text-gray-400 hover:text-gray-600 cursor-pointer"
                    >
                      <i className="ri-arrow-left-line text-xl"></i>
                    </button>
                    <h4 className="font-semibold text-gray-900 text-sm text-center flex-1">
                      {conversations.find(c => c.id === activeConversation)?.title}
                    </h4>
                  </div>

                  {messages.length === 0 ? (
                    <div className="text-center text-gray-500 text-sm py-8">
                      Aucun message dans cette conversation
                    </div>
                  ) : (
                    messages.map((message) => (
                      <div
                        key={message.id}
                        className={`flex ${message.is_support ? 'justify-start' : 'justify-end'}`}
                      >
                        <div
                          className={`max-w-[80%] px-3 py-2 rounded-lg text-sm ${
                            message.is_support
                              ? 'bg-gray-100 text-gray-800'
                              : 'bg-blue-600 text-white'
                          }`}
                        >
                          <p className="whitespace-pre-wrap">{message.message}</p>
                          <p
                            className={`text-xs mt-1 ${
                              message.is_support ? 'text-gray-500' : 'text-blue-100'
                            }`}
                          >
                            {formatDate(message.created_at)}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                  <div ref={messagesEndRef} />
                </div>

                {/* Saisie du message */}
                <div className="p-4 border-t">
                  <div className="flex space-x-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Tapez votre message..."
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          sendMessage();
                        }
                      }}
                      disabled={loading}
                      maxLength={500}
                    />
                    <button
                      onClick={sendMessage}
                      disabled={!newMessage.trim() || loading}
                      className="px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 cursor-pointer"
                    >
                      {loading ? (
                        <i className="ri-loader-4-line animate-spin"></i>
                      ) : (
                        <i className="ri-send-plane-line"></i>
                      )}
                    </button>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {newMessage.length}/500 caractères
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
