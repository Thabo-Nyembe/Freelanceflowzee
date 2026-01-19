/**
 * Tax Intelligence Service
 *
 * Enterprise-grade tax automation with TaxJar and Avalara integrations
 *
 * Features:
 * - Real-time tax calculations using TaxJar/Avalara APIs
 * - Multi-country tax rate lookup (US sales tax, EU VAT, GST)
 * - Economic nexus tracking and compliance
 * - Transaction recording for tax filing
 * - Address validation
 * - Tax exemption management
 * - AI-powered deduction categorization
 * - Tax forecasting and analytics
 */

import { createClient } from '@/lib/supabase/server'

// Types
export type TaxProvider = 'taxjar' | 'avalara' | 'manual'
export type ProductTaxCategory =
  | 'digital_services'
  | 'saas'
  | 'consulting_services'
  | 'professional_services'
  | 'training'
  | 'physical_goods'
  | 'digital_goods'
  | 'general'

export interface TaxAddress {
  line1?: string
  line2?: string
  city: string
  state: string
  postal_code: string
  country: string
}

export interface TaxCalculationParams {
  userId: string
  transactionId: string
  transactionType: 'invoice' | 'expense' | 'payment' | 'refund'
  transactionDate: Date
  subtotal: number
  shippingAmount?: number
  discountAmount?: number

  // Location details
  originCountry?: string
  originState?: string
  originCity?: string
  originPostalCode?: string

  destinationCountry: string
  destinationState?: string
  destinationCity?: string
  destinationPostalCode?: string

  // Line items for detailed calculation
  lineItems?: TaxLineItem[]

  // Override options
  manualTaxRate?: number
  exemptionCertificateId?: string
  customerId?: string
}

export interface TaxLineItem {
  id: string
  description: string
  quantity: number
  unitPrice: number
  productTaxCode?: string // TaxJar product tax code
  category?: string
  discount?: number
}

export interface TaxResult {
  taxAmount: number
  taxRate: number
  totalAmount: number
  breakdown: TaxBreakdown
  hasNexus: boolean
  isTaxable: boolean
  calculationMethod: string
  provider?: TaxProvider
  jurisdictions?: TaxJurisdiction[]
  lineItemTaxes?: TaxLineItemResult[]
  metadata?: Record<string, unknown>
}

export interface TaxBreakdown {
  federal?: number
  state?: number
  county?: number
  city?: number
  special?: number
  [key: string]: number | undefined
}

export interface TaxJurisdiction {
  name: string
  type: 'federal' | 'state' | 'county' | 'city' | 'special'
  rate: number
  amount: number
}

export interface TaxLineItemResult {
  id: string
  taxableAmount: number
  taxAmount: number
  taxRate: number
}

export interface DeductionSuggestion {
  category: string
  subcategory?: string
  confidence: number
  estimatedDeduction: number
  requirements: string[]
  documentation: string[]
}

export interface TaxExemptionCertificate {
  id: string
  userId: string
  certificateNumber: string
  exemptionType: string
  issuingState: string
  validFrom: string
  validUntil?: string
  status: 'active' | 'expired' | 'revoked'
}

export interface NexusState {
  state: string
  country: string
  hasNexus: boolean
  nexusType: 'physical' | 'economic' | 'both'
  effectiveDate: string
  salesThreshold?: number
  transactionThreshold?: number
}

// TaxJar API Client
class TaxJarClient {
  private apiKey: string
  private baseUrl: string

  constructor(apiKey: string, sandbox = false) {
    this.apiKey = apiKey
    this.baseUrl = sandbox
      ? 'https://api.sandbox.taxjar.com/v2'
      : 'https://api.taxjar.com/v2'
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.detail || error.error || `TaxJar API error: ${response.status}`)
    }

    return response.json()
  }

  async calculateTax(params: {
    from_country: string
    from_zip: string
    from_state: string
    from_city?: string
    from_street?: string
    to_country: string
    to_zip: string
    to_state: string
    to_city?: string
    to_street?: string
    amount: number
    shipping: number
    line_items?: Array<{
      id: string
      quantity: number
      unit_price: number
      product_tax_code?: string
      discount?: number
    }>
    customer_id?: string
    exemption_type?: string
  }): Promise<{
    tax: {
      order_total_amount: number
      shipping: number
      taxable_amount: number
      amount_to_collect: number
      rate: number
      has_nexus: boolean
      freight_taxable: boolean
      tax_source: string
      breakdown?: {
        state_taxable_amount: number
        state_tax_rate: number
        state_tax_collectable: number
        county_taxable_amount: number
        county_tax_rate: number
        county_tax_collectable: number
        city_taxable_amount: number
        city_tax_rate: number
        city_tax_collectable: number
        special_taxable_amount: number
        special_tax_rate: number
        special_district_tax_collectable: number
        line_items?: Array<{
          id: string
          taxable_amount: number
          tax_collectable: number
          combined_tax_rate: number
        }>
      }
      jurisdictions?: {
        country: string
        state: string
        county?: string
        city?: string
      }
    }
  }> {
    return this.request('POST', '/taxes', params)
  }

  async createTransaction(params: {
    transaction_id: string
    transaction_date: string
    from_country: string
    from_zip: string
    from_state: string
    from_city?: string
    to_country: string
    to_zip: string
    to_state: string
    to_city?: string
    amount: number
    shipping: number
    sales_tax: number
    line_items?: Array<{
      id: string
      quantity: number
      unit_price: number
      product_tax_code?: string
      sales_tax?: number
    }>
    customer_id?: string
  }): Promise<{ order: Record<string, unknown> }> {
    return this.request('POST', '/transactions/orders', params)
  }

  async createRefund(params: {
    transaction_id: string
    transaction_reference_id: string
    transaction_date: string
    from_country: string
    from_zip: string
    from_state: string
    to_country: string
    to_zip: string
    to_state: string
    amount: number
    shipping: number
    sales_tax: number
  }): Promise<{ refund: Record<string, unknown> }> {
    return this.request('POST', '/transactions/refunds', params)
  }

  async deleteTransaction(transactionId: string): Promise<{ order: Record<string, unknown> }> {
    return this.request('DELETE', `/transactions/orders/${transactionId}`)
  }

  async getNexusRegions(): Promise<{
    regions: Array<{
      country_code: string
      country: string
      region_code: string
      region: string
    }>
  }> {
    return this.request('GET', '/nexus/regions')
  }

  async validateAddress(params: {
    country?: string
    state?: string
    zip?: string
    city?: string
    street?: string
  }): Promise<{
    addresses: Array<{
      country: string
      state: string
      zip: string
      city: string
      street: string
    }>
  }> {
    return this.request('POST', '/addresses/validate', params)
  }

  async getRatesForLocation(zip: string, params?: {
    country?: string
    state?: string
    city?: string
  }): Promise<{
    rate: {
      zip: string
      state: string
      state_rate: number
      county: string
      county_rate: number
      city: string
      city_rate: number
      combined_district_rate: number
      combined_rate: number
      freight_taxable: boolean
    }
  }> {
    const query = params
      ? '&' + new URLSearchParams(params as Record<string, string>).toString()
      : ''
    return this.request('GET', `/rates/${zip}?${query}`)
  }
}

// Avalara API Client
class AvalaraClient {
  private accountId: string
  private licenseKey: string
  private baseUrl: string
  private companyCode: string

  constructor(accountId: string, licenseKey: string, companyCode: string, sandbox = false) {
    this.accountId = accountId
    this.licenseKey = licenseKey
    this.companyCode = companyCode
    this.baseUrl = sandbox
      ? 'https://sandbox-rest.avatax.com/api/v2'
      : 'https://rest.avatax.com/api/v2'
  }

  private async request<T>(
    method: string,
    endpoint: string,
    data?: Record<string, unknown>
  ): Promise<T> {
    const auth = Buffer.from(`${this.accountId}:${this.licenseKey}`).toString('base64')

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/json',
        'X-Avalara-Client': 'FreeFlow;1.0;REST;v2',
      },
      body: data ? JSON.stringify(data) : undefined,
    })

    if (!response.ok) {
      const error = await response.json().catch(() => ({}))
      throw new Error(error.error?.message || `Avalara API error: ${response.status}`)
    }

    return response.json()
  }

  async calculateTax(params: {
    type: 'SalesOrder' | 'SalesInvoice' | 'ReturnOrder' | 'ReturnInvoice'
    companyCode?: string
    date: string
    customerCode: string
    addresses: {
      shipFrom: { line1?: string; city: string; region: string; postalCode: string; country: string }
      shipTo: { line1?: string; city: string; region: string; postalCode: string; country: string }
    }
    lines: Array<{
      number: string
      quantity: number
      amount: number
      taxCode?: string
      description?: string
    }>
    commit?: boolean
    exemptionNo?: string
  }): Promise<{
    id: number
    code: string
    totalAmount: number
    totalExempt: number
    totalTax: number
    totalTaxable: number
    lines: Array<{
      id: number
      lineNumber: string
      taxableAmount: number
      tax: number
      details: Array<{
        jurisType: string
        jurisName: string
        rate: number
        tax: number
        taxableAmount: number
      }>
    }>
    summary: Array<{
      country: string
      region: string
      jurisType: string
      jurisName: string
      rate: number
      tax: number
      taxable: number
    }>
  }> {
    return this.request('POST', '/transactions/create', {
      ...params,
      companyCode: params.companyCode || this.companyCode,
    })
  }

  async commitTransaction(transactionCode: string): Promise<{ id: number; status: string }> {
    return this.request('POST', `/companies/${this.companyCode}/transactions/${transactionCode}/commit`, {
      commit: true,
    })
  }

  async voidTransaction(transactionCode: string): Promise<{ id: number; status: string }> {
    return this.request('POST', `/companies/${this.companyCode}/transactions/${transactionCode}/void`, {
      code: 'DocVoided',
    })
  }

  async resolveAddress(params: {
    line1?: string
    city?: string
    region?: string
    postalCode?: string
    country: string
  }): Promise<{
    address: { line1: string; city: string; region: string; postalCode: string; country: string }
    validatedAddresses: Array<{ line1: string; city: string; region: string; postalCode: string; country: string }>
  }> {
    return this.request('POST', '/addresses/resolve', params)
  }

  async listNexus(): Promise<{
    value: Array<{
      id: number
      country: string
      region: string
      hasLocalNexus: boolean
      nexusTypeId: string
      effectiveDate: string
    }>
  }> {
    return this.request('GET', `/companies/${this.companyCode}/nexus`)
  }
}

export class TaxService {
  // API clients
  private taxjarApiKey: string | undefined
  private avalaraApiKey: string | undefined
  private taxjarClient?: TaxJarClient
  private avalaraClient?: AvalaraClient
  private defaultProvider: TaxProvider
  private supabase: Awaited<ReturnType<typeof createClient>> | null = null

  constructor() {
    this.taxjarApiKey = process.env.TAXJAR_API_KEY
    this.avalaraApiKey = process.env.AVALARA_API_KEY

    // Initialize TaxJar client
    if (this.taxjarApiKey) {
      this.taxjarClient = new TaxJarClient(
        this.taxjarApiKey,
        process.env.TAXJAR_SANDBOX === 'true'
      )
    }

    // Initialize Avalara client
    if (process.env.AVALARA_ACCOUNT_ID && process.env.AVALARA_LICENSE_KEY) {
      this.avalaraClient = new AvalaraClient(
        process.env.AVALARA_ACCOUNT_ID,
        process.env.AVALARA_LICENSE_KEY,
        process.env.AVALARA_COMPANY_CODE || 'DEFAULT',
        process.env.AVALARA_SANDBOX === 'true'
      )
    }

    this.defaultProvider = (process.env.TAX_PROVIDER as TaxProvider) ||
      (this.taxjarClient ? 'taxjar' : this.avalaraClient ? 'avalara' : 'manual')
  }

  private async getSupabase() {
    if (!this.supabase) {
      this.supabase = await createClient()
    }
    return this.supabase
  }

  /**
   * Calculate tax for a transaction
   * Primary method for all tax calculations
   */
  async calculateTax(params: TaxCalculationParams): Promise<TaxResult> {
    try {
      // 1. Check if manual override
      if (params.manualTaxRate !== undefined) {
        return this.calculateManualTax(params)
      }

      // 2. Check for tax exemption
      if (params.exemptionCertificateId) {
        const isExempt = await this.checkTaxExemption(params.userId, params.exemptionCertificateId)
        if (isExempt) {
          return this.createExemptResult(params)
        }
      }

      // 3. Determine tax type based on location
      const taxType = this.determineTaxType(params.destinationCountry)

      // 4. Check if user has nexus in destination
      const hasNexus = await this.checkNexus(
        params.userId,
        params.destinationCountry,
        params.destinationState
      )

      // 5. Call appropriate tax calculation API
      let result: TaxResult

      if (params.destinationCountry === 'US' && this.taxjarApiKey) {
        // Use TaxJar for US calculations
        result = await this.calculateWithTaxJar(params, hasNexus)
      } else if (this.avalaraApiKey) {
        // Use Avalara for international
        result = await this.calculateWithAvalara(params, hasNexus)
      } else {
        // Fallback to database rates
        result = await this.calculateWithDatabaseRates(params, hasNexus)
      }

      // 6. Store calculation in database
      await this.storeTaxCalculation(params, result)

      // 7. Update running tax totals
      await this.updateTaxTotals(params.userId, result.taxAmount, params.transactionDate)

      return result

    } catch (error) {
      console.error('Tax calculation error:', error)
      throw new Error(`Failed to calculate tax: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Calculate tax using TaxJar API (US)
   */
  private async calculateWithTaxJar(
    params: TaxCalculationParams,
    hasNexus: boolean
  ): Promise<TaxResult> {
    if (!this.taxjarClient) {
      throw new Error('TaxJar client not configured')
    }

    try {
      const result = await this.taxjarClient.calculateTax({
        from_country: params.originCountry || 'US',
        from_zip: params.originPostalCode || '',
        from_state: params.originState || '',
        from_city: params.originCity || '',

        to_country: params.destinationCountry,
        to_zip: params.destinationPostalCode || '',
        to_state: params.destinationState || '',
        to_city: params.destinationCity || '',

        amount: params.subtotal / 100, // Convert cents to dollars
        shipping: (params.shippingAmount || 0) / 100,

        line_items: params.lineItems?.map(item => ({
          id: item.id,
          quantity: item.quantity,
          unit_price: item.unitPrice / 100, // Convert cents to dollars
          product_tax_code: item.productTaxCode || '',
          discount: item.discount ? item.discount / 100 : undefined
        })),
        customer_id: params.customerId,
        exemption_type: params.exemptionCertificateId ? 'wholesale' : undefined
      })

      const tax = result.tax
      const breakdown = tax.breakdown

      // Build jurisdictions array
      const jurisdictions: TaxJurisdiction[] = []
      if (breakdown?.state_tax_rate) {
        jurisdictions.push({
          name: tax.jurisdictions?.state || 'State',
          type: 'state',
          rate: breakdown.state_tax_rate,
          amount: Math.round(breakdown.state_tax_collectable * 100)
        })
      }
      if (breakdown?.county_tax_rate) {
        jurisdictions.push({
          name: tax.jurisdictions?.county || 'County',
          type: 'county',
          rate: breakdown.county_tax_rate,
          amount: Math.round(breakdown.county_tax_collectable * 100)
        })
      }
      if (breakdown?.city_tax_rate) {
        jurisdictions.push({
          name: tax.jurisdictions?.city || 'City',
          type: 'city',
          rate: breakdown.city_tax_rate,
          amount: Math.round(breakdown.city_tax_collectable * 100)
        })
      }
      if (breakdown?.special_tax_rate) {
        jurisdictions.push({
          name: 'Special District',
          type: 'special',
          rate: breakdown.special_tax_rate,
          amount: Math.round(breakdown.special_district_tax_collectable * 100)
        })
      }

      // Build line item taxes
      const lineItemTaxes: TaxLineItemResult[] = breakdown?.line_items?.map(item => ({
        id: item.id,
        taxableAmount: Math.round(item.taxable_amount * 100),
        taxAmount: Math.round(item.tax_collectable * 100),
        taxRate: item.combined_tax_rate
      })) || []

      // Log API call
      await this.logApiCall('taxjar', '/taxes', {}, result, 200)

      return {
        taxAmount: Math.round(tax.amount_to_collect * 100), // Convert back to cents
        taxRate: tax.rate,
        totalAmount: params.subtotal + Math.round(tax.amount_to_collect * 100),
        breakdown: {
          state: breakdown ? Math.round(breakdown.state_tax_collectable * 100) : 0,
          county: breakdown ? Math.round(breakdown.county_tax_collectable * 100) : 0,
          city: breakdown ? Math.round(breakdown.city_tax_collectable * 100) : 0,
          special: breakdown ? Math.round(breakdown.special_district_tax_collectable * 100) : 0
        },
        hasNexus: tax.has_nexus,
        isTaxable: tax.taxable_amount > 0,
        calculationMethod: 'taxjar',
        provider: 'taxjar',
        jurisdictions,
        lineItemTaxes,
        metadata: { apiResponse: result }
      }

    } catch (error) {
      console.error('TaxJar calculation failed, falling back to database rates:', error)
      return this.calculateWithDatabaseRates(params, hasNexus)
    }
  }

  /**
   * Calculate tax using Avalara API (International)
   */
  private async calculateWithAvalara(
    params: TaxCalculationParams,
    hasNexus: boolean
  ): Promise<TaxResult> {
    if (!this.avalaraClient) {
      throw new Error('Avalara client not configured')
    }

    try {
      // Map transaction type to Avalara document type
      const typeMap: Record<string, 'SalesOrder' | 'SalesInvoice' | 'ReturnOrder' | 'ReturnInvoice'> = {
        'invoice': 'SalesInvoice',
        'payment': 'SalesInvoice',
        'expense': 'SalesOrder',
        'refund': 'ReturnInvoice'
      }

      // Build line items
      const lines = params.lineItems?.map((item, index) => ({
        number: item.id || String(index + 1),
        quantity: item.quantity,
        amount: (item.unitPrice * item.quantity - (item.discount || 0)) / 100, // Convert cents to dollars
        taxCode: this.mapToAvalaraTaxCode(item.productTaxCode, item.category),
        description: item.description
      })) || [{
        number: '1',
        quantity: 1,
        amount: params.subtotal / 100, // Convert cents to dollars
        description: 'Transaction amount'
      }]

      // Add shipping as separate line item if present
      if (params.shippingAmount && params.shippingAmount > 0) {
        lines.push({
          number: 'SHIPPING',
          quantity: 1,
          amount: params.shippingAmount / 100,
          taxCode: 'FR', // Freight
          description: 'Shipping'
        })
      }

      const result = await this.avalaraClient.calculateTax({
        type: typeMap[params.transactionType] || 'SalesInvoice',
        date: params.transactionDate.toISOString().split('T')[0],
        customerCode: params.customerId || params.userId,
        addresses: {
          shipFrom: {
            line1: '',
            city: params.originCity || '',
            region: params.originState || '',
            postalCode: params.originPostalCode || '',
            country: params.originCountry || 'US'
          },
          shipTo: {
            line1: '',
            city: params.destinationCity || '',
            region: params.destinationState || '',
            postalCode: params.destinationPostalCode || '',
            country: params.destinationCountry
          }
        },
        lines,
        commit: false, // Don't commit immediately - do this separately
        exemptionNo: params.exemptionCertificateId
      })

      // Build jurisdictions from summary
      const jurisdictions: TaxJurisdiction[] = result.summary?.map(s => ({
        name: s.jurisName,
        type: this.mapAvalaraJurisType(s.jurisType),
        rate: s.rate,
        amount: Math.round(s.tax * 100) // Convert to cents
      })) || []

      // Build breakdown from summary
      const breakdown: TaxBreakdown = {}
      result.summary?.forEach(s => {
        const key = s.jurisType.toLowerCase()
        breakdown[key] = (breakdown[key] || 0) + Math.round(s.tax * 100)
      })

      // Build line item taxes
      const lineItemTaxes: TaxLineItemResult[] = result.lines?.map(line => ({
        id: line.lineNumber,
        taxableAmount: Math.round(line.taxableAmount * 100),
        taxAmount: Math.round(line.tax * 100),
        taxRate: line.taxableAmount > 0 ? line.tax / line.taxableAmount : 0
      })) || []

      // Calculate overall rate
      const overallRate = result.totalTaxable > 0
        ? result.totalTax / result.totalTaxable
        : 0

      // Log API call
      await this.logApiCall('avalara', '/transactions/create', {}, result, 200)

      return {
        taxAmount: Math.round(result.totalTax * 100), // Convert to cents
        taxRate: overallRate,
        totalAmount: params.subtotal + Math.round(result.totalTax * 100),
        breakdown,
        hasNexus,
        isTaxable: result.totalTaxable > 0,
        calculationMethod: 'avalara',
        provider: 'avalara',
        jurisdictions,
        lineItemTaxes,
        metadata: {
          transactionId: result.id,
          transactionCode: result.code,
          apiResponse: result
        }
      }

    } catch (error) {
      console.error('Avalara calculation failed, falling back to database rates:', error)
      return this.calculateWithDatabaseRates(params, hasNexus)
    }
  }

  /**
   * Map product tax code to Avalara tax code
   */
  private mapToAvalaraTaxCode(productTaxCode?: string, category?: string): string {
    if (productTaxCode) return productTaxCode

    // Default Avalara tax codes by category
    const categoryMap: Record<string, string> = {
      'digital_services': 'D0000000', // Digital Services
      'saas': 'D9999', // Software as a Service
      'consulting_services': 'P0000000', // Professional Services
      'professional_services': 'P0000000',
      'training': 'S0020001', // Training Services
      'physical_goods': 'P0000000', // Tangible Personal Property
      'digital_goods': 'D0000000', // Digital Goods
      'general': 'P0000000' // General tangible goods
    }

    return categoryMap[category || 'general'] || 'P0000000'
  }

  /**
   * Map Avalara jurisdiction type to our type
   */
  private mapAvalaraJurisType(jurisType: string): 'federal' | 'state' | 'county' | 'city' | 'special' {
    const typeMap: Record<string, 'federal' | 'state' | 'county' | 'city' | 'special'> = {
      'Country': 'federal',
      'State': 'state',
      'County': 'county',
      'City': 'city',
      'Special': 'special'
    }
    return typeMap[jurisType] || 'special'
  }

  /**
   * Calculate tax using database rates (fallback)
   */
  private async calculateWithDatabaseRates(
    params: TaxCalculationParams,
    hasNexus: boolean
  ): Promise<TaxResult> {
    const { data: taxRates, error } = await this.supabase
      .from('tax_rates')
      .select('*')
      .eq('country', params.destinationCountry)
      .eq('is_active', true)
      .lte('effective_from', params.transactionDate.toISOString().split('T')[0])
      .or(`effective_to.is.null,effective_to.gte.${params.transactionDate.toISOString().split('T')[0]}`)
      .order('priority', { ascending: false })
      .limit(1)
      .single()

    if (error || !taxRates) {
      // No tax rate found, return zero tax
      return {
        taxAmount: 0,
        taxRate: 0,
        totalAmount: params.subtotal,
        breakdown: {},
        hasNexus: false,
        isTaxable: false,
        calculationMethod: 'database',
        metadata: { error: 'No tax rate found' }
      }
    }

    const taxAmount = params.subtotal * taxRates.rate

    return {
      taxAmount,
      taxRate: taxRates.rate,
      totalAmount: params.subtotal + taxAmount,
      breakdown: {
        [taxRates.tax_type]: taxAmount
      },
      hasNexus,
      isTaxable: true,
      calculationMethod: 'database',
      metadata: { taxRateId: taxRates.id }
    }
  }

  /**
   * Calculate tax with manual override
   */
  private calculateManualTax(params: TaxCalculationParams): TaxResult {
    const taxAmount = params.subtotal * (params.manualTaxRate || 0)

    return {
      taxAmount,
      taxRate: params.manualTaxRate || 0,
      totalAmount: params.subtotal + taxAmount,
      breakdown: { manual: taxAmount },
      hasNexus: false,
      isTaxable: true,
      calculationMethod: 'manual'
    }
  }

  /**
   * Create exempt result (zero tax)
   */
  private createExemptResult(params: TaxCalculationParams): TaxResult {
    return {
      taxAmount: 0,
      taxRate: 0,
      totalAmount: params.subtotal,
      breakdown: {},
      hasNexus: false,
      isTaxable: false,
      calculationMethod: 'exempt',
      metadata: { exemptionCertificateId: params.exemptionCertificateId }
    }
  }

  /**
   * Determine tax type based on country
   */
  private determineTaxType(country: string): string {
    const vatCountries = ['GB', 'DE', 'FR', 'ES', 'IT', 'NL', 'BE', 'SE', 'PL', 'AT']
    const gstCountries = ['CA', 'AU', 'NZ', 'IN', 'SG', 'MY']

    if (vatCountries.includes(country)) return 'vat'
    if (gstCountries.includes(country)) return 'gst'
    if (country === 'US') return 'sales'
    if (country === 'JP') return 'consumption'

    return 'vat' // Default for most countries
  }

  /**
   * Check if user has nexus in location
   */
  private async checkNexus(
    userId: string,
    country: string,
    state?: string
  ): Promise<boolean> {
    const { data: profile } = await this.supabase
      .from('user_tax_profiles')
      .select('nexus_states, primary_country, primary_state')
      .eq('user_id', userId)
      .single()

    if (!profile) return false

    // User always has nexus in their primary location
    if (profile.primary_country === country) {
      if (!state || profile.primary_state === state) {
        return true
      }
    }

    // Check US state nexus
    if (country === 'US' && state && profile.nexus_states) {
      return profile.nexus_states.includes(state)
    }

    return false
  }

  /**
   * Check tax exemption
   */
  private async checkTaxExemption(
    userId: string,
    certificateId: string
  ): Promise<boolean> {
    const { data: exemption } = await this.supabase
      .from('tax_exemptions')
      .select('*')
      .eq('user_id', userId)
      .eq('id', certificateId)
      .eq('status', 'active')
      .lte('valid_from', new Date().toISOString())
      .or(`valid_until.is.null,valid_until.gte.${new Date().toISOString()}`)
      .single()

    return !!exemption
  }

  /**
   * Store tax calculation in database
   */
  private async storeTaxCalculation(
    params: TaxCalculationParams,
    result: TaxResult
  ): Promise<void> {
    await this.supabase.from('tax_calculations').insert({
      user_id: params.userId,
      transaction_id: params.transactionId,
      transaction_type: params.transactionType,
      transaction_date: params.transactionDate.toISOString().split('T')[0],

      origin_country: params.originCountry,
      origin_state: params.originState,
      origin_city: params.originCity,
      origin_postal_code: params.originPostalCode,

      destination_country: params.destinationCountry,
      destination_state: params.destinationState,
      destination_city: params.destinationCity,
      destination_postal_code: params.destinationPostalCode,

      subtotal: params.subtotal,
      shipping_amount: params.shippingAmount || 0,
      discount_amount: params.discountAmount || 0,

      tax_type: this.determineTaxType(params.destinationCountry),
      tax_rate: result.taxRate,
      tax_amount: result.taxAmount,
      total_amount: result.totalAmount,

      breakdown: result.breakdown,
      calculation_method: result.calculationMethod,
      api_response: result.metadata,

      has_nexus: result.hasNexus,
      is_taxable: result.isTaxable,
      status: 'calculated'
    })
  }

  /**
   * Update running tax totals for the user
   */
  private async updateTaxTotals(
    userId: string,
    taxAmount: number,
    transactionDate: Date
  ): Promise<void> {
    const year = transactionDate.getFullYear()

    // Update tax filing record if exists
    await this.supabase.rpc('increment_tax_total', {
      p_user_id: userId,
      p_tax_year: year,
      p_tax_amount: taxAmount
    }).catch(() => {
      // RPC might not exist yet, ignore error
    })
  }

  /**
   * Log API call for audit trail
   */
  private async logApiCall(
    provider: string,
    endpoint: string,
    request: any,
    response: any,
    status: number
  ): Promise<void> {
    await this.supabase.from('tax_api_logs').insert({
      api_provider: provider,
      api_endpoint: endpoint,
      api_method: 'POST',
      request_payload: request,
      response_status: status,
      response_payload: response,
      is_error: status >= 400,
      error_message: status >= 400 ? response.error : null
    })
  }

  /**
   * AI-powered expense categorization for deductions
   */
  async categorizeExpenseForDeduction(expense: {
    description: string
    amount: number
    category?: string
    merchant?: string
    date: Date
  }): Promise<DeductionSuggestion> {
    // This would integrate with OpenAI API
    // For now, returning rule-based categorization

    const description = expense.description.toLowerCase()

    // Rule-based categorization
    if (description.includes('office') || description.includes('desk') || description.includes('chair')) {
      return {
        category: 'equipment',
        confidence: 0.85,
        estimatedDeduction: expense.amount,
        requirements: ['Business use only', 'Keep receipt'],
        documentation: ['Receipt', 'Photo of equipment']
      }
    }

    if (description.includes('travel') || description.includes('flight') || description.includes('hotel')) {
      return {
        category: 'travel',
        subcategory: 'lodging',
        confidence: 0.90,
        estimatedDeduction: expense.amount,
        requirements: ['Business purpose', 'Travel more than 100 miles'],
        documentation: ['Receipt', 'Business purpose note']
      }
    }

    if (description.includes('gas') || description.includes('fuel') || description.includes('mileage')) {
      return {
        category: 'vehicle',
        subcategory: 'mileage',
        confidence: 0.75,
        estimatedDeduction: expense.amount,
        requirements: ['Business trip', 'Mileage log'],
        documentation: ['Mileage log', 'Trip purpose']
      }
    }

    // Default category
    return {
      category: 'general_business',
      confidence: 0.50,
      estimatedDeduction: expense.amount,
      requirements: ['Ordinary and necessary business expense'],
      documentation: ['Receipt']
    }
  }

  /**
   * Get tax summary for user
   */
  async getTaxSummary(
    userId: string,
    year: number
  ): Promise<{
    totalIncome: number
    totalExpenses: number
    totalDeductions: number
    totalTaxCollected: number
    totalTaxPaid: number
    estimatedTaxOwed: number
    nexusStates: NexusState[]
    quarterlyBreakdown: Array<{
      quarter: number
      income: number
      expenses: number
      taxCollected: number
      taxPaid: number
    }>
  }> {
    const supabase = await this.getSupabase()
    const startDate = `${year}-01-01`
    const endDate = `${year}-12-31`

    // Get tax calculations for the year
    const { data: calculations } = await supabase
      .from('tax_calculations')
      .select('tax_amount, subtotal, transaction_type, transaction_date')
      .eq('user_id', userId)
      .gte('transaction_date', startDate)
      .lte('transaction_date', endDate)

    // Calculate totals
    let totalIncome = 0
    let totalExpenses = 0
    let totalTaxCollected = 0
    let totalTaxPaid = 0
    const quarterlyData: Record<number, { income: number; expenses: number; taxCollected: number; taxPaid: number }> = {
      1: { income: 0, expenses: 0, taxCollected: 0, taxPaid: 0 },
      2: { income: 0, expenses: 0, taxCollected: 0, taxPaid: 0 },
      3: { income: 0, expenses: 0, taxCollected: 0, taxPaid: 0 },
      4: { income: 0, expenses: 0, taxCollected: 0, taxPaid: 0 }
    }

    calculations?.forEach(calc => {
      const date = new Date(calc.transaction_date)
      const quarter = Math.ceil((date.getMonth() + 1) / 3)

      if (calc.transaction_type === 'invoice' || calc.transaction_type === 'payment') {
        totalIncome += calc.subtotal
        totalTaxCollected += calc.tax_amount
        quarterlyData[quarter].income += calc.subtotal
        quarterlyData[quarter].taxCollected += calc.tax_amount
      } else if (calc.transaction_type === 'expense') {
        totalExpenses += calc.subtotal
        totalTaxPaid += calc.tax_amount
        quarterlyData[quarter].expenses += calc.subtotal
        quarterlyData[quarter].taxPaid += calc.tax_amount
      }
    })

    // Get total deductions
    const { data: deductions } = await supabase
      .from('tax_deductions')
      .select('deductible_amount')
      .eq('user_id', userId)
      .eq('tax_year', year)
      .eq('is_approved', true)

    const totalDeductions = deductions?.reduce((sum, ded) => sum + ded.deductible_amount, 0) || 0

    // Get nexus states
    const nexusStates = await this.getNexusStates(userId)

    // Estimate tax owed (simplified calculation)
    const taxableIncome = totalIncome - totalExpenses - totalDeductions
    const estimatedTaxOwed = Math.max(0, taxableIncome * 0.25) // 25% estimate for self-employment

    return {
      totalIncome,
      totalExpenses,
      totalDeductions,
      totalTaxCollected,
      totalTaxPaid,
      estimatedTaxOwed,
      nexusStates,
      quarterlyBreakdown: Object.entries(quarterlyData).map(([quarter, data]) => ({
        quarter: parseInt(quarter),
        ...data
      }))
    }
  }

  /**
   * Record transaction for tax filing (commit to TaxJar/Avalara)
   */
  async recordTransaction(params: {
    userId: string
    transactionId: string
    transactionDate: Date
    amount: number
    taxAmount: number
    shippingAmount?: number
    originAddress: TaxAddress
    destinationAddress: TaxAddress
    lineItems?: TaxLineItem[]
    customerId?: string
    provider?: TaxProvider
  }): Promise<{ success: boolean; transactionId: string; provider: string }> {
    const provider = params.provider || this.defaultProvider

    if (provider === 'taxjar' && this.taxjarClient) {
      try {
        const result = await this.taxjarClient.createTransaction({
          transaction_id: params.transactionId,
          transaction_date: params.transactionDate.toISOString().split('T')[0],
          from_country: params.originAddress.country,
          from_zip: params.originAddress.postal_code,
          from_state: params.originAddress.state,
          from_city: params.originAddress.city,
          to_country: params.destinationAddress.country,
          to_zip: params.destinationAddress.postal_code,
          to_state: params.destinationAddress.state,
          to_city: params.destinationAddress.city,
          amount: params.amount / 100, // Convert cents to dollars
          shipping: (params.shippingAmount || 0) / 100,
          sales_tax: params.taxAmount / 100,
          line_items: params.lineItems?.map(item => ({
            id: item.id,
            quantity: item.quantity,
            unit_price: item.unitPrice / 100,
            product_tax_code: item.productTaxCode,
            sales_tax: 0 // Calculated by TaxJar
          })),
          customer_id: params.customerId
        })

        // Update status in database
        const supabase = await this.getSupabase()
        await supabase
          .from('tax_calculations')
          .update({
            status: 'recorded',
            provider_transaction_id: params.transactionId,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', params.transactionId)
          .eq('user_id', params.userId)

        return { success: true, transactionId: params.transactionId, provider: 'taxjar' }
      } catch (error) {
        console.error('TaxJar transaction recording failed:', error)
        throw error
      }
    }

    if (provider === 'avalara' && this.avalaraClient) {
      try {
        // For Avalara, we need to commit the existing transaction
        // The calculation should have been done with commit: false
        const metadata = await this.getTransactionMetadata(params.userId, params.transactionId)

        if (metadata?.transactionCode) {
          await this.avalaraClient.commitTransaction(metadata.transactionCode)
        }

        // Update status in database
        const supabase = await this.getSupabase()
        await supabase
          .from('tax_calculations')
          .update({
            status: 'recorded',
            provider_transaction_id: metadata?.transactionCode,
            updated_at: new Date().toISOString()
          })
          .eq('transaction_id', params.transactionId)
          .eq('user_id', params.userId)

        return { success: true, transactionId: metadata?.transactionCode || params.transactionId, provider: 'avalara' }
      } catch (error) {
        console.error('Avalara transaction commit failed:', error)
        throw error
      }
    }

    // Manual recording - just update status
    const supabase = await this.getSupabase()
    await supabase
      .from('tax_calculations')
      .update({
        status: 'recorded',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', params.transactionId)
      .eq('user_id', params.userId)

    return { success: true, transactionId: params.transactionId, provider: 'manual' }
  }

  /**
   * Create tax refund
   */
  async createRefund(params: {
    userId: string
    originalTransactionId: string
    refundTransactionId: string
    refundDate: Date
    amount: number
    taxAmount: number
    shippingAmount?: number
    originAddress: TaxAddress
    destinationAddress: TaxAddress
    provider?: TaxProvider
  }): Promise<{ success: boolean; refundId: string; provider: string }> {
    const provider = params.provider || this.defaultProvider

    if (provider === 'taxjar' && this.taxjarClient) {
      try {
        const result = await this.taxjarClient.createRefund({
          transaction_id: params.refundTransactionId,
          transaction_reference_id: params.originalTransactionId,
          transaction_date: params.refundDate.toISOString().split('T')[0],
          from_country: params.originAddress.country,
          from_zip: params.originAddress.postal_code,
          from_state: params.originAddress.state,
          to_country: params.destinationAddress.country,
          to_zip: params.destinationAddress.postal_code,
          to_state: params.destinationAddress.state,
          amount: -Math.abs(params.amount / 100), // Negative for refund
          shipping: -(params.shippingAmount || 0) / 100,
          sales_tax: -Math.abs(params.taxAmount / 100)
        })

        // Store refund in database
        const supabase = await this.getSupabase()
        await supabase.from('tax_refunds').insert({
          user_id: params.userId,
          original_transaction_id: params.originalTransactionId,
          refund_transaction_id: params.refundTransactionId,
          refund_date: params.refundDate.toISOString().split('T')[0],
          amount: params.amount,
          tax_amount: params.taxAmount,
          provider: 'taxjar',
          status: 'recorded',
          created_at: new Date().toISOString()
        })

        return { success: true, refundId: params.refundTransactionId, provider: 'taxjar' }
      } catch (error) {
        console.error('TaxJar refund failed:', error)
        throw error
      }
    }

    if (provider === 'avalara' && this.avalaraClient) {
      try {
        // For Avalara, we void or adjust the original transaction
        const metadata = await this.getTransactionMetadata(params.userId, params.originalTransactionId)

        if (metadata?.transactionCode) {
          await this.avalaraClient.voidTransaction(metadata.transactionCode)
        }

        // Store refund in database
        const supabase = await this.getSupabase()
        await supabase.from('tax_refunds').insert({
          user_id: params.userId,
          original_transaction_id: params.originalTransactionId,
          refund_transaction_id: params.refundTransactionId,
          refund_date: params.refundDate.toISOString().split('T')[0],
          amount: params.amount,
          tax_amount: params.taxAmount,
          provider: 'avalara',
          status: 'recorded',
          created_at: new Date().toISOString()
        })

        return { success: true, refundId: params.refundTransactionId, provider: 'avalara' }
      } catch (error) {
        console.error('Avalara void failed:', error)
        throw error
      }
    }

    // Manual refund recording
    const supabase = await this.getSupabase()
    await supabase.from('tax_refunds').insert({
      user_id: params.userId,
      original_transaction_id: params.originalTransactionId,
      refund_transaction_id: params.refundTransactionId,
      refund_date: params.refundDate.toISOString().split('T')[0],
      amount: params.amount,
      tax_amount: params.taxAmount,
      provider: 'manual',
      status: 'recorded',
      created_at: new Date().toISOString()
    })

    return { success: true, refundId: params.refundTransactionId, provider: 'manual' }
  }

  /**
   * Validate address for tax purposes
   */
  async validateAddress(address: TaxAddress): Promise<{
    isValid: boolean
    normalizedAddress: TaxAddress
    suggestions?: TaxAddress[]
  }> {
    // Try TaxJar first
    if (this.taxjarClient && address.country === 'US') {
      try {
        const result = await this.taxjarClient.validateAddress({
          country: address.country,
          state: address.state,
          zip: address.postal_code,
          city: address.city,
          street: address.line1
        })

        if (result.addresses && result.addresses.length > 0) {
          const normalized = result.addresses[0]
          return {
            isValid: true,
            normalizedAddress: {
              line1: normalized.street,
              city: normalized.city,
              state: normalized.state,
              postal_code: normalized.zip,
              country: normalized.country
            },
            suggestions: result.addresses.slice(1).map(addr => ({
              line1: addr.street,
              city: addr.city,
              state: addr.state,
              postal_code: addr.zip,
              country: addr.country
            }))
          }
        }
      } catch (error) {
        console.error('TaxJar address validation failed:', error)
      }
    }

    // Try Avalara for international
    if (this.avalaraClient) {
      try {
        const result = await this.avalaraClient.resolveAddress({
          line1: address.line1,
          city: address.city,
          region: address.state,
          postalCode: address.postal_code,
          country: address.country
        })

        if (result.address) {
          return {
            isValid: true,
            normalizedAddress: {
              line1: result.address.line1,
              city: result.address.city,
              state: result.address.region,
              postal_code: result.address.postalCode,
              country: result.address.country
            },
            suggestions: result.validatedAddresses?.map(addr => ({
              line1: addr.line1,
              city: addr.city,
              state: addr.region,
              postal_code: addr.postalCode,
              country: addr.country
            }))
          }
        }
      } catch (error) {
        console.error('Avalara address validation failed:', error)
      }
    }

    // Return original address as fallback
    return {
      isValid: true, // Assume valid if we can't verify
      normalizedAddress: address
    }
  }

  /**
   * Get tax rate for a location
   */
  async getTaxRate(params: {
    postalCode: string
    country: string
    state?: string
    city?: string
  }): Promise<{
    combinedRate: number
    stateRate: number
    countyRate: number
    cityRate: number
    specialRate: number
    freightTaxable: boolean
  }> {
    // Try TaxJar for US
    if (this.taxjarClient && params.country === 'US') {
      try {
        const result = await this.taxjarClient.getRatesForLocation(params.postalCode, {
          country: params.country,
          state: params.state,
          city: params.city
        })

        return {
          combinedRate: result.rate.combined_rate,
          stateRate: result.rate.state_rate,
          countyRate: result.rate.county_rate,
          cityRate: result.rate.city_rate,
          specialRate: result.rate.combined_district_rate,
          freightTaxable: result.rate.freight_taxable
        }
      } catch (error) {
        console.error('TaxJar rate lookup failed:', error)
      }
    }

    // Fallback to database rates
    const supabase = await this.getSupabase()
    const { data: rate } = await supabase
      .from('tax_rates')
      .select('rate, tax_type')
      .eq('country', params.country)
      .eq('is_active', true)
      .single()

    return {
      combinedRate: rate?.rate || 0,
      stateRate: rate?.rate || 0,
      countyRate: 0,
      cityRate: 0,
      specialRate: 0,
      freightTaxable: false
    }
  }

  /**
   * Get nexus states for user
   */
  async getNexusStates(userId: string): Promise<NexusState[]> {
    const supabase = await this.getSupabase()

    // First check if we have stored nexus data
    const { data: profile } = await supabase
      .from('user_tax_profiles')
      .select('nexus_states, primary_country, primary_state')
      .eq('user_id', userId)
      .single()

    const nexusStates: NexusState[] = []

    // Add primary location as physical nexus
    if (profile?.primary_state && profile?.primary_country) {
      nexusStates.push({
        state: profile.primary_state,
        country: profile.primary_country,
        hasNexus: true,
        nexusType: 'physical',
        effectiveDate: new Date().toISOString().split('T')[0]
      })
    }

    // Add economic nexus states from database
    const { data: economicNexus } = await supabase
      .from('tax_nexus')
      .select('*')
      .eq('user_id', userId)

    economicNexus?.forEach(nexus => {
      // Check if already added as physical
      const existing = nexusStates.find(n => n.state === nexus.state && n.country === nexus.country)
      if (existing) {
        existing.nexusType = 'both'
      } else {
        nexusStates.push({
          state: nexus.state,
          country: nexus.country,
          hasNexus: nexus.has_nexus,
          nexusType: nexus.nexus_type,
          effectiveDate: nexus.effective_date,
          salesThreshold: nexus.sales_threshold,
          transactionThreshold: nexus.transaction_threshold
        })
      }
    })

    return nexusStates
  }

  /**
   * Update nexus status for a state
   */
  async updateNexusStatus(params: {
    userId: string
    state: string
    country: string
    hasNexus: boolean
    nexusType: 'physical' | 'economic' | 'both'
    effectiveDate: string
    salesThreshold?: number
    transactionThreshold?: number
  }): Promise<void> {
    const supabase = await this.getSupabase()

    await supabase.from('tax_nexus').upsert({
      user_id: params.userId,
      state: params.state,
      country: params.country,
      has_nexus: params.hasNexus,
      nexus_type: params.nexusType,
      effective_date: params.effectiveDate,
      sales_threshold: params.salesThreshold,
      transaction_threshold: params.transactionThreshold,
      updated_at: new Date().toISOString()
    }, {
      onConflict: 'user_id,state,country'
    })

    // If using TaxJar, update nexus regions
    if (this.taxjarClient) {
      // TaxJar nexus is managed through their dashboard
      // Just log for reference
      console.log(`Nexus updated for ${params.state}, ${params.country}`)
    }
  }

  /**
   * Check economic nexus thresholds
   */
  async checkEconomicNexus(userId: string): Promise<Array<{
    state: string
    country: string
    totalSales: number
    totalTransactions: number
    salesThreshold: number
    transactionThreshold: number
    exceededSales: boolean
    exceededTransactions: boolean
    hasNexus: boolean
  }>> {
    const supabase = await this.getSupabase()

    // US Economic Nexus thresholds by state (2024 values)
    const stateThresholds: Record<string, { sales: number; transactions: number }> = {
      'AL': { sales: 250000, transactions: 0 },
      'AK': { sales: 0, transactions: 0 }, // No sales tax
      'AZ': { sales: 100000, transactions: 0 },
      'AR': { sales: 100000, transactions: 200 },
      'CA': { sales: 500000, transactions: 0 },
      'CO': { sales: 100000, transactions: 0 },
      'CT': { sales: 100000, transactions: 200 },
      'DE': { sales: 0, transactions: 0 }, // No sales tax
      'FL': { sales: 100000, transactions: 0 },
      'GA': { sales: 100000, transactions: 200 },
      'HI': { sales: 100000, transactions: 200 },
      'ID': { sales: 100000, transactions: 0 },
      'IL': { sales: 100000, transactions: 200 },
      'IN': { sales: 100000, transactions: 200 },
      'IA': { sales: 100000, transactions: 0 },
      'KS': { sales: 100000, transactions: 0 },
      'KY': { sales: 100000, transactions: 200 },
      'LA': { sales: 100000, transactions: 200 },
      'ME': { sales: 100000, transactions: 200 },
      'MD': { sales: 100000, transactions: 200 },
      'MA': { sales: 100000, transactions: 0 },
      'MI': { sales: 100000, transactions: 200 },
      'MN': { sales: 100000, transactions: 200 },
      'MS': { sales: 250000, transactions: 0 },
      'MO': { sales: 100000, transactions: 0 },
      'MT': { sales: 0, transactions: 0 }, // No sales tax
      'NE': { sales: 100000, transactions: 200 },
      'NV': { sales: 100000, transactions: 200 },
      'NH': { sales: 0, transactions: 0 }, // No sales tax
      'NJ': { sales: 100000, transactions: 200 },
      'NM': { sales: 100000, transactions: 0 },
      'NY': { sales: 500000, transactions: 100 },
      'NC': { sales: 100000, transactions: 200 },
      'ND': { sales: 100000, transactions: 0 },
      'OH': { sales: 100000, transactions: 200 },
      'OK': { sales: 100000, transactions: 0 },
      'OR': { sales: 0, transactions: 0 }, // No sales tax
      'PA': { sales: 100000, transactions: 0 },
      'RI': { sales: 100000, transactions: 200 },
      'SC': { sales: 100000, transactions: 0 },
      'SD': { sales: 100000, transactions: 200 },
      'TN': { sales: 100000, transactions: 0 },
      'TX': { sales: 500000, transactions: 0 },
      'UT': { sales: 100000, transactions: 200 },
      'VT': { sales: 100000, transactions: 200 },
      'VA': { sales: 100000, transactions: 200 },
      'WA': { sales: 100000, transactions: 0 },
      'WV': { sales: 100000, transactions: 200 },
      'WI': { sales: 100000, transactions: 0 },
      'WY': { sales: 100000, transactions: 200 }
    }

    // Get sales by state for current year
    const year = new Date().getFullYear()
    const { data: salesByState } = await supabase
      .from('tax_calculations')
      .select('destination_state, subtotal')
      .eq('user_id', userId)
      .eq('destination_country', 'US')
      .gte('transaction_date', `${year}-01-01`)
      .in('transaction_type', ['invoice', 'payment'])

    // Aggregate by state
    const stateStats: Record<string, { sales: number; transactions: number }> = {}
    salesByState?.forEach(calc => {
      const state = calc.destination_state
      if (!state) return

      if (!stateStats[state]) {
        stateStats[state] = { sales: 0, transactions: 0 }
      }
      stateStats[state].sales += calc.subtotal
      stateStats[state].transactions += 1
    })

    // Check against thresholds
    const results: Array<{
      state: string
      country: string
      totalSales: number
      totalTransactions: number
      salesThreshold: number
      transactionThreshold: number
      exceededSales: boolean
      exceededTransactions: boolean
      hasNexus: boolean
    }> = []

    Object.entries(stateThresholds).forEach(([state, threshold]) => {
      const stats = stateStats[state] || { sales: 0, transactions: 0 }
      const exceededSales = threshold.sales > 0 && stats.sales >= threshold.sales * 100 // Convert threshold to cents
      const exceededTransactions = threshold.transactions > 0 && stats.transactions >= threshold.transactions

      results.push({
        state,
        country: 'US',
        totalSales: stats.sales,
        totalTransactions: stats.transactions,
        salesThreshold: threshold.sales * 100, // In cents
        transactionThreshold: threshold.transactions,
        exceededSales,
        exceededTransactions,
        hasNexus: exceededSales || exceededTransactions
      })
    })

    return results.filter(r => r.totalSales > 0 || r.hasNexus).sort((a, b) => b.totalSales - a.totalSales)
  }

  /**
   * Create tax exemption certificate
   */
  async createExemptionCertificate(params: {
    userId: string
    certificateNumber: string
    exemptionType: string
    issuingState: string
    validFrom: string
    validUntil?: string
    documentUrl?: string
  }): Promise<TaxExemptionCertificate> {
    const supabase = await this.getSupabase()

    const { data, error } = await supabase
      .from('tax_exemptions')
      .insert({
        user_id: params.userId,
        certificate_number: params.certificateNumber,
        exemption_type: params.exemptionType,
        issuing_state: params.issuingState,
        valid_from: params.validFrom,
        valid_until: params.validUntil,
        document_url: params.documentUrl,
        status: 'active',
        created_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error

    return {
      id: data.id,
      userId: data.user_id,
      certificateNumber: data.certificate_number,
      exemptionType: data.exemption_type,
      issuingState: data.issuing_state,
      validFrom: data.valid_from,
      validUntil: data.valid_until,
      status: data.status
    }
  }

  /**
   * Get exemption certificates for user
   */
  async getExemptionCertificates(userId: string): Promise<TaxExemptionCertificate[]> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('tax_exemptions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    return data?.map(cert => ({
      id: cert.id,
      userId: cert.user_id,
      certificateNumber: cert.certificate_number,
      exemptionType: cert.exemption_type,
      issuingState: cert.issuing_state,
      validFrom: cert.valid_from,
      validUntil: cert.valid_until,
      status: cert.status
    })) || []
  }

  /**
   * Helper to get transaction metadata
   */
  private async getTransactionMetadata(userId: string, transactionId: string): Promise<{
    transactionCode?: string
    transactionId?: number
  } | null> {
    const supabase = await this.getSupabase()

    const { data } = await supabase
      .from('tax_calculations')
      .select('api_response')
      .eq('user_id', userId)
      .eq('transaction_id', transactionId)
      .single()

    if (!data?.api_response) return null

    const metadata = data.api_response as Record<string, unknown>
    return {
      transactionCode: metadata.transactionCode as string | undefined,
      transactionId: metadata.transactionId as number | undefined
    }
  }

  /**
   * Delete recorded transaction (for corrections)
   */
  async deleteTransaction(userId: string, transactionId: string): Promise<void> {
    // Try to delete from TaxJar
    if (this.taxjarClient) {
      try {
        await this.taxjarClient.deleteTransaction(transactionId)
      } catch (error) {
        console.error('TaxJar transaction deletion failed:', error)
      }
    }

    // Update status in database
    const supabase = await this.getSupabase()
    await supabase
      .from('tax_calculations')
      .update({
        status: 'deleted',
        updated_at: new Date().toISOString()
      })
      .eq('transaction_id', transactionId)
      .eq('user_id', userId)
  }

  /**
   * Get provider status
   */
  getProviderStatus(): {
    taxjar: { configured: boolean; sandbox: boolean }
    avalara: { configured: boolean; sandbox: boolean }
    defaultProvider: TaxProvider
  } {
    return {
      taxjar: {
        configured: !!this.taxjarClient,
        sandbox: process.env.TAXJAR_SANDBOX === 'true'
      },
      avalara: {
        configured: !!this.avalaraClient,
        sandbox: process.env.AVALARA_SANDBOX === 'true'
      },
      defaultProvider: this.defaultProvider
    }
  }
}

// Export singleton instance
export const taxService = new TaxService()
