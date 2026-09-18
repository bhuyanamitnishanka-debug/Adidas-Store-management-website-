import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { Employee, Shift } from '../types';

export interface ScheduleWeekDay {
  dateStr: string;
  dayShort: string;
  dayFull: string;
  dayNum: number;
  monthShort: string;
  isToday?: boolean;
}

export interface ExportPdfOptions {
  weekStart: string;
  weekDays: ScheduleWeekDay[];
  employees: Employee[];
  shifts: Shift[];
  layout: 'matrix-landscape' | 'daily-portrait';
  zoneFilter: string;
  includeModPolicy: boolean;
  includeSignatures: boolean;
  includeRules: boolean;
  storeName?: string;
  storeNumber?: string;
}

// Helper to calculate hours
function parseShiftHours(start: string, end: string): number {
  const parseTime = (t: string) => {
    const [time, modifier] = t.split(' ');
    let [hours, minutes] = time.split(':').map(Number);
    if (modifier === 'PM' && hours < 12) hours += 12;
    if (modifier === 'AM' && hours === 12) hours = 0;
    return hours + minutes / 60;
  };
  try {
    const s = parseTime(start);
    const e = parseTime(end);
    return Math.max(0, e - s);
  } catch {
    return 8;
  }
}

export function generateSchedulePdf(options: ExportPdfOptions): jsPDF {
  const {
    weekStart,
    weekDays,
    employees,
    shifts,
    layout,
    zoneFilter,
    includeModPolicy,
    includeSignatures,
    includeRules,
    storeName = 'Nike Flagship Store',
    storeNumber = '#402'
  } = options;

  const isLandscape = layout === 'matrix-landscape';
  const doc = new jsPDF({
    orientation: isLandscape ? 'landscape' : 'portrait',
    unit: 'pt',
    format: 'a4'
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 32;

  // Filter shifts based on zone
  const activeShifts = zoneFilter === 'all' 
    ? shifts 
    : shifts.filter(s => s.zone === zoneFilter);

  // Filter for week shifts
  const weekDates = weekDays.map(d => d.dateStr);
  const currentWeekShifts = activeShifts.filter(s => weekDates.includes(s.date));

  // Calculate high-level metrics
  const totalHours = currentWeekShifts.reduce((acc, s) => acc + parseShiftHours(s.startTime, s.endTime), 0);
  const scheduledStaffIds = new Set(currentWeekShifts.map(s => s.employeeId));
  const daysWithMod = weekDays.filter(d => currentWeekShifts.some(s => s.date === d.dateStr && s.isManagerOnDuty));
  const modCoveragePct = Math.round((daysWithMod.length / 7) * 100);

  // Header Banner
  doc.setFillColor(15, 23, 42); // slate-900
  doc.rect(0, 0, pageWidth, 58, 'F');

  // Accent stripe
  doc.setFillColor(245, 158, 11); // amber-500
  doc.rect(0, 58, pageWidth, 4, 'F');

  // Brand / Title
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(14);
  doc.text(`${storeName.toUpperCase()} ${storeNumber} — OFFICIAL STAFF ROSTER`, margin, 26);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(203, 213, 225); // slate-300
  const firstDay = weekDays[0] ? `${weekDays[0].dayFull}, ${weekDays[0].monthShort} ${weekDays[0].dayNum}` : '';
  const lastDay = weekDays[6] ? `${weekDays[6].dayFull}, ${weekDays[6].monthShort} ${weekDays[6].dayNum}` : '';
  doc.text(`Schedule Period: ${firstDay} - ${lastDay}  |  Published for Store Notice Board & Floor Distribution`, margin, 42);

  // Right-side badge
  const genDateStr = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  doc.setFontSize(8);
  doc.setTextColor(251, 191, 36); // amber-400
  doc.text(`Generated: ${genDateStr}`, pageWidth - margin - 110, 26);
  doc.setTextColor(226, 232, 240);
  doc.text(`Zone: ${zoneFilter === 'all' ? 'All Departments' : zoneFilter}`, pageWidth - margin - 110, 42);

  let startY = 78;

  // Key KPI Summary Pill Row
  doc.setDrawColor(226, 232, 240); // slate-200
  doc.setFillColor(248, 250, 252); // slate-50
  doc.roundedRect(margin, startY, pageWidth - (margin * 2), 34, 4, 4, 'FD');

  doc.setFontSize(8.5);
  doc.setTextColor(71, 85, 105); // slate-600

  const colWidth = (pageWidth - (margin * 2)) / 4;

  // Metric 1: Total Hours
  doc.setFont('helvetica', 'normal');
  doc.text('TOTAL SCHEDULED:', margin + 12, startY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${totalHours.toFixed(1)} Hours (${currentWeekShifts.length} Shifts)`, margin + 12, startY + 26);

  // Metric 2: Scheduled Associates
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('SCHEDULED STAFF:', margin + colWidth + 12, startY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(15, 23, 42);
  doc.text(`${scheduledStaffIds.size} of ${employees.length} Team Members`, margin + colWidth + 12, startY + 26);

  // Metric 3: MOD Compliance
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('MOD COVERAGE:', margin + (colWidth * 2) + 12, startY + 15);
  doc.setFont('helvetica', 'bold');
  if (modCoveragePct === 100) {
    doc.setTextColor(5, 150, 105); // emerald-600
    doc.text('100% Compliant (7/7 Days)', margin + (colWidth * 2) + 12, startY + 26);
  } else {
    doc.setTextColor(217, 119, 6); // amber-600
    doc.text(`${daysWithMod.length}/7 Days Active`, margin + (colWidth * 2) + 12, startY + 26);
  }

  // Metric 4: Notice Board Status
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(71, 85, 105);
  doc.text('STATUS & POSTING:', margin + (colWidth * 3) + 12, startY + 15);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(30, 41, 59);
  doc.text('Certified Official Roster', margin + (colWidth * 3) + 12, startY + 26);

  startY += 44;

  if (isLandscape) {
    // ==========================================
    // MATRIX LANDSCAPE LAYOUT (EMPLOYEE GRID)
    // ==========================================
    const tableHeaders = [
      'Team Member & Role',
      ...weekDays.map(d => `${d.dayShort}\n${d.monthShort} ${d.dayNum}`),
      'Weekly Total'
    ];

    const tableRows: any[][] = [];

    employees.forEach(emp => {
      const empShifts = currentWeekShifts.filter(s => s.employeeId === emp.id);
      const empHours = empShifts.reduce((acc, s) => acc + parseShiftHours(s.startTime, s.endTime), 0);

      // If zone filter is active and employee has no shifts in this zone, optionally skip or show off
      if (zoneFilter !== 'all' && empShifts.length === 0) {
        return;
      }

      const rowCells: any[] = [
        `${emp.name}\n${emp.role}${emp.isManagerQualified ? ' [MOD]' : ''}`
      ];

      weekDays.forEach(day => {
        const dayShift = empShifts.find(s => s.date === day.dateStr);
        if (dayShift) {
          const modText = dayShift.isManagerOnDuty ? ' ★ [MOD]' : '';
          const shortZone = dayShift.zone
            .replace('Sales Floor - ', '')
            .replace('Stockroom / Receiving', 'Stockroom')
            .replace('Visual Merchandising', 'VM');
          rowCells.push(`${dayShift.startTime} - ${dayShift.endTime}\n${shortZone}${modText}`);
        } else {
          rowCells.push('OFF');
        }
      });

      rowCells.push(`${empHours.toFixed(1)} hrs\n(${empShifts.length} shifts)`);
      tableRows.push(rowCells);
    });

    autoTable(doc, {
      startY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 7.5,
        cellPadding: 4.5,
        valign: 'middle',
        overflow: 'linebreak',
        lineWidth: 0.5,
        lineColor: [226, 232, 240]
      },
      headStyles: {
        fillColor: [30, 41, 59], // slate-800
        textColor: [255, 255, 255],
        fontStyle: 'bold',
        halign: 'center',
        cellPadding: 5
      },
      columnStyles: {
        0: { cellWidth: 100, fontStyle: 'bold', halign: 'left', fillColor: [248, 250, 252] },
        1: { halign: 'center' },
        2: { halign: 'center' },
        3: { halign: 'center' },
        4: { halign: 'center' },
        5: { halign: 'center' },
        6: { halign: 'center' },
        7: { halign: 'center' },
        8: { cellWidth: 70, halign: 'center', fontStyle: 'bold', fillColor: [248, 250, 252] }
      },
      didParseCell: (data) => {
        if (data.section === 'body' && data.column.index > 0 && data.column.index < 8) {
          const raw = String(data.cell.raw || '');
          if (raw === 'OFF') {
            data.cell.styles.textColor = [148, 163, 184]; // slate-400
            data.cell.styles.fillColor = [255, 255, 255];
          } else if (raw.includes('★ [MOD]')) {
            data.cell.styles.fillColor = [254, 243, 199]; // amber-100
            data.cell.styles.textColor = [120, 53, 15]; // amber-900
            data.cell.styles.fontStyle = 'bold';
          } else {
            data.cell.styles.fillColor = [240, 249, 255]; // sky-50
            data.cell.styles.textColor = [12, 74, 110]; // sky-900
          }
        }
      }
    });

  } else {
    // ==========================================
    // DAILY CHRONOLOGICAL PORTRAIT LAYOUT
    // ==========================================
    const tableHeaders = ['Day & Date', 'Team Member', 'Role', 'Shift Hours', 'Assigned Zone', 'MOD'];
    const tableRows: any[][] = [];

    // Sort shifts by date, then start time
    const sortedShifts = [...currentWeekShifts].sort((a, b) => {
      if (a.date !== b.date) return a.date.localeCompare(b.date);
      return a.startTime.localeCompare(b.startTime);
    });

    let lastDate = '';
    sortedShifts.forEach(shift => {
      const dayInfo = weekDays.find(d => d.dateStr === shift.date);
      const dayLabel = dayInfo ? `${dayInfo.dayShort}, ${dayInfo.monthShort} ${dayInfo.dayNum}` : shift.date;
      const emp = employees.find(e => e.id === shift.employeeId);

      tableRows.push([
        shift.date === lastDate ? '' : dayLabel,
        shift.employeeName,
        emp?.role || 'Retail Associate',
        `${shift.startTime} - ${shift.endTime}`,
        shift.zone,
        shift.isManagerOnDuty ? '★ MOD' : '-'
      ]);

      lastDate = shift.date;
    });

    autoTable(doc, {
      startY,
      head: [tableHeaders],
      body: tableRows,
      theme: 'grid',
      styles: {
        fontSize: 8,
        cellPadding: 4,
        valign: 'middle',
        lineWidth: 0.5,
        lineColor: [226, 232, 240]
      },
      headStyles: {
        fillColor: [30, 41, 59],
        textColor: [255, 255, 255],
        fontStyle: 'bold'
      },
      columnStyles: {
        0: { fontStyle: 'bold', fillColor: [248, 250, 252], cellWidth: 100 },
        1: { fontStyle: 'bold' },
        3: { halign: 'center' },
        5: { halign: 'center', fontStyle: 'bold' }
      },
      didParseCell: (data) => {
        if (data.section === 'body') {
          const rawCell = String(data.cell.raw || '');
          if (rawCell.includes('★ MOD') && data.column.index === 5) {
            data.cell.styles.textColor = [180, 83, 9];
            data.cell.styles.fillColor = [254, 243, 199];
          }
        }
      }
    });
  }

  // Position after table
  // @ts-ignore
  let finalY = doc.lastAutoTable ? doc.lastAutoTable.finalY + 16 : startY + 200;

  // If table went too close to bottom, add new page for signatures & rules
  if (finalY > pageHeight - 90) {
    doc.addPage();
    finalY = 36;
  }

  // Policy & Instructions Box
  if (includeRules) {
    doc.setDrawColor(245, 158, 11);
    doc.setFillColor(254, 252, 232); // amber-50
    doc.roundedRect(margin, finalY, pageWidth - (margin * 2), 34, 3, 3, 'FD');

    doc.setFontSize(7.5);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(146, 64, 14); // amber-800
    doc.text('STORE OPERATIONAL DIRECTIVES & ATTENDANCE POLICY:', margin + 10, finalY + 12);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(120, 53, 15);
    doc.text(
      '1. Clock-in grace window is strictly +/- 5 minutes at the back-office terminal.  2. Shift swap requests must be submitted 24h prior via the HR portal.',
      margin + 10,
      finalY + 22
    );
    doc.text(
      '3. Mandatory MOD presence: Floor leadership handover occurs 15 minutes before shift end. Full uniform and store badges required at all times.',
      margin + 10,
      finalY + 30
    );

    finalY += 42;
  }

  // Sign-off / Physical Notice Board Verification Block
  if (includeSignatures) {
    if (finalY > pageHeight - 65) {
      doc.addPage();
      finalY = 36;
    }

    const signColWidth = (pageWidth - (margin * 2)) / 3;

    doc.setDrawColor(203, 213, 225); // slate-300
    doc.setFontSize(7.5);
    doc.setTextColor(71, 85, 105);

    // Sign 1: Store Manager
    doc.line(margin, finalY + 20, margin + signColWidth - 20, finalY + 20);
    doc.text('Store Manager Sign-Off (Marcus Vance)', margin, finalY + 30);
    doc.text('Date: ________________________', margin, finalY + 40);

    // Sign 2: Assistant Manager / Floor MOD
    doc.line(margin + signColWidth, finalY + 20, margin + (signColWidth * 2) - 20, finalY + 20);
    doc.text('Assistant Manager / Operations Review', margin + signColWidth, finalY + 30);
    doc.text('Date: ________________________', margin + signColWidth, finalY + 40);

    // Sign 3: Notice Board Posting Certification
    doc.line(margin + (signColWidth * 2), finalY + 20, pageWidth - margin, finalY + 20);
    doc.text('Staff Room Notice Board Posting Verified', margin + (signColWidth * 2), finalY + 30);
    doc.text('Date & Time Posted: ___________________', margin + (signColWidth * 2), finalY + 40);
  }

  // Footer page numbers
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(148, 163, 184); // slate-400
    doc.text(
      `Nike Flagship Store #402 Staff Schedule  •  Confidential - For Internal Store Team Distribution Only  •  Page ${i} of ${totalPages}`,
      pageWidth / 2,
      pageHeight - 14,
      { align: 'center' }
    );
  }

  return doc;
}
