import { useState, useEffect, useRef } from 'react';
import { MessageSquare, Plus, Database, Send, Image as ImageIcon, X, Upload, FileText, Trash2, Sparkles } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import remarkGfm from 'remark-gfm';
import './App.css';
import { streamChat, uploadAndParseFile, generateEmbeddings } from './services/api';
import { addDocument, removeDocument, getAllDocuments, searchSimilarChunks } from './db/vectorStore';
import {
  getConversations,
  saveConversation,
  deleteConversation,
  generateConversationId
} from './services/chatHistory';

const WELCOME_MESSAGE = `Hello! I'm Excellor AI, your dedicated companion for UPSC preparation and general knowledge queries. My role is to provide you with accurate, up-to-date, and fact-checked information—whether it's about static syllabus topics, current affairs, historical events, or analytical insights essential for your IAS journey.

I always rely on trusted sources and verified tools, ensuring every answer is reliable and relevant to UPSC standards. You can expect structured explanations, contextual details, and conceptual clarity without any guesswork or fabrication.

Feel free to ask me anything—from GS topics and current events to exam strategies—and let's make your preparation both efficient and insightful!`;

function App() {
  const [conversations, setConversations] = useState([]);
  const [currentConversationId, setCurrentConversationId] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showMemoryModal, setShowMemoryModal] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [uploadingFile, setUploadingFile] = useState(false);
  const [selectedImage, setSelectedImage] = useState(null);
  const [viewImage, setViewImage] = useState(null);

  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const imageInputRef = useRef(null);

  // Load conversations and documents on mount
  useEffect(() => {
    loadConversations();
    loadDocuments();
  }, []);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Save conversation whenever messages change
  useEffect(() => {
    if (currentConversationId && messages.length > 0) {
      const title = messages[0]?.content?.slice(0, 50) || 'New Conversation';
      saveConversation({
        id: currentConversationId,
        title,
        messages
      });
      loadConversations();
    }
  }, [messages, currentConversationId]);

  const loadConversations = () => {
    const convs = getConversations();
    setConversations(convs);
  };

  const loadDocuments = async () => {
    const docs = await getAllDocuments();
    setDocuments(docs);
  };

  const startNewConversation = () => {
    setCurrentConversationId(null);
    setMessages([]);
    setSelectedImage(null);
  };

  const switchConversation = (convId) => {
    const conv = conversations.find(c => c.id === convId);
    if (conv) {
      setCurrentConversationId(conv.id);
      setMessages(conv.messages || []);
      setSelectedImage(null);
    }
  };

  const handleDeleteConversation = (e, convId) => {
    e.stopPropagation();
    deleteConversation(convId);
    loadConversations();
    if (currentConversationId === convId) {
      startNewConversation();
    }
  };

  const handleSendMessage = async () => {
    if ((!input.trim() && !selectedImage) || isLoading) return;

    // Create conversation if doesn't exist
    if (!currentConversationId) {
      setCurrentConversationId(generateConversationId());
    }

    const userMessage = {
      role: 'user',
      content: input,
      image: selectedImage
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    const tempImage = selectedImage;
    setSelectedImage(null);
    setIsLoading(true);

    try {
      // Perform RAG search if we have documents
      let context = [];
      if (documents.length > 0 && input.trim()) {
        const queryEmbedding = await generateEmbeddings([input]);
        context = await searchSimilarChunks(queryEmbedding[0], 5);
      }

      // Prepare messages for API
      const apiMessages = messages
        .filter(m => !m.image) // Exclude image messages from context
        .map(m => ({ role: m.role, content: m.content }));

      apiMessages.push({ role: 'user', content: input });

      // Stream response
      let assistantMessage = { role: 'assistant', content: '' };
      setMessages(prev => [...prev, assistantMessage]);

      for await (const chunk of streamChat(apiMessages, context)) {
        assistantMessage.content += chunk;
        setMessages(prev => {
          const newMessages = [...prev];
          newMessages[newMessages.length - 1] = { ...assistantMessage };
          return newMessages;
        });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Error: ${error.message}` }
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (file) => {
    if (!file) return;

    setUploadingFile(true);
    try {
      // Parse file
      const parsed = await uploadAndParseFile(file);

      // Generate embeddings
      const embeddings = await generateEmbeddings(parsed.chunks);

      // Store in vector database
      await addDocument(parsed.filename, parsed.chunks, embeddings);

      // Reload documents
      await loadDocuments();

      alert(`Successfully uploaded and processed: ${parsed.filename}`);
    } catch (error) {
      console.error('Upload error:', error);
      alert(`Upload failed: ${error.message}`);
    } finally {
      setUploadingFile(false);
    }
  };

  const handleRemoveDocument = async (docId) => {
    if (confirm('Are you sure you want to remove this document?')) {
      await removeDocument(docId);
      await loadDocuments();
    }
  };

  const handleImageSelect = (e) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setSelectedImage(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="app">
      {/* Sidebar */}
      <div className="sidebar">
        <div className="sidebar-header">
          <div className="sidebar-brand">
            <div className="brand-icon">
              <Sparkles size={18} />
            </div>
            <span>Excellor AI</span>
          </div>
          <button className="new-chat-btn" onClick={startNewConversation}>
            <Plus size={16} />
            New Chat
          </button>
        </div>

        <div className="conversations-list">
          {conversations.map(conv => (
            <div
              key={conv.id}
              className={`conversation-item ${currentConversationId === conv.id ? 'active' : ''}`}
              onClick={() => switchConversation(conv.id)}
            >
              <MessageSquare size={16} />
              <span className="conversation-title">{conv.title}</span>
              <button
                className="delete-btn"
                onClick={(e) => handleDeleteConversation(e, conv.id)}
              >
                <X size={16} />
              </button>
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <button className="memory-btn" onClick={() => setShowMemoryModal(true)}>
            <Database size={16} />
            Manage Memory ({documents.length})
          </button>
        </div>
      </div>

      {/* Main Content */}
      <div className="main-content">
        <div className="chat-header">
          <div className="chat-title">Excellor AI - UPSC Preparation Assistant</div>
        </div>

        <div className="messages-container">
          {messages.length === 0 ? (
            <div className="welcome-message">
              <h1>Welcome to Excellor AI</h1>
              {WELCOME_MESSAGE.split('\n\n').map((para, i) => (
                <p key={i}>{para}</p>
              ))}
            </div>
          ) : (
            messages.map((message, index) => (
              <div key={index} className={`message ${message.role}`}>
                <div className="message-avatar">
                  {message.role === 'user' ? 'U' : 'E'}
                </div>
                <div className="message-content">
                  {message.image && (
                    <img
                      src={message.image}
                      alt="Uploaded"
                      className="message-image"
                      onClick={() => setViewImage(message.image)}
                      style={{ cursor: 'pointer' }}
                      title="Click to view full size"
                    />
                  )}
                  <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      },
                      img({ node, ...props }) {
                        return (
                          <img
                            {...props}
                            className="message-image"
                            alt={props.alt || 'Image'}
                            onClick={() => setViewImage(props.src)}
                            style={{ cursor: 'pointer' }}
                            title="Click to view full size"
                          />
                        );
                      }
                    }}
                  >
                    {message.content}
                  </ReactMarkdown>
                </div>
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-area">
          <div className="input-wrapper">
            <div className="input-actions">
              <input
                type="file"
                ref={imageInputRef}
                onChange={handleImageSelect}
                accept="image/*"
                style={{ display: 'none' }}
              />
              <button className="input-btn" onClick={() => imageInputRef.current?.click()}>
                <ImageIcon size={14} />
                Add Image
              </button>
              {selectedImage && (
                <button className="input-btn" onClick={() => setSelectedImage(null)}>
                  <X size={14} />
                  Remove Image
                </button>
              )}
            </div>

            <div className="input-container">
              <textarea
                className="message-input"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask anything about UPSC preparation..."
                disabled={isLoading}
              />
              <button
                className="send-btn"
                onClick={handleSendMessage}
                disabled={isLoading || (!input.trim() && !selectedImage)}
              >
                {isLoading ? (
                  <div className="spinner" />
                ) : (
                  <>
                    <Send size={16} />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Memory Modal */}
      {showMemoryModal && (
        <div className="modal-overlay" onClick={() => setShowMemoryModal(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">Memory Management</h2>
              <button className="close-btn" onClick={() => setShowMemoryModal(false)}>
                <X />
              </button>
            </div>

            <div className="upload-area">
              <div className="upload-icon">
                <Upload />
              </div>
              <h3>Upload Documents</h3>
              <p>Supported: PDF, DOC, DOCX, TXT</p>
              <input
                type="file"
                ref={fileInputRef}
                onChange={(e) => handleFileUpload(e.target.files[0])}
                accept=".pdf,.doc,.docx,.txt"
                style={{ display: 'none' }}
              />
              <button
                className="new-chat-btn"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFile}
              >
                {uploadingFile ? (
                  <>
                    <div className="spinner" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <FileText size={16} />
                    Choose File
                  </>
                )}
              </button>
            </div>

            <div className="documents-list">
              <h3>Uploaded Documents ({documents.length})</h3>
              {documents.map(doc => (
                <div key={doc.id} className="document-item">
                  <div className="document-info">
                    <FileText size={20} />
                    <div>
                      <div className="document-name">{doc.filename}</div>
                      <div className="document-meta">
                        {doc.chunkCount} chunks • {new Date(doc.uploadDate).toLocaleDateString()}
                      </div>
                    </div>
                  </div>
                  <button
                    className="remove-doc-btn"
                    onClick={() => handleRemoveDocument(doc.id)}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>
                  No documents uploaded yet
                </p>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Image Viewer Modal */}
      {viewImage && (
        <div className="modal-overlay" onClick={() => setViewImage(null)}>
          <div className="image-viewer-modal" onClick={(e) => e.stopPropagation()}>
            <button className="close-btn" onClick={() => setViewImage(null)}>
              <X size={24} />
            </button>
            <img src={viewImage} alt="Full size" className="full-size-image" />
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
