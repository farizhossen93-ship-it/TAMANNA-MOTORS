/**
 * Converts numbers into Bengali and English currency words (Taka & Paisa).
 */

const BN_DIGITS = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];

const BN_ONES = [
  '', 'এক', 'দুই', 'তিন', 'চার', 'পাঁচ', 'ছয়', 'সাত', 'আট', 'নয়', 'দশ',
  'এগারো', 'বারো', 'তেরো', 'চৌদ্দ', 'পনেরো', 'ষোলো', 'সতেরো', 'আঠারো', 'উনিশ', 'বিশ',
  'একুশ', 'বাইশ', 'তেইশ', 'চব্বিশ', 'পঁচিশ', 'ছাব্বিশ', 'সাতাশ', 'আটাশ', 'ঊনত্রিশ', 'ত্রিশ',
  'একত্রিশ', 'বত্রিশ', 'তেত্রিশ', 'চৌত্রিশ', 'পঁয়ত্রিশ', 'ছত্রিশ', 'সাঁইত্রিশ', 'আটত্রিশ', 'ঊনচল্লিশ', 'চল্লিশ',
  'একচল্লিশ', 'বিয়াল্লিশ', 'তেতাল্লিশ', 'চুয়াল্লিশ', 'পঁয়তাল্লিশ', 'ছেচল্লিশ', 'সাতচল্লিশ', 'আটচল্লিশ', 'ঊনপঞ্চাশ', 'পঞ্চাশ',
  'একান্ন', 'বায়ান্ন', 'তিপ্পান্ন', 'চুয়ান্ন', 'পঞ্চান্ন', 'ছাপ্পান্ন', 'সাতান্ন', 'আটান্ন', 'ঊনষাট', 'ষাট',
  'একষট্টি', 'বাষট্টি', 'তেষট্টি', 'চৌষট্টি', 'পঁয়ষট্টি', 'ছেষট্টি', 'সাতষট্টি', 'আটষট্টি', 'ঊনসত্তর', 'সত্তর',
  'একাত্তর', 'বাহাত্তর', 'তিয়াত্তর', 'চৌহাত্তর', 'পঁচাত্তর', 'ছিয়াত্তর', 'সাতাত্তর', 'আটাত্তর', 'ঊনআশি', 'আশি',
  'একাশি', 'বিরাশি', 'তিরাশি', 'চুরাশি', 'পঁচাশি', 'ছিয়াশি', 'সাতাশি', 'অষ্টআশি', 'ঊননব্বই', 'নব্বই',
  'একানব্বই', 'বিরানব্বই', 'তিরানব্বই', 'চুরানব্বই', 'পঁচানব্বই', 'ছিয়ানব্বই', 'সাতানব্বই', 'আটানব্বই', 'নিরানব্বই'
];

export function toBengaliWords(num: number): string {
  if (num === 0) return 'শূন্য টাকা মাত্র';
  
  let n = Math.floor(Math.abs(num));
  let parts: string[] = [];

  const crore = Math.floor(n / 10000000);
  n %= 10000000;

  const lakh = Math.floor(n / 100000);
  n %= 100000;

  const thousand = Math.floor(n / 1000);
  n %= 1000;

  const hundred = Math.floor(n / 100);
  const remainder = n % 100;

  if (crore > 0) {
    parts.push(`${toBengaliWords(crore).replace(' টাকা মাত্র', '')} কোটি`);
  }
  if (lakh > 0) {
    parts.push(`${BN_ONES[lakh]} লাখ`);
  }
  if (thousand > 0) {
    parts.push(`${BN_ONES[thousand]} হাজার`);
  }
  if (hundred > 0) {
    parts.push(`${BN_ONES[hundred]} শত`);
  }
  if (remainder > 0) {
    parts.push(BN_ONES[remainder]);
  }

  return `${parts.join(' ')} টাকা মাত্র`;
}

export function toEnglishWords(num: number): string {
  if (num === 0) return 'Zero Taka Only';

  const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 
             'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  let n = Math.floor(Math.abs(num));
  let str = '';

  if (n >= 10000000) {
    str += toEnglishWords(Math.floor(n / 10000000)).replace(' Taka Only', '') + ' Crore ';
    n %= 10000000;
  }
  if (n >= 100000) {
    str += toEnglishWords(Math.floor(n / 100000)).replace(' Taka Only', '') + ' Lakh ';
    n %= 100000;
  }
  if (n >= 1000) {
    str += toEnglishWords(Math.floor(n / 1000)).replace(' Taka Only', '') + ' Thousand ';
    n %= 1000;
  }
  if (n >= 100) {
    str += a[Math.floor(n / 100)] + ' Hundred ';
    n %= 100;
  }
  if (n > 0) {
    if (str !== '') str += 'and ';
    if (n < 20) {
      str += a[n] + ' ';
    } else {
      str += b[Math.floor(n / 10)] + ' ' + a[n % 10] + ' ';
    }
  }

  return `${str.trim()} Taka Only`;
}
