import React, { useMemo, useState, useEffect } from 'react';
import {
  Activity,
  AlertCircle,
  ArrowRight,
  BarChart2,
  CheckCircle2,
  DollarSign,
  Factory,
  Gauge,
  LineChart,
  Lightbulb,
  Rocket,
  ShieldCheck,
  Target,
  TrendingUp,
} from 'lucide-react';
import './App.css';

const CASE = {
  capacityUnits: 4000000,
  baselineVolume: 2400000,
  baselinePricePerBrick: 7,
  baselineVariableCostPerBrick: 4.5,
  targetIncome: 3000000,
  fixedAssets: 7700000,
  projectLifeYears: 5,
  loanAmount: 4000000,
  loanRate: 0.12,
};

const FIXED_COSTS_MONTHLY = [
  { label: 'Factory building rent', amount: 80000 },
  { label: 'General office admin', amount: 27000 },
  { label: 'General office supplies', amount: 19000 },
  { label: 'Factory electricity (fixed)', amount: 15000 },
  { label: 'General office miscellaneous', amount: 13000 },
  { label: 'Employees', amount: 150000 },
  { label: 'Office assistant', amount: 20000 },
  { label: 'Watchman', amount: 21000 },
  { label: 'Drivers', amount: 30000 },
  { label: 'Owner-manager salary', amount: 55000 },
];

const VARIABLE_COSTS_BATCH = [
  { label: 'Fly ash', amount: 250000 },
  { label: 'Gypsum', amount: 220000 },
  { label: 'Lime', amount: 300000 },
  { label: 'Sand', amount: 40000 },
  { label: 'Electricity (variable)', amount: 30000 },
  { label: 'Direct labour', amount: 60000 },
];

const BATCH_UNITS = 200000; // Exhibit 4 basis: 0.20 million bricks/month

const formatCurrency = (num) => {
  if (!Number.isFinite(num)) return 'N/A';
  return `Rs ${Math.round(num).toLocaleString('en-IN')}`;
};

const formatNumber = (num) => {
  if (!Number.isFinite(num)) return 'N/A';
  return Math.round(num).toLocaleString('en-IN');
};

const formatPct = (num) => {
  if (!Number.isFinite(num)) return 'N/A';
  return `${num.toFixed(2)}%`;
};

function MetricCard({ title, value, sub, tone = 'default', icon: Icon, revealIndex }) {
  return (
    <article className={`metric-card metric-card--${tone} reveal is-visible`} data-reveal={revealIndex}>
      <header className="metric-card__header">
        <span className="metric-card__icon">{Icon ? <Icon size={18} /> : null}</span>
        <h3>{title}</h3>
      </header>
      <p className="metric-card__value">{value}</p>
      {sub ? <p className="metric-card__sub">{sub}</p> : null}
    </article>
  );
}

export default function App() {
  const fixedMonthlyTotal = useMemo(
    () => FIXED_COSTS_MONTHLY.reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const variableBatchTotal = useMemo(
    () => VARIABLE_COSTS_BATCH.reduce((sum, item) => sum + item.amount, 0),
    []
  );

  const [price, setPrice] = useState(CASE.baselinePricePerBrick);
  const [vc, setVc] = useState(CASE.baselineVariableCostPerBrick);
  const [volume, setVolume] = useState(CASE.baselineVolume);
  const [targetProfit, setTargetProfit] = useState(CASE.targetIncome);
  const [annualFixedOperating, setAnnualFixedOperating] = useState(fixedMonthlyTotal * 12);

  const annualDepreciation = CASE.fixedAssets / CASE.projectLifeYears;
  const annualInterest = CASE.loanAmount * CASE.loanRate;

  const calculations = useMemo(() => {
    const cmUnit = price - vc;
    const cmRatio = cmUnit > 0 ? (cmUnit / price) * 100 : 0;

    const revenue = price * volume;
    const variableCost = vc * volume;
    const grossProfit = revenue - variableCost;

    const fixedAbsorption = annualFixedOperating + annualDepreciation;
    const ebitAbsorption = grossProfit - fixedAbsorption;
    const estimatedNetAfterInterest = ebitAbsorption - annualInterest;

    const bepUnits = cmUnit > 0 ? fixedAbsorption / cmUnit : Infinity;
    const bepRevenue = Number.isFinite(bepUnits) ? bepUnits * price : Infinity;

    const targetUnits = cmUnit > 0 ? (fixedAbsorption + targetProfit) / cmUnit : Infinity;
    const marginOfSafetyUnits = volume - bepUnits;
    const marginOfSafetyPct = volume > 0 ? (marginOfSafetyUnits / volume) * 100 : 0;

    const requiredPriceAtCurrentVolume =
      volume > 0 ? vc + fixedAbsorption / volume : Infinity;
    const requiredVcAtCurrentVolume =
      volume > 0 ? price - fixedAbsorption / volume : -Infinity;

    const capacityForBep = Number.isFinite(bepUnits)
      ? (bepUnits / CASE.capacityUnits) * 100
      : Infinity;
    const capacityForTarget = Number.isFinite(targetUnits)
      ? (targetUnits / CASE.capacityUnits) * 100
      : Infinity;

    return {
      cmUnit,
      cmRatio,
      revenue,
      variableCost,
      grossProfit,
      fixedAbsorption,
      ebitAbsorption,
      estimatedNetAfterInterest,
      bepUnits,
      bepRevenue,
      targetUnits,
      marginOfSafetyUnits,
      marginOfSafetyPct,
      requiredPriceAtCurrentVolume,
      requiredVcAtCurrentVolume,
      capacityForBep,
      capacityForTarget,
    };
  }, [price, vc, volume, targetProfit, annualFixedOperating, annualDepreciation, annualInterest]);

  useEffect(() => {
    const revealNodes = Array.from(document.querySelectorAll('[data-reveal]'));
    if (revealNodes.length === 0) return undefined;

    const prefersReducedMotion = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    ).matches;

    if (prefersReducedMotion) {
      revealNodes.forEach((node) => node.classList.add('is-visible'));
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.14, rootMargin: '0px 0px -8% 0px' }
    );

    revealNodes.forEach((node, idx) => {
      const order = Number(node.getAttribute('data-reveal') ?? idx);
      node.style.setProperty('--reveal-delay', `${Math.min(order * 90, 860)}ms`);
      observer.observe(node);
    });

    return () => observer.disconnect();
  }, []);

  const recommendation = useMemo(() => {
    if (calculations.cmUnit <= 0) {
      return {
        verdict: 'No-go under current assumptions',
        tone: 'bad',
        summary:
          'Unit contribution margin is non-positive. Every additional brick destroys value.',
      };
    }

    if (calculations.ebitAbsorption < 0) {
      return {
        verdict: 'Conditional go (only after pricing/cost fix)',
        tone: 'warn',
        summary:
          'Expected first-year EBIT is negative at baseline demand. The project needs corrective levers before launch.',
      };
    }

    if (calculations.targetUnits > CASE.capacityUnits) {
      return {
        verdict: 'Go with capacity constraint',
        tone: 'warn',
        summary:
          'Project is viable at baseline, but the target-profit plan breaches plant capacity.',
      };
    }

    return {
      verdict: 'Go (financially feasible)',
      tone: 'good',
      summary:
        'Current assumptions support positive EBIT and a realistic path to the target income.',
    };
  }, [calculations]);

  const resetToCase = () => {
    setPrice(CASE.baselinePricePerBrick);
    setVc(CASE.baselineVariableCostPerBrick);
    setVolume(CASE.baselineVolume);
    setTargetProfit(CASE.targetIncome);
    setAnnualFixedOperating(fixedMonthlyTotal * 12);
  };

  const renderCVPChart = () => {
    const maxVolumeX = CASE.capacityUnits;
    const maxY = Math.max(
      price * maxVolumeX,
      calculations.fixedAbsorption + vc * maxVolumeX,
      calculations.revenue,
      calculations.fixedAbsorption
    );

    const width = 860;
    const height = 390;
    const padding = { top: 24, right: 20, bottom: 54, left: 92 };

    const innerWidth = width - padding.left - padding.right;
    const innerHeight = height - padding.top - padding.bottom;

    const scaleX = (val) => padding.left + (val / maxVolumeX) * innerWidth;
    const scaleY = (val) => padding.top + innerHeight - (val / maxY) * innerHeight;

    const revenueLine = {
      x1: scaleX(0),
      y1: scaleY(0),
      x2: scaleX(maxVolumeX),
      y2: scaleY(price * maxVolumeX),
    };

    const costLine = {
      x1: scaleX(0),
      y1: scaleY(calculations.fixedAbsorption),
      x2: scaleX(maxVolumeX),
      y2: scaleY(calculations.fixedAbsorption + vc * maxVolumeX),
    };

    const fixedLine = {
      x1: scaleX(0),
      y1: scaleY(calculations.fixedAbsorption),
      x2: scaleX(maxVolumeX),
      y2: scaleY(calculations.fixedAbsorption),
    };

    const currentCostY = calculations.fixedAbsorption + vc * volume;
    const currentRevenueY = price * volume;

    const lineLength = (line) => Math.hypot(line.x2 - line.x1, line.y2 - line.y1);
    const revenueLen = lineLength(revenueLine);
    const costLen = lineLength(costLine);

    const isBepVisible =
      Number.isFinite(calculations.bepUnits) && calculations.bepUnits >= 0 && calculations.bepUnits <= maxVolumeX;

    const bepX = isBepVisible ? scaleX(calculations.bepUnits) : null;
    const bepY = isBepVisible ? scaleY(calculations.bepRevenue) : null;

    return (
      <div className="chart-wrap" data-reveal="10">
        <svg viewBox={`0 0 ${width} ${height}`} className="cvp-chart" role="img" aria-label="CVP chart">
          <defs>
            <linearGradient id="rev-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2f6cff" />
              <stop offset="100%" stopColor="#10bda6" />
            </linearGradient>
            <linearGradient id="cost-grad" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#ef4e4e" />
              <stop offset="100%" stopColor="#ff9f5b" />
            </linearGradient>
          </defs>

          {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => (
            <g key={`y-grid-${idx}`}>
              <line
                x1={padding.left}
                y1={padding.top + innerHeight * ratio}
                x2={width - padding.right}
                y2={padding.top + innerHeight * ratio}
                stroke="#dfebfa"
                strokeWidth="1"
              />
              <text
                x={padding.left - 12}
                y={padding.top + innerHeight * ratio + 4}
                textAnchor="end"
                fontSize="10"
                fill="#5c77a0"
              >
                {(maxY * (1 - ratio) / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}

          {[0, 0.2, 0.4, 0.6, 0.8, 1].map((ratio, idx) => (
            <g key={`x-grid-${idx}`}>
              <line
                x1={padding.left + innerWidth * ratio}
                y1={padding.top}
                x2={padding.left + innerWidth * ratio}
                y2={height - padding.bottom}
                stroke="#e7f0fb"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text
                x={padding.left + innerWidth * ratio}
                y={height - padding.bottom + 22}
                textAnchor="middle"
                fontSize="10"
                fill="#5c77a0"
              >
                {(maxVolumeX * ratio / 1000000).toFixed(1)}M
              </text>
            </g>
          ))}

          <line
            x1={padding.left}
            y1={padding.top}
            x2={padding.left}
            y2={height - padding.bottom}
            stroke="#2a4d7a"
            strokeWidth="2"
          />
          <line
            x1={padding.left}
            y1={height - padding.bottom}
            x2={width - padding.right}
            y2={height - padding.bottom}
            stroke="#2a4d7a"
            strokeWidth="2"
          />

          <text x={padding.left - 50} y={padding.top - 8} fontSize="11" fill="#244a76" fontWeight="700">
            Amount (Rs)
          </text>
          <text x={width - padding.right - 8} y={height - padding.bottom + 36} fontSize="11" fill="#244a76" textAnchor="end" fontWeight="700">
            Annual output (bricks)
          </text>

          <line
            {...fixedLine}
            className="chart-fixed-line"
            stroke="#90a6c7"
            strokeWidth="2"
            strokeDasharray="7 5"
          />

          <line
            {...costLine}
            className="chart-line chart-line--cost"
            style={{ '--path-length': costLen }}
            stroke="url(#cost-grad)"
            strokeWidth="4"
          />

          <line
            {...revenueLine}
            className="chart-line chart-line--revenue"
            style={{ '--path-length': revenueLen }}
            stroke="url(#rev-grad)"
            strokeWidth="4"
          />

          <line
            x1={scaleX(volume)}
            y1={padding.top}
            x2={scaleX(volume)}
            y2={height - padding.bottom}
            className="chart-marker-line"
            stroke="#2f6cff"
            strokeWidth="2"
            strokeDasharray="5 4"
          />

          <circle
            cx={scaleX(volume)}
            cy={scaleY(Math.max(currentRevenueY, currentCostY))}
            className="chart-marker-dot"
            r="5"
            fill="#2f6cff"
          />

          {isBepVisible && (
            <g>
              <circle
                cx={bepX}
                cy={bepY}
                r="7"
                className="chart-bep-dot"
                fill="#f59f0a"
                stroke="#fff"
                strokeWidth="2"
              />
              <text
                x={bepX}
                y={bepY - 16}
                className="chart-bep-label"
                textAnchor="middle"
                fontSize="12"
                fill="#b06b00"
                fontWeight="700"
              >
                BEP
              </text>
            </g>
          )}
        </svg>
      </div>
    );
  };

  const assignmentCoverage = [
    'Q1 Cost classification + gross profit',
    'Q2 EBIT under absorption costing',
    'Q3 Contribution margin and CM%',
    'Q4 Break-even units/revenue + CVP graph',
    'Q5 Units required for Rs3M target',
    'Q6 Owner advice',
    'Q7 Financial + non-financial reasoning',
  ];

  const snapshotCards = [
    {
      label: 'Expected EBIT',
      value: formatCurrency(calculations.ebitAbsorption),
      note: calculations.ebitAbsorption >= 0 ? 'Profitable under absorption costing' : 'Negative EBIT risk',
      tone: calculations.ebitAbsorption >= 0 ? 'good' : 'bad',
    },
    {
      label: 'Break-even Output',
      value: `${formatNumber(calculations.bepUnits)} units`,
      note: `${formatPct(calculations.capacityForBep)} of annual capacity`,
      tone: 'neutral',
    },
    {
      label: 'Contribution Margin',
      value: `${formatCurrency(calculations.cmUnit)} / unit`,
      note: `${formatPct(calculations.cmRatio)} contribution ratio`,
      tone: 'neutral',
    },
    {
      label: 'Target Feasibility',
      value:
        calculations.targetUnits <= CASE.capacityUnits
          ? 'Capacity fit'
          : 'Capacity exceeded',
      note: `${formatNumber(calculations.targetUnits)} units needed for Rs ${formatNumber(targetProfit)}`,
      tone: calculations.targetUnits <= CASE.capacityUnits ? 'good' : 'warn',
    },
  ];

  return (
    <div className="studio-shell">
      <div className="studio-noise" />

      <main className="studio-main">
        <header className="topbar reveal" data-reveal="0">
          <div className="topbar-brand">
            <span className="topbar-logo">
              <Activity size={18} />
            </span>
            <div>
              <p>ac11-group-project</p>
              <strong>Fly Ash Brick Profit Intelligence</strong>
            </div>
          </div>
          <div className="topbar-tags">
            <span>Master SaaS Visual Language</span>
            <span>Assignment Q1-Q7 mapped</span>
            <span>Interactive sensitivity model</span>
          </div>
        </header>

        <section className="hero-panel reveal" data-reveal="1">
          <div className="hero-title-wrap">
            <p className="hero-eyebrow">Case-Based Decision Workspace</p>
            <h1>
              Fly Ash Brick
              <span>Profitability Navigator</span>
            </h1>
            <p className="hero-subtext">
              Premium decision intelligence for pricing, cost and volume simulation.
              The full interface is engineered to present assignment-grade answers in a
              boardroom-ready SaaS experience.
            </p>
            <div className="hero-flags">
              <span>
                <ShieldCheck size={14} /> Formula-accurate case outputs
              </span>
              <span>
                <Rocket size={14} /> Bold UX with clear executive storytelling
              </span>
            </div>
          </div>
          <div className="hero-stats">
            <div>
              <span>Plant Capacity</span>
              <strong>{formatNumber(CASE.capacityUnits)}</strong>
            </div>
            <div>
              <span>Baseline Annual Volume</span>
              <strong>{formatNumber(CASE.baselineVolume)}</strong>
            </div>
            <div>
              <span>Project Horizon</span>
              <strong>{CASE.projectLifeYears} Years</strong>
            </div>
          </div>
        </section>

        <section className="executive-grid reveal" data-reveal="2">
          {snapshotCards.map((card) => (
            <article key={card.label} className={`executive-card executive-card--${card.tone}`}>
              <span>{card.label}</span>
              <strong>{card.value}</strong>
              <small>{card.note}</small>
            </article>
          ))}
        </section>

        <section className="assignment-strip reveal" data-reveal="3">
          <h2>
            <CheckCircle2 size={18} /> Assignment Coverage
          </h2>
          <div className="assignment-grid">
            {assignmentCoverage.map((item) => (
              <div key={item} className="assignment-chip">
                <span className="dot" />
                {item}
              </div>
            ))}
          </div>
        </section>

        <div className="layout-grid">
          <aside className="control-panel reveal" data-reveal="4">
            <div className="panel-header">
              <h3>
                <Gauge size={18} /> Assumption Controls
              </h3>
              <button onClick={resetToCase}>Reset to case base</button>
            </div>

            <p className="panel-note">
              Default values reflect the PDF case assumptions. Use sliders for sensitivity analysis.
            </p>

            <div className="input-group">
              <label>
                <span>Price per brick (Rs)</span>
                <b>{price.toFixed(2)}</b>
              </label>
              <input
                type="range"
                min="5"
                max="10"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label>
                <span>Variable cost per brick (Rs)</span>
                <b>{vc.toFixed(2)}</b>
              </label>
              <input
                type="range"
                min="3"
                max="7"
                step="0.05"
                value={vc}
                onChange={(e) => setVc(Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label>
                <span>Annual sales volume (bricks)</span>
                <b>{formatNumber(volume)}</b>
              </label>
              <input
                type="range"
                min="1200000"
                max="4000000"
                step="50000"
                value={volume}
                onChange={(e) => setVolume(Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label>
                <span>Annual fixed operating cost (Rs)</span>
                <b>{formatNumber(annualFixedOperating)}</b>
              </label>
              <input
                type="range"
                min="4000000"
                max="7000000"
                step="50000"
                value={annualFixedOperating}
                onChange={(e) => setAnnualFixedOperating(Number(e.target.value))}
              />
            </div>

            <div className="input-group">
              <label>
                <span>Target income (Rs)</span>
                <b>{formatNumber(targetProfit)}</b>
              </label>
              <input
                type="range"
                min="1000000"
                max="6000000"
                step="100000"
                value={targetProfit}
                onChange={(e) => setTargetProfit(Number(e.target.value))}
              />
            </div>

            <div className="case-facts">
              <h4>Case constants used in computations</h4>
              <ul>
                <li>Fixed assets: {formatCurrency(CASE.fixedAssets)}</li>
                <li>Depreciation: {formatCurrency(annualDepreciation)} per year</li>
                <li>Loan interest: {formatCurrency(annualInterest)} per year</li>
                <li>Batch basis: 0.20M bricks for Exhibit 4 variable costs</li>
              </ul>
            </div>
          </aside>

          <section className="results-column">
            <section className="section-card reveal" data-reveal="5">
              <header>
                <h2>
                  <Factory size={18} /> Q1. Cost Classification and Gross Profit (Year 1)
                </h2>
              </header>

              <div className="cost-grid">
                <div>
                  <h3>Fixed Cost List (from case)</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Monthly</th>
                        <th>Annual</th>
                      </tr>
                    </thead>
                    <tbody>
                      {FIXED_COSTS_MONTHLY.map((item) => (
                        <tr key={item.label}>
                          <td>{item.label}</td>
                          <td>{formatCurrency(item.amount)}</td>
                          <td>{formatCurrency(item.amount * 12)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total fixed operating</td>
                        <td>{formatCurrency(fixedMonthlyTotal)}</td>
                        <td>{formatCurrency(fixedMonthlyTotal * 12)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>

                <div>
                  <h3>Variable Cost List (Exhibit 4)</h3>
                  <table>
                    <thead>
                      <tr>
                        <th>Item</th>
                        <th>Per 0.20M</th>
                        <th>Per Brick</th>
                      </tr>
                    </thead>
                    <tbody>
                      {VARIABLE_COSTS_BATCH.map((item) => (
                        <tr key={item.label}>
                          <td>{item.label}</td>
                          <td>{formatCurrency(item.amount)}</td>
                          <td>{(item.amount / BATCH_UNITS).toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr>
                        <td>Total variable cost</td>
                        <td>{formatCurrency(variableBatchTotal)}</td>
                        <td>{(variableBatchTotal / BATCH_UNITS).toFixed(2)}</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

              <div className="gross-banner">
                <div>
                  <span>Revenue</span>
                  <strong>{formatCurrency(calculations.revenue)}</strong>
                </div>
                <ArrowRight size={20} />
                <div>
                  <span>Variable Cost</span>
                  <strong>{formatCurrency(calculations.variableCost)}</strong>
                </div>
                <ArrowRight size={20} />
                <div>
                  <span>Gross Profit (Q1)</span>
                  <strong>{formatCurrency(calculations.grossProfit)}</strong>
                </div>
              </div>
            </section>

            <div className="metric-grid">
              <MetricCard
                revealIndex={6}
                title="Q2. EBIT (Absorption)"
                icon={DollarSign}
                tone={calculations.ebitAbsorption >= 0 ? 'good' : 'bad'}
                value={formatCurrency(calculations.ebitAbsorption)}
                sub={`Gross ${formatCurrency(calculations.grossProfit)} | Fixed+Dep ${formatCurrency(
                  calculations.fixedAbsorption
                )}`}
              />

              <MetricCard
                revealIndex={7}
                title="Q3. Contribution Margin"
                icon={TrendingUp}
                tone="default"
                value={`${formatCurrency(calculations.cmUnit)} per brick`}
                sub={`Total CM ${formatCurrency(calculations.grossProfit)} | CM% ${formatPct(
                  calculations.cmRatio
                )}`}
              />

              <MetricCard
                revealIndex={8}
                title="Additional: Net after Interest"
                icon={LineChart}
                tone={calculations.estimatedNetAfterInterest >= 0 ? 'good' : 'warn'}
                value={formatCurrency(calculations.estimatedNetAfterInterest)}
                sub={`EBIT ${formatCurrency(calculations.ebitAbsorption)} | Interest ${formatCurrency(
                  annualInterest
                )}`}
              />
            </div>

            <section className="section-card reveal" data-reveal="9">
              <header>
                <h2>
                  <BarChart2 size={18} /> Q4. Break-Even + CVP Graph
                </h2>
              </header>

              <div className="q4-metrics">
                <div>
                  <span>BEP Units (EBIT = 0)</span>
                  <strong>{formatNumber(calculations.bepUnits)} bricks</strong>
                  <small>{formatPct(calculations.capacityForBep)} of plant capacity</small>
                </div>
                <div>
                  <span>BEP Revenue</span>
                  <strong>{formatCurrency(calculations.bepRevenue)}</strong>
                  <small>At current unit price: Rs {price.toFixed(2)}</small>
                </div>
                <div>
                  <span>Margin of Safety</span>
                  <strong>{formatNumber(calculations.marginOfSafetyUnits)} bricks</strong>
                  <small>{formatPct(calculations.marginOfSafetyPct)} of expected sales</small>
                </div>
              </div>

              {renderCVPChart()}
            </section>

            <section className="section-card reveal" data-reveal="11">
              <header>
                <h2>
                  <Target size={18} /> Q5. Units Required for Target Income
                </h2>
              </header>
              <div className="target-grid">
                <div className="target-pill">
                  <span>Target Income</span>
                  <strong>{formatCurrency(targetProfit)}</strong>
                </div>
                <div className="target-pill">
                  <span>Required Units</span>
                  <strong>{formatNumber(calculations.targetUnits)} bricks</strong>
                </div>
                <div className="target-pill">
                  <span>Capacity Usage Needed</span>
                  <strong>{formatPct(calculations.capacityForTarget)}</strong>
                </div>
              </div>
            </section>

            <section className="section-card reveal" data-reveal="12">
              <header>
                <h2>
                  <Lightbulb size={18} /> Q6 + Q7. Owner Advice and Final Reasoning
                </h2>
              </header>

              <div className={`verdict verdict--${recommendation.tone}`}>
                <p className="verdict__title">{recommendation.verdict}</p>
                <p>{recommendation.summary}</p>
              </div>

              <div className="reason-grid">
                <article>
                  <h3>Top financial drivers</h3>
                  <ul>
                    <li>
                      EBIT (absorption): <b>{formatCurrency(calculations.ebitAbsorption)}</b>
                    </li>
                    <li>
                      To break even at current volume, required price is at least{' '}
                      <b>Rs {calculations.requiredPriceAtCurrentVolume.toFixed(2)}</b> per brick.
                    </li>
                    <li>
                      Or keep price at Rs {price.toFixed(2)} and reduce variable cost to at most{' '}
                      <b>Rs {calculations.requiredVcAtCurrentVolume.toFixed(2)}</b> per brick.
                    </li>
                    <li>
                      BEP needs <b>{formatPct(calculations.capacityForBep)}</b> of annual capacity.
                    </li>
                  </ul>
                </article>

                <article>
                  <h3>Top non-financial drivers</h3>
                  <ul>
                    <li>
                      Strong policy/environment tailwind: government actively promotes fly-ash usage.
                    </li>
                    <li>
                      Raw material sustainability advantage: fly ash turns waste into useful construction input.
                    </li>
                    <li>
                      Execution risks remain: quality compliance (IS 12894), downtime risk, and demand realization risk.
                    </li>
                    <li>
                      Market upside exists in housing/infrastructure, but contracts and channel certainty are critical before full-scale launch.
                    </li>
                  </ul>
                </article>
              </div>
            </section>
          </section>
        </div>

        <footer className="studio-footer reveal" data-reveal="13">
          <AlertCircle size={16} />
          <span>
            This dashboard uses the case exhibits for fixed/variable classification and adds sensitivity controls for managerial decision testing.
          </span>
        </footer>
      </main>
    </div>
  );
}
