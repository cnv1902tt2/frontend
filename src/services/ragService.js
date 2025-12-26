// RAG Service - Retrieval-Augmented Generation cho SimpleBIM
// Features: Load dataset, semantic search, kiểm tra cache, few-shot prompting
// Author: SimpleBIM Team
// Last updated: 2025-12-26
// Purpose: Hướng dẫn người dùng phát triển C# trong Visual Studio 2022, build, obfuscate, release GitHub

import Fuse from 'fuse.js';
import ragData from '../data/ragData';

// ==================== Constants ====================

const CACHE_SIMILARITY_THRESHOLD = parseFloat(process.env.REACT_APP_CACHE_SIMILARITY_THRESHOLD) || 0.8;
const NUM_FEWSHOT_EXAMPLES = parseInt(process.env.REACT_APP_NUMBER_QUESTION_ANSWER) || 5;
const TOP_K_CHUNKS = 5;


// ==================== RAG Dataset ====================

let ragDataset = null;
let fuseIndex = null;

/**
 * Load RAG dataset từ JS file hoặc JSON file (backward compatible)
 * @returns {Promise<Object>} Dataset object
 */
export const loadRagDataset = async () => {
  if (ragDataset) return ragDataset;
  
  try {
    // Sử dụng data từ JS file trước (preferred)
    if (ragData && ragData.chunks && ragData.chunks.length > 0) {
      ragDataset = {
        chunks: ragData.chunks,
        few_shot_examples: ragData.fewShotExamples,
        metadata: ragData.metadata
      };
      
      // Initialize Fuse.js index
      fuseIndex = new Fuse(ragDataset.chunks, {
        keys: [
          { name: 'title', weight: 0.3 },
          { name: 'content', weight: 0.5 },
          { name: 'keywords', weight: 0.2 }
        ],
        threshold: 0.4,
        includeScore: true,
        minMatchCharLength: 2
      });
      
      console.log(`[RAG] Loaded ${ragDataset.chunks.length} chunks from JS data`);
      return ragDataset;
    }
    
    // Fallback to JSON file if JS data not available
    const response = await fetch(process.env.PUBLIC_URL + '/data/rag_dataset.json');
    if (!response.ok) throw new Error('Failed to load RAG dataset');
    
    ragDataset = await response.json();
    
    // Initialize Fuse.js index
    fuseIndex = new Fuse(ragDataset.chunks, {
      keys: [
        { name: 'title', weight: 0.3 },
        { name: 'content', weight: 0.5 },
        { name: 'keywords', weight: 0.2 }
      ],
      threshold: 0.4,
      includeScore: true,
      minMatchCharLength: 2
    });
    
    console.log(`[RAG] Loaded ${ragDataset.chunks.length} chunks from JSON`);
    return ragDataset;
  } catch (error) {
    console.error('[RAG] Error loading dataset:', error);
    return null;
  }
};


// ==================== Query Processing ====================

/**
 * Normalize query để so sánh
 * @param {string} query - Query gốc
 * @returns {string} Normalized query
 */
export const normalizeQuery = (query) => {
  let normalized = query.toLowerCase().trim();
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ');
  // Remove trailing punctuation
  normalized = normalized.replace(/[?.!]+$/, '');
  return normalized;
};


/**
 * Tính Jaccard similarity giữa 2 queries
 * @param {string} query1 
 * @param {string} query2 
 * @returns {number} Similarity score (0-1)
 */
export const calculateSimilarity = (query1, query2) => {
  const words1 = new Set(normalizeQuery(query1).split(' '));
  const words2 = new Set(normalizeQuery(query2).split(' '));
  
  if (words1.size === 0 || words2.size === 0) return 0;
  
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return intersection.size / union.size;
};


// ==================== Retrieval ====================

/**
 * Retrieve relevant chunks cho query
 * @param {string} query - User query
 * @param {number} topK - Số chunks trả về
 * @returns {Array} Array of chunks với scores
 */
export const retrieveChunks = async (query, topK = TOP_K_CHUNKS) => {
  if (!fuseIndex) {
    await loadRagDataset();
  }
  
  if (!fuseIndex) {
    console.error('[RAG] Fuse index not initialized');
    return [];
  }
  
  const results = fuseIndex.search(query);
  
  return results.slice(0, topK).map(result => ({
    chunk: result.item,
    score: 1 - (result.score || 0), // Convert to similarity (higher = better)
    id: result.item.id
  }));
};


/**
 * Build context string từ chunks
 * @param {Array} chunks - Retrieved chunks
 * @returns {string} Context string
 */
export const buildContext = (chunks) => {
  if (!chunks || chunks.length === 0) {
    return 'Không tìm thấy thông tin trực tiếp liên quan trong tài liệu.';
  }
  
  return chunks.map((item, idx) => {
    const { chunk, score } = item;
    return `[${idx + 1}] **${chunk.title}** (relevance: ${Math.round(score * 100)}%)\n${chunk.content}`;
  }).join('\n\n---\n\n');
};


// ==================== Few-shot Examples ====================

/**
 * Get few-shot examples từ dataset hoặc defaults
 * @param {number} count - Số examples
 * @returns {Array} Array of {question, answer}
 */
export const getFewShotExamples = async (count = NUM_FEWSHOT_EXAMPLES) => {
  if (!ragDataset) {
    await loadRagDataset();
  }
  
  if (ragDataset?.few_shot_examples) {
    return ragDataset.few_shot_examples.slice(0, count);
  }
  
  // Default examples nếu không load được dataset
  return [
    {
      question: "Làm thế nào để đăng nhập vào hệ thống?",
      answer: "Truy cập /login, nhập username/password, hệ thống sử dụng AuthProvider để xử lý JWT token."
    },
    {
      question: "Quản lý key ở đâu?",
      answer: "Trang /admin/keys sử dụng KeyManagement component, fetch từ backend API /keys/*."
    },
    {
      question: "Cách cập nhật phiên bản?",
      answer: "Sử dụng UpdateManagement tại /admin/updates, tạo version với download URL và SHA256."
    },
    {
      question: "Hướng dẫn sử dụng search?",
      answer: "Trang /admin/search hỗ trợ query text, highlight kết quả, responsive trên mobile."
    },
    {
      question: "PWA hoạt động như thế nào?",
      answer: "Manifest.json và service-worker.js cache assets để app hoạt động offline cơ bản."
    }
  ].slice(0, count);
};


/**
 * Build few-shot prompt string
 * @param {Array} examples - Few-shot examples
 * @returns {string} Formatted examples string
 */
export const buildFewShotPrompt = (examples) => {
  return examples.map((ex, i) => 
    `Ví dụ ${i + 1}:\nCâu hỏi: ${ex.question}\nTrả lời: ${ex.answer}`
  ).join('\n\n');
};


// ==================== RAG Pipeline ====================

/**
 * Full RAG pipeline: retrieve + build prompt
 * @param {string} query - User query
 * @param {Array} chatHistory - Recent chat messages for context
 * @returns {Object} { context, fewShotPrompt, sources }
 */
export const runRagPipeline = async (query, chatHistory = []) => {
  // 1. Load dataset nếu chưa có
  await loadRagDataset();
  
  // 2. Retrieve relevant chunks
  const retrievedChunks = await retrieveChunks(query, TOP_K_CHUNKS);
  const context = buildContext(retrievedChunks);
  
  // 3. Get few-shot examples
  // Ưu tiên chat history gần nhất, fallback to static examples
  let fewShotExamples;
  if (chatHistory && chatHistory.length >= 2) {
    // Lấy N cặp Q&A gần nhất từ history
    fewShotExamples = [];
    for (let i = chatHistory.length - 1; i >= 0 && fewShotExamples.length < NUM_FEWSHOT_EXAMPLES; i--) {
      const msg = chatHistory[i];
      if (msg.role === 'assistant' && i > 0 && chatHistory[i-1].role === 'user') {
        fewShotExamples.unshift({
          question: chatHistory[i-1].content,
          answer: msg.content.substring(0, 300) // Truncate để không quá dài
        });
      }
    }
    // Bổ sung từ static examples nếu thiếu
    if (fewShotExamples.length < NUM_FEWSHOT_EXAMPLES) {
      const staticExamples = await getFewShotExamples(NUM_FEWSHOT_EXAMPLES - fewShotExamples.length);
      fewShotExamples = [...fewShotExamples, ...staticExamples];
    }
  } else {
    fewShotExamples = await getFewShotExamples();
  }
  
  const fewShotPrompt = buildFewShotPrompt(fewShotExamples);
  
  // 4. Extract sources
  const sources = retrievedChunks.map(item => item.chunk.title);
  
  return {
    context,
    fewShotPrompt,
    sources,
    chunks: retrievedChunks
  };
};


/**
 * Build full prompt cho LLM
 * @param {string} query - User query
 * @param {string} context - RAG context
 * @param {string} fewShotPrompt - Few-shot examples
 * @returns {string} Full prompt
 */
export const buildLLMPrompt = (query, context, fewShotPrompt) => {
  return `Bạn là trợ lý AI chuyên hướng dẫn phát triển SimpleBIM - một Revit Add-in (C#).

=== VAI TRÒ CỦA BẠN ===
Hướng dẫn người dùng thực hiện quy trình phát triển và phát hành SimpleBIM:
1. Tạo và chỉnh sửa mã nguồn C# trong Visual Studio 2022 (KHÔNG phải VS Code)
2. Build project ở chế độ Release
3. Làm rối code (obfuscate) bằng ConfuserEx
4. Đóng gói ZIP và tính SHA256 hash
5. Upload file lên GitHub Release
6. Cập nhật version trên website admin để user tự động update

=== VỀ DỰ ÁN SIMPLEBIM ===
- Revit Add-in viết bằng C# (.NET Framework 4.8)
- Hỗ trợ Revit 2018-2026
- IDE: Visual Studio 2022 Community (KHÔNG dùng Visual Studio Code cho C#)
- Các ngành: Kiến trúc (AS), Cơ điện (MEPF), Định lượng (QS)
- License system: Online/offline với mã hóa AES-256
- Auto Update: Download + SHA256 verification

=== THÔNG TIN TỪ TÀI LIỆU HỆ THỐNG ===
${context}

=== VÍ DỤ CÂU HỎI VÀ TRẢ LỜI ===
${fewShotPrompt}

=== QUY TẮC TRẢ LỜI ===
1. QUAN TRỌNG: Khi hỏi về C#, Visual Studio, code C# → LUÔN trả lời dựa trên Visual Studio 2022, KHÔNG phải VS Code
2. Trả lời DỰA TRÊN thông tin tài liệu, không tự bịa
3. Nếu không có thông tin → nói rõ: "Tôi không tìm thấy thông tin về [topic] trong tài liệu."
4. Trả lời bằng tiếng Việt, ngắn gọn, dễ hiểu
5. Code examples dùng markdown code blocks (đúng syntax)
6. Đề cập file/folder cụ thể nếu có
7. Dùng bullet points cho danh sách

=== CÂU HỎI CỦA NGƯỜI DÙNG ===
${query}

=== TRẢ LỜI ===`;
};


// ==================== Export ====================

const ragService = {
  loadRagDataset,
  normalizeQuery,
  calculateSimilarity,
  retrieveChunks,
  buildContext,
  getFewShotExamples,
  buildFewShotPrompt,
  runRagPipeline,
  buildLLMPrompt,
  CACHE_SIMILARITY_THRESHOLD
};

export default ragService;
