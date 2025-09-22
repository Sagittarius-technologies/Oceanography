import { SeqTech } from "../../../types/SequencingTypes";

  const sequencingTechnologies: SeqTech[] = [
    { technology: "Sanger", readLength: 800, throughput: 96, accuracy: 99.9, cost: 1000 },
    { technology: "Illumina", readLength: 300, throughput: 20000000, accuracy: 99.5, cost: 10 },
    { technology: "PacBio", readLength: 15000, throughput: 500000, accuracy: 95.0, cost: 50 },
    { technology: "Oxford Nanopore", readLength: 30000, throughput: 4000000, accuracy: 92.0, cost: 20 },
  ];

export default sequencingTechnologies;