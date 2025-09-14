// src/utils/index.ts
export function createPageUrl(name: string): string {
  const map: Record<string, string> = {
    Home: "/",
    Overview: "/",
    "DNA Extraction": "/dna-extraction",
  };
  return map[name] ?? "/" + name.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, "").replace(/\s+/g, "-");
}
