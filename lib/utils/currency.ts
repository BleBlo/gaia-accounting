export const VAT_RATE = 0.05 // 5%
export const USD_TO_AED = 3.67

export function formatCurrency(
  amount: number,
  currency: 'AED' | 'USD' = 'AED',
  options?: Intl.NumberFormatOptions
): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
    ...options,
  }).format(amount)
}

export function formatCompactCurrency(amount: number, currency: 'AED' | 'USD' = 'AED'): string {
  return new Intl.NumberFormat('en-AE', {
    style: 'currency',
    currency,
    notation: 'compact',
    minimumFractionDigits: 0,
    maximumFractionDigits: 1,
  }).format(amount)
}

export function usdToAed(usd: number): number {
  return usd * USD_TO_AED
}

export function aedToUsd(aed: number): number {
  return aed / USD_TO_AED
}

export function calculateSaleVAT(subtotal: number) {
  const vat = subtotal * VAT_RATE
  const total = subtotal + vat
  return {
    subtotal: Math.round(subtotal * 100) / 100,
    vat: Math.round(vat * 100) / 100,
    total: Math.round(total * 100) / 100,
  }
}

export function calculateExpenseVAT(amount: number, vatIncluded: boolean) {
  if (vatIncluded) {
    const subtotal = amount / (1 + VAT_RATE)
    const vat = amount - subtotal
    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: Math.round(amount * 100) / 100,
    }
  } else {
    const vat = amount * VAT_RATE
    return {
      subtotal: Math.round(amount * 100) / 100,
      vat: Math.round(vat * 100) / 100,
      total: Math.round((amount + vat) * 100) / 100,
    }
  }
}

export function parseNumericInput(value: string): number {
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''))
  return isNaN(parsed) ? 0 : parsed
}
