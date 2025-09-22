import React from "react";

type StatCardProps = {
  value: string;
  label: string;
  color?: string; // optional, defaults to white
};

const StatCard: React.FC<StatCardProps> = ({ value, label, color = "text-white" }) => {
  return (
    <div className="text-center p-6 bg-slate-900 rounded-lg">
      <div className={`text-3xl font-bold mb-2 ${color}`}>{value}</div>
      <div className="text-slate-300">{label}</div>
    </div>
  );
};

export default StatCard;
