"use server";

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import OpenAI from 'openai';

// Validation schema for project creation
const createProjectSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().min(1, 'Description is required').max(2000, 'Description must be less than 2000 characters'),
  client_name: z.string().optional(),
  client_email: z.string().email('Invalid email format').optional().or(z.literal('')),
  budget: z.coerce.number().min(0, 'Budget must be a positive number').optional(),
  start_date: z.string().optional(),
  end_date: z.string().optional(),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  status: z.enum(['draft', 'active', 'paused', 'completed', 'cancelled']).default('active'),
  user_id: z.string().min(1, 'User ID is required'),
  parent_id: z.string().uuid().optional()
})

interface CreateProjectResult {
  success?: boolean
  error?: string
  project?: unknown
}

export async function createProject(prevState: CreateProjectResult, formData: FormData): Promise<CreateProjectResult> {
  try {
    const supabase = await createClient()
    
    if (!supabase) {
      return { error: 'Database connection not available' }
    }
    
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { error: 'User not authenticated' }
    }

    // Extract and validate form data
    const rawData = {
      title: formData.get('title') as string,
      description: formData.get('description') as string,
      client_name: formData.get('client_name') as string,
      client_email: formData.get('client_email') as string,
      budget: formData.get('budget') as string,
      start_date: formData.get('start_date') as string,
      end_date: formData.get('end_date') as string,
      priority: formData.get('priority') as string,
      status: formData.get('status') as string,
      user_id: user.id,
      parent_id: formData.get('parent_id') as string | undefined
    }

    // Validate the data
    const validationResult = createProjectSchema.safeParse(rawData)
    
    if (!validationResult.success) {
      const firstError = validationResult.error.errors[0]
      return { error: firstError.message }
    }

    const validatedData = validationResult.data

    // Check if end date is after start date
    if (validatedData.start_date && validatedData.end_date) {
      const startDate = new Date(validatedData.start_date)
      const endDate = new Date(validatedData.end_date)
      
      if (endDate < startDate) {
        return { error: 'End date must be after start date' }
      }
    }

    // Generate embedding for the project content
    const textToEmbed = `Title: ${validatedData.title}\nDescription: ${validatedData.description}`;
    const { embedding, error: embeddingError } = await generateEmbedding(textToEmbed);

    if (embeddingError) {
      // Log a warning but don't block project creation
      console.warn(`Could not generate embedding for project "${validatedData.title}": ${embeddingError}`);
    }

    // Prepare project data for insertion
    const projectData = {
      title: validatedData.title,
      description: validatedData.description,
      client_name: validatedData.client_name || null,
      client_email: validatedData.client_email || null,
      budget: validatedData.budget || 0,
      start_date: validatedData.start_date || null,
      end_date: validatedData.end_date || null,
      priority: validatedData.priority,
      status: validatedData.status,
      user_id: validatedData.user_id,
      parent_id: validatedData.parent_id || null,
      embedding: embedding || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }

    // Insert project into database
    const { data: project, error: insertError } = await supabase
      .from('projects')
      .insert([projectData])
      .select()
      .single()

    if (insertError) {
      console.error('Project creation error: ', insertError);
      return { error: 'Failed to create project. Please try again.' }
    }

    // Handle file upload if provided
    const file = formData.get('attachment') as File
    if (file && file.size > 0) {
      try {
        const fileExtension = file.name.split('.').pop()
        const fileName = `${project.id}-${Date.now()}.${fileExtension}`
        
        const { error: uploadError } = await supabase.storage
          .from('project-attachments')
          .upload(fileName, file)

        if (uploadError) {
          console.error('File upload error: ', uploadError);
          // Don't fail the entire project creation for file upload issues
        }
      } catch (fileError) {
        console.error('File handling error: ', fileError);
        // Don't fail the entire project creation for file issues
      }
    }

    return { success: true, project }

  } catch (error) {
    console.error('Unexpected error in createProject: ', error);
    return { error: 'An unexpected error occurred. Please try again.' }
  }
}

// Action to get details for a single project
export async function getProjectDetails({ projectId }: { projectId: string }) {
  const supabase = await createClient();
  const { data: project, error } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (error) {
    console.error('Error fetching project details:', error);
    return { error: 'Project not found.' };
  }

  return { project };
}

// Action to search for projects by title or content
export async function searchProjects(query: string) {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from('projects')
    .select('id, title, description')
    .textSearch('fts', query, { 
      type: 'websearch',
      config: 'english'
    });

  if (error) {
    console.error('Error searching projects:', error);
    return { error: 'Failed to search for projects.' };
  }

  return { projects };
}

// Action to get sub-projects for a given parent project
export async function getSubProjects(parentId: string) {
  const supabase = await createClient();
  const { data: subProjects, error } = await supabase
    .from('projects')
    .select('*')
    .eq('parent_id', parentId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching sub-projects:', error);
    return { error: 'Failed to fetch sub-projects.' };
  }

  return { subProjects };
}

// Action to get all top-level projects
export async function getTopLevelProjects() {
  const supabase = await createClient();
  const { data: projects, error } = await supabase
    .from('projects')
    .select('*')
    .is('parent_id', null)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching top-level projects:', error);
    return { error: 'Failed to fetch projects.' };
  }

  return { projects };
}

// Recursive helper function to fetch a project and its children
async function fetchProjectWithChildren(projectId: string, supabase: any) {
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('*')
    .eq('id', projectId)
    .single();

  if (projectError) {
    console.error(`Error fetching project ${projectId}:`, projectError);
    throw new Error(`Failed to fetch project with id ${projectId}`);
  }

  const { data: children, error: childrenError } = await supabase
    .from('projects')
    .select('*')
    .eq('parent_id', projectId);

  if (childrenError) {
    console.error(`Error fetching children for project ${projectId}:`, childrenError);
    // We can choose to continue without children if that's acceptable
    return { ...project, children: [] }; 
  }

  const childrenWithSubtree = await Promise.all(
    (children || []).map(child => fetchProjectWithChildren(child.id, supabase))
  );

  return { ...project, children: childrenWithSubtree };
}

// Action to get a project and all its descendants (the full tree)
export async function getProjectTree(projectId: string) {
  const supabase = await createClient();
  try {
    const tree = await fetchProjectWithChildren(projectId, supabase);
    return { tree };
  } catch (error) {
    console.error('Error fetching project tree:', error);
    return { error: 'Failed to fetch project tree.' };
  }
}

// Helper function to format the project tree into a string for the AI prompt
function formatProjectTree(project: any, indent = 0): string {
  let content = '  '.repeat(indent) + `- ${project.title} (Status: ${project.status}, Priority: ${project.priority})\n`;
  content += '  '.repeat(indent) + `  Description: ${project.description}\n`;
  if (project.children && project.children.length > 0) {
    content += project.children.map(child => formatProjectTree(child, indent + 1)).join('');
  }
  return content;
}

// Action to generate an AI-powered roll-up report for a project and its sub-projects
export async function getRollupReport(projectId: string) {
  const supabase = await createClient();
  if (!supabase) {
    return { error: 'Database connection not available' };
  }

  const { tree, error: treeError } = await getProjectTree(projectId);

  if (treeError || !tree) {
    return { error: 'Failed to fetch project hierarchy.' };
  }

  const projectHierarchy = formatProjectTree(tree);

  const systemPrompt = `You are a meticulous senior project analyst tasked with creating a roll-up summary. Your audience is an executive team, so the report must be clear, concise, and professional.

Based on the project data provided by the user, generate a summary report in markdown format.

The report MUST include the following sections:
- **Overall Summary**: A brief, high-level overview of the project's status and trajectory.
- **Key Achievements**: Bullet points highlighting recent major accomplishments.
- **Upcoming Milestones**: Bullet points listing the next critical milestones.
- **Risks & Blockers**: Bullet points identifying any current or potential issues that could impact progress.`;

  try {
    const openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: systemPrompt,
        },
        {
          role: 'user',
          content: projectHierarchy,
        },
      ],
    });

    const report = response.choices[0].message?.content;
    if (!report) {
      return { error: 'AI failed to generate a report.' };
    }

    return { report };
  } catch (error) {
    console.error('Error generating AI roll-up report:', error);
    return { error: 'Failed to generate AI report.' };
  }
}

// Action to detect action items from project content
export async function detectActionItems(projectId: string) {
  const supabase = await createClient();
  const { data: project, error: projectError } = await supabase
    .from('projects')
    .select('title, description, content')
    .eq('id', projectId)
    .single();

  if (projectError || !project) {
    console.error('Error fetching project for action item detection:', projectError);
    return { error: 'Failed to fetch project data.' };
  }

  const textContent = `Project Title: ${project.title}\n\nDescription: ${project.description}\n\nDetails: ${project.content || ''}`;

  if (textContent.trim().length < 50) { // Don't run on very short content
    return { actionItems: [], error: 'Content too short to analyze.' };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        {
          role: 'system',
          content: 'You are an expert project manager assistant. Your task is to analyze the following project content and extract a list of clear, actionable tasks. For each task, you must also assign a priority level: "High", "Medium", or "Low". Respond with a JSON object containing a single key "tasks" which holds an array of objects. Each object must have two keys: "task" (the string description) and "priority" (the string priority). Example: { "tasks": [{"task": "Schedule kickoff meeting", "priority": "High"}, {"task": "Draft initial mockups", "priority": "Medium"}] }. If no action items are found, return an object with an empty array: { "tasks": [] }.',
        },
        {
          role: 'user',
          content: textContent,
        },
      ],
      response_format: { type: 'json_object' },
    });

    const result = response.choices[0].message?.content;
    if (!result) {
      return { error: 'AI failed to generate a valid response.' };
    }

    const parsedResult = JSON.parse(result);
    const actionItems = parsedResult.tasks || [];

    return { actionItems };

  } catch (error) {
    console.error('Error detecting action items:', error);
    return { error: 'Failed to analyze project for action items.' };
  }
}

// Action to generate an embedding for a given text
export async function generateEmbedding(text: string) {
  if (!text) {
    console.error('Embedding generation failed: No text provided.');
    return { embedding: null, error: 'No text provided.' };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.embeddings.create({
      model: 'text-embedding-3-small', // A newer, cost-effective model
      input: text.replace(/\n/g, ' '),
    });
    return { embedding: response.data[0].embedding, error: null };
  } catch (error) {
    console.error('Error generating embedding:', error);
    return { embedding: null, error: 'Failed to generate text embedding.' };
  }
}

// Action to search for projects using semantic vector search
export async function transformTextWithAI(text: string, command: string) {
  if (!text || !command) {
    return { error: 'Text and command are required.' };
  }

  let systemPrompt = '';
  switch (command) {
    case 'improve':
      systemPrompt = 'You are an expert editor. Please improve the following text for clarity, grammar, and style, while preserving its original meaning. Respond only with the improved text.';
      break;
    case 'professional':
      systemPrompt = 'You are a business communication expert. Rewrite the following text to have a more professional and formal tone. Respond only with the rewritten text.';
      break;
    case 'summarize':
      systemPrompt = 'You are an expert summarizer. Provide a concise summary of the following text. Respond only with the summary.';
      break;
    default:
      return { error: 'Invalid command.' };
  }

  try {
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
    const response = await openai.chat.completions.create({
      model: 'gpt-4-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: text },
      ],
      temperature: 0.5, // Lower temperature for more predictable, less creative output
    });

    const transformedText = response.choices[0].message?.content;
    if (!transformedText) {
      return { error: 'AI failed to transform the text.' };
    }

    return { transformedText };
  } catch (error) {
    console.error('Error transforming text with AI:', error);
    return { error: 'Failed to transform text.' };
  }
}

export async function semanticSearchProjects(query: string) {
  if (!query) {
    return { projects: [], error: 'Search query cannot be empty.' };
  }

  // 1. Generate embedding for the query
  const { embedding, error: embeddingError } = await generateEmbedding(query);

  if (embeddingError || !embedding) {
    return { projects: [], error: 'Failed to generate search embedding.' };
  }

  // 2. Call the RPC function in Supabase
  const supabase = await createClient();
  const { data: projects, error: searchError } = await supabase.rpc('match_projects', {
    query_embedding: embedding,
    match_threshold: 0.7, // This can be tuned
    match_count: 10,
  });

  if (searchError) {
    console.error('Semantic search error:', searchError);
    return { projects: [], error: 'Failed to perform semantic search.' };
  }

  return { projects };
}