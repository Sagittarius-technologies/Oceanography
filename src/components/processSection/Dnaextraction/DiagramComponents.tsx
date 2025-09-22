import { DiagramComponent } from "../../../types/ProcessSectionTypes";
import { TestTube, Beaker, Zap, Droplets, Microscope } from "lucide-react";

const diagramComponents: DiagramComponent[] = [
    {
      x: 15,
      y: 25,
      label: "Sample",
      color: "bg-blue-600",
      hoverColor: "bg-blue-500",
      icon: TestTube,
      description: "Biological sample (blood, tissue, saliva)",
      details: "Starting material containing cells with DNA in nuclei",
    },
    {
      x: 35,
      y: 25,
      label: "Lysis Buffer",
      color: "bg-purple-600",
      hoverColor: "bg-purple-500",
      icon: Beaker,
      description: "Chemical solution to break open cells",
      details: "Contains detergents (SDS), salt (NaCl), and sometimes enzymes (proteinase K)",
    },
    {
      x: 55,
      y: 45,
      label: "Cell Lysis",
      color: "bg-red-600",
      hoverColor: "bg-red-500",
      icon: Zap,
      description: "Process of breaking open cells",
      details: "Cells are disrupted, releasing DNA, proteins, and other cellular components",
    },
    {
      x: 75,
      y: 25,
      label: "Protein Removal",
      color: "bg-orange-600",
      hoverColor: "bg-orange-500",
      icon: Droplets,
      description: "Separation of proteins from DNA",
      details: "Proteins are denatured and removed using salt precipitation or organic solvents",
    },
    {
      x: 85,
      y: 70,
      label: "Pure DNA",
      color: "bg-green-600",
      hoverColor: "bg-green-500",
      icon: Microscope,
      description: "Final purified DNA product",
      details: "High-quality DNA ready for PCR, sequencing, or other molecular applications",
    },
  ];

export default diagramComponents