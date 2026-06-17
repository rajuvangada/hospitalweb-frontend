import React, { useState } from 'react';

// Reusable SVG Line Chart
export const LineChart = ({ data = [], title = "", subtitle = "", height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data available</div>;

  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 100);
  const minVal = Math.min(...values, 0);
  const valRange = maxVal - minVal;

  // Compute points
  const points = data.map((d, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (data.length - 1);
    const y = chartHeight - padding - ((d.value - minVal) / valRange) * (chartHeight - padding * 2);
    return { x, y, ...d };
  });

  // SVG Path description
  let pathD = "";
  let areaD = "";
  if (points.length > 0) {
    pathD = `M ${points[0].x} ${points[0].y} ` + points.slice(1).map(p => `L ${p.x} ${p.y}`).join(' ');
    // Area path closed at the bottom
    areaD = `${pathD} L ${points[points.length - 1].x} ${chartHeight - padding} L ${points[0].x} ${chartHeight - padding} Z`;
  }

  // Grid lines
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }).map((_, i) => {
    const ratio = i / (gridLinesCount - 1);
    const y = padding + ratio * (chartHeight - padding * 2);
    const val = maxVal - ratio * valRange;
    return { y, label: Math.round(val) };
  });

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm relative flex flex-col justify-between h-full select-none">
      <div>
        {title && <h3 className="text-base font-bold text-foreground">{title}</h3>}
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative mt-4 flex-1">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--primary)" stopOpacity="0.25" />
              <stop offset="100%" stopColor="var(--primary)" stopOpacity="0.00" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-40">
              <line 
                x1={padding} 
                y1={line.y} 
                x2={chartWidth - padding} 
                y2={line.y} 
                stroke="var(--border)" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding - 10} 
                y={line.y + 4} 
                textAnchor="end" 
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Fill Area */}
          {areaD && <path d={areaD} fill="url(#chartGrad)" />}

          {/* Main Line */}
          {pathD && (
            <path 
              d={pathD} 
              fill="none" 
              stroke="var(--primary)" 
              strokeWidth="2.5" 
              strokeLinecap="round" 
              strokeLinejoin="round" 
            />
          )}

          {/* Interactive Dots & Grid Lines on Hover */}
          {points.map((p, idx) => (
            <g 
              key={idx} 
              onMouseEnter={() => setHoveredIdx(idx)} 
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Vertical hover bar */}
              {hoveredIdx === idx && (
                <line 
                  x1={p.x} 
                  y1={padding} 
                  x2={p.x} 
                  y2={chartHeight - padding} 
                  stroke="var(--primary)" 
                  strokeWidth="1" 
                  className="opacity-20"
                />
              )}
              
              {/* Point Circle */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={hoveredIdx === idx ? 6 : 4} 
                fill={hoveredIdx === idx ? "var(--primary)" : "var(--card)"} 
                stroke="var(--primary)" 
                strokeWidth="2.5" 
                className="transition-all duration-150"
              />

              {/* Invisible large capture circle */}
              <circle 
                cx={p.x} 
                cy={p.y} 
                r={24} 
                fill="transparent" 
              />
            </g>
          ))}

          {/* X-axis labels */}
          {points.map((p, idx) => (
            <text 
              key={idx} 
              x={p.x} 
              y={chartHeight - 12} 
              textAnchor="middle" 
              className="fill-muted-foreground text-[9px] sm:text-[10px] font-medium"
            >
              {p.label}
            </text>
          ))}
        </svg>

        {/* Hover Tooltip HTML positioning */}
        {hoveredIdx !== null && points[hoveredIdx] && (
          <div 
            className="absolute bg-popover border border-border/80 shadow-lg rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-foreground pointer-events-none transition-all duration-75 z-10"
            style={{
              left: `${(points[hoveredIdx].x / chartWidth) * 100}%`,
              top: `${(points[hoveredIdx].y / chartHeight) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-[10px] text-muted-foreground leading-none">{points[hoveredIdx].label}</div>
            <div className="mt-0.5 text-primary text-xs font-bold">${points[hoveredIdx].value}</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable SVG Bar Chart
export const BarChart = ({ data = [], title = "", subtitle = "", height = 220 }) => {
  const [hoveredIdx, setHoveredIdx] = useState(null);

  if (data.length === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data available</div>;

  const padding = 40;
  const chartWidth = 500;
  const chartHeight = height;

  const values = data.map(d => d.value);
  const maxVal = Math.max(...values, 10);
  const minVal = 0;
  const valRange = maxVal - minVal;

  const barWidth = Math.max(12, Math.min(32, 220 / data.length));
  
  // Compute bar layouts
  const bars = data.map((d, i) => {
    const x = padding + (i * (chartWidth - padding * 2)) / (data.length - 0.7);
    const h = ((d.value - minVal) / valRange) * (chartHeight - padding * 2);
    const y = chartHeight - padding - h;
    return { x, y, h, ...d };
  });

  // Grid lines
  const gridLinesCount = 4;
  const gridLines = Array.from({ length: gridLinesCount }).map((_, i) => {
    const ratio = i / (gridLinesCount - 1);
    const y = padding + ratio * (chartHeight - padding * 2);
    const val = maxVal - ratio * valRange;
    return { y, label: Math.round(val) };
  });

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full select-none">
      <div>
        {title && <h3 className="text-base font-bold text-foreground">{title}</h3>}
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="relative mt-4 flex-1">
        <svg viewBox={`0 0 ${chartWidth} ${chartHeight}`} className="w-full h-full overflow-visible">
          {/* Grid lines */}
          {gridLines.map((line, idx) => (
            <g key={idx} className="opacity-40">
              <line 
                x1={padding} 
                y1={line.y} 
                x2={chartWidth - padding} 
                y2={line.y} 
                stroke="var(--border)" 
                strokeWidth="1" 
                strokeDasharray="4 4" 
              />
              <text 
                x={padding - 10} 
                y={line.y + 4} 
                textAnchor="end" 
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {line.label}
              </text>
            </g>
          ))}

          {/* Bar Rectangles */}
          {bars.map((bar, idx) => (
            <g 
              key={idx}
              onMouseEnter={() => setHoveredIdx(idx)}
              onMouseLeave={() => setHoveredIdx(null)}
              className="cursor-pointer"
            >
              {/* Rounded top rect */}
              <rect
                x={bar.x - barWidth / 2}
                y={bar.y}
                width={barWidth}
                height={Math.max(bar.h, 2)}
                rx={Math.min(barWidth / 3, 6)}
                fill={hoveredIdx === idx ? "var(--primary)" : "var(--primary)"}
                className="transition-all duration-200 fill-primary/80 hover:fill-primary"
              />
              {/* X axis labels */}
              <text 
                x={bar.x} 
                y={chartHeight - 12} 
                textAnchor="middle" 
                className="fill-muted-foreground text-[10px] font-medium"
              >
                {bar.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Tooltip */}
        {hoveredIdx !== null && bars[hoveredIdx] && (
          <div 
            className="absolute bg-popover border border-border/80 shadow-lg rounded-lg px-2.5 py-1.5 text-[11px] font-semibold text-foreground pointer-events-none transition-all duration-75 z-10"
            style={{
              left: `${(bars[hoveredIdx].x / chartWidth) * 100}%`,
              top: `${(bars[hoveredIdx].y / chartHeight) * 100 - 15}%`,
              transform: 'translate(-50%, -100%)'
            }}
          >
            <div className="text-[10px] text-muted-foreground leading-none">{bars[hoveredIdx].label}</div>
            <div className="mt-0.5 text-primary text-xs font-bold">{bars[hoveredIdx].value} cases</div>
          </div>
        )}
      </div>
    </div>
  );
};

// Reusable Donut / Circular Chart
export const DonutChart = ({ data = [], title = "", subtitle = "" }) => {
  const total = data.reduce((acc, curr) => acc + curr.value, 0);

  if (total === 0) return <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">No data available</div>;

  const size = 180;
  const radius = 60;
  const strokeWidth = 18;
  const center = size / 2;
  const circumference = 2 * Math.PI * radius;

  let accumulatedAngle = 0;

  const segments = data.map(d => {
    const percentage = (d.value / total) * 100;
    const strokeDashoffset = circumference - (percentage / 100) * circumference;
    const rotation = (accumulatedAngle / 100) * 360;
    accumulatedAngle += percentage;

    return {
      ...d,
      percentage,
      strokeDashoffset,
      rotation
    };
  });

  return (
    <div className="bg-card border border-border/50 rounded-2xl p-6 shadow-sm flex flex-col justify-between h-full select-none">
      <div>
        {title && <h3 className="text-base font-bold text-foreground">{title}</h3>}
        {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
      </div>

      <div className="flex flex-col sm:flex-row items-center gap-6 mt-4 flex-1 justify-center">
        {/* Donut SVG */}
        <div className="relative w-36 h-36">
          <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-full -rotate-90">
            {/* Base circle background */}
            <circle
              cx={center}
              cy={center}
              r={radius}
              fill="transparent"
              stroke="var(--border)"
              strokeWidth={strokeWidth}
              className="opacity-20"
            />
            {/* Segments */}
            {segments.map((seg, idx) => (
              <circle
                key={idx}
                cx={center}
                cy={center}
                r={radius}
                fill="transparent"
                stroke={seg.color || "var(--primary)"}
                strokeWidth={strokeWidth}
                strokeDasharray={circumference}
                strokeDashoffset={seg.strokeDashoffset}
                transform={`rotate(${seg.rotation} ${center} ${center})`}
                strokeLinecap="round"
                className="transition-all duration-500 ease-out hover:opacity-90"
              />
            ))}
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Total</span>
            <span className="text-xl font-black text-foreground">{total}</span>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-col gap-2.5 flex-1 min-w-[120px]">
          {segments.map((seg, idx) => (
            <div key={idx} className="flex items-center justify-between text-xs font-semibold">
              <div className="flex items-center gap-2">
                <span 
                  className="w-2.5 h-2.5 rounded-full shrink-0" 
                  style={{ backgroundColor: seg.color || "var(--primary)" }}
                />
                <span className="text-muted-foreground truncate max-w-[90px]">{seg.label}</span>
              </div>
              <span className="text-foreground text-right">{Math.round(seg.percentage)}%</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
