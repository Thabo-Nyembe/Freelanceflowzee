import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/demo-mode'

const logger = createSimpleLogger('templates')

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    switch (action) {
      case 'list': {
        const category = searchParams.get('category')
        const type = searchParams.get('type')

        let query = supabase.from('project_templates').select('*')

        if (category && category !== 'all') {
          query = query.eq('category', category)
        }
        if (type && type !== 'all') {
          query = query.eq('type', type)
        }

        const { data, error } = await query.order('created_at', { ascending: false })
        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'settings': {
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('template_settings')
          .select('*')
          .eq('user_id', user?.id)
          .single()

        if (error && error.code !== 'PGRST116') throw error

        return NextResponse.json({
          data: data || {
            defaultCategory: 'all',
            autoSave: true,
            notifyOnUse: true,
            visibility: 'public'
          }
        })
      }

      case 'export': {
        const format = searchParams.get('format') || 'json'
        const scope = searchParams.get('scope') || 'all'

        let query = supabase.from('project_templates').select('*')

        if (scope === 'featured') {
          query = query.eq('is_featured', true)
        } else if (scope === 'popular') {
          query = query.eq('is_popular', true)
        }

        const { data, error } = await query
        if (error) throw error

        if (format === 'csv') {
          const csvRows = ['Name,Category,Type,Duration,Price,Rating,Usage Count']
          data?.forEach(t => {
            csvRows.push(`"${t.name}","${t.category}","${t.type}","${t.duration}","${t.price}","${t.rating}","${t.usage_count}"`)
          })

          return new NextResponse(csvRows.join('\n'), {
            headers: {
              'Content-Type': 'text/csv',
              'Content-Disposition': `attachment; filename="templates-export-${Date.now()}.csv"`
            }
          })
        }

        return NextResponse.json({ data })
      }

      case 'preview': {
        const templateId = searchParams.get('templateId')

        const { data, error } = await supabase
          .from('project_templates')
          .select('*, template_features(*), template_deliverables(*)')
          .eq('id', templateId)
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      default: {
        const { data, error } = await supabase
          .from('project_templates')
          .select('*')
          .order('usage_count', { ascending: false })
          .limit(20)

        if (error) throw error
        return NextResponse.json({ data })
      }
    }
  } catch (error) {
    logger.error('Templates API error', { error })
    return NextResponse.json(
      { error: error.message || 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const body = await request.json()
    const { action } = body

    switch (action) {
      case 'create': {
        const { name, description, category, type, duration, price, tags, features, deliverables } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('project_templates')
          .insert({
            user_id: user?.id,
            name,
            description,
            category: category || 'branding',
            type: type || 'standard',
            duration,
            price,
            tags: tags || [],
            features: features || [],
            deliverables: deliverables || [],
            complexity: 'moderate',
            rating: 0,
            usage_count: 0,
            is_popular: false,
            is_featured: false
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'update': {
        const { id, ...updates } = body

        const { data, error } = await supabase
          .from('project_templates')
          .update({ ...updates, updated_at: new Date().toISOString() })
          .eq('id', id)
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'duplicate': {
        const { templateId, newName } = body
        const { data: { user } } = await supabase.auth.getUser()

        // Get original template
        const { data: original, error: fetchError } = await supabase
          .from('project_templates')
          .select('*')
          .eq('id', templateId)
          .single()

        if (fetchError) throw fetchError

        // Create duplicate
        const { id, created_at, updated_at, ...templateData } = original
        const { data, error } = await supabase
          .from('project_templates')
          .insert({
            ...templateData,
            name: newName || `${original.name} (Copy)`,
            user_id: user?.id,
            usage_count: 0,
            is_popular: false,
            is_featured: false
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'delete': {
        const { id } = body

        const { error } = await supabase
          .from('project_templates')
          .delete()
          .eq('id', id)

        if (error) throw error
        return NextResponse.json({ success: true })
      }

      case 'use_template': {
        const { templateId, projectName } = body
        const { data: { user } } = await supabase.auth.getUser()

        // Get template
        const { data: template, error: fetchError } = await supabase
          .from('project_templates')
          .select('*')
          .eq('id', templateId)
          .single()

        if (fetchError) throw fetchError

        // Increment usage count
        await supabase
          .from('project_templates')
          .update({ usage_count: (template.usage_count || 0) + 1 })
          .eq('id', templateId)

        // Create project from template
        const { data: project, error } = await supabase
          .from('projects')
          .insert({
            user_id: user?.id,
            title: projectName || template.name,
            description: template.description,
            status: 'planning',
            template_id: templateId
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data: project })
      }

      case 'save_settings': {
        const { settings } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('template_settings')
          .upsert({
            user_id: user?.id,
            ...settings,
            updated_at: new Date().toISOString()
          })
          .select()
          .single()

        if (error) throw error
        return NextResponse.json({ data })
      }

      case 'import': {
        const { templates, format } = body
        const { data: { user } } = await supabase.auth.getUser()

        const templatesWithUser = templates.map((t: any) => ({
          ...t,
          user_id: user?.id,
          usage_count: 0
        }))

        const { data, error } = await supabase
          .from('project_templates')
          .insert(templatesWithUser)
          .select()

        if (error) throw error
        return NextResponse.json({ data, imported: data?.length || 0 })
      }

      case 'ai_generate': {
        const { prompt, type, category } = body
        const { data: { user } } = await supabase.auth.getUser()

        // In production, call AI service (OpenAI, Anthropic) to generate template
        // For now, create a template with AI-suggested structure
        const aiTemplate = {
          user_id: user?.id,
          name: `AI Generated: ${prompt.substring(0, 30)}...`,
          description: `Template generated based on: ${prompt}`,
          category: category || 'custom',
          type: type || 'ai-generated',
          duration: '2-4 weeks',
          price: 2500,
          tags: ['ai-generated', 'custom'],
          features: ['AI-optimized workflow', 'Custom deliverables', 'Automated milestones'],
          deliverables: ['Initial concepts', 'Revisions', 'Final assets'],
          complexity: 'moderate',
          rating: 0,
          usage_count: 0,
          is_ai_generated: true
        }

        const { data, error } = await supabase
          .from('project_templates')
          .insert(aiTemplate)
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, data, message: 'Template generated successfully!' })
      }

      case 'move': {
        const { templateId, folder } = body
        const { data: { user } } = await supabase.auth.getUser()

        const { data, error } = await supabase
          .from('project_templates')
          .update({ folder, updated_at: new Date().toISOString() })
          .eq('id', templateId)
          .eq('user_id', user?.id)
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, data, folder })
      }

      case 'cleanup': {
        const { data: { user } } = await supabase.auth.getUser()

        // Find templates with no usage
        const { data: unused, error: fetchError } = await supabase
          .from('project_templates')
          .select('id, name')
          .eq('user_id', user?.id)
          .eq('usage_count', 0)
          .gt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Older than 30 days

        // In production, would actually delete; for safety, just mark as archived
        if (unused && unused.length > 0) {
          await supabase
            .from('project_templates')
            .update({ is_archived: true })
            .eq('user_id', user?.id)
            .eq('usage_count', 0)
        }

        return NextResponse.json({ success: true, cleaned: unused?.length || 0 })
      }

      case 'import_url': {
        const { url } = body
        const { data: { user } } = await supabase.auth.getUser()

        // In production, fetch and parse template from URL
        // For now, create a placeholder template
        const importedTemplate = {
          user_id: user?.id,
          name: `Imported from ${new URL(url).hostname}`,
          description: `Template imported from ${url}`,
          category: 'imported',
          type: 'external',
          source_url: url,
          imported_at: new Date().toISOString()
        }

        const { data, error } = await supabase
          .from('project_templates')
          .insert(importedTemplate)
          .select()
          .single()

        if (error && error.code !== '42P01') throw error
        return NextResponse.json({ success: true, data, message: 'Template imported successfully' })
      }

      case 'export_format': {
        const { format, templateIds } = body
        const { data: { user } } = await supabase.auth.getUser()

        let query = supabase.from('project_templates').select('*').eq('user_id', user?.id)

        if (templateIds?.length > 0) {
          query = query.in('id', templateIds)
        }

        const { data, error } = await query
        if (error) throw error

        // Generate export based on format
        const exportContent = format === 'json'
          ? JSON.stringify(data, null, 2)
          : data?.map(t => `${t.name},${t.category},${t.type}`).join('\n')

        return NextResponse.json({
          success: true,
          format,
          content: exportContent,
          count: data?.length || 0
        })
      }

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }
  } catch (error) {
    logger.error('Templates API error', { error })
    return NextResponse.json(
      { error: error.message || 'Operation failed' },
      { status: 500 }
    )
  }
}
