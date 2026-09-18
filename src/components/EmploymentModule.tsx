import React, { useState } from 'react';
import { 
  Users, 
  Calendar, 
  Clock, 
  Award, 
  CheckCircle2, 
  XCircle, 
  Plus, 
  TrendingUp, 
  ShieldCheck, 
  BookOpen, 
  GraduationCap, 
  UserCheck, 
  Check, 
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Trash2,
  LayoutGrid,
  Table as TableIcon,
  CalendarDays,
  UserPlus,
  Sparkles,
  X,
  ArrowRight,
  Filter,
  Edit3,
  FileDown,
  Printer
} from 'lucide-react';
import { Employee, Shift, LeaveRequest } from '../types';
import { ExportSchedulePdfModal } from './ExportSchedulePdfModal';

interface EmploymentModuleProps {
  employees: Employee[];
  shifts: Shift[];
  leaveRequests: LeaveRequest[];
  onAddShift: (newShift: Omit<Shift, 'id'>) => void;
  onUpdateShift?: (updatedShift: Shift) => void;
  onDeleteShift?: (shiftId: string) => void;
  onUpdateLeaveStatus: (leaveId: string, status: LeaveRequest['status']) => void;
  onUpdateFeedback: (employeeId: string, feedback: string) => void;
}

const ZONE_CONFIG: Record<Shift['zone'], { bg: string; badgeBg: string; text: string; border: string; label: string; dot: string }> = {
  'Sales Floor - Footwear': {
    bg: 'bg-sky-50/80',
    badgeBg: 'bg-sky-100',
    text: 'text-sky-800',
    border: 'border-sky-200',
    label: 'Footwear',
    dot: 'bg-sky-500'
  },
  'Sales Floor - Apparel': {
    bg: 'bg-violet-50/80',
    badgeBg: 'bg-violet-100',
    text: 'text-violet-800',
    border: 'border-violet-200',
    label: 'Apparel',
    dot: 'bg-violet-500'
  },
  'Cash Desk': {
    bg: 'bg-emerald-50/80',
    badgeBg: 'bg-emerald-100',
    text: 'text-emerald-800',
    border: 'border-emerald-200',
    label: 'Cash Desk',
    dot: 'bg-emerald-500'
  },
  'Stockroom / Receiving': {
    bg: 'bg-amber-50/80',
    badgeBg: 'bg-amber-100',
    text: 'text-amber-800',
    border: 'border-amber-200',
    label: 'Stock / DC',
    dot: 'bg-amber-500'
  },
  'Visual Merchandising': {
    bg: 'bg-pink-50/80',
    badgeBg: 'bg-pink-100',
    text: 'text-pink-800',
    border: 'border-pink-200',
    label: 'Visual Merch',
    dot: 'bg-pink-500'
  }
};

const SHIFT_PRESETS = [
  { label: 'Morning Open', start: '08:30 AM', end: '05:30 PM', desc: '8.5h Floor Open' },
  { label: 'Mid-Day Peak', start: '10:00 AM', end: '07:00 PM', desc: '8.5h High Traffic' },
  { label: 'Evening Close', start: '01:00 PM', end: '09:30 PM', desc: '8h Floor Close & Handover' },
  { label: 'Stock Intake', start: '07:30 AM', end: '04:30 PM', desc: '8.5h DC Truck Inbound' },
  { label: 'Visual Merch', start: '09:00 AM', end: '05:30 PM', desc: '8h Fixture Refresh' }
];

function parseShiftHours(startTime: string, endTime: string): number {
  const toMinutes = (timeStr: string) => {
    const parts = timeStr.trim().split(' ');
    if (parts.length < 2) return 0;
    const [hStr, mStr] = parts[0].split(':');
    let h = parseInt(hStr, 10);
    const m = parseInt(mStr, 10) || 0;
    const ampm = parts[1].toUpperCase();
    if (ampm === 'PM' && h < 12) h += 12;
    if (ampm === 'AM' && h === 12) h = 0;
    return h * 60 + m;
  };
  const diff = toMinutes(endTime) - toMinutes(startTime);
  return diff > 0 ? Math.round((diff / 60) * 10) / 10 : 8;
}

function getWeekDays(startDateStr: string) {
  const [y, m, d] = startDateStr.split('-').map(Number);
  const base = new Date(y, m - 1, d);
  const dayNames = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const fullNames = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  return Array.from({ length: 7 }, (_, i) => {
    const dayDate = new Date(base);
    dayDate.setDate(base.getDate() + i);
    const yr = dayDate.getFullYear();
    const mo = String(dayDate.getMonth() + 1).padStart(2, '0');
    const dt = String(dayDate.getDate()).padStart(2, '0');
    const dateStr = `${yr}-${mo}-${dt}`;
    return {
      dateStr,
      dayShort: dayNames[i],
      dayFull: fullNames[i],
      dayNum: dayDate.getDate(),
      monthShort: dayDate.toLocaleString('en-US', { month: 'short' }),
      isToday: dateStr === '2026-09-18'
    };
  });
}

function formatWeekRange(startDateStr: string): string {
  const [y, m, d] = startDateStr.split('-').map(Number);
  const start = new Date(y, m - 1, d);
  const end = new Date(y, m - 1, d + 6);
  const startMonth = start.toLocaleString('en-US', { month: 'short' });
  const endMonth = end.toLocaleString('en-US', { month: 'short' });
  if (startMonth === endMonth) {
    return `${startMonth} ${start.getDate()} – ${end.getDate()}, ${start.getFullYear()}`;
  }
  return `${startMonth} ${start.getDate()} – ${endMonth} ${end.getDate()}, ${start.getFullYear()}`;
}

function getSmartRoleShift(emp: Employee): { startTime: string; endTime: string; zone: Shift['zone']; isMod: boolean } {
  if (emp.role === 'Store Manager') {
    return { startTime: '08:30 AM', endTime: '05:30 PM', zone: 'Sales Floor - Footwear', isMod: true };
  }
  if (emp.role === 'Assistant Manager') {
    return { startTime: '01:00 PM', endTime: '09:30 PM', zone: 'Sales Floor - Apparel', isMod: true };
  }
  if (emp.role === 'Visual Merchandiser') {
    return { startTime: '09:00 AM', endTime: '05:30 PM', zone: 'Visual Merchandising', isMod: false };
  }
  if (emp.role === 'Inventory Stockist') {
    return { startTime: '07:30 AM', endTime: '04:30 PM', zone: 'Stockroom / Receiving', isMod: false };
  }
  if (emp.role === 'Floor Lead') {
    return { startTime: '09:00 AM', endTime: '06:00 PM', zone: 'Sales Floor - Footwear', isMod: false };
  }
  return { startTime: '09:30 AM', endTime: '06:30 PM', zone: 'Cash Desk', isMod: false };
}

export const EmploymentModule: React.FC<EmploymentModuleProps> = ({
  employees,
  shifts,
  leaveRequests,
  onAddShift,
  onUpdateShift,
  onDeleteShift,
  onUpdateLeaveStatus,
  onUpdateFeedback
}) => {
  const [activeTab, setActiveTab] = useState<'schedule' | 'performance' | 'leaves' | 'directory'>('schedule');
  const [calendarView, setCalendarView] = useState<'grid' | 'matrix' | 'table'>('grid');
  const [currentWeekStart, setCurrentWeekStart] = useState('2026-09-14');
  
  // Quick-Assign & Drag states
  const [selectedStaffForAssign, setSelectedStaffForAssign] = useState<Employee | null>(null);
  const [dragOverDate, setDragOverDate] = useState<string | null>(null);
  const [draggedItem, setDraggedItem] = useState<{ type: 'STAFF' | 'SHIFT'; id: string; name?: string } | null>(null);
  const [zoneFilter, setZoneFilter] = useState<string>('all');

  // Modal form states
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isShiftModalOpen, setIsShiftModalOpen] = useState(false);
  const [editingShift, setEditingShift] = useState<Shift | null>(null);
  const [shiftEmployeeId, setShiftEmployeeId] = useState(employees[0]?.id || '');
  const [shiftDate, setShiftDate] = useState('2026-09-18');
  const [shiftStartTime, setShiftStartTime] = useState('09:00 AM');
  const [shiftEndTime, setShiftEndTime] = useState('06:00 PM');
  const [shiftZone, setShiftZone] = useState<Shift['zone']>('Sales Floor - Footwear');
  const [isMod, setIsMod] = useState(false);

  // Week calculation
  const weekDays = getWeekDays(currentWeekStart);
  const weekDates = weekDays.map(d => d.dateStr);
  const weekShifts = shifts.filter(s => weekDates.includes(s.date));
  
  const filteredWeekShifts = zoneFilter === 'all' 
    ? weekShifts 
    : weekShifts.filter(s => s.zone === zoneFilter);

  // Total scheduled hours this week
  const totalWeeklyHours = weekShifts.reduce((acc, s) => acc + parseShiftHours(s.startTime, s.endTime), 0);

  // MOD coverage metrics
  const daysWithMod = weekDays.filter(d => {
    return shifts.some(s => s.date === d.dateStr && s.isManagerOnDuty);
  });
  const modCompliancePct = Math.round((daysWithMod.length / 7) * 100);

  // Week Navigation
  const handlePrevWeek = () => {
    const [y, m, d] = currentWeekStart.split('-').map(Number);
    const date = new Date(y, m - 1, d - 7);
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dt = String(date.getDate()).padStart(2, '0');
    setCurrentWeekStart(`${yr}-${mo}-${dt}`);
  };

  const handleNextWeek = () => {
    const [y, m, d] = currentWeekStart.split('-').map(Number);
    const date = new Date(y, m - 1, d + 7);
    const yr = date.getFullYear();
    const mo = String(date.getMonth() + 1).padStart(2, '0');
    const dt = String(date.getDate()).padStart(2, '0');
    setCurrentWeekStart(`${yr}-${mo}-${dt}`);
  };

  const handleResetThisWeek = () => {
    setCurrentWeekStart('2026-09-14');
  };

  // Quick assign a staff member to a date
  const handleQuickAssignStaff = (employeeId: string, dateStr: string) => {
    const emp = employees.find(e => e.id === employeeId);
    if (!emp) return;

    // Check if employee already has shift on that day
    const alreadyWorking = shifts.some(s => s.employeeId === emp.id && s.date === dateStr);

    const smart = getSmartRoleShift(emp);
    onAddShift({
      employeeId: emp.id,
      employeeName: emp.name,
      date: dateStr,
      startTime: smart.startTime,
      endTime: smart.endTime,
      zone: smart.zone,
      isManagerOnDuty: smart.isMod
    });
  };

  // 1-Click assign MOD to a date lacking coverage
  const handleQuickAssignMod = (dateStr: string) => {
    // Pick qualified manager (Marcus first, or Elena)
    const manager = employees.find(e => e.isManagerQualified) || employees[0];
    if (!manager) return;

    // Check if manager is already scheduled on this day
    const existingManagerShift = shifts.find(s => s.date === dateStr && s.employeeId === manager.id);
    if (existingManagerShift && onUpdateShift) {
      onUpdateShift({ ...existingManagerShift, isManagerOnDuty: true });
    } else {
      onAddShift({
        employeeId: manager.id,
        employeeName: manager.name,
        date: dateStr,
        startTime: '08:30 AM',
        endTime: '05:30 PM',
        zone: 'Sales Floor - Footwear',
        isManagerOnDuty: true
      });
    }
  };

  // Toggle MOD on a shift
  const handleToggleMod = (shift: Shift) => {
    if (onUpdateShift) {
      onUpdateShift({ ...shift, isManagerOnDuty: !shift.isManagerOnDuty });
    }
  };

  // Drag and drop handlers
  const handleDragStartStaff = (e: React.DragEvent, emp: Employee) => {
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'STAFF', employeeId: emp.id }));
    e.dataTransfer.effectAllowed = 'copy';
    setDraggedItem({ type: 'STAFF', id: emp.id, name: emp.name });
  };

  const handleDragStartShift = (e: React.DragEvent, shift: Shift) => {
    e.stopPropagation();
    e.dataTransfer.setData('application/json', JSON.stringify({ type: 'SHIFT', shiftId: shift.id, fromDate: shift.date }));
    e.dataTransfer.effectAllowed = 'move';
    setDraggedItem({ type: 'SHIFT', id: shift.id, name: shift.employeeName });
  };

  const handleDragOver = (e: React.DragEvent, dateStr: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'copy';
    if (dragOverDate !== dateStr) {
      setDragOverDate(dateStr);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setDragOverDate(null);
  };

  const handleDrop = (e: React.DragEvent, targetDateStr: string) => {
    e.preventDefault();
    setDragOverDate(null);
    setDraggedItem(null);

    try {
      const dataStr = e.dataTransfer.getData('application/json');
      if (!dataStr) return;
      const data = JSON.parse(dataStr);

      if (data.type === 'STAFF' && data.employeeId) {
        handleQuickAssignStaff(data.employeeId, targetDateStr);
      } else if (data.type === 'SHIFT' && data.shiftId) {
        const shiftToMove = shifts.find(s => s.id === data.shiftId);
        if (shiftToMove && shiftToMove.date !== targetDateStr && onUpdateShift) {
          onUpdateShift({ ...shiftToMove, date: targetDateStr });
        }
      }
    } catch (err) {
      console.error('Drag drop error:', err);
    }
  };

  // Modal open helpers
  const handleOpenCreateModal = (dateStr?: string, empId?: string) => {
    setEditingShift(null);
    setShiftDate(dateStr || '2026-09-18');
    const emp = employees.find(e => e.id === (empId || shiftEmployeeId)) || employees[0];
    if (emp) {
      setShiftEmployeeId(emp.id);
      const smart = getSmartRoleShift(emp);
      setShiftStartTime(smart.startTime);
      setShiftEndTime(smart.endTime);
      setShiftZone(smart.zone);
      setIsMod(smart.isMod);
    }
    setIsShiftModalOpen(true);
  };

  const handleOpenEditModal = (shift: Shift) => {
    setEditingShift(shift);
    setShiftEmployeeId(shift.employeeId);
    setShiftDate(shift.date);
    setShiftStartTime(shift.startTime);
    setShiftEndTime(shift.endTime);
    setShiftZone(shift.zone);
    setIsMod(shift.isManagerOnDuty);
    setIsShiftModalOpen(true);
  };

  const handleSaveShiftModal = (e: React.FormEvent) => {
    e.preventDefault();
    const emp = employees.find(e => e.id === shiftEmployeeId);
    if (!emp) return;

    if (editingShift && onUpdateShift) {
      onUpdateShift({
        ...editingShift,
        employeeId: emp.id,
        employeeName: emp.name,
        date: shiftDate,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        zone: shiftZone,
        isManagerOnDuty: isMod
      });
    } else {
      onAddShift({
        employeeId: emp.id,
        employeeName: emp.name,
        date: shiftDate,
        startTime: shiftStartTime,
        endTime: shiftEndTime,
        zone: shiftZone,
        isManagerOnDuty: isMod
      });
    }

    setIsShiftModalOpen(false);
    setEditingShift(null);
  };

  const handleDeleteShiftFromModal = () => {
    if (editingShift && onDeleteShift) {
      onDeleteShift(editingShift.id);
      setIsShiftModalOpen(false);
      setEditingShift(null);
    }
  };

  const pendingLeaves = leaveRequests.filter(l => l.status === 'Pending');

  return (
    <div className="space-y-6">
      {/* Mandate Banner: High-Performance Culture & MOD Coverage */}
      <div className="bg-slate-900 text-white p-5 rounded-2xl border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <UserCheck className="w-3.5 h-3.5" />
              HR & People Operations Leadership
            </span>
            <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2.5 py-0.5 rounded-full font-medium flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              Continuous MOD Policy: {modCompliancePct}% Week Coverage
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            Schedule staff to maximize floor sales, lead service by example, and actively manage weekly shift allocations along the Career Ladder.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap shrink-0">
          <button
            id="btn-export-schedule-pdf-header"
            onClick={() => setIsExportModalOpen(true)}
            className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer border border-slate-700 hover:border-slate-600"
            title="Export shift schedule as printable PDF"
          >
            <FileDown className="w-4 h-4 text-amber-400" />
            <span>Export Schedule PDF</span>
          </button>

          <button
            id="btn-assign-store-shift"
            onClick={() => handleOpenCreateModal()}
            className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>Assign Store Shift</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          id="tab-schedule"
          onClick={() => setActiveTab('schedule')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'schedule'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Staff Scheduling & Weekly Calendar</span>
        </button>

        <button
          id="tab-performance"
          onClick={() => setActiveTab('performance')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'performance'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          <span>Performance & Career Ladder</span>
        </button>

        <button
          id="tab-leaves"
          onClick={() => setActiveTab('leaves')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'leaves'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Leave Requests ({pendingLeaves.length} Pending)</span>
        </button>

        <button
          id="tab-directory"
          onClick={() => setActiveTab('directory')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 shrink-0 ${
            activeTab === 'directory'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Team Directory & Training ({employees.length})</span>
        </button>
      </div>

      {/* TAB 1: SCHEDULE & VISUAL WEEKLY CALENDAR */}
      {activeTab === 'schedule' && (
        <div className="space-y-4">
          {/* Policy & Coverage Banner */}
          <div className="bg-amber-50/70 border border-amber-200 p-4 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
              <div>
                <h4 className="text-sm font-bold text-amber-900 flex items-center gap-2">
                  Store Policy: Continuous Manager On Duty (MOD) Presence
                  {modCompliancePct === 100 ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                      100% Compliant (7/7 Days)
                    </span>
                  ) : (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 border border-amber-300">
                      {daysWithMod.length}/7 Days Covered
                    </span>
                  )}
                </h4>
                <p className="text-xs text-amber-800 mt-0.5 leading-relaxed">
                  Ensure a qualified manager is always on duty on the sales floor. When the Store Manager handles administrative duties, the Assistant Manager assumes MOD responsibility.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 shrink-0 text-xs self-start md:self-center">
              <div className="bg-white px-3 py-1.5 rounded-xl border border-amber-200 text-slate-700 font-medium">
                Week Total: <span className="font-bold text-slate-900">{totalWeeklyHours.toFixed(1)} hrs</span> ({weekShifts.length} shifts)
              </div>
            </div>
          </div>

          {/* Quick-Assign & Drag Staff Palette Dock */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-4 h-4 text-amber-600" />
                  Staff Assignment Palette (Drag & Drop or Click-to-Assign)
                </span>
                <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded-full font-medium">
                  {employees.length} Store Team Members
                </span>
              </div>

              {selectedStaffForAssign ? (
                <div className="flex items-center gap-2 text-xs">
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 px-2.5 py-1 rounded-lg font-bold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Assigning: {selectedStaffForAssign.name} (Click any day to place)
                  </span>
                  <button
                    onClick={() => setSelectedStaffForAssign(null)}
                    className="text-slate-500 hover:text-slate-800 p-1 rounded-lg hover:bg-slate-100"
                    title="Cancel staff selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              ) : (
                <span className="text-xs text-slate-500 hidden sm:inline flex items-center gap-1">
                  💡 Drag an associate to a day, or click to select and tap a day column.
                </span>
              )}
            </div>

            {/* Employee Chips Palette */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
              {employees.map((emp) => {
                const isSelected = selectedStaffForAssign?.id === emp.id;
                const empWeekShifts = weekShifts.filter(s => s.employeeId === emp.id);
                const empWeekHours = empWeekShifts.reduce((acc, s) => acc + parseShiftHours(s.startTime, s.endTime), 0);

                return (
                  <div
                    key={emp.id}
                    id={`palette-staff-${emp.id}`}
                    draggable
                    onDragStart={(e) => handleDragStartStaff(e, emp)}
                    onDragEnd={() => { setDraggedItem(null); setDragOverDate(null); }}
                    onClick={() => setSelectedStaffForAssign(isSelected ? null : emp)}
                    className={`p-2.5 rounded-xl border transition-all cursor-grab active:cursor-grabbing select-none text-left relative group ${
                      isSelected
                        ? 'bg-amber-50 border-amber-400 shadow-sm ring-2 ring-amber-400/40'
                        : 'bg-slate-50/70 hover:bg-white hover:border-slate-300 border-slate-200'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {emp.name}
                      </span>
                      <GripVertical className="w-3.5 h-3.5 text-slate-400 opacity-60 group-hover:opacity-100 shrink-0" />
                    </div>

                    <div className="flex items-center justify-between gap-1 mt-1 text-[11px] text-slate-500">
                      <span className="truncate">{emp.role}</span>
                      {emp.isManagerQualified && (
                        <span className="shrink-0 text-[10px] font-bold text-amber-700 bg-amber-100 px-1 py-0.2 rounded" title="Manager Qualified">
                          MOD
                        </span>
                      )}
                    </div>

                    <div className="mt-2 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[10px] text-slate-600">
                      <span className="font-semibold">{empWeekShifts.length} shifts</span>
                      <span>{empWeekHours.toFixed(1)}h</span>
                    </div>

                    {isSelected && (
                      <div className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-amber-500 text-white rounded-full flex items-center justify-center text-[10px] font-bold shadow-xs">
                        ✓
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Calendar Navigation, View Mode & Filters Bar */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            {/* Week Navigation */}
            <div className="flex items-center gap-2">
              <button
                id="btn-prev-week"
                onClick={handlePrevWeek}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Previous Week"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-900 block">
                  {formatWeekRange(currentWeekStart)}
                </span>
                <span className="text-[10px] text-slate-500 font-medium">
                  {currentWeekStart === '2026-09-14' ? 'Current Work Week (Week 38)' : 'Custom Roster Period'}
                </span>
              </div>

              <button
                id="btn-next-week"
                onClick={handleNextWeek}
                className="p-2 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 transition-colors"
                title="Next Week"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              {currentWeekStart !== '2026-09-14' && (
                <button
                  onClick={handleResetThisWeek}
                  className="px-2.5 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-semibold transition-colors"
                >
                  Jump to Current Week
                </button>
              )}
            </div>

            {/* View Switcher & Zone Filter */}
            <div className="flex items-center gap-2.5 flex-wrap">
              {/* Zone Filter */}
              <div className="flex items-center gap-1.5 text-xs text-slate-600">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  id="zone-filter-select"
                  value={zoneFilter}
                  onChange={(e) => setZoneFilter(e.target.value)}
                  className="px-2.5 py-1.5 text-xs rounded-xl border border-slate-200 bg-white font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-slate-400"
                >
                  <option value="all">All Zones ({weekShifts.length})</option>
                  <option value="Sales Floor - Footwear">Footwear</option>
                  <option value="Sales Floor - Apparel">Apparel</option>
                  <option value="Cash Desk">Cash Desk</option>
                  <option value="Stockroom / Receiving">Stockroom / Receiving</option>
                  <option value="Visual Merchandising">Visual Merchandising</option>
                </select>
              </div>

              {/* View Mode Toggle Buttons */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-slate-200 text-xs">
                <button
                  id="view-grid-btn"
                  onClick={() => setCalendarView('grid')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    calendarView === 'grid'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CalendarDays className="w-3.5 h-3.5" />
                  <span>7-Day Grid</span>
                </button>

                <button
                  id="view-matrix-btn"
                  onClick={() => setCalendarView('matrix')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    calendarView === 'matrix'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
                  <span>Staff Matrix</span>
                </button>

                <button
                  id="view-table-btn"
                  onClick={() => setCalendarView('table')}
                  className={`px-3 py-1.5 rounded-lg font-bold flex items-center gap-1.5 transition-all ${
                    calendarView === 'table'
                      ? 'bg-white text-slate-900 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <TableIcon className="w-3.5 h-3.5" />
                  <span>Daily Roster</span>
                </button>
              </div>

              {/* PDF Export Action Button in Schedule Toolbar */}
              <button
                id="btn-export-schedule-pdf-toolbar"
                onClick={() => setIsExportModalOpen(true)}
                className="px-3.5 py-1.5 rounded-xl bg-slate-900 hover:bg-slate-800 active:bg-slate-950 text-white font-bold text-xs flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                title="Export schedule as PDF for printing and staff notice board"
              >
                <FileDown className="w-3.5 h-3.5 text-amber-400" />
                <span>Export PDF</span>
              </button>
            </div>
          </div>

          {/* VIEW 1: 7-DAY CALENDAR GRID */}
          {calendarView === 'grid' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="overflow-x-auto pb-2">
                <div className="min-w-[1020px] p-4">
                  {/* 7 Columns Grid */}
                  <div className="grid grid-cols-7 gap-3">
                    {weekDays.map((day) => {
                      const dayShifts = filteredWeekShifts.filter(s => s.date === day.dateStr);
                      const dayMod = dayShifts.find(s => s.isManagerOnDuty);
                      const isDragOver = dragOverDate === day.dateStr;
                      const dayHours = dayShifts.reduce((acc, s) => acc + parseShiftHours(s.startTime, s.endTime), 0);

                      return (
                        <div
                          key={day.dateStr}
                          id={`calendar-col-${day.dateStr}`}
                          onDragOver={(e) => handleDragOver(e, day.dateStr)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, day.dateStr)}
                          className={`rounded-2xl border flex flex-col transition-all min-h-[480px] ${
                            isDragOver
                              ? 'bg-amber-50/60 border-amber-400 ring-2 ring-amber-400/40'
                              : day.isToday
                              ? 'bg-slate-50/40 border-amber-300 ring-1 ring-amber-200'
                              : 'bg-slate-50/30 border-slate-200'
                          }`}
                        >
                          {/* Day Column Header */}
                          <div className={`p-3 border-b rounded-t-2xl transition-colors ${
                            day.isToday ? 'bg-amber-50/80 border-amber-200' : 'bg-white border-slate-100'
                          }`}>
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-1.5">
                                <span className="font-extrabold text-sm text-slate-900">
                                  {day.dayShort}
                                </span>
                                <span className="text-xs font-semibold text-slate-500">
                                  {day.monthShort} {day.dayNum}
                                </span>
                              </div>

                              {day.isToday ? (
                                <span className="text-[10px] font-extrabold bg-amber-500 text-slate-950 px-1.5 py-0.2 rounded-full uppercase tracking-wider">
                                  Today
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleOpenCreateModal(day.dateStr)}
                                  className="p-1 rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors"
                                  title={`Add shift on ${day.dayFull}`}
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                </button>
                              )}
                            </div>

                            {/* MOD Status Pill */}
                            <div className="mt-2 flex items-center justify-between gap-1">
                              {dayMod ? (
                                <span 
                                  className="text-[10px] font-bold text-emerald-800 bg-emerald-100/90 border border-emerald-200/80 px-2 py-0.5 rounded-full flex items-center gap-1 truncate"
                                  title={`MOD Assigned: ${dayMod.employeeName}`}
                                >
                                  <ShieldCheck className="w-3 h-3 text-emerald-600 shrink-0" />
                                  <span className="truncate">{dayMod.employeeName.split(' ')[0]} (MOD)</span>
                                </span>
                              ) : (
                                <button
                                  onClick={() => handleQuickAssignMod(day.dateStr)}
                                  className="text-[10px] font-bold text-amber-800 bg-amber-100/90 hover:bg-amber-200 border border-amber-300 px-2 py-0.5 rounded-full flex items-center gap-1 transition-colors"
                                  title="No qualified MOD scheduled! Click to assign Manager On Duty"
                                >
                                  <AlertCircle className="w-3 h-3 text-amber-600 shrink-0" />
                                  <span>+ Assign MOD</span>
                                </button>
                              )}

                              <span className="text-[10px] font-semibold text-slate-500">
                                {dayHours.toFixed(1)}h
                              </span>
                            </div>
                          </div>

                          {/* Column Shift Cards Container */}
                          <div className="p-2 space-y-2 flex-1 flex flex-col justify-between">
                            <div className="space-y-2">
                              {dayShifts.map((shift) => {
                                const zoneInfo = ZONE_CONFIG[shift.zone] || ZONE_CONFIG['Sales Floor - Footwear'];

                                return (
                                  <div
                                    key={shift.id}
                                    id={`shift-card-${shift.id}`}
                                    draggable
                                    onDragStart={(e) => handleDragStartShift(e, shift)}
                                    onDragEnd={() => { setDraggedItem(null); setDragOverDate(null); }}
                                    className={`p-2.5 rounded-xl border bg-white shadow-2xs hover:shadow-xs transition-all cursor-grab active:cursor-grabbing group relative ${
                                      shift.isManagerOnDuty ? 'border-amber-300 ring-1 ring-amber-100' : 'border-slate-200'
                                    }`}
                                  >
                                    <div className="flex items-start justify-between gap-1">
                                      <div>
                                        <p className="text-xs font-bold text-slate-900 leading-tight">
                                          {shift.employeeName}
                                        </p>
                                        <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                                          <span>{shift.startTime} – {shift.endTime}</span>
                                        </div>
                                      </div>

                                      <GripVertical className="w-3.5 h-3.5 text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity shrink-0" />
                                    </div>

                                    {/* Zone & MOD Pills */}
                                    <div className="mt-2 flex items-center justify-between gap-1 flex-wrap">
                                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md border flex items-center gap-1 ${zoneInfo.bg} ${zoneInfo.border}`}>
                                        <span className={`w-1.5 h-1.5 rounded-full ${zoneInfo.dot}`}></span>
                                        <span>{zoneInfo.label}</span>
                                      </span>

                                      {shift.isManagerOnDuty && (
                                        <span 
                                          className="text-[9px] font-extrabold text-amber-900 bg-amber-100 border border-amber-300 px-1.5 py-0.2 rounded-md flex items-center gap-0.5"
                                          title="Designated Manager On Duty"
                                        >
                                          <ShieldCheck className="w-2.5 h-2.5 text-amber-600" />
                                          MOD
                                        </span>
                                      )}
                                    </div>

                                    {/* Quick Actions (Hover) */}
                                    <div className="mt-2 pt-1.5 border-t border-slate-100 flex items-center justify-between text-[11px] opacity-0 group-hover:opacity-100 transition-opacity">
                                      <button
                                        onClick={(e) => { e.stopPropagation(); handleToggleMod(shift); }}
                                        className={`p-1 rounded hover:bg-slate-100 transition-colors ${
                                          shift.isManagerOnDuty ? 'text-amber-600 font-bold' : 'text-slate-400 hover:text-slate-700'
                                        }`}
                                        title={shift.isManagerOnDuty ? 'Remove MOD designation' : 'Designate as MOD'}
                                      >
                                        <ShieldCheck className="w-3.5 h-3.5" />
                                      </button>

                                      <div className="flex items-center gap-1">
                                        <button
                                          onClick={(e) => { e.stopPropagation(); handleOpenEditModal(shift); }}
                                          className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100"
                                          title="Edit Shift"
                                        >
                                          <Edit3 className="w-3 h-3" />
                                        </button>
                                        {onDeleteShift && (
                                          <button
                                            onClick={(e) => { e.stopPropagation(); onDeleteShift(shift.id); }}
                                            className="p-1 rounded text-rose-400 hover:text-rose-600 hover:bg-rose-50"
                                            title="Delete Shift"
                                          >
                                            <Trash2 className="w-3 h-3" />
                                          </button>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                );
                              })}

                              {dayShifts.length === 0 && (
                                <div className="py-8 text-center text-slate-400 text-xs border border-dashed border-slate-200 rounded-xl bg-white/50">
                                  No shifts assigned
                                </div>
                              )}
                            </div>

                            {/* Drop & Quick Assign Target Button */}
                            <div className="mt-2 pt-2 border-t border-slate-200/60">
                              {selectedStaffForAssign ? (
                                <button
                                  id={`btn-quick-assign-${day.dateStr}`}
                                  onClick={() => handleQuickAssignStaff(selectedStaffForAssign.id, day.dateStr)}
                                  className="w-full py-2 px-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 text-xs font-bold transition-all shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                                >
                                  <Plus className="w-3.5 h-3.5" />
                                  <span>+ Assign {selectedStaffForAssign.name.split(' ')[0]}</span>
                                </button>
                              ) : (
                                <button
                                  onClick={() => handleOpenCreateModal(day.dateStr)}
                                  className="w-full py-1.5 px-2 rounded-xl border border-dashed border-slate-300 hover:border-slate-400 hover:bg-white text-slate-500 hover:text-slate-800 text-[11px] font-semibold transition-all flex items-center justify-center gap-1"
                                >
                                  <Plus className="w-3 h-3" />
                                  <span>Add Shift</span>
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* VIEW 2: STAFF ROSTER MATRIX VIEW */}
          {calendarView === 'matrix' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Weekly Staff Roster Matrix (Staff × 7 Days)</h3>
                  <p className="text-xs text-slate-500">Click any empty slot to instantly assign shift for that employee.</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                  {employees.length} Staff Members
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 uppercase text-[11px] font-bold text-slate-600 border-b border-slate-200">
                      <th className="py-3 px-4 min-w-[200px]">Team Associate</th>
                      {weekDays.map((day) => (
                        <th key={day.dateStr} className={`py-3 px-3 text-center min-w-[125px] ${day.isToday ? 'bg-amber-50 text-amber-900' : ''}`}>
                          <div>{day.dayShort} {day.dayNum}</div>
                          <span className="text-[10px] font-normal lowercase">{day.monthShort}</span>
                        </th>
                      ))}
                      <th className="py-3 px-3 text-right">Week Total</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {employees.map((emp) => {
                      const empWeekShifts = shifts.filter(s => s.employeeId === emp.id && weekDates.includes(s.date));
                      const empWeekHours = empWeekShifts.reduce((acc, s) => acc + parseShiftHours(s.startTime, s.endTime), 0);

                      return (
                        <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                          <td className="py-3 px-4">
                            <div className="flex items-center gap-2.5">
                              <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center font-bold text-xs shrink-0">
                                {emp.name.split(' ').map(n => n[0]).join('')}
                              </div>
                              <div>
                                <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                                  {emp.name}
                                  {emp.isManagerQualified && (
                                    <span className="text-[9px] bg-amber-100 text-amber-800 font-bold px-1.5 py-0.2 rounded border border-amber-300">
                                      MOD
                                    </span>
                                  )}
                                </div>
                                <span className="text-[11px] text-slate-500">{emp.role}</span>
                              </div>
                            </div>
                          </td>

                          {weekDays.map((day) => {
                            const shift = empWeekShifts.find(s => s.date === day.dateStr);

                            return (
                              <td 
                                key={day.dateStr} 
                                className={`py-2.5 px-2 text-center align-middle ${day.isToday ? 'bg-amber-50/40' : ''}`}
                              >
                                {shift ? (
                                  <div 
                                    id={`matrix-shift-${shift.id}`}
                                    draggable
                                    onDragStart={(e) => handleDragStartShift(e, shift)}
                                    onClick={() => handleOpenEditModal(shift)}
                                    className="p-1.5 rounded-lg border border-slate-200 bg-white hover:border-amber-400 hover:shadow-xs transition-all cursor-pointer text-left"
                                  >
                                    <div className="flex items-center justify-between gap-1 text-[10px] font-bold text-slate-800">
                                      <span className="truncate">{shift.startTime.split(' ')[0]}–{shift.endTime.split(' ')[0]}</span>
                                      {shift.isManagerOnDuty && (
                                        <ShieldCheck className="w-3 h-3 text-amber-600 shrink-0" />
                                      )}
                                    </div>
                                    <span className="text-[9px] text-slate-500 block truncate mt-0.5">
                                      {shift.zone.replace('Sales Floor - ', '')}
                                    </span>
                                  </div>
                                ) : (
                                  <button
                                    onClick={() => handleQuickAssignStaff(emp.id, day.dateStr)}
                                    className="w-full py-2 rounded-lg border border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-100 text-slate-400 hover:text-slate-700 text-[10px] font-semibold transition-all"
                                    title={`Click to schedule ${emp.name} on ${day.dayFull}`}
                                  >
                                    + Assign
                                  </button>
                                )}
                              </td>
                            );
                          })}

                          <td className="py-3 px-3 text-right font-bold text-slate-900 text-xs">
                            {empWeekHours.toFixed(1)} hrs
                            <span className="block text-[10px] font-normal text-slate-500">
                              {empWeekShifts.length} shifts
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* VIEW 3: TODAY'S DETAILED ROSTER TABLE */}
          {calendarView === 'table' && (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
              <div className="p-4 border-b border-slate-100 flex items-center justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-sm">Today's Sales Floor & Operational Roster</h3>
                  <p className="text-xs text-slate-500">Friday, September 18, 2026</p>
                </div>
                <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                  Full Coverage Confirmed
                </span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-sm">
                  <thead>
                    <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                      <th className="py-3 px-4">Team Member</th>
                      <th className="py-3 px-4">Shift Hours</th>
                      <th className="py-3 px-4">Assigned Floor Zone</th>
                      <th className="py-3 px-4">Leadership Responsibility</th>
                      <th className="py-3 px-4 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {shifts.filter(s => s.date === '2026-09-18').map((s) => (
                      <tr key={s.id} className="hover:bg-slate-50/70 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-semibold text-slate-900">{s.employeeName}</span>
                        </td>

                        <td className="py-3 px-4">
                          <div className="flex items-center gap-1.5 text-slate-800 text-xs font-medium">
                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                            <span>{s.startTime} – {s.endTime}</span>
                          </div>
                        </td>

                        <td className="py-3 px-4">
                          <span className="inline-block px-2.5 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-800">
                            {s.zone}
                          </span>
                        </td>

                        <td className="py-3 px-4">
                          {s.isManagerOnDuty ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/20 text-amber-800 border border-amber-500/30">
                              <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                              Manager On Duty (MOD)
                            </span>
                          ) : (
                            <span className="text-xs text-slate-500">Sales Floor Execution</span>
                          )}
                        </td>

                        <td className="py-3 px-4 text-right">
                          <span className="text-xs font-medium text-emerald-600 flex items-center justify-end gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active On Floor
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PERFORMANCE & CAREER LADDER */}
      {activeTab === 'performance' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-base">
              High-Performance Culture & Career Ladder Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Clear expectations, sales per hour productivity, prompt feedback, and development with District Manager.
            </p>

            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
              {employees.map((emp) => (
                <div key={emp.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{emp.name}</h4>
                      <p className="text-xs text-slate-500">{emp.role} • {emp.department}</p>
                    </div>
                    <span className="text-xs font-bold px-2.5 py-1 rounded-full bg-slate-900 text-amber-400">
                      Score: {emp.performanceScore}/100
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500">Sales / Hour:</span>
                      <p className="font-bold text-slate-900 mt-0.5">${emp.salesPerHour}/hr</p>
                    </div>
                    <div className="p-2.5 rounded-lg bg-white border border-slate-200">
                      <span className="text-slate-500">Conversion Rate:</span>
                      <p className="font-bold text-slate-900 mt-0.5">{emp.conversionRate}%</p>
                    </div>
                  </div>

                  <div className="bg-white p-3 rounded-xl border border-slate-200">
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Manager Coaching Feedback:
                    </span>
                    <p className="text-xs text-slate-700 mt-1 italic">
                      "{emp.recentFeedback}"
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: LEAVE MANAGEMENT */}
      {activeTab === 'leaves' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-slate-900 text-base">Employee Leave Requests & Approvals</h3>
              <p className="text-xs text-slate-500">HR policy compliance and coverage balancing</p>
            </div>
          </div>

          <div className="space-y-3">
            {leaveRequests.map((leave) => (
              <div key={leave.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{leave.employeeName}</span>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-slate-200 text-slate-700">
                      {leave.leaveType}
                    </span>
                    <span className={`text-[11px] font-bold px-2 py-0.5 rounded-full ${
                      leave.status === 'Approved'
                        ? 'bg-emerald-100 text-emerald-800'
                        : leave.status === 'Declined'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {leave.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Dates: <span className="font-medium text-slate-800">{leave.startDate}</span> to <span className="font-medium text-slate-800">{leave.endDate}</span>
                  </p>
                  <p className="text-xs text-slate-500 mt-0.5">Reason: {leave.reason}</p>
                </div>

                {leave.status === 'Pending' && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => onUpdateLeaveStatus(leave.id, 'Approved')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Approve
                    </button>
                    <button
                      onClick={() => onUpdateLeaveStatus(leave.id, 'Declined')}
                      className="px-3 py-1.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs transition-colors flex items-center gap-1"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Decline
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: TEAM DIRECTORY & TRAINING */}
      {activeTab === 'directory' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Store Personnel & Training Compliance Matrix</h3>
            <p className="text-xs text-slate-500">
              Foundational & Seasonal Brand knowledge, Loss Prevention, and Cash Integrity certification
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs font-semibold text-slate-500 uppercase border-b border-slate-200">
                  <th className="py-3 px-4">Employee</th>
                  <th className="py-3 px-4">Role & Dept</th>
                  <th className="py-3 px-4 text-center">Foundational Brand</th>
                  <th className="py-3 px-4 text-center">Seasonal Knowledge</th>
                  <th className="py-3 px-4 text-center">Loss Prevention</th>
                  <th className="py-3 px-4 text-center">Cash Register</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {employees.map((emp) => (
                  <tr key={emp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="py-3 px-4">
                      <span className="font-semibold text-slate-900">{emp.name}</span>
                      <div className="text-xs text-slate-500">{emp.email}</div>
                    </td>

                    <td className="py-3 px-4">
                      <span className="text-slate-800 font-medium">{emp.role}</span>
                      <div className="text-xs text-slate-400">{emp.department}</div>
                    </td>

                    <td className="py-3 px-4 text-center">
                      {emp.trainingCompleted.foundationalBrand ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                          <Check className="w-4 h-4 mr-0.5" /> Certified
                        </span>
                      ) : (
                        <span className="text-xs text-rose-500 font-medium">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {emp.trainingCompleted.seasonalBrandKnowledge ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                          <Check className="w-4 h-4 mr-0.5" /> Certified
                        </span>
                      ) : (
                        <span className="text-xs text-amber-600 font-medium">In Progress</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {emp.trainingCompleted.lossPrevention ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                          <Check className="w-4 h-4 mr-0.5" /> Certified
                        </span>
                      ) : (
                        <span className="text-xs text-rose-500 font-medium">Pending</span>
                      )}
                    </td>

                    <td className="py-3 px-4 text-center">
                      {emp.trainingCompleted.cashRegisterIntegrity ? (
                        <span className="inline-flex items-center text-xs font-semibold text-emerald-600">
                          <Check className="w-4 h-4 mr-0.5" /> Certified
                        </span>
                      ) : (
                        <span className="text-xs text-slate-400">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add / Edit Shift Modal */}
      {isShiftModalOpen && (
        <div className="fixed inset-0 bg-slate-950/60 z-50 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-xl border border-slate-200 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  {editingShift ? 'Edit Floor Shift' : 'Assign Staff Shift'}
                </h3>
                <p className="text-xs text-slate-500">
                  {editingShift ? 'Modify shift hours, assigned floor zone, or MOD designation.' : 'Schedule an associate to a floor zone with appropriate coverage hours.'}
                </p>
              </div>
              <button
                onClick={() => { setIsShiftModalOpen(false); setEditingShift(null); }}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveShiftModal} className="space-y-4">
              {/* Employee Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Team Member *</label>
                <select
                  id="modal-employee-select"
                  value={shiftEmployeeId}
                  onChange={(e) => {
                    setShiftEmployeeId(e.target.value);
                    const emp = employees.find(x => x.id === e.target.value);
                    if (emp && !editingShift) {
                      const smart = getSmartRoleShift(emp);
                      setShiftStartTime(smart.startTime);
                      setShiftEndTime(smart.endTime);
                      setShiftZone(smart.zone);
                      setIsMod(smart.isMod);
                    }
                  }}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500 bg-white"
                >
                  {employees.map(e => (
                    <option key={e.id} value={e.id}>
                      {e.name} — {e.role} {e.isManagerQualified ? '(MOD Qualified)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Date Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Shift Date *</label>
                <div className="grid grid-cols-7 gap-1 text-center">
                  {weekDays.map(d => (
                    <button
                      key={d.dateStr}
                      type="button"
                      onClick={() => setShiftDate(d.dateStr)}
                      className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-colors ${
                        shiftDate === d.dateStr
                          ? 'bg-slate-900 text-white border-slate-900 shadow-xs'
                          : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                      }`}
                    >
                      <span className="block text-[10px] text-slate-400">{d.dayShort}</span>
                      {d.dayNum}
                    </button>
                  ))}
                </div>
                <input
                  type="date"
                  value={shiftDate}
                  onChange={(e) => setShiftDate(e.target.value)}
                  className="mt-2 w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300"
                />
              </div>

              {/* Quick Shift Presets */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Quick Hours Presets</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
                  {SHIFT_PRESETS.map((preset) => (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setShiftStartTime(preset.start);
                        setShiftEndTime(preset.end);
                      }}
                      className="text-left p-2 rounded-xl border border-slate-200 bg-slate-50/70 hover:bg-amber-50 hover:border-amber-300 transition-colors group"
                    >
                      <span className="font-bold text-slate-900 text-[11px] block group-hover:text-amber-900">
                        {preset.label}
                      </span>
                      <span className="text-[10px] text-slate-500 block">
                        {preset.start.split(' ')[0]} – {preset.end.split(' ')[0]}
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Start and End Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Start Time</label>
                  <input
                    type="text"
                    value={shiftStartTime}
                    onChange={(e) => setShiftStartTime(e.target.value)}
                    placeholder="e.g. 08:30 AM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">End Time</label>
                  <input
                    type="text"
                    value={shiftEndTime}
                    onChange={(e) => setShiftEndTime(e.target.value)}
                    placeholder="e.g. 05:30 PM"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-slate-400"
                  />
                </div>
              </div>

              {/* Floor Zone */}
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Floor Zone Assignment</label>
                <select
                  id="modal-zone-select"
                  value={shiftZone}
                  onChange={(e) => setShiftZone(e.target.value as Shift['zone'])}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-1 focus:ring-slate-400"
                >
                  <option value="Sales Floor - Footwear">Sales Floor - Footwear</option>
                  <option value="Sales Floor - Apparel">Sales Floor - Apparel</option>
                  <option value="Cash Desk">Cash Desk</option>
                  <option value="Stockroom / Receiving">Stockroom / Receiving</option>
                  <option value="Visual Merchandising">Visual Merchandising</option>
                </select>
              </div>

              {/* MOD Policy Checkbox */}
              <div className="p-3 bg-amber-50/50 rounded-xl border border-amber-200">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isMod}
                    onChange={(e) => setIsMod(e.target.checked)}
                    className="rounded text-amber-600 focus:ring-amber-500 w-4 h-4 cursor-pointer"
                  />
                  <span className="text-xs font-bold text-slate-900 flex items-center gap-1">
                    <ShieldCheck className="w-3.5 h-3.5 text-amber-700" />
                    Designate as Manager On Duty (MOD) for this shift
                  </span>
                </label>
                <p className="text-[11px] text-amber-900 mt-1 pl-6">
                  Fulfills store policy requirement for continuous floor leadership and customer focus.
                </p>
              </div>

              {/* Form Buttons */}
              <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                <div>
                  {editingShift && onDeleteShift && (
                    <button
                      type="button"
                      onClick={handleDeleteShiftFromModal}
                      className="px-3 py-2 rounded-xl text-rose-600 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Shift</span>
                    </button>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => { setIsShiftModalOpen(false); setEditingShift(null); }}
                    className="px-4 py-2 rounded-xl text-slate-600 hover:bg-slate-100 text-xs font-medium"
                  >
                    Cancel
                  </button>
                  <button
                    id="modal-submit-shift-btn"
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-all shadow-xs"
                  >
                    {editingShift ? 'Update Shift' : 'Save Shift to Schedule'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Export Schedule PDF Modal */}
      <ExportSchedulePdfModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        weekStart={currentWeekStart}
        weekDays={weekDays}
        employees={employees}
        shifts={shifts}
        currentZoneFilter={zoneFilter}
      />
    </div>
  );
};
