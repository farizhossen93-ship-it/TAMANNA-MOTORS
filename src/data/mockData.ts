import { Product, Contact, CustomerGroup, Purchase, PurchaseReturn, Sale, SalesReturn, StockTransfer, Expense, BusinessSettings, InvoiceSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [
  {
    id: "prod-1",
    name: "Wireless Barcode Scanner Pro",
    sku: "WBS-902",
    category: "POS Hardware",
    businessLocation: "Main Branch",
    unitPurchasePrice: 42.50,
    sellingPrice: 79.99,
    currentStock: 48,
    alertQuantity: 10,
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-08-14"
  },
  {
    id: "prod-2",
    name: "Thermal Receipt Paper Roll (80mm)",
    sku: "TRP-80-50",
    category: "Supplies",
    businessLocation: "Main Branch",
    unitPurchasePrice: 1.10,
    sellingPrice: 2.50,
    currentStock: 320,
    alertQuantity: 50,
    imageUrl: "https://images.unsplash.com/photo-1586075010923-2dd4570fb338?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-08-20"
  },
  {
    id: "prod-3",
    name: "Ergonomic Mechanical Keyboard",
    sku: "EMK-RGB-01",
    category: "Peripherals",
    businessLocation: "Westside Hub",
    unitPurchasePrice: 65.00,
    sellingPrice: 119.00,
    currentStock: 18,
    alertQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-01"
  },
  {
    id: "prod-4",
    name: "Heavy Duty Cash Drawer (RJ11)",
    sku: "CDR-410",
    category: "POS Hardware",
    businessLocation: "Main Branch",
    unitPurchasePrice: 48.00,
    sellingPrice: 89.50,
    currentStock: 12,
    alertQuantity: 5,
    imageUrl: "https://images.unsplash.com/photo-1556742049-0a67e557224f?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-05"
  },
  {
    id: "prod-5",
    name: "Omnidirectional 2D Desktop Scanner",
    sku: "OMN-200",
    category: "POS Hardware",
    businessLocation: "Downtown Store",
    unitPurchasePrice: 110.00,
    sellingPrice: 185.00,
    currentStock: 7,
    alertQuantity: 8,
    imageUrl: "https://images.unsplash.com/photo-1563770660941-20978e870e26?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-12"
  },
  {
    id: "prod-6",
    name: "High-Speed USB Thermal Printer 80mm",
    sku: "TP-803",
    category: "POS Hardware",
    businessLocation: "Main Branch",
    unitPurchasePrice: 85.00,
    sellingPrice: 149.00,
    currentStock: 24,
    alertQuantity: 6,
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-15"
  },
  {
    id: "prod-7",
    name: "Industrial Precision Weighing Scale",
    sku: "IPS-30KG",
    category: "Equipment",
    businessLocation: "Westside Hub",
    unitPurchasePrice: 140.00,
    sellingPrice: 230.00,
    currentStock: 9,
    alertQuantity: 4,
    imageUrl: "https://images.unsplash.com/photo-1534972195531-a756b112697a?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-18"
  },
  {
    id: "prod-8",
    name: "Laser Barcode Label Sheets (100pk)",
    sku: "LBL-100",
    category: "Supplies",
    businessLocation: "Downtown Store",
    unitPurchasePrice: 6.20,
    sellingPrice: 14.50,
    currentStock: 85,
    alertQuantity: 20,
    imageUrl: "https://images.unsplash.com/photo-1607344645866-009c320c5ab8?auto=format&fit=crop&w=120&h=120&q=80",
    createdAt: "2026-09-22"
  }
];

export const INITIAL_SUPPLIERS: Contact[] = [
  {
    id: "sup-1",
    type: "supplier",
    name: "Marcus Vance",
    businessName: "Northstar Electronics Ltd",
    email: "procurement@northstarelec.com",
    phone: "+1 (555) 392-8190",
    businessLocation: "Main Branch",
    taxNumber: "TAX-US-993821",
    creditLimit: 25000,
    balance: 4200.00,
    address: "482 Industrial Parkway, Austin, TX"
  },
  {
    id: "sup-2",
    type: "supplier",
    name: "Elena Rostova",
    businessName: "Pacific Paper & Packaging Co",
    email: "orders@pacificpackaging.com",
    phone: "+1 (555) 748-2918",
    businessLocation: "Downtown Store",
    taxNumber: "TAX-US-102938",
    creditLimit: 15000,
    balance: 1850.00,
    address: "109 Harbour Blvd, Seattle, WA"
  },
  {
    id: "sup-3",
    type: "supplier",
    name: "David Kim",
    businessName: "Apex Hardware Global",
    email: "supply@apexglobal.tech",
    phone: "+1 (555) 482-0193",
    businessLocation: "Westside Hub",
    taxNumber: "TAX-US-849201",
    creditLimit: 40000,
    balance: 2800.00,
    address: "710 Commerce Drive, San Jose, CA"
  }
];

export const INITIAL_CUSTOMERS: Contact[] = [
  {
    id: "cust-walkin",
    type: "customer",
    name: "Walk-in Customer",
    email: "retail-walkin@store.local",
    phone: "N/A",
    customerGroup: "Retail",
    businessLocation: "Main Branch",
    balance: 0.00,
    totalPurchases: 42800.00
  },
  {
    id: "cust-1",
    type: "customer",
    name: "Sarah Jenkins",
    businessName: "Jenkins Retail Outlets",
    email: "sarah.j@jenkinsretail.com",
    phone: "+1 (555) 892-4410",
    customerGroup: "Wholesale Partner",
    businessLocation: "Main Branch",
    creditLimit: 10000,
    balance: 3400.00,
    totalPurchases: 28450.00,
    address: "940 Market Way, Denver, CO"
  },
  {
    id: "cust-2",
    type: "customer",
    name: "Robert Chang",
    businessName: "OmniTech Solutions Inc",
    email: "rchang@omnitech.org",
    phone: "+1 (555) 671-2290",
    customerGroup: "VIP Tier",
    businessLocation: "Downtown Store",
    creditLimit: 20000,
    balance: 6200.00,
    totalPurchases: 54100.00,
    address: "220 Tech Ridge Rd, Phoenix, AZ"
  },
  {
    id: "cust-3",
    type: "customer",
    name: "Amina Al-Mansoor",
    businessName: "Crescent Point Logistics",
    email: "amina@crescentlogistics.com",
    phone: "+1 (555) 913-0941",
    customerGroup: "VIP Tier",
    businessLocation: "Westside Hub",
    creditLimit: 15000,
    balance: 5930.00,
    totalPurchases: 39900.00,
    address: "512 Cargo Loop, Dallas, TX"
  }
];

export const INITIAL_CUSTOMER_GROUPS: CustomerGroup[] = [
  { id: "cg-1", name: "Standard Retail", calculationPercentage: 0, sellingPriceGroup: "Retail Standard" },
  { id: "cg-2", name: "VIP Tier", calculationPercentage: 8, sellingPriceGroup: "Preferred VIP" },
  { id: "cg-3", name: "Wholesale Partner", calculationPercentage: 15, sellingPriceGroup: "Wholesale Tier 1" }
];

export const INITIAL_PURCHASES: Purchase[] = [
  {
    id: "pur-1",
    purchaseNo: "PO-2026-881",
    supplierName: "Northstar Electronics Ltd",
    businessLocation: "Main Branch",
    purchaseStatus: "Received",
    paymentStatus: "Paid",
    purchaseDate: "2026-09-28",
    grandTotal: 4250.00,
    paymentDue: 0.00,
    itemsCount: 50
  },
  {
    id: "pur-2",
    purchaseNo: "PO-2026-882",
    supplierName: "Pacific Paper & Packaging Co",
    businessLocation: "Downtown Store",
    purchaseStatus: "Received",
    paymentStatus: "Partial",
    purchaseDate: "2026-09-30",
    grandTotal: 1850.00,
    paymentDue: 850.00,
    itemsCount: 1200
  },
  {
    id: "pur-3",
    purchaseNo: "PO-2026-883",
    supplierName: "Apex Hardware Global",
    businessLocation: "Westside Hub",
    purchaseStatus: "Pending",
    paymentStatus: "Due",
    purchaseDate: "2026-10-02",
    grandTotal: 8000.00,
    paymentDue: 8000.00,
    itemsCount: 65
  }
];

export const INITIAL_PURCHASE_RETURNS: PurchaseReturn[] = [
  {
    id: "pret-1",
    returnNo: "PR-2026-012",
    purchaseNo: "PO-2026-850",
    supplierName: "Northstar Electronics Ltd",
    businessLocation: "Main Branch",
    returnDate: "2026-09-24",
    totalAmount: 1820.00,
    paymentStatus: "Refunded"
  },
  {
    id: "pret-2",
    returnNo: "PR-2026-013",
    purchaseNo: "PO-2026-862",
    supplierName: "Apex Hardware Global",
    businessLocation: "Westside Hub",
    returnDate: "2026-10-01",
    totalAmount: 1390.00,
    paymentStatus: "Pending"
  }
];

export const INITIAL_SALES: Sale[] = [
  {
    id: "sale-1",
    invoiceNo: "INV-2026-9041",
    type: "pos",
    customerName: "Walk-in Customer",
    businessLocation: "Main Branch",
    paymentStatus: "Paid",
    paymentMethod: "Cash",
    totalAmount: 162.49,
    invoiceDue: 0.00,
    saleDate: "2026-10-04 10:20:15",
    itemsCount: 3
  },
  {
    id: "sale-2",
    invoiceNo: "INV-2026-9042",
    type: "pos",
    customerName: "Walk-in Customer",
    businessLocation: "Main Branch",
    paymentStatus: "Paid",
    paymentMethod: "Card",
    totalAmount: 238.00,
    invoiceDue: 0.00,
    saleDate: "2026-10-04 09:45:00",
    itemsCount: 2
  },
  {
    id: "sale-3",
    invoiceNo: "INV-2026-9039",
    type: "sale",
    customerName: "Robert Chang",
    businessLocation: "Downtown Store",
    paymentStatus: "Partial",
    paymentMethod: "Bank Transfer",
    totalAmount: 4890.00,
    invoiceDue: 1890.00,
    saleDate: "2026-10-03 16:10:00",
    itemsCount: 28
  },
  {
    id: "sale-4",
    invoiceNo: "INV-2026-9038",
    type: "sale",
    customerName: "Sarah Jenkins",
    businessLocation: "Main Branch",
    paymentStatus: "Due",
    paymentMethod: "Credit",
    totalAmount: 7640.00,
    invoiceDue: 7640.00,
    saleDate: "2026-10-02 14:00:00",
    itemsCount: 45
  },
  {
    id: "sale-5",
    invoiceNo: "DFT-2026-004",
    type: "draft",
    customerName: "Amina Al-Mansoor",
    businessLocation: "Westside Hub",
    paymentStatus: "Due",
    paymentMethod: "Credit",
    totalAmount: 6000.00,
    invoiceDue: 6000.00,
    saleDate: "2026-10-03 11:30:00",
    itemsCount: 30
  }
];

export const INITIAL_SALES_RETURNS: SalesReturn[] = [
  {
    id: "sret-1",
    returnNo: "SR-2026-041",
    invoiceNo: "INV-2026-8910",
    customerName: "Sarah Jenkins",
    businessLocation: "Main Branch",
    returnDate: "2026-10-01",
    totalRefund: 380.00,
    reason: "Damaged packaging during freight"
  },
  {
    id: "sret-2",
    returnNo: "SR-2026-042",
    invoiceNo: "INV-2026-8995",
    customerName: "Robert Chang",
    businessLocation: "Downtown Store",
    returnDate: "2026-10-03",
    totalRefund: 240.00,
    reason: "Incorrect SKU ordered by client"
  }
];

export const INITIAL_STOCK_TRANSFERS: StockTransfer[] = [
  {
    id: "st-1",
    transferNo: "ST-2026-108",
    fromLocation: "Main Branch",
    toLocation: "Westside Hub",
    status: "Completed",
    shippingCharges: 45.00,
    totalAmount: 2450.00,
    date: "2026-10-01",
    itemsCount: 40
  },
  {
    id: "st-2",
    transferNo: "ST-2026-109",
    fromLocation: "Westside Hub",
    toLocation: "Downtown Store",
    status: "In Transit",
    shippingCharges: 30.00,
    totalAmount: 1120.00,
    date: "2026-10-03",
    itemsCount: 22
  }
];

export const INITIAL_EXPENSES: Expense[] = [
  {
    id: "exp-1",
    expenseNo: "EXP-2026-401",
    category: "Rent",
    businessLocation: "Main Branch",
    expenseDate: "2026-10-01",
    amount: 6500.00,
    referenceNo: "LEASE-OCT-01",
    note: "Monthly store lease for prime retail facility"
  },
  {
    id: "exp-2",
    expenseNo: "EXP-2026-402",
    category: "Utilities",
    businessLocation: "Main Branch",
    expenseDate: "2026-10-02",
    amount: 980.00,
    referenceNo: "ELEC-2918",
    note: "Electricity and gigabit fiber internet connection"
  },
  {
    id: "exp-3",
    expenseNo: "EXP-2026-403",
    category: "Salaries",
    businessLocation: "Westside Hub",
    expenseDate: "2026-09-30",
    amount: 5200.00,
    referenceNo: "PAYROLL-WK39",
    note: "Store associates and inventory clerk biweekly payroll"
  },
  {
    id: "exp-4",
    expenseNo: "EXP-2026-404",
    category: "Logistics",
    businessLocation: "Downtown Store",
    expenseDate: "2026-10-03",
    amount: 2000.00,
    referenceNo: "COURIER-552",
    note: "Express pallet freight delivery between warehouse nodes"
  }
];

// 30 Days of sales trend data for the line chart
export const SALES_LAST_30_DAYS = [
  { day: "Sep 05", date: "2026-09-05", amount: 4850 },
  { day: "Sep 06", date: "2026-09-06", amount: 5120 },
  { day: "Sep 07", date: "2026-09-07", amount: 4690 },
  { day: "Sep 08", date: "2026-09-08", amount: 6200 },
  { day: "Sep 09", date: "2026-09-09", amount: 5800 },
  { day: "Sep 10", date: "2026-09-10", amount: 7450 },
  { day: "Sep 11", date: "2026-09-11", amount: 8100 },
  { day: "Sep 12", date: "2026-09-12", amount: 6400 },
  { day: "Sep 13", date: "2026-09-13", amount: 5900 },
  { day: "Sep 14", date: "2026-09-14", amount: 6720 },
  { day: "Sep 15", date: "2026-09-15", amount: 7300 },
  { day: "Sep 16", date: "2026-09-16", amount: 6150 },
  { day: "Sep 17", date: "2026-09-17", amount: 5400 },
  { day: "Sep 18", date: "2026-09-18", amount: 6890 },
  { day: "Sep 19", date: "2026-09-19", amount: 8400 },
  { day: "Sep 20", date: "2026-09-20", amount: 9150 },
  { day: "Sep 21", date: "2026-09-21", amount: 7600 },
  { day: "Sep 22", date: "2026-09-22", amount: 6300 },
  { day: "Sep 23", date: "2026-09-23", amount: 5800 },
  { day: "Sep 24", date: "2026-09-24", amount: 7200 },
  { day: "Sep 25", date: "2026-09-25", amount: 8900 },
  { day: "Sep 26", date: "2026-09-26", amount: 9600 },
  { day: "Sep 27", date: "2026-09-27", amount: 8200 },
  { day: "Sep 28", date: "2026-09-28", amount: 7100 },
  { day: "Sep 29", date: "2026-09-29", amount: 6850 },
  { day: "Sep 30", date: "2026-09-30", amount: 7900 },
  { day: "Oct 01", date: "2026-10-01", amount: 8400 },
  { day: "Oct 02", date: "2026-10-02", amount: 9200 },
  { day: "Oct 03", date: "2026-10-03", amount: 10450 },
  { day: "Oct 04", date: "2026-10-04", amount: 8750 }
];

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "Apex Retail Solutions Inc.",
  taxNumber: "US-EIN-94-381902",
  defaultCurrency: "USD ($)",
  currencySymbol: "$",
  financialYearStart: "January",
  defaultTaxRate: 8.5,
  primaryLocation: "Main Branch",
  contactEmail: "support@apexpos.internal",
  contactPhone: "+1 (800) 555-APEX",
  address: "1000 Commercial Boulevard, Suite 400, Chicago, IL 60601"
};

export const INITIAL_INVOICE_SETTINGS: InvoiceSettings = {
  invoicePrefix: "INV-2026-",
  termsAndConditions: "Goods once sold can be returned within 14 days with original receipt in undamaged condition. Software and licenses are non-refundable.",
  showLogo: true,
  paperSize: "80mm",
  footerNotes: "Thank you for shopping with Apex Retail! Follow us @ApexRetail or visit apexpos.internal."
};

export interface MonthlySalesData {
  month: string;
  monthBn: string;
  fullMonth: string;
  current2026: number; // 2026 sales in BDT
  previous2025: number; // 2025 sales in BDT
  prevMonthSales: number; // immediate previous month sales in BDT
  target: number; // Monthly target in BDT
  momGrowth: number; // Month-over-month growth %
  yoyGrowth: number; // Year-over-year growth %
  ordersCount: number; // Number of invoices
}

export const MONTHLY_SALES_PERFORMANCE: MonthlySalesData[] = [
  {
    month: "Jan",
    monthBn: "জানু",
    fullMonth: "January 2026",
    current2026: 385000,
    previous2025: 310000,
    prevMonthSales: 360000,
    target: 370000,
    momGrowth: 6.9,
    yoyGrowth: 24.2,
    ordersCount: 420
  },
  {
    month: "Feb",
    monthBn: "ফেব্রু",
    fullMonth: "February 2026",
    current2026: 412000,
    previous2025: 328000,
    prevMonthSales: 385000,
    target: 400000,
    momGrowth: 7.0,
    yoyGrowth: 25.6,
    ordersCount: 455
  },
  {
    month: "Mar",
    monthBn: "মার্চ",
    fullMonth: "March 2026",
    current2026: 468000,
    previous2025: 375000,
    prevMonthSales: 412000,
    target: 450000,
    momGrowth: 13.6,
    yoyGrowth: 24.8,
    ordersCount: 512
  },
  {
    month: "Apr",
    monthBn: "এপ্রিল",
    fullMonth: "April 2026",
    current2026: 524000,
    previous2025: 420000,
    prevMonthSales: 468000,
    target: 500000,
    momGrowth: 12.0,
    yoyGrowth: 24.8,
    ordersCount: 580
  },
  {
    month: "May",
    monthBn: "মে",
    fullMonth: "May 2026",
    current2026: 485000,
    previous2025: 395000,
    prevMonthSales: 524000,
    target: 480000,
    momGrowth: -7.4,
    yoyGrowth: 22.8,
    ordersCount: 530
  },
  {
    month: "Jun",
    monthBn: "জুন",
    fullMonth: "June 2026",
    current2026: 518000,
    previous2025: 415000,
    prevMonthSales: 485000,
    target: 510000,
    momGrowth: 6.8,
    yoyGrowth: 24.8,
    ordersCount: 565
  },
  {
    month: "Jul",
    monthBn: "জুলাই",
    fullMonth: "July 2026",
    current2026: 545000,
    previous2025: 435000,
    prevMonthSales: 518000,
    target: 530000,
    momGrowth: 5.2,
    yoyGrowth: 25.3,
    ordersCount: 595
  },
  {
    month: "Aug",
    monthBn: "আগস্ট",
    fullMonth: "August 2026",
    current2026: 592000,
    previous2025: 470000,
    prevMonthSales: 545000,
    target: 560000,
    momGrowth: 8.6,
    yoyGrowth: 26.0,
    ordersCount: 640
  },
  {
    month: "Sep",
    monthBn: "সেপ্টে",
    fullMonth: "September 2026",
    current2026: 628000,
    previous2025: 498000,
    prevMonthSales: 592000,
    target: 600000,
    momGrowth: 6.1,
    yoyGrowth: 26.1,
    ordersCount: 685
  },
  {
    month: "Oct",
    monthBn: "অক্টো",
    fullMonth: "October 2026 (MTD)",
    current2026: 655000,
    previous2025: 512000,
    prevMonthSales: 628000,
    target: 630000,
    momGrowth: 4.3,
    yoyGrowth: 27.9,
    ordersCount: 710
  }
];

