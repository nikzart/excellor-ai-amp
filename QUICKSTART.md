# Quick Start Guide - Excellor AI

## 🚀 Running the Application

### Option 1: Run Everything (Recommended)
```bash
npm run dev
```

This starts both the backend and frontend servers:
- Backend: http://localhost:3001
- Frontend: http://localhost:5173

### Option 2: Run Separately

**Terminal 1 - Backend:**
```bash
npm run server
```

**Terminal 2 - Frontend:**
```bash
cd client
npm run dev
```

## 📝 First Time Setup Checklist

✅ Dependencies installed
✅ `.env` file configured with API keys
✅ Both servers start without errors

## 🎯 Testing the Application

### 1. Basic Chat Test
1. Open http://localhost:5173
2. You should see the Excellor AI welcome message
3. Type: "What are the main topics in UPSC General Studies?"
4. Press Enter and watch the streaming response

### 2. Document Upload Test
1. Click "Manage Memory" in the sidebar
2. Click "Choose File"
3. Upload a PDF or TXT file about UPSC topics
4. Wait for "Successfully uploaded" message
5. Ask a question related to the document content
6. The AI should use the document context in its response

### 3. Image Test
1. Click "Add Image" button
2. Select any image (e.g., a map, diagram, or screenshot)
3. Type: "Describe this image"
4. Send and view the AI's analysis

### 4. Chat History Test
1. Create a new chat with some messages
2. Click "New Chat" to start another conversation
3. Click on the first conversation in the sidebar
4. Verify messages are preserved

## 🔧 Troubleshooting

### Port Already in Use
```bash
# Kill process on port 3001
lsof -ti:3001 | xargs kill -9

# Kill process on port 5173
lsof -ti:5173 | xargs kill -9
```

### Backend Not Responding
- Check if `.env` file exists in root directory
- Verify API keys are correct
- Check terminal for error messages

### Frontend Can't Connect
- Ensure backend is running first
- Check browser console for errors
- Verify proxy settings in `client/vite.config.js`

### File Upload Fails
- Check file size (< 10MB)
- Ensure file format is supported
- Check browser console for detailed error

## 📊 Expected Response Times

- **Chat response**: 1-3 seconds (streaming)
- **File processing**: 5-15 seconds (depending on size)
- **Embedding generation**: 2-5 seconds per file
- **Image analysis**: 2-4 seconds

## 🎨 Features to Try

1. **Markdown Formatting**: Ask for a comparison table or bullet points
2. **Code Examples**: Ask "Show me a Python program"
3. **Multi-turn Conversation**: Have a back-and-forth discussion
4. **RAG**: Upload a PDF and ask specific questions about it
5. **Math**: Ask mathematical questions (supports LaTeX)

## ✨ Pro Tips

- Use Shift+Enter for new lines in the input box
- Upload multiple documents for broader context
- Delete old conversations to keep sidebar clean
- Documents persist in browser storage
- All data is stored client-side (private)

## 🆘 Need Help?

Check these files for more info:
- `README.md` - Full documentation
- `API_TEST_RESULTS.md` - API configuration details
- `.env` - API credentials (don't share!)

## 🎉 You're All Set!

Excellor AI is now ready to help with your UPSC preparation journey.
