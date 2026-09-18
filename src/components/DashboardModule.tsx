import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  ShoppingBag, 
  Users, 
  Truck, 
  ShieldCheck, 
  AlertTriangle, 
  ArrowUpRight, 
  ArrowDownRight,
  CheckCircle2, 
  Target,
  Clock,
  Sparkles,
  Award,
  ChevronRight,
  BarChart3,
  Layers,
  Receipt,
  Percent,
  Calendar,
  Flame,
  ArrowRight,
  Tag
} from 'lucide-react';
import { ModuleType, Product, StockTransfer, Shift, Employee, CustomerProfile } from '../types';
import { HISTORICAL_PRIOR_YEAR_SALES } from '../data/mockData';
import { SalesForecastingCard } from './SalesForecastingCard';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  ReferenceLine
} from 'recharts';

interface DashboardModuleProps {
  onNavigate: (module: ModuleType) => void;
  products: Product[];
  transfers: StockTransfer[];
  shifts: Shift[];
  employees: Employee[];
  customers?: CustomerProfile[];
}

export const DashboardModule: React.FC<DashboardModuleProps> = ({
  onNavigate,
  products,
  transfers,
  shifts,
  employees,
  customers = []
}) => {
  const lowStockProducts = products.filter(p => p.status === 'Low Stock' || p.status === 'Out of Stock');
  const activeShifts = shifts.filter(s => s.date === '2026-09-18');
  const managerOnDuty = activeShifts.find(s => s.isManagerOnDuty);
  const urgentTransfers = transfers.filter(t => t.priority === 'Urgent - Floor Depleted' && t.status !== 'Received & Verified');

  // --- Dynamic Sales History Analytics ---
  const availableDates = useMemo(() => {
    const dates = new Set<string>();
    products.forEach(p => {
      p.salesHistory.forEach(s => dates.add(s.date));
    });
    return Array.from(dates).sort().reverse();
  }, [products]);

  const [selectedPeriod, setSelectedPeriod] = useState<string>('all');

  // Compute daily sales history breakdown
  const dailyHistory = useMemo(() => {
    const map: Record<string, {
      date: string;
      revenue: number;
      units: number;
      cost: number;
      transactions: number;
      footfall: number;
      categories: Record<string, { revenue: number; units: number }>;
      topProduct: { name: string; revenue: number; units: number };
    }> = {};

    availableDates.forEach(date => {
      map[date] = {
        date,
        revenue: 0,
        units: 0,
        cost: 0,
        transactions: 0,
        footfall: 0,
        categories: {
          Footwear: { revenue: 0, units: 0 },
          Apparel: { revenue: 0, units: 0 },
          Equipment: { revenue: 0, units: 0 },
          Accessories: { revenue: 0, units: 0 },
        },
        topProduct: { name: '', revenue: 0, units: 0 }
      };
    });

    products.forEach(product => {
      product.salesHistory.forEach(item => {
        if (!map[item.date]) {
          map[item.date] = {
            date: item.date,
            revenue: 0,
            units: 0,
            cost: 0,
            transactions: 0,
            footfall: 0,
            categories: {
              Footwear: { revenue: 0, units: 0 },
              Apparel: { revenue: 0, units: 0 },
              Equipment: { revenue: 0, units: 0 },
              Accessories: { revenue: 0, units: 0 },
            },
            topProduct: { name: '', revenue: 0, units: 0 }
          };
        }
        const day = map[item.date];
        day.revenue += item.revenue;
        day.units += item.units;
        day.cost += item.units * product.cost;

        if (day.categories[product.category]) {
          day.categories[product.category].revenue += item.revenue;
          day.categories[product.category].units += item.units;
        }

        if (item.revenue > day.topProduct.revenue) {
          day.topProduct = {
            name: product.name,
            revenue: item.revenue,
            units: item.units
          };
        }
      });
    });

    // Derive realistic retail transactions & footfall based on standard fashion/athletic retail formula
    Object.values(map).forEach(day => {
      day.transactions = Math.max(1, Math.round(day.units / 2.22));
      day.footfall = Math.max(day.transactions, Math.round(day.transactions / 0.162));
    });

    return map;
  }, [products, availableDates]);

  // Compute selected metrics (either for 'all' or specific selected date)
  const salesMetrics = useMemo(() => {
    let totalRevenue = 0;
    let totalUnits = 0;
    let totalCost = 0;
    let totalTransactions = 0;
    let totalFootfall = 0;
    let priorYearRevenue = 0;
    let priorYearUnits = 0;
    let priorYearTransactions = 0;

    const categoryTotals: Record<string, { revenue: number; units: number }> = {
      Footwear: { revenue: 0, units: 0 },
      Apparel: { revenue: 0, units: 0 },
      Equipment: { revenue: 0, units: 0 },
      Accessories: { revenue: 0, units: 0 },
    };

    const categoryPriorYear: Record<string, number> = {
      Footwear: 0,
      Apparel: 0,
      Equipment: 0,
      Accessories: 0,
    };

    if (selectedPeriod === 'all') {
      Object.values(dailyHistory).forEach(day => {
        totalRevenue += day.revenue;
        totalUnits += day.units;
        totalCost += day.cost;
        totalTransactions += day.transactions;
        totalFootfall += day.footfall;

        Object.entries(day.categories).forEach(([cat, val]) => {
          if (categoryTotals[cat]) {
            categoryTotals[cat].revenue += val.revenue;
            categoryTotals[cat].units += val.units;
          }
        });

        // Compute prior year comparison
        const py = HISTORICAL_PRIOR_YEAR_SALES[day.date];
        if (py) {
          priorYearRevenue += py.priorYearRevenue;
          priorYearUnits += py.priorYearUnits;
          priorYearTransactions += py.priorYearTransactions;
          categoryPriorYear.Footwear += py.categories.Footwear || 0;
          categoryPriorYear.Apparel += py.categories.Apparel || 0;
          categoryPriorYear.Equipment += py.categories.Equipment || 0;
          categoryPriorYear.Accessories += py.categories.Accessories || 0;
        } else {
          const fallbackPy = Math.round(day.revenue / 1.156);
          priorYearRevenue += fallbackPy;
        }
      });
    } else if (dailyHistory[selectedPeriod]) {
      const day = dailyHistory[selectedPeriod];
      totalRevenue = day.revenue;
      totalUnits = day.units;
      totalCost = day.cost;
      totalTransactions = day.transactions;
      totalFootfall = day.footfall;

      Object.entries(day.categories).forEach(([cat, val]) => {
        if (categoryTotals[cat]) {
          categoryTotals[cat].revenue = val.revenue;
          categoryTotals[cat].units = val.units;
        }
      });

      const py = HISTORICAL_PRIOR_YEAR_SALES[selectedPeriod];
      if (py) {
        priorYearRevenue = py.priorYearRevenue;
        priorYearUnits = py.priorYearUnits;
        priorYearTransactions = py.priorYearTransactions;
        categoryPriorYear.Footwear = py.categories.Footwear || 0;
        categoryPriorYear.Apparel = py.categories.Apparel || 0;
        categoryPriorYear.Equipment = py.categories.Equipment || 0;
        categoryPriorYear.Accessories = py.categories.Accessories || 0;
      } else {
        priorYearRevenue = Math.round(day.revenue / 1.156);
      }
    }

    const upt = totalTransactions > 0 ? totalUnits / totalTransactions : 0;
    const conversionRate = totalFootfall > 0 ? (totalTransactions / totalFootfall) * 100 : 0;
    const atv = totalTransactions > 0 ? totalRevenue / totalTransactions : 0;
    const aur = totalUnits > 0 ? totalRevenue / totalUnits : 0;
    const grossProfit = totalRevenue - totalCost;
    const grossMarginPct = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
    const maxDailyRevenue = Math.max(...Object.values(dailyHistory).map(d => d.revenue), 1);

    // Year-over-Year Revenue Growth calculations
    const yoyRevenueGrowthPct = priorYearRevenue > 0
      ? ((totalRevenue - priorYearRevenue) / priorYearRevenue) * 100
      : 0;
    const yoyRevenueDelta = totalRevenue - priorYearRevenue;

    const categoryYoYGrowth: Record<string, { current: number; priorYear: number; growthPct: number }> = {};
    Object.keys(categoryTotals).forEach(cat => {
      const cur = categoryTotals[cat].revenue;
      const py = categoryPriorYear[cat] || Math.round(cur / 1.156);
      const growthPct = py > 0 ? ((cur - py) / py) * 100 : 0;
      categoryYoYGrowth[cat] = {
        current: cur,
        priorYear: py,
        growthPct
      };
    });

    return {
      totalRevenue,
      totalUnits,
      totalTransactions,
      totalFootfall,
      priorYearRevenue,
      priorYearUnits,
      priorYearTransactions,
      yoyRevenueGrowthPct,
      yoyRevenueDelta,
      categoryYoYGrowth,
      upt,
      conversionRate,
      atv,
      aur,
      grossProfit,
      grossMarginPct,
      categoryTotals,
      maxDailyRevenue
    };
  }, [dailyHistory, selectedPeriod]);

  // --- 7-Day Performance Trends for Recharts ---
  const [chartMetric, setChartMetric] = useState<'revenue' | 'units' | 'categories' | 'yoy'>('revenue');

  const last7DaysData = useMemo(() => {
    // Sort chronological dates (earliest to latest) and take last 7
    const sorted = [...availableDates].sort();
    const last7 = sorted.slice(-7);

    return last7.map(dateStr => {
      const day = dailyHistory[dateStr] || {
        date: dateStr,
        revenue: 0,
        units: 0,
        cost: 0,
        transactions: 0,
        footfall: 0,
        categories: {
          Footwear: { revenue: 0, units: 0 },
          Apparel: { revenue: 0, units: 0 },
          Equipment: { revenue: 0, units: 0 },
          Accessories: { revenue: 0, units: 0 },
        },
        topProduct: { name: '', revenue: 0, units: 0 }
      };

      const parts = dateStr.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dObj = new Date(y, m, d);
      const weekday = dObj.toLocaleDateString('en-US', { weekday: 'short' });
      const monthShort = dObj.toLocaleDateString('en-US', { month: 'short' });

      // Historical Prior Year Data for this date
      const py = HISTORICAL_PRIOR_YEAR_SALES[dateStr];
      const pyRevenue = py ? py.priorYearRevenue : Math.round(day.revenue / 1.156);
      const pyDate = py ? py.priorYearDate : `2025-${dateStr.slice(5)}`;
      const yoyGrowth = pyRevenue > 0 ? ((day.revenue - pyRevenue) / pyRevenue) * 100 : 0;

      return {
        date: dateStr,
        dayLabel: `${weekday} ${d}`,
        fullDate: `${weekday}, ${monthShort} ${d}, ${y}`,
        revenue: day.revenue,
        priorYearRevenue: pyRevenue,
        priorYearDate: pyDate,
        yoyGrowth,
        units: day.units,
        transactions: day.transactions,
        footfall: day.footfall,
        atv: day.transactions > 0 ? Math.round(day.revenue / day.transactions) : 0,
        upt: day.transactions > 0 ? +(day.units / day.transactions).toFixed(2) : 0,
        Footwear: day.categories.Footwear?.revenue || 0,
        Apparel: day.categories.Apparel?.revenue || 0,
        Equipment: day.categories.Equipment?.revenue || 0,
        Accessories: day.categories.Accessories?.revenue || 0,
        topProduct: day.topProduct.name
      };
    });
  }, [availableDates, dailyHistory]);

  const avg7DayRevenue = useMemo(() => {
    if (last7DaysData.length === 0) return 0;
    const sum = last7DaysData.reduce((acc, curr) => acc + curr.revenue, 0);
    return Math.round(sum / last7DaysData.length);
  }, [last7DaysData]);

  const peakDay = useMemo(() => {
    if (last7DaysData.length === 0) return null;
    return [...last7DaysData].sort((a, b) => b.revenue - a.revenue)[0];
  }, [last7DaysData]);

  // Transform historical sales data for the Sales Forecasting linear regression engine
  const forecastingHistoricalData = useMemo(() => {
    return last7DaysData.map(d => ({
      date: d.date,
      dayLabel: d.dayLabel,
      revenue: d.revenue,
      units: d.units,
      transactions: d.transactions,
      categories: {
        Footwear: d.Footwear,
        Apparel: d.Apparel,
        Equipment: d.Equipment,
        Accessories: d.Accessories
      }
    }));
  }, [last7DaysData]);

  // Dynamic Today's Sales based on latest available date in system
  const latestDate = availableDates[0] || '2026-09-18';
  const todayRecord = dailyHistory[latestDate] || { revenue: 3067, units: 40, transactions: 18 };
  const todayPriorYear = HISTORICAL_PRIOR_YEAR_SALES[latestDate] || { priorYearRevenue: 2680, priorYearDate: '2025-09-18' };
  const todayYoYGrowth = todayPriorYear.priorYearRevenue > 0
    ? ((todayRecord.revenue - todayPriorYear.priorYearRevenue) / todayPriorYear.priorYearRevenue) * 100
    : 14.4;
  const todayYoYDelta = todayRecord.revenue - todayPriorYear.priorYearRevenue;

  return (
    <div className="space-y-6">
      {/* Top Banner: Store Ownership Mandate */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 rounded-2xl p-5 sm:p-6 text-white border border-slate-700/60 shadow-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-5">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-xs font-semibold border border-amber-500/30">
              <Award className="w-3.5 h-3.5" />
              Store Manager Commercial Ownership
            </div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
              Store #104 Commercial Success & Floor Readiness
            </h2>
            <p className="text-slate-300 text-sm leading-relaxed">
              Driving continuous improvements in store sales, productivity and profitability while maintaining 100% legal, financial, and Brand execution standards.
            </p>
          </div>

          <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
            <button
              onClick={() => onNavigate('inventory')}
              className="px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold text-sm transition-all shadow-sm flex items-center gap-2"
            >
              <span>Manage Inventory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => onNavigate('employment')}
              className="px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-medium text-sm border border-slate-600 transition-all flex items-center gap-2"
            >
              <span>Staff Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Primary KPI Metrics Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Daily Revenue */}
        <div id="kpi-today-sales-card" className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Today's Sales</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-bold text-slate-900">${todayRecord.revenue.toLocaleString()}</span>
              <span 
                id="today-yoy-indicator-badge"
                className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/80 flex items-center gap-1"
                title={`Prior Year (2025-09-18): $${todayPriorYear.priorYearRevenue.toLocaleString()}`}
              >
                <ArrowUpRight className="w-3.5 h-3.5" /> +{todayYoYGrowth.toFixed(1)}% YoY
              </span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex justify-between items-center">
              <span>Prior Year: ${todayPriorYear.priorYearRevenue.toLocaleString()}</span>
              <span className="font-semibold text-emerald-600">+${todayYoYDelta.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Sales Productivity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Floor Productivity</span>
            <div className="p-2 rounded-xl bg-blue-50 text-blue-600">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">$218<span className="text-sm text-slate-500 font-normal">/hr</span></span>
              <span className="text-xs font-semibold text-blue-600">Leader: M. Sterling ($245)</span>
            </div>
            <div className="mt-2 text-xs text-slate-500 flex justify-between">
              <span>District Benchmark: $185/hr</span>
              <span className="font-semibold text-emerald-600">Top Tier</span>
            </div>
          </div>
        </div>

        {/* Metric 3: Same-Day Delivery Compliance */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Same-Day Inbound</span>
            <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
              <Truck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">100%</span>
              <span className="text-xs font-semibold text-purple-600">Immediate Access</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              All truck shipments processed and racked on floor same day.
            </p>
          </div>
        </div>

        {/* Metric 4: Loss Prevention & Integrity */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-slate-300 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Legal & Cash Integrity</span>
            <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-900">0.0%</span>
              <span className="text-xs font-semibold text-emerald-600">0 Till Variance</span>
            </div>
            <p className="mt-2 text-xs text-slate-500">
              EAS security active • Mall admin compliance verified.
            </p>
          </div>
        </div>
      </div>

      {/* Key Performance Metrics: Sales History, UPT & Conversion Card */}
      <div id="sales-history-kpi-card" className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Card Header & Period Selector */}
        <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-50/50">
          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
                <BarChart3 className="w-3.5 h-3.5 text-amber-600" />
                Store Sales Performance & Basket Dynamics
              </span>
              <span 
                id="header-yoy-growth-badge"
                className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1"
                title={`Comparing against 2025 Prior Year Benchmark ($${salesMetrics.priorYearRevenue.toLocaleString()})`}
              >
                <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                YoY Growth: +{salesMetrics.yoyRevenueGrowthPct.toFixed(1)}% vs 2025
              </span>
              <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
                • Current SKU Sales History
              </span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight">
              Commercial Sales & Basket Analytics
            </h3>
            <p className="text-xs text-slate-500">
              Live tracking of Total Revenue, Units Per Transaction (UPT), and Conversion Rate across retail floor lines.
            </p>
          </div>

          {/* Period Selector Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0 shrink-0">
            <button
              id="period-select-all"
              onClick={() => setSelectedPeriod('all')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
                selectedPeriod === 'all'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>All History (Total)</span>
            </button>
            {availableDates.map(date => {
              const dayRev = dailyHistory[date]?.revenue || 0;
              return (
                <button
                  key={date}
                  id={`period-select-${date}`}
                  onClick={() => setSelectedPeriod(date)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all whitespace-nowrap flex items-center gap-1.5 ${
                    selectedPeriod === date
                      ? 'bg-slate-900 text-white shadow-xs font-bold'
                      : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  <span>{date.slice(5)}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    selectedPeriod === date ? 'bg-slate-800 text-amber-300' : 'bg-slate-100 text-slate-500'
                  }`}>
                    ${dayRev.toLocaleString()}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* 3 Core Requested Metrics + 1 Complementary Basket Metric Tiles */}
        <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
          {/* 1. Total Revenue */}
          <div id="kpi-total-revenue" className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Revenue</span>
                <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    ${salesMetrics.totalRevenue.toLocaleString()}
                  </p>
                  <span 
                    id="yoy-growth-indicator-badge"
                    className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                      salesMetrics.yoyRevenueGrowthPct >= 0
                        ? 'text-emerald-700 bg-emerald-100 border border-emerald-200/80'
                        : 'text-rose-700 bg-rose-100 border border-rose-200/80'
                    }`}
                    title={`Prior Year (2025): $${salesMetrics.priorYearRevenue.toLocaleString()}`}
                  >
                    {salesMetrics.yoyRevenueGrowthPct >= 0 ? (
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowDownRight className="w-3.5 h-3.5" />
                    )}
                    {salesMetrics.yoyRevenueGrowthPct >= 0 ? '+' : ''}
                    {salesMetrics.yoyRevenueGrowthPct.toFixed(1)}% YoY
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>YoY 2025 Baseline:</span>
                <span className="font-semibold text-slate-900">
                  ${salesMetrics.priorYearRevenue.toLocaleString()}
                  <span className="text-emerald-600 font-medium ml-1">
                    (+${salesMetrics.yoyRevenueDelta.toLocaleString()})
                  </span>
                </span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Gross Profit:</span>
                <span className="font-semibold text-emerald-700">
                  ${Math.round(salesMetrics.grossProfit).toLocaleString()} ({salesMetrics.grossMarginPct.toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* 2. Units Per Transaction (UPT) */}
          <div id="kpi-upt" className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Units Per Transaction</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {salesMetrics.upt.toFixed(2)}
                  </p>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                    +{((salesMetrics.upt - 2.0) / 2.0 * 100).toFixed(1)}% vs Target
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-amber-100/70 text-amber-700">
                <Receipt className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Units / Transactions:</span>
                <span className="font-semibold text-slate-900">{salesMetrics.totalUnits} units / {salesMetrics.totalTransactions} tix</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Store Target:</span>
                <span className="font-semibold text-slate-900">2.00 UPT benchmark</span>
              </div>
            </div>
          </div>

          {/* 3. Conversion Rate */}
          <div id="kpi-conversion-rate" className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Conversion Rate</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                    {salesMetrics.conversionRate.toFixed(1)}%
                  </p>
                  <span className="text-xs font-bold text-blue-700 bg-blue-100 px-2 py-0.5 rounded-full">
                    Top Tier
                  </span>
                </div>
              </div>
              <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700">
                <Percent className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Buyers / Footfall:</span>
                <span className="font-semibold text-slate-900">{salesMetrics.totalTransactions} / {salesMetrics.totalFootfall} visits</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>District Avg:</span>
                <span className="font-semibold text-slate-900">14.5% Benchmark</span>
              </div>
            </div>
          </div>

          {/* 4. Average Transaction Value (ATV) & Unit Retail (AUR) */}
          <div id="kpi-atv" className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Avg Transaction Value</span>
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 mt-1 tracking-tight">
                  ${salesMetrics.atv.toFixed(2)}
                </p>
              </div>
              <div className="p-2 rounded-xl bg-purple-100/70 text-purple-700">
                <ShoppingBag className="w-5 h-5" />
              </div>
            </div>
            <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
              <div className="flex items-center justify-between text-slate-600">
                <span>Avg Unit Retail (AUR):</span>
                <span className="font-semibold text-slate-900">${salesMetrics.aur.toFixed(2)} / unit</span>
              </div>
              <div className="flex items-center justify-between text-slate-600">
                <span>Total Units Moved:</span>
                <span className="font-semibold text-slate-900">{salesMetrics.totalUnits} items</span>
              </div>
            </div>
          </div>
        </div>

        {/* Year-Over-Year Revenue Growth Comparative Indicator Bar */}
        <div id="yoy-revenue-growth-summary" className="mx-5 sm:mx-6 mb-2 p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 shrink-0">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-300">
                  Year-Over-Year Revenue Growth Indicator
                </span>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Historical Sales Audit
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Comparing {selectedPeriod === 'all' ? '7-Day Period Total' : `Selected Date (${selectedPeriod})`} against 2025 prior year historical benchmark
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 sm:gap-6 self-start sm:self-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-800 w-full sm:w-auto justify-between sm:justify-end">
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">2025 Prior Year</span>
              <span className="text-sm font-semibold text-slate-300">
                ${salesMetrics.priorYearRevenue.toLocaleString()}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-slate-400 block uppercase font-medium">2026 Current</span>
              <span className="text-sm font-bold text-white">
                ${salesMetrics.totalRevenue.toLocaleString()}
              </span>
            </div>
            <div className="text-left sm:text-right">
              <span className="text-[10px] text-emerald-400 block uppercase font-bold">YoY Growth %</span>
              <span 
                id="yoy-banner-growth-value"
                className="text-base sm:text-lg font-extrabold text-emerald-400 inline-flex items-center gap-0.5"
              >
                <ArrowUpRight className="w-4 h-4" />
                +{salesMetrics.yoyRevenueGrowthPct.toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Detailed Breakdown: Daily Sales Trend & Category Contribution */}
        <div className="px-5 pb-5 sm:px-6 sm:pb-6 grid grid-cols-1 lg:grid-cols-12 gap-5 pt-2">
          {/* Left 7 cols: Recharts-based 7-Day Sales Performance Trends Bar Chart */}
          <div id="sales-history-daily-chart" className="lg:col-span-7 p-4 sm:p-5 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3.5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
              <div>
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-slate-700" />
                    7-Day Sales Performance Trends
                  </h4>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-200/80 text-slate-700">
                    Last 7 Days
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Interactive Recharts bar chart tracking revenue velocity and volume
                </p>
              </div>

              {/* Metric Toggle Selector */}
              <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shadow-2xs self-start sm:self-auto flex-wrap">
                <button
                  id="chart-metric-revenue-btn"
                  onClick={() => setChartMetric('revenue')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    chartMetric === 'revenue'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Revenue ($)
                </button>
                <button
                  id="chart-metric-yoy-btn"
                  onClick={() => setChartMetric('yoy')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all flex items-center gap-1 ${
                    chartMetric === 'yoy'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  <TrendingUp className="w-3 h-3 text-emerald-400" />
                  YoY Comparison
                </button>
                <button
                  id="chart-metric-units-btn"
                  onClick={() => setChartMetric('units')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    chartMetric === 'units'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  Units Sold
                </button>
                <button
                  id="chart-metric-categories-btn"
                  onClick={() => setChartMetric('categories')}
                  className={`px-2.5 py-1 text-[11px] font-semibold rounded-lg transition-all ${
                    chartMetric === 'categories'
                      ? 'bg-slate-900 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
                  }`}
                >
                  By Category
                </button>
              </div>
            </div>

            {/* Recharts Bar Chart Container */}
            <div className="h-56 sm:h-64 w-full pt-1">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={last7DaysData}
                  margin={{ top: 12, right: 12, left: -12, bottom: 0 }}
                  onClick={(state: any) => {
                    if (state && state.activePayload && state.activePayload[0]) {
                      const clickedDate = state.activePayload[0].payload.date;
                      setSelectedPeriod(prev => prev === clickedDate ? 'all' : clickedDate);
                    }
                  }}
                >
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" opacity={0.8} />
                  <XAxis 
                    dataKey="dayLabel" 
                    tickLine={false} 
                    axisLine={{ stroke: '#CBD5E1' }}
                    tick={{ fill: '#475569', fontSize: 11, fontWeight: 500 }}
                  />
                  <YAxis 
                    tickLine={false} 
                    axisLine={false}
                    tick={{ fill: '#64748B', fontSize: 10 }}
                    tickFormatter={(val) => chartMetric === 'revenue' || chartMetric === 'categories' || chartMetric === 'yoy' ? `$${(val / 1000).toFixed(1)}k` : `${val}`}
                  />
                  <Tooltip 
                    cursor={{ fill: '#E2E8F0', opacity: 0.35 }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-slate-900/95 backdrop-blur-md text-white p-3 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-2 min-w-[220px] z-50">
                            <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                              <span className="font-bold text-amber-400">{data.dayLabel}</span>
                              <span className="text-[10px] text-slate-400">{data.date}</span>
                            </div>
                            
                            <div className="space-y-1">
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">2026 Current Revenue:</span>
                                <span className="font-bold text-emerald-400 text-sm">${data.revenue.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">2025 Baseline ({data.priorYearDate}):</span>
                                <span className="font-medium text-slate-300">${data.priorYearRevenue.toLocaleString()}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">YoY Revenue Growth:</span>
                                <span className="font-bold text-emerald-300 inline-flex items-center gap-0.5">
                                  <ArrowUpRight className="w-3 h-3 text-emerald-400" />
                                  +{data.yoyGrowth.toFixed(1)}% YoY
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Sales Volume:</span>
                                <span className="font-medium text-slate-200">{data.units} units ({data.transactions} txns)</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Avg Ticket (ATV):</span>
                                <span className="font-medium text-slate-200">${data.atv} / order</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Basket Depth (UPT):</span>
                                <span className="font-medium text-amber-300">{data.upt} UPT</span>
                              </div>
                            </div>

                            {chartMetric === 'categories' && (
                              <div className="pt-1.5 border-t border-slate-700/80 space-y-0.5 text-[11px]">
                                <div className="flex justify-between text-amber-300">
                                  <span>Footwear:</span>
                                  <span>${data.Footwear.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-blue-300">
                                  <span>Apparel:</span>
                                  <span>${data.Apparel.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-emerald-300">
                                  <span>Equipment:</span>
                                  <span>${data.Equipment.toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-purple-300">
                                  <span>Accessories:</span>
                                  <span>${data.Accessories.toLocaleString()}</span>
                                </div>
                              </div>
                            )}

                            {data.topProduct && (
                              <div className="pt-1.5 border-t border-slate-700/80 text-[10px] text-slate-400 flex items-center justify-between gap-1">
                                <span>Top Item:</span>
                                <span className="text-slate-200 font-medium truncate max-w-[120px]">{data.topProduct}</span>
                              </div>
                            )}

                            <div className="pt-1 text-[10px] text-center text-amber-400/90 italic border-t border-slate-800">
                              Click bar to filter card metrics to this day
                            </div>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />

                  {chartMetric === 'revenue' && (
                    <>
                      <ReferenceLine 
                        y={avg7DayRevenue} 
                        stroke="#94A3B8" 
                        strokeDasharray="4 4" 
                        label={{ value: `7D Avg: $${avg7DayRevenue.toLocaleString()}`, fill: '#64748B', fontSize: 10, position: 'insideTopRight' }} 
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="Daily Revenue" 
                        radius={[6, 6, 0, 0]}
                        cursor="pointer"
                      >
                        {last7DaysData.map((entry) => {
                          const isSelected = selectedPeriod === entry.date;
                          return (
                            <Cell 
                              key={`bar-cell-${entry.date}`} 
                              fill={isSelected ? '#F59E0B' : '#0F172A'} 
                            />
                          );
                        })}
                      </Bar>
                    </>
                  )}

                  {chartMetric === 'yoy' && (
                    <>
                      <Bar 
                        dataKey="priorYearRevenue" 
                        name="2025 Prior Year" 
                        fill="#94A3B8" 
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      />
                      <Bar 
                        dataKey="revenue" 
                        name="2026 Current" 
                        radius={[4, 4, 0, 0]}
                        cursor="pointer"
                      >
                        {last7DaysData.map((entry) => {
                          const isSelected = selectedPeriod === entry.date;
                          return (
                            <Cell 
                              key={`bar-yoy-cell-${entry.date}`} 
                              fill={isSelected ? '#F59E0B' : '#0F172A'} 
                            />
                          );
                        })}
                      </Bar>
                    </>
                  )}

                  {chartMetric === 'units' && (
                    <Bar 
                      dataKey="units" 
                      name="Units Sold" 
                      radius={[6, 6, 0, 0]}
                      cursor="pointer"
                    >
                      {last7DaysData.map((entry) => {
                        const isSelected = selectedPeriod === entry.date;
                        return (
                          <Cell 
                            key={`bar-unit-cell-${entry.date}`} 
                            fill={isSelected ? '#F59E0B' : '#2563EB'} 
                          />
                        );
                      })}
                    </Bar>
                  )}

                  {chartMetric === 'categories' && (
                    <>
                      <Bar dataKey="Footwear" stackId="cat" name="Footwear" fill="#F59E0B" radius={[0, 0, 0, 0]} cursor="pointer" />
                      <Bar dataKey="Apparel" stackId="cat" name="Apparel" fill="#2563EB" radius={[0, 0, 0, 0]} cursor="pointer" />
                      <Bar dataKey="Equipment" stackId="cat" name="Equipment" fill="#059669" radius={[0, 0, 0, 0]} cursor="pointer" />
                      <Bar dataKey="Accessories" stackId="cat" name="Accessories" fill="#9333EA" radius={[6, 6, 0, 0]} cursor="pointer" />
                    </>
                  )}
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* YoY comparison legend */}
            {chartMetric === 'yoy' && (
              <div className="flex items-center justify-center gap-5 text-[11px] pt-1 text-slate-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-900"></span>
                  <span className="font-semibold text-slate-900">2026 Current (Store Actuals)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-slate-400"></span>
                  <span>2025 Prior Year Benchmark</span>
                </div>
                <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>YoY Growth: +{salesMetrics.yoyRevenueGrowthPct.toFixed(1)}%</span>
                </div>
              </div>
            )}

            {/* Category legend when in category stacked mode */}
            {chartMetric === 'categories' && (
              <div className="flex items-center justify-center gap-4 text-[11px] pt-1 text-slate-600 flex-wrap">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-amber-500"></span>
                  <span>Footwear</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-blue-600"></span>
                  <span>Apparel</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-emerald-600"></span>
                  <span>Equipment</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-xs bg-purple-600"></span>
                  <span>Accessories</span>
                </div>
              </div>
            )}

            {/* Quick Interactive Legend & Status */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-slate-500 pt-1.5 border-t border-slate-200/80 gap-1.5">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-slate-900"></span>
                <span>Click any bar to filter cards below</span>
                {selectedPeriod !== 'all' && (
                  <button
                    id="reset-period-btn"
                    onClick={() => setSelectedPeriod('all')}
                    className="ml-2 font-bold text-amber-700 hover:text-amber-900 underline text-[11px]"
                  >
                    Reset to 7-Day Total
                  </button>
                )}
              </div>
              <div className="font-semibold text-slate-700">
                {peakDay && (
                  <span>Peak Day: {peakDay.dayLabel} (${peakDay.revenue.toLocaleString()})</span>
                )}
              </div>
            </div>
          </div>

          {/* Right 5 cols: Category Contribution */}
          <div id="category-contribution-panel" className="lg:col-span-5 p-4 rounded-xl border border-slate-200 bg-slate-50/40 space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <Layers className="w-4 h-4 text-slate-700" />
                  Category Contribution ({selectedPeriod === 'all' ? 'All History' : selectedPeriod})
                </h4>
                <p className="text-[11px] text-slate-500">Share of sales & basket driver analysis</p>
              </div>
            </div>

            <div className="space-y-2.5 pt-1">
              {Object.entries(salesMetrics.categoryTotals).map(([cat, data]) => {
                const pct = salesMetrics.totalRevenue > 0 ? (data.revenue / salesMetrics.totalRevenue) * 100 : 0;
                const catYoY = salesMetrics.categoryYoYGrowth[cat];
                return (
                  <div key={cat} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="font-semibold text-slate-800">{cat}</span>
                        {catYoY && (
                          <span 
                            id={`cat-yoy-badge-${cat.toLowerCase()}`}
                            className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.2 rounded border border-emerald-200/60 inline-flex items-center"
                            title={`2025 Prior Year: $${catYoY.priorYear.toLocaleString()}`}
                          >
                            +{catYoY.growthPct.toFixed(1)}% YoY
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-slate-500 text-[11px]">{data.units} units</span>
                        <span className="font-bold text-slate-900">${data.revenue.toLocaleString()}</span>
                        <span className="text-[11px] font-semibold text-slate-500 w-10 text-right">{pct.toFixed(0)}%</span>
                      </div>
                    </div>
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div
                        style={{ width: `${pct}%` }}
                        className={`h-full rounded-full transition-all ${
                          cat === 'Footwear' ? 'bg-amber-500' :
                          cat === 'Apparel' ? 'bg-blue-600' :
                          cat === 'Equipment' ? 'bg-emerald-600' : 'bg-purple-600'
                        }`}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Manager Basket Dynamics Tip */}
            <div id="basket-dynamics-insight" className="mt-3 p-2.5 rounded-lg bg-amber-50/80 border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
              <Sparkles className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-[11px] leading-relaxed">
                <strong>UPT Booster:</strong> Pairing AeroGlide Footwear with DryPro Apparel at fitting rooms has generated <strong>54% multi-unit baskets</strong>. Maintain cross-merchandise hooks on Gondola #1.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Predictive Sales Forecasting & Demand Projection Card */}
      <SalesForecastingCard
        historicalData={forecastingHistoricalData}
        onNavigateToWarehouse={() => onNavigate('warehouse')}
        onNavigateToEmployment={() => onNavigate('employment')}
      />

      {/* Two Column Section: Floor Coverage & Actionable Improvements */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Data Analysis & Challenging the Status Quo */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="font-bold text-slate-900 text-base">
                  Status Quo Analysis & Continuous Improvements
                </h3>
                <p className="text-xs text-slate-500">
                  Data-driven opportunities identified for District Manager collaboration & action
                </p>
              </div>
              <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-700">
                3 Active Actions
              </span>
            </div>

            <div className="mt-4 space-y-3">
              {/* Item 1 */}
              <div className="p-3.5 rounded-xl bg-rose-50/60 border border-rose-100 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-rose-100 text-rose-700 shrink-0 mt-0.5">
                  <AlertTriangle className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Footwear Stock Depletion: TrailVenture Gore-Tex (0 Store Units)
                    </p>
                    <span className="text-[11px] font-bold text-rose-700 bg-rose-200/60 px-2 py-0.5 rounded-full">
                      Urgent Replenish
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Store lost estimated $840 in weekend sales inquiries. Transfer TRF-2026-0903 requested from Regional DC. Expedited courier scheduled.
                  </p>
                  <div className="mt-2 flex items-center gap-2">
                    <button
                      onClick={() => onNavigate('warehouse')}
                      className="text-xs font-semibold text-rose-700 hover:text-rose-900 underline"
                    >
                      Track DC Transfer & Receive →
                    </button>
                  </div>
                </div>
              </div>

              {/* Item 2 */}
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-100 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 text-amber-700 shrink-0 mt-0.5">
                  <Target className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Peak Footfall Window: Friday 5:00 PM – 8:00 PM Service Maximization
                    </p>
                    <span className="text-[11px] font-bold text-amber-700 bg-amber-200/60 px-2 py-0.5 rounded-full">
                      Staffing Optimization
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Hourly conversion rate dips from 18% to 11% when sales team is in backroom processing. Shift schedule adjusted to ensure 100% floor presence with Asst. Manager Elena Rostova on duty.
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => onNavigate('employment')}
                      className="text-xs font-semibold text-amber-800 hover:text-amber-950 underline"
                    >
                      View Floor Staffing Matrix →
                    </button>
                  </div>
                </div>
              </div>

              {/* Item 3 */}
              <div className="p-3.5 rounded-xl bg-blue-50/60 border border-blue-100 flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 text-blue-700 shrink-0 mt-0.5">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold text-slate-900">
                      Visual Merchandising Compliance: Technical Outerwear Wall
                    </p>
                    <span className="text-[11px] font-bold text-blue-700 bg-blue-200/60 px-2 py-0.5 rounded-full">
                      Brand Directives
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">
                    Audit score 82% due to waterfall hanger spacing. Steam pressing scheduled prior to mall opening Saturday.
                  </p>
                  <div className="mt-2">
                    <button
                      onClick={() => onNavigate('store-design')}
                      className="text-xs font-semibold text-blue-700 hover:text-blue-900 underline"
                    >
                      Inspect VM Guidelines & Fixtures →
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right 1 Col: Manager On Duty & Operational Readiness */}
        <div className="space-y-4">
          {/* Manager on duty card */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm flex items-center justify-between">
              <span>Sales Floor Leadership</span>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Enforcing uninterrupted Manager On Duty coverage
            </p>

            <div className="mt-4 p-3 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Current Lead:</span>
                <span className="text-xs font-bold text-slate-900">Marcus Sterling</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Coverage Zone:</span>
                <span className="text-xs font-bold text-slate-900">Footwear & Central Floor</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-slate-500">Evening Handover:</span>
                <span className="text-xs font-bold text-slate-900">Elena Rostova (01:00 PM)</span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex items-center gap-1.5 text-[11px] text-emerald-700 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>100% floor coverage policy met</span>
              </div>
            </div>

            {/* Quick authorities list */}
            <div className="mt-4 pt-3 border-t border-slate-100">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                Store Manager Authorities
              </span>
              <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                <div className="p-2 rounded-lg bg-slate-50 text-slate-700 font-medium">
                  • Customers & Service
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-700 font-medium">
                  • Peers & Team
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-700 font-medium">
                  • Vendors & Facilities
                </div>
                <div className="p-2 rounded-lg bg-slate-50 text-slate-700 font-medium">
                  • Mall Administration
                </div>
              </div>
            </div>
          </div>

          {/* Quick stock status pulse */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
            <h3 className="font-bold text-slate-900 text-sm">Inventory Criticals</h3>
            <p className="text-xs text-slate-500 mt-0.5">Floor vs Stockroom balance</p>

            <div className="mt-3 space-y-2">
              {lowStockProducts.map(p => (
                <div key={p.id} className="p-2.5 rounded-xl bg-slate-50 flex items-center justify-between">
                  <div className="min-w-0 pr-2">
                    <p className="text-xs font-semibold text-slate-900 truncate">{p.name}</p>
                    <p className="text-[11px] text-slate-500">{p.sku} • Floor: {p.storeStock} | Back: {p.stockroomStock}</p>
                  </div>
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full shrink-0 ${
                    p.status === 'Out of Stock' ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
            </div>

            <button
              onClick={() => onNavigate('inventory')}
              className="mt-3 w-full py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-semibold text-xs transition-colors"
            >
              Open Full Inventory Manager →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
