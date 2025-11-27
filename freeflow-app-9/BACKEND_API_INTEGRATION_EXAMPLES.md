# Backend API Integration Examples

This document provides example implementations for the API endpoints called by the client-zone tab pages.

## Gallery API Endpoints

### 1. Share Gallery Item
```typescript
// app/api/gallery/share/route.ts
import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { itemId, itemName, project } = await request.json()

    // Validate input
    if (!itemId || !itemName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate unique share link
    const shareToken = Buffer.from(
      JSON.stringify({ itemId, timestamp: Date.now() })
    ).toString('base64')

    const shareLink = `${process.env.NEXT_PUBLIC_APP_URL}/gallery/share/${shareToken}`

    // Save to database (pseudo code)
    // await db.galleryShares.create({
    //   itemId,
    //   token: shareToken,
    //   createdAt: new Date(),
    //   expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    // })

    return NextResponse.json({
      success: true,
      shareLink,
      expiresIn: '7 days'
    })
  } catch (error) {
    console.error('Share error:', error)
    return NextResponse.json(
      { error: 'Failed to generate share link' },
      { status: 500 }
    )
  }
}
```

### 2. Delete Gallery Item
```typescript
// app/api/gallery/items/route.ts
export async function DELETE(request: NextRequest) {
  try {
    const { itemId } = await request.json()

    if (!itemId) {
      return NextResponse.json(
        { error: 'Item ID required' },
        { status: 400 }
      )
    }

    // Delete from database
    // await db.galleryItems.delete({ where: { id: itemId } })

    // Delete associated files from storage
    // await storage.deleteFile(`gallery/${itemId}`)

    return NextResponse.json({
      success: true,
      message: 'Item deleted successfully'
    })
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to delete item' },
      { status: 500 }
    )
  }
}
```

### 3. Bulk Download
```typescript
// app/api/gallery/bulk-download/route.ts
import { createReadStream } from 'fs'
import { createWriteStream } from 'fs'
import archiver from 'archiver'

export async function POST(request: NextRequest) {
  try {
    const { itemIds } = await request.json()

    if (!itemIds || itemIds.length === 0) {
      return NextResponse.json(
        { error: 'No items selected' },
        { status: 400 }
      )
    }

    // Create ZIP file
    // const archive = archiver('zip', { zlib: { level: 9 } })
    // const output = createWriteStream(`/tmp/gallery-${Date.now()}.zip`)

    // Add files to archive
    // for (const itemId of itemIds) {
    //   const item = await db.galleryItems.findUnique({ where: { id: itemId } })
    //   archive.file(item.filePath, { name: item.name })
    // }

    // archive.pipe(output)
    // await archive.finalize()

    return NextResponse.json({
      success: true,
      downloadUrl: `/api/gallery/download/${downloadId}`,
      expiresIn: '24 hours'
    })
  } catch (error) {
    console.error('Bulk download error:', error)
    return NextResponse.json(
      { error: 'Failed to prepare download' },
      { status: 500 }
    )
  }
}
```

---

## Calendar API Endpoints

### 1. Join Meeting
```typescript
// app/api/meetings/join/route.ts
export async function POST(request: NextRequest) {
  try {
    const { meetingId, meetingTitle, participantName } = await request.json()

    // Record attendance
    // await db.meetingAttendance.create({
    //   meetingId,
    //   participantName,
    //   joinedAt: new Date()
    // })

    return NextResponse.json({
      success: true,
      message: 'Attendance recorded'
    })
  } catch (error) {
    console.error('Join meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to join meeting' },
      { status: 500 }
    )
  }
}
```

### 2. Schedule Meeting
```typescript
// app/api/meetings/schedule/route.ts
export async function POST(request: NextRequest) {
  try {
    const { title, date, time, duration, attendees, meetingType } = await request.json()

    // Validate required fields
    if (!title || !date || !time) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Generate meeting URL if video call
    // let meetingUrl
    // if (meetingType === 'video-call') {
    //   meetingUrl = await generateZoomMeetingUrl(date, time, duration)
    // }

    // Create meeting in database
    // const meeting = await db.meetings.create({
    //   title,
    //   date: new Date(date),
    //   time,
    //   duration,
    //   attendees,
    //   meetingType,
    //   meetingUrl,
    //   status: 'scheduled'
    // })

    // Send calendar invites to attendees
    // await sendCalendarInvites(meeting)

    return NextResponse.json({
      success: true,
      meetingId: 123,
      message: 'Meeting scheduled successfully'
    })
  } catch (error) {
    console.error('Schedule meeting error:', error)
    return NextResponse.json(
      { error: 'Failed to schedule meeting' },
      { status: 500 }
    )
  }
}
```

### 3. Reschedule Meeting
```typescript
// app/api/meetings/reschedule/route.ts
export async function POST(request: NextRequest) {
  try {
    const { meetingId, newDate, newTime } = await request.json()

    // Update meeting
    // await db.meetings.update({
    //   where: { id: meetingId },
    //   data: {
    //     date: new Date(newDate),
    //     time: newTime
    //   }
    // })

    // Send update notifications
    // await notifyAttendeesOfReschedule(meetingId)

    return NextResponse.json({
      success: true,
      message: 'Meeting rescheduled'
    })
  } catch (error) {
    console.error('Reschedule error:', error)
    return NextResponse.json(
      { error: 'Failed to reschedule meeting' },
      { status: 500 }
    )
  }
}
```

### 4. Set Reminder
```typescript
// app/api/meetings/reminder/route.ts
export async function POST(request: NextRequest) {
  try {
    const { meetingId, minutesBefore } = await request.json()

    // Create reminder
    // await db.reminders.create({
    //   meetingId,
    //   minutesBefore,
    //   createdAt: new Date()
    // })

    // Schedule notification (using cron or queue)
    // await scheduleReminder(meetingId, minutesBefore)

    return NextResponse.json({
      success: true,
      message: `Reminder set for ${minutesBefore} minutes before`
    })
  } catch (error) {
    console.error('Reminder error:', error)
    return NextResponse.json(
      { error: 'Failed to set reminder' },
      { status: 500 }
    )
  }
}
```

---

## Invoice API Endpoints

### 1. Initiate Payment (Stripe)
```typescript
// app/api/invoices/payment/route.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!)

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, invoiceNumber, amount } = await request.json()

    // Create Stripe checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: `Invoice ${invoiceNumber}`,
              description: 'Project invoice payment'
            },
            unit_amount: Math.round(amount * 100) // Convert to cents
          },
          quantity: 1
        }
      ],
      mode: 'payment',
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client-zone/invoices?success=true&invoiceId=${invoiceId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/dashboard/client-zone/invoices?cancelled=true&invoiceId=${invoiceId}`,
      metadata: {
        invoiceId,
        invoiceNumber
      }
    })

    // Store session in database
    // await db.paymentSessions.create({
    //   invoiceId,
    //   stripeSessionId: session.id,
    //   createdAt: new Date()
    // })

    return NextResponse.json({
      success: true,
      checkoutUrl: session.url
    })
  } catch (error) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: 'Failed to initiate payment' },
      { status: 500 }
    )
  }
}
```

### 2. Generate PDF
```typescript
// app/api/invoices/[id]/pdf/route.ts
import { jsPDF } from 'jspdf'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const invoiceId = parseInt(params.id)

    // Fetch invoice from database
    // const invoice = await db.invoices.findUnique({
    //   where: { id: invoiceId },
    //   include: { items: true }
    // })

    // Generate PDF
    // const pdf = new jsPDF()
    // pdf.text(`Invoice ${invoice.number}`, 10, 10)
    // pdf.text(`Amount: $${invoice.amount}`, 10, 20)
    // ... add more content ...

    // Return PDF
    // const pdfBuffer = Buffer.from(pdf.output('arraybuffer'))
    // return new Response(pdfBuffer, {
    //   headers: {
    //     'Content-Type': 'application/pdf',
    //     'Content-Disposition': `attachment; filename="invoice-${invoice.number}.pdf"`
    //   }
    // })

    return new Response('PDF content', {
      headers: {
        'Content-Type': 'application/pdf'
      }
    })
  } catch (error) {
    console.error('PDF generation error:', error)
    return new Response('Failed to generate PDF', { status: 500 })
  }
}
```

### 3. Dispute Invoice
```typescript
// app/api/invoices/dispute/route.ts
export async function POST(request: NextRequest) {
  try {
    const { invoiceId, invoiceNumber, reason } = await request.json()

    // Create dispute record
    // const dispute = await db.invoiceDisputes.create({
    //   invoiceId,
    //   reason,
    //   status: 'pending',
    //   createdAt: new Date()
    // })

    // Update invoice status
    // await db.invoices.update({
    //   where: { id: invoiceId },
    //   data: { status: 'disputed' }
    // })

    // Notify support team
    // await notifySupport({
    //   type: 'invoice_dispute',
    //   invoiceNumber,
    //   reason,
    //   disputeId: dispute.id
    // })

    return NextResponse.json({
      success: true,
      message: 'Dispute submitted successfully',
      disputeId: 'DSP-001'
    })
  } catch (error) {
    console.error('Dispute error:', error)
    return NextResponse.json(
      { error: 'Failed to submit dispute' },
      { status: 500 }
    )
  }
}
```

---

## Payment/Escrow API Endpoints

### 1. Release Payment
```typescript
// app/api/payments/release/route.ts
export async function POST(request: NextRequest) {
  try {
    const { milestoneId, milestoneName, amount } = await request.json()

    // Validate escrow status
    // const milestone = await db.milestones.findUnique({
    //   where: { id: milestoneId }
    // })
    // if (milestone.status !== 'in-escrow') {
    //   return NextResponse.json(
    //     { error: 'Milestone not in escrow' },
    //     { status: 400 }
    //   )
    // }

    // Process payment release
    // const transaction = await stripe.transfers.create({
    //   amount: Math.round(amount * 100),
    //   currency: 'usd',
    //   destination: milestone.freelancerStripeAccountId
    // })

    // Update milestone status
    // await db.milestones.update({
    //   where: { id: milestoneId },
    //   data: {
    //     status: 'released',
    //     releaseDate: new Date(),
    //     transactionId: transaction.id
    //   }
    // })

    // Notify freelancer
    // await notifyFreelancer({
    //   type: 'payment_released',
    //   milestoneName,
    //   amount
    // })

    return NextResponse.json({
      success: true,
      transactionId: 'TXN-2024-001',
      message: 'Payment released successfully'
    })
  } catch (error) {
    console.error('Release payment error:', error)
    return NextResponse.json(
      { error: 'Failed to release payment' },
      { status: 500 }
    )
  }
}
```

### 2. Dispute Payment
```typescript
// app/api/payments/dispute/route.ts
export async function POST(request: NextRequest) {
  try {
    const { milestoneId, milestoneName, reason } = await request.json()

    // Create dispute
    // const dispute = await db.paymentDisputes.create({
    //   milestoneId,
    //   reason,
    //   status: 'pending',
    //   createdAt: new Date()
    // })

    // Update milestone status
    // await db.milestones.update({
    //   where: { id: milestoneId },
    //   data: { status: 'disputed' }
    // })

    // Initiate mediation
    // await startMediation(dispute.id)

    return NextResponse.json({
      success: true,
      disputeId: 'DSP-PAYMENT-001',
      message: 'Dispute submitted for mediation'
    })
  } catch (error) {
    console.error('Dispute error:', error)
    return NextResponse.json(
      { error: 'Failed to submit dispute' },
      { status: 500 }
    )
  }
}
```

### 3. Download Receipt
```typescript
// app/api/payments/[id]/receipt/route.ts
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const paymentId = parseInt(params.id)

    // Fetch payment details
    // const payment = await db.paymentHistory.findUnique({
    //   where: { id: paymentId }
    // })

    // Generate receipt PDF
    // const pdf = new jsPDF()
    // pdf.text(`Payment Receipt`, 10, 10)
    // pdf.text(`Transaction ID: ${payment.transactionId}`, 10, 20)
    // ... add more details ...

    return new Response('Receipt PDF content', {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="receipt-${params.id}.pdf"`
      }
    })
  } catch (error) {
    console.error('Receipt generation error:', error)
    return new Response('Failed to generate receipt', { status: 500 })
  }
}
```

---

## Database Schema Examples (Prisma)

```prisma
// prisma/schema.prisma

model GalleryItem {
  id          Int       @id @default(autoincrement())
  name        String
  project     String
  uploadedBy  String
  uploadDate  DateTime  @default(now())
  fileSize    String
  imageUrl    String?
  type        String    // 'image', 'video', 'document'
  description String
  status      String    // 'approved', 'pending-review', 'revision-needed'
  filePath    String
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Meeting {
  id          Int       @id @default(autoincrement())
  title       String
  description String
  date        DateTime
  time        String
  duration    Int
  meetingType String    // 'video-call', 'in-person', 'phone-call'
  attendees   String[]
  location    String?
  meetingUrl  String?
  status      String    // 'scheduled', 'in-progress', 'completed', 'cancelled'
  project     String
  notes       String?
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
}

model Invoice {
  id         Int       @id @default(autoincrement())
  number     String    @unique
  project    String
  amount     Float
  items      InvoiceItem[]
  dueDate    DateTime
  issueDate  DateTime
  paidDate   DateTime?
  status     String    // 'paid', 'pending', 'overdue', 'disputed'
  description String
  clientName String
  clientEmail String
  notes      String?
  createdAt  DateTime  @default(now())
  updatedAt  DateTime  @updatedAt
}

model InvoiceItem {
  id          Int     @id @default(autoincrement())
  invoiceId   Int
  invoice     Invoice @relation(fields: [invoiceId], references: [id])
  description String
  quantity    Int
  unitPrice   Float
  total       Float
}

model Milestone {
  id               Int       @id @default(autoincrement())
  name             String
  description      String
  project          String
  amount           Float
  releaseCondition String
  status           String    // 'completed', 'in-escrow', 'released', 'disputed'
  completionDate   DateTime?
  releaseDate      DateTime?
  dueDate          DateTime
  approvalNotes    String?
  createdAt        DateTime  @default(now())
  updatedAt        DateTime  @updatedAt
}

model PaymentHistory {
  id            Int       @id @default(autoincrement())
  date          DateTime
  milestone     String
  amount        Float
  type          String    // 'release', 'hold', 'return'
  status        String    // 'completed', 'pending'
  transactionId String    @unique
  createdAt     DateTime  @default(now())
}
```

---

## Environment Variables

```bash
# .env.local
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Meeting services
ZOOM_API_KEY=...
ZOOM_API_SECRET=...
GOOGLE_CALENDAR_API_KEY=...

# File storage
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
AWS_S3_BUCKET=...

# Database
DATABASE_URL=postgresql://...
```

---

This covers the main API endpoints referenced by the four client-zone tab pages. Implement these in your backend to fully integrate the frontend functionality.
