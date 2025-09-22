import React from "react";

interface ColoredDotLabelProps {
  color: string; // Tailwind color class, e.g., "bg-red-500"
  label: string;
}

const CustomDensityLabel: React.FC<ColoredDotLabelProps> = ({ color, label }) => {
  return (
    <div className="flex items-center gap-3">
      <div className={`w-4 h-4 rounded-full ${color}`}></div>
      <span>{label}</span>
    </div>
  );
};

export default CustomDensityLabel;
