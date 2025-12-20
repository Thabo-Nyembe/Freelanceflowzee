'use server'

/**
 * Extended Portfolio Server Actions - Covers all 18 Portfolio-related tables
 */

import { createClient } from '@/lib/supabase/server'

export async function getPortfolio(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio').select('*').eq('user_id', userId).single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function createPortfolio(userId: string, input: { title: string; bio?: string; theme_id?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio').insert({ user_id: userId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function updatePortfolio(portfolioId: string, updates: any) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio').update(updates).eq('id', portfolioId).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioAnalytics(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_analytics').select('*').eq('portfolio_id', portfolioId).order('date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPortfolioCertifications(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_certifications').select('*').eq('portfolio_id', portfolioId).order('issue_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioCertification(portfolioId: string, input: { name: string; issuer: string; issue_date: string; credential_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_certifications').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioContacts(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_contacts').select('*').eq('portfolio_id', portfolioId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioContact(portfolioId: string, input: { type: string; value: string; is_primary?: boolean }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_contacts').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioEducation(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_education').select('*').eq('portfolio_id', portfolioId).order('start_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioEducation(portfolioId: string, input: { institution: string; degree: string; field?: string; start_date: string; end_date?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_education').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioExperience(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_experience').select('*').eq('portfolio_id', portfolioId).order('start_date', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioExperience(portfolioId: string, input: { company: string; title: string; start_date: string; end_date?: string; description?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_experience').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioPages(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_pages').select('*').eq('portfolio_id', portfolioId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortfolioPage(portfolioId: string, input: { title: string; slug: string; content?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_pages').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioProjectImages(projectId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_project_images').select('*').eq('project_id', projectId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioProjectImage(projectId: string, imageUrl: string, order?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_project_images').insert({ project_id: projectId, image_url: imageUrl, order }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioProjects(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_projects').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortfolioProject(portfolioId: string, input: { title: string; description?: string; url?: string; tags?: string[] }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_projects').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioSections(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_sections').select('*').eq('portfolio_id', portfolioId).order('order', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortfolioSection(portfolioId: string, input: { title: string; type: string; content?: any }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_sections').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioShares(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_shares').select('*').eq('portfolio_id', portfolioId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function createPortfolioShare(portfolioId: string, shareType: string, expiresAt?: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_shares').insert({ portfolio_id: portfolioId, share_type: shareType, expires_at: expiresAt }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioSkills(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_skills').select('*').eq('portfolio_id', portfolioId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioSkill(portfolioId: string, skill: string, level?: number) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_skills').insert({ portfolio_id: portfolioId, skill, level }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioSocialLinks(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_social_links').select('*').eq('portfolio_id', portfolioId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioSocialLink(portfolioId: string, platform: string, url: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_social_links').insert({ portfolio_id: portfolioId, platform, url }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioTestimonials(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_testimonials').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioTestimonial(portfolioId: string, input: { author_name: string; content: string; company?: string; role?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_testimonials').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioThemes() {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_themes').select('*').order('name', { ascending: true }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPortfolioVideoAnalytics(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_video_analytics').select('*').eq('portfolio_id', portfolioId); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPortfolioVideos(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_videos').select('*').eq('portfolio_id', portfolioId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function addPortfolioVideo(portfolioId: string, input: { title: string; url: string; thumbnail_url?: string }) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_videos').insert({ portfolio_id: portfolioId, ...input }).select().single(); if (error) throw error; return { success: true, data } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function trackPortfolioView(portfolioId: string, viewerInfo?: any) {
  try { const supabase = await createClient(); const { error } = await supabase.from('portfolio_view_events').insert({ portfolio_id: portfolioId, viewed_at: new Date().toISOString(), viewer_info: viewerInfo }); if (error) throw error; return { success: true } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed' } }
}

export async function getPortfolioViewEvents(portfolioId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolio_view_events').select('*').eq('portfolio_id', portfolioId).order('viewed_at', { ascending: false }).limit(100); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}

export async function getPortfolios(userId: string) {
  try { const supabase = await createClient(); const { data, error } = await supabase.from('portfolios').select('*').eq('user_id', userId).order('created_at', { ascending: false }); if (error) throw error; return { success: true, data: data || [] } } catch (error) { return { success: false, error: error instanceof Error ? error.message : 'Failed', data: [] } }
}
