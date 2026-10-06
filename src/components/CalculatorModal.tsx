import React, { useState, useEffect, useCallback } from 'react';
import { X, Delete } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({ isOpen, onClose }) => {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [overwrite, setOverwrite] = useState(false);

  const clearAll = useCallback(() => {
    setDisplay('0');
    setEquation('');
    setPrevValue(null);
    setOperation(null);
    setOverwrite(false);
  }, []);

  const handleDigit = useCallback((digit: string) => {
    if (display === '0' || overwrite) {
      setDisplay(digit);
      setOverwrite(false);
    } else {
      if (display.length < 14) {
        setDisplay(display + digit);
      }
    }
  }, [display, overwrite]);

  const handleDecimal = useCallback(() => {
    if (overwrite) {
      setDisplay('0.');
      setOverwrite(false);
      return;
    }
    if (!display.includes('.')) {
      setDisplay(display + '.');
    }
  }, [display, overwrite]);

  const handleBackspace = useCallback(() => {
    if (overwrite) return;
    if (display.length === 1 || (display.length === 2 && display.startsWith('-'))) {
      setDisplay('0');
    } else {
      setDisplay(display.slice(0, -1));
    }
  }, [display, overwrite]);

  const calculate = (a: number, b: number, op: string): number => {
    switch (op) {
      case '+': return a + b;
      case '-': return a - b;
      case '×':
      case '*': return a * b;
      case '÷':
      case '/': return b !== 0 ? a / b : 0;
      default: return b;
    }
  };

  const handleOperator = useCallback((op: string) => {
    const current = parseFloat(display);

    if (prevValue === null) {
      setPrevValue(current);
      setOperation(op);
      setEquation(`${current} ${op}`);
      setOverwrite(true);
    } else if (operation && !overwrite) {
      const result = calculate(prevValue, current, operation);
      const rounded = Math.round(result * 1000000) / 1000000;
      setPrevValue(rounded);
      setDisplay(String(rounded));
      setOperation(op);
      setEquation(`${rounded} ${op}`);
      setOverwrite(true);
    } else {
      setOperation(op);
      setEquation(`${prevValue} ${op}`);
    }
  }, [display, prevValue, operation, overwrite]);

  const handleEquals = useCallback(() => {
    if (prevValue === null || operation === null) return;
    const current = parseFloat(display);
    const result = calculate(prevValue, current, operation);
    const rounded = Math.round(result * 1000000) / 1000000;

    setEquation(`${prevValue} ${operation} ${current} =`);
    setDisplay(String(rounded));
    setPrevValue(null);
    setOperation(null);
    setOverwrite(true);
  }, [display, prevValue, operation]);

  const handlePercent = useCallback(() => {
    const current = parseFloat(display);
    const res = current / 100;
    setDisplay(String(res));
    setOverwrite(true);
  }, [display]);

  const handleToggleSign = useCallback(() => {
    const current = parseFloat(display);
    setDisplay(String(-current));
  }, [display]);

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key >= '0' && e.key <= '9') {
        handleDigit(e.key);
      } else if (e.key === '.') {
        handleDecimal();
      } else if (e.key === '+') {
        handleOperator('+');
      } else if (e.key === '-') {
        handleOperator('-');
      } else if (e.key === '*') {
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        handleBackspace();
      } else if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, handleDigit, handleDecimal, handleOperator, handleEquals, handleBackspace, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs animate-in fade-in">
      <div 
        className="w-full max-w-xs rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4 shadow-2xl transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-white tracking-tight">Point of Sale Calculator</span>
            <span className="text-[10px] text-slate-400">· ESC to exit</span>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="my-3 rounded-xl bg-slate-950 p-3 text-right text-white shadow-inner border border-slate-800">
          <div className="min-h-5 text-xs text-slate-400 font-mono tracking-tight">
            {equation || '\u00A0'}
          </div>
          <div className="overflow-x-auto text-2xl font-bold font-mono tracking-tight tabular-nums scrollbar-none py-1">
            {display}
          </div>
        </div>

        <div className="grid grid-cols-4 gap-2 text-xs font-bold select-none">
          <button
            onClick={clearAll}
            className="h-11 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/60 active:scale-95 transition-all"
          >
            AC
          </button>
          <button
            onClick={handleBackspace}
            className="flex h-11 items-center justify-center rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
            title="Backspace"
          >
            <Delete className="h-4 w-4" />
          </button>
          <button
            onClick={handlePercent}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            %
          </button>
          <button
            onClick={() => handleOperator('÷')}
            className={`h-11 rounded-xl transition-all active:scale-95 ${
              operation === '÷' ? 'bg-emerald-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700'
            }`}
          >
            ÷
          </button>

          <button
            onClick={() => handleDigit('7')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            7
          </button>
          <button
            onClick={() => handleDigit('8')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            8
          </button>
          <button
            onClick={() => handleDigit('9')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            9
          </button>
          <button
            onClick={() => handleOperator('×')}
            className={`h-11 rounded-xl transition-all active:scale-95 ${
              operation === '×' ? 'bg-emerald-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700'
            }`}
          >
            ×
          </button>

          <button
            onClick={() => handleDigit('4')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            4
          </button>
          <button
            onClick={() => handleDigit('5')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            5
          </button>
          <button
            onClick={() => handleDigit('6')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            6
          </button>
          <button
            onClick={() => handleOperator('-')}
            className={`h-11 rounded-xl transition-all active:scale-95 ${
              operation === '-' ? 'bg-emerald-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700'
            }`}
          >
            -
          </button>

          <button
            onClick={() => handleDigit('1')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            1
          </button>
          <button
            onClick={() => handleDigit('2')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            2
          </button>
          <button
            onClick={() => handleDigit('3')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            3
          </button>
          <button
            onClick={() => handleOperator('+')}
            className={`h-11 rounded-xl transition-all active:scale-95 ${
              operation === '+' ? 'bg-emerald-600 text-white' : 'bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-700'
            }`}
          >
            +
          </button>

          <button
            onClick={handleToggleSign}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            ±
          </button>
          <button
            onClick={() => handleDigit('0')}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            0
          </button>
          <button
            onClick={handleDecimal}
            className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 hover:bg-slate-200 dark:hover:bg-slate-700 active:scale-95 transition-all"
          >
            .
          </button>
          <button
            onClick={handleEquals}
            className="h-11 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 active:scale-95 transition-all font-bold"
          >
            =
          </button>
        </div>
      </div>
    </div>
  );
};
