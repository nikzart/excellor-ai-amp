import express from 'express';

const router = express.Router();

router.post('/generate', async (req, res) => {
  try {
    const { texts } = req.body;

    if (!texts || !Array.isArray(texts)) {
      return res.status(400).json({ error: 'texts array is required' });
    }

    const embeddings = [];

    // Azure OpenAI REST API endpoint
    const endpoint = `${process.env.AZURE_OPENAI_ENDPOINT}/openai/deployments/${process.env.AZURE_OPENAI_EMBEDDING_DEPLOYMENT}/embeddings?api-version=${process.env.AZURE_API_VERSION}`;

    // Process in batches to avoid rate limits
    const batchSize = 16;
    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.AZURE_OPENAI_API_KEY
        },
        body: JSON.stringify({
          input: batch
        })
      });

      if (!response.ok) {
        const error = await response.text();
        throw new Error(`Azure API error: ${response.status} - ${error}`);
      }

      const data = await response.json();
      embeddings.push(...data.data.map(d => d.embedding));
    }

    res.json({ embeddings });
  } catch (error) {
    console.error('Embedding error:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;
