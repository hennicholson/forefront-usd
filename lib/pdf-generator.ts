import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

interface UserData {
  firstName: string
  lastName: string
  email: string
  university: string
  year: string
}

export class StudentStackPDFGenerator {
  private pdf: jsPDF
  private userData: UserData
  private pageHeight = 297 // A4 height in mm
  private pageWidth = 210 // A4 width in mm
  private margin = 20
  private currentY = 0

  constructor(userData: UserData) {
    this.pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    })
    this.userData = userData
  }

  private addHeader(pageNumber: number) {
    // Forefront header
    this.pdf.setFillColor(0, 0, 0)
    this.pdf.rect(0, 0, this.pageWidth, 30, 'F')

    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(18)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('forefront', this.margin, 20)

    this.pdf.setFontSize(10)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(`Student Stack Guide - Page ${pageNumber}`, this.pageWidth - this.margin - 50, 20)

    this.currentY = 45
  }

  private addFooter() {
    this.pdf.setTextColor(128, 128, 128)
    this.pdf.setFontSize(8)
    this.pdf.text('© 2024 forefront - Empowering Students with AI', this.pageWidth / 2, this.pageHeight - 10, { align: 'center' })
  }

  private addCoverPage() {
    // Black background
    this.pdf.setFillColor(0, 0, 0)
    this.pdf.rect(0, 0, this.pageWidth, this.pageHeight, 'F')

    // Green value badge
    this.pdf.setFillColor(34, 197, 94) // green-500
    const badgeWidth = 80
    const badgeHeight = 12
    const badgeX = (this.pageWidth - badgeWidth) / 2
    this.pdf.roundedRect(badgeX, 40, badgeWidth, badgeHeight, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('$500+ FREE VALUE', this.pageWidth / 2, 47, { align: 'center' })

    // Main title
    this.pdf.setTextColor(255, 255, 255)
    this.pdf.setFontSize(28)
    this.pdf.text('Your Personal', this.pageWidth / 2, 80, { align: 'center' })
    this.pdf.text('Student Stack Guide', this.pageWidth / 2, 95, { align: 'center' })

    // Personalized for
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('Exclusively prepared for:', this.pageWidth / 2, 120, { align: 'center' })

    this.pdf.setFontSize(20)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text(`${this.userData.firstName} ${this.userData.lastName}`, this.pageWidth / 2, 135, { align: 'center' })

    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text(`${this.userData.year} at ${this.userData.university}`, this.pageWidth / 2, 145, { align: 'center' })

    // Description
    this.pdf.setTextColor(200, 200, 200)
    this.pdf.setFontSize(11)
    const description = [
      'This guide contains exclusive access to premium AI tools',
      'worth over $500 per year - completely free for students.',
      '',
      'Inside you\'ll discover how to access:',
      '• Google Gemini Advanced ($240 value)',
      '• Perplexity Pro ($200 value)',
      '• Microsoft 365 Complete Suite ($100 value)',
      '',
      'Plus strategies for using each tool effectively',
      'to excel in your academic journey.'
    ]

    let yPos = 170
    description.forEach(line => {
      this.pdf.text(line, this.pageWidth / 2, yPos, { align: 'center' })
      yPos += 7
    })

    // Date generated
    this.pdf.setTextColor(128, 128, 128)
    this.pdf.setFontSize(9)
    const date = new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    this.pdf.text(`Generated on ${date}`, this.pageWidth / 2, 270, { align: 'center' })
  }

  private addGeminiPage() {
    this.pdf.addPage()
    this.addHeader(2)

    // Tool title
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Google Gemini Advanced', this.margin, this.currentY)

    // Value badge
    this.pdf.setFillColor(34, 197, 94)
    this.pdf.roundedRect(this.margin, this.currentY + 5, 60, 10, 2, 2, 'F')
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(10)
    this.pdf.text('$240/year value', this.margin + 30, this.currentY + 11, { align: 'center' })

    this.currentY += 25

    // What is it?
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('What is Google Gemini Advanced?', this.margin, this.currentY)

    this.currentY += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')
    const geminiDesc = this.pdf.splitTextToSize(
      'Google\'s most capable AI model with advanced reasoning, coding, and creative capabilities. Perfect for complex problem-solving, code generation, and creative projects. Includes Deep Research, Gemini Live voice conversations, and 2TB of cloud storage.',
      this.pageWidth - (this.margin * 2)
    )
    this.pdf.text(geminiDesc, this.margin, this.currentY)

    this.currentY += geminiDesc.length * 5 + 10

    // How to get it
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('How to Get Your Free Access:', this.margin, this.currentY)

    this.currentY += 8

    // Steps table
    const steps = [
      ['Step 1', 'Go to gemini.google/students'],
      ['Step 2', 'Sign in with your personal Google account (not school email)'],
      ['Step 3', 'Verify your student status through SheerID'],
      ['Step 4', 'Add a payment method (won\'t be charged)'],
      ['Step 5', 'Enjoy 12 months of free access!']
    ]

    autoTable(this.pdf, {
      startY: this.currentY,
      head: [['Step', 'Action']],
      body: steps,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15

    // Best use cases
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Best Use Cases:', this.margin, this.currentY)

    this.currentY += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const useCases = [
      '• Creative Writing: Essays, stories, and content creation',
      '• Coding: Debug, generate, and explain code in any language',
      '• Research: Deep Research feature for comprehensive analysis',
      '• Problem Solving: Break down complex problems step-by-step',
      '• Study Aid: Create study guides and practice questions'
    ]

    useCases.forEach(useCase => {
      this.pdf.text(useCase, this.margin, this.currentY)
      this.currentY += 6
    })

    this.currentY += 10

    // Pro tip
    this.pdf.setFillColor(240, 240, 240)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 30, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('PRO TIP:', this.margin + 5, this.currentY + 8)

    this.pdf.setFont('helvetica', 'normal')
    const proTip = this.pdf.splitTextToSize(
      'Use Gemini Live for voice conversations while studying - it\'s like having a personal tutor available 24/7. Perfect for brainstorming ideas or talking through complex concepts.',
      this.pageWidth - (this.margin * 2) - 10
    )
    this.pdf.text(proTip, this.margin + 5, this.currentY + 15)

    this.addFooter()
  }

  private addPerplexityPage() {
    this.pdf.addPage()
    this.addHeader(3)

    // Tool title
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Perplexity Pro + Comet Browser', this.margin, this.currentY)

    // Value badge
    this.pdf.setFillColor(34, 197, 94)
    this.pdf.roundedRect(this.margin, this.currentY + 5, 60, 10, 2, 2, 'F')
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(10)
    this.pdf.text('$200/year value', this.margin + 30, this.currentY + 11, { align: 'center' })

    this.currentY += 25

    // What is it?
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('What is Perplexity Pro?', this.margin, this.currentY)

    this.currentY += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')
    const perplexityDesc = this.pdf.splitTextToSize(
      'The ultimate AI-powered research assistant that provides accurate, cited answers from reliable sources. Now includes the revolutionary Comet browser - an AI-native browser built for research with Perplexity Pro integrated directly into your browsing experience.',
      this.pageWidth - (this.margin * 2)
    )
    this.pdf.text(perplexityDesc, this.margin, this.currentY)

    this.currentY += perplexityDesc.length * 5 + 10

    // Comet Browser highlight
    this.pdf.setFillColor(240, 250, 255)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 30, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('NEW: Comet Browser', this.margin + 5, this.currentY + 8)

    this.pdf.setFont('helvetica', 'normal')
    const cometDesc = this.pdf.splitTextToSize(
      'The AI browser built for students. Get instant AI assistance while browsing, research any topic seamlessly, and access Perplexity Pro directly from your browser toolbar.',
      this.pageWidth - (this.margin * 2) - 10
    )
    this.pdf.text(cometDesc, this.margin + 5, this.currentY + 15)

    this.currentY += 40

    // How to get it
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('How to Get Your Free Access:', this.margin, this.currentY)

    this.currentY += 8

    // Steps
    const steps = [
      ['Step 1', 'Visit perplexity.ai/students'],
      ['Step 2', 'Download Comet browser (includes Perplexity Pro)'],
      ['Step 3', 'Create account with your school email'],
      ['Step 4', 'Verify student status via SheerID'],
      ['Step 5', 'Get 12 MONTHS FREE instantly!']
    ]

    autoTable(this.pdf, {
      startY: this.currentY,
      head: [['Step', 'Action']],
      body: steps,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15

    // 12 months free highlight
    this.pdf.setFillColor(255, 251, 235)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 25, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('EXCLUSIVE: Full Year Free for Students', this.margin + 5, this.currentY + 8)

    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('Get 12 full months of Perplexity Pro at no cost with student verification!', this.margin + 5, this.currentY + 15)

    this.currentY += 35

    // Best use cases
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Best Use Cases:', this.margin, this.currentY)

    this.currentY += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')

    const useCases = [
      '• Academic Research: Get cited sources for papers and essays',
      '• Fact Checking: Verify information with reliable sources',
      '• Current Events: Access up-to-date information beyond training cutoffs',
      '• Literature Reviews: Quickly find and summarize academic papers',
      '• Data Analysis: Get statistics and data with proper citations'
    ]

    useCases.forEach(useCase => {
      this.pdf.text(useCase, this.margin, this.currentY)
      this.currentY += 6
    })

    this.currentY += 10

    // Pro tip
    this.pdf.setFillColor(240, 240, 240)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 25, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('PRO TIP:', this.margin + 5, this.currentY + 8)

    this.pdf.setFont('helvetica', 'normal')
    const proTip = this.pdf.splitTextToSize(
      'Use Perplexity\'s Academic mode for scholarly sources. Always verify citations and use the "View Sources" feature to dive deeper into the original material.',
      this.pageWidth - (this.margin * 2) - 10
    )
    this.pdf.text(proTip, this.margin + 5, this.currentY + 15)

    this.addFooter()
  }

  private addMicrosoft365Page() {
    this.pdf.addPage()
    this.addHeader(4)

    // Tool title
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Microsoft 365 Education', this.margin, this.currentY)

    // Value badge
    this.pdf.setFillColor(34, 197, 94)
    this.pdf.roundedRect(this.margin, this.currentY + 5, 60, 10, 2, 2, 'F')
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(10)
    this.pdf.text('$100/year value', this.margin + 30, this.currentY + 11, { align: 'center' })

    this.currentY += 25

    // What is it?
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('What is Microsoft 365 Education?', this.margin, this.currentY)

    this.currentY += 8
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'normal')
    const msDesc = this.pdf.splitTextToSize(
      'The complete productivity suite including Word, Excel, PowerPoint, OneNote, Teams, and 1TB of OneDrive storage. Industry-standard tools that employers expect proficiency in.',
      this.pageWidth - (this.margin * 2)
    )
    this.pdf.text(msDesc, this.margin, this.currentY)

    this.currentY += msDesc.length * 5 + 10

    // How to get it
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('How to Get Your Free Access:', this.margin, this.currentY)

    this.currentY += 8

    // Steps
    const steps = [
      ['Step 1', 'Go to microsoft.com/education/products/office'],
      ['Step 2', 'Enter your school email address (.edu)'],
      ['Step 3', 'Click "Get Started"'],
      ['Step 4', 'Verify your email'],
      ['Step 5', 'Download desktop apps or use online!']
    ]

    autoTable(this.pdf, {
      startY: this.currentY,
      head: [['Step', 'Action']],
      body: steps,
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15

    // What's included
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('What\'s Included:', this.margin, this.currentY)

    this.currentY += 8

    const included = [
      ['Word', 'Professional documents and reports'],
      ['Excel', 'Data analysis and spreadsheets'],
      ['PowerPoint', 'Presentations that impress'],
      ['OneNote', 'Digital notebook for all classes'],
      ['Teams', 'Collaboration with classmates'],
      ['OneDrive', '1TB cloud storage for all files']
    ]

    autoTable(this.pdf, {
      startY: this.currentY,
      body: included,
      theme: 'plain',
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 30 } },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 15

    // Pro tip
    this.pdf.setFillColor(240, 240, 240)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 30, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('PRO TIP:', this.margin + 5, this.currentY + 8)

    this.pdf.setFont('helvetica', 'normal')
    const proTip = this.pdf.splitTextToSize(
      'Master Excel and PowerPoint now - these are the most requested skills by employers. Use OneDrive to keep all your work backed up and accessible from any device.',
      this.pageWidth - (this.margin * 2) - 10
    )
    this.pdf.text(proTip, this.margin + 5, this.currentY + 15)

    this.addFooter()
  }

  private addSummaryPage() {
    this.pdf.addPage()
    this.addHeader(5)

    // Title
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(24)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Your AI Stack Strategy', this.margin, this.currentY)

    this.currentY += 15

    // Personalized message
    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    const personalMessage = this.pdf.splitTextToSize(
      `${this.userData.firstName}, as a ${this.userData.year} at ${this.userData.university}, you're building skills that will set you apart in the workforce. These tools aren't just for assignments - they're career accelerators.`,
      this.pageWidth - (this.margin * 2)
    )
    this.pdf.text(personalMessage, this.margin, this.currentY)

    this.currentY += personalMessage.length * 5 + 15

    // When to use each tool
    this.pdf.setFontSize(16)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Quick Reference: When to Use Each Tool', this.margin, this.currentY)

    this.currentY += 10

    const toolGuide = [
      ['Task', 'Best Tool', 'Why'],
      ['Writing essays/papers', 'Gemini', 'Superior creative writing and structure'],
      ['Research with citations', 'Perplexity', 'Real-time sources and academic papers'],
      ['Coding/debugging', 'Gemini', 'Advanced code understanding'],
      ['Fact-checking', 'Perplexity', 'Verified sources and citations'],
      ['Presentations', 'MS PowerPoint', 'Industry standard, professional'],
      ['Data analysis', 'MS Excel + Gemini', 'Excel for work, Gemini for insights'],
      ['Note-taking', 'OneNote', 'Syncs across all devices'],
      ['Group projects', 'MS Teams', 'Real-time collaboration']
    ]

    autoTable(this.pdf, {
      startY: this.currentY,
      head: [toolGuide[0]],
      body: toolGuide.slice(1),
      theme: 'striped',
      headStyles: { fillColor: [0, 0, 0], textColor: [255, 255, 255] },
      alternateRowStyles: { fillColor: [245, 245, 245] },
      columnStyles: {
        0: { cellWidth: 50 },
        1: { cellWidth: 40, fontStyle: 'bold' },
        2: { cellWidth: 'auto' }
      },
      margin: { left: this.margin, right: this.margin }
    })

    this.currentY = (this.pdf as any).lastAutoTable.finalY + 20

    // Total value
    this.pdf.setFillColor(34, 197, 94)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 35, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(14)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Total Annual Value: $540+', this.pageWidth / 2, this.currentY + 12, { align: 'center' })

    this.pdf.setFontSize(12)
    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('Your Cost: $0', this.pageWidth / 2, this.currentY + 22, { align: 'center' })

    this.currentY += 45

    // Final message
    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'italic')
    const finalMessage = this.pdf.splitTextToSize(
      'You\'re not just saving money - you\'re investing in skills that will pay dividends throughout your career. Master these tools now, and you\'ll enter the workforce ahead of the curve.',
      this.pageWidth - (this.margin * 2)
    )
    this.pdf.text(finalMessage, this.margin, this.currentY)

    this.currentY += finalMessage.length * 5 + 15

    // Contact
    this.pdf.setFillColor(240, 240, 240)
    this.pdf.roundedRect(this.margin, this.currentY, this.pageWidth - (this.margin * 2), 25, 3, 3, 'F')

    this.pdf.setTextColor(0, 0, 0)
    this.pdf.setFontSize(11)
    this.pdf.setFont('helvetica', 'bold')
    this.pdf.text('Need Help? We\'re Here for You', this.pageWidth / 2, this.currentY + 10, { align: 'center' })

    this.pdf.setFont('helvetica', 'normal')
    this.pdf.text('hello@beforefront.com | beforefront.com', this.pageWidth / 2, this.currentY + 18, { align: 'center' })

    this.addFooter()
  }

  public generate(): Blob {
    // Generate all pages
    this.addCoverPage()
    this.addGeminiPage()
    this.addPerplexityPage()
    this.addMicrosoft365Page()
    this.addSummaryPage()

    // Return as blob
    return this.pdf.output('blob')
  }

  public save(filename?: string) {
    const name = filename || `Student_Stack_Guide_${this.userData.firstName}_${this.userData.lastName}.pdf`
    this.pdf.save(name)
  }
}