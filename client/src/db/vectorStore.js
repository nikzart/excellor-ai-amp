import Dexie from 'dexie';

// Initialize Dexie database
export const db = new Dexie('ExcellorDB');

db.version(1).stores({
  documents: '++id, filename, uploadDate',
  chunks: '++id, documentId, chunkIndex, content',
  embeddings: '++id, chunkId, vector'
});

// Vector similarity calculation (cosine similarity)
export function cosineSimilarity(vecA, vecB) {
  if (!vecA || !vecB || vecA.length !== vecB.length) return 0;

  let dotProduct = 0;
  let magnitudeA = 0;
  let magnitudeB = 0;

  for (let i = 0; i < vecA.length; i++) {
    dotProduct += vecA[i] * vecB[i];
    magnitudeA += vecA[i] * vecA[i];
    magnitudeB += vecB[i] * vecB[i];
  }

  magnitudeA = Math.sqrt(magnitudeA);
  magnitudeB = Math.sqrt(magnitudeB);

  if (magnitudeA === 0 || magnitudeB === 0) return 0;

  return dotProduct / (magnitudeA * magnitudeB);
}

// Add document with chunks and embeddings
export async function addDocument(filename, chunks, embeddings) {
  try {
    const documentId = await db.documents.add({
      filename,
      uploadDate: new Date(),
      chunkCount: chunks.length
    });

    const chunkRecords = chunks.map((content, index) => ({
      documentId,
      chunkIndex: index,
      content
    }));

    const chunkIds = await db.chunks.bulkAdd(chunkRecords, { allKeys: true });

    const embeddingRecords = embeddings.map((vector, index) => ({
      chunkId: chunkIds[index],
      vector
    }));

    await db.embeddings.bulkAdd(embeddingRecords);

    return documentId;
  } catch (error) {
    console.error('Error adding document:', error);
    throw error;
  }
}

// Remove document and all related data
export async function removeDocument(documentId) {
  try {
    const chunks = await db.chunks.where('documentId').equals(documentId).toArray();
    const chunkIds = chunks.map(c => c.id);

    await db.embeddings.where('chunkId').anyOf(chunkIds).delete();
    await db.chunks.where('documentId').equals(documentId).delete();
    await db.documents.delete(documentId);
  } catch (error) {
    console.error('Error removing document:', error);
    throw error;
  }
}

// Get all documents
export async function getAllDocuments() {
  return await db.documents.toArray();
}

// Search for similar chunks using vector similarity
export async function searchSimilarChunks(queryEmbedding, topK = 5) {
  try {
    const allEmbeddings = await db.embeddings.toArray();

    if (allEmbeddings.length === 0) {
      return [];
    }

    // Calculate similarity scores
    const scores = allEmbeddings.map(emb => ({
      chunkId: emb.chunkId,
      similarity: cosineSimilarity(queryEmbedding, emb.vector)
    }));

    // Sort by similarity and get top K
    scores.sort((a, b) => b.similarity - a.similarity);
    const topScores = scores.slice(0, topK);

    // Fetch the actual chunks
    const results = [];
    for (const score of topScores) {
      if (score.similarity > 0.3) { // Minimum threshold
        const chunk = await db.chunks.get(score.chunkId);
        if (chunk) {
          results.push({
            content: chunk.content,
            similarity: score.similarity,
            chunkId: chunk.id,
            documentId: chunk.documentId
          });
        }
      }
    }

    return results;
  } catch (error) {
    console.error('Error searching chunks:', error);
    return [];
  }
}

// Clear all data
export async function clearAllData() {
  await db.embeddings.clear();
  await db.chunks.clear();
  await db.documents.clear();
}

export default db;
