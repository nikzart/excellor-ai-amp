import express from 'express';
import multer from 'multer';
import mammoth from 'mammoth';
import PDFParser from 'pdf2json';

const router = express.Router();

// Configure multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// Helper function to parse PDF
function parsePDF(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser();

    pdfParser.on('pdfParser_dataError', errData => reject(errData.parserError));
    pdfParser.on('pdfParser_dataReady', pdfData => {
      try {
        const text = pdfData.Pages.map(page =>
          page.Texts.map(text =>
            text.R.map(r => decodeURIComponent(r.T)).join('')
          ).join(' ')
        ).join('\n');
        resolve(text);
      } catch (error) {
        reject(error);
      }
    });

    pdfParser.parseBuffer(buffer);
  });
}

router.post('/parse', upload.single('file'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const { originalname, mimetype, buffer } = req.file;
    let text = '';

    // Parse based on file type
    if (mimetype === 'application/pdf') {
      text = await parsePDF(buffer);
    } else if (mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
               mimetype === 'application/msword') {
      const result = await mammoth.extractRawText({ buffer });
      text = result.value;
    } else if (mimetype === 'text/plain') {
      text = buffer.toString('utf-8');
    } else {
      return res.status(400).json({ error: 'Unsupported file type' });
    }

    // Clean and chunk the text
    text = text.replace(/\r\n/g, '\n').replace(/\s+/g, ' ').trim();

    // Split into chunks (roughly 500 words per chunk)
    const chunks = chunkText(text, 500);

    res.json({
      filename: originalname,
      chunks,
      wordCount: text.split(/\s+/).length
    });
  } catch (error) {
    console.error('File parse error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Helper function to chunk text
function chunkText(text, wordsPerChunk = 500) {
  const words = text.split(/\s+/);
  const chunks = [];

  for (let i = 0; i < words.length; i += wordsPerChunk) {
    const chunk = words.slice(i, i + wordsPerChunk).join(' ');
    if (chunk.trim()) {
      chunks.push(chunk);
    }
  }

  return chunks;
}

export default router;
