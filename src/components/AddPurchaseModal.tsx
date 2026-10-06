import React, { useState } from 'react';
import { X, ShoppingBag, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Purchase, Contact } from '../types';

interface AddPurchaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Contact[];
  onAddPurchase: (purchase: Purchase) => void;
}

export const AddPurchaseModal: React.FC<AddPurchaseModalProps> = ({
  isOpen,
  onClose,
  suppliers,
  onAddPurchase
}) => {
  const [supplierName, setSupplierName] = useState(suppliers[0]?.businessName || suppliers[0]?.name || 'Northstar Electronics Ltd');
  const [location, setLocation] = useState('Hazigonj Branch');
  const [purchaseStatus, setPurchaseStatus] = useState<'Received' | 'Pending' | 'Ordered'>('Received');
  const [paymentStatus, setPaymentStatus] = useState<'Paid' | 'Due' | 'Partial'>('Paid');
  const [purchaseDate, setPurchaseDate] = useState(new Date().toISOString().slice(0, 10));
  const [grandTotal, setGrandTotal] = useState('');
  const [paymentDue, setPaymentDue] = useState('0');
  const [itemsCount, setItemsCount] = useState('10');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!grandTotal || parseFloat(grandTotal) <= 0) {
      alert('Please enter a valid grand total.');
      return;
    }

    const newPurchase: Purchase = {
      id: `pur-${Date.now()}`,
      purchaseNo: `PO-2026-${Math.floor(800 + Math.random() * 200)}`,
      supplierName,
      businessLocation: location,
      purchaseStatus,
      paymentStatus,
      purchaseDate,
      grandTotal: parseFloat(grandTotal),
      paymentDue: parseFloat(paymentDue) || 0,
      itemsCount: parseInt(itemsCount, 10) || 1
    };

    onAddPurchase(newPurchase);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-5 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <ShoppingBag className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Add Inbound Purchase Order</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 mb-1">Supplier *</label>
            <select
              value={supplierName}
              onChange={(e) => setSupplierName(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
            >
              {suppliers.map(s => (
                <option key={s.id} value={s.businessName || s.name}>
                  {s.businessName || s.name} ({s.name})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" /> Receiving Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Hazigonj Branch">Hazigonj Branch (হাজীগঞ্জ শাখা)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Purchase Date
              </label>
              <input
                type="date"
                required
                value={purchaseDate}
                onChange={(e) => setPurchaseDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Purchase Status</label>
              <select
                value={purchaseStatus}
                onChange={(e) => setPurchaseStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Received">Received</option>
                <option value="Pending">Pending</option>
                <option value="Ordered">Ordered</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Paid">Paid</option>
                <option value="Partial">Partial</option>
                <option value="Due">Due</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Items Qty</label>
              <input
                type="number"
                required
                value={itemsCount}
                onChange={(e) => setItemsCount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> Grand Total *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={grandTotal}
                onChange={(e) => setGrandTotal(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> Amount Due
              </label>
              <input
                type="number"
                step="0.01"
                value={paymentDue}
                onChange={(e) => setPaymentDue(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-slate-200 px-4 py-2 font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-emerald-600 px-4 py-2 font-semibold text-white hover:bg-emerald-700 shadow-xs"
            >
              Add Purchase
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
