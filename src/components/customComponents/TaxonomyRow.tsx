import React from "react";

interface TaxonomyRowProps {
  label: string;
  value: string | undefined | null;
}

const TaxonomyRow: React.FC<TaxonomyRowProps> = ({ label, value }) => {
  return (
    <div>
      <span className="text-gray-400 font-medium">{label}:</span>
      <span className="ml-1">{value || "—"}</span>
    </div>
  );
};

export default TaxonomyRow;
