import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const supabase = await createClient()

    // Fetch proposal data
    const { data: proposal, error } = await supabase
      .from('proposals')
      .select('*')
      .eq('id', id)
      .single()

    if (error) {
      return NextResponse.json({ success: false, error: 'Proposal not found' }, { status: 404 })
    }

    // Generate PDF content (simplified - in production use a PDF library like jsPDF or puppeteer)
    const pdfContent = generateProposalPDF(proposal)

    // Return as downloadable file
    return new NextResponse(pdfContent, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="proposal-${proposal.proposal_number || id}.pdf"`,
      },
    })
  } catch (error) {
    return NextResponse.json({ success: false, error: 'Failed to download proposal' }, { status: 500 })
  }
}

function generateProposalPDF(proposal: Record<string, unknown>): Buffer {
  // This is a simplified PDF generation
  // In production, use a proper PDF library like jsPDF, PDFKit, or Puppeteer

  const content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj
2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj
3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>
endobj
4 0 obj
<< /Length 200 >>
stream
BT
/F1 24 Tf
50 700 Td
(${String(proposal.title || 'Proposal').replace(/[()\\]/g, '')}) Tj
/F1 12 Tf
0 -30 Td
(Client: ${String(proposal.client_name || 'N/A').replace(/[()\\]/g, '')}) Tj
0 -20 Td
(Value: $${String(proposal.total_value || proposal.value || 0).replace(/[()\\]/g, '')}) Tj
0 -20 Td
(Status: ${String(proposal.status || 'draft').replace(/[()\\]/g, '')}) Tj
ET
endstream
endobj
5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj
xref
0 6
0000000000 65535 f
0000000009 00000 n
0000000058 00000 n
0000000115 00000 n
0000000266 00000 n
0000000518 00000 n
trailer
<< /Size 6 /Root 1 0 R >>
startxref
595
%%EOF
  `.trim()

  return Buffer.from(content, 'utf-8')
}
