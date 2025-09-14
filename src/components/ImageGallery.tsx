import React, { useRef } from "react";
import { motion } from "framer-motion";

const galleryImages = [
  {
    url: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?q=80&w=2070&auto=format&fit=crop",
    title: "Marine Biodiversity",
    description: "Explore the vast ecosystems of our oceans.",
    link: "https://ocean.si.edu/"
  },
  {
    url: "https://images.unsplash.com/photo-1555169062-013468b47731?q=80&w=1887&auto=format&fit=crop",
    title: "Avian Species",
    description: "Discover the world of birds through ornithology.",
    link: "https://birdsoftheworld.org/bow/home"
  },
  {
    url: "/images/Tiger_1.jpg",
    title: "Mammalian Research",
    description: "Genetic markers and studies in mammals.",
    link: "https://www.mammalsociety.org/"
  },
  {
    url: "/images/insect_3.jpg",
    title: "Entomology Studies",
    description: "The fascinating world of insect species.",
    link: "https://www.entsoc.org/"
  },
  {
    url: "/images/reptiles_1.jpg",
    title: "Herpetology",
    description: "Research on reptiles and amphibians.",
    link: "https://ssarherps.org/"
  },
  {
    url: "/images/mushroom.jpg",
    title: "Mycology",
    description: "The study of fungi and their genetic diversity.",
    link: "https://namyco.org/"
  },
  {
    url: "/images/botony.jpg",
    title: "Botany",
    description: "Exploring plant science and genomics.",
    link: "https://www.botany.org/"
  },
  {
    url: "/images/virus.jpg",
    title: "Virology",
    description: "The intricate science of viruses.",
    link: "https://www.asv.org/"
  }
];

export default function ImageGallery() {
  const containerRef = useRef(null);

  // duplicate the list for a seamless infinite loop
  const items = [...galleryImages, ...galleryImages];
  const baseCount = galleryImages.length;

  return (
    <section id="gallery" ref={containerRef} className="py-24 bg-slate-900 overflow-hidden">
      <style>{`
        /* --duration controls speed. 12s = faster horizontal loop.
           Keep translateX(-50%) because we duplicated the content. */
        .infinite-track {
          --duration: 12s; /* faster loop */
          display: flex;
          gap: 1.5rem;
          align-items: stretch;
          min-width: 200%;           /* ensures track covers twice the viewport content */
          width: max-content;
          animation: scroll-left var(--duration) linear infinite;
          will-change: transform;
        }
        .infinite-track:hover { animation-play-state: paused; }
        @keyframes scroll-left {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); } /* move one full copy width */
        }
        .slide { flex: 0 0 20rem; } /* w-80 */
        /* Avoid subpixel seam artifacts on some browsers */
        .infinite-track, .infinite-track > .slide { backface-visibility: hidden; transform-style: preserve-3d; }
      `}</style>

      <div className="max-w-7xl mx-auto px-6">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explore Fields of Biology
          </h2>
          <p className="text-xl text-slate-300 max-w-3xl mx-auto">
            Journey through diverse biological disciplines. Click on any card to visit a
            leading resource in that field.
          </p>
        </div>

        <div className="relative overflow-hidden">
          <div className="infinite-track" aria-hidden={false}>
            {items.map((image, idx) => {
              const index = idx % baseCount;
              const isFirstOfSequence = index === 0; // marks Marine Biodiversity in each duplicated block

              // Make the first card's fade & overlay super quick so it's visible before it scrolls away
              const cardInitial = { opacity: isFirstOfSequence ? 0.3 : 0.0, scale: isFirstOfSequence ? 0.99 : 0.96 };
              const cardAnimate = { opacity: 1, scale: 1 };
              const cardTransition = {
                delay: 0, // no delays; animate immediately on mount
                duration: isFirstOfSequence ? 0.12 : 0.22,
                ease: "easeOut"
              };

              // Fast overlay for the first item, slightly longer for others
              const overlayInitial = { opacity: 0 };
              const overlayAnimate = { opacity: 1 };
              const overlayTransition = { duration: isFirstOfSequence ? 1 : 0.50 };

              return (
                <a
                  key={idx}
                  href={image.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="slide"
                >
                  <motion.div
                    initial={cardInitial}
                    animate={cardAnimate}
                    transition={cardTransition}
                    whileHover={{ scale: 1.04, y: -6 }}
                    className="h-96 bg-white rounded-2xl overflow-hidden shadow-2xl cursor-pointer group"
                    aria-label={image.title}
                  >
                    <div className="relative h-64 overflow-hidden">
                      <img
                        src={image.url}
                        alt={image.title}
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        loading="lazy"
                      />
                      <motion.div
                        initial={overlayInitial}
                        animate={overlayAnimate}
                        transition={overlayTransition}
                        className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent"
                        aria-hidden="true"
                      />
                    </div>

                    <div className="p-6">
                      <h3 className="text-xl font-bold text-slate-900 mb-2">
                        {image.title}
                      </h3>
                      <p className="text-slate-600 leading-relaxed">
                        {image.description}
                      </p>
                    </div>
                  </motion.div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
 