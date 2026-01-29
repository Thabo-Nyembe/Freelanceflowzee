import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createFeatureLogger } from '@/lib/logger';

const logger = createFeatureLogger('billing-tax');

// Types
interface TaxRate {
  id: string;
  name: string;
  jurisdiction: string;
  country: string;
  state?: string;
  rate: number;
  type: 'vat' | 'sales_tax' | 'gst' | 'hst';
  inclusive: boolean;
  isActive: boolean;
}

interface TaxCalculation {
  subtotal: number;
  taxableAmount: number;
  taxAmount: number;
  total: number;
  breakdown: Array<{
    taxRate: TaxRate;
    taxableAmount: number;
    taxAmount: number;
  }>;
  customerExempt: boolean;
  exemptionReason?: string;
}

// Standard tax rates by country
const STANDARD_TAX_RATES: Record<string, { rate: number; type: string; name: string }> = {
  US: { rate: 0, type: 'sales_tax', name: 'Sales Tax (varies by state)' },
  CA: { rate: 5, type: 'gst', name: 'GST' },
  GB: { rate: 20, type: 'vat', name: 'VAT' },
  DE: { rate: 19, type: 'vat', name: 'MwSt' },
  FR: { rate: 20, type: 'vat', name: 'TVA' },
  AU: { rate: 10, type: 'gst', name: 'GST' },
  JP: { rate: 10, type: 'consumption_tax', name: 'Consumption Tax' },
  SG: { rate: 8, type: 'gst', name: 'GST' },
  NL: { rate: 21, type: 'vat', name: 'BTW' },
  IE: { rate: 23, type: 'vat', name: 'VAT' },
  ES: { rate: 21, type: 'vat', name: 'IVA' },
  IT: { rate: 22, type: 'vat', name: 'IVA' },
  SE: { rate: 25, type: 'vat', name: 'Moms' },
  NO: { rate: 25, type: 'vat', name: 'MVA' },
  DK: { rate: 25, type: 'vat', name: 'Moms' },
  FI: { rate: 24, type: 'vat', name: 'ALV' },
  PL: { rate: 23, type: 'vat', name: 'VAT' },
  BE: { rate: 21, type: 'vat', name: 'BTW/TVA' },
  AT: { rate: 20, type: 'vat', name: 'USt' },
  CH: { rate: 7.7, type: 'vat', name: 'MwSt' },
  NZ: { rate: 15, type: 'gst', name: 'GST' },
  IN: { rate: 18, type: 'gst', name: 'GST' },
  BR: { rate: 0, type: 'complex', name: 'ICMS/ISS (varies)' },
  MX: { rate: 16, type: 'vat', name: 'IVA' },
  ZA: { rate: 15, type: 'vat', name: 'VAT' },
  AE: { rate: 5, type: 'vat', name: 'VAT' },
  SA: { rate: 15, type: 'vat', name: 'VAT' }
};

// US state sales tax rates
const US_STATE_TAX_RATES: Record<string, number> = {
  AL: 4, AK: 0, AZ: 5.6, AR: 6.5, CA: 7.25, CO: 2.9, CT: 6.35, DE: 0,
  FL: 6, GA: 4, HI: 4, ID: 6, IL: 6.25, IN: 7, IA: 6, KS: 6.5,
  KY: 6, LA: 4.45, ME: 5.5, MD: 6, MA: 6.25, MI: 6, MN: 6.875, MS: 7,
  MO: 4.225, MT: 0, NE: 5.5, NV: 6.85, NH: 0, NJ: 6.625, NM: 5.125, NY: 4,
  NC: 4.75, ND: 5, OH: 5.75, OK: 4.5, OR: 0, PA: 6, RI: 7, SC: 6,
  SD: 4.5, TN: 7, TX: 6.25, UT: 5.95, VT: 6, VA: 5.3, WA: 6.5, WV: 6,
  WI: 5, WY: 4, DC: 6
};

// Canadian province HST/GST/PST rates
const CA_PROVINCE_TAX_RATES: Record<string, { gst: number; pst: number; hst: number }> = {
  AB: { gst: 5, pst: 0, hst: 0 },
  BC: { gst: 5, pst: 7, hst: 0 },
  MB: { gst: 5, pst: 7, hst: 0 },
  NB: { gst: 0, pst: 0, hst: 15 },
  NL: { gst: 0, pst: 0, hst: 15 },
  NT: { gst: 5, pst: 0, hst: 0 },
  NS: { gst: 0, pst: 0, hst: 15 },
  NU: { gst: 5, pst: 0, hst: 0 },
  ON: { gst: 0, pst: 0, hst: 13 },
  PE: { gst: 0, pst: 0, hst: 15 },
  QC: { gst: 5, pst: 9.975, hst: 0 },
  SK: { gst: 5, pst: 6, hst: 0 },
  YT: { gst: 5, pst: 0, hst: 0 }
};

// POST - Tax calculation actions
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'calculate': {
        const {
          organizationId,
          customerId,
          subtotal,
          lineItems,
          shippingAddress,
          taxIds
        } = params;

        // Get customer
        const { data: customer } = await supabase
          .from('users')
          .select('*, tax_exemptions(*)')
          .eq('id', customerId)
          .single();

        // Check for tax exemption
        const activeExemption = customer?.tax_exemptions?.find(
          (e: { status: string; expires_at: string | null }) =>
            e.status === 'verified' &&
            (!e.expires_at || new Date(e.expires_at) > new Date())
        );

        if (activeExemption) {
          return NextResponse.json({
            success: true,
            calculation: {
              subtotal,
              taxableAmount: 0,
              taxAmount: 0,
              total: subtotal,
              breakdown: [],
              customerExempt: true,
              exemptionReason: activeExemption.exemption_type
            }
          });
        }

        // Validate tax IDs (VAT number for EU, etc.)
        let validTaxId = false;
        if (taxIds?.vatNumber && shippingAddress?.country) {
          // In production, validate with VIES for EU VAT
          validTaxId = taxIds.vatNumber.length > 8;
        }

        // Determine applicable tax rate
        const country = shippingAddress?.country || 'US';
        const state = shippingAddress?.state;

        let taxRate = 0;
        let taxType = 'sales_tax';
        let taxName = 'Tax';
        const breakdown: Array<{ name: string; rate: number; amount: number }> = [];

        if (country === 'US' && state) {
          // US state sales tax
          taxRate = US_STATE_TAX_RATES[state] || 0;
          taxType = 'sales_tax';
          taxName = `${state} Sales Tax`;
        } else if (country === 'CA' && state) {
          // Canadian provincial taxes
          const provinceTax = CA_PROVINCE_TAX_RATES[state];
          if (provinceTax) {
            if (provinceTax.hst > 0) {
              taxRate = provinceTax.hst;
              taxName = 'HST';
              breakdown.push({ name: 'HST', rate: provinceTax.hst, amount: subtotal * provinceTax.hst / 100 });
            } else {
              if (provinceTax.gst > 0) {
                breakdown.push({ name: 'GST', rate: provinceTax.gst, amount: subtotal * provinceTax.gst / 100 });
              }
              if (provinceTax.pst > 0) {
                breakdown.push({ name: 'PST', rate: provinceTax.pst, amount: subtotal * provinceTax.pst / 100 });
              }
              taxRate = provinceTax.gst + provinceTax.pst;
            }
          }
        } else if (STANDARD_TAX_RATES[country]) {
          // Standard country rate
          const countryTax = STANDARD_TAX_RATES[country];
          taxRate = countryTax.rate;
          taxType = countryTax.type;
          taxName = countryTax.name;

          // B2B reverse charge for EU
          if (taxType === 'vat' && validTaxId) {
            taxRate = 0;
            taxName = 'VAT (Reverse Charge)';
          }
        }

        // Calculate tax
        const taxableAmount = lineItems
          ? lineItems.filter((item: { taxable?: boolean }) => item.taxable !== false).reduce((sum: number, item: { amount: number }) => sum + item.amount, 0)
          : subtotal;

        const taxAmount = Math.round(taxableAmount * taxRate) / 100;

        // Build response
        if (breakdown.length === 0 && taxRate > 0) {
          breakdown.push({ name: taxName, rate: taxRate, amount: taxAmount });
        }

        return NextResponse.json({
          success: true,
          calculation: {
            subtotal,
            taxableAmount,
            taxRate,
            taxAmount,
            total: subtotal + taxAmount,
            breakdown,
            taxType,
            country,
            state,
            validTaxId,
            customerExempt: false
          }
        });
      }

      case 'validate-tax-id': {
        const { taxId, country, type } = params;

        let isValid = false;
        let companyName = null;
        let address = null;
        let validationSource = 'format';

        // Clean the tax ID
        const cleanedTaxId = taxId?.toUpperCase().replace(/[\s-]/g, '') || '';

        // Basic format validation first
        if (type === 'vat' && country) {
          // EU VAT format: Country code (2 letters) + 2-12 alphanumeric
          const vatRegex = /^[A-Z]{2}[0-9A-Z]{2,12}$/;
          isValid = vatRegex.test(cleanedTaxId);

          // If format is valid and it's an EU country, validate with VIES
          const euCountries = ['AT', 'BE', 'BG', 'CY', 'CZ', 'DE', 'DK', 'EE', 'EL', 'ES', 'FI', 'FR', 'HR', 'HU', 'IE', 'IT', 'LT', 'LU', 'LV', 'MT', 'NL', 'PL', 'PT', 'RO', 'SE', 'SI', 'SK'];
          const extractedCountry = cleanedTaxId.substring(0, 2);

          if (isValid && euCountries.includes(extractedCountry)) {
            try {
              // Call EU VIES API for validation
              const vatNumber = cleanedTaxId.substring(2);
              const viesResponse = await fetch('https://ec.europa.eu/taxation_customs/vies/rest-api/ms/' + extractedCountry + '/vat/' + vatNumber, {
                method: 'GET',
                headers: { 'Accept': 'application/json' },
                next: { revalidate: 3600 } // Cache for 1 hour
              });

              if (viesResponse.ok) {
                const viesData = await viesResponse.json();
                isValid = viesData.isValid === true;
                companyName = viesData.name || null;
                address = viesData.address || null;
                validationSource = 'vies';
              }
            } catch (error) {
              logger.warn('VIES API validation failed, using format validation', { taxId: cleanedTaxId });
              // Fall back to format validation only
            }
          }
        } else if (type === 'vat' && country === 'GB') {
          // UK VAT: 9 or 12 digits (GB prefix optional)
          const ukVatRegex = /^(GB)?(\d{9}|\d{12})$/;
          isValid = ukVatRegex.test(cleanedTaxId);

          // In production, validate with HMRC API
          if (isValid) {
            validationSource = 'format';
          }
        } else if (type === 'ein' && country === 'US') {
          // US EIN format: XX-XXXXXXX or XXXXXXXXX
          const einRegex = /^\d{9}$/;
          const cleanedEin = taxId.replace(/-/g, '');
          isValid = einRegex.test(cleanedEin);
        } else if (type === 'gst' && country === 'IN') {
          // India GST format: 15 alphanumeric
          const gstRegex = /^\d{2}[A-Z]{5}\d{4}[A-Z]{1}[A-Z\d]{1}[Z]{1}[A-Z\d]{1}$/;
          isValid = gstRegex.test(cleanedTaxId);
        } else if (type === 'abn' && country === 'AU') {
          // Australian ABN: 11 digits
          const abnRegex = /^\d{11}$/;
          isValid = abnRegex.test(cleanedTaxId.replace(/\s/g, ''));
        } else if (type === 'gst' && country === 'AU') {
          // Australian GST is same as ABN
          const abnRegex = /^\d{11}$/;
          isValid = abnRegex.test(cleanedTaxId.replace(/\s/g, ''));
        } else if (type === 'gst' && country === 'NZ') {
          // New Zealand GST: 8-9 digits
          const nzGstRegex = /^\d{8,9}$/;
          isValid = nzGstRegex.test(cleanedTaxId.replace(/-/g, ''));
        } else if (type === 'gst' && country === 'CA') {
          // Canadian GST/HST: 9 digits + RT + 4 digits
          const caGstRegex = /^\d{9}RT\d{4}$/;
          isValid = caGstRegex.test(cleanedTaxId);
        }

        // Store validation result
        await supabase.from('tax_id_validations').insert({
          user_id: user.id,
          tax_id: taxId,
          country,
          type,
          is_valid: isValid,
          company_name: companyName,
          address,
          validation_source: validationSource,
          validated_at: new Date().toISOString()
        }).catch(() => {
          // Table might not exist, gracefully handle
        });

        return NextResponse.json({
          success: true,
          isValid,
          taxId,
          country,
          type,
          companyName,
          address,
          validationSource,
          validatedAt: new Date().toISOString()
        });
      }

      case 'add-exemption': {
        const { customerId, exemptionType, certificateNumber, validFrom, validUntil, documentUrl } = params;

        const { data: exemption, error } = await supabase
          .from('tax_exemptions')
          .insert({
            customer_id: customerId,
            exemption_type: exemptionType, // 'resale', 'nonprofit', 'government', 'b2b_export'
            certificate_number: certificateNumber,
            valid_from: validFrom,
            expires_at: validUntil,
            document_url: documentUrl,
            status: 'pending', // Will be 'verified' after review
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        // Log audit
        await supabase.from('audit_logs').insert({
          user_id: user.id,
          action: 'tax_exemption_added',
          resource_type: 'tax_exemption',
          resource_id: exemption.id,
          details: { exemptionType, customerId }
        });

        return NextResponse.json({
          success: true,
          exemption
        });
      }

      case 'verify-exemption': {
        const { exemptionId, approved, notes } = params;

        const { data: exemption, error } = await supabase
          .from('tax_exemptions')
          .update({
            status: approved ? 'verified' : 'rejected',
            verified_at: new Date().toISOString(),
            verified_by: user.id,
            verification_notes: notes
          })
          .eq('id', exemptionId)
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          exemption
        });
      }

      case 'get-rates': {
        const { country, state, productType } = params;

        // Get applicable rates for a location
        const rates = [];

        if (country === 'US' && state) {
          const stateRate = US_STATE_TAX_RATES[state];
          if (stateRate > 0) {
            rates.push({
              jurisdiction: state,
              country: 'US',
              rate: stateRate,
              type: 'sales_tax',
              name: `${state} Sales Tax`
            });
          }

          // Note: Local taxes would require a tax service like Avalara or TaxJar
          rates.push({
            jurisdiction: 'local',
            country: 'US',
            rate: 0,
            type: 'local_tax',
            name: 'Local Tax (varies)',
            note: 'Use tax service for accurate local rates'
          });
        } else if (country === 'CA' && state) {
          const provinceTax = CA_PROVINCE_TAX_RATES[state];
          if (provinceTax) {
            if (provinceTax.hst > 0) {
              rates.push({ jurisdiction: state, country: 'CA', rate: provinceTax.hst, type: 'hst', name: 'HST' });
            } else {
              if (provinceTax.gst > 0) {
                rates.push({ jurisdiction: 'Federal', country: 'CA', rate: provinceTax.gst, type: 'gst', name: 'GST' });
              }
              if (provinceTax.pst > 0) {
                rates.push({ jurisdiction: state, country: 'CA', rate: provinceTax.pst, type: 'pst', name: 'PST' });
              }
            }
          }
        } else if (STANDARD_TAX_RATES[country]) {
          const countryTax = STANDARD_TAX_RATES[country];
          rates.push({
            jurisdiction: country,
            country,
            rate: countryTax.rate,
            type: countryTax.type,
            name: countryTax.name
          });
        }

        // Check for product-specific rates
        if (productType === 'digital_services') {
          // Some jurisdictions have different rates for digital services
          rates.forEach(rate => {
            if (rate.type === 'vat' && ['DE', 'FR', 'IT', 'ES'].includes(rate.country)) {
              rate.note = 'Digital services subject to standard VAT rate';
            }
          });
        }

        return NextResponse.json({
          success: true,
          country,
          state,
          productType,
          rates,
          totalRate: rates.reduce((sum, r) => sum + r.rate, 0)
        });
      }

      case 'create-custom-rate': {
        const { organizationId, name, jurisdiction, country, state, rate, type, inclusive, productCategories } = params;

        const { data: taxRate, error } = await supabase
          .from('custom_tax_rates')
          .insert({
            organization_id: organizationId,
            name,
            jurisdiction,
            country,
            state,
            rate,
            type,
            inclusive: inclusive || false,
            product_categories: productCategories,
            is_active: true,
            created_by: user.id
          })
          .select()
          .single();

        if (error) throw error;

        return NextResponse.json({
          success: true,
          taxRate
        });
      }

      case 'generate-report': {
        const { organizationId, startDate, endDate, groupBy } = params;

        const { data: invoices } = await supabase
          .from('invoices')
          .select('*')
          .eq('organization_id', organizationId)
          .eq('status', 'paid')
          .gte('paid_at', startDate)
          .lte('paid_at', endDate);

        // Aggregate tax data
        const taxByJurisdiction: Record<string, { taxableAmount: number; taxAmount: number; invoiceCount: number }> = {};

        invoices?.forEach(inv => {
          const jurisdiction = inv.tax_jurisdiction || inv.customer_country || 'Unknown';
          if (!taxByJurisdiction[jurisdiction]) {
            taxByJurisdiction[jurisdiction] = { taxableAmount: 0, taxAmount: 0, invoiceCount: 0 };
          }
          taxByJurisdiction[jurisdiction].taxableAmount += inv.subtotal || 0;
          taxByJurisdiction[jurisdiction].taxAmount += inv.tax_amount || 0;
          taxByJurisdiction[jurisdiction].invoiceCount++;
        });

        const report = {
          period: { startDate, endDate },
          summary: {
            totalTaxableAmount: invoices?.reduce((sum, i) => sum + (i.subtotal || 0), 0) || 0,
            totalTaxCollected: invoices?.reduce((sum, i) => sum + (i.tax_amount || 0), 0) || 0,
            totalInvoices: invoices?.length || 0
          },
          byJurisdiction: Object.entries(taxByJurisdiction).map(([jurisdiction, data]) => ({
            jurisdiction,
            ...data,
            effectiveRate: data.taxableAmount > 0 ? Math.round((data.taxAmount / data.taxableAmount) * 10000) / 100 : 0
          })),
          generatedAt: new Date().toISOString()
        };

        return NextResponse.json({
          success: true,
          report
        });
      }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    logger.error('Tax action error', { error });
    return NextResponse.json(
      { error: 'Failed to perform tax action' },
      { status: 500 }
    );
  }
}
