import React from 'react';
import { RotateCcw, AlertTriangle, X } from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';

interface ConfirmResetModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ConfirmResetModal: React.FC<ConfirmResetModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { resetToDemoData } = useShifts();

  if (!isOpen) return null;

  const handleConfirm = () => {
    resetToDemoData();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xl w-full max-w-sm overflow-hidden animate-in fade-in zoom-in-95 duration-150 p-6 space-y-4">
        <div className="w-12 h-12 rounded-full bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-6 h-6" />
        </div>

        <div className="text-center space-y-1.5">
          <h3 className="font-bold text-slate-900 text-base">
            Анхны өгөгдлийг сэргээх үү?
          </h3>
          <p className="text-xs text-slate-500 leading-relaxed">
            Таны оруулсан бүх өөрчлөлт устаж, 5 үндсэн ажилтан (Гэрлээ, Батдэлгэр, Оюука, Агий, Саруул) болон хос багуудын анхны хуваарь сэргээгдэх болно.
          </p>
        </div>

        <div className="pt-2 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 cursor-pointer"
          >
            Болих
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Тийм, сэргээх</span>
          </button>
        </div>
      </div>
    </div>
  );
};
