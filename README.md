# Excellor AI - UPSC Preparation Assistant

A fully-featured, Claude AI-inspired chat application designed specifically for UPSC preparation with RAG (Retrieval-Augmented Generation) capabilities.

## Features

✨ **Core Features**
- 💬 Beautiful chat interface with pastel colors inspired by Claude AI
- 📚 Client-side vector storage using IndexedDB for document memory
- 📄 Support for PDF, DOC, DOCX, and TXT files
- 🖼️ Image upload and analysis in chat
- 🧠 RAG functionality with Azure OpenAI embeddings
- 💾 Persistent chat history with localStorage
- ⚡ Real-time streaming responses
- 🎨 Smooth animations and modern UI/UX

## Tech Stack

**Frontend:**
- React 19 with Vite
- Dexie.js for IndexedDB vector storage
- Framer Motion for animations
- Lucide React for icons
- React Markdown for message formatting
- React Syntax Highlighter for code blocks

**Backend:**
- Node.js with Express
- Azure OpenAI for embeddings
- OpenAI-compatible API for chat
- Multer for file uploads
- PDF-parse, Mammoth for document processing

## Installation

### Prerequisites
- Node.js (v18 or higher)
- npm or yarn

### Setup

1. **Install root dependencies:**
```bash
npm install
```

2. **Install client dependencies:**
```bash
cd client
npm install
cd ..
```

3. **Environment variables are already configured in `.env`**

## Running the Application

### Development Mode

Run both frontend and backend concurrently:

```bash
npm run dev
```

This will start:
- Backend server on `http://localhost:3001`
- Frontend dev server on `http://localhost:5173`

### Individual Services

**Backend only:**
```bash
npm run server
```

**Frontend only:**
```bash
npm run client
```

## Usage

### Starting a Conversation
1. Open the application at `http://localhost:5173`
2. You'll see the welcome message from Excellor AI
3. Type your UPSC-related question and press Enter or click Send

### Uploading Documents
1. Click "Manage Memory" button in the sidebar
2. Click "Choose File" to upload PDF, DOC, DOCX, or TXT files
3. Files are processed, chunked, and embedded automatically
4. Documents are stored in your browser's IndexedDB

### Using Images
1. Click "Add Image" button above the input field
2. Select an image file
3. Type your question about the image
4. The AI will analyze and respond

### Managing Chat History
- All conversations are automatically saved
- Click on any conversation in the sidebar to view it
- Click "New Chat" to start a fresh conversation
- Hover over a conversation and click X to delete it

## Architecture

### Vector Storage
- Documents are chunked into ~500 word segments
- Chunks are embedded using Azure OpenAI's text-embedding-3-large model
- Embeddings stored in browser's IndexedDB (client-side)
- Cosine similarity search for relevant context retrieval

### RAG Pipeline
1. User query is embedded
2. Top 5 similar chunks retrieved from vector store
3. Context injected into system prompt
4. Streaming response generated with context awareness

### API Endpoints

**Backend Routes:**
- `POST /api/chat/stream` - Streaming chat with RAG context
- `POST /api/chat/vision` - Image analysis endpoint
- `POST /api/file/parse` - File upload and parsing
- `POST /api/embedding/generate` - Generate embeddings

## API Configuration

### Chat API
- **Endpoint:** `https://8qall2o4vhgof70e.ai-plugin.io/chat/completions`
- **Format:** OpenAI-compatible
- **Note:** Only supports streaming mode (`stream: true`)

### Azure OpenAI Embeddings
- **Model:** text-embedding-3-large
- **Endpoint:** `https://xandar.cognitiveservices.azure.com/`
- **API Version:** 2024-02-01

## Features Checklist

✅ Claude-like UI with pastel color scheme
✅ Client-side vector storage (IndexedDB)
✅ File upload (PDF, DOC, DOCX, TXT)
✅ Document memory management
✅ Add/remove files from memory
✅ Image support in chat
✅ Azure OpenAI embeddings
✅ RAG functionality
✅ Chat history persistence
✅ Streaming responses
✅ Markdown rendering
✅ Code syntax highlighting
✅ Smooth animations
✅ Responsive design

## Browser Compatibility

- Chrome/Edge (recommended)
- Firefox
- Safari (limited IndexedDB performance)

## Storage

- **Vector Database:** IndexedDB (client-side, unlimited*)
- **Chat History:** localStorage (5-10MB limit)
- **Max Conversations:** 50 (auto-pruned)

*IndexedDB limits vary by browser but typically support several GB

## Development

### Project Structure
```
excellor/
├── server/
│   ├── index.js           # Express server
│   └── routes/
│       ├── chat.js        # Chat endpoints
│       ├── embedding.js   # Embedding generation
│       └── file.js        # File processing
├── client/
│   └── src/
│       ├── App.jsx        # Main component
│       ├── App.css        # Styles
│       ├── services/
│       │   ├── api.js           # API client
│       │   └── chatHistory.js   # localStorage manager
│       └── db/
│           └── vectorStore.js   # IndexedDB/Dexie
├── .env               # API credentials
└── package.json       # Root dependencies
```

## Troubleshooting

### Backend won't start
- Ensure port 3001 is available
- Check `.env` file exists with correct credentials

### Frontend can't connect to backend
- Verify backend is running on port 3001
- Check CORS settings if accessing from different origin

### File upload fails
- Check file size (limit: 10MB)
- Ensure file format is supported (PDF, DOC, DOCX, TXT)
- Verify backend has necessary parsing dependencies installed

### Embeddings not working
- Verify Azure OpenAI credentials in `.env`
- Check network connectivity
- Ensure embedding deployment exists

## Security Notes

⚠️ **Important:**
- API keys are stored in `.env` (git-ignored)
- All data stored client-side (IndexedDB, localStorage)
- No data sent to third parties except Azure OpenAI for embeddings
- For production, move API keys to server-side only

## License

MIT

## Contributing

This is a demonstration project. Feel free to fork and modify for your needs.

## Support

For issues or questions, please refer to the API documentation or check the browser console for error messages.

---

**Built with ❤️ for UPSC aspirants**
