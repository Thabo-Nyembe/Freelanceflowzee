import { NextRequest, NextResponse } from "next/server"
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { z } from "zod"
import { Readable } from "stream"
import { createClient } from "@supabase/supabase-js"
import { PDFDocument, rgb, StandardFonts } from "pdf-lib"
import { Parser } from "json2csv"
import { createFeatureLogger } from '@/lib/logger'

const logger = createFeatureLogger('API-Feedback')

// Rate limiting setup
import { Ratelimit } from "@upstash/ratelimit"
import { Redis } from "@upstash/redis"

// Types
type CommentPosition =
  | { type: "image" | "design"; x: number; y: number; zoom?: number }
  | { type: "video" | "audio"; timestamp: number }
  | { type: "document"; page: number; highlight?: [number, number] }
  | { type: "code"; line: number; character?: number }

type CommentStatus = "open" | "resolved" | "in_progress" | "wont_fix"
type CommentType = "text" | "voice" | "screen" | "drawing"
type CommentPriority = "low" | "medium" | "high" | "critical"

interface User {
  id: string
  name: string
  email?: string
  avatar?: string
  role?: string
}

interface Reply {
  id: string
  comment_id: string
  content: string
  author_id: string
  author: User
  created_at: string
  updated_at?: string
  type: CommentType
  attachments?: Attachment[]
  voice_url?: string
}

interface Attachment {
  id: string
  name: string
  type: string
  url: string
  size?: number
  thumbnail?: string
}

interface Comment {
  id: string
  project_id: string
  file_id: string
  position: CommentPosition
  content: string
  author_id: string
  author: User
  created_at: string
  updated_at?: string
  status: CommentStatus
  type: CommentType
  priority: CommentPriority
  replies: Reply[]
  attachments?: Attachment[]
  drawing_data?: string
  voice_url?: string
  screen_recording_url?: string
  assigned_to?: string
  labels?: string[]
}

// Validation schemas
const positionSchema = z.union([
  z.object({
    type: z.enum(["image", "design"]),
    x: z.number(),
    y: z.number(),
    zoom: z.number().optional(),
  }),
  z.object({
    type: z.enum(["video", "audio"]),
    timestamp: z.number(),
  }),
  z.object({
    type: z.literal("document"),
    page: z.number(),
    highlight: z.tuple([z.number(), z.number()]).optional(),
  }),
  z.object({
    type: z.literal("code"),
    line: z.number(),
    character: z.number().optional(),
  }),
])

const commentSchema = z.object({
  project_id: z.string().uuid(),
  file_id: z.string().uuid(),
  position: positionSchema,
  content: z.string().min(1).max(10000),
  status: z.enum(["open", "resolved", "in_progress", "wont_fix"]).default("open"),
  type: z.enum(["text", "voice", "screen", "drawing"]).default("text"),
  priority: z.enum(["low", "medium", "high", "critical"]).default("medium"),
  assigned_to: z.string().uuid().optional(),
  labels: z.array(z.string()).optional(),
})

const updateCommentSchema = z.object({
  content: z.string().min(1).max(10000).optional(),
  status: z.enum(["open", "resolved", "in_progress", "wont_fix"]).optional(),
  priority: z.enum(["low", "medium", "high", "critical"]).optional(),
  assigned_to: z.string().uuid().optional().nullable(),
  labels: z.array(z.string()).optional(),
  drawing_data: z.string().optional(),
  voice_url: z.string().url().optional(),
  screen_recording_url: z.string().url().optional(),
})

const replySchema = z.object({
  comment_id: z.string().uuid(),
  content: z.string().min(1).max(5000),
  type: z.enum(["text", "voice"]).default("text"),
  voice_url: z.string().url().optional(),
})

// Rate limiter (if UPSTASH_REDIS_REST_URL is configured)
let ratelimit: Ratelimit | null = null
if (process.env.UPSTASH_REDIS_REST_URL) {
  const redis = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL || "",
    token: process.env.UPSTASH_REDIS_REST_TOKEN || "",
  })
  ratelimit = new Ratelimit({
    redis,
    limiter: Ratelimit.slidingWindow(20, "60s"), // 20 requests per minute
    analytics: true,
  })
}

// Helper functions
const validateAuth = async (request: NextRequest) => {
  const supabase = createRouteHandlerClient({ cookies })
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    throw new Error("Unauthorized")
  }

  return {
    supabase,
    user: session.user,
  }
}

const checkRateLimit = async (request: NextRequest) => {
  if (!ratelimit) return true

  const ip = request.headers.get("x-forwarded-for") || "127.0.0.1"
  const { success, limit, reset, remaining } = await ratelimit.limit(ip)

  if (!success) {
    throw new Error(`Rate limit exceeded. Try again in ${Math.ceil((reset - Date.now()) / 1000)} seconds.`)
  }

  return true
}

const handleError = (error: any) => {
  logger.error('API Error', {
    error: error instanceof Error ? error.message : 'Unknown error',
    stack: error instanceof Error ? error.stack : undefined,
    errorType: error?.name
  })

  if (error.message === "Unauthorized") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  if (error.message.includes("Rate limit exceeded")) {
    return NextResponse.json({ error: error.message }, { status: 429 })
  }

  if (error.name === "ZodError") {
    return NextResponse.json({ error: "Invalid request data", details: error.errors }, { status: 400 })
  }

  return NextResponse.json({ error: "Internal server error" }, { status: 500 })
}

// Generate file exports
const generatePdfExport = async (comments: Comment[]): Promise<Buffer> => {
  const pdfDoc = await PDFDocument.create()
  const page = pdfDoc.addPage()
  const { width, height } = page.getSize()
  const font = await pdfDoc.embedFont(StandardFonts.Helvetica)
  const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold)

  page.drawText("Feedback Comments Export", {
    x: 50,
    y: height - 50,
    size: 20,
    font: boldFont,
  })

  page.drawText(`Generated: ${new Date().toLocaleString()}`, {
    x: 50,
    y: height - 80,
    size: 12,
    font,
  })

  let yOffset = height - 120

  for (const comment of comments) {
    if (yOffset < 100) {
      // Add new page if we're running out of space
      const newPage = pdfDoc.addPage()
      yOffset = height - 50
    }

    page.drawText(`Comment by ${comment.author.name}`, {
      x: 50,
      y: yOffset,
      size: 14,
      font: boldFont,
    })
    yOffset -= 20

    page.drawText(`Status: ${comment.status} | Priority: ${comment.priority}`, {
      x: 50,
      y: yOffset,
      size: 10,
      font,
    })
    yOffset -= 20

    page.drawText(`${comment.content}`, {
      x: 50,
      y: yOffset,
      size: 12,
      font,
      maxWidth: width - 100,
    })
    yOffset -= 40

    // Add replies
    if (comment.replies.length > 0) {
      page.drawText("Replies:", {
        x: 70,
        y: yOffset,
        size: 12,
        font: boldFont,
      })
      yOffset -= 20

      for (const reply of comment.replies) {
        page.drawText(`${reply.author.name}: ${reply.content}`, {
          x: 70,
          y: yOffset,
          size: 10,
          font,
          maxWidth: width - 140,
        })
        yOffset -= 20
      }
    }

    yOffset -= 20
  }

  const pdfBytes = await pdfDoc.save()
  return Buffer.from(pdfBytes)
}

const generateCsvExport = (comments: Comment[]): string => {
  // Flatten comments for CSV export
  const flatComments = comments.map((comment) => ({
    id: comment.id,
    content: comment.content,
    author: comment.author.name,
    status: comment.status,
    priority: comment.priority,
    created_at: comment.created_at,
    updated_at: comment.updated_at || "",
    file_id: comment.file_id,
    project_id: comment.project_id,
    position_type: (comment.position as any).type,
    reply_count: comment.replies.length,
    assigned_to: comment.assigned_to ? "Yes" : "No",
  }))

  const fields = [
    "id",
    "content",
    "author",
    "status",
    "priority",
    "created_at",
    "updated_at",
    "file_id",
    "project_id",
    "position_type",
    "reply_count",
    "assigned_to",
  ]

  const json2csvParser = new Parser({ fields })
  return json2csvParser.parse(flatComments)
}

// API Handlers
export async function GET(request: NextRequest) {
  try {
    await checkRateLimit(request)
    const { supabase, user } = await validateAuth(request)

    const url = new URL(request.url)
    const projectId = url.searchParams.get("project_id")
    const fileId = url.searchParams.get("file_id")
    const status = url.searchParams.get("status")
    const priority = url.searchParams.get("priority")
    const assignedTo = url.searchParams.get("assigned_to")
    const format = url.searchParams.get("format") // For exports: pdf, csv, json
    const page = parseInt(url.searchParams.get("page") || "1")
    const pageSize = Math.min(parseInt(url.searchParams.get("page_size") || "50"), 100) // Max 100 items per page

    // Validate required parameters
    if (!projectId) {
      return NextResponse.json({ error: "Project ID is required" }, { status: 400 })
    }

    // Check project access permission
    const { data: projectAccess, error: projectError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", projectId)
      .eq("user_id", user.id)
      .single()

    if (projectError || !projectAccess) {
      return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
    }

    // Build query
    let query = supabase
      .from("comments")
      .select(
        `
        *,
        author:author_id(*),
        replies:comment_replies(
          *,
          author:author_id(*)
        ),
        attachments:comment_attachments(*)
      `
      )
      .eq("project_id", projectId)

    if (fileId) {
      query = query.eq("file_id", fileId)
    }

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    if (priority && priority !== "all") {
      query = query.eq("priority", priority)
    }

    if (assignedTo) {
      if (assignedTo === "me") {
        query = query.eq("assigned_to", user.id)
      } else if (assignedTo === "unassigned") {
        query = query.is("assigned_to", null)
      } else {
        query = query.eq("assigned_to", assignedTo)
      }
    }

    // Pagination
    const from = (page - 1) * pageSize
    const to = from + pageSize - 1
    query = query.range(from, to)

    // Execute query
    const { data: comments, error, count } = await query.order("created_at", { ascending: false })

    if (error) {
      logger.error('Database error fetching comments', {
        error: error.message,
        projectId,
        fileId,
        status,
        priority
      })
      return NextResponse.json({ error: "Failed to fetch comments" }, { status: 500 })
    }

    // Handle export formats
    if (format && comments) {
      switch (format) {
        case "pdf":
          const pdfBuffer = await generatePdfExport(comments as unknown as Comment[])
          return new NextResponse(pdfBuffer, {
            headers: {
              "Content-Type": "application/pdf",
              "Content-Disposition": `attachment; filename="feedback-export-${projectId}.pdf"`,
            },
          })

        case "csv":
          const csvContent = generateCsvExport(comments as unknown as Comment[])
          return new NextResponse(csvContent, {
            headers: {
              "Content-Type": "text/csv",
              "Content-Disposition": `attachment; filename="feedback-export-${projectId}.csv"`,
            },
          })

        case "json":
          return NextResponse.json(comments)

        default:
          // Continue with normal JSON response
          break
      }
    }

    return NextResponse.json({
      comments,
      pagination: {
        page,
        pageSize,
        total: count || comments.length,
        totalPages: count ? Math.ceil(count / pageSize) : 1,
      },
    })
  } catch (error) {
    return handleError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    await checkRateLimit(request)
    const { supabase, user } = await validateAuth(request)

    const contentType = request.headers.get("content-type") || ""

    // Handle multipart form data (for file uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      
      // Extract comment data
      const commentData = formData.get("comment")
      if (!commentData || typeof commentData !== "string") {
        return NextResponse.json({ error: "Invalid comment data" }, { status: 400 })
      }
      
      const parsedComment = JSON.parse(commentData)
      
      // Validate comment data
      const validationResult = commentSchema.safeParse(parsedComment)
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid comment data", details: validationResult.error.errors },
          { status: 400 }
        )
      }
      
      // Check project access permission
      const { data: projectAccess, error: projectError } = await supabase
        .from("project_members")
        .select("role")
        .eq("project_id", parsedComment.project_id)
        .eq("user_id", user.id)
        .single()

      if (projectError || !projectAccess) {
        return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
      }
      
      // Process attachments
      const attachments = []
      const files = formData.getAll("files")
      
      for (const file of files) {
        if (file instanceof File) {
          const fileExt = file.name.split(".").pop()
          const filePath = `${parsedComment.project_id}/${crypto.randomUUID()}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("feedback-attachments")
            .upload(filePath, file)
            
          if (uploadError) {
            logger.error('File upload error in feedback attachment', {
              error: uploadError.message,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            })
            continue
          }
          
          // Get public URL
          const { data: urlData } = await supabase.storage
            .from("feedback-attachments")
            .getPublicUrl(filePath)
            
          attachments.push({
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
          })
        }
      }
      
      // Create comment
      const { data: comment, error } = await supabase
        .from("comments")
        .insert({
          ...parsedComment,
          author_id: user.id,
          created_at: new Date().toISOString(),
          attachments: attachments.length > 0 ? attachments : undefined,
        })
        .select()
        .single()
        
      if (error) {
        logger.error('Database error creating comment', {
          error: error.message,
          projectId: parsedComment?.project_id || body?.project_id
        })
        return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
      }
      
      // Trigger real-time update
      await supabase
        .from("comment_events")
        .insert({
          project_id: parsedComment.project_id,
          file_id: parsedComment.file_id,
          comment_id: comment.id,
          event_type: "created",
          user_id: user.id,
        })
      
      return NextResponse.json(comment, { status: 201 })
    }
    
    // Handle regular JSON requests
    const body = await request.json()
    
    // Validate comment data
    const validationResult = commentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid comment data", details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    // Check project access permission
    const { data: projectAccess, error: projectError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", body.project_id)
      .eq("user_id", user.id)
      .single()

    if (projectError || !projectAccess) {
      return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
    }
    
    // Create comment
    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        ...body,
        author_id: user.id,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()
      
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to create comment" }, { status: 500 })
    }
    
    // Trigger real-time update
    await supabase
      .from("comment_events")
      .insert({
        project_id: body.project_id,
        file_id: body.file_id,
        comment_id: comment.id,
        event_type: "created",
        user_id: user.id,
      })
    
    return NextResponse.json(comment, { status: 201 })
  } catch (error) {
    return handleError(error)
  }
}

export async function PUT(request: NextRequest) {
  try {
    await checkRateLimit(request)
    const { supabase, user } = await validateAuth(request)
    
    const url = new URL(request.url)
    const commentId = url.searchParams.get("id")
    
    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
    }
    
    // Get existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from("comments")
      .select("*, project_id")
      .eq("id", commentId)
      .single()
      
    if (fetchError || !existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    
    // Check project access permission
    const { data: projectAccess, error: projectError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", existingComment.project_id)
      .eq("user_id", user.id)
      .single()

    if (projectError || !projectAccess) {
      return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
    }
    
    const contentType = request.headers.get("content-type") || ""
    
    // Handle multipart form data (for file uploads)
    if (contentType.includes("multipart/form-data")) {
      const formData = await request.formData()
      
      // Extract comment data
      const commentData = formData.get("comment")
      if (!commentData || typeof commentData !== "string") {
        return NextResponse.json({ error: "Invalid comment data" }, { status: 400 })
      }
      
      const parsedComment = JSON.parse(commentData)
      
      // Validate comment data
      const validationResult = updateCommentSchema.safeParse(parsedComment)
      if (!validationResult.success) {
        return NextResponse.json(
          { error: "Invalid comment data", details: validationResult.error.errors },
          { status: 400 }
        )
      }
      
      // Process attachments
      const existingAttachments = existingComment.attachments || []
      const attachments = [...existingAttachments]
      const files = formData.getAll("files")
      
      for (const file of files) {
        if (file instanceof File) {
          const fileExt = file.name.split(".").pop()
          const filePath = `${existingComment.project_id}/${crypto.randomUUID()}.${fileExt}`
          
          const { data: uploadData, error: uploadError } = await supabase.storage
            .from("feedback-attachments")
            .upload(filePath, file)
            
          if (uploadError) {
            logger.error('File upload error in feedback attachment', {
              error: uploadError.message,
              fileName: file.name,
              fileSize: file.size,
              fileType: file.type
            })
            continue
          }
          
          // Get public URL
          const { data: urlData } = await supabase.storage
            .from("feedback-attachments")
            .getPublicUrl(filePath)
            
          attachments.push({
            id: crypto.randomUUID(),
            name: file.name,
            type: file.type,
            size: file.size,
            url: urlData.publicUrl,
          })
        }
      }
      
      // Update comment
      const { data: comment, error } = await supabase
        .from("comments")
        .update({
          ...parsedComment,
          updated_at: new Date().toISOString(),
          attachments: attachments.length > 0 ? attachments : existingAttachments,
        })
        .eq("id", commentId)
        .select()
        .single()
        
      if (error) {
        logger.error('Database error updating comment', {
          error: error.message,
          commentId
        })
        return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
      }
      
      // Trigger real-time update
      await supabase
        .from("comment_events")
        .insert({
          project_id: existingComment.project_id,
          file_id: existingComment.file_id,
          comment_id: commentId,
          event_type: "updated",
          user_id: user.id,
        })
      
      return NextResponse.json(comment)
    }
    
    // Handle regular JSON requests
    const body = await request.json()
    
    // Validate comment data
    const validationResult = updateCommentSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        { error: "Invalid comment data", details: validationResult.error.errors },
        { status: 400 }
      )
    }
    
    // Update comment
    const { data: comment, error } = await supabase
      .from("comments")
      .update({
        ...body,
        updated_at: new Date().toISOString(),
      })
      .eq("id", commentId)
      .select()
      .single()
      
    if (error) {
      console.error("Database error:", error)
      return NextResponse.json({ error: "Failed to update comment" }, { status: 500 })
    }
    
    // Trigger real-time update
    await supabase
      .from("comment_events")
      .insert({
        project_id: existingComment.project_id,
        file_id: existingComment.file_id,
        comment_id: commentId,
        event_type: "updated",
        user_id: user.id,
      })
    
    return NextResponse.json(comment)
  } catch (error) {
    return handleError(error)
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await checkRateLimit(request)
    const { supabase, user } = await validateAuth(request)
    
    const url = new URL(request.url)
    const commentId = url.searchParams.get("id")
    
    if (!commentId) {
      return NextResponse.json({ error: "Comment ID is required" }, { status: 400 })
    }
    
    // Get existing comment
    const { data: existingComment, error: fetchError } = await supabase
      .from("comments")
      .select("*, project_id")
      .eq("id", commentId)
      .single()
      
    if (fetchError || !existingComment) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 })
    }
    
    // Check project access permission and ownership
    const { data: projectAccess, error: projectError } = await supabase
      .from("project_members")
      .select("role")
      .eq("project_id", existingComment.project_id)
      .eq("user_id", user.id)
      .single()

    if (projectError || !projectAccess) {
      return NextResponse.json({ error: "You don't have access to this project" }, { status: 403 })
    }
    
    // Only allow deletion by comment author or project admin/owner
    if (existingComment.author_id !== user.id && !["admin", "owner"].includes(projectAccess.role)) {
      return NextResponse.json({ error: "You don't have permission to delete this comment" }, { status: 403 })
    }
    
    // Delete any attachments from storage
    if (existingComment.attachments && existingComment.attachments.length > 0) {
      for (const attachment of existingComment.attachments) {
        // Extract path from URL
        const url = new URL(attachment.url)
        const path = url.pathname.split("/").slice(-2).join("/")
        
        if (path) {
          await supabase.storage.from("feedback-attachments").remove([path])
        }
      }
    }
    
    // Delete comment
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId)
      
    if (error) {
      logger.error('Database error deleting comment', {
        error: error.message,
        commentId
      })
      return NextResponse.json({ error: "Failed to delete comment" }, { status: 500 })
    }
    
    // Trigger real-time update
    await supabase
      .from("comment_events")
      .insert({
        project_id: existingComment.project_id,
        file_id: existingComment.file_id,
        comment_id: commentId,
        event_type: "deleted",
        user_id: user.id,
      })
    
    return NextResponse.json({ success: true })
  } catch (error) {
    return handleError(error)
  }
}

// Handle OPTIONS request for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 204,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization",
      "Access-Control-Max-Age": "86400",
    },
  })
}
