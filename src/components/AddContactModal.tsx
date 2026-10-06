import React, { useState, useEffect } from 'react';
import { X, User, Phone, Mail, Building, CreditCard, Save, AlertCircle } from 'lucide-react';
import { Contact } from '../types';
import { Language, TRANSLATIONS } from '../i18n/translations';

interface AddContactModalProps {
  isOpen: boolean;
  onClose: () => void;
  type: 'supplier' | 'customer';
  onAddContact: (contact: Contact) => void;
  initialContact?: Contact | null;
  lang?: Language;
}

export const AddContactModal: React.FC<AddContactModalProps> = ({
  isOpen,
  onClose,
  type,
  onAddContact,
  initialContact,
  lang = 'en'
}) => {
  const t = TRANSLATIONS[lang];
  const [name, setName] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [customerGroup, setCustomerGroup] = useState('Standard Retail');
  const [creditLimit, setCreditLimit] = useState('');
  const [address, setAddress] = useState('');
  const [location, setLocation] = useState('Hazigonj Branch');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initialContact) {
      setName(initialContact.name || '');
      setBusinessName(initialContact.businessName || '');
      setEmail(initialContact.email || '');
      setPhone(initialContact.phone || '');
      setCustomerGroup(initialContact.customerGroup || 'Standard Retail');
      setCreditLimit(initialContact.creditLimit?.toString() || '');
      setAddress(initialContact.address || '');
      setLocation(initialContact.businessLocation || 'Hazigonj Branch');
    } else {
      setName('');
      setBusinessName('');
      setEmail('');
      setPhone('');
      setCustomerGroup('Standard Retail');
      setCreditLimit('');
      setAddress('');
      setLocation('Hazigonj Branch');
    }
    setError(null);
  }, [initialContact, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim()) {
      setError(lang === 'bn' ? 'নাম এবং মোবাইল নাম্বার পূরণ করা বাধ্যতামূলক।' : 'Please enter Name and Phone Number.');
      return;
    }

    const contactData: Contact = {
      id: initialContact?.id || `${type}-${Date.now()}`,
      type,
      name: name.trim(),
      businessName: businessName.trim() || undefined,
      email: email.trim(),
      phone: phone.trim(),
      customerGroup: type === 'customer' ? customerGroup : undefined,
      businessLocation: location,
      creditLimit: parseFloat(creditLimit) || 0,
      balance: initialContact?.balance ?? 0,
      totalPurchases: initialContact?.totalPurchases ?? 0,
      address: address.trim() || undefined
    };

    onAddContact(contactData);
    onClose();
  };

  const getTitle = () => {
    if (initialContact) {
      if (type === 'supplier') {
        return lang === 'bn' ? 'সরবরাহকারী প্রতিষ্ঠান সম্পাদনা' : 'Edit Supplier Details';
      }
      return lang === 'bn' ? 'গ্রাহক তথ্য সম্পাদনা' : 'Edit Customer Profile';
    }
    if (type === 'supplier') {
      return lang === 'bn' ? 'নতুন পার্টস সরবরাহকারী যোগ করুন' : 'Add New Spare Parts Supplier';
    }
    return lang === 'bn' ? 'নতুন গ্রাহক যোগ করুন' : 'Add New Customer Profile';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-lg rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-6 shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3.5 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
              <User className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                {getTitle()}
              </h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">
                TAMANNA MOTORS · {type === 'supplier' ? (lang === 'bn' ? 'সাপ্লায়ার রেজিস্ট্রি' : 'Supplier Registry') : (lang === 'bn' ? 'গ্রাহক খাতা' : 'Customer Account')}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {error && (
          <div className="mt-3 flex items-center gap-2 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 p-2.5 text-xs text-rose-700 dark:text-rose-300 font-semibold animate-in fade-in">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'ব্যক্তির নাম *' : 'Contact Person Name *'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={lang === 'bn' ? 'উদা: মোঃ আরিফুল ইসলাম' : 'e.g. Md. Ariful Islam'}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Building className="h-3.5 w-3.5 text-slate-400" />
                <span>{type === 'supplier' ? (lang === 'bn' ? 'প্রতিষ্ঠানের নাম' : 'Company / Business Name') : (lang === 'bn' ? 'দোকান / ব্যবসার নাম (ঐচ্ছিক)' : 'Workshop / Business Name')}</span>
              </label>
              <input
                type="text"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                placeholder={lang === 'bn' ? 'উদা: রয়েল অটো পার্টস' : 'e.g. Royal Auto Parts Ltd.'}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Phone className="h-3.5 w-3.5 text-slate-400" />
                <span>{lang === 'bn' ? 'মোবাইল নাম্বার *' : 'Phone Number *'}</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+880 1711-234567"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Mail className="h-3.5 w-3.5 text-slate-400" />
                <span>{lang === 'bn' ? 'ইমেইল ঠিকানা' : 'Email Address'}</span>
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="contact@tamannamotors.com"
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              />
            </div>
          </div>

          {type === 'customer' ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  {lang === 'bn' ? 'গ্রাহক গ্রুপ / ডিসকাউন্ট ক্যাটাগরি' : 'Customer Discount Tier'}
                </label>
                <select
                  value={customerGroup}
                  onChange={(e) => setCustomerGroup(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                >
                  <option value="Standard Retail">Standard Retail (সাধারণ খুচরা)</option>
                  <option value="Workshop Partner">Workshop Partner (ওয়ার্কশপ পার্টনার ৫%)</option>
                  <option value="VIP Bikers Club">VIP Bikers Club (ভিআইপি বাইকার ১০%)</option>
                  <option value="Wholesale Distributor">Wholesale Distributor (পাইকারি ১২%)</option>
                </select>
              </div>
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                  <CreditCard className="h-3.5 w-3.5 text-slate-400" />
                  <span>{lang === 'bn' ? 'ক্রেডিট লিমিট (৳)' : 'Credit Limit (৳)'}</span>
                </label>
                <input
                  type="number"
                  value={creditLimit}
                  onChange={(e) => setCreditLimit(e.target.value)}
                  placeholder="25000"
                  className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 font-mono text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
                />
              </div>
            </div>
          ) : (
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                {lang === 'bn' ? 'শোরুম / ওয়্যারহাউস শাখা' : 'Primary Receiving Showroom Branch'}
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
              >
                <option value="Hazigonj Branch">Hazigonj Branch (হাজীগঞ্জ প্রধান শাখা)</option>
              </select>
            </div>
          )}

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
              {lang === 'bn' ? 'ঠিকানা' : 'Physical Address / Location'}
            </label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder={lang === 'bn' ? 'পশ্চিম বাজার, হাজীগঞ্জ, চাঁদপুর' : 'West Bazar, Hazigonj, Chandpur'}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 p-2.5 text-slate-900 dark:text-white focus:border-emerald-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              {t.cancel}
            </button>
            <button
              type="submit"
              className="flex items-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2 text-xs font-bold text-white hover:bg-emerald-700 shadow-xs transition-colors"
            >
              <Save className="h-4 w-4" />
              <span>{initialContact ? (lang === 'bn' ? 'পরিবর্তন সংরক্ষণ করুন' : 'Update Contact') : (lang === 'bn' ? 'সংরক্ষণ করুন' : 'Save Contact')}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
