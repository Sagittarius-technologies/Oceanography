import React, { useEffect, useState } from "react";
import { ArrowRight } from "lucide-react";

type Stat = {
  value: number; // numeric base (e.g. 892 for 892k)
  suffix?: string; // e.g. 'k', 'm'
  label: string;
  color: string; // tailwind text color class
};

// Small count-up hook using requestAnimationFrame
function useCountUp(target: number, duration = 1200) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    let rafId: number;
    const start = performance.now();

    function tick(now: number) {
      const elapsed = now - start;
      const progress = Math.min(elapsed / duration, 1);
      const current = Math.round(progress * target);
      setValue(current);
      if (progress < 1) rafId = requestAnimationFrame(tick);
    }

    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
  }, [target, duration]);

  return value;
}

const DonutChart: React.FC = () => {
  const [hoveredSegment, setHoveredSegment] = useState<number | null>(null);
  const [isAnimated, setIsAnimated] = useState(false);

  const data = [
    { value: 60, color: 'stroke-teal-400', fillColor: 'fill-teal-400', label: '3.8M', description: 'Public Records' },
    { value: 40, color: 'stroke-orange-400', fillColor: 'fill-orange-400', label: '4.4M', description: 'Awaiting Validation' }
  ];

  const radius = 120;
  const strokeWidth = 30;
  const normalizedRadius = radius - strokeWidth * 2;
  const circumference = normalizedRadius * 2 * Math.PI;

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const getSegmentPath = (startAngle: number, endAngle: number, isHovered: boolean) => {
    const adjustedRadius = normalizedRadius + (isHovered ? 5 : 0);
    const start = (startAngle - 90) * (Math.PI / 180);
    const end = (endAngle - 90) * (Math.PI / 180);

    const x1 = radius + adjustedRadius * Math.cos(start);
    const y1 = radius + adjustedRadius * Math.sin(start);
    const x2 = radius + adjustedRadius * Math.cos(end);
    const y2 = radius + adjustedRadius * Math.sin(end);

    const largeArcFlag = endAngle - startAngle <= 180 ? 0 : 1;

    return `M ${radius} ${radius} L ${x1} ${y1} A ${adjustedRadius} ${adjustedRadius} 0 ${largeArcFlag} 1 ${x2} ${y2} Z`;
  };

  let currentAngle = 0;

  return (
    <div className="relative w-80 h-80 group cursor-pointer">
      <svg
        height={radius * 2}
        width={radius * 2}
        className="overflow-visible"
      >
        {/* Background circle */}
        <circle
          stroke="rgba(255, 255, 255, 0.1)"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={normalizedRadius}
          cx={radius}
          cy={radius}
          className="transition-all duration-300"
        />

        {/* Interactive segments */}
        {data.map((segment, index) => {
          const segmentAngle = (segment.value / 100) * 360;
          const startAngle = currentAngle;
          const endAngle = currentAngle + segmentAngle;
          const isHovered = hoveredSegment === index;
          
          currentAngle += segmentAngle;

          return (
            <g key={index}>
              {/* Segment path for hover area */}
              <path
                d={getSegmentPath(startAngle, endAngle, isHovered)}
                className={`${segment.fillColor} opacity-0 hover:opacity-10 transition-all duration-300`}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
              
              {/* Segment stroke */}
              <circle
                stroke="currentColor"
                fill="transparent"
                strokeWidth={isHovered ? strokeWidth + 4 : strokeWidth}
                strokeDasharray={`${isAnimated ? segment.value / 100 * circumference : 0} ${circumference}`}
                strokeLinecap="round"
                r={normalizedRadius + (isHovered ? 2 : 0)}
                cx={radius}
                cy={radius}
                className={`${segment.color} transition-all duration-500 ease-out ${isHovered ? 'drop-shadow-lg' : ''}`}
                style={{
                  strokeDashoffset: index === 0 ? 0 : -(data[0].value / 100 * circumference),
                  filter: isHovered ? 'drop-shadow(0 0 8px currentColor)' : 'none'
                }}
                onMouseEnter={() => setHoveredSegment(index)}
                onMouseLeave={() => setHoveredSegment(null)}
              />
            </g>
          );
        })}
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
        <div className="text-center transform transition-all duration-300 group-hover:scale-105">
          <div className="text-sm text-gray-400 mb-1 transition-colors duration-300">
            {hoveredSegment !== null ? data[hoveredSegment].description : 'Total Sequences'}
          </div>
          <div className={`text-3xl font-bold text-white transition-all duration-300 ${hoveredSegment !== null ? 'scale-110' : ''}`}>
            {hoveredSegment !== null ? data[hoveredSegment].label : '8,247,593'}
          </div>
        </div>
      </div>

      {/* Interactive Labels */}
      <div 
        className={`absolute top-4 right-4 text-right transition-all duration-300 cursor-pointer ${hoveredSegment === 0 ? 'scale-110 drop-shadow-lg' : ''}`}
        onMouseEnter={() => setHoveredSegment(0)}
        onMouseLeave={() => setHoveredSegment(null)}
      >
        <div className={`text-2xl font-bold text-teal-400 transition-all duration-300 ${hoveredSegment === 0 ? 'text-teal-300' : ''}`}>
          {data[0].label}
        </div>
        <div className={`text-xs text-gray-400 transition-opacity duration-300 ${hoveredSegment === 0 ? 'opacity-100' : 'opacity-0'}`}>
          {data[0].description}
        </div>
      </div>
      
      <div 
        className={`absolute bottom-4 right-4 text-right transition-all duration-300 cursor-pointer ${hoveredSegment === 1 ? 'scale-110 drop-shadow-lg' : ''}`}
        onMouseEnter={() => setHoveredSegment(1)}
        onMouseLeave={() => setHoveredSegment(null)}
      >
        <div className={`text-2xl font-bold text-orange-400 transition-all duration-300 ${hoveredSegment === 1 ? 'text-orange-300' : ''}`}>
          {data[1].label}
        </div>
        <div className={`text-xs text-gray-400 transition-opacity duration-300 ${hoveredSegment === 1 ? 'opacity-100' : 'opacity-0'}`}>
          {data[1].description}
        </div>
      </div>

      {/* Pulse effect on hover */}
      <div className={`absolute inset-0 rounded-full transition-all duration-300 pointer-events-none ${hoveredSegment !== null ? 'bg-white bg-opacity-5 animate-pulse' : ''}`}></div>
    </div>
  );
};

const DataPortal: React.FC = () => {
  const stats: Stat[] = [
    { value: 892, suffix: "k", label: "Marine BINs", color: "text-teal-400" },
    { value: 156, suffix: "k", label: "Fish Species", color: "text-teal-400" },
    { value: 67, suffix: "k", label: "Invertebrate Species", color: "text-teal-400" },
    { value: 23, suffix: "k", label: "Algae & Other Species", color: "text-teal-400" },
  ];

  const [startCounters, setStartCounters] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  const counts = stats.map((s) => useCountUp(startCounters ? s.value : 0, 1300));

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(true);
      setStartCounters(true);
    }, 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <section className="py-20 bg-gradient-to-br from-slate-900 to-blue-900 min-h-screen">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left Content */}
          <div className={`transition-all duration-700 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-6'}`}>
            <div className="inline-block bg-slate-800 text-white px-4 py-2 rounded-lg text-sm font-medium mb-6 shadow-lg hover:shadow-xl transition-shadow duration-300">
              Marine Data Portal
            </div>

            <h2 className="text-4xl lg:text-5xl font-bold text-white mb-6 leading-tight">
              A data portal that provides access to over
              <span className="block text-orange-400 mt-2 bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                8.2m marine records representing
              </span>
              <span className="block text-orange-400 bg-gradient-to-r from-orange-400 to-orange-500 bg-clip-text text-transparent">
                847k Marine Species
              </span>
            </h2>

            <p className="text-lg text-gray-300 mb-8 leading-relaxed">
              The records in the portal are public and fully accessible. The <span className="text-teal-400 font-semibold">remaining records</span> await validation and release.
            </p>

            <button
              onClick={() => window.location.assign("/portal")}
              className="group inline-flex items-center space-x-2 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white px-8 py-3 rounded-lg font-medium shadow-lg hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-400 transition-all duration-300 transform hover:scale-105"
              aria-label="Open Marine Portal"
            >
              <span>Marine Portal</span>
              <ArrowRight className="w-5 h-5 group-hover:translate-x-2 transition-transform duration-300" />
            </button>
          </div>

          {/* Right Content - Interactive Chart */}
          <div className={`flex justify-center transition-all duration-700 delay-200 ${isVisible ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-6'}`}>
            <div className="transform hover:scale-105 transition-transform duration-300">
              <DonutChart />
            </div>
          </div>
        </div>

        {/* Interactive Statistics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mt-16 text-center items-center">
          {stats.map((stat, index) => (
            <div
              key={index}
              className={`group flex flex-col items-center p-4 rounded-lg hover:bg-white hover:bg-opacity-5 transition-all duration-300 cursor-pointer transform hover:scale-105 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}
              style={{ transitionDelay: `${0.12 * index + 400}ms` }}
            >
              <div className="text-3xl md:text-4xl font-bold text-white mb-2 tabular-nums group-hover:text-teal-300 transition-colors duration-300">
                {counts[index]}
                {stat.suffix}
              </div>
              <div className={`text-sm md:text-base ${stat.color} font-medium group-hover:text-teal-300 transition-colors duration-300`}>
                {stat.label}
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default DataPortal;