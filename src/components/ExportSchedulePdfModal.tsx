import React, { useState } from 'react';
import { 
  FileDown, 
  Printer, 
  X, 
  FileText, 
  Check, 
  ShieldCheck, 
  Calendar, 
  Clock, 
  Users, 
  CheckCircle2,
  Sparkles,
  Layers,
  Info
} from 'lucide-react';
import { Employee, Shift } from '../types';
import { generateSchedulePdf, ExportPdfOptions, ScheduleWeekDay } from '../utils/schedulePdfExport';

interface ExportSchedulePdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  weekStart: string;
  weekDays: ScheduleWeekDay[];
  employees: Employee[];
  shifts: Shift[];
  currentZoneFilter?: string;
}

export const ExportSchedulePdfModal: React.FC<ExportSchedulePdfModalProps> = ({
  isOpen,
  onClose,
  weekStart,
  weekDays,
  employees,
  shifts,
  currentZoneFilter = 'all'
}) => {
  const [layout, setLayout] = useState<'matrix-landscape' | 'daily-portrait'>('matrix-landscape');
  const [selectedZone, setSelectedZone] = useState<string>(currentZoneFilter);
  const [includeModPolicy, setIncludeModPolicy] = useState(true);
  const [includeSignatures, setIncludeSignatures] = useState(true);
  const [includeRules, setIncludeRules] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  if (!isOpen) return null;

  // Filtered shifts
  const weekDates = weekDays.map(d => d.dateStr);
  const relevantShifts = shifts.filter(s => {
    const isThisWeek = weekDates.includes(s.date);
    if (!isThisWeek) return false;
    if (selectedZone !== 'all' && s.zone !== selectedZone) return false;
    return true;
  });

  const totalHours = relevantShifts.reduce((acc, s) => {
    const parseTime = (t: string) => {
      const [time, modifier] = t.split(' ');
      let [hours, minutes] = time.split(':').map(Number);
      if (modifier === 'PM' && hours < 12) hours += 12;
      if (modifier === 'AM' && hours === 12) hours = 0;
      return hours + minutes / 60;
    };
    return acc + (parseTime(s.endTime) - parseTime(s.startTime));
  }, 0);

  const daysWithMod = weekDays.filter(d => 
    shifts.some(s => s.date === d.dateStr && s.isManagerOnDuty)
  );

  const handleDownloadPdf = () => {
    try {
      setIsExporting(true);
      const options: ExportPdfOptions = {
        weekStart,
        weekDays,
        employees,
        shifts,
        layout,
        zoneFilter: selectedZone,
        includeModPolicy,
        includeSignatures,
        includeRules,
        storeName: 'Nike Flagship Store',
        storeNumber: '#402'
      };

      const doc = generateSchedulePdf(options);
      const fileName = `Nike-Store-402-Staff-Roster-${weekDays[0]?.dateStr}-to-${weekDays[6]?.dateStr}-${layout === 'matrix-landscape' ? 'Matrix' : 'Daily'}.pdf`;
      doc.save(fileName);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3500);
    } catch (err) {
      console.error('PDF export failed:', err);
    } finally {
      setIsExporting(false);
    }
  };

  const handlePrint = () => {
    try {
      const options: ExportPdfOptions = {
        weekStart,
        weekDays,
        employees,
        shifts,
        layout,
        zoneFilter: selectedZone,
        includeModPolicy,
        includeSignatures,
        includeRules,
        storeName: 'Nike Flagship Store',
        storeNumber: '#402'
      };

      const doc = generateSchedulePdf(options);
      // Generate blob URL and open in print window
      const blob = doc.output('blob');
      const blobUrl = URL.createObjectURL(blob);
      const printWindow = window.open(blobUrl, '_blank');
      if (printWindow) {
        printWindow.focus();
      } else {
        // Fallback: save PDF directly if popup is blocked
        doc.save(`Nike-Store-402-Staff-Roster-${weekDays[0]?.dateStr}.pdf`);
      }
    } catch (err) {
      console.error('Print preview failed:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/70 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white w-full max-w-4xl rounded-3xl shadow-2xl border border-slate-200 flex flex-col max-h-[92vh] overflow-hidden">
        
        {/* Modal Header */}
        <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <FileDown className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-base text-white">Export Staff Shift Schedule</h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PDF Document
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Official Roster Document for physical notice boards, staff distribution & floor briefings
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Options & Preview */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          
          {/* Top Quick Status Pill */}
          <div className="bg-amber-50 border border-amber-200/80 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-800 shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">
                  Selected Work Week: {weekDays[0] ? `${weekDays[0].dayFull}, ${weekDays[0].monthShort} ${weekDays[0].dayNum}` : ''} – {weekDays[6] ? `${weekDays[6].dayFull}, ${weekDays[6].monthShort} ${weekDays[6].dayNum}` : ''}
                </h4>
                <p className="text-[11px] text-amber-800">
                  Store #402 • {relevantShifts.length} Assigned Shifts • {totalHours.toFixed(1)} Scheduled Hours
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <span className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border ${
                daysWithMod.length === 7 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                MOD Coverage: {daysWithMod.length}/7 Days ({Math.round((daysWithMod.length/7)*100)}%)
              </span>
            </div>
          </div>

          {/* Configuration Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Layout & Scope */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                1. Document Format & Layout
              </span>

              <div className="grid grid-cols-2 gap-3">
                {/* Landscape Matrix */}
                <button
                  id="pdf-layout-matrix"
                  type="button"
                  onClick={() => setLayout('matrix-landscape')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    layout === 'matrix-landscape'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center">
                      <Layers className="w-4 h-4" />
                    </div>
                    {layout === 'matrix-landscape' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Weekly Matrix (Landscape)</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Best for Staff Room Notice Boards. All associates on rows, 7 days on columns with zone tags & MOD stars.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-amber-700 bg-amber-100/70 px-2 py-0.5 rounded">
                    ★ Recommended
                  </span>
                </button>

                {/* Portrait Daily */}
                <button
                  id="pdf-layout-daily"
                  type="button"
                  onClick={() => setLayout('daily-portrait')}
                  className={`p-4 rounded-2xl border-2 text-left transition-all relative ${
                    layout === 'daily-portrait'
                      ? 'border-amber-500 bg-amber-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-white'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-8 h-8 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center">
                      <FileText className="w-4 h-4" />
                    </div>
                    {layout === 'daily-portrait' && (
                      <span className="w-5 h-5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-xs font-bold">
                        ✓
                      </span>
                    )}
                  </div>
                  <h5 className="text-xs font-bold text-slate-900">Chronological (Portrait)</h5>
                  <p className="text-[11px] text-slate-500 mt-1 leading-snug">
                    Day-by-day sequential breakdown. Detailed shift rows sorted chronologically from open to close.
                  </p>
                  <span className="mt-2 inline-block text-[10px] font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Daily Briefing Roster
                  </span>
                </button>
              </div>

              {/* Department / Zone Filter */}
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700 block">
                  Department / Floor Zone Scope:
                </label>
                <select
                  id="pdf-zone-scope-select"
                  value={selectedZone}
                  onChange={(e) => setSelectedZone(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 bg-white text-xs font-medium text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500/20 focus:border-amber-500"
                >
                  <option value="all">Entire Store (All Departments & Roles)</option>
                  <option value="Sales Floor - Footwear">Footwear Department</option>
                  <option value="Sales Floor - Apparel">Apparel Department</option>
                  <option value="Cash Desk">Cash Desk & Checkout</option>
                  <option value="Stockroom / Receiving">Stockroom & Operations</option>
                  <option value="Visual Merchandising">Visual Merchandising</option>
                </select>
                <p className="text-[11px] text-slate-500">
                  {selectedZone === 'all' 
                    ? `Exporting schedule for all ${employees.length} employees.`
                    : `Filtering export specifically for ${selectedZone}.`}
                </p>
              </div>
            </div>

            {/* Right Column: Inclusions & Notice Board Compliance */}
            <div className="space-y-4">
              <span className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
                2. Official Distribution & Notice Board Sections
              </span>

              <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
                {/* Toggle 1: Manager on Duty Policy */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeModPolicy}
                    onChange={(e) => setIncludeModPolicy(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                      Manager On Duty (MOD) Metrics & Policy Badge
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Highlights MOD designated associates with gold star badges and prints the week-long coverage KPI on the document header.
                    </p>
                  </div>
                </label>

                {/* Toggle 2: Physical Signatures Block */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeSignatures}
                    onChange={(e) => setIncludeSignatures(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                      Store Manager Sign-Off & Physical Posting Certification
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Adds official signature lines for Store Manager approval and Date/Time verification stamp when posted on staff breakroom boards.
                    </p>
                  </div>
                </label>

                {/* Toggle 3: Store Directives & Shift Swap Rules */}
                <label className="flex items-start gap-3 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={includeRules}
                    onChange={(e) => setIncludeRules(e.target.checked)}
                    className="mt-1 w-4 h-4 rounded text-amber-600 focus:ring-amber-500 border-slate-300"
                  />
                  <div className="text-xs">
                    <span className="font-bold text-slate-900 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5 text-blue-600" />
                      Attendance Directives & 24h Shift-Swap Rules
                    </span>
                    <p className="text-slate-500 text-[11px] mt-0.5">
                      Includes official clock-in window policy (+/- 5 min grace) and employee procedure for requesting shift swaps.
                    </p>
                  </div>
                </label>
              </div>

              {/* Document Summary Box */}
              <div className="bg-slate-900 text-slate-200 p-3.5 rounded-2xl text-xs space-y-1.5">
                <div className="flex items-center justify-between text-white font-semibold">
                  <span>Document Output:</span>
                  <span className="text-amber-400 font-mono text-[11px]">PDF (Vector High-Res)</span>
                </div>
                <div className="text-[11px] text-slate-400">
                  • Ready for standard 8.5x11 / A4 black-and-white or color physical printers
                </div>
                <div className="text-[11px] text-slate-400">
                  • High-contrast typography optimized for clear wall legibility at distance
                </div>
              </div>
            </div>
          </div>

          {/* Interactive Document Preview Box */}
          <div className="border border-slate-200 rounded-2xl p-4 bg-slate-50/60 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                Live PDF Layout Preview ({layout === 'matrix-landscape' ? 'Landscape Matrix Table' : 'Portrait Chronological'})
              </span>
              <span className="text-[10px] bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded font-medium">
                Standard A4 / Letter Page Sizing
              </span>
            </div>

            {/* Preview Canvas Representation */}
            <div className="bg-white border border-slate-300 rounded-xl p-4 shadow-xs text-xs space-y-3 font-sans overflow-x-auto">
              {/* Header */}
              <div className="bg-slate-900 text-white p-3 rounded-lg flex items-center justify-between">
                <div>
                  <div className="font-bold tracking-wider text-xs">NIKE FLAGSHIP STORE #402 — OFFICIAL STAFF ROSTER</div>
                  <div className="text-[10px] text-slate-300">
                    Week of {weekDays[0] ? `${weekDays[0].monthShort} ${weekDays[0].dayNum}` : ''} - {weekDays[6] ? `${weekDays[6].monthShort} ${weekDays[6].dayNum}` : ''} • Store Floor Operations
                  </div>
                </div>
                <div className="text-right text-[10px] text-amber-400 font-medium">
                  MOD: {daysWithMod.length}/7 Days Active
                </div>
              </div>

              {/* Sample Matrix / Daily Snippet */}
              {layout === 'matrix-landscape' ? (
                <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white text-[10px]">
                        <th className="p-2 font-bold">Associate</th>
                        {weekDays.map(d => (
                          <th key={d.dateStr} className="p-2 font-bold text-center">
                            {d.dayShort}
                          </th>
                        ))}
                        <th className="p-2 font-bold text-center">Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      {employees.slice(0, 4).map(emp => {
                        const empShifts = relevantShifts.filter(s => s.employeeId === emp.id);
                        return (
                          <tr key={emp.id} className="hover:bg-slate-50">
                            <td className="p-2 font-semibold text-slate-900 whitespace-nowrap">
                              {emp.name}
                              <span className="block text-[9px] text-slate-500 font-normal">{emp.role}</span>
                            </td>
                            {weekDays.map(d => {
                              const s = empShifts.find(sh => sh.date === d.dateStr);
                              return (
                                <td key={d.dateStr} className="p-2 text-center text-[10px]">
                                  {s ? (
                                    <span className={`inline-block px-1.5 py-0.5 rounded font-medium ${
                                      s.isManagerOnDuty ? 'bg-amber-100 text-amber-900 font-bold' : 'bg-sky-50 text-sky-800'
                                    }`}>
                                      {s.startTime.slice(0, 5)}
                                      {s.isManagerOnDuty ? ' ★' : ''}
                                    </span>
                                  ) : (
                                    <span className="text-slate-300">OFF</span>
                                  )}
                                </td>
                              );
                            })}
                            <td className="p-2 text-center font-bold text-slate-700">
                              {empShifts.length > 0 ? `${empShifts.length * 8}h` : '0h'}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                  <div className="bg-slate-50 p-2 text-center text-[10px] text-slate-500 border-t border-slate-100 italic">
                    + Showing sample preview rows ({employees.length} associates will be rendered in full PDF download)
                  </div>
                </div>
              ) : (
                <div className="border border-slate-200 rounded-lg overflow-hidden text-[11px]">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="bg-slate-800 text-white text-[10px]">
                        <th className="p-2 font-bold">Date</th>
                        <th className="p-2 font-bold">Team Member</th>
                        <th className="p-2 font-bold">Hours</th>
                        <th className="p-2 font-bold">Zone</th>
                        <th className="p-2 font-bold text-center">MOD</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 text-[10px]">
                      {relevantShifts.slice(0, 4).map(s => (
                        <tr key={s.id} className="hover:bg-slate-50">
                          <td className="p-2 font-medium text-slate-700">{s.date}</td>
                          <td className="p-2 font-bold text-slate-900">{s.employeeName}</td>
                          <td className="p-2 text-slate-600">{s.startTime} - {s.endTime}</td>
                          <td className="p-2 text-slate-600">{s.zone}</td>
                          <td className="p-2 text-center">
                            {s.isManagerOnDuty ? (
                              <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-900 font-bold">★ MOD</span>
                            ) : '-'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* Signatures preview snippet */}
              {includeSignatures && (
                <div className="pt-2 border-t border-slate-200 grid grid-cols-3 gap-3 text-[9px] text-slate-500">
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold block text-slate-700">Store Manager Sign-Off</span>
                    Marcus Vance (Verified)
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold block text-slate-700">Operations Review</span>
                    Elena Rostova (Asst Manager)
                  </div>
                  <div className="border-t border-slate-300 pt-1">
                    <span className="font-bold block text-slate-700">Staff Room Notice Board</span>
                    Posted on: {new Date().toLocaleDateString()}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Success message toast */}
          {downloadSuccess && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-3.5 rounded-2xl text-xs flex items-center justify-between animate-in fade-in">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span className="font-semibold">
                  PDF document generated and downloaded successfully! Ready for printing or staff distribution.
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer / Actions */}
        <div className="bg-slate-50 border-t border-slate-200 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <div className="text-xs text-slate-500 flex items-center gap-1.5">
            <span className="inline-block w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Ready to generate official distribution PDF</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-100 text-slate-700 font-semibold text-xs transition-colors"
            >
              Close
            </button>

            <button
              id="btn-print-schedule-direct"
              type="button"
              onClick={handlePrint}
              className="flex-1 sm:flex-initial px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-white text-slate-800 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
              title="Open print view"
            >
              <Printer className="w-4 h-4 text-slate-600" />
              <span>Print Preview</span>
            </button>

            <button
              id="btn-confirm-download-pdf"
              type="button"
              disabled={isExporting}
              onClick={handleDownloadPdf}
              className="flex-1 sm:flex-initial px-5 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 active:bg-amber-600 text-slate-950 font-bold text-xs transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <FileDown className="w-4 h-4" />
              <span>{isExporting ? 'Generating PDF...' : 'Download PDF Document'}</span>
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};
