// src/components/ResearchersSection.tsx
import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { ExternalLink, Calendar, MapPin, Award, X } from 'lucide-react';

type Researcher = {
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

/* ------------------------
   Small UI primitives
   (local, minimal — tweak styles as needed)
   ------------------------ */
const Card: React.FC<{ className?: string; onClick?: () => void; children?: React.ReactNode }> = ({ className = '', onClick, children }) => (
  <div onClick={onClick} className={`rounded-2xl overflow-hidden ${className}`} role="button" tabIndex={0}>
    {children}
  </div>
);

const CardContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <div className={className}>{children}</div>
);

const Button: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'solid' | 'outline'; size?: 'sm' | 'md' }> = ({ variant = 'solid', size = 'md', className = '', children, ...props }) => {
  const base = 'inline-flex items-center gap-2 rounded-md font-medium focus:outline-none focus:ring-2 focus:ring-offset-1';
  const sizes: Record<string, string> = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm' };
  const variants: Record<string, string> = {
    solid: 'bg-teal-600 text-white hover:bg-teal-700',
    outline: 'bg-transparent border border-slate-200 text-slate-700 hover:bg-slate-50'
  };
  return (
    <button {...props} className={`${base} ${sizes[size]} ${variants[variant]} ${className}`}>
      {children}
    </button>
  );
};

const Badge: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <span className={`inline-block text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-800 ${className}`}>{children}</span>
);

const Dialog: React.FC<{ open: boolean; onOpenChange: (open: boolean) => void; children?: React.ReactNode }> = ({ open, onOpenChange, children }) => {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onOpenChange(false);
    };
    if (open) window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [open, onOpenChange]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4" onClick={() => onOpenChange(false)}>
      <div className="absolute inset-0 bg-black/50" />
      <div onClick={(e) => e.stopPropagation()} className="relative w-full max-w-4xl">
        {children}
      </div>
    </div>
  );
};

const DialogContent: React.FC<{ className?: string; children?: React.ReactNode }> = ({ className = '', children }) => (
  <div className={`bg-white rounded-2xl p-6 shadow-xl ${className}`}>{children}</div>
);

const DialogHeader: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <div className={`flex items-start justify-between ${className}`}>{children}</div>
);

const DialogTitle: React.FC<{ children?: React.ReactNode; className?: string }> = ({ children, className = '' }) => (
  <h3 className={`text-2xl font-bold ${className}`}>{children}</h3>
);

/* ------------------------
   Data
   ------------------------ */
const researchers: Researcher[] = [
  {
    id: 1,
    name: "Charles Darwin",
    field: "Natural Selection & Evolution",
    image: "https://upload.wikimedia.org/wikipedia/commons/thumb/2/2e/Charles_Darwin_seated_crop.jpg/512px-Charles_Darwin_seated_crop.jpg",
    birth: "1809-02-12",
    death: "1882-04-19",
    nationality: "British",
    achievements: [
      "Theory of Evolution by Natural Selection",
      "Author of 'On the Origin of Species'",
      "Voyage on HMS Beagle",
      "Established modern evolutionary biology"
    ],
    biography:
      "Charles Robert Darwin was an English naturalist, geologist and biologist, best known for his contributions to the science of evolution. His proposition that all species of life have descended over time from common ancestors is now widely accepted and considered a foundational concept in science.",
    links: [
      { name: "Darwin Online", url: "http://darwin-online.org.uk/" },
      { name: "Natural History Museum", url: "https://www.nhm.ac.uk/discover/charles-darwin.html" }
    ],
    quote: "It is not the strongest of the species that survives, nor the most intelligent, but the one most responsive to change."
  },
  {
    id: 2,
    name: "Gregor Mendel",
    field: "Genetics & Heredity",
    image: "/images/Gregor_Mendel_2.jpg",
    birth: "1822-07-20",
    death: "1884-01-06",
    nationality: "Austrian",
    achievements: [
      "Laws of Mendelian Inheritance",
      "Father of Modern Genetics",
      "Pea Plant Experiments",
      "Discovered dominant and recessive traits"
    ],
    biography:
      "Gregor Johann Mendel was a meteorologist, mathematician, biologist, Augustinian friar and abbot of St. Thomas' Abbey in Brno. He is famous for his work on heredity and is known as the father of modern genetics.",
    links: [
      { name: "Mendel Museum", url: "https://mendelmuseum.muni.cz/en" },
      { name: "Nature Education", url: "https://www.nature.com/scitable/topicpage/gregor-mendel-and-the-principles-of-inheritance-593/" }
    ],
    quote:
      "My scientific studies have afforded me great gratification; and I am convinced that it will not be long before the whole world acknowledges the results of my work."
  },
  {
    id: 3,
    name: "Rosalind Franklin",
    field: "X-ray Crystallography & DNA Structure",
    image: "/images/Rosalind-Franklin.jpg",
    birth: "1920-07-25",
    death: "1958-04-16",
    nationality: "British",
    achievements: [
      "Photo 51 - X-ray crystallography of DNA",
      "Contributed to discovery of DNA double helix",
      "Research on RNA and virus structures",
      "Pioneer in molecular biology techniques"
    ],
    biography:
      "Rosalind Elsie Franklin was an English chemist and X-ray crystallographer whose work was central to the understanding of the molecular structures of DNA, RNA, tobacco mosaic virus, and polio virus.",
    links: [
      { name: "King's College London", url: "https://www.kcl.ac.uk/rosalind-franklin" },
      { name: "Smithsonian", url: "https://www.smithsonianmag.com/science-nature/rosalind-franklin-and-dna-56487/" }
    ],
    quote: "Science and everyday life cannot and should not be separated."
  },
  // add other researchers or use your existing list...
];

/* ------------------------
   Component
   ------------------------ */
export default function ResearchersSection(): JSX.Element {
  const [selectedResearcher, setSelectedResearcher] = useState<Researcher | null>(null);

  const calculateAge = (birth: string, death: string | null) => {
    const birthDate = new Date(birth);
    const endDate = death ? new Date(death) : new Date();
    return Math.floor((endDate.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
  };

  const onViewPrimaryProfile = (researcher: Researcher) => {
    const first = researcher.links?.[0];
    if (first?.url) {
      // open primary link in new tab (external)
      window.open(first.url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-slate-900 mb-6">Pioneering Scientists</h2>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Explore the lives and discoveries of the brilliant minds who shaped our understanding of biology, genetics, and evolution.
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {researchers.map((r, i) => (
            <motion.div key={r.id} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06, duration: 0.6 }} whileHover={{ y: -6, scale: 1.01 }}>
              <Card className="cursor-pointer border-0 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white h-full" onClick={() => setSelectedResearcher(r)}>
                <CardContent className="p-0">
                  <div className="relative h-64 overflow-hidden">
                    <img src={r.image} alt={r.name} className="w-full h-full object-cover transition-transform duration-700 hover:scale-110" />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                    <div className="absolute bottom-4 left-4 text-white">
                      <h3 className="text-xl font-bold mb-1">{r.name}</h3>
                      <p className="text-sm opacity-90">{r.field}</p>
                    </div>
                    <div className="absolute top-4 right-4">
                      <Badge className="bg-teal-500 text-white">{r.nationality}</Badge>
                    </div>
                  </div>

                  <div className="p-6">
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-3">
                      <Calendar className="w-4 h-4" />
                      <div>{r.birth} - {r.death || 'Present'}</div>
                    </div>
                    <p className="text-slate-600 leading-relaxed">
                      {r.biography.slice(0, 120)}...
                    </p>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>

        <Dialog open={!!selectedResearcher} onOpenChange={(open) => { if (!open) setSelectedResearcher(null); }}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
            {selectedResearcher && (
              <div>
                <DialogHeader>
                  <div>
                    <DialogTitle>{selectedResearcher.name}</DialogTitle>
                    <div className="text-sm text-slate-500">{selectedResearcher.field}</div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" className="mr-2" onClick={() => onViewPrimaryProfile(selectedResearcher)}>
                      <ExternalLink className="w-4 h-4" /> View profile
                    </Button>

                    <button onClick={() => setSelectedResearcher(null)} className="p-2 rounded-full hover:bg-slate-100">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </DialogHeader>

                <div className="grid md:grid-cols-3 gap-6 mt-6">
                  <div className="md:col-span-1">
                    <img src={selectedResearcher.image} alt={selectedResearcher.name} className="w-full rounded-lg shadow-lg" />
                    <div className="mt-6 space-y-4">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Calendar className="w-5 h-5" />
                        <div>
                          <div className="font-medium">Born: {selectedResearcher.birth}</div>
                          {selectedResearcher.death && <div>Died: {selectedResearcher.death}</div>}
                          <div className="text-sm text-slate-500">Age: {calculateAge(selectedResearcher.birth, selectedResearcher.death)}{selectedResearcher.death ? ' years' : ' years old'}</div>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-slate-600">
                        <MapPin className="w-5 h-5" />
                        <span>{selectedResearcher.nationality}</span>
                      </div>

                      <div className="flex items-start gap-2 text-slate-600">
                        <Award className="w-5 h-5 mt-1" />
                        <span className="font-medium">{selectedResearcher.field}</span>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <div className="space-y-6">
                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Biography</h4>
                        <p className="text-slate-600 leading-relaxed">{selectedResearcher.biography}</p>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Key Achievements</h4>
                        <ul className="space-y-2">
                          {selectedResearcher.achievements.map((ach, idx) => (
                            <li key={idx} className="flex items-start gap-2">
                              <div className="w-2 h-2 bg-teal-500 rounded-full mt-2 flex-shrink-0" />
                              <span className="text-slate-600">{ach}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Famous Quote</h4>
                        <blockquote className="border-l-4 border-teal-500 pl-4 py-2 bg-teal-50 rounded-r-lg">
                          <p className="italic text-slate-700">"{selectedResearcher.quote}"</p>
                        </blockquote>
                      </div>

                      <div>
                        <h4 className="text-xl font-bold text-slate-900 mb-3">Links</h4>
                        <div className="flex flex-wrap gap-3">
                          {selectedResearcher.links.map((link, idx) => (
                            <a key={idx} href={link.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 border px-3 py-2 rounded-md text-sm hover:bg-slate-50">
                              <ExternalLink className="w-4 h-4" />
                              <span>{link.name}</span>
                            </a>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </section>
  );
}
