import React from 'react';

const RadarChart = ({
    scores = {},
    size = 300,
    labels = {
        capitalAccess: 'Capital',
        skillValue: 'Skills',
        networkReach: 'Reach',
        reliability: 'Trust',
        speed: 'Speed',
        alignment: 'Align'
    },
    maxValue = 10,
    color = '#3b82f6'
}) => {
    const keys = Object.keys(labels);
    const numAxes = keys.length;
    const center = size / 2;
    const radius = (size / 2) * 0.7;

    // Calculate coordinates for a score on an axis
    const getCoordinates = (value, index) => {
        const angle = (Math.PI * 2 * index) / numAxes - Math.PI / 2;
        const factor = (value / maxValue) * radius;
        return {
            x: center + Math.cos(angle) * factor,
            y: center + Math.sin(angle) * factor
        };
    };

    // Generate grid circles
    const gridCircles = [0.2, 0.4, 0.6, 0.8, 1].map((factor, i) => (
        <circle
            key={`grid-${i}`}
            cx={center}
            cy={center}
            r={radius * factor}
            fill="none"
            stroke="#374151"
            strokeWidth="1"
        />
    ));

    // Generate axis lines and labels
    const axisLines = keys.map((key, i) => {
        const end = getCoordinates(maxValue, i);
        const labelPos = getCoordinates(maxValue * 1.2, i);
        return (
            <g key={`axis-${i}`}>
                <line
                    x1={center}
                    y1={center}
                    x2={end.x}
                    y2={end.y}
                    stroke="#4b5563"
                    strokeWidth="1"
                />
                <text
                    x={labelPos.x}
                    y={labelPos.y}
                    textAnchor="middle"
                    dominantBaseline="middle"
                    fill="#9ca3af"
                    fontSize="10"
                    className="font-medium"
                >
                    {labels[key]}
                </text>
            </g>
        );
    });

    // Generate individual data points and the path
    const points = keys.map((key, i) => getCoordinates(scores[key] || 0, i));
    const pathData = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';

    return (
        <div className="flex items-center justify-center p-4">
            <svg width={size} height={size} className="overflow-visible">
                {gridCircles}
                {axisLines}
                <path
                    d={pathData}
                    fill={color}
                    fillOpacity="0.2"
                    stroke={color}
                    strokeWidth="2"
                    strokeLinejoin="round"
                />
                {points.map((p, i) => (
                    <circle key={`point-${i}`} cx={p.x} cy={p.y} r="3" fill={color} />
                ))}
            </svg>
        </div>
    );
};

export default RadarChart;
