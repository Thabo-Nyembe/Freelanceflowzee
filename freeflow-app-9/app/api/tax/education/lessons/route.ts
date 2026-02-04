import { NextRequest, NextResponse } from 'next/server'
import { createFeatureLogger } from '@/lib/logger'

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

const logger = createFeatureLogger('tax-education-lessons')

/**
 * GET /api/tax/education/lessons
 * Get all tax education lessons
 */
export async function GET(request: NextRequest) {
  try {
    // Define all tax education lessons
    const lessons = [
      {
        id: 'tax-basics-freelancers',
        title: 'Tax Basics for Freelancers',
        duration: '15 min',
        description: 'Learn the fundamentals of self-employment tax and quarterly payments',
        category: 'beginner',
        sections: [
          {
            id: 1,
            title: 'What is Self-Employment Tax?',
            content: `As a freelancer, you're responsible for both the employer and employee portions of Social Security and Medicare taxes. This combined 15.3% rate is called self-employment tax.

**Breakdown:**
- Social Security: 12.4% (up to income cap)
- Medicare: 2.9% (no income cap)
- Additional Medicare: 0.9% (on income over $200k for single filers)

**Good news:** You can deduct half of your self-employment tax as an adjustment to income.`,
            quiz: {
              question: 'What is the self-employment tax rate?',
              options: ['7.65%', '15.3%', '20%', '12.4%'],
              correctAnswer: 1,
              explanation: '15.3% is the combined rate for Social Security (12.4%) and Medicare (2.9%).'
            }
          },
          {
            id: 2,
            title: 'Quarterly Estimated Payments',
            content: `Unlike employees with withholding, freelancers must make quarterly estimated tax payments to avoid penalties.

**Payment Schedule:**
- Q1: Due April 15 (Jan-Mar income)
- Q2: Due June 15 (Apr-May income)
- Q3: Due September 15 (Jun-Aug income)
- Q4: Due January 15 (Sep-Dec income)

**How to Calculate:**
Use Form 1040-ES to estimate your tax liability. A safe harbor rule: pay 100% of last year's tax (110% if high earner) to avoid penalties.`,
            quiz: {
              question: 'When is Q2 estimated tax payment due?',
              options: ['April 15', 'June 15', 'July 15', 'September 15'],
              correctAnswer: 1,
              explanation: 'Q2 payments covering April-May income are due June 15.'
            }
          },
          {
            id: 3,
            title: 'Record-Keeping Essentials',
            content: `Good records = lower tax bill. Keep track of:

**Income:**
- All 1099 forms
- Client invoices and payments
- Cash/check payments

**Expenses:**
- Receipts for business purchases
- Mileage logs
- Home office calculations
- Bank/credit card statements

**How long to keep:** IRS recommends 3 years minimum, 7 years if you claim significant deductions.

**Tools:** Use accounting software like QuickBooks, FreshBooks, or this platform's built-in expense tracking.`,
            quiz: {
              question: 'How long should you keep tax records?',
              options: ['1 year', '3 years minimum', '5 years', '10 years'],
              correctAnswer: 1,
              explanation: 'The IRS recommends keeping records for at least 3 years, or 7 years if claiming significant deductions.'
            }
          }
        ]
      },
      {
        id: 'maximizing-deductions',
        title: 'Maximizing Deductions',
        duration: '20 min',
        description: 'Discover every legitimate tax deduction available to freelancers',
        category: 'intermediate',
        sections: [
          {
            id: 1,
            title: 'Home Office Deduction',
            content: `One of the most valuable deductions for freelancers working from home.

**Requirements:**
- Exclusive and regular use for business
- Principal place of business

**Two Methods:**

1. **Simplified Method:** $5/sq ft, up to 300 sq ft = max $1,500 deduction
   - Easier, no depreciation tracking
   - Good for small home offices

2. **Regular Method:** Actual expenses × business percentage
   - Mortgage/rent, utilities, insurance, repairs, depreciation
   - More complex but potentially higher deduction
   - Example: 200 sq ft office in 2,000 sq ft home = 10% business use

**What you can deduct:**
- Mortgage interest/rent (business %)
- Utilities (electric, gas, water)
- Home insurance
- Repairs and maintenance
- Property taxes`,
            quiz: {
              question: 'What is the simplified home office deduction rate?',
              options: ['$3/sq ft', '$5/sq ft', '$10/sq ft', '$15/sq ft'],
              correctAnswer: 1,
              explanation: 'The simplified method allows $5 per square foot, up to 300 square feet ($1,500 max).'
            }
          },
          {
            id: 2,
            title: 'Equipment & Software',
            content: `Technology and equipment purchases are 100% deductible in the year of purchase (Section 179).

**Qualifying Purchases:**
- Computer, laptop, tablet
- Monitor, keyboard, mouse
- Printer, scanner
- Camera equipment
- Software subscriptions
- Office furniture (desk, chair)
- Phone and phone service

**Important:**
- Must be used >50% for business
- Keep receipts and proof of business use
- Software subscriptions: deduct in year paid
- Equipment >$2,500: may need to depreciate (consult CPA)

**Example:** $3,000 MacBook Pro used 100% for business = full $3,000 deduction in year one.`,
            quiz: {
              question: 'Can you deduct a laptop purchased for business use?',
              options: ['No, never', 'Yes, if used >50% for business', 'Only 50% deductible', 'Only if under $1,000'],
              correctAnswer: 1,
              explanation: 'Equipment used more than 50% for business qualifies for the Section 179 deduction.'
            }
          },
          {
            id: 3,
            title: 'Travel & Meals',
            content: `Business travel and meals have specific deduction rules.

**Business Travel (100% deductible):**
- Airfare, train, bus tickets
- Hotel accommodations
- Rental car expenses
- Taxi/Uber for business purposes
- Must be overnight and away from home

**Meals (50% deductible in 2024):**
- Client meals and entertainment
- Meals while traveling for business
- Must have business purpose
- Keep receipts and note attendees/purpose

**Mileage (67¢ per mile in 2024):**
- Client meetings
- Networking events
- Bank deposits
- Supply runs
- Not commuting to/from regular office

**Pro tip:** Use apps like MileIQ to automatically track mileage.`,
            quiz: {
              question: 'What percentage of business meals can you deduct?',
              options: ['25%', '50%', '75%', '100%'],
              correctAnswer: 1,
              explanation: 'Business meals are currently 50% deductible (was temporarily 100% during COVID relief).'
            }
          },
          {
            id: 4,
            title: 'Common Mistakes to Avoid',
            content: `Don't leave money on the table - or face an audit!

**Mistakes:**

1. **Mixing Personal & Business**
   - Use separate credit cards/bank accounts
   - Track business use percentage

2. **Missing the QBI Deduction**
   - Qualified Business Income deduction = up to 20% off taxable income
   - Available to most freelancers
   - Don't forget to claim it!

3. **Forgetting Small Expenses**
   - Domain names, web hosting
   - Business books and courses
   - Professional association dues
   - Business insurance

4. **Not Deducting Retirement Contributions**
   - Solo 401(k): up to $66,000 (2024)
   - SEP IRA: up to 25% of net income
   - Reduces current year taxes

5. **Overlooking Health Insurance**
   - Self-employed health insurance is above-the-line deduction
   - Includes dental and vision
   - Deduct on Form 1040, not Schedule C`,
            quiz: {
              question: 'What is the maximum QBI (Qualified Business Income) deduction?',
              options: ['10%', '15%', '20%', '25%'],
              correctAnswer: 2,
              explanation: 'The QBI deduction allows eligible freelancers to deduct up to 20% of qualified business income.'
            }
          }
        ]
      },
      {
        id: 'quarterly-tax-planning',
        title: 'Quarterly Tax Planning',
        duration: '10 min',
        description: 'Master the art of quarterly estimated tax payments',
        category: 'intermediate',
        sections: [
          {
            id: 1,
            title: 'Calculating Quarterly Payments',
            content: `How to determine the right amount to pay each quarter.

**Method 1: Prior Year Safe Harbor**
- Pay 100% of last year's total tax (110% if AGI >$150k)
- Easiest method, no penalty risk
- Example: Last year tax = $20,000 → Pay $5,000/quarter

**Method 2: Current Year Estimate**
- Estimate this year's income and deductions
- Calculate expected tax liability
- Divide by 4
- More accurate but requires good estimates

**Method 3: Annualized Income**
- Best for seasonal/variable income
- Pay based on actual income each quarter
- Use Form 2210 Schedule AI
- More complex but can save money

**Tools:**
- IRS Form 1040-ES worksheet
- Tax software calculators
- This platform's tax calculator`,
            quiz: {
              question: 'What is the safe harbor percentage for high earners (AGI >$150k)?',
              options: ['90%', '100%', '110%', '120%'],
              correctAnswer: 2,
              explanation: 'High earners must pay 110% of prior year tax to avoid penalties under safe harbor rules.'
            }
          },
          {
            id: 2,
            title: 'Avoiding Underpayment Penalties',
            content: `Penalties can add up - here's how to avoid them.

**You're Safe If:**
- Pay 90% of current year tax, OR
- Pay 100% of prior year tax (110% if high earner), OR
- Owe less than $1,000 after withholding/credits

**Penalty Calculation:**
- Typically 0.5% per month on underpayment
- Calculated quarterly, not annually
- Can add up to 6% annually

**Special Cases:**
- First year freelancing? No penalty if you paid all withholding
- Variable income? Use annualized method
- Made too much? Pay extra in later quarters

**What to Do If You Underpaid:**
- Pay the shortfall ASAP
- File Form 2210 if requesting waiver
- Reasonable cause exceptions exist`,
            quiz: {
              question: 'You can avoid penalties if you owe less than how much after withholding?',
              options: ['$500', '$1,000', '$1,500', '$2,000'],
              correctAnswer: 1,
              explanation: 'If you owe less than $1,000 after withholding and credits, no penalty applies.'
            }
          },
          {
            id: 3,
            title: 'When to Adjust Estimates',
            content: `Life changes - your estimates should too.

**Increase Payments When:**
- Income unexpectedly higher
- Lost a big deduction
- Took on W-2 job with insufficient withholding
- Made significant capital gains
- Converted traditional IRA to Roth

**Decrease Payments When:**
- Income drops significantly
- New major deductions (home office, equipment)
- Increased retirement contributions
- Higher estimated business expenses

**How to Adjust:**
- Can pay different amounts each quarter
- Front-load if you know big income coming
- Use annualized method for variable income
- Make adjustments before next quarter deadline

**Pro Tip:** Review quarterly! Don't wait until year-end.`,
            quiz: {
              question: 'Can you pay different amounts each quarter based on actual income?',
              options: ['No, must be equal', 'Yes, using annualized method', 'Only with IRS approval', 'Only in emergencies'],
              correctAnswer: 1,
              explanation: 'Yes, the annualized income method allows you to adjust payments based on actual quarterly income.'
            }
          }
        ]
      },
      {
        id: 'international-tax-basics',
        title: 'International Tax Basics',
        duration: '25 min',
        description: 'Navigate taxes when working with international clients',
        category: 'advanced',
        sections: [
          {
            id: 1,
            title: 'VAT, GST, and Sales Tax',
            content: `Different countries have different consumption taxes.

**United States: Sales Tax**
- State and local level
- No federal sales tax
- Nexus rules determine if you must collect
- Digital services often exempt

**European Union: VAT**
- Value Added Tax (15-27% depending on country)
- Reverse charge mechanism for B2B
- Threshold for registration varies by country
- MOSS (Mini One Stop Shop) for simplified filing

**Other Countries:**
- Canada: GST/HST (5-15%)
- Australia: GST (10%)
- UK: VAT (20%)
- India: GST (5-28%)

**Key Rules for Freelancers:**
- B2B services usually customer's responsibility (reverse charge)
- B2C services may require VAT registration
- Each country has different thresholds
- Digital services have special rules`,
            quiz: {
              question: 'What does B2B "reverse charge" mean for VAT?',
              options: ['You charge extra VAT', 'Customer is responsible for VAT', 'No VAT applies', 'Split VAT 50/50'],
              correctAnswer: 1,
              explanation: 'Under reverse charge, the business customer (not the freelancer) is responsible for reporting and paying VAT.'
            }
          },
          {
            id: 2,
            title: 'Foreign Income Reporting',
            content: `US freelancers must report worldwide income.

**Reporting Requirements:**
- All income, regardless of source
- Foreign bank accounts >$10,000 (FBAR)
- Foreign assets >$50,000 (FATCA Form 8938)

**Foreign Earned Income Exclusion (FEIE):**
- Exclude up to $120,000 (2024) if living abroad
- Must pass physical presence or bona fide residence test
- Form 2555 to claim
- Still owe self-employment tax

**Foreign Tax Credit:**
- Credit for taxes paid to foreign countries
- Prevents double taxation
- Form 1116 to claim
- Dollar-for-dollar reduction

**Currency Conversion:**
- Use exchange rate on payment date
- IRS publishes yearly average rates
- Keep records of exchange rates used`,
            quiz: {
              question: 'What is the Foreign Earned Income Exclusion limit for 2024?',
              options: ['$100,000', '$112,000', '$120,000', '$150,000'],
              correctAnswer: 2,
              explanation: 'The FEIE limit for 2024 is $120,000 of foreign earned income.'
            }
          },
          {
            id: 3,
            title: 'Tax Treaties',
            content: `The US has tax treaties with many countries to prevent double taxation.

**Common Treaty Benefits:**
- Reduced withholding rates on royalties/dividends
- Exemption from certain taxes
- Rules for determining tax residency
- Tie-breaker rules for dual residents

**Popular Treaties for Freelancers:**
- Canada: 0% withholding on many services
- UK: Reduced rates on royalties
- Germany: Business profits only taxed in residence country
- Australia: Similar business profits rule

**How to Claim Treaty Benefits:**
- Form W-8BEN (foreign individuals)
- Form 8833 if claiming treaty position
- Provide to client for withholding purposes
- May still need to report income

**Important:** Treaties don't exempt from self-employment tax, only income tax.`,
            quiz: {
              question: 'What form do foreign individuals use to claim treaty benefits?',
              options: ['W-9', 'W-8BEN', '1099', '8833'],
              correctAnswer: 1,
              explanation: 'Form W-8BEN is used by foreign individuals to claim tax treaty benefits and establish foreign status.'
            }
          },
          {
            id: 4,
            title: 'Digital Services & Nexus',
            content: `Providing digital services internationally has unique considerations.

**Digital Services Taxation:**
- EU: VAT MOSS for digital products
- Australia: GST on digital services to consumers
- India: Equalization levy on digital services
- Many countries implementing digital service taxes

**Economic Nexus:**
- Physical presence no longer required
- Sales thresholds create tax obligations
- Each state/country has different rules
- Must register if threshold exceeded

**Best Practices:**
- Know where your customers are located
- Track sales by country/state
- Use geolocation tools
- Consider using payment platforms that handle tax

**Platforms That Help:**
- Stripe Tax
- Paddle
- FastSpring
- Gumroad (for digital products)

These handle VAT/GST collection and remittance automatically.`,
            quiz: {
              question: 'What is economic nexus based on?',
              options: ['Physical presence only', 'Sales thresholds', 'Number of employees', 'Office location'],
              correctAnswer: 1,
              explanation: 'Economic nexus is based on sales thresholds in a jurisdiction, not physical presence.'
            }
          }
        ]
      }
    ]

    return NextResponse.json({ data: lessons })
  } catch (error) {
    logger.error('Tax education lessons GET error', { error })
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
