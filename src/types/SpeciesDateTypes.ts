/* ----- types ----- */
export type Taxonomy = {
  phylum: string;
  className: string; // using className to avoid TS keyword conflict
  order: string;
  family: string;
  genus: string;
  species: string;
};

export type Location = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  size: number;
  colorClass: string;
  densityType: "marine" | "high" | "medium" | "low";
  speciesCount: number;
  speciesName?: string;
  commonName?: string;
  taxonomy?: Taxonomy;
  populationCount?: number;
  primarySpecies?: string;
  country?: string;
  state?: string;
};

export type Researcher = {
  id: number;
  name: string;
  field: string;
  image: string;
  birth: string;
  death: string | null;
  nationality: string;
  achievements: string[];
  biography: string;
  links: { name: string; url: string }[];
  quote: string;
};