const STORAGE_KEY = 'excellor_chat_history';
const MAX_CONVERSATIONS = 50;

// Get all conversations
export function getConversations() {
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error('Error loading conversations:', error);
    return [];
  }
}

// Save conversation
export function saveConversation(conversation) {
  try {
    const conversations = getConversations();

    // Check if conversation exists (update)
    const existingIndex = conversations.findIndex(c => c.id === conversation.id);

    if (existingIndex >= 0) {
      conversations[existingIndex] = {
        ...conversation,
        updatedAt: new Date().toISOString()
      };
    } else {
      // Add new conversation
      conversations.unshift({
        ...conversation,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      });

      // Limit number of stored conversations
      if (conversations.length > MAX_CONVERSATIONS) {
        conversations.splice(MAX_CONVERSATIONS);
      }
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(conversations));
    return conversation;
  } catch (error) {
    console.error('Error saving conversation:', error);
    throw error;
  }
}

// Delete conversation
export function deleteConversation(conversationId) {
  try {
    const conversations = getConversations();
    const filtered = conversations.filter(c => c.id !== conversationId);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
}

// Get conversation by ID
export function getConversationById(id) {
  const conversations = getConversations();
  return conversations.find(c => c.id === id);
}

// Create new conversation ID
export function generateConversationId() {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
}

// Clear all conversations
export function clearAllConversations() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (error) {
    console.error('Error clearing conversations:', error);
    throw error;
  }
}

export default {
  getConversations,
  saveConversation,
  deleteConversation,
  getConversationById,
  generateConversationId,
  clearAllConversations
};
