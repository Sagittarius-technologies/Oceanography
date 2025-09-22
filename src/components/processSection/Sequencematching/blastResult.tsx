import { BlastResult } from "../../../types/SequenceMatchingTypes";

const blastResults: BlastResult[] = [
    { identity: 98.5, coverage: 95, evalue: 0.0001, species: 'Homo sapiens' },
    { identity: 96.2, coverage: 88, evalue: 0.001, species: 'Pan troglodytes' },
    { identity: 94.8, coverage: 85, evalue: 0.01, species: 'Gorilla gorilla' },
    { identity: 92.1, coverage: 82, evalue: 0.1, species: 'Pongo abelii' },
    { identity: 89.7, coverage: 78, evalue: 1.0, species: 'Macaca mulatta' },
  ];

export default blastResults;  