import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getSessions, createSession, getSession, sendMessage, deleteSession, exportSession } from '../services/chatService';
import { getImageUrl } from '../utils/imageUtils';
import DOMPurify from 'dompurify';
import '../styles/pages/Chat.css';

/* ==============================
   Icons
   ============================== */
const ExportIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
    <polyline points="17 8 12 3 7 8"></polyline>
    <line x1="12" y1="3" x2="12" y2="15"></line>
  </svg>
);

const SparklesIcon = ({ className }) => (
  <svg className={className} width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path>
    <polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline>
    <line x1="12" y1="22.08" x2="12" y2="12"></line>
  </svg>
);

const PaperclipIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21.44 11.05l-9.19 9.19a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48"></path>
  </svg>
);

const MicIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"></path>
    <path d="M19 10v2a7 7 0 0 1-14 0v-2"></path>
    <line x1="12" y1="19" x2="12" y2="23"></line>
    <line x1="8" y1="23" x2="16" y2="23"></line>
  </svg>
);

const SendIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: document.body.getAttribute('dir') === 'rtl' ? 'rotate(180deg)' : 'none' }}>
    <line x1="22" y1="2" x2="11" y2="13"></line>
    <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
  </svg>
);

const PlusIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="12" y1="5" x2="12" y2="19"></line>
    <line x1="5" y1="12" x2="19" y2="12"></line>
  </svg>
);

const ChatBubbleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const TrashIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"></polyline>
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
  </svg>
);

const CopyIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
  </svg>
);

const ThumbsUpIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path>
  </svg>
);

const ThumbsDownIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zM17 2h3a2 2 0 0 1 2 2v7a2 2 0 0 1-2 2h-3"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const HistoryIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <polyline points="12 6 12 12 16 14"></polyline>
  </svg>
);

const VoiceLangIcon = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '4px'}}>
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" y1="12" x2="22" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

/* ==============================
   Modals
   ============================== */
const Modal = ({ isOpen, onClose, title, children, actions }) => {
  if (!isOpen) return null;
  return (
    <div className="chat-modal-overlay" onClick={onClose}>
      <div className="chat-modal-content" onClick={e => e.stopPropagation()}>
        <h3 className="chat-modal-title">{title}</h3>
        <div className="chat-modal-text">{children}</div>
        <div className="chat-modal-actions">
          {actions}
        </div>
      </div>
    </div>
  );
};

/* ==============================
   Component
   ============================== */
const Chat = () => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const userName = user?.name ? user.name.split(' ')[0] : 'User'; 
  
  const [sessions, setSessions] = useState([]);
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [voiceLang, setVoiceLang] = useState('ar-EG');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [customBudget, setCustomBudget] = useState('');
  
  // Modal States
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  
  const isArabic = (text) => /[\u0600-\u06FF]/.test(text || '');
  
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    fetchSessions();
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchSessions = async () => {
    try {
      const res = await getSessions();
      if (res.data?.success) {
        setSessions(res.data.data.sessions || []);
      }
    } catch (err) {
      console.error('Error fetching sessions:', err);
    }
  };

  const loadSession = async (id) => {
    try {
      setIsLoading(true);
      const res = await getSession(id);
      if (res.data?.success) {
        setMessages(Array.isArray(res.data.data) ? res.data.data : []);
      }
    } catch (err) {
      console.error('Error loading session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNewChat = () => {
    setActiveSessionId(null);
    setMessages([]);
    setSelectedCategory('');
    setCustomBudget('');
    setIsSidebarOpen(false);
  };

  const chatBubbleRef = useRef(null);
  
  const inputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setSelectedFile({ name: file.name, data: event.target.result });
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleMicClick = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert(t('speechNotSupported', 'Speech recognition is not supported in this browser.'));
      return;
    }
    
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    const recognition = new SpeechRecognition();
    
    // Use the explicit voice language selected by the user
    recognition.lang = voiceLang;
    
    recognition.interimResults = true;
    
    recognition.onstart = () => setIsRecording(true);
    
    // Capture the text that existed before this recording session started
    const existingText = inputRef.current ? inputRef.current.innerText.trim() : inputText.trim();
    const separator = existingText ? ' ' : '';
    
    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(result => result[0])
        .map(result => result.transcript)
        .join('');
      
      const newText = existingText + separator + transcript;
      if (inputRef.current) inputRef.current.innerText = newText;
      setInputText(newText);
    };
    
    recognition.onerror = (event) => {
      console.error(event.error);
      setIsRecording(false);
    };
    
    recognition.onend = () => setIsRecording(false);
    
    recognition.start();
  };

  const handleSend = async (textOverride) => {
    const textToSend = typeof textOverride === 'string' ? textOverride : (inputRef.current ? inputRef.current.innerText : inputText);
    const attachmentToSend = selectedFile;
    
    if (!textToSend.trim() && !attachmentToSend) return;
    
    setInputText('');
    if (inputRef.current) {
      inputRef.current.innerText = '';
    }
    setSelectedFile(null);
    setIsLoading(true);
    
    // Optimistic UI
    const tempMsg = { role: 'user', content: textToSend, attachment: attachmentToSend?.data, timestamp: new Date().toISOString(), _id: Date.now() };
    setMessages(prev => [...prev, tempMsg]);

    try {
      let currentSessionId = activeSessionId;
      
      // Create session if it doesn't exist
      if (!currentSessionId) {
        const title = textToSend.trim().split(/\s+/).slice(0, 5).join(' ') || 'New Chat';
        const res = await createSession({ title });
        if (res.data?.success) {
          currentSessionId = res.data.data.sessionId;
          setActiveSessionId(currentSessionId);
          await fetchSessions();
        }
      }

      if (currentSessionId) {
        const res = await sendMessage(currentSessionId, { message: textToSend, attachment: attachmentToSend?.data, category: selectedCategory, customBudget: customBudget });
        if (res.data?.success) {
          const sessionRes = await getSession(currentSessionId);
          setMessages(Array.isArray(sessionRes.data?.data) ? sessionRes.data.data : []);
        }
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setMessages(prev => prev.filter(m => m._id !== tempMsg._id));
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDelete = (e, id) => {
    e.stopPropagation();
    setSessionToDelete(id);
    setShowDeleteModal(true);
  };

  const handleDeleteSession = async () => {
    if (!sessionToDelete) return;
    try {
      await deleteSession(sessionToDelete);
      if (activeSessionId === sessionToDelete) handleNewChat();
      fetchSessions();
      setShowDeleteModal(false);
      setSessionToDelete(null);
    } catch (err) {
      console.error('Error deleting session:', err);
    }
  };

  const handleExport = async () => {
    if (!activeSessionId) return;
    try {
      const sessionRes = await getSession(activeSessionId);
      const msgs = sessionRes.data?.data || [];
      const text = msgs.map(m => `[${m.role.toUpperCase()}]: ${m.content}`).join('\n\n');
      const blob = new Blob([text], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `chat_export.txt`);
      document.body.appendChild(link);
      link.click();
    } catch (err) {
      console.error('Error exporting session:', err);
    }
  };

  const formatMessageTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();
    
    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (isToday) return timeStr;
    
    return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} ${timeStr}`;
  };

  const formatHistoryTime = (dateStr) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    const now = new Date();
    const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    if (diffDays === 1) return t('yesterday') || 'Yesterday';
    if (diffDays < 30) return `${diffDays} ${t('daysAgo') || 'Days Ago'}`;
    return date.toLocaleDateString();
  };

  const handleCopy = (text) => {
    navigator.clipboard.writeText(text);
  };

  const handleReaction = (msgId, type) => {
    setMessages(prev => prev.map(m => {
      if (m._id === msgId) {
        return { ...m, reaction: m.reaction === type ? null : type };
      }
      return m;
    }));
  };

  const renderMessageContent = (content) => {
    const arabic = isArabic(content);
    const dir = arabic ? 'rtl' : 'ltr';
    const textAlign = arabic ? 'right' : 'left';

    let htmlContent = content;
    
    // Convert markdown bold to HTML strong tags
    htmlContent = htmlContent.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Convert markdown headings (###, ##, #) to styled HTML. 
    // We do this BEFORE replacing newlines so we can use ^ to match start of line.
    htmlContent = htmlContent.replace(/^###\s+(.*)$/gm, '<h4 style="color: rgb(99, 102, 241); margin-top: 16px; margin-bottom: 8px; font-weight: 700; font-size: 16px;">$1</h4>');
    htmlContent = htmlContent.replace(/^##\s+(.*)$/gm, '<h3 style="color: rgb(99, 102, 241); margin-top: 16px; margin-bottom: 8px; font-weight: 700; font-size: 18px;">$1</h3>');
    htmlContent = htmlContent.replace(/^#\s+(.*)$/gm, '<h2 style="color: rgb(79, 70, 229); margin-top: 16px; margin-bottom: 8px; font-weight: 700; font-size: 20px;">$1</h2>');

    // Replace remaining newlines with <br/>
    htmlContent = htmlContent.replace(/\n/g, '<br/>');

    const cleanHtml = DOMPurify.sanitize(htmlContent);
    return <div dir={dir} style={{ textAlign }} dangerouslySetInnerHTML={{ __html: cleanHtml }}></div>;
  };

  const groupSessions = () => {
    const today = [];
    const recent = [];
    const older = [];
    
    const now = new Date();
    sessions.forEach(s => {
      const date = new Date(s.updatedAt || s.createdAt);
      const diffDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) today.push(s);
      else if (diffDays < 7) recent.push(s);
      else older.push(s);
    });
    
    return { today, recent, older };
  };

  const { today, recent, older } = groupSessions();

  return (
    <div className="chat-page">
      <div className="chat-main">
        <div className="chat-main-header">
          <button className="chat-mobile-menu-btn" title="History" onClick={() => setIsSidebarOpen(true)}>
            <HistoryIcon />
          </button>
          <div className="chat-header-text">
            <h1 className="chat-welcome-title">
              Welcome, {userName} 👋
            </h1>
            <p className="chat-welcome-subtitle">
              {t('chatWelcomeSub', "I'm here to help you plan the perfect day within your budget.")}
            </p>
          </div>
          {activeSessionId && (
            <button className="chat-btn-export" onClick={handleExport}>
              <ExportIcon /> {t('exportChat', 'Export Chat')}
            </button>
          )}
        </div>

        <div className="chat-content-wrapper">
          <div className="chat-messages-container">
            {messages.map((msg, index) => {
              const isAI = msg.role === 'ai';
              return (
                <div key={msg._id || index} className={`chat-message-row ${isAI ? 'ai' : 'user'}`}>
                  <div
                    className={`chat-message-bubble ${isAI ? 'ai-bubble' : 'user-bubble'}`}
                    dir={isArabic(msg.content) ? 'rtl' : 'ltr'}
                    style={{ textAlign: isArabic(msg.content) ? 'right' : 'left' }}
                  >
                    {isAI && (
                      <div className="chat-ai-label">
                        <div className="chat-ai-avatar">
                          <img src="/images/IconBugget.png" alt="AI" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                        </div>
                        <span>BudgetWise AI</span>
                      </div>
                    )}
                    {msg.attachment && (
                      <div style={{ marginBottom: '12px' }}>
                        <img src={msg.attachment} alt="Attachment" style={{ maxWidth: '100%', maxHeight: '240px', borderRadius: '12px' }} />
                      </div>
                    )}
                    {renderMessageContent(msg.content)}
                    
                    {msg.recommendedActivities && msg.recommendedActivities.length > 0 && (
                      <div className="chat-activity-cards-container">
                        {msg.recommendedActivities.map((act) => {
                          const actImage = (act.image && !act.image.includes('loremflickr')) 
                            ? getImageUrl(act.image) 
                            : ((act.images && act.images.length > 0 && !act.images[0].includes('loremflickr')) 
                              ? getImageUrl(act.images[0]) 
                              : 'https://images.unsplash.com/photo-1538600863810-753bc6e0b7cb?auto=format&fit=crop&q=80&w=800');
                          return (
                            <div key={act._id} className="chat-activity-mini-card">
                              <img src={actImage} alt={act.title} className="chat-activity-mini-img" />
                              <div className="chat-activity-mini-info">
                                <h4>{act.title}</h4>
                                <div className="chat-activity-mini-meta">
                                  <span>{act.cost || act.price} EGP</span>
                                  <span>{act.city || act.location}</span>
                                </div>
                                <button onClick={() => navigate(`/user/activity/${act._id}`)}>
                                  {t('viewDetails') || 'View Details'}
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                    
                    <div className="chat-message-time" dir="ltr" style={{ textAlign: 'left' }}>
                      {formatMessageTime(msg.timestamp || msg.createdAt)}
                      {!isAI && <span style={{ marginLeft: '4px' }}>✓✓</span>}
                    </div>

                    {isAI && (
                      <div className="chat-message-actions">
                        <button className="chat-action-btn" title="Copy" onClick={() => handleCopy(msg.content)}><CopyIcon /></button>
                        <button 
                          className="chat-action-btn" 
                          title="Like" 
                          style={msg.reaction === 'like' ? { color: '#10b981' } : {}}
                          onClick={() => handleReaction(msg._id, 'like')}
                        >
                          <ThumbsUpIcon />
                        </button>
                        <button 
                          className="chat-action-btn" 
                          title="Dislike" 
                          style={msg.reaction === 'dislike' ? { color: '#ef4444' } : {}}
                          onClick={() => handleReaction(msg._id, 'dislike')}
                        >
                          <ThumbsDownIcon />
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
            {isLoading && (
              <div className="chat-message-row ai">
                <div className="chat-message-bubble ai-bubble" style={{ padding: '16px 20px' }}>
                  <div className="chat-ai-label">
                    <div className="chat-ai-avatar">
                      <img src="/images/IconBugget.png" alt="AI" style={{ width: '20px', height: '20px', objectFit: 'contain' }} />
                    </div>
                    <span>BudgetWise AI</span>
                  </div>
                  <div className="typing-indicator">
                    <span></span><span></span><span></span>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="chat-input-section">
          {messages.length === 0 && (
            <div className="chat-onboarding-panel">
              <div className="chat-onboarding-title">
                {t('chatSetupTitle', 'Let’s customize your plan')}
              </div>
              <div className="chat-onboarding-form">
                <select 
                  className="chat-onboarding-select"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <option value="">{t('anyCategory', 'Any Category')}</option>
                  <option value="technology">{t('technology', 'Technology')}</option>
                  <option value="food">{t('food', 'Food & Dining')}</option>
                  <option value="tourism">{t('tourism', 'Tourism & Travel')}</option>
                  <option value="healthcare">{t('healthcare', 'Healthcare')}</option>
                  <option value="education">{t('education', 'Education')}</option>
                  <option value="retail">{t('retail', 'Retail & Shopping')}</option>
                  <option value="entertainment">{t('entertainment', 'Entertainment')}</option>
                  <option value="sports">{t('sports', 'Sports')}</option>
                  <option value="finance">{t('finance', 'Finance')}</option>
                  <option value="manufacturing">{t('manufacturing', 'Manufacturing')}</option>
                  <option value="other">{t('other', 'Other')}</option>
                </select>
                <input 
                  type="number" 
                  className="chat-onboarding-input"
                  placeholder={t('budgetPlaceholder', 'Budget Amount (Leave empty for max)')}
                  value={customBudget}
                  onChange={(e) => setCustomBudget(e.target.value)}
                />
              </div>
            </div>
          )}
          {selectedFile && (
            <div className="chat-attachment-preview">
              <img src={selectedFile.data} alt="attachment" />
              <button className="chat-attachment-remove" onClick={() => setSelectedFile(null)}>✕</button>
            </div>
          )}
          <div className="chat-input-inner">
            <div 
              ref={inputRef}
              className="chat-editable-input"
              contentEditable={true}
              suppressContentEditableWarning={true}
              dir={isArabic(inputText) ? 'rtl' : 'ltr'}
              style={{ textAlign: isArabic(inputText) ? 'right' : 'left' }}
              onInput={(e) => setInputText(e.currentTarget.innerText)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              data-placeholder={t('chatPlaceholder', "Tell me your budget, mood, or location and I'll suggest a perfect plan")}
            />
            <div className="chat-input-controls">
              <div className="chat-control-group">
                <button className="chat-circle-btn" title="Attach file" onClick={() => fileInputRef.current?.click()}>
                  <PaperclipIcon />
                </button>
              </div>
              <div className="chat-control-group" style={{ display: 'flex', alignItems: 'center', gap: '8px', position: 'relative' }}>
                {messages.length === 0 && (
                  <div className="chat-voice-onboarding">
                    <div className="chat-voice-onboarding-text">
                      {i18n.language?.startsWith('ar') ? 'جرب التحدث' : 'Try recording'}
                    </div>
                    <svg width="60" height="24" viewBox="0 0 60 24" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: i18n.language?.startsWith('ar') ? 'scaleX(-1)' : 'none', marginTop: '-4px' }}>
                      <path d="M 10 20 Q 30 0 50 20" />
                      <polyline points="40 20 50 20 50 10" />
                    </svg>
                  </div>
                )}
                <button className={`chat-circle-btn ${isRecording ? 'recording' : ''}`} title="Voice message" onClick={handleMicClick}>
                  <MicIcon />
                </button>
                <button className="chat-lang-toggle-btn" onClick={() => setVoiceLang(prev => prev === 'ar-EG' ? 'en-US' : 'ar-EG')} title={t('toggleVoiceLang', 'Voice language')}>
                  <VoiceLangIcon />
                  {voiceLang === 'ar-EG' ? 'عربي' : 'EN'}
                </button>
                <button className="chat-send-btn" onClick={() => handleSend()} disabled={isLoading || !inputText.trim() && !selectedFile}>
                  <SendIcon />
                </button>
              </div>
            </div>
          </div>
          <input type="file" accept="image/*" ref={fileInputRef} style={{ display: 'none' }} onChange={handleFileChange} />
        </div>
      </div>

      <div className={`chat-sidebar-overlay ${isSidebarOpen ? 'open' : ''}`} onClick={() => setIsSidebarOpen(false)}></div>
      <aside className={`chat-sidebar ${isSidebarOpen ? 'open' : ''}`}>
        <div className="chat-sidebar-header">
          <h2 className="chat-sidebar-title">{t('chatHistory')}</h2>
          <button className="chat-new-btn" onClick={handleNewChat}>
            <PlusIcon /> {t('newChat')}
          </button>
        </div>

        <div className="chat-history-scroll">
          {today.length > 0 && (
            <div className="chat-history-group">
              <span className="chat-group-label">{t('today', 'Today')}</span>
              {today.map(session => (
                <div key={session._id} className={`chat-history-item ${activeSessionId === session._id ? 'active' : ''}`} onClick={() => {
                  setActiveSessionId(session._id);
                  loadSession(session._id);
                  setIsSidebarOpen(false);
                }}>
                  <div className="chat-item-icon"><ChatBubbleIcon /></div>
                  <div className="chat-item-content">
                    <span className="chat-item-name">{session.title || 'New Chat'}</span>
                  </div>
                  <span className="chat-item-time">{formatHistoryTime(session.updatedAt)}</span>
                  <button className="chat-item-delete" onClick={(e) => confirmDelete(e, session._id)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}

          {recent.length > 0 && (
            <div className="chat-history-group">
              <span className="chat-group-label">{t('lastWeek', '5 Days Ago')}</span>
              {recent.map(session => (
                <div key={session._id} className={`chat-history-item ${activeSessionId === session._id ? 'active' : ''}`} onClick={() => {
                  setActiveSessionId(session._id);
                  loadSession(session._id);
                  setIsSidebarOpen(false);
                }}>
                  <div className="chat-item-icon"><ChatBubbleIcon /></div>
                  <div className="chat-item-content">
                    <span className="chat-item-name">{session.title || 'New Chat'}</span>
                  </div>
                  <span className="chat-item-time">{formatHistoryTime(session.updatedAt)}</span>
                  <button className="chat-item-delete" onClick={(e) => confirmDelete(e, session._id)}>
                    <TrashIcon />
                  </button>
                </div>
              ))}
            </div>
          )}
          
          {older.length > 0 && (
             <div className="chat-history-group">
             <span className="chat-group-label">{t('older', '22 Days Ago')}</span>
             {older.map(session => (
               <div key={session._id} className={`chat-history-item ${activeSessionId === session._id ? 'active' : ''}`} onClick={() => {
                 setActiveSessionId(session._id);
                 loadSession(session._id);
                 setIsSidebarOpen(false);
               }}>
                 <div className="chat-item-icon"><ChatBubbleIcon /></div>
                 <div className="chat-item-content">
                   <span className="chat-item-name">{session.title || 'New Chat'}</span>
                 </div>
                 <span className="chat-item-time">{formatHistoryTime(session.updatedAt)}</span>
                 <button className="chat-item-delete" onClick={(e) => confirmDelete(e, session._id)}>
                   <TrashIcon />
                 </button>
               </div>
             ))}
           </div>
          )}
        </div>

        <button className="chat-view-all" onClick={() => setShowHistoryModal(true)}>
          {t('viewAllHistory') || 'View all history'}
          <ArrowRightIcon />
        </button>
      </aside>

      {/* ── Modals ── */}
      <Modal 
        isOpen={showDeleteModal} 
        onClose={() => setShowDeleteModal(false)}
        title={t('confirmDelete', 'Confirm Deletion')}
        actions={
          <>
            <button className="chat-modal-btn chat-modal-btn-cancel" onClick={() => setShowDeleteModal(false)}>{t('cancel', 'Cancel')}</button>
            <button className="chat-modal-btn chat-modal-btn-confirm" onClick={handleDeleteSession}>{t('yesDelete', 'Yes, Delete')}</button>
          </>
        }
      >
        {t('confirmDeleteSession', 'Are you sure you want to delete this chat session?')}
      </Modal>

      <Modal
        isOpen={showHistoryModal}
        onClose={() => setShowHistoryModal(false)}
        title={t('chatHistory', 'Chat History')}
        actions={<button className="chat-modal-btn chat-modal-btn-primary" onClick={() => setShowHistoryModal(false)}>{t('close', 'Close')}</button>}
      >
        <div style={{ maxHeight: '400px', overflowY: 'auto', paddingRight: '8px' }}>
          {sessions.map(session => (
            <div key={session._id} className={`chat-history-item ${activeSessionId === session._id ? 'active' : ''}`} onClick={() => {
              setActiveSessionId(session._id);
              loadSession(session._id);
              setShowHistoryModal(false);
            }}>
              <div className="chat-item-icon"><ChatBubbleIcon /></div>
              <div className="chat-item-content">
                <span className="chat-item-name">{session.title || 'New Chat'}</span>
              </div>
              <span className="chat-item-time">{formatHistoryTime(session.updatedAt)}</span>
              <button className="chat-item-delete" onClick={(e) => {
                confirmDelete(e, session._id);
                setShowHistoryModal(false);
              }}>
                <TrashIcon />
              </button>
            </div>
          ))}
        </div>
      </Modal>
    </div>
  );
};

export default Chat;
