/**
 * Meeting Summarizer Engine - FreeFlow A+++ Implementation
 *
 * Industry-leading meeting intelligence with:
 * - AI-powered summary generation
 * - Action item extraction with assignees
 * - Key decision tracking
 * - Topic segmentation
 * - Speaker analytics
 * - Follow-up recommendations
 * - Sentiment analysis
 * - Question tracking
 *
 * Competitors: Fireflies.ai, Otter.ai, Grain, Fathom
 */

import OpenAI from 'openai';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface MeetingTranscript {
  id: string;
  text: string;
  segments?: TranscriptSegment[];
  speakers?: string[];
  duration: number;
  language?: string;
}

export interface TranscriptSegment {
  speaker?: string;
  start: number;
  end: number;
  text: string;
}

export interface ActionItem {
  id: string;
  description: string;
  assignee?: string;
  dueDate?: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'in_progress' | 'completed';
  context: string;
  timestamp?: number;
}

export interface KeyDecision {
  id: string;
  decision: string;
  rationale?: string;
  madeBy?: string;
  impact: 'low' | 'medium' | 'high';
  timestamp?: number;
  relatedTopics: string[];
}

export interface TopicSegment {
  id: string;
  title: string;
  summary: string;
  startTime: number;
  endTime: number;
  keywords: string[];
  speakers: string[];
}

export interface SpeakerAnalytics {
  speakerId: string;
  speakerName: string;
  totalDuration: number;
  wordCount: number;
  percentageOfMeeting: number;
  sentimentScore: number;
  keyContributions: string[];
  questionsAsked: number;
}

export interface Question {
  id: string;
  question: string;
  askedBy?: string;
  timestamp?: number;
  answered: boolean;
  answer?: string;
  answeredBy?: string;
}

export interface FollowUp {
  id: string;
  type: 'email' | 'meeting' | 'task' | 'document' | 'reminder';
  title: string;
  description: string;
  suggestedDate?: string;
  participants?: string[];
  priority: 'low' | 'medium' | 'high';
}

export interface MeetingSentiment {
  overall: 'negative' | 'neutral' | 'positive';
  score: number; // -1 to 1
  byTopic: {
    topic: string;
    sentiment: 'negative' | 'neutral' | 'positive';
    score: number;
  }[];
  bySpeaker: {
    speaker: string;
    sentiment: 'negative' | 'neutral' | 'positive';
    score: number;
  }[];
}

export interface MeetingSummary {
  id: string;
  meetingId: string;
  title: string;
  executiveSummary: string;
  detailedSummary: string;
  bulletPoints: string[];
  duration: number;
  participantCount: number;
  language: string;

  // Extracted intelligence
  actionItems: ActionItem[];
  decisions: KeyDecision[];
  topics: TopicSegment[];
  questions: Question[];
  followUps: FollowUp[];

  // Analytics
  speakerAnalytics: SpeakerAnalytics[];
  sentiment: MeetingSentiment;

  // Metadata
  processingTime: number;
  model: string;
  confidence: number;
  createdAt: string;
}

export interface SummarizerOptions {
  style?: 'brief' | 'detailed' | 'executive' | 'technical';
  extractActionItems?: boolean;
  extractDecisions?: boolean;
  extractQuestions?: boolean;
  analyzeSentiment?: boolean;
  generateFollowUps?: boolean;
  speakerAnalysis?: boolean;
  topicSegmentation?: boolean;
  maxBulletPoints?: number;
  language?: string;
  customPrompt?: string;
}

// ============================================================================
// MEETING SUMMARIZER SERVICE
// ============================================================================

export class MeetingSummarizerService {
  private openai: OpenAI;
  private defaultModel = 'gpt-4o';

  constructor(apiKey?: string) {
    this.openai = new OpenAI({
      apiKey: apiKey || process.env.OPENAI_API_KEY,
    });
  }

  /**
   * Generate comprehensive meeting summary
   */
  async summarize(
    transcript: MeetingTranscript,
    options: SummarizerOptions = {}
  ): Promise<MeetingSummary> {
    const startTime = Date.now();

    const {
      style = 'detailed',
      extractActionItems = true,
      extractDecisions = true,
      extractQuestions = true,
      analyzeSentiment = true,
      generateFollowUps = true,
      speakerAnalysis = true,
      topicSegmentation = true,
      maxBulletPoints = 10,
      language = transcript.language || 'en',
    } = options;

    // Build comprehensive prompt
    const systemPrompt = this.buildSystemPrompt(style, options);
    const userPrompt = this.buildUserPrompt(transcript, options);

    // Call OpenAI for main summary
    const summaryResponse = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const summaryContent = summaryResponse.choices[0]?.message?.content || '{}';
    const parsedSummary = JSON.parse(summaryContent);

    // Parallel extraction tasks
    const [
      actionItems,
      decisions,
      questions,
      sentiment,
      followUps,
      topics,
      speakerStats
    ] = await Promise.all([
      extractActionItems ? this.extractActionItems(transcript) : Promise.resolve([]),
      extractDecisions ? this.extractDecisions(transcript) : Promise.resolve([]),
      extractQuestions ? this.extractQuestions(transcript) : Promise.resolve([]),
      analyzeSentiment ? this.analyzeSentiment(transcript) : Promise.resolve(null),
      generateFollowUps ? this.generateFollowUps(transcript, parsedSummary.bulletPoints || []) : Promise.resolve([]),
      topicSegmentation ? this.segmentTopics(transcript) : Promise.resolve([]),
      speakerAnalysis ? this.analyzeSpeakers(transcript) : Promise.resolve([]),
    ]);

    const processingTime = Date.now() - startTime;

    return {
      id: `summary_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      meetingId: transcript.id,
      title: parsedSummary.title || 'Meeting Summary',
      executiveSummary: parsedSummary.executiveSummary || '',
      detailedSummary: parsedSummary.detailedSummary || '',
      bulletPoints: (parsedSummary.bulletPoints || []).slice(0, maxBulletPoints),
      duration: transcript.duration,
      participantCount: transcript.speakers?.length || 1,
      language,

      actionItems,
      decisions,
      topics,
      questions,
      followUps,

      speakerAnalytics: speakerStats,
      sentiment: sentiment || {
        overall: 'neutral',
        score: 0,
        byTopic: [],
        bySpeaker: [],
      },

      processingTime,
      model: this.defaultModel,
      confidence: parsedSummary.confidence || 0.85,
      createdAt: new Date().toISOString(),
    };
  }

  /**
   * Extract action items from transcript
   */
  private async extractActionItems(transcript: MeetingTranscript): Promise<ActionItem[]> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying action items from meeting transcripts.
Extract all actionable tasks with the following rules:
- Look for phrases like "we need to", "let's", "should", "will", "action item", "follow up", "by [date]"
- Identify who is responsible (assignee) if mentioned
- Determine priority based on urgency language and context
- Extract due dates if mentioned
- Include context for why the action is needed

Return JSON: { "actionItems": [{ "description", "assignee", "dueDate", "priority", "context" }] }
Priority: low, medium, high, critical`
        },
        {
          role: 'user',
          content: `Extract action items from this meeting transcript:\n\n${transcript.text}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return (parsed.actionItems || []).map((item: any, index: number) => ({
      id: `action_${Date.now()}_${index}`,
      description: item.description || '',
      assignee: item.assignee || undefined,
      dueDate: item.dueDate || undefined,
      priority: item.priority || 'medium',
      status: 'pending' as const,
      context: item.context || '',
    }));
  }

  /**
   * Extract key decisions from transcript
   */
  private async extractDecisions(transcript: MeetingTranscript): Promise<KeyDecision[]> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying key decisions from meeting transcripts.
Extract all decisions with the following rules:
- Look for phrases like "decided", "agreed", "will go with", "final answer", "consensus"
- Identify who made or drove the decision
- Capture the rationale or reasoning
- Assess impact level based on scope and consequences
- Note related topics or areas affected

Return JSON: { "decisions": [{ "decision", "rationale", "madeBy", "impact", "relatedTopics" }] }
Impact: low, medium, high`
        },
        {
          role: 'user',
          content: `Extract key decisions from this meeting transcript:\n\n${transcript.text}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return (parsed.decisions || []).map((item: any, index: number) => ({
      id: `decision_${Date.now()}_${index}`,
      decision: item.decision || '',
      rationale: item.rationale || undefined,
      madeBy: item.madeBy || undefined,
      impact: item.impact || 'medium',
      relatedTopics: item.relatedTopics || [],
    }));
  }

  /**
   * Extract questions from transcript
   */
  private async extractQuestions(transcript: MeetingTranscript): Promise<Question[]> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying questions from meeting transcripts.
Extract all significant questions with the following rules:
- Identify who asked the question
- Determine if the question was answered in the meeting
- If answered, capture the answer and who provided it
- Focus on substantive questions, not rhetorical ones

Return JSON: { "questions": [{ "question", "askedBy", "answered", "answer", "answeredBy" }] }`
        },
        {
          role: 'user',
          content: `Extract questions from this meeting transcript:\n\n${transcript.text}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.2,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return (parsed.questions || []).map((item: any, index: number) => ({
      id: `question_${Date.now()}_${index}`,
      question: item.question || '',
      askedBy: item.askedBy || undefined,
      answered: item.answered || false,
      answer: item.answer || undefined,
      answeredBy: item.answeredBy || undefined,
    }));
  }

  /**
   * Analyze sentiment of meeting
   */
  private async analyzeSentiment(transcript: MeetingTranscript): Promise<MeetingSentiment> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert at sentiment analysis for business meetings.
Analyze the overall tone and sentiment of the meeting with:
- Overall sentiment (negative, neutral, positive) and score (-1 to 1)
- Sentiment by topic discussed
- Sentiment by speaker if identifiable

Return JSON: { "overall": "positive|neutral|negative", "score": 0.5, "byTopic": [{ "topic", "sentiment", "score" }], "bySpeaker": [{ "speaker", "sentiment", "score" }] }`
        },
        {
          role: 'user',
          content: `Analyze sentiment of this meeting:\n\n${transcript.text}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return {
      overall: parsed.overall || 'neutral',
      score: parsed.score || 0,
      byTopic: parsed.byTopic || [],
      bySpeaker: parsed.bySpeaker || [],
    };
  }

  /**
   * Generate follow-up recommendations
   */
  private async generateFollowUps(
    transcript: MeetingTranscript,
    bulletPoints: string[]
  ): Promise<FollowUp[]> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert at recommending follow-up actions after meetings.
Based on the meeting content, suggest follow-ups including:
- Email summaries to send
- Follow-up meetings to schedule
- Tasks to create
- Documents to draft
- Reminders to set

Return JSON: { "followUps": [{ "type", "title", "description", "suggestedDate", "participants", "priority" }] }
Types: email, meeting, task, document, reminder
Priority: low, medium, high`
        },
        {
          role: 'user',
          content: `Based on this meeting, suggest follow-ups:\n\nTranscript: ${transcript.text.substring(0, 3000)}\n\nKey Points: ${bulletPoints.join(', ')}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    return (parsed.followUps || []).map((item: any, index: number) => ({
      id: `followup_${Date.now()}_${index}`,
      type: item.type || 'task',
      title: item.title || '',
      description: item.description || '',
      suggestedDate: item.suggestedDate || undefined,
      participants: item.participants || [],
      priority: item.priority || 'medium',
    }));
  }

  /**
   * Segment meeting into topics
   */
  private async segmentTopics(transcript: MeetingTranscript): Promise<TopicSegment[]> {
    const response = await this.openai.chat.completions.create({
      model: this.defaultModel,
      messages: [
        {
          role: 'system',
          content: `You are an expert at identifying topic segments in meetings.
Segment the meeting into distinct topics with:
- Clear topic titles
- Brief summary of each topic
- Key keywords for each topic
- Speakers involved in each topic

Return JSON: { "topics": [{ "title", "summary", "keywords", "speakers" }] }`
        },
        {
          role: 'user',
          content: `Segment this meeting into topics:\n\n${transcript.text}`
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const parsed = JSON.parse(content);

    const totalDuration = transcript.duration;
    const topics = parsed.topics || [];
    const segmentDuration = totalDuration / Math.max(topics.length, 1);

    return topics.map((item: any, index: number) => ({
      id: `topic_${Date.now()}_${index}`,
      title: item.title || `Topic ${index + 1}`,
      summary: item.summary || '',
      startTime: index * segmentDuration,
      endTime: (index + 1) * segmentDuration,
      keywords: item.keywords || [],
      speakers: item.speakers || [],
    }));
  }

  /**
   * Analyze speaker participation
   */
  private async analyzeSpeakers(transcript: MeetingTranscript): Promise<SpeakerAnalytics[]> {
    if (!transcript.segments || transcript.segments.length === 0) {
      // If no segments, create a single speaker entry
      return [{
        speakerId: 'speaker_0',
        speakerName: transcript.speakers?.[0] || 'Unknown Speaker',
        totalDuration: transcript.duration,
        wordCount: transcript.text.split(/\s+/).length,
        percentageOfMeeting: 100,
        sentimentScore: 0,
        keyContributions: [],
        questionsAsked: 0,
      }];
    }

    // Calculate stats from segments
    const speakerMap = new Map<string, {
      duration: number;
      wordCount: number;
      text: string;
    }>();

    for (const segment of transcript.segments) {
      const speaker = segment.speaker || 'Unknown';
      const existing = speakerMap.get(speaker) || { duration: 0, wordCount: 0, text: '' };
      existing.duration += (segment.end - segment.start);
      existing.wordCount += segment.text.split(/\s+/).length;
      existing.text += ' ' + segment.text;
      speakerMap.set(speaker, existing);
    }

    const totalDuration = transcript.duration;
    const analytics: SpeakerAnalytics[] = [];

    for (const [speaker, stats] of speakerMap) {
      // Get key contributions via AI
      const contributionResponse = await this.openai.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: 'Extract 3 key contributions this speaker made. Return JSON: { "contributions": ["...", "...", "..."], "questionsAsked": 0, "sentimentScore": 0.5 }'
          },
          {
            role: 'user',
            content: `Speaker "${speaker}" said: ${stats.text.substring(0, 2000)}`
          }
        ],
        response_format: { type: 'json_object' },
        temperature: 0.3,
      });

      const parsed = JSON.parse(contributionResponse.choices[0]?.message?.content || '{}');

      analytics.push({
        speakerId: `speaker_${analytics.length}`,
        speakerName: speaker,
        totalDuration: stats.duration,
        wordCount: stats.wordCount,
        percentageOfMeeting: Math.round((stats.duration / totalDuration) * 100),
        sentimentScore: parsed.sentimentScore || 0,
        keyContributions: parsed.contributions || [],
        questionsAsked: parsed.questionsAsked || 0,
      });
    }

    return analytics;
  }

  /**
   * Build system prompt based on style
   */
  private buildSystemPrompt(style: string, options: SummarizerOptions): string {
    const styleGuides = {
      brief: 'Create a concise summary in 2-3 paragraphs. Focus on the most critical outcomes.',
      detailed: 'Create a comprehensive summary covering all discussion points, decisions, and outcomes.',
      executive: 'Create an executive summary suitable for senior leadership. Focus on strategic implications and business impact.',
      technical: 'Create a technical summary with specific details, metrics, and technical decisions.',
    };

    return `You are an expert meeting analyst. ${styleGuides[style as keyof typeof styleGuides] || styleGuides.detailed}

Your task is to analyze the meeting transcript and provide:
1. A title for the meeting
2. An executive summary (2-3 sentences)
3. A detailed summary (comprehensive overview)
4. Bullet points of key takeaways
5. Confidence score (0-1) for your analysis

${options.customPrompt ? `Additional instructions: ${options.customPrompt}` : ''}

Return JSON: {
  "title": "Meeting Title",
  "executiveSummary": "...",
  "detailedSummary": "...",
  "bulletPoints": ["...", "..."],
  "confidence": 0.9
}`;
  }

  /**
   * Build user prompt with transcript
   */
  private buildUserPrompt(transcript: MeetingTranscript, options: SummarizerOptions): string {
    let prompt = `Meeting Duration: ${Math.round(transcript.duration / 60)} minutes\n`;

    if (transcript.speakers && transcript.speakers.length > 0) {
      prompt += `Participants: ${transcript.speakers.join(', ')}\n`;
    }

    prompt += `\nTranscript:\n${transcript.text}`;

    return prompt;
  }

  /**
   * Generate quick summary (faster, less detailed)
   */
  async quickSummarize(text: string): Promise<{
    summary: string;
    actionItems: string[];
    keyPoints: string[];
  }> {
    const response = await this.openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: `Quickly summarize this meeting content. Return JSON: {
  "summary": "2-3 sentence summary",
  "actionItems": ["action 1", "action 2"],
  "keyPoints": ["point 1", "point 2"]
}`
        },
        {
          role: 'user',
          content: text
        }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    return JSON.parse(content);
  }

  /**
   * Generate meeting notes in markdown format
   */
  async generateMarkdownNotes(summary: MeetingSummary): Promise<string> {
    let markdown = `# ${summary.title}\n\n`;
    markdown += `**Date:** ${new Date(summary.createdAt).toLocaleDateString()}\n`;
    markdown += `**Duration:** ${Math.round(summary.duration / 60)} minutes\n`;
    markdown += `**Participants:** ${summary.participantCount}\n\n`;

    markdown += `## Executive Summary\n\n${summary.executiveSummary}\n\n`;

    markdown += `## Key Points\n\n`;
    summary.bulletPoints.forEach(point => {
      markdown += `- ${point}\n`;
    });
    markdown += '\n';

    if (summary.actionItems.length > 0) {
      markdown += `## Action Items\n\n`;
      summary.actionItems.forEach(item => {
        const assignee = item.assignee ? ` (@${item.assignee})` : '';
        const due = item.dueDate ? ` - Due: ${item.dueDate}` : '';
        markdown += `- [ ] ${item.description}${assignee}${due} [${item.priority}]\n`;
      });
      markdown += '\n';
    }

    if (summary.decisions.length > 0) {
      markdown += `## Key Decisions\n\n`;
      summary.decisions.forEach(decision => {
        markdown += `### ${decision.decision}\n`;
        if (decision.rationale) {
          markdown += `*Rationale:* ${decision.rationale}\n`;
        }
        if (decision.madeBy) {
          markdown += `*Decision by:* ${decision.madeBy}\n`;
        }
        markdown += '\n';
      });
    }

    if (summary.questions.length > 0) {
      const unanswered = summary.questions.filter(q => !q.answered);
      if (unanswered.length > 0) {
        markdown += `## Open Questions\n\n`;
        unanswered.forEach(q => {
          markdown += `- ${q.question}`;
          if (q.askedBy) markdown += ` (asked by ${q.askedBy})`;
          markdown += '\n';
        });
        markdown += '\n';
      }
    }

    if (summary.followUps.length > 0) {
      markdown += `## Recommended Follow-ups\n\n`;
      summary.followUps.forEach(followUp => {
        markdown += `- **[${followUp.type.toUpperCase()}]** ${followUp.title}: ${followUp.description}\n`;
      });
      markdown += '\n';
    }

    markdown += `---\n*Generated by FreeFlow Meeting Intelligence*\n`;

    return markdown;
  }
}

// Export singleton instance
export const meetingSummarizer = new MeetingSummarizerService();
