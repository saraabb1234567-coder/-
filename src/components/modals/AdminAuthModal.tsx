import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Unlock,
  Key,
  X,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';
import { useShifts } from '../../context/ShiftContext';

interface AdminAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  onSuccess?: () => void;
}

export const AdminAuthModal: React.FC<AdminAuthModalProps> = ({
  isOpen,
  onClose,
  title = 'Админ эрх шаардлагатай',
  description = 'Энэхүү тохиргоо болон үйлдлийг хийхийн тулд эрхлэгчийн нууц үгийг оруулна уу.',
  onSuccess,
}) => {
  const { isAdminUnlocked, unlockAdminMode, changeAdminPassword } = useShifts();

  const [activeTab, setActiveTab] = useState<'unlock' | 'change_password'>('unlock');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  // Password change state
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  if (!isOpen) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    const success = unlockAdminMode(password);
    if (success) {
      setPassword('');
      if (onSuccess) onSuccess();
      onClose();
    } else {
      setErrorMsg('Нууц үг буруу байна! (Анхдагч нууц үг: admin123)');
    }
  };

  const handleChangePassword = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');

    if (newPassword.length < 4) {
      setErrorMsg('Шинэ нууц үг дор хаяж 4 тэмдэгттэй байх ёстой.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg('Шинэ нууц үг хоорондоо таарахгүй байна.');
      return;
    }

    const success = changeAdminPassword(oldPassword, newPassword);
    if (success) {
      setSuccessMsg('Админ нууц үг амжилттай солигдлоо!');
      setOldPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => {
        setSuccessMsg('');
        setActiveTab('unlock');
      }, 1800);
    } else {
      setErrorMsg('Хуучин нууц үг буруу байна.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden border border-slate-200 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-slate-900 to-blue-950 p-5 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/30 border border-blue-400/30 flex items-center justify-center text-blue-400">
              <ShieldAlert className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="font-bold text-base">{title}</h3>
              <p className="text-xs text-slate-300">ШТС-ийн эрхлэгчийн аюулгүйн хамгаалалт</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs font-semibold">
          <button
            onClick={() => {
              setActiveTab('unlock');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'unlock'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Unlock className="w-3.5 h-3.5" />
            Эрх нээх (Нэвтрэх)
          </button>
          <button
            onClick={() => {
              setActiveTab('change_password');
              setErrorMsg('');
            }}
            className={`flex-1 py-3 px-4 text-center border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              activeTab === 'change_password'
                ? 'border-blue-600 text-blue-600 bg-white font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Key className="w-3.5 h-3.5" />
            Нууц үг солих
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6">
          {errorMsg && (
            <div className="mb-4 p-3 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-500 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="mb-4 p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs text-emerald-700 flex items-start gap-2">
              <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-500 mt-0.5" />
              <span>{successMsg}</span>
            </div>
          )}

          {activeTab === 'unlock' ? (
            <form onSubmit={handleUnlock} className="space-y-4">
              <p className="text-xs text-slate-600 leading-relaxed">
                {description}
              </p>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Админ нууц үг
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type="password"
                    autoFocus
                    placeholder="Жишээ: admin123"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-sm focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                  />
                </div>
                <p className="mt-1.5 text-[11px] text-slate-400">
                  Анхдагч нууц үг: <span className="font-mono font-semibold text-slate-600">admin123</span>
                </p>
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <Unlock className="w-4 h-4" />
                  Админ горим нээх
                </button>
              </div>
            </form>
          ) : (
            <form onSubmit={handleChangePassword} className="space-y-3.5">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Одоогийн нууц үг
                </label>
                <input
                  type="password"
                  required
                  placeholder="Одоогийн нууц үг"
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Шинэ нууц үг
                </label>
                <input
                  type="password"
                  required
                  placeholder="Шинэ нууц үг (дор хаяж 4 тэмдэгт)"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Шинэ нууц үг дахин оруулах
                </label>
                <input
                  type="password"
                  required
                  placeholder="Шинэ нууц үгээ баталгаажуулна уу"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors flex items-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  Шинэ нууц үг хадгалах
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
