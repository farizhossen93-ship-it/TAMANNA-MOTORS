import React, { useState } from 'react';
import { X, ArrowLeftRight, DollarSign, Calendar, MapPin } from 'lucide-react';
import { StockTransfer } from '../types';

interface AddTransferModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTransfer: (transfer: StockTransfer) => void;
}

export const AddTransferModal: React.FC<AddTransferModalProps> = ({
  isOpen,
  onClose,
  onAddTransfer
}) => {
  const [fromLocation, setFromLocation] = useState('Hazigonj Branch');
  const [toLocation, setToLocation] = useState('Hazigonj Central Depot');
  const [status, setStatus] = useState<'Completed' | 'Pending' | 'In Transit'>('In Transit');
  const [shippingCharges, setShippingCharges] = useState('35.00');
  const [totalAmount, setTotalAmount] = useState('1850.00');
  const [itemsCount, setItemsCount] = useState('25');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (fromLocation === toLocation) {
      alert('Source and destination locations cannot be the same.');
      return;
    }

    const newTransfer: StockTransfer = {
      id: `st-${Date.now()}`,
      transferNo: `ST-2026-${Math.floor(110 + Math.random() * 890)}`,
      fromLocation,
      toLocation,
      status,
      shippingCharges: parseFloat(shippingCharges) || 0,
      totalAmount: parseFloat(totalAmount) || 0,
      date,
      itemsCount: parseInt(itemsCount, 10) || 1
    };

    onAddTransfer(newTransfer);
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
            <ArrowLeftRight className="h-4 w-4 text-emerald-600" />
            <h3 className="text-sm font-bold text-slate-900">Add Stock Transfer</h3>
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
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" /> From Location
              </label>
              <select
                value={fromLocation}
                onChange={(e) => setFromLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Hazigonj Branch">Hazigonj Branch (প্রধান শোরুম)</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <MapPin className="h-3 w-3 text-slate-400" /> To Location
              </label>
              <select
                value={toLocation}
                onChange={(e) => setToLocation(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="Hazigonj Central Depot">Hazigonj Central Depot (গোডাউন)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Transfer Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full rounded-lg border border-slate-300 p-2 focus:border-slate-500 focus:outline-none"
              >
                <option value="In Transit">In Transit</option>
                <option value="Completed">Completed</option>
                <option value="Pending">Pending</option>
              </select>
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <Calendar className="h-3 w-3 text-slate-400" /> Transfer Date
              </label>
              <input
                type="date"
                required
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Total Units</label>
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
                <DollarSign className="h-3 w-3 text-slate-400" /> Stock Value
              </label>
              <input
                type="number"
                step="0.01"
                required
                value={totalAmount}
                onChange={(e) => setTotalAmount(e.target.value)}
                className="w-full rounded-lg border border-slate-300 p-2 font-mono focus:border-slate-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1 flex items-center gap-1">
                <DollarSign className="h-3 w-3 text-slate-400" /> Shipping
              </label>
              <input
                type="number"
                step="0.01"
                value={shippingCharges}
                onChange={(e) => setShippingCharges(e.target.value)}
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
              Dispatch Transfer
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
