import React, { useState } from 'react';
import { X, Receipt, DollarSign, Calendar, MapPin } from 'lucide-react';
import { Expense } from '../types';

interface AddExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddExpense: (expense: Expense) => void;
}

export const AddExpenseModal: React.FC<AddExpenseModalProps> = ({
  isOpen,
  onClose,
  onAddExpense
}) => {
  const [category, setCategory] = useState<Expense['category']>('Utilities');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [location, setLocation] = useState('Main Branch');
  const [referenceNo, setReferenceNo] = useState('');
  const [note, setNote] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid expense amount.');
      return;
    }

    const newExpense: Expense = {
      id: `exp-${Date.now()}`,
      expenseNo: `EXP-2026-${Math.floor(100 + Math.random() * 900)}`,
      category,
      businessLocation: location,
      expenseDate: date,
      amount: parseFloat(amount),
      referenceNo: referenceNo.trim() || `REF-${Math.floor(1000 + Math.random() * 9000)}`,
      note: note.trim()
    };

    onAddExpense(newExpense);
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
            <Receipt className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Add Business Expense</h3>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Expense Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Expense['category'])}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Rent">Rent</option>
                <option value="Utilities">Utilities</option>
                <option value="Salaries">Salaries</option>
                <option value="Logistics">Logistics</option>
                <option value="Marketing">Marketing</option>
                <option value="Maintenance">Maintenance</option>
                <option value="Office Supplies">Office Supplies</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> Amount ($) *
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Expense Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" /> Business Location
              </label>
              <select
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Main Branch">Main Branch</option>
                <option value="Downtown Store">Downtown Store</option>
                <option value="Westside Hub">Westside Hub</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Reference / Receipt Invoice #
            </label>
            <input
              type="text"
              value={referenceNo}
              onChange={(e) => setReferenceNo(e.target.value)}
              placeholder="e.g. BILL-9821"
              className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Note / Description
            </label>
            <textarea
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Description of the expense item or vendor notes..."
              className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
            />
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
              Record Expense
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
