/**
 * High-reliability printing utility for TAMANNA MOTORS Enterprise POS & Reports.
 * Handles thermal receipt printers (80mm/58mm) and standard A4 laser/inkjet printers.
 * Supports iframe printing with complete typography, flexbox styles, and direct fallback.
 */

export function printHtmlContent(htmlContent: string, title = 'TAMANNA MOTORS Print'): void {
  try {
    // Clean up any prior print frame
    const existingFrame = document.getElementById('tm-print-iframe');
    if (existingFrame) {
      existingFrame.remove();
    }

    const iframe = document.createElement('iframe');
    iframe.id = 'tm-print-iframe';
    // Must NOT be visibility:hidden or 0x0 size, otherwise modern browsers skip rendering
    iframe.style.position = 'fixed';
    iframe.style.left = '0';
    iframe.style.top = '0';
    iframe.style.width = '100vw';
    iframe.style.height = '100vh';
    iframe.style.border = '0';
    iframe.style.opacity = '0';
    iframe.style.pointerEvents = 'none';
    iframe.style.zIndex = '-99999';

    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      fallbackDirectPrint(htmlContent, title);
      return;
    }

    doc.open();
    doc.write(`
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <link rel="preconnect" href="https://fonts.googleapis.com">
          <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
          <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
          <style>
            @page {
              size: auto;
              margin: 4mm;
            }
            * {
              box-sizing: border-box;
              margin: 0;
              padding: 0;
            }
            body {
              font-family: 'JetBrains Mono', 'Hind Siliguri', -apple-system, BlinkMacSystemFont, monospace, sans-serif;
              background: #ffffff !important;
              color: #000000 !important;
              padding: 6px;
              font-size: 11px;
              line-height: 1.35;
              -webkit-print-color-adjust: exact !important;
              print-color-adjust: exact !important;
            }
            /* Flex layout helpers */
            .flex { display: flex !important; }
            .flex-col { flex-direction: column !important; }
            .items-center { align-items: center !important; }
            .items-start { align-items: flex-start !important; }
            .justify-between { justify-content: space-between !important; }
            .justify-center { justify-content: center !important; }
            .justify-end { justify-content: flex-end !important; }
            .text-center { text-align: center !important; }
            .text-right { text-align: right !important; }
            .text-left { text-align: left !important; }
            
            /* Sizing & spacing */
            .w-full { width: 100% !important; }
            .w-1\\/2 { width: 50% !important; }
            .w-1\\/4 { width: 25% !important; }
            .w-3\\/4 { width: 75% !important; }
            .max-w-\\[130px\\] { max-width: 130px !important; }
            .max-h-12 { max-height: 48px !important; }
            .h-12 { height: 48px !important; }
            .h-20 { height: 80px !important; }
            .w-20 { width: 80px !important; }
            .h-24 { height: 96px !important; }
            .w-24 { width: 96px !important; }
            .mx-auto { margin-left: auto !important; margin-right: auto !important; }
            img { max-width: 100% !important; display: block !important; }
            .my-4 { margin-top: 12px !important; margin-bottom: 12px !important; }
            .mb-1 { margin-bottom: 4px !important; }
            .mb-1\\.5 { margin-bottom: 6px !important; }
            .mb-2 { margin-bottom: 8px !important; }
            .mb-3 { margin-bottom: 12px !important; }
            .mt-1 { margin-top: 4px !important; }
            .mt-2 { margin-top: 8px !important; }
            .mt-3 { margin-top: 12px !important; }
            .p-4 { padding: 12px !important; }
            .pb-1 { padding-bottom: 4px !important; }
            .pb-2 { padding-bottom: 8px !important; }
            .pb-2\\.5 { padding-bottom: 10px !important; }
            .pb-3 { padding-bottom: 12px !important; }
            .pt-1 { padding-top: 4px !important; }
            .pt-2 { padding-top: 8px !important; }
            .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
            .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
            .pr-1 { padding-right: 4px !important; }

            /* Font utilities */
            .font-bold { font-weight: 700 !important; }
            .font-semibold { font-weight: 600 !important; }
            .font-medium { font-weight: 500 !important; }
            .font-extrabold { font-weight: 800 !important; }
            .uppercase { text-transform: uppercase !important; }
            .tabular-nums { font-variant-numeric: tabular-nums !important; }
            .text-xs { font-size: 11px !important; }
            .text-sm { font-size: 13px !important; }
            .text-\\[10px\\] { font-size: 10px !important; }
            .text-\\[11px\\] { font-size: 11px !important; }
            .text-\\[12px\\] { font-size: 12px !important; }
            .leading-tight { line-height: 1.25 !important; }
            .truncate { overflow: hidden !important; text-overflow: ellipsis !important; white-space: nowrap !important; }
            .whitespace-nowrap { white-space: nowrap !important; }

            /* Borders */
            .border-b { border-bottom: 1px dashed #333333 !important; }
            .border-t { border-top: 1px dashed #333333 !important; }
            .border-dashed { border-style: dashed !important; }
            .border-slate-300 { border-color: #555555 !important; }
            .border-slate-700 { border-color: #555555 !important; }
            
            /* A4 Corporate Invoice Specific Styles */
            .a4-invoice-container {
              width: 100% !important;
              max-width: 210mm !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              color: #0f172a !important;
              padding: 10px !important;
              font-family: 'Plus Jakarta Sans', 'Hind Siliguri', sans-serif !important;
            }
            .a4-invoice-container table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 12px 0 !important;
            }
            .a4-invoice-container th {
              background-color: #047857 !important;
              color: #ffffff !important;
              font-weight: 700 !important;
              font-size: 11px !important;
              padding: 8px 10px !important;
              border: 1px solid #065f46 !important;
              text-align: left !important;
            }
            .a4-invoice-container td {
              border: 1px solid #e2e8f0 !important;
              padding: 7px 10px !important;
              font-size: 11px !important;
            }
            .a4-invoice-container tbody tr:nth-child(even) {
              background-color: #f8fafc !important;
            }
            .grid-2 {
              display: grid !important;
              grid-template-columns: 1fr 1fr !important;
              gap: 16px !important;
            }
            .signature-box {
              border-top: 1px solid #94a3b8 !important;
              width: 160px !important;
              text-align: center !important;
              padding-top: 6px !important;
              font-size: 10px !important;
              color: #475569 !important;
            }

            /* Thermal Receipt Container */
            #printable-receipt, .printable-receipt {
              width: 100% !important;
              max-width: 80mm !important;
              margin: 0 auto !important;
              background: #ffffff !important;
              color: #000000 !important;
              border: none !important;
              padding: 0 !important;
            }

            /* Tables for invoices & reports */
            table {
              width: 100% !important;
              border-collapse: collapse !important;
              margin: 8px 0 !important;
              page-break-inside: auto;
            }
            tr {
              page-break-inside: avoid;
              page-break-after: auto;
            }
            th, td {
              padding: 6px 8px !important;
              border: 1px solid #ddd !important;
              font-size: 11px !important;
            }
            th {
              background-color: #f1f5f9 !important;
              color: #0f172a !important;
              font-weight: 700 !important;
            }
            tbody tr:nth-child(even) {
              background-color: #f8fafc !important;
            }
            
            img {
              max-width: 100% !important;
              height: auto !important;
              display: block;
            }

            /* Hide buttons or interactive elements in print */
            button, .no-print, [title="Row Options"] {
              display: none !important;
            }
          </style>
        </head>
        <body>
          <div class="print-wrapper">
            ${htmlContent}
          </div>
        </body>
      </html>
    `);
    doc.close();

    // Allow images and fonts to finish layout
    setTimeout(() => {
      try {
        iframe.contentWindow?.focus();
        iframe.contentWindow?.print();
      } catch (err) {
        console.warn("Iframe print threw error, falling back to direct print:", err);
        fallbackDirectPrint(htmlContent, title);
      }
    }, 350);
  } catch (e) {
    console.error("Print utility error:", e);
    fallbackDirectPrint(htmlContent, title);
  }
}

export function downloadPrintDocument(htmlContent: string, filename = 'TAMANNA_MOTORS_Print', forceFormat?: 'a4' | 'thermal'): void {
  try {
    const isA4 = forceFormat === 'a4' || (forceFormat !== 'thermal' && (htmlContent.includes('printable-a4-invoice') || htmlContent.includes('a4-invoice-container') || htmlContent.includes('TABLE') || htmlContent.includes('table')));

    const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${filename}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
    <style>
      @page {
        size: ${isA4 ? 'A4 portrait' : '80mm auto'};
        margin: ${isA4 ? '8mm' : '3mm'};
      }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: ${isA4 ? "'Plus Jakarta Sans', 'Hind Siliguri', sans-serif" : "'JetBrains Mono', 'Hind Siliguri', monospace, sans-serif"};
        background: #ffffff;
        color: #0f172a;
        padding: ${isA4 ? '12px' : '6px'};
        font-size: ${isA4 ? '12px' : '11px'};
        line-height: 1.35;
        -webkit-print-color-adjust: exact !important;
        print-color-adjust: exact !important;
      }
      .flex { display: flex !important; }
      .flex-col { flex-direction: column !important; }
      .items-center { align-items: center !important; }
      .items-start { align-items: flex-start !important; }
      .items-end { align-items: flex-end !important; }
      .justify-between { justify-content: space-between !important; }
      .justify-center { justify-content: center !important; }
      .justify-end { justify-content: flex-end !important; }
      .text-center { text-align: center !important; }
      .text-right { text-align: right !important; }
      .text-left { text-align: left !important; }
      .font-bold { font-weight: 700 !important; }
      .font-semibold { font-weight: 600 !important; }
      .font-extrabold { font-weight: 800 !important; }
      .font-black { font-weight: 900 !important; }
      .uppercase { text-transform: uppercase !important; }
      .tabular-nums { font-variant-numeric: tabular-nums !important; }
      .font-mono { font-family: 'JetBrains Mono', monospace !important; }
      .w-full { width: 100% !important; }
      .w-1\\/2 { width: 50% !important; }
      .w-1\\/4 { width: 25% !important; }
      .w-36 { width: 144px !important; }
      .w-20 { width: 80px !important; }
      .w-24 { width: 96px !important; }
      .h-16 { height: 64px !important; }
      .w-16 { width: 64px !important; }
      .h-20 { height: 80px !important; }
      .h-24 { height: 96px !important; }
      .max-w-\\[170px\\] { max-width: 170px !important; }
      .max-h-16 { max-height: 64px !important; }
      .min-w-\\[210px\\] { min-width: 210px !important; }
      .mx-auto { margin-left: auto !important; margin-right: auto !important; }
      
      .grid { display: grid !important; }
      .grid-cols-1 { grid-template-columns: repeat(1, minmax(0, 1fr)) !important; }
      .grid-cols-2 { grid-template-columns: repeat(2, minmax(0, 1fr)) !important; }
      .gap-2 { gap: 8px !important; }
      .gap-3 { gap: 12px !important; }
      .gap-4 { gap: 16px !important; }
      
      .p-1 { padding: 4px !important; }
      .p-2 { padding: 8px !important; }
      .p-2\\.5 { padding: 10px !important; }
      .p-3 { padding: 12px !important; }
      .p-3\\.5 { padding: 14px !important; }
      .p-4 { padding: 16px !important; }
      .p-6 { padding: 24px !important; }
      .p-8 { padding: 32px !important; }
      
      .pt-1 { padding-top: 4px !important; }
      .pt-2 { padding-top: 8px !important; }
      .pt-3 { padding-top: 12px !important; }
      .pt-4 { padding-top: 16px !important; }
      .pt-6 { padding-top: 24px !important; }
      .pt-8 { padding-top: 32px !important; }
      .pb-1 { padding-bottom: 4px !important; }
      .pb-2 { padding-bottom: 8px !important; }
      .pb-3 { padding-bottom: 12px !important; }
      .pb-4 { padding-bottom: 16px !important; }
      .px-3 { padding-left: 12px !important; padding-right: 12px !important; }
      .px-4 { padding-left: 16px !important; padding-right: 16px !important; }
      .py-1 { padding-top: 4px !important; padding-bottom: 4px !important; }
      .py-2 { padding-top: 8px !important; padding-bottom: 8px !important; }
      .py-2\\.5 { padding-top: 10px !important; padding-bottom: 10px !important; }
      
      .mb-0\\.5 { margin-bottom: 2px !important; }
      .mb-1 { margin-bottom: 4px !important; }
      .mb-1\\.5 { margin-bottom: 6px !important; }
      .mb-2 { margin-bottom: 8px !important; }
      .mb-3 { margin-bottom: 12px !important; }
      .mt-0\\.5 { margin-top: 2px !important; }
      .mt-1 { margin-top: 4px !important; }
      .mt-2 { margin-top: 8px !important; }
      .mt-4 { margin-top: 16px !important; }
      
      .rounded-xl { border-radius: 12px !important; }
      .rounded-2xl { border-radius: 16px !important; }
      .rounded-lg { border-radius: 8px !important; }
      .rounded-md { border-radius: 6px !important; }
      
      .border { border: 1px solid #e2e8f0 !important; }
      .border-b { border-bottom: 1px solid #e2e8f0 !important; }
      .border-b-2 { border-bottom: 2px solid #0f172a !important; }
      .border-t { border-top: 1px solid #e2e8f0 !important; }
      .border-r { border-right: 1px solid #e2e8f0 !important; }
      .border-dashed { border-style: dashed !important; }
      .border-slate-200 { border-color: #e2e8f0 !important; }
      .border-slate-300 { border-color: #cbd5e1 !important; }
      .border-slate-400 { border-color: #94a3b8 !important; }
      
      .bg-white { background-color: #ffffff !important; }
      .bg-slate-50 { background-color: #f8fafc !important; }
      .bg-slate-100 { background-color: #f1f5f9 !important; }
      .bg-emerald-800 { background-color: #065f46 !important; }
      .bg-emerald-700 { background-color: #047857 !important; }
      .bg-emerald-50 { background-color: #ecfdf5 !important; }
      .text-white { color: #ffffff !important; }
      .text-emerald-800 { color: #065f46 !important; }
      .text-emerald-700 { color: #047857 !important; }
      .text-emerald-600 { color: #059669 !important; }
      .text-slate-950 { color: #020617 !important; }
      .text-slate-900 { color: #0f172a !important; }
      .text-slate-800 { color: #1e293b !important; }
      .text-slate-700 { color: #334155 !important; }
      .text-slate-600 { color: #475569 !important; }
      .text-slate-500 { color: #64748b !important; }
      .text-slate-400 { color: #94a3b8 !important; }
      
      .text-xs { font-size: 11px !important; }
      .text-sm { font-size: 13px !important; }
      .text-base { font-size: 14px !important; }
      .text-2xl { font-size: 22px !important; }
      .text-\\[10px\\] { font-size: 10px !important; }
      .text-\\[11px\\] { font-size: 11px !important; }
      .text-\\[9px\\] { font-size: 9px !important; }
      
      /* A4 Perfect Page Container */
      .document-wrapper {
        width: 100% !important;
        max-width: ${isA4 ? '210mm' : '80mm'} !important;
        margin: 0 auto !important;
        background: #ffffff !important;
      }
      
      table {
        width: 100% !important;
        border-collapse: collapse !important;
        margin: 8px 0 !important;
      }
      th {
        background-color: #065f46 !important;
        color: #ffffff !important;
        font-weight: 700 !important;
        padding: 8px 10px !important;
        border: 1px solid #047857 !important;
      }
      td {
        padding: 6px 10px !important;
        border: 1px solid #e2e8f0 !important;
      }
      tbody tr:nth-child(even) {
        background-color: #f8fafc !important;
      }
      
      img { max-width: 100% !important; height: auto !important; display: block !important; }
      button, .no-print { display: none !important; }
      @media print {
        .print-banner { display: none !important; }
        body { padding: 0 !important; }
      }
    </style>
    <script>
      window.onload = function() {
        setTimeout(function() {
          try {
            window.print();
          } catch(e) {
            console.error(e);
          }
        }, 300);
      };
    </script>
  </head>
  <body>
    <div class="print-banner" style="background: #059669; color: #ffffff; padding: 10px 16px; border-radius: 8px; margin-bottom: 14px; font-family: sans-serif; display: flex; justify-content: space-between; align-items: center; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
      <div>
        <div style="font-weight: bold; font-size: 13px;">TAMANNA MOTORS · তামান্না মোটরস</div>
        <div style="font-size: 11px; opacity: 0.9;">A4 সাইজ চালান ও ক্যাশ মেমো প্রস্তুত। প্রিন্ট না হলে পাশের বাটনে চাপুন।</div>
      </div>
      <button onclick="window.print()" style="background: #ffffff; color: #059669; border: none; font-weight: bold; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 12px;">
        🖨️ এখনই প্রিন্ট করুন
      </button>
    </div>
    <div class="document-wrapper">
      ${htmlContent}
    </div>
  </body>
</html>`;

    const blob = new Blob([fullHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${filename}.html`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  } catch (err) {
    console.error("Download print document error:", err);
  }
}

export function fallbackDirectPrint(htmlContent: string, _title: string): void {
  try {
    let container = document.getElementById('tm-direct-print-overlay');
    if (!container) {
      container = document.createElement('div');
      container.id = 'tm-direct-print-overlay';
      document.body.appendChild(container);
    }
    container.innerHTML = htmlContent;
    document.body.classList.add('printing-active');
    
    window.print();
    
    setTimeout(() => {
      document.body.classList.remove('printing-active');
      container?.remove();
    }, 1200);
  } catch (err) {
    console.warn("Direct print failed:", err);
    window.print();
  }
}
