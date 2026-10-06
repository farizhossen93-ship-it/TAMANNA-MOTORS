export interface BarcodeProductPreset {
  barcode: string;
  sku: string;
  nameEn: string;
  nameBn: string;
  category: string;
  categoryBn: string;
  unitPurchasePrice: number;
  sellingPrice: number;
  alertQuantity: number;
  initialStock: number;
  descriptionEn: string;
  descriptionBn: string;
  imageUrl: string;
}

export const TAMANNA_BARCODE_CATALOG: BarcodeProductPreset[] = [
  {
    barcode: "8901030019283",
    sku: "MOT-4T-10W40",
    nameEn: "Motul 7100 4T 10W-40 100% Synthetic Engine Oil 1L",
    nameBn: "মটুল ৭১০০ ৪টি ১০W-৪০ ১০০% সিন্থেটিক ইঞ্জিন অয়েল ১ লিটার",
    category: "Engine Oil & Lubricants",
    categoryBn: "ইঞ্জিন অয়েল ও লুব্রিকেন্ট",
    unitPurchasePrice: 1250,
    sellingPrice: 1550,
    alertQuantity: 10,
    initialStock: 45,
    descriptionEn: "High-performance ester-based 4-stroke synthetic motorcycle engine oil.",
    descriptionBn: "উচ্চ ক্ষমতাসম্পন্ন এস্টার ভিত্তিক ৪-স্ট্রোক সিন্থেটিক মোটরসাইকেল ইঞ্জিন তেল।",
    imageUrl: "https://images.unsplash.com/photo-1619642751034-765dfdf7c58e?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901020088192",
    sku: "NGK-CR9EIA9",
    nameEn: "NGK Laser Iridium Spark Plug CR9EIA-9",
    nameBn: "এনজিকে লেজার ইরিডিয়াম স্পার্ক প্লাগ CR9EIA-9",
    category: "Electrical & Ignition",
    categoryBn: "ইলেকট্রিক্যাল ও ইগনিশন",
    unitPurchasePrice: 680,
    sellingPrice: 950,
    alertQuantity: 8,
    initialStock: 30,
    descriptionEn: "Premium laser-welded iridium center electrode for maximum spark efficiency.",
    descriptionBn: "উচ্চ মাইলেজ এবং দ্রুত ইগনিশনের জন্য উন্নত লেজার ইরিডিয়াম স্পার্ক প্লাগ।",
    imageUrl: "https://images.unsplash.com/photo-1550009158-9ebf69173e03?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901040055219",
    sku: "BRM-BP-FR01",
    nameEn: "Brembo Sintered Front Disc Brake Pads Set",
    nameBn: "ব্রেম্বো সিন্টার্ড ফ্রন্ট ডিস্ক ব্রেক প্যাড সেট",
    category: "Brakes & Suspension",
    categoryBn: "ব্রেক ও সাসপেনশন",
    unitPurchasePrice: 920,
    sellingPrice: 1350,
    alertQuantity: 6,
    initialStock: 25,
    descriptionEn: "High friction coefficient sintered metal brake pads for quick stopping power.",
    descriptionBn: "সর্বোচ্চ ব্রেকিং নিয়ন্ত্রণের জন্য উন্নত সিন্টার্ড মেটাল ডিস্ক প্যাড।",
    imageUrl: "https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901050033100",
    sku: "EXD-12V5AH-MF",
    nameEn: "Exide Xplore 12V 5Ah Maintenance-Free Bike Battery",
    nameBn: "এক্সাইড এক্সপ্লোর ১২ভি ৫এএইচ মেইনটেন্যান্স-ফ্রি বাইক ব্যাটারি",
    category: "Batteries & Power",
    categoryBn: "ব্যাটারি ও পাওয়ার",
    unitPurchasePrice: 1850,
    sellingPrice: 2400,
    alertQuantity: 5,
    initialStock: 18,
    descriptionEn: "Factory-charged sealed lead-acid battery with leak-proof AGM separator.",
    descriptionBn: "সিলড এজিএম টেকনোলজি যুক্ত দীর্ঘস্থায়ী মেইনটেন্যান্স-ফ্রি ব্যাটারি।",
    imageUrl: "https://images.unsplash.com/photo-1612815154858-60aa4c59eaa6?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901060044910",
    sku: "MRF-TYR-909017",
    nameEn: "MRF Zapper-FS 90/90-17 Tubeless Front Tyre",
    nameBn: "এমআরএফ জ্যাপার-এফএস ৯০/৯০-১৭ টিউবলেস ফ্রন্ট টায়ার",
    category: "Tyres & Tubes",
    categoryBn: "টায়ার ও টিউব",
    unitPurchasePrice: 2800,
    sellingPrice: 3450,
    alertQuantity: 4,
    initialStock: 12,
    descriptionEn: "Deep directional tread pattern for superior wet road grip and longevity.",
    descriptionBn: "চমৎকার গ্রিপ ও ব্যালেন্সের জন্য উন্নত রাবার যৌগের টিউবলেস টায়ার।",
    imageUrl: "https://images.unsplash.com/photo-1578844251758-2f71da64c96f?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901070022334",
    sku: "DID-428-130L",
    nameEn: "DID 428-130L Heavy Duty Drive Chain & Sprocket Kit",
    nameBn: "ডিআইডি ৪২৮-১৩০এল হেভি ডিউটি ড্রাইভ চেইন ও স্প্রকেট কিট",
    category: "Transmission & Drivetrain",
    categoryBn: "ট্রান্সমিশন ও চেইন স্প্রকেট",
    unitPurchasePrice: 1650,
    sellingPrice: 2200,
    alertQuantity: 5,
    initialStock: 16,
    descriptionEn: "Hardened steel heat-treated sprockets with solid roller Japanese chain.",
    descriptionBn: "হিট-ট্রিটেড শক্ত ইস্পাত স্প্রকেট এবং টেকসই জাপানি রোলার চেইন।",
    imageUrl: "https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901080066112",
    sku: "BSH-HRN-12V",
    nameEn: "Bosch FC4 Disc Dual-Tone 12V Horn Set",
    nameBn: "বশ এফসি৪ ডিস্ক ডুয়াল-টোন ১২ভি হর্ন সেট",
    category: "Electrical & Ignition",
    categoryBn: "ইলেকট্রিক্যাল ও ইগনিশন",
    unitPurchasePrice: 850,
    sellingPrice: 1250,
    alertQuantity: 6,
    initialStock: 22,
    descriptionEn: "110 dB powerful penetrating dual tone sound with Teflon filter.",
    descriptionBn: "১১০ ডেসিবেল শক্তিশালী স্পষ্ট দ্বৈত শব্দ ও ওয়াটারপ্রুফ ডিজাইন।",
    imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=120&h=120&q=80"
  },
  {
    barcode: "8901090077881",
    sku: "KN-FLT-YA01",
    nameEn: "K&N High-Flow Washable Air Filter",
    nameBn: "কে অ্যান্ড এন হাই-ফ্লো ওয়াশেবল এয়ার ফিল্টার",
    category: "Filters & Intake",
    categoryBn: "ফিল্টার ও ইনটেক",
    unitPurchasePrice: 1400,
    sellingPrice: 1950,
    alertQuantity: 4,
    initialStock: 15,
    descriptionEn: "Layered cotton gauze air filter offering increased horsepower and acceleration.",
    descriptionBn: "পুনর্ব্যবহারযোগ্য তুলার স্তরযুক্ত উচ্চ বায়ুপ্রবাহ এয়ার ফিল্টার।",
    imageUrl: "https://images.unsplash.com/photo-1486006920555-c77dce18193b?auto=format&fit=crop&w=120&h=120&q=80"
  }
];
