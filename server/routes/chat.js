import express from 'express';

const router = express.Router();

router.post('/stream', async (req, res) => {
  const { messages, context } = req.body;

  // Set headers for SSE
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    // Add context from RAG if available
    const enhancedMessages = [...messages];

    const baseSystemPrompt = `You are Excellor AI, a dedicated UPSC preparation assistant.

FORMATTING GUIDELINES - STRICTLY FOLLOW:
1. Use proper markdown syntax consistently
2. Use ## for main headings, ### for subheadings
3. Use **text** for bold (ensure spaces before/after asterisks)
4. Use - or * for bullet points (choose one and stick to it)
5. Use 1. 2. 3. for numbered lists
6. Ensure blank lines between sections
7. When including images, use proper markdown: ![alt text](url)
8. Use horizontal rules (---) to separate major sections
9. Format tables properly with | separators
10. Use > for blockquotes

CONTENT GUIDELINES:
- Provide accurate, fact-checked information for UPSC/IAS preparation
- Structure explanations clearly with headings and subheadings
- Use bullet points for lists, not mixed formats
- Include examples and context where relevant
- Maintain professional, educational tone`;

    if (context && context.length > 0) {
      const contextText = context.map(c => c.content).join('\n\n');
      enhancedMessages.unshift({
        role: 'system',
        content: `${baseSystemPrompt}\n\nCONTEXT FROM UPLOADED DOCUMENTS:\n${contextText}\n\nUse this context to answer the user's question if relevant.`
      });
    } else {
      enhancedMessages.unshift({
        role: 'system',
        content: baseSystemPrompt
      });
    }

    const response = await fetch(process.env.CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHAT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: enhancedMessages,
        stream: true,
        max_tokens: 4000
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
            res.write(`data: [DONE]\n\n`);
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            res.write(`data: ${JSON.stringify(parsed)}\n\n`);
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('Chat error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

// Vision endpoint for image analysis
router.post('/vision', async (req, res) => {
  const { imageUrl, imageBase64, prompt } = req.body;

  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');

  try {
    const imageContent = imageBase64
      ? { type: 'image_url', image_url: { url: `data:image/jpeg;base64,${imageBase64}` } }
      : { type: 'image_url', image_url: { url: imageUrl } };

    const messages = [
      {
        role: 'user',
        content: [
          { type: 'text', text: prompt || 'Describe this image in detail.' },
          imageContent
        ]
      }
    ];

    const response = await fetch(process.env.CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.CHAT_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages,
        stream: true,
        max_tokens: 2000
      })
    });

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
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
            res.write(`data: [DONE]\n\n`);
            continue;
          }

          try {
            const parsed = JSON.parse(data);
            res.write(`data: ${JSON.stringify(parsed)}\n\n`);
          } catch (e) {
            // Skip invalid JSON
          }
        }
      }
    }

    res.end();
  } catch (error) {
    console.error('Vision error:', error);
    res.write(`data: ${JSON.stringify({ error: error.message })}\n\n`);
    res.end();
  }
});

export default router;
