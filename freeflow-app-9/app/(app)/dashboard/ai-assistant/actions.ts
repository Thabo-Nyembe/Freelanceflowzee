"use server";

import { searchProjects, getProjectDetails } from "@/app/(app)/projects/actions";
import OpenAI from 'openai';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('AI-Assistant-Actions');

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Define interfaces for BlockNote content
interface InlineContent {
  type: string;
  text: string;
  styles: Record<string, unknown>;
}

interface BlockContent {
  id: string;
  type: string;
  props: Record<string, string>;
  content?: InlineContent[];
  children: BlockContent[];
}

// Define interface for action items
interface ActionItem {
  task: string;
  assignee?: string;
  dueDate?: string;
}

// Helper function to convert BlockNote JSON to plain text for the AI
const stringifyProjectContent = (content: BlockContent[] | string | null | undefined): string => {
    if (!content) return "";

    // Handle string content directly
    if (typeof content === 'string') {
        try {
            // Try to parse it as it might be a JSON string
            const parsed = JSON.parse(content);
            if (Array.isArray(parsed)) {
                return parsed.map((block: BlockContent) => 
                    block.content?.map((inline: InlineContent) => inline.text).join('') || ''
                ).join('\n');
            }
        } catch (e) {
            // If parsing fails, it's just a plain string
            return content;
        }
    }
    
    // Handle array of BlockNote blocks
    if (Array.isArray(content)) {
        try {
            return content.map((block: BlockContent) =>
                block.content?.map((inline: InlineContent) => inline.text).join('') || ''
            ).join('\n');
        } catch (e) {
            logger.error('Error stringifying project content', {
                error: e instanceof Error ? e.message : 'Unknown error',
                contentType: 'array',
                arrayLength: content.length
            });
            // Fallback for unexpected format within the array
            return JSON.stringify(content);
        }
    }
    
    // Fallback for any other unexpected format
    return JSON.stringify(content);
}

export async function getProjectSummary(projectId: string): Promise<{ summary?: string; error?: string }> {
    // 1. Get the full project content
        const projectDetails = await getProjectDetails({ projectId });
    if (projectDetails.error || !projectDetails.project) {
        return { error: "Could not find the project." };
    }

    const contentToSummarize = stringifyProjectContent(projectDetails.project.content);

    if (!contentToSummarize) {
        return { error: `The project \"${projectDetails.project.title}\" doesn't have any content to summarize.` };
    }

    // 2. Call OpenAI to generate the summary
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: "You are a helpful assistant. Your task is to provide a concise summary of the following project content." },
                { role: "user", content: contentToSummarize }
            ]
        });
        const summary = completion.choices[0]?.message?.content;
        if (!summary) {
            return { error: "I was unable to generate a summary." };
        }

        logger.info('Project summary generated successfully', {
            projectId,
            summaryLength: summary.length,
            contentLength: contentToSummarize.length
        });

        return { summary };
    } catch (error) {
        logger.error('OpenAI API error - Project summary', {
            projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
            contentLength: contentToSummarize.length
        });
        return { error: "I'm sorry, but I encountered an error while trying to generate the summary." };
    }
}

export async function extractActionItems(projectId: string): Promise<{ actionItems?: ActionItem[]; error?: string }> {
    // 1. Get the full project content
    const projectDetails = await getProjectDetails({ projectId });
    if (projectDetails.error || !projectDetails.project) {
        return { error: "Could not find the project." };
    }

    const contentToAnalyze = stringifyProjectContent(projectDetails.project.content);

    if (!contentToAnalyze) {
        return { error: `The project \"${projectDetails.project.title}\" doesn't have any content to analyze.` };
    }

    // 2. Call OpenAI to extract action items
    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            response_format: { type: "json_object" },
            messages: [
                { 
                    role: "system", 
                    content: `You are an expert project management assistant. Your task is to analyze the following project content and extract all action items, tasks, or to-dos. For each action item, identify the task description. If mentioned, also capture the assigned person and the due date. Present the result as a JSON object with a single key, "actionItems", which is an array of objects. Each object in the array should have the following properties: "task" (string, required), "assignee" (string, optional), and "dueDate" (string, optional). If no action items are found, return an empty array.`
                },
                { role: "user", content: contentToAnalyze }
            ]
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
            return { error: "I was unable to extract action items." };
        }

        const parsedResult = JSON.parse(result);
        const actionItems = parsedResult.actionItems || [];

        logger.info('Action items extracted successfully', {
            projectId,
            actionItemsCount: actionItems.length,
            contentLength: contentToAnalyze.length
        });

        return { actionItems };

    } catch (error) {
        logger.error('OpenAI API error - Action items extraction', {
            projectId,
            error: error instanceof Error ? error.message : 'Unknown error',
            contentLength: contentToAnalyze.length
        });
        return { error: "I'm sorry, but I encountered an error while trying to extract action items." };
    }
}

export async function getAIResponse(userMessage: string): Promise<string> {
  // Check if the user wants to summarize a project, e.g., "summarize My Project"
  const summarizeMatch = userMessage.toLowerCase().match(/^summarize\s+(?:'|\")?(.+?)(?:'|\")?$/);

  if (summarizeMatch && summarizeMatch[1]) {
    const projectNameQuery = summarizeMatch[1];

    // Find the project using our search
    const searchResults = await searchProjects(projectNameQuery);
    if (searchResults.error || !searchResults.projects || searchResults.projects.length === 0) {
      return `I couldn't find a project named \"${projectNameQuery}\". Please try again.`;
    }
    const project = searchResults.projects[0];

    // Call the dedicated summary function
    const summaryResult = await getProjectSummary(project.id);
    return summaryResult.summary || summaryResult.error || "Something went wrong.";
  }

  // Fallback for general queries
  const searchResults = await searchProjects(userMessage);
  if (searchResults.error || !searchResults.projects || searchResults.projects.length === 0) {
    return "I couldn't find any projects related to your question. Could you be more specific?";
  }

  const context = `Here are some projects I found that might be relevant: ${searchResults.projects.map(p => p.title).join(', ')}. What would you like to know about them?`;
  return context;
}

export async function getWritingAssistance(text: string, command: string): Promise<{ result?: string; error?: string }> {
    if (!text) {
        return { error: "There is no text to work with." };
    }

    let systemPrompt = "You are an expert writing assistant.";

    switch (command) {
        case "improve":
            systemPrompt += " Your task is to improve the following text, fixing any grammatical errors and enhancing clarity and flow.";
            break;
        case "summarize":
            systemPrompt += " Your task is to provide a concise summary of the following text.";
            break;
        case "fix":
            systemPrompt += " Your task is to fix all spelling and grammar mistakes in the following text.";
            break;
        default:
            return { error: "Unknown command." };
    }

    try {
        const completion = await openai.chat.completions.create({
            model: "gpt-3.5-turbo",
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: text }
            ]
        });

        const result = completion.choices[0]?.message?.content;
        if (!result) {
            return { error: "I was unable to get a response from the AI." };
        }

        logger.info('Writing assistance completed successfully', {
            command,
            inputLength: text.length,
            outputLength: result.length
        });

        return { result };

    } catch (error) {
        logger.error('OpenAI API error - Writing assistance', {
            command,
            error: error instanceof Error ? error.message : 'Unknown error',
            inputLength: text.length
        });
        return { error: "I'm sorry, but I encountered an error while trying to get writing assistance." };
    }
}
