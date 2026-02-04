import { NextRequest, NextResponse } from 'next/server';
import { createSimpleLogger } from '@/lib/simple-logger';
import { PDFDocument, rgb, StandardFonts } from 'pdf-lib';

// ============================================================================
// DEMO MODE CONFIGURATION - Auto-added for alex@freeflow.io support
// ============================================================================

const DEMO_USER_ID = '00000000-0000-0000-0000-000000000001'
const DEMO_USER_EMAIL = 'alex@freeflow.io'

function isDemoMode(request: NextRequest): boolean {
  if (typeof request === 'undefined') return false
  const url = new URL(request.url)
  return (
    url.searchParams.get('demo') === 'true' ||
    request.cookies.get('demo_mode')?.value === 'true' ||
    request.headers.get('X-Demo-Mode') === 'true'
  )
}

function getDemoUserId(session: any, demoMode: boolean): string | null {
  if (!session?.user) {
    return demoMode ? DEMO_USER_ID : null
  }

  const userEmail = session.user.email
  const isDemoAccount = userEmail === DEMO_USER_EMAIL ||
                       userEmail === 'demo@kazi.io' ||
                       userEmail === 'test@kazi.dev'

  if (isDemoAccount || demoMode) {
    return DEMO_USER_ID
  }

  return session.user.id || session.user.authId || null
}

const logger = createSimpleLogger('API-CVPortfolio');

/**
 * CV Portfolio API Route
 * Handles CV/Portfolio operations: export (PDF/JSON), share, generate AI enhancements
 */

// Types
interface ProfileData {
  name: string;
  title: string;
  location: string;
  email: string;
  phone: string;
  website: string;
  bio: string;
  avatar?: string;
}

interface Experience {
  id: number;
  company: string;
  position: string;
  period: string;
  location: string;
  description: string;
  achievements: string[];
  technologies: string[];
}

interface Project {
  id: number;
  title: string;
  description: string;
  technologies: string[];
  link?: string;
  status: string;
}

interface Skill {
  category: string;
  items: string[];
  level: number;
  expertise: string;
  years: string;
}

interface CVData {
  profile: ProfileData;
  experience: Experience[];
  projects: Project[];
  skills: Skill[];
  education: any[];
  achievements: any[];
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, data } = body;

    switch (action) {
      case 'export-pdf':
        return await handleExportPDF(data);
      case 'export-json':
        return await handleExportJSON(data);
      case 'share':
        return await handleShare(data);
      case 'ai-enhance':
        return await handleAIEnhance(data);
      case 'generate-cover-letter':
        return await handleGenerateCoverLetter(data);
      default:
        return NextResponse.json(
          { success: false, error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    logger.error('CV Portfolio API error', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    return NextResponse.json(
      { success: false, error: error.message || 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const format = searchParams.get('format') || 'json';
    const userId = searchParams.get('userId') || 'user-1';

    // Mock CV data retrieval
    const cvData = getMockCVData(userId);

    if (format === 'pdf') {
      // Generate professional PDF using pdf-lib
      const pdfContent = await generatePDFContent(cvData);
      return new NextResponse(pdfContent, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="cv-${userId}-${Date.now()}.pdf"`,
        },
      });
    }

    return NextResponse.json({
      success: true,
      data: cvData,
    });
  } catch (error) {
    logger.error('CV Portfolio GET error', { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : undefined });
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * Export CV as PDF
 */
async function handleExportPDF(data: CVData): Promise<NextResponse> {
  // Generate professional PDF using pdf-lib
  const pdfContent = await generatePDFContent(data);

  return new NextResponse(pdfContent, {
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="cv-${data.profile.name.replace(/\s/g, '-')}-${Date.now()}.pdf"`,
    },
  });
}

/**
 * Export CV as JSON
 */
async function handleExportJSON(data: CVData): Promise<NextResponse> {
  const jsonContent = JSON.stringify(data, null, 2);

  return new NextResponse(jsonContent, {
    headers: {
      'Content-Type': 'application/json',
      'Content-Disposition': `attachment; filename="cv-${data.profile.name.replace(/\s/g, '-')}-${Date.now()}.json"`,
    },
  });
}

/**
 * Share CV/Portfolio
 */
async function handleShare(data: {
  cvId?: string;
  method: 'email' | 'link' | 'social';
  recipient?: string;
}): Promise<NextResponse> {
  const shareId = `cv-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  const shareUrl = `https://kazi.app/portfolio/${shareId}`;

  let message = 'CV shared successfully!';
  let shareLinks: any = {};

  switch (data.method) {
    case 'email':
      message = `CV sent to ${data.recipient || 'recipient'}`;
      // In production: integrate with email service (SendGrid, AWS SES)
      break;

    case 'link':
      message = 'Shareable link generated';
      shareLinks.url = shareUrl;
      shareLinks.qrCode = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(shareUrl)}`;
      break;

    case 'social':
      message = 'Social sharing links generated';
      shareLinks = {
        linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`,
        twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(shareUrl)}&text=Check%20out%20my%20professional%20portfolio!`,
        facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
        whatsapp: `https://wa.me/?text=Check%20out%20my%20portfolio:%20${encodeURIComponent(shareUrl)}`,
      };
      break;
  }

  return NextResponse.json({
    success: true,
    action: 'share',
    message,
    shareId,
    shareUrl,
    shareLinks,
    expiresIn: '30 days',
  });
}

/**
 * AI-Enhanced CV improvements
 */
async function handleAIEnhance(data: {
  section: 'bio' | 'experience' | 'skills' | 'achievements' | 'all';
  content: any;
  targetRole?: string;
  industry?: string;
}): Promise<NextResponse> {
  // In production: integrate with OpenRouter/Claude for real AI enhancement

  const enhancements: any = {};
  const suggestions: string[] = [];

  switch (data.section) {
    case 'bio':
      enhancements.bio = {
        original: data.content,
        enhanced: `${data.content} Additional AI-optimized keywords for ${data.targetRole || 'leadership roles'} in ${data.industry || 'technology'}.`,
        improvements: [
          'Added industry-specific keywords',
          'Improved action verb usage',
          'Quantified achievements',
          'Optimized for ATS scanning'
        ],
        keywords: ['leadership', 'innovation', 'strategic', 'scalable', 'AI-powered'],
        atsScore: 94,
      };
      suggestions.push('Consider adding specific metrics about team size or budget managed');
      suggestions.push('Highlight cross-functional collaboration experience');
      break;

    case 'experience':
      enhancements.experience = {
        improvements: [
          'Start each bullet with strong action verbs',
          'Quantify achievements with specific metrics',
          'Add context about company size and industry',
          'Include technologies and methodologies used'
        ],
        actionVerbs: ['Architected', 'Spearheaded', 'Optimized', 'Delivered', 'Transformed'],
        atsScore: 91,
      };
      suggestions.push('Add 2-3 more quantifiable achievements per role');
      suggestions.push('Include leadership responsibilities and team size');
      break;

    case 'skills':
      enhancements.skills = {
        trending: [
          { skill: 'AI/ML Engineering', demand: 'Very High', growth: '+145%' },
          { skill: 'Cloud Architecture', demand: 'High', growth: '+98%' },
          { skill: 'DevOps/Platform Engineering', demand: 'High', growth: '+87%' },
        ],
        recommendations: [
          'Consider adding certifications for key skills',
          'Group skills by proficiency level',
          'Add recent projects demonstrating each skill',
        ],
        atsScore: 96,
      };
      suggestions.push('Add specific versions/frameworks (e.g., "React 18" instead of "React")');
      suggestions.push('Include years of experience for top 5 skills');
      break;

    case 'achievements':
      enhancements.achievements = {
        impact: 'High',
        recommendations: [
          'Quantify award significance (e.g., "Top 1% of nominees")',
          'Add business impact of achievements',
          'Include media coverage or recognition links',
        ],
        atsScore: 89,
      };
      suggestions.push('Add industry-specific awards and certifications');
      suggestions.push('Include speaking engagements and publications');
      break;

    case 'all':
      enhancements.overall = {
        atsScore: 93,
        readabilityScore: 87,
        impactScore: 91,
        improvements: [
          'Strong quantifiable achievements',
          'Excellent keyword optimization',
          'Clear progression and growth',
          'Industry-relevant technologies'
        ],
        opportunities: [
          'Add more leadership metrics',
          'Include volunteer/community work',
          'Expand on soft skills',
          'Add portfolio links for projects'
        ]
      };
      suggestions.push('Overall excellent CV - ready for senior leadership roles');
      suggestions.push('Consider creating role-specific versions for different applications');
      break;
  }

  return NextResponse.json({
    success: true,
    action: 'ai-enhance',
    section: data.section,
    enhancements,
    suggestions,
    atsScore: enhancements.overall?.atsScore || enhancements[data.section]?.atsScore || 92,
    message: `AI analysis complete for ${data.section} section`,
    nextSteps: [
      'Review and apply suggested improvements',
      'Update CV with enhanced content',
      'Export updated version',
      data.section === 'all' ? 'Run section-specific analysis for deeper insights' : undefined
    ].filter(Boolean),
  });
}

/**
 * Generate AI cover letter
 */
async function handleGenerateCoverLetter(data: {
  cvData: CVData;
  jobTitle: string;
  company: string;
  jobDescription?: string;
  tone?: 'professional' | 'enthusiastic' | 'formal';
}): Promise<NextResponse> {
  const tone = data.tone || 'professional';

  // Mock AI-generated cover letter (in production: use OpenRouter/Claude)
  const coverLetter = `Dear Hiring Manager at ${data.company},

I am writing to express my strong interest in the ${data.jobTitle} position at ${data.company}. With ${data.cvData.profile.bio.includes('10+') ? '10+' : '8+'} years of experience in ${data.cvData.skills[0]?.category || 'technology leadership'}, I am confident that my skills and expertise align perfectly with your requirements.

In my current role as ${data.cvData.experience[0]?.position || 'Technology Leader'}, I have:
${data.cvData.experience[0]?.achievements.slice(0, 3).map((ach: string) => `• ${ach}`).join('\n') || '• Led innovative technology initiatives'}

My technical expertise in ${data.cvData.skills.slice(0, 3).map((s: Skill) => s.category).join(', ')} combined with my proven track record of delivering results makes me an ideal candidate for this role.

I am particularly excited about ${data.company}'s mission and would welcome the opportunity to contribute to your team's success. I look forward to discussing how my experience can help drive your initiatives forward.

Thank you for considering my application.

Best regards,
${data.cvData.profile.name}`;

  return NextResponse.json({
    success: true,
    action: 'generate-cover-letter',
    coverLetter,
    metadata: {
      jobTitle: data.jobTitle,
      company: data.company,
      tone,
      wordCount: coverLetter.split(' ').length,
      generatedAt: new Date().toISOString(),
    },
    suggestions: [
      'Customize the opening paragraph with specific company research',
      'Add a specific example relevant to the job description',
      'Include a call-to-action in the closing',
    ],
    message: 'Cover letter generated successfully!',
    achievement: Math.random() > 0.7 ? {
      message: '🎯 Career Booster! First AI-generated cover letter!',
      badge: 'Career Accelerator',
      points: 15,
    } : undefined,
  });
}

/**
 * Generate professional PDF CV using pdf-lib
 */
async function generatePDFContent(data: CVData): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.create();
  const helveticaBold = await pdfDoc.embedFont(StandardFonts.HelveticaBold);
  const helvetica = await pdfDoc.embedFont(StandardFonts.Helvetica);

  // Colors
  const primaryColor = rgb(0.13, 0.59, 0.95); // Blue
  const darkGray = rgb(0.2, 0.2, 0.2);
  const lightGray = rgb(0.5, 0.5, 0.5);

  let page = pdfDoc.addPage([612, 792]); // Letter size
  const { width, height } = page.getSize();
  let y = height - 50;

  // Helper functions
  const drawText = (text: string, x: number, yPos: number, options: { font?: any; size?: number; color?: any } = {}) => {
    const { font = helvetica, size = 10, color = darkGray } = options;
    page.drawText(text, { x, y: yPos, size, font, color });
  };

  const wrapText = (text: string, maxWidth: number, font: any, fontSize: number): string[] => {
    const words = text.split(' ');
    const lines: string[] = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const testWidth = font.widthOfTextAtSize(testLine, fontSize);

      if (testWidth > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }
    if (currentLine) lines.push(currentLine);
    return lines;
  };

  const checkNewPage = (neededSpace: number) => {
    if (y - neededSpace < 50) {
      page = pdfDoc.addPage([612, 792]);
      y = height - 50;
    }
  };

  // Header - Name and Title
  drawText(data.profile.name, 50, y, { font: helveticaBold, size: 24, color: primaryColor });
  y -= 25;
  drawText(data.profile.title, 50, y, { font: helvetica, size: 14, color: lightGray });
  y -= 20;

  // Contact info
  const contactLine = `${data.profile.email} | ${data.profile.phone} | ${data.profile.location}`;
  drawText(contactLine, 50, y, { size: 9, color: lightGray });
  y -= 15;
  if (data.profile.website) {
    drawText(data.profile.website, 50, y, { size: 9, color: primaryColor });
    y -= 20;
  }

  // Divider line
  page.drawLine({ start: { x: 50, y }, end: { x: width - 50, y }, thickness: 1, color: rgb(0.85, 0.85, 0.85) });
  y -= 25;

  // Bio/Summary
  if (data.profile.bio) {
    drawText('PROFESSIONAL SUMMARY', 50, y, { font: helveticaBold, size: 12, color: primaryColor });
    y -= 18;
    const bioLines = wrapText(data.profile.bio, width - 100, helvetica, 10);
    for (const line of bioLines) {
      checkNewPage(15);
      drawText(line, 50, y);
      y -= 14;
    }
    y -= 10;
  }

  // Experience
  if (data.experience && data.experience.length > 0) {
    checkNewPage(50);
    drawText('EXPERIENCE', 50, y, { font: helveticaBold, size: 12, color: primaryColor });
    y -= 20;

    for (const exp of data.experience) {
      checkNewPage(80);
      drawText(exp.position, 50, y, { font: helveticaBold, size: 11 });
      y -= 14;
      drawText(`${exp.company} | ${exp.location}`, 50, y, { size: 10, color: lightGray });
      drawText(exp.period, width - 50 - helvetica.widthOfTextAtSize(exp.period, 10), y, { size: 10, color: lightGray });
      y -= 14;

      if (exp.description) {
        const descLines = wrapText(exp.description, width - 100, helvetica, 9);
        for (const line of descLines) {
          checkNewPage(12);
          drawText(line, 50, y, { size: 9 });
          y -= 12;
        }
      }

      if (exp.achievements && exp.achievements.length > 0) {
        for (const achievement of exp.achievements.slice(0, 3)) {
          checkNewPage(12);
          const achLines = wrapText(`• ${achievement}`, width - 110, helvetica, 9);
          for (const line of achLines) {
            drawText(line, 60, y, { size: 9 });
            y -= 12;
          }
        }
      }
      y -= 10;
    }
  }

  // Skills
  if (data.skills && data.skills.length > 0) {
    checkNewPage(50);
    drawText('SKILLS', 50, y, { font: helveticaBold, size: 12, color: primaryColor });
    y -= 18;

    for (const skill of data.skills) {
      checkNewPage(20);
      drawText(`${skill.category}:`, 50, y, { font: helveticaBold, size: 10 });
      const skillItems = skill.items.join(', ');
      const skillLines = wrapText(skillItems, width - 150, helvetica, 9);
      let xOffset = 50 + helveticaBold.widthOfTextAtSize(`${skill.category}: `, 10);

      for (let i = 0; i < skillLines.length; i++) {
        if (i === 0) {
          drawText(skillLines[i], xOffset, y, { size: 9 });
        } else {
          y -= 12;
          drawText(skillLines[i], 50, y, { size: 9 });
        }
      }
      y -= 16;
    }
  }

  // Projects
  if (data.projects && data.projects.length > 0) {
    checkNewPage(50);
    drawText('PROJECTS', 50, y, { font: helveticaBold, size: 12, color: primaryColor });
    y -= 18;

    for (const project of data.projects.slice(0, 4)) {
      checkNewPage(40);
      drawText(project.title, 50, y, { font: helveticaBold, size: 10 });
      if (project.status) {
        drawText(`[${project.status}]`, width - 50 - helvetica.widthOfTextAtSize(`[${project.status}]`, 9), y, { size: 9, color: lightGray });
      }
      y -= 14;

      if (project.description) {
        const projLines = wrapText(project.description, width - 100, helvetica, 9);
        for (const line of projLines.slice(0, 2)) {
          checkNewPage(12);
          drawText(line, 50, y, { size: 9 });
          y -= 12;
        }
      }

      if (project.technologies && project.technologies.length > 0) {
        const techStr = project.technologies.join(', ');
        drawText(`Tech: ${techStr}`, 50, y, { size: 8, color: lightGray });
        y -= 14;
      }
      y -= 5;
    }
  }

  // Education
  if (data.education && data.education.length > 0) {
    checkNewPage(40);
    drawText('EDUCATION', 50, y, { font: helveticaBold, size: 12, color: primaryColor });
    y -= 18;

    for (const edu of data.education) {
      checkNewPage(30);
      drawText(edu.degree || edu.title || 'Degree', 50, y, { font: helveticaBold, size: 10 });
      y -= 14;
      drawText(`${edu.institution || edu.school || 'Institution'} | ${edu.year || edu.period || ''}`, 50, y, { size: 9, color: lightGray });
      y -= 18;
    }
  }

  // Footer
  page.drawText(`Generated by KAZI | ${new Date().toLocaleDateString()}`, 50, 30, {
    size: 8,
    font: helvetica,
    color: lightGray
  });

  return pdfDoc.save();
}

/**
 * Get mock CV data for testing
 */
function getMockCVData(userId: string): CVData {
  return {
    profile: {
      name: 'Alex Thompson',
      title: 'KAZI Platform Architect & AI Innovation Lead',
      location: 'Cape Town, South Africa',
      email: 'alex@kazi.com',
      phone: '+27 82 456 7890',
      website: 'kazi.app',
      bio: 'Visionary technologist with 10+ years of experience architecting world-class platforms.',
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=Alex',
    },
    experience: [
      {
        id: 1,
        company: 'KAZI Technologies',
        position: 'Chief Technology Officer',
        period: '2020 - Present',
        location: 'Cape Town, SA',
        description: 'Led development of revolutionary AI-powered business platform.',
        achievements: [
          'Built platform serving 25,000+ users across 50 countries',
          'Achieved 99.97% uptime and 96.8% AI accuracy',
        ],
        technologies: ['React', 'Node.js', 'Python', 'AWS'],
      },
    ],
    projects: [
      {
        id: 1,
        title: 'KAZI Platform',
        description: 'All-in-one business platform with AI-powered tools',
        technologies: ['React', 'Node.js', 'Python'],
        link: 'https://kazi.app',
        status: 'Live',
      },
    ],
    skills: [
      {
        category: 'AI & Machine Learning',
        items: ['TensorFlow', 'PyTorch', 'GPT-4'],
        level: 98,
        expertise: 'Expert',
        years: '8+',
      },
    ],
    education: [],
    achievements: [],
  };
}
