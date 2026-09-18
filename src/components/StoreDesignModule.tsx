import React, { useState } from 'react';
import { 
  Palette, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  Eye, 
  Building, 
  Sliders, 
  Plus, 
  ShieldCheck, 
  Wrench,
  Check,
  Compass
} from 'lucide-react';
import { VMDirective } from '../types';

interface StoreDesignModuleProps {
  directives: VMDirective[];
  onToggleAction: (directiveId: string, actionIndex: number) => void;
  onUpdateCompliance: (directiveId: string, status: VMDirective['status']) => void;
}

export const StoreDesignModule: React.FC<StoreDesignModuleProps> = ({
  directives,
  onToggleAction,
  onUpdateCompliance
}) => {
  const [selectedZone, setSelectedZone] = useState<string>('All');
  const [activeView, setActiveView] = useState<'directives' | 'floor-plan' | 'facility-mall'>('directives');

  const overallScore = Math.round(
    directives.reduce((acc, d) => acc + d.complianceScore, 0) / directives.length
  );

  const filteredDirectives = directives.filter(d => 
    selectedZone === 'All' || d.type === selectedZone
  );

  return (
    <div className="space-y-6">
      {/* Visual Merchandising Mandate Banner */}
      <div className="bg-gradient-to-r from-slate-900 to-indigo-950 text-white p-5 rounded-2xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Brand Execution & Visual Standards
            </span>
            <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-medium">
              Autumn Sport High-Velocity 2026
            </span>
          </div>
          <p className="text-sm font-semibold text-slate-100">
            Ensure all established Visual Merchandising, In-Store Communication, and Mall Facility standards are flawlessly executed.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <div className="text-right">
            <span className="text-[11px] text-slate-400 uppercase font-semibold">Store Brand Audit Score</span>
            <p className="text-2xl font-bold text-emerald-400">{overallScore}%</p>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Mode Switcher */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2">
        <button
          onClick={() => setActiveView('directives')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeView === 'directives'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Palette className="w-4 h-4" />
          <span>VM Directives & Inspections ({directives.length})</span>
        </button>

        <button
          onClick={() => setActiveView('floor-plan')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeView === 'floor-plan'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Interactive Store Layout Map</span>
        </button>

        <button
          onClick={() => setActiveView('facility-mall')}
          className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors flex items-center gap-2 ${
            activeView === 'facility-mall'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:bg-slate-100'
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Mall Management & Facilities</span>
        </button>
      </div>

      {/* VIEW 1: DIRECTIVES & INSPECTIONS */}
      {activeView === 'directives' && (
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            {['All', 'Interior', 'Exterior'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedZone(type)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors ${
                  selectedZone === type
                    ? 'bg-slate-900 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {type === 'All' ? 'All Directives' : `${type} Zones`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredDirectives.map((d) => (
              <div key={d.id} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">
                        {d.type} • {d.area}
                      </span>
                      <h4 className="text-base font-bold text-slate-900 mt-0.5">{d.title}</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Campaign: {d.seasonCampaign}</p>
                    </div>
                    <span className={`text-xs font-bold px-2.5 py-1 rounded-full shrink-0 ${
                      d.status === 'Compliant'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {d.status} ({d.complianceScore}%)
                    </span>
                  </div>

                  <p className="text-xs text-slate-600 mt-3 leading-relaxed bg-slate-50 p-3 rounded-xl border border-slate-100">
                    {d.guidelineNotes}
                  </p>

                  <div className="mt-4 space-y-2">
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                      Execution Verification Checklist
                    </span>
                    {d.keyActions.map((action, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs text-slate-700">
                        <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Inspector: {d.inspector}</span>
                  <button
                    onClick={() => onUpdateCompliance(d.id, d.status === 'Compliant' ? 'Needs Attention' : 'Compliant')}
                    className="text-xs font-semibold text-slate-800 hover:text-amber-600 underline"
                  >
                    Toggle Status →
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* VIEW 2: INTERACTIVE STORE LAYOUT MAP */}
      {activeView === 'floor-plan' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-5">
          <div>
            <h3 className="font-bold text-slate-900 text-base">Store #104 Visual Floor Plan & Merchandising Zones</h3>
            <p className="text-xs text-slate-500">
              Schematic overview of customer flow, high-traffic focal displays, and visual merchandising standards.
            </p>
          </div>

          <div className="p-6 bg-slate-950 rounded-2xl text-white relative overflow-hidden border border-slate-800">
            {/* Top Exterior Mall Corridor */}
            <div className="p-3 bg-slate-800/80 rounded-xl border border-dashed border-amber-500/40 text-center mb-6">
              <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">
                Mall Central Promenade & Exterior Window Façade
              </span>
              <p className="text-[11px] text-slate-300 mt-0.5">
                Dynamic 3-Mannequin Sprint Posture • 3000K Directional Track Spots • Clean Glass Standards
              </p>
            </div>

            {/* Store Grid Representation */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Entrance Gondola */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition-colors">
                <span className="text-[10px] font-bold text-amber-400 uppercase">Zone A: Entrance Hero</span>
                <h5 className="font-bold text-sm text-white mt-1">Hero Gondola #1</h5>
                <p className="text-xs text-slate-400 mt-1">
                  Full size run (UK 7-12) AeroGlide Elite with matching DryPro apparel cross-merchandise.
                </p>
                <div className="mt-3 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 94% Audited Compliance
                </div>
              </div>

              {/* Central Sales Floor */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition-colors">
                <span className="text-[10px] font-bold text-blue-400 uppercase">Zone B: Technical Apparel</span>
                <h5 className="font-bold text-sm text-white mt-1">Outerwear Feature Wall</h5>
                <p className="text-xs text-slate-400 mt-1">
                  HydroShield jackets on waterfall brackets. Max 4 hangers per pin in slate-to-cyan gradient.
                </p>
                <div className="mt-3 text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                  <AlertTriangle className="w-3.5 h-3.5" /> Attention: Spacing adjustment
                </div>
              </div>

              {/* Cash Desk & Impulse */}
              <div className="p-4 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-400 transition-colors">
                <span className="text-[10px] font-bold text-purple-400 uppercase">Zone C: Cash Desk</span>
                <h5 className="font-bold text-sm text-white mt-1">Cash Wrap & Loss Prevention</h5>
                <p className="text-xs text-slate-400 mt-1">
                  Clear sightline to exit EAS gates. Running socks, caps, and energy gels impulse rack.
                </p>
                <div className="mt-3 text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> 96% Loss Prevention Ready
                </div>
              </div>
            </div>

            {/* Rear Backroom Logistics */}
            <div className="mt-6 p-3 bg-slate-900/90 rounded-xl border border-slate-800 text-center">
              <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                Store Stockroom, Loading Dock & High-Bay Storage
              </span>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Same-day merchandise breakdown area • Safety walkways clear of pallets • 100% fire exit clearance.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: MALL MANAGEMENT & FACILITY SERVICES */}
      {activeView === 'facility-mall' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 text-base">
              Facility Services & Mall Administration Authority
            </h3>
            <p className="text-xs text-slate-500">
              Coordinating with mall management, facility technicians, and local administration directives.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Wrench className="w-4 h-4 text-blue-600" />
                <span>HVAC & Lighting Maintenance</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Sales floor ambient temp locked at 21.5°C. Track spotlights scheduled for quarterly bulb re-lamping on Oct 1.
              </p>
              <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                Operating Normally
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <Building className="w-4 h-4 text-amber-600" />
                <span>Mall Admin Directives</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Mall security fire drill passed with full attendance. Saturday late-night trading permitted until 22:00.
              </p>
              <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-blue-800">
                Authorized By Mall Mgmt
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex items-center gap-2 text-slate-900 font-semibold text-sm">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Loss Prevention & EAS Gates</span>
              </div>
              <p className="text-xs text-slate-600 mt-2">
                Exit sensors calibrated daily at 09:45 AM. Daily audit logs uploaded for District Manager review.
              </p>
              <span className="inline-block mt-3 text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
                100% Integrity
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
