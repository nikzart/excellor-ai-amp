const API_BASE = '/api';

// Chat with streaming
export async function* streamChat(messages, context = []) {
  const response = await fetch(`${API_BASE}/chat/stream`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ messages, context })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.choices?.[0]?.delta?.content) {
            yield parsed.choices[0].delta.content;
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}

// Upload and parse file
export async function uploadAndParseFile(file) {
  const formData = new FormData();
  formData.append('file', file);

  const response = await fetch(`${API_BASE}/file/parse`, {
    method: 'POST',
    body: formData
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'File upload failed');
  }

  return await response.json();
}

// Generate embeddings
export async function generateEmbeddings(texts) {
  const response = await fetch(`${API_BASE}/embedding/generate`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ texts })
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || 'Embedding generation failed');
  }

  const data = await response.json();
  return data.embeddings;
}

// Vision API for image analysis
export async function* analyzeImage(imageBase64, prompt) {
  const response = await fetch(`${API_BASE}/chat/vision`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ imageBase64, prompt })
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const reader = response.body.getReader();
  const decoder = new TextDecoder();

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');

    for (const line of lines) {
      if (line.startsWith('data: ')) {
        const data = line.slice(6);
        if (data === '[DONE]') {
          return;
        }

        try {
          const parsed = JSON.parse(data);
          if (parsed.error) {
            throw new Error(parsed.error);
          }
          if (parsed.choices?.[0]?.delta?.content) {
            yield parsed.choices[0].delta.content;
          }
        } catch (e) {
          console.error('Parse error:', e);
        }
      }
    }
  }
}

export default {
  streamChat,
  uploadAndParseFile,
  generateEmbeddings,
  analyzeImage
};
