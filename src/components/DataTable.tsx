import React, { useState, useMemo } from 'react';
import {
  Search,
  Download,
  FileSpreadsheet,
  Printer,
  FileText,
  ChevronDown,
  ChevronUp,
  ChevronsUpDown,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
  Plus,
  Lock,
  Shield
} from 'lucide-react';
import { Language, TRANSLATIONS } from '../i18n/translations';
import { printHtmlContent, downloadPrintDocument, fallbackDirectPrint } from '../utils/printHelper';

export interface Column<T> {
  header: string;
  accessorKey?: keyof T;
  cell?: (row: T) => React.ReactNode;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
}

interface DataTableProps<T> {
  title: string;
  subtitle?: string;
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  onAddNew?: () => void;
  addNewLabel?: string;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  searchFilterKeys?: (keyof T)[];
  tableId?: string;
  lang?: Language;
  isSuperAdmin?: boolean;
}

export function DataTable<T extends Record<string, any>>({
  title,
  subtitle,
  data,
  columns,
  searchPlaceholder,
  onAddNew,
  addNewLabel,
  onEdit,
  onDelete,
  onView,
  searchFilterKeys,
  tableId = "printable-table",
  lang = 'en',
  isSuperAdmin = true
}: DataTableProps<T>) {
  const t = TRANSLATIONS[lang];
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSize, setPageSize] = useState<number>(10);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [sortKey, setSortKey] = useState<keyof T | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [openActionRowId, setOpenActionRowId] = useState<string | number | null>(null);

  // Filter data based on search term
  const filteredData = useMemo(() => {
    if (!searchTerm.trim()) return data;
    const term = searchTerm.toLowerCase();

    return data.filter((item) => {
      const keysToSearch = searchFilterKeys || (Object.keys(item) as (keyof T)[]);
      return keysToSearch.some((key) => {
        const val = item[key];
        if (val === null || val === undefined) return false;
        return String(val).toLowerCase().includes(term);
      });
    });
  }, [data, searchTerm, searchFilterKeys]);

  // Sort data
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal === bVal) return 0;
      if (aVal === null || aVal === undefined) return 1;
      if (bVal === null || bVal === undefined) return -1;

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }
      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination calculation
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleSort = (key?: keyof T) => {
    if (!key) return;
    if (sortKey === key) {
      if (sortOrder === 'asc') {
        setSortOrder('desc');
      } else {
        setSortKey(null);
        setSortOrder('asc');
      }
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (data.length === 0) return;
    const headers = columns
      .filter(col => col.header !== 'Action' && col.header !== 'Product Image')
      .map(col => `"${col.header}"`)
      .join(',');

    const rows = sortedData.map(item => {
      return columns
        .filter(col => col.header !== 'Action' && col.header !== 'Product Image')
        .map(col => {
          let value = col.accessorKey ? item[col.accessorKey] : '';
          if (value === undefined || value === null) value = '';
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(',');
    });

    const csvContent = "data:text/csv;charset=utf-8," + [headers, ...rows].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${title.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToExcel = () => {
    exportToCSV();
  };

  const [printNotice, setPrintNotice] = useState<string | null>(null);

  const handlePrint = () => {
    const tableEl = document.getElementById(tableId);
    if (tableEl) {
      const clone = tableEl.cloneNode(true) as HTMLElement;
      // Remove interactive buttons and action columns in print clone
      clone.querySelectorAll('button, .action-column').forEach(el => el.remove());
      const html = `
        <div style="font-family: sans-serif; padding: 12px; color: #111;">
          <div style="border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #111;">TAMANNA MOTORS · তামান্না মোটরস</h2>
              <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 600; color: #047857;">${title}</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #666;">
              <div style="font-weight: bold;">Dhaka Central Showroom · Mirpur-10</div>
              <div>Printed: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          ${clone.outerHTML}
        </div>
      `;
      fallbackDirectPrint(html, `TAMANNA MOTORS - ${title}`);
      printHtmlContent(html, `TAMANNA MOTORS - ${title}`);
      setPrintNotice(lang === 'bn' ? 'প্রিন্ট নির্দেশ সম্পন্ন! ব্রাউজারে পপআপ না আসলে "PDF" বাটনে চাপ দিন (অটো-প্রিন্ট ফাইল ডাউনলোড হবে)।' : 'Print sent. If popup is blocked by browser, click "PDF" to download the print document.');
      setTimeout(() => setPrintNotice(null), 5000);
    } else {
      window.print();
    }
  };

  const handleDownloadReport = () => {
    const tableEl = document.getElementById(tableId);
    if (tableEl) {
      const clone = tableEl.cloneNode(true) as HTMLElement;
      clone.querySelectorAll('button, .action-column').forEach(el => el.remove());
      const html = `
        <div style="font-family: sans-serif; padding: 12px; color: #111;">
          <div style="border-bottom: 2px solid #10b981; padding-bottom: 8px; margin-bottom: 12px; display: flex; justify-content: space-between; align-items: center;">
            <div>
              <h2 style="margin: 0; font-size: 18px; font-weight: bold; color: #111;">TAMANNA MOTORS · তামান্না মোটরস</h2>
              <p style="margin: 3px 0 0 0; font-size: 13px; font-weight: 600; color: #047857;">${title}</p>
            </div>
            <div style="text-align: right; font-size: 11px; color: #666;">
              <div style="font-weight: bold;">Dhaka Central Showroom · Mirpur-10</div>
              <div>Generated: ${new Date().toLocaleString()}</div>
            </div>
          </div>
          ${clone.outerHTML}
        </div>
      `;
      downloadPrintDocument(html, `TAMANNA_MOTORS_${title.replace(/\s+/g, '_')}`);
      setPrintNotice(lang === 'bn' ? 'প্রিন্ট ফাইল ডাউনলোড সম্পন্ন! ফাইলে ক্লিক করলেই সরাসরি প্রিন্ট হবে।' : 'Report file downloaded! Open file to print instantly.');
      setTimeout(() => setPrintNotice(null), 4000);
    }
  };

  const startIndex = (currentPage - 1) * pageSize + 1;
  const endIndex = Math.min(currentPage * pageSize, sortedData.length);

  return (
    <div className="space-y-4">
      {/* Header with Title and Optional "Add New" Button */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-xl font-extrabold tracking-tight text-slate-900 dark:text-white">{title}</h2>
            {!isSuperAdmin && (
              <span className="inline-flex items-center gap-1 rounded-md bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-800 px-2 py-0.5 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                <Shield className="h-3 w-3 text-amber-600" />
                {lang === 'bn' ? 'স্টাফ এন্ট্রি মোড (শুধুমাত্র এন্ট্রি)' : 'Staff Entry Mode (Entry Only)'}
              </span>
            )}
          </div>
          {subtitle && <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{subtitle}</p>}
        </div>

        {onAddNew && (
          <button
            onClick={onAddNew}
            className="flex items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white shadow-xs hover:bg-emerald-700 transition-colors focus-visible:outline-2 focus-visible:outline-emerald-600 self-start sm:self-auto"
          >
            <Plus className="h-4 w-4" />
            <span>{addNewLabel || t.addNew}</span>
          </button>
        )}
      </div>

      {/* Control Bar: Entries selector, Search, and Export Buttons */}
      <div className="flex flex-col gap-3 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-3.5 shadow-xs lg:flex-row lg:items-center lg:justify-between transition-colors">
        {/* Left side: Show X entries & Search */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-300">
            <span>{t.show}</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setCurrentPage(1);
              }}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 px-2 py-1.5 text-xs font-semibold text-slate-800 dark:text-slate-100 focus:outline-none"
            >
              <option value={10}>10</option>
              <option value={25}>25</option>
              <option value={50}>50</option>
              <option value={100}>100</option>
            </select>
            <span>{t.entries}</span>
          </div>

          <div className="relative min-w-56 flex-1 sm:w-64">
            <Search className="absolute left-3 top-2.5 h-3.5 w-3.5 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={searchPlaceholder || t.search}
              className="w-full rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 py-1.5 pl-9 pr-3 text-xs text-slate-900 dark:text-white placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none"
            />
          </div>
        </div>

        {/* Right side: Export Buttons */}
        <div className="flex items-center gap-1.5 flex-wrap">
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Download CSV"
          >
            <Download className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">{t.exportCsv}</span>
          </button>

          <button
            onClick={exportToExcel}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Export to Excel Spreadsheet"
          >
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="hidden sm:inline">{t.exportExcel}</span>
          </button>

          <button
            onClick={handlePrint}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title="Print Current Table"
          >
            <Printer className="h-3.5 w-3.5 text-slate-500 dark:text-slate-400" />
            <span className="hidden sm:inline">{t.print}</span>
          </button>

          <button
            onClick={handleDownloadReport}
            className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-2.5 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
            title={lang === 'bn' ? 'প্রিন্ট ফাইল / PDF ডাউনলোড' : 'Download Printable PDF / HTML Report'}
          >
            <FileText className="h-3.5 w-3.5 text-rose-500 dark:text-rose-400" />
            <span className="hidden sm:inline">{t.exportPdf}</span>
          </button>
        </div>
      </div>

      {/* Print status notification banner */}
      {printNotice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 p-2.5 text-xs text-emerald-800 dark:text-emerald-300 font-semibold animate-in fade-in">
          <span>{printNotice}</span>
        </div>
      )}

      {/* Main Table Area */}
      <div id={tableId} className="overflow-hidden rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xs transition-colors">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            {/* Table Header */}
            <thead className="border-b border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/80 text-[11px] font-bold text-slate-600 dark:text-slate-300 uppercase tracking-wider">
              <tr>
                {columns.map((column, index) => {
                  const isSortable = column.sortable !== false && Boolean(column.accessorKey);
                  const isCurrentSort = column.accessorKey === sortKey;

                  return (
                    <th
                      key={index}
                      scope="col"
                      onClick={() => isSortable && handleSort(column.accessorKey)}
                      className={`py-3.5 px-4 ${
                        column.align === 'right' ? 'text-right' : column.align === 'center' ? 'text-center' : 'text-left'
                      } ${isSortable ? 'cursor-pointer select-none hover:text-slate-900 dark:hover:text-white' : ''}`}
                    >
                      <div className={`inline-flex items-center gap-1 ${column.align === 'right' ? 'justify-end w-full' : ''}`}>
                        <span>{column.header}</span>
                        {isSortable && (
                          <span className="text-slate-400">
                            {isCurrentSort ? (
                              sortOrder === 'asc' ? (
                                <ChevronUp className="h-3 w-3 text-emerald-600" />
                              ) : (
                                <ChevronDown className="h-3 w-3 text-emerald-600" />
                              )
                            ) : (
                              <ChevronsUpDown className="h-3 w-3" />
                            )}
                          </span>
                        )}
                      </div>
                    </th>
                  );
                })}

                {(onEdit || onDelete || onView) && (
                  <th scope="col" className="py-3.5 px-4 text-center w-20">
                    {t.actions}
                  </th>
                )}
              </tr>
            </thead>

            {/* Table Body */}
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-300">
              {paginatedData.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length + (onEdit || onDelete || onView ? 1 : 0)}
                    className="py-12 text-center text-slate-600 dark:text-slate-300"
                  >
                    {lang === 'bn' ? 'কোন রেকর্ড খুঁজে পাওয়া যায়নি।' : 'No records found matching current query.'}
                  </td>
                </tr>
              ) : (
                paginatedData.map((row, rowIndex) => {
                  const rowId = row.id || rowIndex;
                  const isActionOpen = openActionRowId === rowId;

                  return (
                    <tr
                      key={rowId}
                      className="hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors"
                    >
                      {columns.map((column, colIndex) => {
                        let content: React.ReactNode = null;
                        if (column.cell) {
                          content = column.cell(row);
                        } else if (column.accessorKey) {
                          const val = row[column.accessorKey];
                          if (typeof val === 'number') {
                            content = (
                              <span className="font-mono tabular-nums font-semibold">
                                {column.header.toLowerCase().includes('price') ||
                                column.header.toLowerCase().includes('total') ||
                                column.header.toLowerCase().includes('amount') ||
                                column.header.toLowerCase().includes('due') ||
                                column.header.toLowerCase().includes('balance') ||
                                column.header.toLowerCase().includes('cost')
                                  ? `৳${val.toLocaleString('en-US', { minimumFractionDigits: 0 })}`
                                  : val.toLocaleString()}
                              </span>
                            );
                          } else {
                            content = String(val ?? '—');
                          }
                        }

                        return (
                          <td
                            key={colIndex}
                            className={`py-3 px-4 ${
                              column.align === 'right'
                                ? 'text-right'
                                : column.align === 'center'
                                ? 'text-center'
                                : 'text-left'
                            }`}
                          >
                            {content}
                          </td>
                        );
                      })}

                      {/* Row Action Buttons (Direct Quick Actions) */}
                      {(onEdit || onDelete || onView) && (
                        <td className="py-2.5 px-3 text-center whitespace-nowrap action-column">
                          <div className="flex items-center justify-center gap-1.5">
                            {/* Edit Button: enabled for Super Admin, locked for Staff */}
                            {onEdit && (
                              isSuperAdmin ? (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onEdit(row);
                                  }}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-amber-300 dark:border-amber-700/80 bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50 text-[11px] font-bold transition-colors shadow-2xs"
                                  title="Edit this record (Super Admin)"
                                >
                                  <Edit2 className="h-3 w-3" />
                                  <span>{t.edit}</span>
                                </button>
                              ) : (
                                <button
                                  type="button"
                                  disabled
                                  className="flex items-center gap-1 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-800/40 text-slate-400 dark:text-slate-500 text-[11px] font-medium cursor-not-allowed opacity-60"
                                  title={lang === 'bn' ? 'শুধুমাত্র সুপার অ্যাডমিন এডিট করতে পারবেন' : 'Super Admin Only: Staff can only enter new data'}
                                >
                                  <Lock className="h-3 w-3" />
                                  <span>{t.edit}</span>
                                </button>
                              )
                            )}

                            {/* Direct View / Print Receipt Button */}
                            {onView && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onView(row);
                                }}
                                className="flex items-center gap-1 px-2.5 py-1 rounded-lg border border-emerald-300 dark:border-emerald-700/80 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 text-[11px] font-bold transition-colors shadow-2xs"
                                title="View details / Print receipt"
                              >
                                <Eye className="h-3 w-3" />
                                <span>{t.view}</span>
                              </button>
                            )}

                            {/* Delete Button: Direct delete for Super Admin, Deletion Request for Staff */}
                            {onDelete && (
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  onDelete(row);
                                }}
                                className={`flex items-center justify-center gap-1 px-2 py-1 rounded-lg border text-[11px] font-bold transition-colors ${
                                  isSuperAdmin
                                    ? 'border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/50'
                                    : 'border-amber-300 dark:border-amber-800 bg-amber-50/70 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                                }`}
                                title={
                                  isSuperAdmin
                                    ? (lang === 'bn' ? 'সরাসরি মুছুন (সুপার অ্যাডমিন)' : 'Delete record (Super Admin)')
                                    : (lang === 'bn' ? 'মুছে ফেলার আবেদন পাঠান (সুপার অ্যাডমিন অনুমোদন প্রয়োজন)' : 'Submit Deletion / Damage Request to Super Admin')
                                }
                              >
                                <Trash2 className="h-3 w-3" />
                                {!isSuperAdmin && (
                                  <span className="text-[10px] hidden sm:inline">
                                    {lang === 'bn' ? 'আবেদন' : 'Request'}
                                  </span>
                                )}
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer: Showing entries & Pagination */}
        <div className="flex flex-col gap-3 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/50 px-4 py-3 sm:flex-row sm:items-center sm:justify-between text-xs text-slate-600 dark:text-slate-300">
          <div>
            {sortedData.length > 0 ? (
              <span>
                {t.showing} <strong className="font-bold text-slate-800 dark:text-slate-100">{startIndex}</strong> {t.to}{' '}
                <strong className="font-bold text-slate-800 dark:text-slate-100">{endIndex}</strong> {t.of}{' '}
                <strong className="font-bold text-slate-800 dark:text-slate-100">{sortedData.length}</strong> {t.entries}
              </span>
            ) : (
              <span>0 {t.entries}</span>
            )}
          </div>

          {/* Page numbers */}
          <div className="flex items-center gap-1 self-center sm:self-auto">
            <button
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              {t.previous}
            </button>

            {Array.from({ length: totalPages }).map((_, idx) => {
              const pageNum = idx + 1;
              if (
                totalPages > 6 &&
                pageNum !== 1 &&
                pageNum !== totalPages &&
                Math.abs(pageNum - currentPage) > 1
              ) {
                if (pageNum === 2 || pageNum === totalPages - 1) {
                  return <span key={pageNum} className="px-1 text-slate-400">...</span>;
                }
                return null;
              }

              return (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`h-8 w-8 rounded-lg text-xs font-bold transition-colors ${
                    currentPage === pageNum
                      ? 'bg-emerald-600 text-white shadow-xs'
                      : 'border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'
                  }`}
                >
                  {pageNum}
                </button>
              );
            })}

            <button
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 px-3 py-1.5 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 disabled:opacity-40 transition-colors"
            >
              {t.next}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
