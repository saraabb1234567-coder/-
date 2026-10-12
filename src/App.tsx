import React, { useState, useEffect } from 'react';
import { ShiftProvider } from './context/ShiftContext';
import { Sidebar, TabType } from './components/Sidebar';
import { Header } from './components/Header';
import { Dashboard } from './components/Dashboard';
import { MonthlyCalendar } from './components/MonthlyCalendar';
import { AttendanceView } from './components/AttendanceView';
import { HandoverView } from './components/HandoverView';
import { PayrollView } from './components/PayrollView';
import { FuelSalesView } from './components/FuelSalesView';
import { OilProductsView } from './components/OilProductsView';
import { PosSettlementView } from './components/PosSettlementView';
import { BankSettlementView } from './components/BankSettlementView';
import { CashSettlementView } from './components/CashSettlementView';
import { ManagerHandoverView } from './components/ManagerHandoverView';
import { ReportsView } from './components/ReportsView';
import { EmployeeManagement } from './components/EmployeeManagement';
import { GroupManagement } from './components/GroupManagement';
import { SettingsView } from './components/SettingsView';
import { PrintSchedule } from './components/PrintSchedule';

// Modals
import { EditShiftModal } from './components/modals/EditShiftModal';
import { GenerateScheduleModal } from './components/modals/GenerateScheduleModal';
import { SwapDatesModal } from './components/modals/SwapDatesModal';
import { EmployeeModal } from './components/modals/EmployeeModal';
import { GroupModal } from './components/modals/GroupModal';
import { AssignDateModal } from './components/modals/AssignDateModal';
import { ConfirmResetModal } from './components/modals/ConfirmResetModal';

import { Employee, WorkingGroup } from './types';

const VALID_TABS: TabType[] = [
  'dashboard',
  'calendar',
  'attendance',
  'payroll',
  'fuel_sales',
  'oil_products',
  'pos_settlement',
  'bank_settlement',
  'cash_settlement',
  'handover',
  'manager_handover',
  'reports',
  'employees',
  'settings',
];

const STORAGE_TAB_KEY = 'mongolian_gas_station_active_tab';

function MainApp() {
  // Read initial tab from URL hash first, then localStorage, fallback to dashboard
  const [currentTab, setCurrentTab] = useState<TabType>(() => {
    if (typeof window !== 'undefined') {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (VALID_TABS.includes(hash)) return hash;
      const stored = localStorage.getItem(STORAGE_TAB_KEY) as TabType;
      if (VALID_TABS.includes(stored)) return stored;
    }
    return 'dashboard';
  });

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Modals state
  const [editDateStr, setEditDateStr] = useState<string | null>(null);
  const [isGenerateModalOpen, setIsGenerateModalOpen] = useState(false);
  const [isSwapModalOpen, setIsSwapModalOpen] = useState(false);
  const [employeeModalState, setEmployeeModalState] = useState<{
    isOpen: boolean;
    employee: Employee | null;
  }>({ isOpen: false, employee: null });
  const [groupModalState, setGroupModalState] = useState<{
    isOpen: boolean;
    group: WorkingGroup | null;
  }>({ isOpen: false, group: null });
  const [assignDateEmployee, setAssignDateEmployee] = useState<Employee | null>(null);
  const [isResetConfirmOpen, setIsResetConfirmOpen] = useState(false);

  // URL Hash synchronization on turn/load
  useEffect(() => {
    if (!window.location.hash || window.location.hash === '#') {
      window.location.hash = currentTab;
    }

    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '') as TabType;
      if (VALID_TABS.includes(hash)) {
        setCurrentTab(hash);
        localStorage.setItem(STORAGE_TAB_KEY, hash);
      }
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, [currentTab]);

  const handleSelectTab = (tab: TabType) => {
    setCurrentTab(tab);
    window.location.hash = tab;
    localStorage.setItem(STORAGE_TAB_KEY, tab);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col lg:flex-row font-sans text-slate-800 antialiased">
      {/* Printable template */}
      <PrintSchedule />

      {/* Main app screen (hidden during print) */}
      <div className="flex-1 flex flex-col lg:flex-row print:hidden w-full">
        {/* Sidebar with 14 distinct menus */}
        <Sidebar
          currentTab={currentTab}
          setCurrentTab={handleSelectTab}
          isOpen={mobileMenuOpen}
          onClose={() => setMobileMenuOpen(false)}
          onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
          isCollapsed={isSidebarCollapsed}
          onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />

        {/* Content Area */}
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          {/* Header */}
          <Header
            currentTab={currentTab}
            onOpenMobileMenu={() => setMobileMenuOpen(true)}
            onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
            onOpenAddEmployeeModal={() =>
              setEmployeeModalState({ isOpen: true, employee: null })
            }
            onOpenSettings={() => handleSelectTab('settings')}
            onPrintCalendar={handlePrint}
          />

          {/* Main Dedicated Page Canvas */}
          <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto">
            {/* 1. Хянах самбар */}
            {currentTab === 'dashboard' && (
              <Dashboard
                setCurrentTab={handleSelectTab}
                onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
                onOpenAddEmployeeModal={() =>
                  setEmployeeModalState({ isOpen: true, employee: null })
                }
                onOpenEditShiftModal={(dateStr) => setEditDateStr(dateStr)}
              />
            )}

            {/* 2. Ээлжийн хуваарь (Сар, Долоо хоног, Өдөр, Жагсаалт) */}
            {currentTab === 'calendar' && (
              <MonthlyCalendar
                onOpenEditShiftModal={(dateStr) => setEditDateStr(dateStr)}
                onOpenGenerateModal={() => setIsGenerateModalOpen(true)}
                onOpenSwapModal={() => setIsSwapModalOpen(true)}
              />
            )}

            {/* 3. Цагийн бүртгэл */}
            {currentTab === 'attendance' && <AttendanceView />}

            {/* 4. Цалингийн бүртгэл */}
            {currentTab === 'payroll' && <PayrollView />}

            {/* 5. Шатахууны борлуулалт */}
            {currentTab === 'fuel_sales' && <FuelSalesView />}

            {/* 6. Тос, нэмэлт бүтээгдэхүүн */}
            {currentTab === 'oil_products' && <OilProductsView />}

            {/* 7. POS төхөөрөмжийн тооцоо */}
            {currentTab === 'pos_settlement' && <PosSettlementView />}

            {/* 8. Банкны дансны тооцоо */}
            {currentTab === 'bank_settlement' && <BankSettlementView />}

            {/* 9. Бэлэн мөнгөний тооцоо */}
            {currentTab === 'cash_settlement' && <CashSettlementView />}

            {/* 10. Ээлж хүлээлцэх */}
            {currentTab === 'handover' && <HandoverView />}

            {/* 11. Эрхлэгчид мөнгө хүлээлгэн өгөх */}
            {currentTab === 'manager_handover' && <ManagerHandoverView />}

            {/* 12. Тайлан */}
            {currentTab === 'reports' && <ReportsView />}

            {/* 13. Ажилтнууд */}
            {currentTab === 'employees' && (
              <div className="space-y-8">
                <EmployeeManagement
                  onOpenAddModal={() =>
                    setEmployeeModalState({ isOpen: true, employee: null })
                  }
                  onOpenEditModal={(emp) =>
                    setEmployeeModalState({ isOpen: true, employee: emp })
                  }
                  onOpenAssignDateModal={(emp) => setAssignDateEmployee(emp)}
                />
                <GroupManagement
                  onOpenAddGroupModal={() =>
                    setGroupModalState({ isOpen: true, group: null })
                  }
                  onOpenEditGroupModal={(grp) =>
                    setGroupModalState({ isOpen: true, group: grp })
                  }
                />
              </div>
            )}

            {/* 14. Тохиргоо */}
            {currentTab === 'settings' && (
              <SettingsView
                onOpenConfirmReset={() => setIsResetConfirmOpen(true)}
              />
            )}
          </main>
        </div>
      </div>

      {/* Global Modals */}
      <EditShiftModal
        isOpen={!!editDateStr}
        dateStr={editDateStr}
        onClose={() => setEditDateStr(null)}
      />

      <GenerateScheduleModal
        isOpen={isGenerateModalOpen}
        onClose={() => setIsGenerateModalOpen(false)}
      />

      <SwapDatesModal
        isOpen={isSwapModalOpen}
        onClose={() => setIsSwapModalOpen(false)}
      />

      <EmployeeModal
        isOpen={employeeModalState.isOpen}
        employee={employeeModalState.employee}
        onClose={() => setEmployeeModalState({ isOpen: false, employee: null })}
      />

      <GroupModal
        isOpen={groupModalState.isOpen}
        group={groupModalState.group}
        onClose={() => setGroupModalState({ isOpen: false, group: null })}
      />

      {assignDateEmployee && (
        <AssignDateModal
          isOpen={!!assignDateEmployee}
          employee={assignDateEmployee}
          onClose={() => setAssignDateEmployee(null)}
        />
      )}

      <ConfirmResetModal
        isOpen={isResetConfirmOpen}
        onClose={() => setIsResetConfirmOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <ShiftProvider>
      <MainApp />
    </ShiftProvider>
  );
}
