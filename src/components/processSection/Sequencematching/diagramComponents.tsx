import { Target, Database, Search } from 'lucide-react';
import { DiagramComponent } from '../../../types/SequenceMatchingTypes';  

  const diagramComponents: DiagramComponent[] = [
    {
      x: 15,
      y: 25,
      label: 'Query Sequence',
      color: 'bg-blue-600',
      hoverColor: 'bg-blue-500',
      description: 'Unknown DNA sequence for identification',
      details: 'Typically 400-800bp DNA barcode region (COI gene for animals)',
    },
    {
      x: 35,
      y: 15,
      label: 'BLAST Algorithm',
      color: 'bg-purple-600',
      hoverColor: 'bg-purple-500',
      icon: Search,
      description: 'Sequence alignment search algorithm',
      details: 'Finds regions of local similarity between biological sequences',
    },
    {
      x: 55,
      y: 35,
      label: 'Reference Database',
      color: 'bg-red-600',
      hoverColor: 'bg-red-500',
      icon: Database,
      description: 'Curated collection of known sequences',
      details: 'NCBI GenBank, BOLD Systems, or custom reference libraries',
    },
    {
      x: 75,
      y: 20,
      label: 'Alignment Results',
      color: 'bg-orange-600',
      hoverColor: 'bg-orange-500',
      description: 'Scored sequence comparisons',
      details: 'Identity percentage, query coverage, and statistical significance',
    },
    {
      x: 85,
      y: 60,
      label: 'Species ID',
      color: 'bg-green-600',
      hoverColor: 'bg-green-500',
      icon: Target,
      description: 'Taxonomic classification result',
      details: 'Scientific name of most closely related species in database',
    },
  ];

  export default diagramComponents;