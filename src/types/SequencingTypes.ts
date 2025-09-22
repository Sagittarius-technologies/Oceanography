export type SequencingStep = {
  title: string;
  description: string;
  details?: string;
};

export type SeqTech = {
  technology: string;
  readLength: number;
  throughput: number;
  accuracy: number;
  cost: number;
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
