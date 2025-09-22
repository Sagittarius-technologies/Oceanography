// WorldMap.tsx
import React, { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { MapContainer, TileLayer, CircleMarker } from "react-leaflet";
import * as L from "leaflet"; // runtime import required for fitBounds
import "leaflet/dist/leaflet.css";
import SpeciesData from "../jsonFiles/Species.json"; // local JSON file (array)
import { Taxonomy, Location } from "../types/SpeciesDateTypes";
import CustomDensityLabel from "./customComponents/CustomDensityLabel";
import TaxonomyRow from "./customComponents/TaxonomyRow";

const getMarkerColor = (densityType: Location["densityType"], speciesCount: number) => {
  if (densityType === "marine") return "#DC2626"; // red
  if (speciesCount > 100) return "#EC4899"; // pink
  if (speciesCount > 50) return "#F97316"; // orange
  return "#10B981"; // green
};

const getMarkerRadius = (speciesCount: number) => {
  if (speciesCount > 100) return 12;
  if (speciesCount > 50) return 8;
  return 6;
};

const getLegendLabel = (d: Location) => {
  if (d.densityType === "marine") return "High Marine Density";
  if (d.speciesCount > 100) return "High Species Density (100+)";
  if (d.speciesCount > 50) return "Medium Density (50-100)";
  return "Low Density (<50)";
};

const formatNumber = (n?: number) => (n == null ? "-" : n.toLocaleString());

export default function WorldMap() {
  const [mapData, setMapData] = useState<Location[]>([]);
  const [selected, setSelected] = useState<Location | null>(null);
  const [loading, setLoading] = useState(true);
  const mapRef = useRef<L.Map | null>(null);

  useEffect(() => {                  // Map your SpeciesData JSON to the Location type.Adjust fallback keys below if your JSON uses different names.
    const load = async () => {
      try {
        const raw = (SpeciesData as any[]); // whatever is exported from your JSON
        const mapped: Location[] = raw.map((s, idx) => {
          const taxonomyFromJson: Taxonomy | undefined =
            s.taxonomy ??
            (s.taxonomy_data ? s.taxonomy_data : undefined) ??
            (s.tax ? s.tax : undefined);

          const taxonomy: Taxonomy | undefined = taxonomyFromJson
            ? {
                phylum: taxonomyFromJson.phylum ?? "",
                className: taxonomyFromJson.className ?? "",
                order: taxonomyFromJson.order ?? "",
                family: taxonomyFromJson.family ?? "",
                genus: taxonomyFromJson.genus ?? "",
                species: taxonomyFromJson.species ?? "",
              }
            : undefined;

          return {
            id: s.id ?? s.location_id ?? `loc-${idx}`,
            name: s.location_name ?? s.name ?? `Location ${idx + 1}`,
            latitude: Number(s.latitude ?? s.lat ?? 0),
            longitude: Number(s.longitude ?? s.lon ?? s.lng ?? 0),
            size: Number(s.size ?? 8),
            colorClass: s.colorClass ?? s.color_class ?? "bg-teal-500",
            densityType: (s.densityType as Location["densityType"]) ?? s.density_type ?? "low",
            speciesCount: Number(s.speciesCount ?? s.species_count ?? 0),
            speciesName:
              s.speciesName ??
              s.scientific_name ??
              s.scientificName ??
              (s.species ? (typeof s.species === "string" ? s.species : s.species.binomial) : undefined),
            commonName: s.commonName ?? s.common_name ?? s.common ?? undefined,
            taxonomy,
            populationCount: s.populationCount ?? s.population_count ?? s.pop_count ?? undefined,
            primarySpecies: s.primarySpecies ?? s.primary_species ?? undefined,
            country: s.country ?? undefined,
            state: s.state ?? s.region ?? undefined,
          } as Location;
        });

        setMapData(mapped);
      } catch (err) {
        console.error("Failed to load Species.json:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <section id="map" className="py-16 bg-gradient-to-b from-slate-50 to-white">
      <div className="max-w-7xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-10" >

          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-3">Global Biodiversity Map</h2>
          <p className="text-base md:text-lg text-slate-600 max-w-3xl mx-auto">
            Interactive visualization of species distribution worldwide. Click a marker to inspect details.
          </p>
        </motion.div>

        <div className="grid lg:grid-cols-3 gap-8">{/* LEFT: real Leaflet map (spans two columns) */} 
          <div className="lg:col-span-2">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.6 }}
              // reduced height + slight downward offset (10px)
              className="h-[420px] md:h-[520px] lg:h-[640px] rounded-2xl overflow-hidden shadow-2xl border w-full max-w-none"
              style={{ marginTop: 10 }}>
              <MapContainer
                whenReady={() => {       // callback with no arguments
                    console.log("Map is ready!");
                    if (mapRef.current) {
                       mapRef.current.setView([51.51, -0.1], 15);
                       }
                    }}
                center={[20, 0]}
                zoom={2}
                style={{ height: "100%", width: "100%" }}
                className="rounded-2xl"
                scrollWheelZoom={true}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                />

                {!loading &&
                  mapData.map((loc) => (
                    <CircleMarker
                      key={loc.id}
                      center={[loc.latitude, loc.longitude]}
                      radius={getMarkerRadius(loc.speciesCount)}
                      pathOptions={{
                        color: "#fff",
                        weight: 1.5,
                        fillColor: getMarkerColor(loc.densityType, loc.speciesCount),
                        fillOpacity: 0.9,
                      }}
                      eventHandlers={{
                        click: () => {
                          setSelected(loc);
                          if (mapRef.current) {
                            mapRef.current.flyTo([loc.latitude, loc.longitude], 4, { duration: 1.0 });
                          }},
                      }}/>
                  ))}
              </MapContainer>
            </motion.div>
          </div>

          <div className="space-y-6">           {/* RIGHT: legend + details */}
            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="rounded-2xl shadow-xl border p-4 bg-white">
                <div className="flex items-center gap-3 mb-3">
                  <svg className="w-5 h-5 text-teal-500" viewBox="0 0 24 24" fill="none">
                    <path d="M12 2L12 22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                    <circle cx="12" cy="7" r="2" fill="currentColor" />
                  </svg>
                  <h3 className="text-lg font-semibold">Data Legend</h3>
                </div>
                <div className="space-y-3 text-sm text-slate-700">
                  <CustomDensityLabel color="bg-red-500" label="High Marine Density" />
                  <CustomDensityLabel color="bg-pink-500" label="High Species Density (100+)" />
                  <CustomDensityLabel color="bg-orange-500" label="Medium Density (50-100)" />
                  <CustomDensityLabel color="bg-green-500" label="Low Density (&lt;50)" />
                </div>
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="rounded-2xl shadow-xl border p-4 bg-white min-h-[200px]">
                {!selected ? (
                  <div>
                    <h4 className="font-semibold text-lg mb-1">Location Details</h4>
                    <p className="text-sm text-slate-600">Click a marker on the map to view taxonomic info and counts.</p>
                  </div>
                ) : (
                  <div> {/* Header */}
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-semibold text-lg">{selected.name}</h4>
                        <p className="text-sm text-slate-500">Tap a marker to inspect species and location data.</p>
                      </div>
                      <div>
                        <button onClick={() => setSelected(null)} className="text-sm px-3 py-1 rounded-md border hover:bg-slate-50">Close</button>
                      </div>
                    </div>

                    <div className="mt-4 bg-[#0d1117] text-white rounded-lg p-4">    {/* Compact dark-styled Species + Location cards (fixed-size, no full-screen) */}
                      <div className="bg-[#161b22] p-4 rounded-md mb-4">       {/* Species Details Card */}
                        <div className="flex justify-between items-center mb-3">
                          <h5 className="text-lg font-bold text-[#34d399]">Species Details</h5>
                          <svg className="w-5 h-5 text-gray-400" viewBox="0 0 24 24" fill="none" aria-hidden>
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>

                        <h3 className="text-base italic font-semibold mb-1 text-center">{selected.speciesName ?? selected.primarySpecies ?? "-"}</h3>
                        {selected.commonName && <div className="text-sm italic text-gray-400 mb-3 text-center">Common name: {selected.commonName}</div>}

                        {selected.taxonomy ? (
                          <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                              <TaxonomyRow label="Phylum" value={selected.taxonomy.phylum} />
                              <TaxonomyRow label="Class" value={selected.taxonomy.className} />
                              <TaxonomyRow label="Order" value={selected.taxonomy.order} />
                              <TaxonomyRow label="Family" value={selected.taxonomy.family} />
                              <TaxonomyRow label="Genus" value={selected.taxonomy.genus} />
                              <TaxonomyRow label="Species" value={selected.taxonomy.species} />
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">No taxonomy available.</div>
                        )}
                      </div>

                      {/* Location Card */}
                      <div className="bg-[#161b22] p-4 rounded-md">
                        <div className="flex items-center mb-3">
                          <svg className="w-5 h-5 mr-2 text-[#34d399]" viewBox="0 0 24 24" fill="none">
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M17.657 16.657L13.414 20.899a2 2 0 01-2.828 0L6.343 16.657a8 8 0 1111.314 0z"></path>
                            <path stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                          </svg>
                          <h5 className="text-lg font-bold text-[#34d399]">Location Details</h5>
                        </div>

                        <div className="space-y-2 text-sm">
                          <h3 className="text-sm font-semibold">
                            {selected.state && selected.country ? `${selected.state}, ${selected.country}` : selected.state ?? selected.country ?? "-"}
                          </h3>
                          <p className="text-sm text-gray-400">
                            Coordinates: <span className="text-white">{selected.latitude.toFixed(4)}°</span>, <span className="text-white">{selected.longitude.toFixed(4)}°</span>
                          </p>
                          <p className="text-sm text-gray-400">
                            Species Count: <span className="text-white">{selected.speciesCount}</span>
                          </p>
                          <div className="inline-block px-2 py-1 bg-red-500 bg-opacity-20 rounded-full text-xs text-red-300">
                            {getLegendLabel(selected)}
                          </div>
                          <p className="text-sm text-gray-400 mt-2">
                            Population Count: <span className="text-white">{formatNumber(selected.populationCount)}</span>
                          </p>
                        </div>
                      </div>
                    </div>
                    <div className="mt-3 text-sm text-slate-500">
                      <p>
                        <span className="font-medium">Legend label:</span> {getLegendLabel(selected)}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>

            <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} transition={{ duration: 0.6 }}>
              <div className="rounded-2xl shadow-sm border p-4 bg-white">
                <h5 className="font-medium text-sm mb-2">Map Controls</h5>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      if (mapRef.current) {
                        mapRef.current.setView([20, 0], 2);
                      }
                      setSelected(null);
                    }}
                    className="text-sm px-3 py-1 rounded-md border hover:bg-slate-50"
                  >
                    Reset View
                  </button>
                  <button
                    onClick={() => {
                      if (mapRef.current && mapData.length > 0) {
                        const bounds = L.latLngBounds(mapData.map((m) => [m.latitude, m.longitude]));
                        mapRef.current.fitBounds(bounds, { padding: [40, 40] });
                      }
                    }}
                    className="text-sm px-3 py-1 rounded-md border hover:bg-slate-50"
                  >
                    Fit to markers
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}