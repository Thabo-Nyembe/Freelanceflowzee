/**
 * Document Ingestion Service
 *
 * Comprehensive document processing for RAG:
 * - Multi-format support (PDF, DOCX, TXT, MD, HTML, JSON)
 * - Chunking strategies (semantic, fixed, recursive)
 * - Metadata extraction
 * - Parallel processing
 * - Progress tracking
 */

import { getEmbeddingsService, EmbeddingsService } from './embeddings'
import { createClient } from '@/lib/supabase/client'

// Types
export interface DocumentSource {
  type: 'file' | 'url' | 'text' | 'api'
  content: string | File | Blob
  mimeType?: string
  filename?: string
  url?: string
  metadata?: Record<string, any>
}

export interface ChunkingOptions {
  strategy: 'fixed' | 'semantic' | 'recursive' | 'sentence' | 'paragraph'
  chunkSize?: number
  chunkOverlap?: number
  separators?: string[]
  preserveStructure?: boolean
}

export interface ProcessingOptions {
  chunking?: ChunkingOptions
  extractMetadata?: boolean
  generateSummary?: boolean
  detectLanguage?: boolean
  extractEntities?: boolean
  preserveFormatting?: boolean
  parallel?: boolean
  batchSize?: number
}

export interface ProcessedChunk {
  id: string
  content: string
  index: number
  metadata: {
    source: string
    position: { start: number; end: number }
    section?: string
    entities?: string[]
    summary?: string
    language?: string
    [key: string]: any
  }
  embedding?: number[]
}

export interface ProcessingResult {
  documentId: string
  chunks: ProcessedChunk[]
  metadata: DocumentMetadata
  stats: ProcessingStats
}

export interface DocumentMetadata {
  title?: string
  author?: string
  createdAt?: string
  modifiedAt?: string
  language?: string
  wordCount: number
  charCount: number
  pageCount?: number
  format: string
  summary?: string
  keywords?: string[]
  entities?: EntityExtraction[]
}

export interface EntityExtraction {
  type: 'person' | 'organization' | 'location' | 'date' | 'money' | 'email' | 'url' | 'custom'
  value: string
  confidence: number
  positions: number[]
}

export interface ProcessingStats {
  totalChunks: number
  totalTokens: number
  processingTime: number
  embeddingTime: number
  successRate: number
}

export interface IngestionProgress {
  status: 'pending' | 'processing' | 'chunking' | 'embedding' | 'storing' | 'complete' | 'error'
  progress: number
  currentStep: string
  error?: string
}

// Default options
const DEFAULT_CHUNKING: ChunkingOptions = {
  strategy: 'semantic',
  chunkSize: 1000,
  chunkOverlap: 200,
  preserveStructure: true
}

const DEFAULT_OPTIONS: ProcessingOptions = {
  chunking: DEFAULT_CHUNKING,
  extractMetadata: true,
  generateSummary: true,
  detectLanguage: true,
  extractEntities: true,
  preserveFormatting: false,
  parallel: true,
  batchSize: 10
}

/**
 * DocumentIngestionService class
 */
export class DocumentIngestionService {
  private embeddingsService: EmbeddingsService
  private progressCallbacks: Map<string, (progress: IngestionProgress) => void> = new Map()

  constructor(embeddingsService?: EmbeddingsService) {
    this.embeddingsService = embeddingsService || getEmbeddingsService()
  }

  /**
   * Ingest a document from various sources
   */
  async ingest(
    source: DocumentSource,
    collection: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult> {
    const opts = { ...DEFAULT_OPTIONS, ...options }
    const startTime = Date.now()
    const documentId = `doc-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`

    this.updateProgress(documentId, {
      status: 'processing',
      progress: 10,
      currentStep: 'Extracting content'
    })

    // Extract text from source
    const { text, metadata: sourceMetadata } = await this.extractContent(source)

    this.updateProgress(documentId, {
      status: 'processing',
      progress: 30,
      currentStep: 'Analyzing document'
    })

    // Extract metadata
    const metadata = opts.extractMetadata
      ? await this.extractMetadata(text, source, sourceMetadata)
      : this.getBasicMetadata(text, source)

    this.updateProgress(documentId, {
      status: 'chunking',
      progress: 40,
      currentStep: 'Chunking content'
    })

    // Chunk document
    const chunks = await this.chunkDocument(text, documentId, opts.chunking || DEFAULT_CHUNKING)

    this.updateProgress(documentId, {
      status: 'embedding',
      progress: 60,
      currentStep: 'Generating embeddings'
    })

    // Generate embeddings
    const embeddingStartTime = Date.now()
    const embeddedChunks = await this.embedChunks(chunks, opts)
    const embeddingTime = Date.now() - embeddingStartTime

    this.updateProgress(documentId, {
      status: 'storing',
      progress: 80,
      currentStep: 'Storing in knowledge base'
    })

    // Store in database
    await this.storeChunks(embeddedChunks, collection, documentId, metadata)

    this.updateProgress(documentId, {
      status: 'complete',
      progress: 100,
      currentStep: 'Complete'
    })

    const processingTime = Date.now() - startTime

    return {
      documentId,
      chunks: embeddedChunks,
      metadata,
      stats: {
        totalChunks: embeddedChunks.length,
        totalTokens: this.estimateTokens(text),
        processingTime,
        embeddingTime,
        successRate: embeddedChunks.filter(c => c.embedding).length / embeddedChunks.length
      }
    }
  }

  /**
   * Bulk ingest multiple documents
   */
  async bulkIngest(
    sources: DocumentSource[],
    collection: string,
    options: ProcessingOptions = {}
  ): Promise<ProcessingResult[]> {
    const results: ProcessingResult[] = []
    const opts = { ...DEFAULT_OPTIONS, ...options }

    if (opts.parallel) {
      // Process in parallel batches
      const batchSize = opts.batchSize || 10
      for (let i = 0; i < sources.length; i += batchSize) {
        const batch = sources.slice(i, i + batchSize)
        const batchResults = await Promise.all(
          batch.map(source => this.ingest(source, collection, options))
        )
        results.push(...batchResults)
      }
    } else {
      // Process sequentially
      for (const source of sources) {
        const result = await this.ingest(source, collection, options)
        results.push(result)
      }
    }

    return results
  }

  /**
   * Register progress callback
   */
  onProgress(documentId: string, callback: (progress: IngestionProgress) => void): void {
    this.progressCallbacks.set(documentId, callback)
  }

  /**
   * Remove progress callback
   */
  offProgress(documentId: string): void {
    this.progressCallbacks.delete(documentId)
  }

  // Content extraction

  private async extractContent(source: DocumentSource): Promise<{
    text: string
    metadata: Record<string, any>
  }> {
    const metadata: Record<string, any> = {}

    switch (source.type) {
      case 'text':
        return { text: source.content as string, metadata }

      case 'file':
        return await this.extractFromFile(source.content as File | Blob, source.mimeType)

      case 'url':
        return await this.extractFromUrl(source.url || source.content as string)

      case 'api':
        return { text: source.content as string, metadata: source.metadata || {} }

      default:
        throw new Error(`Unsupported source type: ${source.type}`)
    }
  }

  private async extractFromFile(file: File | Blob, mimeType?: string): Promise<{
    text: string
    metadata: Record<string, any>
  }> {
    const type = mimeType || (file as File).type || 'text/plain'
    const metadata: Record<string, any> = {}

    if (file instanceof File) {
      metadata.filename = file.name
      metadata.size = file.size
      metadata.lastModified = new Date(file.lastModified).toISOString()
    }

    // Text-based formats
    if (type.includes('text/') || type.includes('application/json')) {
      const text = await this.readFileAsText(file)
      return { text, metadata }
    }

    // Markdown
    if (type.includes('markdown') || (file instanceof File && file.name.endsWith('.md'))) {
      const text = await this.readFileAsText(file)
      return { text: this.parseMarkdown(text), metadata }
    }

    // HTML
    if (type.includes('html')) {
      const html = await this.readFileAsText(file)
      return { text: this.parseHtml(html), metadata }
    }

    // PDF (simplified - would use pdf.js in production)
    if (type.includes('pdf')) {
      const text = await this.extractPdfText(file)
      return { text, metadata: { ...metadata, format: 'pdf' } }
    }

    // DOCX (simplified - would use docx parser in production)
    if (type.includes('wordprocessingml') || type.includes('docx')) {
      const text = await this.extractDocxText(file)
      return { text, metadata: { ...metadata, format: 'docx' } }
    }

    // Fallback to text
    const text = await this.readFileAsText(file)
    return { text, metadata }
  }

  private async extractFromUrl(url: string): Promise<{
    text: string
    metadata: Record<string, any>
  }> {
    const response = await fetch(url)
    const contentType = response.headers.get('content-type') || 'text/html'

    if (contentType.includes('application/json')) {
      const json = await response.json()
      return {
        text: JSON.stringify(json, null, 2),
        metadata: { url, contentType }
      }
    }

    const html = await response.text()
    const text = this.parseHtml(html)

    return {
      text,
      metadata: {
        url,
        contentType,
        title: this.extractTitle(html)
      }
    }
  }

  private readFileAsText(file: File | Blob): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.onload = () => resolve(reader.result as string)
      reader.onerror = reject
      reader.readAsText(file)
    })
  }

  private parseMarkdown(md: string): string {
    // Remove markdown syntax while preserving structure
    return md
      .replace(/#{1,6}\s/g, '')  // Headers
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
      .replace(/\*(.*?)\*/g, '$1')  // Italic
      .replace(/\[(.*?)\]\(.*?\)/g, '$1')  // Links
      .replace(/`{3}[\s\S]*?`{3}/g, '')  // Code blocks
      .replace(/`(.*?)`/g, '$1')  // Inline code
      .replace(/^[-*+]\s/gm, '')  // List items
      .replace(/^\d+\.\s/gm, '')  // Numbered lists
      .trim()
  }

  private parseHtml(html: string): string {
    // Simple HTML to text extraction
    return html
      .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
      .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/\s+/g, ' ')
      .replace(/&nbsp;/g, ' ')
      .replace(/&amp;/g, '&')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>')
      .replace(/&quot;/g, '"')
      .trim()
  }

  private extractTitle(html: string): string | undefined {
    const match = html.match(/<title[^>]*>([^<]+)<\/title>/i)
    return match ? match[1].trim() : undefined
  }

  private async extractPdfText(file: File | Blob): Promise<string> {
    try {
      // Convert File/Blob to ArrayBuffer
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      // Dynamic import for pdf-parse (server-side)
      if (typeof window === 'undefined') {
        try {
          const pdfParse = (await import('pdf-parse')).default;
          const data = await pdfParse(buffer);
          return data.text || '';
        } catch (importError) {
          // If pdf-parse is not installed, try alternative approach
          console.warn('pdf-parse not available, using basic extraction');
          return this.extractPdfTextBasic(buffer);
        }
      }

      // Client-side: Use pdf.js
      try {
        const pdfjs = await import('pdfjs-dist');

        // Set worker path if not already set
        if (!pdfjs.GlobalWorkerOptions.workerSrc) {
          pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;
        }

        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const textParts: string[] = [];

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageText = textContent.items
            .map((item: any) => ('str' in item ? item.str : ''))
            .join(' ');
          textParts.push(pageText);
        }

        return textParts.join('\n\n');
      } catch (pdfjsError) {
        console.warn('pdfjs-dist not available:', pdfjsError);
        return this.extractPdfTextBasic(buffer);
      }
    } catch (error) {
      console.error('PDF extraction error:', error);
      throw new Error(`Failed to extract PDF text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private extractPdfTextBasic(buffer: Buffer): string {
    // Basic PDF text extraction without external libraries
    // This extracts visible text streams from the PDF
    const content = buffer.toString('latin1');
    const textParts: string[] = [];

    // Find text streams (simplified extraction)
    const streamRegex = /stream\s*([\s\S]*?)\s*endstream/g;
    let match;

    while ((match = streamRegex.exec(content)) !== null) {
      const stream = match[1];
      // Look for text showing operators (Tj, TJ)
      const textMatches = stream.match(/\(([^)]+)\)\s*Tj|\[([^\]]+)\]\s*TJ/g);
      if (textMatches) {
        for (const textMatch of textMatches) {
          // Extract text from parentheses
          const extracted = textMatch.match(/\(([^)]+)\)/g);
          if (extracted) {
            const text = extracted.map(t => t.slice(1, -1)).join('');
            if (text.length > 0 && /[a-zA-Z]/.test(text)) {
              textParts.push(text);
            }
          }
        }
      }
    }

    if (textParts.length === 0) {
      return 'Unable to extract text from this PDF. The file may be scanned or image-based.';
    }

    return textParts.join(' ').replace(/\s+/g, ' ').trim();
  }

  private async extractDocxText(file: File | Blob): Promise<string> {
    try {
      const arrayBuffer = await file.arrayBuffer();

      // Try mammoth for DOCX extraction
      if (typeof window === 'undefined') {
        try {
          const mammoth = await import('mammoth');
          const result = await mammoth.extractRawText({ arrayBuffer });
          return result.value || '';
        } catch (importError) {
          // If mammoth is not installed, try basic extraction
          console.warn('mammoth not available, using basic extraction');
          return this.extractDocxTextBasic(arrayBuffer);
        }
      }

      // Client-side: Try mammoth or use basic extraction
      try {
        const mammoth = await import('mammoth');
        const result = await mammoth.extractRawText({ arrayBuffer });
        return result.value || '';
      } catch (mammothError) {
        console.warn('mammoth not available on client:', mammothError);
        return this.extractDocxTextBasic(arrayBuffer);
      }
    } catch (error) {
      console.error('DOCX extraction error:', error);
      throw new Error(`Failed to extract DOCX text: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async extractDocxTextBasic(arrayBuffer: ArrayBuffer): Promise<string> {
    // Basic DOCX extraction without mammoth
    // DOCX files are ZIP archives containing XML
    try {
      // Dynamic import JSZip for DOCX parsing
      const JSZip = (await import('jszip')).default;
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Get the main document content
      const documentXml = await zip.file('word/document.xml')?.async('string');

      if (!documentXml) {
        throw new Error('Could not find document.xml in DOCX file');
      }

      // Extract text from XML
      // Remove XML tags and get text content
      const text = documentXml
        // Get text from paragraph and text elements
        .replace(/<w:t[^>]*>([^<]*)<\/w:t>/g, '$1 ')
        // Remove all remaining XML tags
        .replace(/<[^>]+>/g, '')
        // Clean up whitespace
        .replace(/\s+/g, ' ')
        // Decode XML entities
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&apos;/g, "'")
        .trim();

      return text;
    } catch (zipError) {
      // If JSZip is not available or fails, return an error message
      console.error('Basic DOCX extraction failed:', zipError);
      return 'Unable to extract text from this DOCX file. Please ensure the file is not corrupted.';
    }
  }

  // Metadata extraction

  private async extractMetadata(
    text: string,
    source: DocumentSource,
    sourceMetadata: Record<string, any>
  ): Promise<DocumentMetadata> {
    const basic = this.getBasicMetadata(text, source)

    // Detect language
    const language = await this.detectLanguage(text)

    // Extract entities
    const entities = await this.extractEntities(text)

    // Generate summary
    const summary = await this.generateSummary(text)

    // Extract keywords
    const keywords = this.extractKeywords(text)

    return {
      ...basic,
      ...sourceMetadata,
      language,
      entities,
      summary,
      keywords
    }
  }

  private getBasicMetadata(text: string, source: DocumentSource): DocumentMetadata {
    const words = text.split(/\s+/).filter(w => w.length > 0)

    return {
      wordCount: words.length,
      charCount: text.length,
      format: source.mimeType || 'text/plain',
      title: source.metadata?.title || source.filename
    }
  }

  private async detectLanguage(text: string): Promise<string> {
    // Simple language detection based on common words
    const sample = text.toLowerCase().substring(0, 1000)

    const languages: Record<string, string[]> = {
      'en': ['the', 'is', 'are', 'was', 'were', 'have', 'has', 'been', 'will', 'would'],
      'es': ['el', 'la', 'los', 'las', 'es', 'son', 'está', 'están', 'fue', 'será'],
      'fr': ['le', 'la', 'les', 'est', 'sont', 'été', 'être', 'avoir', 'fait', 'sera'],
      'de': ['der', 'die', 'das', 'ist', 'sind', 'war', 'waren', 'wird', 'werden', 'haben']
    }

    let maxScore = 0
    let detectedLang = 'en'

    for (const [lang, words] of Object.entries(languages)) {
      const score = words.filter(w => sample.includes(` ${w} `)).length
      if (score > maxScore) {
        maxScore = score
        detectedLang = lang
      }
    }

    return detectedLang
  }

  private async extractEntities(text: string): Promise<EntityExtraction[]> {
    const entities: EntityExtraction[] = []

    // Email extraction
    const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
    let match
    while ((match = emailRegex.exec(text)) !== null) {
      entities.push({
        type: 'email',
        value: match[0],
        confidence: 1,
        positions: [match.index]
      })
    }

    // URL extraction
    const urlRegex = /https?:\/\/[^\s<>"{}|\\^`\[\]]+/g
    while ((match = urlRegex.exec(text)) !== null) {
      entities.push({
        type: 'url',
        value: match[0],
        confidence: 1,
        positions: [match.index]
      })
    }

    // Date extraction (basic patterns)
    const dateRegex = /\b\d{1,2}[-/]\d{1,2}[-/]\d{2,4}\b|\b(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]* \d{1,2},? \d{4}\b/gi
    while ((match = dateRegex.exec(text)) !== null) {
      entities.push({
        type: 'date',
        value: match[0],
        confidence: 0.9,
        positions: [match.index]
      })
    }

    // Money extraction
    const moneyRegex = /\$[\d,]+(?:\.\d{2})?|\d+(?:,\d{3})*(?:\.\d{2})?\s*(?:USD|EUR|GBP|CAD)/gi
    while ((match = moneyRegex.exec(text)) !== null) {
      entities.push({
        type: 'money',
        value: match[0],
        confidence: 0.95,
        positions: [match.index]
      })
    }

    return entities
  }

  private async generateSummary(text: string): Promise<string> {
    // Simple extractive summary - take first sentences
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 20)
    return sentences.slice(0, 3).join('. ').trim() + '.'
  }

  private extractKeywords(text: string): string[] {
    // Simple keyword extraction based on frequency
    const words = text.toLowerCase()
      .replace(/[^a-z\s]/g, '')
      .split(/\s+/)
      .filter(w => w.length > 4)

    const stopWords = new Set([
      'about', 'above', 'after', 'again', 'against', 'being', 'below',
      'between', 'could', 'doing', 'during', 'every', 'first', 'found',
      'having', 'however', 'itself', 'might', 'never', 'other', 'other',
      'should', 'since', 'still', 'their', 'there', 'these', 'thing',
      'think', 'those', 'through', 'under', 'until', 'using', 'where',
      'which', 'while', 'would', 'years'
    ])

    const frequency = new Map<string, number>()
    words.forEach(word => {
      if (!stopWords.has(word)) {
        frequency.set(word, (frequency.get(word) || 0) + 1)
      }
    })

    return Array.from(frequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([word]) => word)
  }

  // Chunking strategies

  private async chunkDocument(
    text: string,
    documentId: string,
    options: ChunkingOptions
  ): Promise<ProcessedChunk[]> {
    switch (options.strategy) {
      case 'fixed':
        return this.fixedChunking(text, documentId, options)
      case 'semantic':
        return this.semanticChunking(text, documentId, options)
      case 'recursive':
        return this.recursiveChunking(text, documentId, options)
      case 'sentence':
        return this.sentenceChunking(text, documentId, options)
      case 'paragraph':
        return this.paragraphChunking(text, documentId, options)
      default:
        return this.semanticChunking(text, documentId, options)
    }
  }

  private fixedChunking(
    text: string,
    documentId: string,
    options: ChunkingOptions
  ): ProcessedChunk[] {
    const chunkSize = options.chunkSize || 1000
    const overlap = options.chunkOverlap || 200
    const chunks: ProcessedChunk[] = []

    let start = 0
    let index = 0

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length)
      const content = text.slice(start, end)

      chunks.push({
        id: `${documentId}-chunk-${index}`,
        content,
        index,
        metadata: {
          source: documentId,
          position: { start, end }
        }
      })

      start += chunkSize - overlap
      index++
    }

    return chunks
  }

  private semanticChunking(
    text: string,
    documentId: string,
    options: ChunkingOptions
  ): ProcessedChunk[] {
    const chunkSize = options.chunkSize || 1000
    const overlap = options.chunkOverlap || 200
    const chunks: ProcessedChunk[] = []

    // Split by semantic boundaries (paragraphs, sections)
    const paragraphs = text.split(/\n\n+/)
    let currentChunk = ''
    let currentStart = 0
    let index = 0
    let position = 0

    for (const paragraph of paragraphs) {
      const trimmedPara = paragraph.trim()
      if (!trimmedPara) {
        position += paragraph.length + 2 // Account for \n\n
        continue
      }

      if (currentChunk.length + trimmedPara.length > chunkSize && currentChunk.length > 0) {
        // Save current chunk
        chunks.push({
          id: `${documentId}-chunk-${index}`,
          content: currentChunk.trim(),
          index,
          metadata: {
            source: documentId,
            position: { start: currentStart, end: position }
          }
        })

        // Start new chunk with overlap
        const overlapText = currentChunk.slice(-overlap)
        currentChunk = overlapText + '\n\n' + trimmedPara
        currentStart = position - overlap
        index++
      } else {
        currentChunk += (currentChunk ? '\n\n' : '') + trimmedPara
      }

      position += paragraph.length + 2
    }

    // Add remaining chunk
    if (currentChunk.trim()) {
      chunks.push({
        id: `${documentId}-chunk-${index}`,
        content: currentChunk.trim(),
        index,
        metadata: {
          source: documentId,
          position: { start: currentStart, end: text.length }
        }
      })
    }

    return chunks
  }

  private recursiveChunking(
    text: string,
    documentId: string,
    options: ChunkingOptions
  ): ProcessedChunk[] {
    const chunkSize = options.chunkSize || 1000
    const separators = options.separators || ['\n\n', '\n', '. ', ', ', ' ']
    const chunks: ProcessedChunk[] = []
    let index = 0

    const splitRecursively = (content: string, sepIndex: number, startPos: number) => {
      if (content.length <= chunkSize || sepIndex >= separators.length) {
        if (content.trim()) {
          chunks.push({
            id: `${documentId}-chunk-${index++}`,
            content: content.trim(),
            index: chunks.length,
            metadata: {
              source: documentId,
              position: { start: startPos, end: startPos + content.length }
            }
          })
        }
        return
      }

      const separator = separators[sepIndex]
      const parts = content.split(separator)
      let currentPos = startPos

      let currentPart = ''
      for (const part of parts) {
        if ((currentPart + separator + part).length > chunkSize && currentPart) {
          splitRecursively(currentPart, sepIndex + 1, currentPos)
          currentPos += currentPart.length + separator.length
          currentPart = part
        } else {
          currentPart += (currentPart ? separator : '') + part
        }
      }

      if (currentPart) {
        splitRecursively(currentPart, sepIndex + 1, currentPos)
      }
    }

    splitRecursively(text, 0, 0)
    return chunks
  }

  private sentenceChunking(
    text: string,
    documentId: string,
    options: ChunkingOptions
  ): ProcessedChunk[] {
    const chunkSize = options.chunkSize || 1000
    const chunks: ProcessedChunk[] = []

    const sentences = text.match(/[^.!?]+[.!?]+/g) || [text]
    let currentChunk = ''
    let currentStart = 0
    let position = 0
    let index = 0

    for (const sentence of sentences) {
      if (currentChunk.length + sentence.length > chunkSize && currentChunk) {
        chunks.push({
          id: `${documentId}-chunk-${index++}`,
          content: currentChunk.trim(),
          index: chunks.length,
          metadata: {
            source: documentId,
            position: { start: currentStart, end: position }
          }
        })
        currentChunk = sentence
        currentStart = position
      } else {
        currentChunk += sentence
      }
      position += sentence.length
    }

    if (currentChunk.trim()) {
      chunks.push({
        id: `${documentId}-chunk-${index}`,
        content: currentChunk.trim(),
        index: chunks.length,
        metadata: {
          source: documentId,
          position: { start: currentStart, end: text.length }
        }
      })
    }

    return chunks
  }

  private paragraphChunking(
    text: string,
    documentId: string,
    options: ChunkingOptions
  ): ProcessedChunk[] {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim())
    let position = 0

    return paragraphs.map((para, index) => {
      const start = position
      position += para.length + 2 // Account for \n\n

      return {
        id: `${documentId}-chunk-${index}`,
        content: para.trim(),
        index,
        metadata: {
          source: documentId,
          position: { start, end: position - 2 }
        }
      }
    })
  }

  // Embedding generation

  private async embedChunks(
    chunks: ProcessedChunk[],
    options: ProcessingOptions
  ): Promise<ProcessedChunk[]> {
    const batchSize = options.batchSize || 10

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      const contents = batch.map(c => c.content)

      const result = await this.embeddingsService.embedBatch(contents, { normalize: true })

      result.successful.forEach((emb, idx) => {
        if (batch[idx]) {
          batch[idx].embedding = emb.embedding
        }
      })
    }

    return chunks
  }

  // Storage

  private async storeChunks(
    chunks: ProcessedChunk[],
    collection: string,
    documentId: string,
    metadata: DocumentMetadata
  ): Promise<void> {
    const supabase = createClient()

    // Store document record
    await supabase
      .from('ingested_documents')
      .upsert({
        id: documentId,
        collection,
        metadata,
        chunk_count: chunks.length,
        created_at: new Date().toISOString()
      })

    // Store chunks
    for (const chunk of chunks) {
      if (chunk.embedding) {
        await this.embeddingsService.store(
          chunk.content,
          chunk.embedding,
          {
            ...chunk.metadata,
            documentId,
            documentTitle: metadata.title,
            chunkIndex: chunk.index
          },
          collection
        )
      }
    }
  }

  // Utilities

  private updateProgress(documentId: string, progress: IngestionProgress): void {
    const callback = this.progressCallbacks.get(documentId)
    if (callback) {
      callback(progress)
    }
  }

  private estimateTokens(text: string): number {
    // Rough estimation: ~4 characters per token
    return Math.ceil(text.length / 4)
  }
}

// Singleton instance
let ingestionServiceInstance: DocumentIngestionService | null = null

/**
 * Get or create document ingestion service
 */
export function getDocumentIngestionService(): DocumentIngestionService {
  if (!ingestionServiceInstance) {
    ingestionServiceInstance = new DocumentIngestionService()
  }
  return ingestionServiceInstance
}

/**
 * Create new document ingestion service
 */
export function createDocumentIngestionService(
  embeddingsService?: EmbeddingsService
): DocumentIngestionService {
  return new DocumentIngestionService(embeddingsService)
}

/**
 * Quick ingest function
 */
export async function ingestDocument(
  source: DocumentSource,
  collection: string,
  options?: ProcessingOptions
): Promise<ProcessingResult> {
  return getDocumentIngestionService().ingest(source, collection, options)
}

/**
 * Quick bulk ingest function
 */
export async function bulkIngestDocuments(
  sources: DocumentSource[],
  collection: string,
  options?: ProcessingOptions
): Promise<ProcessingResult[]> {
  return getDocumentIngestionService().bulkIngest(sources, collection, options)
}
