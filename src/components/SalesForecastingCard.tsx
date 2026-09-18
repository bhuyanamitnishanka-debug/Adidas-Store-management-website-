import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Calendar,
  Sparkles,
  Info,
  Sliders,
  DollarSign,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Target,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  BarChart3
} from 'lucide-react';
import {
  ComposedChart,
  Bar,
  Line,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  Cell
} from 'recharts';

export interface HistoricalSalesDay {
  date: string;
  dayLabel?: string;
  revenue: number;
  units?: number;
  transactions?: number;
  categories?: {
    Footwear?: number;
    Apparel?: number;
    Equipment?: number;
    Accessories?: number;
  };
}

interface SalesForecastingCardProps {
  historicalData: HistoricalSalesDay[];
  onNavigateToWarehouse?: () => void;
  onNavigateToEmployment?: () => void;
}

type ForecastModel = 'pure' | 'seasonality';
type CategoryFilter = 'all' | 'Footwear' | 'Apparel' | 'Equipment' | 'Accessories';

export const SalesForecastingCard: React.FC<SalesForecastingCardProps> = ({
  historicalData,
  onNavigateToWarehouse,
  onNavigateToEmployment
}) => {
  const [modelMode, setModelMode] = useState<ForecastModel>('pure');
  const [selectedCategory, setSelectedCategory] = useState<CategoryFilter>('all');
  const [showConfidenceBand, setShowConfidenceBand] = useState<boolean>(true);
  const [hoveredPointDate, setHoveredPointDate] = useState<string | null>(null);

  // 1. Prepare chronological historical points based on category filter
  const historicalPoints = useMemo(() => {
    // Sort chronological ascending
    const sorted = [...historicalData].sort((a, b) => a.date.localeCompare(b.date));

    return sorted.map((item, index) => {
      let revenue = item.revenue;
      if (selectedCategory !== 'all' && item.categories && item.categories[selectedCategory] !== undefined) {
        revenue = item.categories[selectedCategory] || 0;
      }

      const parts = item.date.split('-');
      const y = parseInt(parts[0], 10);
      const m = parseInt(parts[1], 10) - 1;
      const d = parseInt(parts[2], 10);
      const dateObj = new Date(y, m, d);
      const weekday = dateObj.toLocaleDateString('en-US', { weekday: 'short' });

      return {
        x: index,
        date: item.date,
        dayLabel: `${weekday} ${d}`,
        weekday,
        revenue,
        units: item.units || 0,
        transactions: item.transactions || 0
      };
    });
  }, [historicalData, selectedCategory]);

  // 2. Perform Ordinary Least Squares (OLS) Linear Regression: y = mx + b
  const regressionModel = useMemo(() => {
    const N = historicalPoints.length;
    if (N < 2) {
      return {
        slope: 0,
        intercept: 0,
        rSquared: 0,
        stdError: 0,
        correlation: 0,
        predict: () => 0
      };
    }

    let sumX = 0;
    let sumY = 0;
    for (let i = 0; i < N; i++) {
      sumX += i;
      sumY += historicalPoints[i].revenue;
    }

    const meanX = sumX / N;
    const meanY = sumY / N;

    let ssXX = 0;
    let ssYY = 0;
    let ssXY = 0;

    for (let i = 0; i < N; i++) {
      const diffX = i - meanX;
      const diffY = historicalPoints[i].revenue - meanY;
      ssXX += diffX * diffX;
      ssYY += diffY * diffY;
      ssXY += diffX * diffY;
    }

    const slope = ssXX !== 0 ? ssXY / ssXX : 0;
    const intercept = meanY - slope * meanX;

    // R² and standard error
    let ssRes = 0;
    for (let i = 0; i < N; i++) {
      const yHat = slope * i + intercept;
      const res = historicalPoints[i].revenue - yHat;
      ssRes += res * res;
    }

    const rSquared = ssYY !== 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssYY)) : 0;
    const stdError = Math.sqrt(ssRes / Math.max(1, N - 2));
    const correlation = ssXX !== 0 && ssYY !== 0 ? ssXY / Math.sqrt(ssXX * ssYY) : 0;

    return {
      slope,
      intercept,
      rSquared,
      stdError,
      correlation,
      predict: (x: number) => slope * x + intercept
    };
  }, [historicalPoints]);

  // 3. Generate the Next 7 Days Forecast
  const next7DaysForecast = useMemo(() => {
    const N = historicalPoints.length;
    if (N === 0) return [];

    const lastPoint = historicalPoints[N - 1];
    const parts = lastPoint.date.split('-');
    const lastYear = parseInt(parts[0], 10);
    const lastMonth = parseInt(parts[1], 10) - 1;
    const lastDay = parseInt(parts[2], 10);

    const forecastDays = [];

    for (let k = 1; k <= 7; k++) {
      const futureDate = new Date(lastYear, lastMonth, lastDay + k);
      const yStr = futureDate.getFullYear();
      const mStr = String(futureDate.getMonth() + 1).padStart(2, '0');
      const dStr = String(futureDate.getDate()).padStart(2, '0');
      const dateStr = `${yStr}-${mStr}-${dStr}`;

      const weekdayShort = futureDate.toLocaleDateString('en-US', { weekday: 'short' });
      const weekdayFull = futureDate.toLocaleDateString('en-US', { weekday: 'long' });
      const monthShort = futureDate.toLocaleDateString('en-US', { month: 'short' });
      const dayNum = futureDate.getDate();

      const futureX = N - 1 + k;
      const pureLinearRev = regressionModel.predict(futureX);

      // Optional weekend footfall retail adjustment
      let seasonalityMultiplier = 1.0;
      if (modelMode === 'seasonality') {
        if (weekdayShort === 'Sat') seasonalityMultiplier = 1.18; // +18% peak mall footfall
        else if (weekdayShort === 'Sun') seasonalityMultiplier = 1.12; // +12% weekend family traffic
        else if (weekdayShort === 'Fri') seasonalityMultiplier = 1.06; // +6% Friday evening shopping
      }

      const predictedRevenue = Math.max(0, Math.round(pureLinearRev * seasonalityMultiplier));

      // 95% Confidence Band calculation: ± 1.96 * Se * sqrt(1 + 1/N + (x - xBar)^2 / ssXX)
      const meanX = (N - 1) / 2;
      const ssXX = (N * (N * N - 1)) / 12;
      const leverage = 1 + 1 / N + Math.pow(futureX - meanX, 2) / Math.max(1, ssXX);
      const margin = Math.round(1.96 * regressionModel.stdError * Math.sqrt(leverage));

      const lowerBound = Math.max(0, predictedRevenue - margin);
      const upperBound = predictedRevenue + margin;

      // Operational floor guidance based on weekday and volume
      let floorAction = 'Standard Floor Coverage';
      let floorBadge = 'Normal Flow';
      if (weekdayShort === 'Sat' || weekdayShort === 'Sun') {
        floorAction = 'Weekend Peak: Maintain 4 floor staff & expedite fitting room turns';
        floorBadge = 'High Footfall';
      } else if (weekdayShort === 'Mon') {
        floorAction = 'Inventory Intake: Process regional DC replenishment pallets';
        floorBadge = 'Restock Shift';
      } else if (weekdayShort === 'Fri') {
        floorAction = 'Evening Rush: Deploy Assistant Manager on Footwear zone';
        floorBadge = 'Evening Surge';
      } else {
        floorAction = 'Visual Merchandising maintenance & stockroom bin audits';
        floorBadge = 'Steady Flow';
      }

      forecastDays.push({
        x: futureX,
        date: dateStr,
        dayLabel: `${weekdayShort} ${dayNum}`,
        fullDate: `${weekdayFull}, ${monthShort} ${dayNum}`,
        weekday: weekdayShort,
        predictedRevenue,
        pureLinearRev: Math.max(0, Math.round(pureLinearRev)),
        lowerBound,
        upperBound,
        confidenceMargin: margin,
        floorAction,
        floorBadge,
        isForecast: true
      });
    }

    return forecastDays;
  }, [historicalPoints, regressionModel, modelMode]);

  // 4. Combine historical points and forecast points for the unified Recharts timeline
  const combinedTimelineData = useMemo(() => {
    const historicalSeries = historicalPoints.map(p => {
      const fittedValue = Math.max(0, Math.round(regressionModel.predict(p.x)));
      return {
        x: p.x,
        date: p.date,
        dayLabel: p.dayLabel,
        actualRevenue: p.revenue,
        predictedRevenue: null as number | null,
        trendLine: fittedValue,
        confidenceArea: [fittedValue, fittedValue] as [number, number],
        isForecast: false,
        stage: 'Historical Actual'
      };
    });

    const forecastSeries = next7DaysForecast.map(f => {
      return {
        x: f.x,
        date: f.date,
        dayLabel: `${f.dayLabel}*`,
        actualRevenue: null as number | null,
        predictedRevenue: f.predictedRevenue,
        trendLine: f.pureLinearRev,
        confidenceArea: [f.lowerBound, f.upperBound] as [number, number],
        lowerBound: f.lowerBound,
        upperBound: f.upperBound,
        isForecast: true,
        stage: 'Linear Projection'
      };
    });

    return [...historicalSeries, ...forecastSeries];
  }, [historicalPoints, regressionModel, next7DaysForecast]);

  // 5. Aggregate Summary KPIs
  const historicalTotal = useMemo(() => {
    return historicalPoints.reduce((acc, curr) => acc + curr.revenue, 0);
  }, [historicalPoints]);

  const historicalAvg = useMemo(() => {
    return historicalPoints.length > 0 ? Math.round(historicalTotal / historicalPoints.length) : 0;
  }, [historicalPoints, historicalTotal]);

  const forecastTotal = useMemo(() => {
    return next7DaysForecast.reduce((acc, curr) => acc + curr.predictedRevenue, 0);
  }, [next7DaysForecast]);

  const forecastAvg = useMemo(() => {
    return next7DaysForecast.length > 0 ? Math.round(forecastTotal / next7DaysForecast.length) : 0;
  }, [next7DaysForecast, forecastTotal]);

  const forecastVarianceDelta = forecastTotal - historicalTotal;
  const forecastVariancePct = historicalTotal > 0 ? (forecastVarianceDelta / historicalTotal) * 100 : 0;

  // Slope direction & velocity
  const isPositiveSlope = regressionModel.slope >= 0;
  const slopeAbs = Math.abs(regressionModel.slope);

  // Peak forecast day
  const peakForecastDay = useMemo(() => {
    if (next7DaysForecast.length === 0) return null;
    return [...next7DaysForecast].sort((a, b) => b.predictedRevenue - a.predictedRevenue)[0];
  }, [next7DaysForecast]);

  return (
    <div
      id="sales-forecasting-card"
      className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden transition-all"
    >
      {/* Card Header & Controls */}
      <div className="p-5 sm:p-6 border-b border-slate-100 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-50/50">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-1.5 bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/80">
              <Activity className="w-3.5 h-3.5 text-amber-600" />
              Predictive Commercial Analytics
            </span>
            <span
              id="forecasting-model-badge"
              className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-slate-900 text-white inline-flex items-center gap-1 shadow-2xs"
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-400" />
              Linear Regression Trend Line (y = mx + b)
            </span>
            <span className="text-[11px] font-semibold text-slate-500 hidden sm:inline">
              • Next 7 Days Revenue Outlook
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <span>Sales Forecasting & Demand Projection</span>
          </h3>
          <p className="text-xs text-slate-500">
            Utilizes historical 7-day revenue data to calculate the linear regression trajectory, predict daily demand, and optimize upcoming labor and stock allocation.
          </p>
        </div>

        {/* Action Controls: Model Mode & Confidence Toggle */}
        <div className="flex items-center gap-2 flex-wrap shrink-0">
          {/* Mode Switcher */}
          <div className="flex items-center bg-white p-1 rounded-xl border border-slate-200 shadow-2xs">
            <button
              id="btn-forecast-model-pure"
              onClick={() => setModelMode('pure')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                modelMode === 'pure'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Predict strictly using Ordinary Least Squares linear regression line"
            >
              <Activity className="w-3.5 h-3.5 text-amber-400" />
              <span>Pure OLS Line</span>
            </button>

            <button
              id="btn-forecast-model-seasonality"
              onClick={() => setModelMode('seasonality')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                modelMode === 'seasonality'
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
              title="Apply retail weekend traffic lift factor on top of the linear regression baseline"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Trend + Weekend Lift</span>
            </button>
          </div>

          {/* Confidence corridor toggle */}
          <button
            id="btn-toggle-confidence-band"
            onClick={() => setShowConfidenceBand(prev => !prev)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
              showConfidenceBand
                ? 'bg-amber-50 text-amber-900 border-amber-300'
                : 'bg-white text-slate-600 hover:bg-slate-100 border-slate-200'
            }`}
            title="Toggle 95% statistical confidence corridor"
          >
            <Sliders className="w-3.5 h-3.5 text-amber-600" />
            <span>95% Confidence Band</span>
          </button>
        </div>
      </div>

      {/* Category Segment Tabs */}
      <div className="px-5 sm:px-6 py-2.5 bg-slate-100/70 border-b border-slate-200/80 flex items-center justify-between gap-3 overflow-x-auto">
        <div className="flex items-center gap-1.5 shrink-0">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-1 mr-1">
            <Layers className="w-3.5 h-3.5" />
            Segment:
          </span>
          {(['all', 'Footwear', 'Apparel', 'Equipment', 'Accessories'] as CategoryFilter[]).map(cat => (
            <button
              key={cat}
              id={`forecast-category-${cat.toLowerCase()}`}
              onClick={() => setSelectedCategory(cat)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-200/80 border border-slate-200'
              }`}
            >
              {cat === 'all' ? 'All Retail Lines' : cat}
            </button>
          ))}
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden sm:flex items-center gap-2">
          <span>Historical sample: <strong>{historicalPoints.length} days</strong></span>
          <span>•</span>
          <span>Forecast horizon: <strong>7 days</strong></span>
        </div>
      </div>

      {/* 4 Core Forecasting Metric KPI Tiles */}
      <div className="p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-white">
        {/* KPI 1: Projected 7-Day Revenue */}
        <div
          id="kpi-forecast-total"
          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                7-Day Projected Revenue
              </span>
              <div className="flex items-baseline gap-2 mt-1 flex-wrap">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  ${forecastTotal.toLocaleString()}
                </p>
                <span
                  id="kpi-forecast-variance-badge"
                  className={`text-xs font-bold px-2 py-0.5 rounded-full inline-flex items-center gap-1 ${
                    forecastVarianceDelta >= 0
                      ? 'text-emerald-700 bg-emerald-100 border border-emerald-200'
                      : 'text-amber-800 bg-amber-100 border border-amber-200'
                  }`}
                  title={`Variance vs Last 7 Days Actual ($${historicalTotal.toLocaleString()})`}
                >
                  {forecastVarianceDelta >= 0 ? (
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  ) : (
                    <ArrowDownRight className="w-3.5 h-3.5" />
                  )}
                  {forecastVarianceDelta >= 0 ? '+' : ''}
                  {forecastVariancePct.toFixed(1)}% vs Last 7D
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-amber-100/70 text-amber-800">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span>Historical 7D Baseline:</span>
              <span className="font-semibold text-slate-900">${historicalTotal.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Projected Net Shift:</span>
              <span className={`font-semibold ${forecastVarianceDelta >= 0 ? 'text-emerald-600' : 'text-amber-700'}`}>
                {forecastVarianceDelta >= 0 ? '+' : ''}${forecastVarianceDelta.toLocaleString()}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 2: Regression Trend Velocity (Slope m) */}
        <div
          id="kpi-forecast-slope"
          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Trend Slope (Velocity)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {isPositiveSlope ? '+' : '-'}${Math.round(slopeAbs)}
                  <span className="text-sm font-normal text-slate-500 ml-1">/ day</span>
                </p>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                    isPositiveSlope
                      ? 'text-emerald-700 bg-emerald-100'
                      : 'text-slate-700 bg-slate-200'
                  }`}
                >
                  {isPositiveSlope ? 'Expanding' : 'Compressing'}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-blue-100/70 text-blue-700">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span>Regression Equation:</span>
              <span className="font-mono text-[11px] font-bold text-slate-800">
                ŷ = {Math.round(regressionModel.slope)}x + ${Math.round(regressionModel.intercept).toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Primary Driver:</span>
              <span className="font-medium text-slate-800">
                {isPositiveSlope ? 'Weekend Momentum' : 'Stockout Drag on TrailVenture'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 3: Model Fit (R² Determination) */}
        <div
          id="kpi-forecast-rsquared"
          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Goodness of Fit (R²)
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
                  {(regressionModel.rSquared * 100).toFixed(1)}%
                </p>
                <span className="text-xs font-bold text-purple-700 bg-purple-100 px-2 py-0.5 rounded-full">
                  R² = {regressionModel.rSquared.toFixed(2)}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-purple-100/70 text-purple-700">
              <Target className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span>Std Error of Est (Se):</span>
              <span className="font-semibold text-slate-900">±${Math.round(regressionModel.stdError).toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Linear Fit Strength:</span>
              <span className="font-medium text-purple-800">
                {regressionModel.rSquared > 0.7 ? 'Strong Correlation' : regressionModel.rSquared > 0.4 ? 'Moderate Fit' : 'Volatile Baseline'}
              </span>
            </div>
          </div>
        </div>

        {/* KPI 4: Projected Peak Day */}
        <div
          id="kpi-forecast-peak-day"
          className="p-4 rounded-xl bg-slate-50/80 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                Projected Peak Day
              </span>
              <div className="flex items-baseline gap-2 mt-1">
                <p className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
                  {peakForecastDay ? peakForecastDay.dayLabel : 'N/A'}
                </p>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  ${peakForecastDay ? peakForecastDay.predictedRevenue.toLocaleString() : 0}
                </span>
              </div>
            </div>
            <div className="p-2 rounded-xl bg-emerald-100/70 text-emerald-700">
              <Calendar className="w-5 h-5" />
            </div>
          </div>

          <div className="pt-2 border-t border-slate-200/80 text-xs space-y-1">
            <div className="flex items-center justify-between text-slate-600">
              <span>Projected Daily Avg:</span>
              <span className="font-semibold text-slate-900">${forecastAvg.toLocaleString()} / day</span>
            </div>
            <div className="flex items-center justify-between text-slate-600">
              <span>Peak Focus:</span>
              <span className="font-medium text-slate-800">Footwear Fitting Room Rush</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Interactive Recharts Forecast Chart */}
      <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-white space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <BarChart3 className="w-4 h-4 text-slate-700" />
              14-Day Trajectory: Historical Actuals vs 7-Day Linear Regression Forecast
            </h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Solid dark bars denote recorded historical revenue; amber striped bars indicate future 7-day linear model projections.
            </p>
          </div>

          {/* Interactive Legend */}
          <div className="flex items-center gap-3 text-xs flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-slate-900 inline-block"></span>
              <span className="text-slate-700 font-medium">Actual Revenue (Last 7D)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded-xs bg-amber-500 inline-block"></span>
              <span className="text-slate-700 font-medium">Predicted Revenue (Next 7D)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-4 h-0.5 bg-blue-600 border-t border-dashed border-blue-600 inline-block"></span>
              <span className="text-slate-700 font-medium">Linear Trend Line (ŷ)</span>
            </div>
            {showConfidenceBand && (
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-xs bg-amber-200/70 inline-block"></span>
                <span className="text-slate-700 font-medium">95% Confidence Band</span>
              </div>
            )}
          </div>
        </div>

        {/* Chart Canvas */}
        <div className="h-72 sm:h-80 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={combinedTimelineData}
              margin={{ top: 16, right: 16, left: -10, bottom: 8 }}
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
                tickFormatter={val => `$${(val / 1000).toFixed(1)}k`}
              />

              <Tooltip
                cursor={{ fill: '#F1F5F9', opacity: 0.5 }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    const isForecast = data.isForecast;

                    return (
                      <div className="bg-slate-900/95 backdrop-blur-md text-white p-3.5 rounded-xl shadow-xl border border-slate-700/80 text-xs space-y-2 min-w-[240px] z-50">
                        <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
                          <div>
                            <span className="font-bold text-amber-400 text-sm">
                              {data.dayLabel.replace('*', '')}
                            </span>
                            <span className="text-[10px] text-slate-400 block">{data.date}</span>
                          </div>
                          <span
                            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                              isForecast
                                ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                                : 'bg-slate-800 text-slate-300 border border-slate-700'
                            }`}
                          >
                            {isForecast ? 'Forecast Day' : 'Recorded Actual'}
                          </span>
                        </div>

                        <div className="space-y-1.5 pt-0.5">
                          {isForecast ? (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Predicted Revenue:</span>
                                <span className="font-bold text-amber-400 text-base">
                                  ${data.predictedRevenue?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Regression Baseline (ŷ):</span>
                                <span className="font-medium text-slate-300">
                                  ${data.trendLine?.toLocaleString()}
                                </span>
                              </div>
                              {data.lowerBound !== undefined && (
                                <div className="flex items-center justify-between text-[11px]">
                                  <span className="text-slate-400">95% Confidence Corridor:</span>
                                  <span className="font-medium text-amber-200">
                                    ${data.lowerBound.toLocaleString()} – ${data.upperBound.toLocaleString()}
                                  </span>
                                </div>
                              )}
                              <div className="pt-1 border-t border-slate-800 text-[10px] text-slate-400">
                                Model: Linear OLS {modelMode === 'seasonality' ? '+ Weekend Lift' : ''}
                              </div>
                            </>
                          ) : (
                            <>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Actual Revenue:</span>
                                <span className="font-bold text-emerald-400 text-base">
                                  ${data.actualRevenue?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Trend Fit Target:</span>
                                <span className="font-medium text-slate-300">
                                  ${data.trendLine?.toLocaleString()}
                                </span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className="text-slate-400">Residual Variance:</span>
                                <span
                                  className={`font-semibold ${
                                    data.actualRevenue - data.trendLine >= 0
                                      ? 'text-emerald-400'
                                      : 'text-amber-400'
                                  }`}
                                >
                                  {data.actualRevenue - data.trendLine >= 0 ? '+' : ''}
                                  ${(data.actualRevenue - data.trendLine).toLocaleString()}
                                </span>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Forecast Horizon Boundary Divider */}
              <ReferenceLine
                x={`${historicalPoints[historicalPoints.length - 1]?.dayLabel}`}
                stroke="#F59E0B"
                strokeWidth={2}
                strokeDasharray="4 4"
                label={{
                  value: 'Forecast Horizon →',
                  fill: '#D97706',
                  fontSize: 10,
                  fontWeight: 700,
                  position: 'insideTopRight'
                }}
              />

              {/* Historical Average Reference Line */}
              <ReferenceLine
                y={historicalAvg}
                stroke="#94A3B8"
                strokeDasharray="3 3"
                label={{
                  value: `Historical Avg: $${historicalAvg.toLocaleString()}`,
                  fill: '#64748B',
                  fontSize: 10,
                  position: 'insideBottomLeft'
                }}
              />

              {/* Optional 95% Confidence Corridor Area (rendered under the lines) */}
              {showConfidenceBand && (
                <Area
                  dataKey="confidenceArea"
                  fill="#FDE68A"
                  fillOpacity={0.35}
                  stroke="#F59E0B"
                  strokeOpacity={0.4}
                  strokeDasharray="2 2"
                  name="95% Confidence Interval"
                  isAnimationActive={false}
                />
              )}

              {/* Historical Bars */}
              <Bar
                dataKey="actualRevenue"
                name="Actual Daily Revenue"
                fill="#0F172A"
                radius={[4, 4, 0, 0]}
              >
                {combinedTimelineData.map((entry, idx) => (
                  <Cell
                    key={`actual-bar-${entry.date}-${idx}`}
                    fill={hoveredPointDate === entry.date ? '#1E293B' : '#0F172A'}
                  />
                ))}
              </Bar>

              {/* Predicted Future Bars */}
              <Bar
                dataKey="predictedRevenue"
                name="Projected Revenue"
                fill="#F59E0B"
                radius={[4, 4, 0, 0]}
              >
                {combinedTimelineData.map((entry, idx) => (
                  <Cell
                    key={`predicted-bar-${entry.date}-${idx}`}
                    fill={hoveredPointDate === entry.date ? '#D97706' : '#F59E0B'}
                    fillOpacity={0.9}
                  />
                ))}
              </Bar>

              {/* Unified Linear Regression Trend Line */}
              <Line
                type="linear"
                dataKey="trendLine"
                name="Linear Regression Trend Line"
                stroke="#2563EB"
                strokeWidth={2.5}
                dot={{ r: 3, fill: '#2563EB', strokeWidth: 1.5, stroke: '#FFFFFF' }}
                activeDot={{ r: 5, fill: '#1D4ED8' }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        {/* Regression Details Sub-Banner */}
        <div className="p-3.5 rounded-xl bg-slate-900 text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30 shrink-0">
              <Activity className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-bold text-white tracking-wide">Fitted Linear Regression Model:</span>
                <span className="font-mono text-amber-300 font-bold px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700">
                  Revenue(t) = {regressionModel.slope >= 0 ? '+' : ''}
                  {regressionModel.slope.toFixed(2)} · t + ${regressionModel.intercept.toFixed(2)}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Model correlation coefficient: r = {regressionModel.correlation.toFixed(3)} • R² = {(regressionModel.rSquared * 100).toFixed(1)}% explained variance
              </p>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] shrink-0 self-start sm:self-auto border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
            <div>
              <span className="text-slate-400 block uppercase font-medium">Std Error</span>
              <span className="font-bold text-slate-200">±${Math.round(regressionModel.stdError).toLocaleString()}</span>
            </div>
            <div>
              <span className="text-slate-400 block uppercase font-medium">Daily Velocity</span>
              <span className={`font-bold ${isPositiveSlope ? 'text-emerald-400' : 'text-amber-400'}`}>
                {isPositiveSlope ? '+' : ''}${Math.round(regressionModel.slope)}/day
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 7-Day Day-by-Day Forecast Breakdown Cards */}
      <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-slate-50/40 space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-slate-700" />
              Day-by-Day Forecast Roster & Operational Directives
            </h4>
            <p className="text-[11px] text-slate-500">
              Granular daily projections with scheduled store floor action recommendations
            </p>
          </div>
          <span className="text-xs font-bold text-slate-600 bg-slate-200/80 px-2.5 py-1 rounded-full">
            Sept 19 – Sept 25, 2026
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {next7DaysForecast.map((day, idx) => {
            const isPeak = peakForecastDay?.date === day.date;
            const varianceFromAvg = forecastAvg > 0 ? ((day.predictedRevenue - forecastAvg) / forecastAvg) * 100 : 0;

            return (
              <div
                key={day.date}
                id={`forecast-day-card-${idx + 1}`}
                onMouseEnter={() => setHoveredPointDate(day.date)}
                onMouseLeave={() => setHoveredPointDate(null)}
                className={`p-3 rounded-xl border transition-all flex flex-col justify-between space-y-2.5 ${
                  isPeak
                    ? 'bg-amber-50/90 border-amber-300 ring-1 ring-amber-300/60 shadow-2xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
                }`}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">
                      {day.weekday}
                    </span>
                    <span className="text-xs font-bold text-slate-900">{day.date.slice(5)}</span>
                  </div>
                  <span
                    className={`text-[9px] font-bold px-1.5 py-0.5 rounded-full ${
                      isPeak
                        ? 'bg-amber-500 text-slate-950 font-extrabold'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    Day +{idx + 1}
                  </span>
                </div>

                <div>
                  <div className="text-base font-extrabold text-slate-900">
                    ${day.predictedRevenue.toLocaleString()}
                  </div>
                  <div className="flex items-center gap-1 text-[10px] text-slate-500 mt-0.5">
                    <span
                      className={`font-semibold ${
                        varianceFromAvg >= 0 ? 'text-emerald-600' : 'text-slate-500'
                      }`}
                    >
                      {varianceFromAvg >= 0 ? '+' : ''}
                      {varianceFromAvg.toFixed(0)}% vs avg
                    </span>
                  </div>
                </div>

                <div className="pt-2 border-t border-slate-100 text-[10px] space-y-1">
                  <div className="text-slate-500">
                    Range: <span className="font-semibold text-slate-800">${day.lowerBound.toLocaleString()} - ${day.upperBound.toLocaleString()}</span>
                  </div>
                  <div className="text-[10px] text-amber-900/90 font-medium leading-tight">
                    {day.floorBadge}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Operational Recommendations / Manager Action Directives */}
      <div className="p-5 sm:p-6 border-t border-slate-200/80 bg-white">
        <div className="p-4 rounded-xl bg-slate-900 text-white flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shrink-0 mt-0.5">
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h5 className="text-xs font-bold uppercase tracking-wider text-amber-400">
                  Managerial Directive & Supply Chain Synchronization
                </h5>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  Active Operational Alignment
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-3xl">
                The linear regression model projects <strong>${forecastTotal.toLocaleString()}</strong> in gross retail receipts over the upcoming 7-day cycle. Recent negative velocity was triggered by stockouts in <em>TrailVenture Gore-Tex</em> and <em>CloudPulse Max</em>. Receiving the pending Regional DC transfer (TRF-2026-0903) will reverse this slope and capture an estimated <strong>+$2,400 in incremental footwear revenue</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0 self-start md:self-auto">
            {onNavigateToWarehouse && (
              <button
                id="btn-forecast-go-warehouse"
                onClick={onNavigateToWarehouse}
                className="px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
              >
                <span>Expedite DC Stock</span>
                <ArrowUpRight className="w-4 h-4" />
              </button>
            )}

            {onNavigateToEmployment && (
              <button
                id="btn-forecast-go-employment"
                onClick={onNavigateToEmployment}
                className="px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs transition-all flex items-center gap-1.5 border border-slate-700 cursor-pointer"
              >
                <span>Adjust Shifts</span>
                <Calendar className="w-3.5 h-3.5 text-amber-400" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
