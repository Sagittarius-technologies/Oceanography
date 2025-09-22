export type ProcessStep = {
  number: string;
  title: string;
  description: string;
  icon: React.ComponentType<any>;
  color: string; // tailwind gradient class suffix (e.g. 'from-teal-500 to-cyan-500')
  page: string;
};

export type ExtractionStep = {
  title: string;
  description: string;
  details: string;
  icon?: string;
};

export type DiagramComponent = {
  x: number;
  y: number;
  label: string;
  color: string;
  hoverColor?: string;
  icon: React.ComponentType<any>;
  description: string;
  details: string;
};

export type Connection = {
  from: { x: number; y: number };
  to: { x: number; y: number };
};

export type RealWorldMethod = {
  method: string;
  purity: string;
  yield: string;
  time: string;
  cost: string;
};

export type MatchingStep = {
  title: string;
  description: string;
  details?: string;
};

export type BlastResult = {
  identity: number;
  coverage: number;
  evalue: number;
  species: string;
};
