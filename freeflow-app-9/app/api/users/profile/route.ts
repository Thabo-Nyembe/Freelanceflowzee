// =====================================================
// KAZI Users Profile API - Comprehensive Route
// Full user profile management with skills, experience, portfolio
// =====================================================

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createSimpleLogger } from '@/lib/simple-logger'
import { isDemoMode, getDemoUserId } from '@/lib/utils/demo-mode';


const logger = createSimpleLogger('user-profile');

// =====================================================
// GET - Get user profile, skills, experience, portfolio
// =====================================================
export async function GET(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const targetUserId = searchParams.get('userId');

    // Use authenticated user's ID or specified user ID (for public profiles)
    const userId = targetUserId || user?.id;

    // Demo mode for completely unauthenticated users with no target
    if (!userId) {
      return handleDemoGet(action);
    }

    switch (action) {
      case 'profile': {
        const profile = await getProfile(supabase, userId);
        return NextResponse.json({ success: true, profile });
      }

      case 'complete': {
        const completeProfile = await getCompleteProfile(supabase, userId);
        return NextResponse.json({ success: true, ...completeProfile });
      }

      case 'skills': {
        const skills = await getSkills(supabase, userId);
        return NextResponse.json({ success: true, skills });
      }

      case 'experience': {
        const experience = await getExperience(supabase, userId);
        return NextResponse.json({ success: true, experience });
      }

      case 'education': {
        const education = await getEducation(supabase, userId);
        return NextResponse.json({ success: true, education });
      }

      case 'portfolio': {
        const limit = parseInt(searchParams.get('limit') || '20');
        const category = searchParams.get('category');
        const portfolio = await getPortfolio(supabase, userId, limit, category);
        return NextResponse.json({ success: true, portfolio });
      }

      case 'social-links': {
        const socialLinks = await getSocialLinks(supabase, userId);
        return NextResponse.json({ success: true, socialLinks });
      }

      case 'achievements': {
        const achievements = await getAchievements(supabase, userId);
        return NextResponse.json({ success: true, achievements });
      }

      case 'stats': {
        const stats = await getProfileStats(supabase, userId);
        return NextResponse.json({ success: true, stats });
      }

      case 'service-status': {
        return NextResponse.json({
          success: true,
          service: 'User Profile Service',
          version: '2.0.0',
          status: 'operational',
          capabilities: [
            'profile_management',
            'skills_tracking',
            'experience_history',
            'education_records',
            'portfolio_showcase',
            'social_links',
            'achievements_system',
            'profile_analytics'
          ]
        });
      }

      default: {
        // Return profile with basic stats
        const [profile, stats] = await Promise.all([
          getProfile(supabase, userId),
          getProfileStats(supabase, userId)
        ]);
        return NextResponse.json({ success: true, profile, stats });
      }
    }
  } catch (error) {
    logger.error('Profile GET error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to fetch profile data' },
      { status: 500 }
    );
  }
}

// =====================================================
// POST - Create/update profile sections
// =====================================================
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...data } = body;

    switch (action) {
      case 'create-profile': {
        const profile = await createOrUpdateProfile(supabase, user.id, data);
        return NextResponse.json({
          success: true,
          action: 'create-profile',
          profile,
          message: 'Profile created successfully'
        }, { status: 201 });
      }

      case 'add-skill': {
        const skill = await addSkill(supabase, user.id, {
          name: data.name,
          category: data.category,
          level: data.level,
          yearsOfExperience: data.yearsOfExperience
        });
        return NextResponse.json({
          success: true,
          action: 'add-skill',
          skill,
          message: 'Skill added'
        });
      }

      case 'add-experience': {
        const experience = await addExperience(supabase, user.id, {
          company: data.company,
          title: data.title,
          location: data.location,
          startDate: data.startDate,
          endDate: data.endDate,
          current: data.current,
          description: data.description,
          achievements: data.achievements
        });
        return NextResponse.json({
          success: true,
          action: 'add-experience',
          experience,
          message: 'Experience added'
        });
      }

      case 'add-education': {
        const education = await addEducation(supabase, user.id, {
          school: data.school,
          degree: data.degree,
          field: data.field,
          startDate: data.startDate,
          endDate: data.endDate,
          current: data.current,
          grade: data.grade,
          activities: data.activities
        });
        return NextResponse.json({
          success: true,
          action: 'add-education',
          education,
          message: 'Education added'
        });
      }

      case 'add-portfolio': {
        const portfolioItem = await addPortfolioItem(supabase, user.id, {
          title: data.title,
          description: data.description,
          category: data.category,
          tags: data.tags,
          thumbnail: data.thumbnail,
          images: data.images,
          url: data.url,
          featured: data.featured
        });
        return NextResponse.json({
          success: true,
          action: 'add-portfolio',
          portfolioItem,
          message: 'Portfolio item added'
        });
      }

      case 'add-social-link': {
        const socialLink = await addSocialLink(supabase, user.id, {
          platform: data.platform,
          url: data.url,
          displayName: data.displayName
        });
        return NextResponse.json({
          success: true,
          action: 'add-social-link',
          socialLink,
          message: 'Social link added'
        });
      }

      case 'endorse-skill': {
        const skill = await endorseSkill(supabase, data.skillId, user.id);
        return NextResponse.json({
          success: true,
          action: 'endorse-skill',
          skill,
          message: 'Skill endorsed'
        });
      }

      case 'track-profile-view': {
        await trackProfileView(supabase, data.viewedUserId, user.id);
        return NextResponse.json({
          success: true,
          action: 'track-profile-view',
          message: 'View tracked'
        });
      }

      case 'upload-avatar': {
        const avatarUrl = await uploadAvatar(supabase, user.id, data.avatarData);
        return NextResponse.json({
          success: true,
          action: 'upload-avatar',
          avatarUrl,
          message: 'Avatar uploaded'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Profile POST error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Operation failed' },
      { status: 500 }
    );
  }
}

// =====================================================
// PUT - Update profile sections
// =====================================================
export async function PUT(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { section, id, ...updates } = body;

    switch (section) {
      case 'profile': {
        const profile = await updateProfile(supabase, user.id, updates);
        return NextResponse.json({
          success: true,
          profile,
          message: 'Profile updated'
        });
      }

      case 'skill': {
        const skill = await updateSkill(supabase, user.id, id, updates);
        return NextResponse.json({
          success: true,
          skill,
          message: 'Skill updated'
        });
      }

      case 'experience': {
        const experience = await updateExperience(supabase, user.id, id, updates);
        return NextResponse.json({
          success: true,
          experience,
          message: 'Experience updated'
        });
      }

      case 'education': {
        const education = await updateEducation(supabase, user.id, id, updates);
        return NextResponse.json({
          success: true,
          education,
          message: 'Education updated'
        });
      }

      case 'portfolio': {
        const portfolioItem = await updatePortfolioItem(supabase, user.id, id, updates);
        return NextResponse.json({
          success: true,
          portfolioItem,
          message: 'Portfolio item updated'
        });
      }

      case 'social-link': {
        const socialLink = await updateSocialLink(supabase, user.id, id, updates);
        return NextResponse.json({
          success: true,
          socialLink,
          message: 'Social link updated'
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown section: ${section}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Profile PUT error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to update' },
      { status: 500 }
    );
  }
}

// =====================================================
// DELETE - Remove profile sections
// =====================================================
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const section = searchParams.get('section');
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'ID required for deletion' },
        { status: 400 }
      );
    }

    switch (section) {
      case 'skill': {
        await deleteSkill(supabase, user.id, id);
        return NextResponse.json({ success: true, message: 'Skill deleted' });
      }

      case 'experience': {
        await deleteExperience(supabase, user.id, id);
        return NextResponse.json({ success: true, message: 'Experience deleted' });
      }

      case 'education': {
        await deleteEducation(supabase, user.id, id);
        return NextResponse.json({ success: true, message: 'Education deleted' });
      }

      case 'portfolio': {
        await deletePortfolioItem(supabase, user.id, id);
        return NextResponse.json({ success: true, message: 'Portfolio item deleted' });
      }

      case 'social-link': {
        await deleteSocialLink(supabase, user.id, id);
        return NextResponse.json({ success: true, message: 'Social link deleted' });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown section: ${section}` },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('Profile DELETE error', { error });
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to delete' },
      { status: 500 }
    );
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function getProfile(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data;
}

async function getCompleteProfile(supabase: any, userId: string) {
  const [profile, skills, experience, education, portfolio, socialLinks, achievements, stats] = await Promise.all([
    getProfile(supabase, userId),
    getSkills(supabase, userId),
    getExperience(supabase, userId),
    getEducation(supabase, userId),
    getPortfolio(supabase, userId, 20),
    getSocialLinks(supabase, userId),
    getAchievements(supabase, userId),
    getProfileStats(supabase, userId)
  ]);

  return {
    profile,
    skills,
    experience,
    education,
    portfolio,
    socialLinks,
    achievements,
    stats
  };
}

async function getSkills(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .eq('user_id', userId)
    .order('endorsements', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getExperience(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('experience')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getEducation(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('education')
    .select('*')
    .eq('user_id', userId)
    .order('start_date', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getPortfolio(supabase: any, userId: string, limit: number, category?: string | null) {
  let query = supabase
    .from('portfolio')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (category) {
    query = query.eq('category', category);
  }

  const { data, error } = await query;
  if (error) throw error;
  return data || [];
}

async function getSocialLinks(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('social_links')
    .select('*')
    .eq('user_id', userId);

  if (error) throw error;
  return data || [];
}

async function getAchievements(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('achievements')
    .select('*')
    .eq('user_id', userId)
    .order('unlocked_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

async function getProfileStats(supabase: any, userId: string) {
  const { data, error } = await supabase
    .from('profile_stats')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || {
    profile_views: 0,
    profile_views_this_month: 0,
    connections: 0,
    endorsements: 0,
    portfolio_views: 0,
    portfolio_likes: 0,
    completion_percentage: 0
  };
}

async function createOrUpdateProfile(supabase: any, userId: string, data: any) {
  const { data: profile, error } = await supabase
    .from('user_profiles')
    .upsert({
      user_id: userId,
      first_name: data.firstName,
      last_name: data.lastName,
      phone: data.phone,
      bio: data.bio,
      location: data.location,
      website: data.website,
      company: data.company,
      position: data.position,
      avatar_url: data.avatarUrl,
      linkedin_url: data.linkedinUrl,
      twitter_url: data.twitterUrl,
      github_url: data.githubUrl,
      profile_visibility: data.profileVisibility || 'public',
      updated_at: new Date().toISOString()
    }, { onConflict: 'user_id' })
    .select()
    .single();

  if (error) throw error;
  return profile;
}

async function updateProfile(supabase: any, userId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  // Map camelCase to snake_case
  if (updates.firstName !== undefined) updateData.first_name = updates.firstName;
  if (updates.lastName !== undefined) updateData.last_name = updates.lastName;
  if (updates.phone !== undefined) updateData.phone = updates.phone;
  if (updates.bio !== undefined) updateData.bio = updates.bio;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.website !== undefined) updateData.website = updates.website;
  if (updates.company !== undefined) updateData.company = updates.company;
  if (updates.position !== undefined) updateData.position = updates.position;
  if (updates.avatarUrl !== undefined) updateData.avatar_url = updates.avatarUrl;
  if (updates.linkedinUrl !== undefined) updateData.linkedin_url = updates.linkedinUrl;
  if (updates.twitterUrl !== undefined) updateData.twitter_url = updates.twitterUrl;
  if (updates.githubUrl !== undefined) updateData.github_url = updates.githubUrl;
  if (updates.profileVisibility !== undefined) updateData.profile_visibility = updates.profileVisibility;
  if (updates.showEmail !== undefined) updateData.show_email = updates.showEmail;
  if (updates.showPhone !== undefined) updateData.show_phone = updates.showPhone;

  const { data: profile, error } = await supabase
    .from('user_profiles')
    .update(updateData)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return profile;
}

async function addSkill(supabase: any, userId: string, data: any) {
  const { data: skill, error } = await supabase
    .from('skills')
    .insert({
      user_id: userId,
      name: data.name,
      category: data.category,
      level: data.level || 'intermediate',
      years_of_experience: data.yearsOfExperience || 0
    })
    .select()
    .single();

  if (error) throw error;
  return skill;
}

async function updateSkill(supabase: any, userId: string, skillId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.name !== undefined) updateData.name = updates.name;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.level !== undefined) updateData.level = updates.level;
  if (updates.yearsOfExperience !== undefined) updateData.years_of_experience = updates.yearsOfExperience;

  const { data: skill, error } = await supabase
    .from('skills')
    .update(updateData)
    .eq('id', skillId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return skill;
}

async function deleteSkill(supabase: any, userId: string, skillId: string) {
  const { error } = await supabase
    .from('skills')
    .delete()
    .eq('id', skillId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function endorseSkill(supabase: any, skillId: string, endorserId: string) {
  // First check if already endorsed
  const { data: existing } = await supabase
    .from('skill_endorsements')
    .select('id')
    .eq('skill_id', skillId)
    .eq('endorser_id', endorserId)
    .single();

  if (existing) {
    throw new Error('Already endorsed this skill');
  }

  // Add endorsement
  await supabase
    .from('skill_endorsements')
    .insert({
      skill_id: skillId,
      endorser_id: endorserId
    });

  // Increment endorsement count
  const { data: skill, error } = await supabase
    .rpc('increment_skill_endorsements', { skill_id: skillId });

  if (error) throw error;
  return skill;
}

async function addExperience(supabase: any, userId: string, data: any) {
  const { data: experience, error } = await supabase
    .from('experience')
    .insert({
      user_id: userId,
      company: data.company,
      title: data.title,
      location: data.location,
      start_date: data.startDate,
      end_date: data.endDate,
      current: data.current || false,
      description: data.description,
      achievements: data.achievements || []
    })
    .select()
    .single();

  if (error) throw error;
  return experience;
}

async function updateExperience(supabase: any, userId: string, experienceId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.company !== undefined) updateData.company = updates.company;
  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.location !== undefined) updateData.location = updates.location;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.current !== undefined) updateData.current = updates.current;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.achievements !== undefined) updateData.achievements = updates.achievements;

  const { data: experience, error } = await supabase
    .from('experience')
    .update(updateData)
    .eq('id', experienceId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return experience;
}

async function deleteExperience(supabase: any, userId: string, experienceId: string) {
  const { error } = await supabase
    .from('experience')
    .delete()
    .eq('id', experienceId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function addEducation(supabase: any, userId: string, data: any) {
  const { data: education, error } = await supabase
    .from('education')
    .insert({
      user_id: userId,
      school: data.school,
      degree: data.degree,
      field: data.field,
      start_date: data.startDate,
      end_date: data.endDate,
      current: data.current || false,
      grade: data.grade,
      activities: data.activities || []
    })
    .select()
    .single();

  if (error) throw error;
  return education;
}

async function updateEducation(supabase: any, userId: string, educationId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.school !== undefined) updateData.school = updates.school;
  if (updates.degree !== undefined) updateData.degree = updates.degree;
  if (updates.field !== undefined) updateData.field = updates.field;
  if (updates.startDate !== undefined) updateData.start_date = updates.startDate;
  if (updates.endDate !== undefined) updateData.end_date = updates.endDate;
  if (updates.current !== undefined) updateData.current = updates.current;
  if (updates.grade !== undefined) updateData.grade = updates.grade;
  if (updates.activities !== undefined) updateData.activities = updates.activities;

  const { data: education, error } = await supabase
    .from('education')
    .update(updateData)
    .eq('id', educationId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return education;
}

async function deleteEducation(supabase: any, userId: string, educationId: string) {
  const { error } = await supabase
    .from('education')
    .delete()
    .eq('id', educationId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function addPortfolioItem(supabase: any, userId: string, data: any) {
  const { data: item, error } = await supabase
    .from('portfolio')
    .insert({
      user_id: userId,
      title: data.title,
      description: data.description,
      category: data.category,
      tags: data.tags || [],
      thumbnail: data.thumbnail,
      images: data.images || [],
      url: data.url,
      featured: data.featured || false
    })
    .select()
    .single();

  if (error) throw error;
  return item;
}

async function updatePortfolioItem(supabase: any, userId: string, itemId: string, updates: any) {
  const updateData: any = { updated_at: new Date().toISOString() };

  if (updates.title !== undefined) updateData.title = updates.title;
  if (updates.description !== undefined) updateData.description = updates.description;
  if (updates.category !== undefined) updateData.category = updates.category;
  if (updates.tags !== undefined) updateData.tags = updates.tags;
  if (updates.thumbnail !== undefined) updateData.thumbnail = updates.thumbnail;
  if (updates.images !== undefined) updateData.images = updates.images;
  if (updates.url !== undefined) updateData.url = updates.url;
  if (updates.featured !== undefined) updateData.featured = updates.featured;

  const { data: item, error } = await supabase
    .from('portfolio')
    .update(updateData)
    .eq('id', itemId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return item;
}

async function deletePortfolioItem(supabase: any, userId: string, itemId: string) {
  const { error } = await supabase
    .from('portfolio')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function addSocialLink(supabase: any, userId: string, data: any) {
  const { data: link, error } = await supabase
    .from('social_links')
    .upsert({
      user_id: userId,
      platform: data.platform,
      url: data.url,
      display_name: data.displayName
    }, { onConflict: 'user_id,platform' })
    .select()
    .single();

  if (error) throw error;
  return link;
}

async function updateSocialLink(supabase: any, userId: string, linkId: string, updates: any) {
  const updateData: any = {};

  if (updates.url !== undefined) updateData.url = updates.url;
  if (updates.displayName !== undefined) updateData.display_name = updates.displayName;

  const { data: link, error } = await supabase
    .from('social_links')
    .update(updateData)
    .eq('id', linkId)
    .eq('user_id', userId)
    .select()
    .single();

  if (error) throw error;
  return link;
}

async function deleteSocialLink(supabase: any, userId: string, linkId: string) {
  const { error } = await supabase
    .from('social_links')
    .delete()
    .eq('id', linkId)
    .eq('user_id', userId);

  if (error) throw error;
}

async function trackProfileView(supabase: any, viewedUserId: string, viewerId: string) {
  // Don't track self-views
  if (viewedUserId === viewerId) return;

  // Log the view
  await supabase
    .from('profile_views')
    .insert({
      profile_user_id: viewedUserId,
      viewer_id: viewerId
    });

  // Increment view count
  await supabase.rpc('increment_profile_views', { profile_user_id: viewedUserId });
}

async function uploadAvatar(supabase: any, userId: string, avatarData: string) {
  // This would typically upload to storage
  // For now, we'll assume avatarData is already a URL
  const { data, error } = await supabase
    .from('user_profiles')
    .update({ avatar_url: avatarData, updated_at: new Date().toISOString() })
    .eq('user_id', userId)
    .select('avatar_url')
    .single();

  if (error) throw error;
  return data.avatar_url;
}

// =====================================================
// DEMO MODE HANDLER
// =====================================================
function handleDemoGet(action: string | null): NextResponse {
  const mockProfile = {
    id: '00000000-0000-0000-0000-000000000001',
    first_name: 'Alex',
    last_name: 'Johnson',
    bio: 'Creative professional specializing in brand design and digital experiences.',
    location: 'San Francisco, CA',
    company: 'Freelance',
    position: 'Senior Designer',
    avatar_url: '/demo/avatar.jpg',
    profile_visibility: 'public'
  };

  const mockSkills = [
    { id: '1', name: 'UI/UX Design', category: 'Design', level: 'expert', endorsements: 42 },
    { id: '2', name: 'Branding', category: 'Design', level: 'advanced', endorsements: 38 },
    { id: '3', name: 'Figma', category: 'Tools', level: 'expert', endorsements: 35 }
  ];

  const mockStats = {
    profile_views: 1250,
    profile_views_this_month: 142,
    connections: 89,
    endorsements: 156,
    portfolio_views: 3420,
    portfolio_likes: 234,
    completion_percentage: 92
  };

  switch (action) {
    case 'profile':
      return NextResponse.json({ success: true, profile: mockProfile, demo: true });
    case 'skills':
      return NextResponse.json({ success: true, skills: mockSkills, demo: true });
    case 'stats':
      return NextResponse.json({ success: true, stats: mockStats, demo: true });
    default:
      return NextResponse.json({
        success: true,
        profile: mockProfile,
        stats: mockStats,
        demo: true
      });
  }
}
