import { MatchingStep } from "../../../types/SequenceMatchingTypes";

const matchingSteps: MatchingStep[] = [
    {
      title: 'Query Submission',
      description: 'Input unknown DNA sequence for identification',
      details: 'Submit FASTA-formatted sequence to public databases like NCBI BLAST or BOLD Systems.',
    },
    {
      title: 'Database Search',
      description: 'Compare against millions of reference sequences',
      details: 'Algorithm searches through comprehensive databases containing known species sequences.',
    },
    {
      title: 'Alignment Scoring',
      description: 'Calculate similarity scores for potential matches',
      details: 'Uses scoring matrices to evaluate sequence alignment quality and statistical significance.',
    },
    {
      title: 'Statistical Analysis',
      description: 'Assess the reliability of matches',
      details: 'E-values and bit scores determine the probability of matches occurring by chance.',
    },
    {
      title: 'Species Identification',
      description: 'Report most likely taxonomic classification',
      details: 'Highest scoring matches with sufficient similarity indicate species identity.',
    },
  ];

  export default matchingSteps