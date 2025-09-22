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

export type DiagramComponent = {
  x: number;
  y: number;
  label: string;
  color?: string;
  hoverColor?: string;
  icon?: React.ComponentType<any>;
  description?: string;
  details?: string;
};
