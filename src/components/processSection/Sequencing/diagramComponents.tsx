 import { DiagramComponent } from "../../../types/SequencingTypes";
 import { Search, Activity } from "lucide-react";

 const diagramComponents: DiagramComponent[] = [
    {
      x: 15, y: 20,
      label: "Sample DNA",
      color: "bg-blue-600",
      hoverColor: "bg-blue-500",
      description: "High-quality DNA template for sequencing",
      details: "Must be pure and intact, typically >1μg for whole genome sequencing"
    },
    {
      x: 35, y: 35,
      label: "Library Prep",
      color: "bg-purple-600",
      hoverColor: "bg-purple-500",
      description: "DNA fragmentation and adapter addition",
      details: "Creates sequencing-ready library with platform-specific adapters"
    },
    {
      x: 55, y: 20,
      label: "Sequencer",
      color: "bg-red-600",
      hoverColor: "bg-red-500",
      icon: Search,
      description: "Automated DNA sequencing instrument",
      details: "Uses fluorescence detection and sophisticated optics for base calling"
    },
    {
      x: 75, y: 35,
      label: "Raw Data",
      color: "bg-orange-600",
      hoverColor: "bg-orange-500",
      icon: Activity,
      description: "Fluorescent signal data from sequencer",
      details: "Requires computational processing to convert signals to sequence"
    },
    {
      x: 85, y: 65,
      label: "DNA Sequence",
      color: "bg-green-600",
      hoverColor: "bg-green-500",
      description: "Final interpreted nucleotide sequence",
      details: "ATCG sequence with quality scores for each base position"
    }
  ];

  export default diagramComponents;