import { Product, Contact, CustomerGroup, Purchase, PurchaseReturn, Sale, SalesReturn, StockTransfer, Expense, BusinessSettings, InvoiceSettings } from '../types';

export const INITIAL_PRODUCTS: Product[] = [];

export const INITIAL_SUPPLIERS: Contact[] = [];

export const INITIAL_CUSTOMERS: Contact[] = [
  {
    id: "cust-walkin",
    type: "customer",
    name: "Walk-in Customer (খুচরা ক্রেতা)",
    email: "",
    phone: "01700000000",
    customerGroup: "Retail",
    businessLocation: "Hazigonj Branch",
    balance: 0.00,
    totalPurchases: 0.00
  }
];

export const INITIAL_CUSTOMER_GROUPS: CustomerGroup[] = [
  { id: "cg-1", name: "Standard Retail", calculationPercentage: 0, sellingPriceGroup: "Retail Standard" },
  { id: "cg-2", name: "VIP Tier", calculationPercentage: 8, sellingPriceGroup: "Preferred VIP" },
  { id: "cg-3", name: "Wholesale Partner", calculationPercentage: 15, sellingPriceGroup: "Wholesale Tier 1" }
];

export const INITIAL_PURCHASES: Purchase[] = [];

export const INITIAL_PURCHASE_RETURNS: PurchaseReturn[] = [];

export const INITIAL_SALES: Sale[] = [];

export const INITIAL_SALES_RETURNS: SalesReturn[] = [];

export const INITIAL_STOCK_TRANSFERS: StockTransfer[] = [];

export const INITIAL_EXPENSES: Expense[] = [];

// 30 Days of sales trend data for the line chart (dynamically computed from real sales in UI)
export const SALES_LAST_30_DAYS: { day: string; date: string; amount: number }[] = [];

export const INITIAL_BUSINESS_SETTINGS: BusinessSettings = {
  businessName: "TAMANNA MOTORS",
  taxNumber: "BIN-002849102-0101",
  defaultCurrency: "BDT (৳)",
  currencySymbol: "৳",
  financialYearStart: "July",
  defaultTaxRate: 5.0,
  primaryLocation: "Hazigonj Branch",
  contactEmail: "tamannamotors.bd@gmail.com",
  contactPhone: "01626666906, 01878934956",
  address: "HAZIGONJ-KACHUA MAIN ROAD, WEST BAZAR, HAZIGONJ, CHANDPUR.",
  logoUrl: ""
};

export const INITIAL_INVOICE_SETTINGS: InvoiceSettings = {
  invoicePrefix: "TM-2026-",
  termsAndConditions: "১. বিক্রিত মাল ১৪ দিনের মধ্যে অক্ষত অবস্থায় ক্যাশ মেমোসহ পরিবর্তনযোগ্য। ২. ইলেকট্রিক্যাল ও ব্যাটারি আইটেমে প্রস্তুতকারকের শর্ত প্রযোজ্য।",
  showLogo: true,
  paperSize: "A4",
  footerNotes: "তামান্না মোটরসে কেনাকাটার জন্য আন্তরিক ধন্যবাদ! ১০০% জেনুইন পার্টসের বিশ্বস্ত প্রতিষ্ঠান।",
  logoUrl: ""
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

export const MONTHLY_SALES_PERFORMANCE: MonthlySalesData[] = [];


