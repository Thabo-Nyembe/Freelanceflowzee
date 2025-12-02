/**
 * Invoice PDF Generator
 * Professional PDF generation for invoices using jsPDF
 */

import jsPDF from 'jspdf'
import { Invoice } from './invoice-types'

export async function generateInvoicePDF(invoice: Invoice): Promise<Blob> {
  // Create new PDF document (A4 size)
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  })

  // Page dimensions
  const pageWidth = doc.internal.pageSize.getWidth()
  const pageHeight = doc.internal.pageSize.getHeight()
  const margin = 20

  // Colors
  const primaryColor = { r: 79, g: 70, b: 229 } // Indigo
  const darkGray = { r: 55, g: 65, b: 81 }
  const lightGray = { r: 156, g: 163, b: 175 }
  const greenColor = { r: 34, g: 197, b: 94 }

  // ============================================================================
  // HEADER SECTION
  // ============================================================================

  // Company name/logo area (top left)
  doc.setFontSize(28)
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.setFont('helvetica', 'bold')
  doc.text('KAZI', margin, margin + 10)

  doc.setFontSize(10)
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.setFont('helvetica', 'normal')
  doc.text('Professional Freelance Platform', margin, margin + 16)

  // INVOICE title (center-right)
  doc.setFontSize(32)
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.setFont('helvetica', 'bold')
  doc.text('INVOICE', pageWidth - margin, margin + 10, { align: 'right' })

  // Invoice details (right side)
  let rightColumnY = margin + 18
  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')

  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.text('Invoice Number:', pageWidth - margin, rightColumnY, { align: 'right' })
  rightColumnY += 6
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.setFont('helvetica', 'bold')
  doc.text(invoice.invoiceNumber, pageWidth - margin, rightColumnY, { align: 'right' })

  rightColumnY += 8
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.text('Issue Date:', pageWidth - margin, rightColumnY, { align: 'right' })
  rightColumnY += 6
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.text(invoice.issueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), pageWidth - margin, rightColumnY, { align: 'right' })

  rightColumnY += 8
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.text('Due Date:', pageWidth - margin, rightColumnY, { align: 'right' })
  rightColumnY += 6
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.text(invoice.dueDate.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), pageWidth - margin, rightColumnY, { align: 'right' })

  // ============================================================================
  // FROM & BILL TO SECTION
  // ============================================================================

  let leftColumnY = margin + 45

  // FROM section
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.text('FROM:', margin, leftColumnY)

  leftColumnY += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.text('KAZI Platform', margin, leftColumnY)

  leftColumnY += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.text('123 Business Street', margin, leftColumnY)

  leftColumnY += 5
  doc.text('Cape Town, Western Cape 8001', margin, leftColumnY)

  leftColumnY += 5
  doc.text('South Africa', margin, leftColumnY)

  leftColumnY += 5
  doc.text('support@kazi.com', margin, leftColumnY)

  // BILL TO section
  leftColumnY += 12
  doc.setFontSize(11)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.text('BILL TO:', margin, leftColumnY)

  leftColumnY += 6
  doc.setFontSize(10)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.text(invoice.clientName || 'Client Name', margin, leftColumnY)

  leftColumnY += 5
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.text(invoice.clientEmail || 'client@email.com', margin, leftColumnY)

  if (invoice.clientAddress) {
    leftColumnY += 5
    doc.text(invoice.clientAddress.street || '', margin, leftColumnY)

    leftColumnY += 5
    const cityState = [
      invoice.clientAddress.city,
      invoice.clientAddress.state,
      invoice.clientAddress.zip
    ].filter(Boolean).join(', ')
    if (cityState) {
      doc.text(cityState, margin, leftColumnY)
    }

    if (invoice.clientAddress.country) {
      leftColumnY += 5
      doc.text(invoice.clientAddress.country, margin, leftColumnY)
    }
  }

  // ============================================================================
  // LINE ITEMS TABLE
  // ============================================================================

  let tableY = leftColumnY + 15

  // Table header
  doc.setFillColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.rect(margin, tableY, pageWidth - 2 * margin, 8, 'F')

  tableY += 5.5
  doc.setFontSize(9)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(255, 255, 255)

  const colDescription = margin + 2
  const colQuantity = pageWidth - margin - 90
  const colUnitPrice = pageWidth - margin - 60
  const colTotal = pageWidth - margin - 30

  doc.text('DESCRIPTION', colDescription, tableY)
  doc.text('QTY', colQuantity, tableY)
  doc.text('UNIT PRICE', colUnitPrice, tableY)
  doc.text('TOTAL', colTotal, tableY)

  tableY += 5

  // Table rows
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)

  const items = invoice.items && invoice.items.length > 0 ? invoice.items : []

  if (items.length === 0) {
    // If no line items, show a single row with the total
    doc.text('Services Rendered', colDescription, tableY)
    doc.text('1', colQuantity, tableY)
    doc.text(`${invoice.currency} ${invoice.total.toFixed(2)}`, colUnitPrice, tableY)
    doc.text(`${invoice.currency} ${invoice.total.toFixed(2)}`, colTotal, tableY)
    tableY += 7
  } else {
    // Show all line items
    items.forEach((item) => {
      // Check if we need a new page
      if (tableY > pageHeight - 60) {
        doc.addPage()
        tableY = margin + 10
      }

      // Description (wrap if too long)
      const descriptionMaxWidth = 90
      const descriptionLines = doc.splitTextToSize(item.description || 'Service', descriptionMaxWidth)

      doc.text(descriptionLines[0], colDescription, tableY)
      doc.text(item.quantity.toString(), colQuantity, tableY)
      doc.text(`${invoice.currency} ${item.unitPrice.toFixed(2)}`, colUnitPrice, tableY)
      doc.text(`${invoice.currency} ${item.total.toFixed(2)}`, colTotal, tableY)

      tableY += 7

      // Add additional description lines if wrapped
      if (descriptionLines.length > 1) {
        for (let i = 1; i < descriptionLines.length; i++) {
          doc.setFontSize(8)
          doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
          doc.text(descriptionLines[i], colDescription, tableY)
          tableY += 5
          doc.setFontSize(9)
          doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
        }
      }
    })
  }

  // Line separator
  doc.setDrawColor(lightGray.r, lightGray.g, lightGray.b)
  doc.setLineWidth(0.5)
  doc.line(margin, tableY + 2, pageWidth - margin, tableY + 2)

  tableY += 10

  // ============================================================================
  // TOTALS SECTION
  // ============================================================================

  const totalsX = pageWidth - margin - 60
  const totalsLabelX = pageWidth - margin - 90

  doc.setFontSize(10)
  doc.setFont('helvetica', 'normal')
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)

  // Subtotal
  doc.text('Subtotal:', totalsLabelX, tableY, { align: 'right' })
  doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
  doc.text(`${invoice.currency} ${invoice.subtotal.toFixed(2)}`, totalsX, tableY, { align: 'right' })

  tableY += 7

  // Tax
  if (invoice.taxAmount > 0) {
    doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
    doc.text(`Tax (${invoice.taxRate}%):`, totalsLabelX, tableY, { align: 'right' })
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)
    doc.text(`${invoice.currency} ${invoice.taxAmount.toFixed(2)}`, totalsX, tableY, { align: 'right' })
    tableY += 7
  }

  // Discount
  if (invoice.discount > 0) {
    doc.setTextColor(greenColor.r, greenColor.g, greenColor.b)
    doc.text('Discount:', totalsLabelX, tableY, { align: 'right' })
    doc.text(`-${invoice.currency} ${invoice.discount.toFixed(2)}`, totalsX, tableY, { align: 'right' })
    tableY += 7
  }

  // Total
  doc.setDrawColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.setLineWidth(0.5)
  doc.line(totalsLabelX - 5, tableY - 3, pageWidth - margin, tableY - 3)

  tableY += 4
  doc.setFontSize(14)
  doc.setFont('helvetica', 'bold')
  doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
  doc.text('TOTAL:', totalsLabelX, tableY, { align: 'right' })
  doc.setTextColor(greenColor.r, greenColor.g, greenColor.b)
  doc.text(`${invoice.currency} ${invoice.total.toFixed(2)}`, totalsX, tableY, { align: 'right' })

  // ============================================================================
  // NOTES & PAYMENT TERMS
  // ============================================================================

  tableY += 15

  if (invoice.notes || invoice.terms) {
    doc.setFontSize(10)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(primaryColor.r, primaryColor.g, primaryColor.b)
    doc.text('Payment Terms & Notes:', margin, tableY)

    tableY += 6
    doc.setFont('helvetica', 'normal')
    doc.setFontSize(9)
    doc.setTextColor(darkGray.r, darkGray.g, darkGray.b)

    const notesText = invoice.terms || invoice.notes || 'Payment due within 30 days of invoice date.'
    const notesMaxWidth = pageWidth - 2 * margin
    const notesLines = doc.splitTextToSize(notesText, notesMaxWidth)

    notesLines.forEach((line: string) => {
      if (tableY > pageHeight - 40) {
        doc.addPage()
        tableY = margin + 10
      }
      doc.text(line, margin, tableY)
      tableY += 5
    })
  }

  // ============================================================================
  // FOOTER
  // ============================================================================

  const footerY = pageHeight - 20
  doc.setFontSize(8)
  doc.setFont('helvetica', 'italic')
  doc.setTextColor(lightGray.r, lightGray.g, lightGray.b)
  doc.text('Thank you for your business!', pageWidth / 2, footerY, { align: 'center' })
  doc.text('For questions about this invoice, please contact support@kazi.com', pageWidth / 2, footerY + 4, { align: 'center' })

  // Status watermark for paid invoices
  if (invoice.status === 'paid' && invoice.paidDate) {
    doc.setFontSize(60)
    doc.setFont('helvetica', 'bold')
    doc.setTextColor(34, 197, 94, 0.1) // Green with transparency effect
    doc.text('PAID', pageWidth / 2, pageHeight / 2, {
      align: 'center',
      angle: 45
    })
  }

  // Return PDF as blob
  return doc.output('blob')
}
