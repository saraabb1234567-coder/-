import React, { useState } from 'react';
import {
  Layers,
  Fuel,
  AlertTriangle,
  CheckCircle2,
  AlertCircle,
  Wrench,
  PauseCircle,
  Plus,
  Edit2,
  Trash2,
  Scale,
  Truck,
  History,
  Info,
  Calendar,
  Clock,
  Droplet,
  ChevronRight,
  ShieldAlert,
  ArrowDownUp,
  FileText,
  X,
  Lock,
  Unlock,
} from 'lucide-react';
import { useShifts } from '../context/ShiftContext';
import {
  FuelTank,
  FuelNozzle,
  NozzleStatus,
  TankStatus,
  MastshapMeasurementLog,
  FuelDeliveryRecord,
} from '../types';
import { formatMNT } from '../utils/calculations';
import { getTodayString } from '../utils/dateUtils';
import { AdminAuthModal } from './modals/AdminAuthModal';

export const TanksAndNozzlesView: React.FC = () => {
  const {
    tanks,
    addTank,
    updateTank,
    deleteTank,
    nozzles,
    updateNozzleStatus,
    addNozzle,
    updateNozzle,
    deleteNozzle,
    mastshapLogs,
    recordMastshapMeasurement,
    deliveryRecords,
    recordFuelDelivery,
    fuelPrices,
    isAdminUnlocked,
  } = useShifts();

  const todayStr = getTodayString();
  const [activeTab, setActiveTab] = useState<'tanks' | 'nozzles' | 'mastshap' | 'delivery'>('tanks');

  // Admin auth modal state
  const [adminModalOpen, setAdminModalOpen] = useState(false);
  const [pendingAdminAction, setPendingAdminAction] = useState<(() => void) | null>(null);

  // Tank modal state
  const [isTankModalOpen, setIsTankModalOpen] = useState(false);
  const [editingTank, setEditingTank] = useState<FuelTank | null>(null);
  const [tName, setTName] = useState('');
  const [tFuelType, setTFuelType] = useState('АИ-92');
  const [tTotalCapacity, setTTotalCapacity] = useState<number>(25000);
  const [tCurrentLiters, setTCurrentLiters] = useState<number>(15000);
  const [tCurrentMastshapCm, setTCurrentMastshapCm] = useState<number>(110);
  const [tLitersPerCm, setTLitersPerCm] = useState<number>(135);
  const [tMinSafeThreshold, setTMinSafeThreshold] = useState<number>(3500);
  const [tMaxSafeThreshold, setTMaxSafeThreshold] = useState<number>(23500);
  const [tNotes, setTNotes] = useState('');

  // Nozzle modal state
  const [isNozzleModalOpen, setIsNozzleModalOpen] = useState(false);
  const [editingNozzle, setEditingNozzle] = useState<FuelNozzle | null>(null);
  const [nozNumber, setNozNumber] = useState('');
  const [nozDispenser, setNozDispenser] = useState('');
  const [nozFuelType, setNozFuelType] = useState('АИ-92');
  const [nozTankId, setNozTankId] = useState('');
  const [nozStatus, setNozStatus] = useState<NozzleStatus>('active');
  const [nozMeter, setNozMeter] = useState<number>(100000);
  const [nozReason, setNozReason] = useState('');

  // Mastshap measurement form state
  const [isMastshapModalOpen, setIsMastshapModalOpen] = useState(false);
  const [mTankId, setMTankId] = useState(tanks[0]?.id || '');
  const [mDate, setMDate] = useState(todayStr);
  const [mTime, setMTime] = useState('08:30');
  const [mCm, setMCm] = useState<number>(120);
  const [mWaterCm, setMWaterCm] = useState<number>(0);
  const [mTemp, setMTemp] = useState<number>(12);
  const [mMeasuredBy, setMMeasuredBy] = useState('Ээлжийн ахлагч');
  const [mNotes, setMNotes] = useState('');

  // Fuel delivery form state
  const [isDeliveryModalOpen, setIsDeliveryModalOpen] = useState(false);
  const [dTankId, setDTankId] = useState(tanks[0]?.id || '');
  const [dDate, setDDate] = useState(todayStr);
  const [dTime, setDTime] = useState('14:00');
  const [dWaybill, setDWaybill] = useState('');
  const [dSupplier, setDSupplier] = useState('НИК Петровис ХХК');
  const [dPlate, setDPlate] = useState('');
  const [dDriver, setDDriver] = useState('');
  const [dOrderedLiters, setDOrderedLiters] = useState<number>(10000);
  const [dDeliveredLiters, setDDeliveredLiters] = useState<number>(10000);
  const [dBeforeCm, setDBeforeCm] = useState<number>(50);
  const [dAfterCm, setDAfterCm] = useState<number>(125);
  const [dDensity, setDDensity] = useState<number>(0.745);
  const [dTemp, setDTemp] = useState<number>(12);
  const [dAcceptedBy, setDAcceptedBy] = useState('ШТС Эрхлэгч');
  const [dNotes, setDNotes] = useState('');

  // Check admin security before protected actions
  const requireAdmin = (action: () => void) => {
    if (isAdminUnlocked) {
      action();
    } else {
      setPendingAdminAction(() => action);
      setAdminModalOpen(true);
    }
  };

  const handleAdminSuccess = () => {
    if (pendingAdminAction) {
      pendingAdminAction();
      setPendingAdminAction(null);
    }
  };

  // Status summaries
  const lowTanks = tanks.filter((t) => t.status === 'low_warning' || t.status === 'critical_empty');
  const inactiveNozzles = nozzles.filter((n) => n.status !== 'active');

  // Nozzle status helpers
  const getNozzleStatusConfig = (status: NozzleStatus) => {
    switch (status) {
      case 'active':
        return {
          label: 'Хэвийн ажиллаж байгаа',
          shortLabel: 'Хэвийн',
          badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
          dotClass: 'bg-emerald-500 ring-emerald-200',
          icon: CheckCircle2,
          colorText: 'text-emerald-700',
        };
      case 'paused':
        return {
          label: 'Түр зогссон',
          shortLabel: 'Түр зогссон',
          badgeClass: 'bg-amber-50 text-amber-700 border-amber-200',
          dotClass: 'bg-amber-500 ring-amber-200',
          icon: PauseCircle,
          colorText: 'text-amber-700',
        };
      case 'empty':
        return {
          label: 'Шатахуун дууссан',
          shortLabel: 'Шатахуун дууссан',
          badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
          dotClass: 'bg-rose-500 ring-rose-200',
          icon: AlertTriangle,
          colorText: 'text-rose-700',
        };
      case 'maintenance':
        return {
          label: 'Засвартай / эвдрэлтэй',
          shortLabel: 'Засвартай',
          badgeClass: 'bg-purple-50 text-purple-700 border-purple-200',
          dotClass: 'bg-purple-500 ring-purple-200',
          icon: Wrench,
          colorText: 'text-purple-700',
        };
    }
  };

  // Tank status helpers
  const getTankStatusBadge = (tank: FuelTank) => {
    switch (tank.status) {
      case 'critical_empty':
        return {
          label: 'Хоосорсон / Аюултай',
          bg: 'bg-rose-100 text-rose-800 border-rose-300',
          barColor: 'bg-rose-600',
          icon: AlertCircle,
        };
      case 'low_warning':
        return {
          label: 'Аюулгүйн босгоос доошилсон',
          bg: 'bg-amber-100 text-amber-800 border-amber-300',
          barColor: 'bg-amber-500',
          icon: AlertTriangle,
        };
      case 'high_warning':
      case 'full':
        return {
          label: 'Дээд босго шахсан / Дүүрсэн',
          bg: 'bg-blue-100 text-blue-800 border-blue-300',
          barColor: 'bg-blue-600',
          icon: Info,
        };
      default:
        return {
          label: 'Хэвийн',
          bg: 'bg-emerald-100 text-emerald-800 border-emerald-300',
          barColor: 'bg-emerald-500',
          icon: CheckCircle2,
        };
    }
  };

  // Open Tank Modal
  const openNewTankModal = () => {
    requireAdmin(() => {
      setEditingTank(null);
      setTName(`Сав #${tanks.length + 1}`);
      setTFuelType('АИ-92');
      setTTotalCapacity(25000);
      setTCurrentLiters(15000);
      setTCurrentMastshapCm: 110;
      setTLitersPerCm(135);
      setTMinSafeThreshold(3500);
      setTMaxSafeThreshold(23500);
      setTNotes('');
      setIsTankModalOpen(true);
    });
  };

  const openEditTankModal = (tank: FuelTank) => {
    requireAdmin(() => {
      setEditingTank(tank);
      setTName(tank.tankNumber);
      setTFuelType(tank.fuelType);
      setTTotalCapacity(tank.totalCapacityLiters);
      setTCurrentLiters(tank.currentLiters);
      setTCurrentMastshapCm(tank.currentMastshapCm);
      setTLitersPerCm(tank.litersPerCm);
      setTMinSafeThreshold(tank.minSafeThresholdLiters);
      setTMaxSafeThreshold(tank.maxSafeThresholdLiters);
      setTNotes(tank.notes || '');
      setIsTankModalOpen(true);
    });
  };

  const handleSaveTank = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingTank) {
      updateTank(editingTank.id, {
        tankNumber: tName,
        fuelType: tFuelType,
        totalCapacityLiters: Number(tTotalCapacity),
        currentLiters: Number(tCurrentLiters),
        currentMastshapCm: Number(tCurrentMastshapCm),
        litersPerCm: Number(tLitersPerCm),
        minSafeThresholdLiters: Number(tMinSafeThreshold),
        maxSafeThresholdLiters: Number(tMaxSafeThreshold),
        notes: tNotes,
      });
    } else {
      addTank({
        tankNumber: tName,
        fuelType: tFuelType,
        totalCapacityLiters: Number(tTotalCapacity),
        currentLiters: Number(tCurrentLiters),
        currentMastshapCm: Number(tCurrentMastshapCm),
        litersPerCm: Number(tLitersPerCm),
        minSafeThresholdLiters: Number(tMinSafeThreshold),
        maxSafeThresholdLiters: Number(tMaxSafeThreshold),
        notes: tNotes,
      });
    }
    setIsTankModalOpen(false);
  };

  // Open Nozzle Modal
  const openNewNozzleModal = () => {
    requireAdmin(() => {
      setEditingNozzle(null);
      setNozNumber(`№${nozzles.length + 1}`);
      setNozDispenser(`Түгээгүүр ${Math.ceil((nozzles.length + 1) / 2)}`);
      setNozFuelType('АИ-92');
      setNozTankId(tanks[0]?.id || '');
      setNozStatus('active');
      setNozMeter(100000);
      setNozReason('');
      setIsNozzleModalOpen(true);
    });
  };

  const openEditNozzleModal = (noz: FuelNozzle) => {
    requireAdmin(() => {
      setEditingNozzle(noz);
      setNozNumber(noz.nozzleNumber);
      setNozDispenser(noz.dispenserName);
      setNozFuelType(noz.fuelType);
      setNozTankId(noz.tankId || tanks[0]?.id || '');
      setNozStatus(noz.status);
      setNozMeter(noz.currentMeterReading || 0);
      setNozReason(noz.lastStatusChangeReason || '');
      setIsNozzleModalOpen(true);
    });
  };

  const handleSaveNozzle = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingNozzle) {
      updateNozzle(editingNozzle.id, {
        nozzleNumber: nozNumber,
        dispenserName: nozDispenser,
        fuelType: nozFuelType,
        tankId: nozTankId,
        status: nozStatus,
        currentMeterReading: Number(nozMeter),
        lastStatusChangeReason: nozReason,
      });
    } else {
      addNozzle({
        nozzleNumber: nozNumber,
        dispenserName: nozDispenser,
        fuelType: nozFuelType,
        tankId: nozTankId,
        status: nozStatus,
        currentMeterReading: Number(nozMeter),
        lastStatusChangeReason: nozReason,
      });
    }
    setIsNozzleModalOpen(false);
  };

  // Quick nozzle status toggle
  const handleQuickStatusChange = (nozId: string, newStatus: NozzleStatus) => {
    const defaultReasons: Record<NozzleStatus, string> = {
      active: 'Хэвийн горимд шилжүүлэв',
      paused: 'Түгээлтийг түр зогсоов',
      empty: 'Савны үлдэгдэл багассан тул зогсоов',
      maintenance: 'Техникийн үзлэг засварт шилжүүлэв',
    };
    updateNozzleStatus(nozId, newStatus, defaultReasons[newStatus]);
  };

  // Open Mastshap modal
  const openMastshapModal = (preselectedTankId?: string) => {
    const targetTank = tanks.find((t) => t.id === (preselectedTankId || tanks[0]?.id)) || tanks[0];
    setMTankId(targetTank ? targetTank.id : '');
    setMDate(todayStr);
    setMTime(new Date().toTimeString().substring(0, 5));
    setMCm(targetTank ? targetTank.currentMastshapCm : 100);
    setMWaterCm(0);
    setMTemp(12);
    setMMeasuredBy('Ээлжийн ахлагч');
    setMNotes('');
    setIsMastshapModalOpen(true);
  };

  const handleSaveMastshap = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTank = tanks.find((t) => t.id === mTankId);
    if (!targetTank) return;

    const calcLiters = Math.round(mCm * targetTank.litersPerCm);
    const diff = calcLiters - targetTank.currentLiters;

    recordMastshapMeasurement({
      tankId: targetTank.id,
      tankNumber: targetTank.tankNumber,
      fuelType: targetTank.fuelType,
      date: mDate,
      time: mTime,
      measuredCm: Number(mCm),
      calculatedLiters: calcLiters,
      systemLitersBefore: targetTank.currentLiters,
      differenceLiters: diff,
      waterLevelCm: Number(mWaterCm),
      temperatureC: Number(mTemp),
      measuredBy: mMeasuredBy,
      notes: mNotes,
    });

    setIsMastshapModalOpen(false);
  };

  // Open Delivery modal
  const openDeliveryModal = (preselectedTankId?: string) => {
    const targetTank = tanks.find((t) => t.id === (preselectedTankId || tanks[0]?.id)) || tanks[0];
    setDTankId(targetTank ? targetTank.id : '');
    setDDate(todayStr);
    setDTime(new Date().toTimeString().substring(0, 5));
    setDWaybill(`ТДХ-${Math.floor(10000 + Math.random() * 90000)}`);
    setDSupplier('НИК Петровис ХХК');
    setDPlate('99-11 УБҮ');
    setDDriver('Тээврийн жолооч');
    setDOrderedLiters(10000);
    setDDeliveredLiters(10000);
    setDBeforeCm(targetTank ? targetTank.currentMastshapCm : 40);
    setDAfterCm(targetTank ? Math.round(targetTank.currentMastshapCm + 10000 / targetTank.litersPerCm) : 120);
    setDDensity(0.745);
    setDTemp(12);
    setDAcceptedBy('ШТС Эрхлэгч');
    setDNotes('');
    setIsDeliveryModalOpen(true);
  };

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const targetTank = tanks.find((t) => t.id === dTankId);
    if (!targetTank) return;

    recordFuelDelivery({
      tankId: targetTank.id,
      tankNumber: targetTank.tankNumber,
      fuelType: targetTank.fuelType,
      date: dDate,
      time: dTime,
      waybillNumber: dWaybill,
      supplierName: dSupplier,
      tankerPlateNumber: dPlate,
      driverName: dDriver,
      orderedLiters: Number(dOrderedLiters),
      deliveredLiters: Number(dDeliveredLiters),
      mastshapBeforeCm: Number(dBeforeCm),
      mastshapAfterCm: Number(dAfterCm),
      density: Number(dDensity),
      temperatureC: Number(dTemp),
      acceptedBy: dAcceptedBy,
      notes: dNotes,
    });

    setIsDeliveryModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Alerts */}
      <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
                ШТС Техникийн удирдлага
              </span>
              {!isAdminUnlocked && (
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                  <Lock className="w-3 h-3" /> Түгжээтэй (Засахдаа админ нууц үг хийнэ)
                </span>
              )}
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              Савны багтаамж, Хошууны төлөв & Мастшап
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Сав тус бүрийн бодит үлдэгдэл, аюулгүйн босго, хошууны 4 төлөв, мастшапын тооцоо ба цистерн буулгалтын нэгдсэн хяналт
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => openMastshapModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Scale className="w-4 h-4 text-amber-400" />
              Мастшап хэмжих
            </button>
            <button
              onClick={() => openDeliveryModal()}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors"
            >
              <Truck className="w-4 h-4" />
              Шатахуун буулгах
            </button>
          </div>
        </div>

        {/* Warning Alert if any Tank or Nozzle has warning */}
        {(lowTanks.length > 0 || inactiveNozzles.length > 0) && (
          <div className="mt-5 p-4 rounded-xl bg-amber-50/90 border border-amber-200 text-amber-900 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ШТС-ийн системээс өгсөн техникийн анхааруулга:</span>
            </div>
            <div className="text-xs space-y-1 pl-6 text-amber-800">
              {lowTanks.map((t) => (
                <div key={t.id} className="flex items-center gap-2">
                  <span className="font-bold text-rose-700">● {t.tankNumber}:</span>
                  <span>
                    Бодит үлдэгдэл {formatMNT(t.currentLiters)} л байгаа нь аюулгүйн доод босго ({formatMNT(t.minSafeThresholdLiters)} л)-оос доошилсон байна! Түргэн буулгалт захиална уу.
                  </span>
                </div>
              ))}
              {inactiveNozzles.map((n) => (
                <div key={n.id} className="flex items-center gap-2">
                  <span className="font-bold text-slate-900">● Хошуу {n.nozzleNumber} ({n.fuelType}):</span>
                  <span>
                    Төлөв: <strong>{getNozzleStatusConfig(n.status).label}</strong> — {n.lastStatusChangeReason || 'Түгээлт хийх боломжгүй'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 shadow-2xs gap-1">
        <button
          onClick={() => setActiveTab('tanks')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'tanks'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Layers className="w-4 h-4" />
          1. Савны багтаамж & Аюулгүйн босго ({tanks.length})
        </button>
        <button
          onClick={() => setActiveTab('nozzles')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'nozzles'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Fuel className="w-4 h-4" />
          2. Хошууны 4 төлөв ({nozzles.length})
        </button>
        <button
          onClick={() => setActiveTab('mastshap')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'mastshap'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Scale className="w-4 h-4" />
          3. Мастшапын тооцоо & Бүртгэл ({mastshapLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('delivery')}
          className={`flex-1 py-2.5 px-4 text-xs font-bold rounded-lg transition-colors flex items-center justify-center gap-2 ${
            activeTab === 'delivery'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
          }`}
        >
          <Truck className="w-4 h-4" />
          4. Цистерн буулгалт ({deliveryRecords.length})
        </button>
      </div>

      {/* TAB 1: TANKS & SAFETY THRESHOLDS */}
      {activeTab === 'tanks' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">Шатахууны савнуудын бодит үлдэгдэл ба босго</h2>
              <p className="text-xs text-slate-500">
                Савны багтаамж дүүрэлт, мастшап түвшин, аюулгүйн доод/дээд босго болон автомат сэрэмжлүүлэг
              </p>
            </div>
            <button
              onClick={openNewTankModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Шинэ сав нэмэх
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {tanks.map((tank) => {
              const statusCfg = getTankStatusBadge(tank);
              const StatusIcon = statusCfg.icon;
              const fillPercentage = Math.min(100, Math.max(0, Math.round((tank.currentLiters / tank.totalCapacityLiters) * 100)));
              const minThresholdPct = Math.round((tank.minSafeThresholdLiters / tank.totalCapacityLiters) * 100);
              const maxThresholdPct = Math.round((tank.maxSafeThresholdLiters / tank.totalCapacityLiters) * 100);

              return (
                <div
                  key={tank.id}
                  className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:border-slate-300 transition-all flex flex-col justify-between"
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-slate-900 text-base">{tank.tankNumber}</h3>
                          <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-slate-100 text-slate-700">
                            {tank.fuelType}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-0.5">
                          Сүүлд хэмжсэн: {tank.lastMeasurementDate || 'Өнөөдөр 08:30'}
                        </p>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.bg}`}
                      >
                        <StatusIcon className="w-3.5 h-3.5 shrink-0" />
                        {statusCfg.label}
                      </span>
                    </div>

                    {/* Tank Level Graphic Visualizer */}
                    <div className="my-4 bg-slate-50 p-4 rounded-xl border border-slate-100">
                      <div className="flex items-baseline justify-between mb-2">
                        <div>
                          <span className="text-2xl font-black text-slate-900">
                            {formatMNT(tank.currentLiters)}
                          </span>
                          <span className="text-xs font-semibold text-slate-500 ml-1">
                            / {formatMNT(tank.totalCapacityLiters)} л
                          </span>
                        </div>
                        <span className="text-xs font-black text-slate-700">
                          {fillPercentage}%
                        </span>
                      </div>

                      {/* Progress Bar Container with Safe Threshold Markers */}
                      <div className="relative w-full h-5 bg-slate-200 rounded-full overflow-hidden p-0.5">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${statusCfg.barColor}`}
                          style={{ width: `${fillPercentage}%` }}
                        />
                      </div>

                      {/* Threshold Markers Legend */}
                      <div className="flex items-center justify-between text-[10px] text-slate-500 font-medium mt-2 pt-1 border-t border-slate-200/60">
                        <span className="text-rose-600 font-semibold">
                          Доод босго: {formatMNT(tank.minSafeThresholdLiters)} л ({minThresholdPct}%)
                        </span>
                        <span className="text-blue-600 font-semibold">
                          Дээд босго: {formatMNT(tank.maxSafeThresholdLiters)} л ({maxThresholdPct}%)
                        </span>
                      </div>
                    </div>

                    {/* Mastshap & Technical Parameters */}
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[11px] text-slate-500 block">Одоогийн мастшап:</span>
                        <span className="font-bold text-slate-900 text-sm">{tank.currentMastshapCm} см</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          ({(tank.currentMastshapCm / 100).toFixed(2)} метр)
                        </span>
                      </div>
                      <div className="p-2.5 rounded-lg bg-slate-50 border border-slate-100">
                        <span className="text-[11px] text-slate-500 block">Мастшапын дүйцүүлэлт:</span>
                        <span className="font-bold text-slate-900 text-sm">1 см = {tank.litersPerCm} л</span>
                        <span className="text-[10px] text-slate-400 block mt-0.5">
                          Тооцсон: {formatMNT(Math.round(tank.currentMastshapCm * tank.litersPerCm))} л
                        </span>
                      </div>
                    </div>

                    {tank.notes && (
                      <p className="text-[11px] text-slate-500 italic bg-amber-50/50 p-2 rounded-lg border border-amber-100/50 mb-3">
                        Тэмдэглэл: {tank.notes}
                      </p>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => openMastshapModal(tank.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Scale className="w-3 h-3 text-amber-600" />
                        Мастшап шинэчлэх
                      </button>
                      <button
                        onClick={() => openDeliveryModal(tank.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-blue-700 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors flex items-center gap-1"
                      >
                        <Truck className="w-3 h-3 text-blue-600" />
                        Буулгах
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEditTankModal(tank)}
                        className="p-1.5 text-slate-400 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                        title="Савны тохиргоо засах"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      {tanks.length > 1 && (
                        <button
                          onClick={() => requireAdmin(() => deleteTank(tank.id))}
                          className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          title="Сав устгах"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 2: NOZZLES & 4 STATUSES */}
      {activeTab === 'nozzles' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900">ШТС-ийн түгээгүүрийн хошууны 4 төлөв</h2>
              <p className="text-xs text-slate-500">
                Хошуу тус бүрийн бодит байдал: Хэвийн, Түр зогссон, Шатахуун дууссан, Засвартай. Ээлжийн тооцоонд шууд тусна.
              </p>
            </div>
            <button
              onClick={openNewNozzleModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Шинэ хошуу нэмэх
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {nozzles.map((noz) => {
              const statusCfg = getNozzleStatusConfig(noz.status);
              const StatusIcon = statusCfg.icon;
              const connectedTank = tanks.find((t) => t.id === noz.tankId);

              return (
                <div
                  key={noz.id}
                  className={`bg-white rounded-2xl p-5 border shadow-xs transition-all flex flex-col justify-between ${
                    noz.status !== 'active' ? 'border-amber-200 ring-2 ring-amber-100/50' : 'border-slate-200'
                  }`}
                >
                  <div>
                    {/* Header */}
                    <div className="flex items-start justify-between gap-2 mb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-8 h-8 rounded-lg bg-blue-600 text-white font-black text-xs flex items-center justify-center shadow-2xs">
                            {noz.nozzleNumber}
                          </span>
                          <div>
                            <h3 className="font-bold text-slate-900 text-sm leading-tight">
                              Хошуу {noz.nozzleNumber}
                            </h3>
                            <p className="text-[11px] text-slate-500 font-medium">{noz.dispenserName}</p>
                          </div>
                        </div>
                      </div>

                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusCfg.badgeClass}`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${statusCfg.dotClass} animate-pulse`} />
                        {statusCfg.shortLabel}
                      </span>
                    </div>

                    {/* Fuel & Meter Details */}
                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-2 text-xs mb-3">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Шатахууны төрөл:</span>
                        <span className="font-bold text-slate-900 bg-white px-2 py-0.5 rounded-md border border-slate-200">
                          {noz.fuelType}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Холбогдсон сав:</span>
                        <span className="font-semibold text-slate-700">
                          {connectedTank ? connectedTank.tankNumber : 'Бүртгэлгүй'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">Одоогийн заалт (милль):</span>
                        <span className="font-mono font-bold text-slate-900">
                          {formatMNT(noz.currentMeterReading || 0)}
                        </span>
                      </div>
                    </div>

                    {/* Status note / warning */}
                    {noz.lastStatusChangeReason && (
                      <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-600 mb-3 flex items-start gap-1.5">
                        <Info className="w-3.5 h-3.5 shrink-0 text-slate-400 mt-0.5" />
                        <span>Шалтгаан: {noz.lastStatusChangeReason}</span>
                      </div>
                    )}

                    {/* Quick status button switcher */}
                    <div className="space-y-1 mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                        Төлөв хурдан өөрчлөх:
                      </span>
                      <div className="grid grid-cols-2 gap-1.5">
                        <button
                          onClick={() => handleQuickStatusChange(noz.id, 'active')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                            noz.status === 'active'
                              ? 'bg-emerald-600 text-white border-emerald-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-emerald-50 hover:text-emerald-700'
                          }`}
                        >
                          ● Хэвийн
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(noz.id, 'paused')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                            noz.status === 'paused'
                              ? 'bg-amber-500 text-white border-amber-500 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-amber-50 hover:text-amber-700'
                          }`}
                        >
                          ● Түр зогссон
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(noz.id, 'empty')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                            noz.status === 'empty'
                              ? 'bg-rose-600 text-white border-rose-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-rose-50 hover:text-rose-700'
                          }`}
                        >
                          ● Дууссан
                        </button>
                        <button
                          onClick={() => handleQuickStatusChange(noz.id, 'maintenance')}
                          className={`py-1.5 px-2 text-[11px] font-bold rounded-lg border transition-all ${
                            noz.status === 'maintenance'
                              ? 'bg-purple-600 text-white border-purple-600 shadow-2xs'
                              : 'bg-white text-slate-700 border-slate-200 hover:bg-purple-50 hover:text-purple-700'
                          }`}
                        >
                          ● Засвартай
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 flex items-center justify-end gap-1">
                    <button
                      onClick={() => openEditNozzleModal(noz)}
                      className="px-2.5 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors flex items-center gap-1"
                    >
                      <Edit2 className="w-3 h-3 text-slate-500" />
                      Засах
                    </button>
                    {nozzles.length > 1 && (
                      <button
                        onClick={() => requireAdmin(() => deleteNozzle(noz.id))}
                        className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                        title="Хошуу устгах"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 3: MASTSHAP MEASUREMENTS */}
      {activeTab === 'mastshap' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Мастшапын хэмжилтийн бүртгэл ба тооцоолуур</h2>
              <p className="text-xs text-slate-500">
                Шугамаар хэмжсэн сантиметрийг савны коэффициентээр литр рүү хөрвүүлж, системийн үлдэгдэлтэй тулган зөрүүг тооцно
              </p>
            </div>
            <button
              onClick={() => openMastshapModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5 text-amber-400" />
              Шинэ хэмжилт бүртгэх
            </button>
          </div>

          {/* Quick measurement calculator widget */}
          <div className="bg-gradient-to-br from-slate-900 to-blue-950 rounded-2xl p-5 text-white shadow-md">
            <div className="flex items-center gap-2 mb-3">
              <Scale className="w-4 h-4 text-amber-400" />
              <h3 className="font-bold text-sm">Шуурхай мастшап тооцоолуур</h3>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 text-xs">
              {tanks.map((tank) => (
                <div key={tank.id} className="bg-white/10 rounded-xl p-3 border border-white/10">
                  <span className="font-bold text-white block truncate">{tank.tankNumber}</span>
                  <span className="text-[11px] text-slate-300 block">{tank.fuelType} (1 см = {tank.litersPerCm} л)</span>
                  <div className="mt-2 pt-2 border-t border-white/10 flex items-center justify-between">
                    <span className="text-amber-300 font-bold">{tank.currentMastshapCm} см</span>
                    <span className="font-black text-emerald-400">{formatMNT(tank.currentLiters)} л</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Mastshap Measurement History Table */}
          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Сүүлийн хэмжилтийн түүх (Акт ба зөрүү)</span>
              <span className="text-[11px] text-slate-500">Нийт {mastshapLogs.length} бүртгэл</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Огноо & Цаг</th>
                    <th className="py-3 px-4">Савны дугаар</th>
                    <th className="py-3 px-4">Хэмжилт (см)</th>
                    <th className="py-3 px-4">Тооцсон литр</th>
                    <th className="py-3 px-4">Системийн өмнөх</th>
                    <th className="py-3 px-4">Зөрүү (литр)</th>
                    <th className="py-3 px-4">Усны түвшин</th>
                    <th className="py-3 px-4">Хэмжсэн ажилтан</th>
                    <th className="py-3 px-4">Тэмдэглэл</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {mastshapLogs.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        Одоогоор хэмжилтийн түүх бүртгэгдээгүй байна.
                      </td>
                    </tr>
                  ) : (
                    mastshapLogs.map((log) => (
                      <tr key={log.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium whitespace-nowrap">
                          {log.date} {log.time}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {log.tankNumber} ({log.fuelType})
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-blue-700">
                          {log.measuredCm} см
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {formatMNT(log.calculatedLiters)} л
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-500">
                          {formatMNT(log.systemLitersBefore)} л
                        </td>
                        <td className="py-3 px-4 font-mono font-bold">
                          {log.differenceLiters === 0 ? (
                            <span className="text-slate-400">0 л</span>
                          ) : log.differenceLiters > 0 ? (
                            <span className="text-emerald-600">+{log.differenceLiters} л</span>
                          ) : (
                            <span className="text-rose-600">{log.differenceLiters} л</span>
                          )}
                        </td>
                        <td className="py-3 px-4">
                          {log.waterLevelCm > 0 ? (
                            <span className="text-amber-700 font-bold bg-amber-50 px-2 py-0.5 rounded-md">
                              {log.waterLevelCm} см
                            </span>
                          ) : (
                            <span className="text-slate-400">Усгүй</span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {log.measuredBy}
                        </td>
                        <td className="py-3 px-4 text-slate-500 max-w-xs truncate">
                          {log.notes || '—'}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: FUEL DELIVERY RECORDS */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h2 className="text-base font-bold text-slate-900">Цистерн машин буулгалт & Хүлээн авалт</h2>
              <p className="text-xs text-slate-500">
                Тээврийн дагалдах хуудас, лац ломбо, буулгахын өмнөх ба дараах мастшап, нягт ба температурын акт
              </p>
            </div>
            <button
              onClick={() => openDeliveryModal()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Шинэ буулгалт бүртгэх
            </button>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="p-4 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Шатахуун буулгалтын актууд</span>
              <span className="text-[11px] text-slate-500">Нийт {deliveryRecords.length} буулгалт</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50/50 text-slate-500 font-bold border-b border-slate-200">
                  <tr>
                    <th className="py-3 px-4">Огноо & Цаг</th>
                    <th className="py-3 px-4">Дагалдах №</th>
                    <th className="py-3 px-4">Хүлээн авсан сав</th>
                    <th className="py-3 px-4">Нийлүүлэгч</th>
                    <th className="py-3 px-4">Машины № & Жолооч</th>
                    <th className="py-3 px-4">Буулгасан литр</th>
                    <th className="py-3 px-4">Мастшап (Өмнөх / Дараах)</th>
                    <th className="py-3 px-4">Нягт & Темп</th>
                    <th className="py-3 px-4">Хүлээн авсан</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {deliveryRecords.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400 italic">
                        Одоогоор буулгалтын бүртгэл байхгүй байна.
                      </td>
                    </tr>
                  ) : (
                    deliveryRecords.map((del) => (
                      <tr key={del.id} className="hover:bg-slate-50/80 transition-colors">
                        <td className="py-3 px-4 font-medium whitespace-nowrap">
                          {del.date} {del.time}
                        </td>
                        <td className="py-3 px-4 font-bold text-blue-700 whitespace-nowrap">
                          {del.waybillNumber}
                        </td>
                        <td className="py-3 px-4 font-bold text-slate-900 whitespace-nowrap">
                          {del.tankNumber} ({del.fuelType})
                        </td>
                        <td className="py-3 px-4 text-slate-600 whitespace-nowrap">
                          {del.supplierName}
                        </td>
                        <td className="py-3 px-4 whitespace-nowrap">
                          <span className="font-bold text-slate-800">{del.tankerPlateNumber}</span>
                          <span className="text-slate-400 text-[11px] block">{del.driverName}</span>
                        </td>
                        <td className="py-3 px-4 font-mono font-bold text-emerald-700">
                          {formatMNT(del.deliveredLiters)} л
                        </td>
                        <td className="py-3 px-4 font-mono text-slate-600">
                          {del.mastshapBeforeCm} см → <strong>{del.mastshapAfterCm} см</strong>
                        </td>
                        <td className="py-3 px-4 text-slate-500">
                          {del.density || 0.745} г/см³ / {del.temperatureC || 12}°C
                        </td>
                        <td className="py-3 px-4 text-slate-700 font-semibold whitespace-nowrap">
                          {del.acceptedBy}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 1: ADD/EDIT TANK */}
      {isTankModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingTank ? 'Савны тохиргоо засах' : 'Шинэ шатахууны сав нэмэх'}
              </h3>
              <button
                onClick={() => setIsTankModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveTank} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Савны нэр / дугаар</label>
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: Сав #1 - АИ-92"
                    value={tName}
                    onChange={(e) => setTName(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Шатахууны төрөл</label>
                  <select
                    value={tFuelType}
                    onChange={(e) => setTFuelType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="АИ-92">АИ-92</option>
                    <option value="АИ-95">АИ-95</option>
                    <option value="Дизель түлш">Дизель түлш</option>
                    <option value="А-80">А-80</option>
                    <option value="Бусад">Бусад</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Нийт багтаамж (литр)</label>
                  <input
                    type="number"
                    required
                    min={1000}
                    value={tTotalCapacity}
                    onChange={(e) => setTTotalCapacity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Бодит үлдэгдэл (литр)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={tCurrentLiters}
                    onChange={(e) => setTCurrentLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Мастшап түвшин (см)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={tCurrentMastshapCm}
                    onChange={(e) => setTCurrentMastshapCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Мастшапын дүйцүүлэлт (1 см = л)</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={tLitersPerCm}
                    onChange={(e) => setTLitersPerCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 p-3 bg-amber-50/70 border border-amber-200 rounded-xl">
                <div>
                  <label className="block font-bold text-rose-800 mb-1">Аюулгүйн доод босго (литр)</label>
                  <input
                    type="number"
                    required
                    value={tMinSafeThreshold}
                    onChange={(e) => setTMinSafeThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-rose-300 rounded-lg font-mono text-rose-900"
                  />
                  <p className="text-[10px] text-rose-700 mt-1">Энэ хэмжээнээс багасвал шар анхааруулга өгнө</p>
                </div>
                <div>
                  <label className="block font-bold text-blue-800 mb-1">Аюулгүйн дээд босго (литр)</label>
                  <input
                    type="number"
                    required
                    value={tMaxSafeThreshold}
                    onChange={(e) => setTMaxSafeThreshold(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-white border border-blue-300 rounded-lg font-mono text-blue-900"
                  />
                  <p className="text-[10px] text-blue-700 mt-1">Сав дүүрэхээс сэргийлэх хязгаар</p>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Тэмдэглэл</label>
                <textarea
                  rows={2}
                  value={tNotes}
                  onChange={(e) => setTNotes(e.target.value)}
                  placeholder="Савны байршил, халаагуур, онцлог тайлбар..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsTankModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: ADD/EDIT NOZZLE */}
      {isNozzleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">
                {editingNozzle ? 'Хошууны тохиргоо засах' : 'Шинэ түгээгүүрийн хошуу нэмэх'}
              </h3>
              <button
                onClick={() => setIsNozzleModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveNozzle} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Хошууны дугаар</label>
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: №1"
                    value={nozNumber}
                    onChange={(e) => setNozNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Түгээгүүрийн нэр</label>
                  <input
                    type="text"
                    required
                    placeholder="Жишээ: Түгээгүүр 1 (Баруун)"
                    value={nozDispenser}
                    onChange={(e) => setNozDispenser(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Шатахууны төрөл</label>
                  <select
                    value={nozFuelType}
                    onChange={(e) => setNozFuelType(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    <option value="АИ-92">АИ-92</option>
                    <option value="АИ-95">АИ-95</option>
                    <option value="Дизель түлш">Дизель түлш</option>
                    <option value="А-80">А-80</option>
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Холбогдсон сав</label>
                  <select
                    value={nozTankId}
                    onChange={(e) => setNozTankId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  >
                    {tanks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tankNumber}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Хошууны төлөв</label>
                <select
                  value={nozStatus}
                  onChange={(e) => setNozStatus(e.target.value as NozzleStatus)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                >
                  <option value="active">● Хэвийн ажиллаж байгаа</option>
                  <option value="paused">● Түр зогссон</option>
                  <option value="empty">● Шатахуун дууссан</option>
                  <option value="maintenance">● Засвартай / эвдрэлтэй</option>
                </select>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Одоогийн заалт (Милль)</label>
                <input
                  type="number"
                  required
                  min={0}
                  value={nozMeter}
                  onChange={(e) => setNozMeter(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Төлөвийн шалтгаан / Тайлбар</label>
                <input
                  type="text"
                  placeholder="Жишээ: Шланг шалгах, засвар хийх..."
                  value={nozReason}
                  onChange={(e) => setNozReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsNozzleModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: MASTSHAP MEASUREMENT */}
      {isMastshapModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-slate-900 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Мастшапын хэмжилт бүртгэх</h3>
              <button
                onClick={() => setIsMastshapModalOpen(false)}
                className="text-slate-400 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveMastshap} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Хэмжилт хийсэн сав</label>
                  <select
                    value={mTankId}
                    onChange={(e) => setMTankId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {tanks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tankNumber} ({t.fuelType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Хэмжсэн см (шугам)</label>
                  <input
                    type="number"
                    required
                    min={0}
                    value={mCm}
                    onChange={(e) => setMCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-amber-50 border border-amber-300 rounded-xl font-mono font-black text-amber-900 text-sm"
                  />
                </div>
              </div>

              {/* Automatic Calculated Liters Preview */}
              {(() => {
                const selTank = tanks.find((t) => t.id === mTankId) || tanks[0];
                const calcLit = selTank ? Math.round(mCm * selTank.litersPerCm) : 0;
                const diff = selTank ? calcLit - selTank.currentLiters : 0;
                return (
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Савны коэффициент:</span>
                      <span className="font-bold text-slate-700">1 см = {selTank?.litersPerCm} литр</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-slate-900">Тооцоолсон бодит литр:</span>
                      <span className="font-black text-emerald-700 text-base">{formatMNT(calcLit)} л</span>
                    </div>
                    <div className="flex items-center justify-between text-xs pt-2 border-t border-slate-200">
                      <span className="text-slate-500">Системийн өмнөх үлдэгдэлтэй зөрүү:</span>
                      <span className={`font-mono font-bold ${diff >= 0 ? 'text-emerald-700' : 'text-rose-600'}`}>
                        {diff >= 0 ? `+${diff}` : diff} л
                      </span>
                    </div>
                  </div>
                );
              })()}

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Усны түвшин (см)</label>
                  <input
                    type="number"
                    min={0}
                    step={0.1}
                    value={mWaterCm}
                    onChange={(e) => setMWaterCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Температур (°C)</label>
                  <input
                    type="number"
                    value={mTemp}
                    onChange={(e) => setMTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Хэмжсэн ажилтан</label>
                  <input
                    type="text"
                    required
                    value={mMeasuredBy}
                    onChange={(e) => setMMeasuredBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Огноо</label>
                  <input
                    type="date"
                    required
                    value={mDate}
                    onChange={(e) => setMDate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Цаг</label>
                  <input
                    type="time"
                    required
                    value={mTime}
                    onChange={(e) => setMTime(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">Тэмдэглэл</label>
                <input
                  type="text"
                  placeholder="Пастагаар шалгасан, лац бүрэн эсэх..."
                  value={mNotes}
                  onChange={(e) => setMNotes(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsMastshapModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-xl font-bold shadow-xs"
                >
                  Хэмжилт хадгалах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 4: FUEL DELIVERY */}
      {isDeliveryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-slate-200">
            <div className="bg-blue-600 text-white p-4 flex items-center justify-between">
              <h3 className="font-bold text-sm">Шатахуун буулгалт хүлээн авах акт</h3>
              <button
                onClick={() => setIsDeliveryModalOpen(false)}
                className="text-white/80 hover:text-white p-1"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDelivery} className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Буулгах сав</label>
                  <select
                    value={dTankId}
                    onChange={(e) => setDTankId(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  >
                    {tanks.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.tankNumber} ({t.fuelType})
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Дагалдах хуудас №</label>
                  <input
                    type="text"
                    required
                    placeholder="ТДХ-12345"
                    value={dWaybill}
                    onChange={(e) => setDWaybill(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Нийлүүлэгч компани</label>
                  <input
                    type="text"
                    required
                    value={dSupplier}
                    onChange={(e) => setDSupplier(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Машины улсын дугаар</label>
                  <input
                    type="text"
                    required
                    placeholder="99-11 УБҮ"
                    value={dPlate}
                    onChange={(e) => setDPlate(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Захиалсан литр</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={dOrderedLiters}
                    onChange={(e) => setDOrderedLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-emerald-800 mb-1">Буулгасан бодит литр</label>
                  <input
                    type="number"
                    required
                    min={100}
                    value={dDeliveredLiters}
                    onChange={(e) => setDDeliveredLiters(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-emerald-50 border border-emerald-300 rounded-xl font-mono font-bold text-emerald-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Буулгахын өмнөх мастшап (см)</label>
                  <input
                    type="number"
                    value={dBeforeCm}
                    onChange={(e) => setDBeforeCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Буулгасны дараах мастшап (см)</label>
                  <input
                    type="number"
                    value={dAfterCm}
                    onChange={(e) => setDAfterCm(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Нягт (г/см³)</label>
                  <input
                    type="number"
                    step={0.001}
                    value={dDensity}
                    onChange={(e) => setDDensity(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Темп (°C)</label>
                  <input
                    type="number"
                    value={dTemp}
                    onChange={(e) => setDTemp(Number(e.target.value))}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-700 mb-1">Хүлээн авсан</label>
                  <input
                    type="text"
                    required
                    value={dAcceptedBy}
                    onChange={(e) => setDAcceptedBy(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsDeliveryModalOpen(false)}
                  className="px-4 py-2 text-slate-600 hover:bg-slate-100 rounded-xl font-bold"
                >
                  Болих
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold shadow-xs"
                >
                  Буулгалтын акт батлах
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ADMIN AUTH MODAL */}
      <AdminAuthModal
        isOpen={adminModalOpen}
        onClose={() => {
          setAdminModalOpen(false);
          setPendingAdminAction(null);
        }}
        onSuccess={handleAdminSuccess}
      />
    </div>
  );
};
