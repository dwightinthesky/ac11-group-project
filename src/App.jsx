import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  AlertCircle,
  DollarSign,
  Target,
  Activity,
  Settings,
  BarChart2,
} from 'lucide-react';

export default function App() {
  // Initial state (based on source case assumptions)
  const [price, setPrice] = useState(7.0);
  const [vc, setVc] = useState(4.5);
  const [fc, setFc] = useState(6700000);
  const [volume, setVolume] = useState(2400000);
  const [targetProfit, setTargetProfit] = useState(3000000);

  // Core CVP calculations
  const calculations = useMemo(() => {
    const cmUnit = price - vc;
    const cmRatio = cmUnit > 0 ? (cmUnit / price) * 100 : 0;

    const revenue = price * volume;
    const totalVc = vc * volume;
    const totalCost = fc + totalVc;
    const ebit = revenue - totalCost;

    const bepUnits = cmUnit > 0 ? fc / cmUnit : Infinity;
    const bepRevenue = Number.isFinite(bepUnits) ? bepUnits * price : Infinity;

    const targetUnits = cmUnit > 0 ? (fc + targetProfit) / cmUnit : Infinity;

    return {
      cmUnit,
      cmRatio,
      revenue,
      totalVc,
      totalCost,
      ebit,
      bepUnits,
      bepRevenue,
      targetUnits,
    };
  }, [price, vc, fc, volume, targetProfit]);

  // Number formatting helpers
  const formatCurrency = (num) => {
    if (!Number.isFinite(num)) return 'N/A';
    return `Rs ${Math.round(num).toLocaleString('en-IN')}`;
  };

  const formatNumber = (num) => {
    if (!Number.isFinite(num)) return 'N/A';
    return Math.round(num).toLocaleString('en-IN');
  };

  // Custom SVG CVP chart component
  const CVPChart = () => {
    const maxVolumeX = 5000000; // X-axis max value (5 million units)
    const maxRevenueY = Math.max(price * maxVolumeX, fc + vc * maxVolumeX); // Y-axis max value

    // SVG size
    const width = 600;
    const height = 300;
    const padding = { top: 20, right: 20, bottom: 40, left: 80 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    // Coordinate conversion helpers
    const scaleX = (val) => padding.left + (val / maxVolumeX) * innerWidth;
    const scaleY = (val) =>
      padding.top + innerHeight - (val / maxRevenueY) * innerHeight;

    // Calculate line coordinates
    const revenueLine = {
      x1: scaleX(0),
      y1: scaleY(0),
      x2: scaleX(maxVolumeX),
      y2: scaleY(price * maxVolumeX),
    };

    const costLine = {
      x1: scaleX(0),
      y1: scaleY(fc),
      x2: scaleX(maxVolumeX),
      y2: scaleY(fc + vc * maxVolumeX),
    };

    const fcLine = {
      x1: scaleX(0),
      y1: scaleY(fc),
      x2: scaleX(maxVolumeX),
      y2: scaleY(fc),
    };

    const isBepValid = calculations.bepUnits > 0 && calculations.bepUnits <= maxVolumeX * 1.5;

    return (
      <div className="w-full overflow-x-auto">
        <svg
          viewBox={`0 0 ${width} ${height}`}
          className="mx-auto h-auto w-full max-w-2xl font-sans drop-shadow-sm"
        >
          {/* Background grid (Y) */}
          {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => (
            <g key={`grid-y-${i}`}>
              <line
                x1={padding.left}
                y1={padding.top + innerHeight * ratio}
                x2={width - padding.right}
                y2={padding.top + innerHeight * ratio}
                stroke="#e5e7eb"
                strokeWidth="1"
              />
              <text
                x={padding.left - 10}
                y={padding.top + innerHeight * ratio + 4}
                textAnchor="end"
                fontSize="10"
                fill="#6b7280"
              >
                {(maxRevenueY * (1 - ratio) / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}

          {/* Background grid (X) */}
          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
            <g key={`grid-x-${i}`}>
              <line
                x1={padding.left + innerWidth * ratio}
                y1={padding.top}
                x2={padding.left + innerWidth * ratio}
                y2={height - padding.bottom}
                stroke="#e5e7eb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left + innerWidth * ratio}
                y={height - padding.bottom + 20}
                textAnchor="middle"
                fontSize="10"
                fill="#6b7280"
              >
                {(maxVolumeX * ratio / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}

          {/* Axes */}
          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#9ca3af"
            strokeWidth="2"
          />

          <text
            x={padding.left - 40}
            y={padding.top - 5}
            fontSize="12"
            fill="#4b5563"
            fontWeight="bold"
          >
            Amount (Rs)
          </text>
          <text
            x={width - padding.right + 5}
            y={height - padding.bottom + 5}
            fontSize="12"
            fill="#4b5563"
            fontWeight="bold"
          >
            Output
          </text>

          {/* Fixed cost line */}
          <line {...fcLine} stroke="#9ca3af" strokeWidth="2" strokeDasharray="5 5" />
          <text
            x={width - padding.right - 60}
            y={fcLine.y1 - 10}
            fontSize="12"
            fill="#6b7280"
          >
            Fixed Cost
          </text>

          {/* Total cost line */}
          <line {...costLine} stroke="#ef4444" strokeWidth="3" />
          <text
            x={width - padding.right - 50}
            y={costLine.y2 - 10}
            fontSize="12"
            fill="#ef4444"
            fontWeight="bold"
          >
            Total Cost
          </text>

          {/* Total revenue line */}
          <line {...revenueLine} stroke="#22c55e" strokeWidth="3" />
          <text
            x={width - padding.right - 50}
            y={revenueLine.y2 - 10}
            fontSize="12"
            fill="#22c55e"
            fontWeight="bold"
          >
            Total Revenue
          </text>

          {/* Current expected volume marker */}
          <line
            x1={scaleX(volume)}
            y1={padding.top}
            x2={scaleX(volume)}
            y2={height - padding.bottom}
            stroke="#3b82f6"
            strokeWidth="2"
            strokeDasharray="4 4"
            opacity="0.5"
          />
          <circle
            cx={scaleX(volume)}
            cy={scaleY(calculations.ebit > 0 ? calculations.revenue : calculations.totalCost)}
            r="4"
            fill="#3b82f6"
          />

          {/* Break-even point */}
          {isBepValid && (
            <g>
              <circle
                cx={scaleX(calculations.bepUnits)}
                cy={scaleY(calculations.bepRevenue)}
                r="6"
                fill="#f59e0b"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={scaleX(calculations.bepUnits)}
                y={scaleY(calculations.bepRevenue) - 15}
                textAnchor="middle"
                fontSize="12"
                fill="#d97706"
                fontWeight="bold"
              >
                BEP
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 font-sans text-gray-800 md:p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div>
            <h1 className="flex items-center gap-3 text-2xl font-bold text-gray-900 md:text-3xl">
              <Activity className="text-blue-600" />
              Fly Ash Brick Project CVP Interactive Analyzer
            </h1>
            <p className="mt-2 text-gray-500">
              Simulate how changes in price, cost, and sales volume affect profit and break-even in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
          {/* Left: Controls */}
          <div className="space-y-6 lg:col-span-4">
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 border-b pb-2 text-lg font-bold">
                <Settings className="h-5 w-5 text-gray-500" /> Parameter Settings
              </h2>

              <div className="space-y-5">
                {/* Unit price */}
                <div>
                  <label className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                    <span>Unit Selling Price (Rs / block)</span>
                    <span className="font-bold text-blue-600">{price.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="4"
                    max="15"
                    step="0.1"
                    value={price}
                    onChange={(e) => setPrice(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-blue-600"
                  />
                </div>

                {/* Unit variable cost */}
                <div>
                  <label className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                    <span>Unit Variable Cost (Rs / block)</span>
                    <span className="font-bold text-red-500">{vc.toFixed(2)}</span>
                  </label>
                  <input
                    type="range"
                    min="2"
                    max="10"
                    step="0.1"
                    value={vc}
                    onChange={(e) => setVc(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-red-500"
                  />
                </div>

                {/* Annual fixed cost */}
                <div>
                  <label className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                    <span>Total Annual Fixed Cost (Rs)</span>
                    <span className="font-bold text-orange-500">{formatNumber(fc)}</span>
                  </label>
                  <input
                    type="range"
                    min="3000000"
                    max="15000000"
                    step="100000"
                    value={fc}
                    onChange={(e) => setFc(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-orange-500"
                  />
                </div>

                {/* Volume */}
                <div className="border-t pt-4">
                  <label className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                    <span>Estimated Annual Sales Volume (blocks)</span>
                    <span className="font-bold text-indigo-600">{formatNumber(volume)}</span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="5000000"
                    step="50000"
                    value={volume}
                    onChange={(e) => setVolume(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-indigo-600"
                  />
                </div>

                {/* Target profit */}
                <div className="border-t pt-4">
                  <label className="mb-1 flex justify-between text-sm font-medium text-gray-700">
                    <span>Target Profit (Rs)</span>
                    <span className="font-bold text-emerald-600">
                      {formatNumber(targetProfit)}
                    </span>
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="10000000"
                    step="100000"
                    value={targetProfit}
                    onChange={(e) => setTargetProfit(Number(e.target.value))}
                    className="h-2 w-full cursor-pointer appearance-none rounded-lg bg-gray-200 accent-emerald-600"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Results + chart */}
          <div className="space-y-6 lg:col-span-8">
            {/* KPI cards */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <div
                className={`rounded-2xl border p-4 ${
                  calculations.ebit >= 0
                    ? 'border-green-200 bg-green-50'
                    : 'border-red-200 bg-red-50'
                }`}
              >
                <div className="mb-2 flex items-center gap-2">
                  <DollarSign
                    className={`h-5 w-5 ${
                      calculations.ebit >= 0 ? 'text-green-600' : 'text-red-600'
                    }`}
                  />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Estimated Operating Profit (EBIT)
                  </h3>
                </div>
                <p
                  className={`text-2xl font-black ${
                    calculations.ebit >= 0 ? 'text-green-700' : 'text-red-700'
                  }`}
                >
                  {formatCurrency(calculations.ebit)}
                </p>
                {calculations.ebit < 0 && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-red-600">
                    <AlertCircle className="h-3 w-3" /> Currently operating at a loss
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-orange-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Break-Even Point (BEP Volume)
                  </h3>
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {formatNumber(calculations.bepUnits)}{' '}
                  <span className="text-sm font-normal text-gray-500">blocks</span>
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Required revenue: {formatCurrency(calculations.bepRevenue)}
                </p>
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <Target className="h-5 w-5 text-emerald-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Units Needed for Target Profit
                  </h3>
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {formatNumber(calculations.targetUnits)}{' '}
                  <span className="text-sm font-normal text-gray-500">blocks</span>
                </p>
                {calculations.targetUnits > 4000000 && (
                  <p className="mt-1 flex items-center gap-1 text-xs text-amber-600">
                    <AlertCircle className="h-3 w-3" /> Exceeds current plant max capacity
                    (4M)
                  </p>
                )}
              </div>

              <div className="rounded-2xl border border-gray-100 bg-white p-4 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-blue-500" />
                  <h3 className="text-sm font-semibold text-gray-700">
                    Contribution Margin Ratio (CM Ratio)
                  </h3>
                </div>
                <p className="text-2xl font-black text-gray-900">
                  {calculations.cmRatio.toFixed(2)}%
                </p>
                <p className="mt-1 text-xs text-gray-500">
                  Contribution per unit: Rs {calculations.cmUnit.toFixed(2)}
                </p>
              </div>
            </div>

            {/* CVP chart */}
            <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <h2 className="mb-6 flex items-center gap-2 text-lg font-bold">
                <BarChart2 className="h-5 w-5 text-gray-500" /> CVP Chart
                (Cost-Volume-Profit)
              </h2>

              <CVPChart />

              <div className="mt-6 flex justify-center gap-6 text-sm">
                <div className="flex items-center gap-2">
                  <div className="h-1 w-4 rounded bg-green-500" /> Total Revenue
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-1 w-4 rounded bg-red-500" /> Total Cost
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 rounded border-b-2 border-dashed bg-gray-400" />
                  Fixed Cost
                </div>
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full border border-white bg-yellow-500" />
                  BEP
                </div>
              </div>
              <p className="mt-4 text-center text-xs text-gray-400">
                X-axis range is set to 0 to 5,000,000 units to support scenario
                simulation beyond baseline plant capacity.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
