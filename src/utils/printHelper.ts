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

export function downloadPrintDocument(htmlContent: string, filename = 'TAMANNA_MOTORS_Print'): void {
  try {
    const fullHtml = `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8">
    <title>${filename}</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Hind+Siliguri:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500;600;700&family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap" rel="stylesheet">
    <style>
      @page { size: auto; margin: 4mm; }
      * { box-sizing: border-box; margin: 0; padding: 0; }
      body {
        font-family: 'JetBrains Mono', 'Hind Siliguri', -apple-system, monospace, sans-serif;
        background: #ffffff;
        color: #000000;
        padding: 12px;
        font-size: 11px;
        line-height: 1.35;
      }
      .flex { display: flex; }
      .flex-col { flex-direction: column; }
      .items-center { align-items: center; }
      .items-start { align-items: flex-start; }
      .justify-between { justify-content: space-between; }
      .justify-center { justify-content: center; }
      .text-center { text-align: center; }
      .text-right { text-align: right; }
      .text-left { text-align: left; }
      .font-bold { font-weight: 700; }
      .font-semibold { font-weight: 600; }
      .font-extrabold { font-weight: 800; }
      .w-full { width: 100%; }
      .w-1\\/2 { width: 50%; }
      .w-1\\/4 { width: 25%; }
      .max-w-\\[130px\\] { max-width: 130px; }
      .max-h-12 { max-height: 48px; }
      .h-12 { height: 48px; }
      .p-4 { padding: 12px; }
      .pb-1 { padding-bottom: 4px; }
      .pb-2 { padding-bottom: 8px; }
      .pb-3 { padding-bottom: 12px; }
      .pt-1 { padding-top: 4px; }
      .pt-2 { padding-top: 8px; }
      .py-2\\.5 { padding-top: 10px; padding-bottom: 10px; }
      .border-b { border-bottom: 1px dashed #444; }
      .border-t { border-top: 1px dashed #444; }
      .border-dashed { border-style: dashed; }
      .border-slate-300 { border-color: #555; }
      .border-slate-700 { border-color: #555; }
      .receipt-container { max-width: 80mm; margin: 0 auto; background: #fff; }
      table { width: 100%; border-collapse: collapse; margin: 8px 0; }
      th, td { border: 1px solid #ddd; padding: 6px 8px; font-size: 11px; }
      th { background-color: #f1f5f9; color: #0f172a; font-weight: 700; }
      tbody tr:nth-child(even) { background-color: #f8fafc; }
      img { max-width: 100%; height: auto; display: block; margin: 0 auto; }
      button, .no-print { display: none !important; }
      @media print {
        .print-banner { display: none !important; }
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
        <div style="font-size: 11px; opacity: 0.9;">স্বয়ংক্রিয় প্রিন্ট ডায়ালগ চালু হচ্ছে... না হলে পাশের বাটনে চাপুন।</div>
      </div>
      <button onclick="window.print()" style="background: #ffffff; color: #059669; border: none; font-weight: bold; padding: 6px 14px; border-radius: 6px; cursor: pointer; font-size: 12px;">
        🖨️ এখনই প্রিন্ট করুন
      </button>
    </div>
    <div class="receipt-container">
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
