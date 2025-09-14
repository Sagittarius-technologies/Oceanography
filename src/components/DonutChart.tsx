import React, { useState, useEffect } from 'react';

const DonutChart: React.FC = () => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);
  const [clickedSegment, setClickedSegment] = useState<number | null>(null);

  const data = [
    { value: 60, color: 'stroke-teal-400', label: '3.8M', description: 'Public Records', bgColor: 'bg-teal-400' },
    { value: 40, color: 'stroke-orange-400', label: '4.4M', description: 'Awaiting Validation', bgColor: 'bg-orange-400' }
  ];

  const radius = 120;
  const strokeWidth = 30;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleSegmentClick = (index: number) => {
    setClickedSegment(clickedSegment === index ? null : index);
  };

  return (
    <div className="relative w-80 h-80 group">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="transform -rotate-90 overflow-visible"
      >
        {/* Background circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-500"
        />

        {/* First segment - Interactive */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={hoveredSegment === 0 ? strokeWidth + 6 : strokeWidth}
          strokeDasharray={`${isAnimated ? data[0].value / 100 * circumference : 0} ${circumference}`}
          strokeLinecap="round"
          r={hoveredSegment === 0 ? normalizedRadius + 3 : normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${data[0].color} transition-all duration-500 ease-out cursor-pointer ${hoveredSegment === 0 ? 'drop-shadow-lg' : ''}`}
          style={{
            strokeDashoffset: 0,
            filter: hoveredSegment === 0 ? 'drop-shadow(0 0 12px rgb(45, 212, 191))' : 'none',
            opacity: clickedSegment !== null && clickedSegment !== 0 ? 0.4 : 1
          }}
          onMouseEnter={() => setHoveredSegment(0)}
          onMouseLeave={() => setHoveredSegment(null)}
          onClick={() => handleSegmentClick(0)}
        />

        {/* Second segment - Interactive */}
        <circle
          stroke="currentColor"
          fill="transparent"
          strokeWidth={hoveredSegment === 1 ? strokeWidth + 6 : strokeWidth}
          strokeDasharray={`${isAnimated ? data[1].value / 100 * circumference : 0} ${circumference}`}
          strokeLinecap="round"
          r={hoveredSegment === 1 ? normalizedRadius + 3 : normalizedRadius}
          cx={radius}
          cy={radius}
          className={`${data[1].color} transition-all duration-500 ease-out cursor-pointer ${hoveredSegment === 1 ? 'drop-shadow-lg' : ''}`}
          style={{
            strokeDashoffset: -(data[0].value / 100 * circumference),
            filter: hoveredSegment === 1 ? 'drop-shadow(0 0 12px rgb(251, 146, 60))' : 'none',
            opacity: clickedSegment !== null && clickedSegment !== 1 ? 0.4 : 1
          }}
          onMouseEnter={() => setHoveredSegment(1)}
          onMouseLeave={() => setHoveredSegment(null)}
          onClick={() => handleSegmentClick(1)}
        />

        {/* Animated pulse ring on hover */}
        {hoveredSegment !== null && (
          <circle
            stroke={hoveredSegment === 0 ? 'rgb(45, 212, 191)' : 'rgb(251, 146, 60)'}
            fill="transparent"
            strokeWidth="2"
            r={normalizedRadius + 15}
            cx={radius}
            cy={radius}
            className="animate-pulse opacity-50"
            style={{ animationDuration: '1s' }}
          />
        )}
      </svg>

      {/* Center content - Always shows Total Sequences */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className={`text-center transition-all duration-300 ${hoveredSegment !== null ? 'scale-110' : ''}`}>
          <div className="text-lg text-gray-400 mb-2 font-medium">Total Sequences</div>
          <div className={`text-4xl font-bold text-white transition-all duration-300 ${clickedSegment !== null ? 'text-5xl' : ''}`}>
            8,247,593
          </div>
          {hoveredSegment !== null && (
            <div className={`text-sm mt-3 transition-all duration-300 ${data[hoveredSegment].color.replace('stroke', 'text')} font-semibold`}>
              {data[hoveredSegment].description}: {data[hoveredSegment].label}
            </div>
          )}
          {clickedSegment !== null && (
            <div className={`text-sm mt-2 transition-all duration-300 ${data[clickedSegment].color.replace('stroke', 'text')}`}>
              {Math.round(data[clickedSegment].value)}% of total
            </div>
          )}
        </div>
      </div>

      {/* Interactive Labels */}
      <div 
        className={`absolute top-4 right-4 text-right transition-all duration-300 cursor-pointer transform ${
          hoveredSegment === 0 || clickedSegment === 0 ? 'scale-125 -translate-y-1' : ''
        }`}
        onMouseEnter={() => setHoveredSegment(0)}
        onMouseLeave={() => setHoveredSegment(null)}
        onClick={() => handleSegmentClick(0)}
      >
        <div className={`text-2xl font-bold text-teal-400 transition-all duration-300 ${
          hoveredSegment === 0 ? 'text-teal-300 text-shadow' : ''
        } ${clickedSegment === 0 ? 'text-3xl' : ''}`}>
          {data[0].label}
        </div>
        {/* Tooltip on hover */}
        <div className={`text-xs text-gray-400 mt-1 transition-all duration-300 ${
          hoveredSegment === 0 ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'
        }`}>
          {data[0].description}
        </div>
        {/* Indicator dot */}
        <div className={`w-2 h-2 ${data[0].bgColor} rounded-full ml-auto mt-1 transition-all duration-300 ${
          hoveredSegment === 0 ? 'scale-150 shadow-lg' : 'scale-100'
        }`}></div>
      </div>
      
      <div 
        className={`absolute bottom-4 right-4 text-right transition-all duration-300 cursor-pointer transform ${
          hoveredSegment === 1 || clickedSegment === 1 ? 'scale-125 translate-y-1' : ''
        }`}
        onMouseEnter={() => setHoveredSegment(1)}
        onMouseLeave={() => setHoveredSegment(null)}
        onClick={() => handleSegmentClick(1)}
      >
        <div className={`text-3xl font-bold text-orange-400 transition-all duration-300 ${
          hoveredSegment === 1 ? 'text-orange-300 text-shadow' : ''
        } ${clickedSegment === 1 ? 'text-4xl' : ''}`}>
          {data[1].label}
        </div>
        {/* Tooltip on hover */}
        <div className={`text-xs text-gray-400 mt-1 transition-all duration-300 ${
          hoveredSegment === 1 ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'
        }`}>
          {data[1].description}
        </div>
        {/* Indicator dot */}
        <div className={`w-2 h-2 ${data[1].bgColor} rounded-full ml-auto mt-1 transition-all duration-300 ${
          hoveredSegment === 1 ? 'scale-150 shadow-lg' : 'scale-100'
        }`}></div>
      </div>

      {/* Background glow effect */}
      <div className={`absolute inset-0 rounded-full transition-all duration-500 pointer-events-none ${
        hoveredSegment !== null 
          ? `bg-gradient-to-r ${hoveredSegment === 0 ? 'from-teal-400' : 'from-orange-400'} to-transparent opacity-5 scale-110` 
          : ''
      }`}></div>

      {/* Click ripple effect */}
      {clickedSegment !== null && (
        <div className={`absolute inset-0 rounded-full animate-ping pointer-events-none ${
          clickedSegment === 0 ? 'bg-teal-400' : 'bg-orange-400'
        } opacity-20`} style={{ animationDuration: '1s' }}></div>
      )}
    </div>
  );
};

export default DonutChart;