import {SequencingStep} from '../../../types/SequencingTypes'

 const sequencingSteps: SequencingStep[] = [
    {
      title: "DNA Fragmentation",
      description: "Breaking DNA into manageable pieces",
      details: "Random or enzymatic fragmentation creates overlapping fragments for comprehensive coverage.",
    },
    {
      title: "Adapter Ligation",
      description: "Adding sequencing adapters to DNA fragments",
      details: "Universal sequences enable binding to sequencing platforms and primer annealing.",
    },
    {
      title: "Amplification",
      description: "Creating clusters of identical DNA fragments",
      details: "Bridge amplification or emulsion PCR generates clonal clusters for signal detection.",
    },
    {
      title: "Sequencing by Synthesis",
      description: "Reading DNA sequence through base incorporation",
      details: "Fluorescent nucleotides are incorporated and detected in real-time or in cycles.",
    },
    {
      title: "Base Calling",
      description: "Converting signals to DNA sequence",
      details: "Sophisticated algorithms interpret optical signals to determine nucleotide sequence.",
    },
  ];

  export default sequencingSteps;