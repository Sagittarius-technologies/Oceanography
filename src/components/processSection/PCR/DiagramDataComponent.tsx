import { Dna, Zap } from "lucide-react";

const diagramDataComponent = [
    {
      x: 20, y: 20,
      label: "Template DNA",
      color: "bg-blue-600",
      hoverColor: "bg-blue-500",
      icon: Dna,
      description: "Original double-stranded DNA containing target sequence",
      details: "Contains the specific region to be amplified, typically 100-3000 base pairs long"
    },
    {
      x: 50, y: 15,
      label: "Primers",
      color: "bg-purple-600",
      hoverColor: "bg-purple-500",
      description: "Short DNA sequences that bind to template",
      details: "Forward and reverse primers, typically 18-25 nucleotides long, define the target region"
    },
    {
      x: 80, y: 25,
      label: "Taq Polymerase",
      color: "bg-red-600",
      hoverColor: "bg-red-500",
      icon: Zap,
      description: "Heat-stable enzyme that synthesizes DNA",
      details: "Extracted from Thermus aquaticus, remains active at high temperatures used in PCR"
    },
    {
      x: 35, y: 60,
      label: "dNTPs",
      color: "bg-orange-600",
      hoverColor: "bg-orange-500",
      description: "Building blocks for new DNA synthesis",
      details: "Deoxynucleoside triphosphates (dATP, dCTP, dGTP, dTTP) provide energy and bases"
    },
    {
      x: 65, y: 75,
      label: "Amplified DNA",
      color: "bg-green-600",
      hoverColor: "bg-green-500",
      icon: Dna,
      description: "Exponentially amplified target sequence",
      details: "Millions of copies of the target DNA region after 25-35 PCR cycles"
    }
  ];
export default diagramDataComponent