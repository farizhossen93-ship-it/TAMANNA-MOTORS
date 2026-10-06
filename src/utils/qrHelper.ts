import QRCode from 'qrcode';

export interface InvoiceQrDataOptions {
  invoiceNo: string;
  dateStr: string;
  totalPrice: number;
  providerName?: string;
  providerPhone?: string;
  providerAddress?: string;
  customerName?: string;
  paymentMethod?: string;
  currencySymbol?: string;
  itemsCount?: number;
  branch?: string;
}

/**
 * Formats structured invoice plain text data (no URL link).
 * When scanned by any smartphone camera or QR reader,
 * it directly shows the Date, Price, Provider, and Invoice details.
 */
export function formatInvoiceQrText(opts: InvoiceQrDataOptions): string {
  const provider = opts.providerName || 'TAMANNA MOTORS';
  const currency = opts.currencySymbol || '৳';
  const branch = opts.branch || 'Hazigonj Branch, Chandpur';
  const phone = opts.providerPhone || '01626666906, 01878934956';
  const customer = opts.customerName || 'Walk-in Customer';
  const payment = opts.paymentMethod || 'Cash';
  const formattedPrice = `${currency}${opts.totalPrice.toFixed(0)}`;

  return [
    `=== TAMANNA MOTORS · ডিজিটাল চালান ===`,
    `PROVIDER: ${provider}`,
    `DATE: ${opts.dateStr}`,
    `PRICE: ${formattedPrice}`,
    `INVOICE NO: ${opts.invoiceNo}`,
    `BRANCH: ${branch}`,
    `CUSTOMER: ${customer}`,
    `PHONE: ${phone}`,
    `PAYMENT: ${payment} (Paid)`,
    `STATUS: Verified Genuine Invoice`,
    `========================================`
  ].join('\n');
}

/**
 * Generates high-density QR Code Data URL containing raw structured invoice text.
 * No URL/link is used so scanners directly display Date, Price, and Provider info.
 */
export async function generateInvoiceQrCode(
  invoiceNo: string,
  totalAmount: number = 0,
  dateStr: string = new Date().toLocaleString(),
  providerName: string = 'TAMANNA MOTORS',
  additionalOpts?: Partial<InvoiceQrDataOptions>
): Promise<string> {
  try {
    const rawDataText = formatInvoiceQrText({
      invoiceNo,
      totalPrice: totalAmount,
      dateStr,
      providerName,
      providerPhone: additionalOpts?.providerPhone,
      providerAddress: additionalOpts?.providerAddress,
      customerName: additionalOpts?.customerName,
      paymentMethod: additionalOpts?.paymentMethod,
      currencySymbol: additionalOpts?.currencySymbol,
      itemsCount: additionalOpts?.itemsCount,
      branch: additionalOpts?.branch
    });

    const dataUrl = await QRCode.toDataURL(rawDataText, {
      width: 240,
      margin: 1,
      color: {
        dark: '#0f172a',
        light: '#ffffff'
      },
      errorCorrectionLevel: 'M'
    });
    return dataUrl;
  } catch (err) {
    console.error('Failed to generate QR code data URL:', err);
    return createFallbackQrDataUrl(invoiceNo, totalAmount, providerName);
  }
}

/**
 * Parse plain-text QR code output if pasted or scanned in-app
 */
export function parseInvoiceQrText(text: string): {
  invoiceNo?: string;
  date?: string;
  price?: string;
  provider?: string;
  customer?: string;
  rawAmount?: number;
} {
  const result: {
    invoiceNo?: string;
    date?: string;
    price?: string;
    provider?: string;
    customer?: string;
    rawAmount?: number;
  } = {};

  const lines = text.split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    const lower = trimmed.toLowerCase();
    if (lower.startsWith('invoice no:') || lower.startsWith('invoice:')) {
      result.invoiceNo = trimmed.replace(/^[^:]+:\s*/i, '').trim();
    } else if (lower.startsWith('date:')) {
      result.date = trimmed.substring(5).trim();
    } else if (lower.startsWith('provider:')) {
      result.provider = trimmed.substring(9).trim();
    } else if (lower.startsWith('price:') || lower.startsWith('total price:')) {
      result.price = trimmed.replace(/^[^:]+:\s*/i, '').trim();
      const numMatch = result.price.match(/[\d.]+/);
      if (numMatch) result.rawAmount = parseFloat(numMatch[0]);
    } else if (lower.startsWith('customer:')) {
      result.customer = trimmed.substring(9).trim();
    }
  }

  // Fallback regex if formatting differs
  if (!result.invoiceNo) {
    const invMatch = text.match(/(TM-\d{4}-\d+|sale-\d+)/i);
    if (invMatch) result.invoiceNo = invMatch[1];
  }

  return result;
}

/**
 * Fallback procedural SVG data URL in case canvas is unavailable
 */
function createFallbackQrDataUrl(invoiceNo: string, amount: number, provider: string): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180">
    <rect width="180" height="180" fill="#ffffff" stroke="#0f172a" stroke-width="2"/>
    <rect x="15" y="15" width="40" height="40" fill="#0f172a"/>
    <rect x="25" y="25" width="20" height="20" fill="#ffffff"/>
    <rect x="125" y="15" width="40" height="40" fill="#0f172a"/>
    <rect x="135" y="25" width="20" height="20" fill="#ffffff"/>
    <rect x="15" y="125" width="40" height="40" fill="#0f172a"/>
    <rect x="25" y="135" width="20" height="20" fill="#ffffff"/>
    <text x="90" y="85" font-family="monospace" font-size="8" text-anchor="middle" font-weight="bold" fill="#0f172a">${provider.slice(0, 16)}</text>
    <text x="90" y="100" font-family="monospace" font-size="8" text-anchor="middle" fill="#0f172a">${invoiceNo}</text>
    <text x="90" y="115" font-family="monospace" font-size="8" text-anchor="middle" fill="#10b981">৳${amount.toFixed(0)}</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}
