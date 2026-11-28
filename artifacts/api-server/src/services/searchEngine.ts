import fs from "fs";
import path from "path";
import crypto from "crypto";
import { query } from "@workspace/db";
import { SEARCH_STORE_PATH } from "../lib/paths";
import { productStore, type MasterProductRecord } from "./productStore";
import { categoryStore } from "./categoryStore";
import { logger } from "../lib/logger";

export interface SearchStageShortcut {
  id: string;
  label: string;
  icon: string;
  description: string;
  keywords: string[];
  categorySlugs: string[];
  isActive: boolean;
  order: number;
}

export interface SearchSynonymRule {
  id: string;
  keywords: string[];
  mapsTo: string;
  categorySlug?: string;
  isActive: boolean;
  updatedAt: string;
}

export interface SearchStudioConfig {
  placeholders: string[];
  trendingSearches: string[];
  stageShortcuts: SearchStageShortcut[];
  voiceSearchEnabled: boolean;
  siteParchiEnabled: boolean;
  updatedAt: string;
}

export interface SearchLogRecord {
  id: string;
  query: string;
  normalizedQuery: string;
  resultCount: number;
  matchedSynonym?: string;
  createdAt: string;
}

export interface SearchSourcingRequest {
  id: string;
  itemName: string;
  quantityText: string;
  phone: string;
  pincode?: string;
  status: "NEW" | "CONTACTED" | "ADDED_TO_CATALOG";
  createdAt: string;
  updatedAt: string;
}

interface PersistedSearchStore {
  config: SearchStudioConfig;
  synonyms: SearchSynonymRule[];
  logs: SearchLogRecord[];
  requests: SearchSourcingRequest[];
}

const DEFAULT_CONFIG: SearchStudioConfig = {
  placeholders: [
    'Search "UltraTech Cement"',
    'Search "12mm TMT Sariya"',
    'Search "Morang 50 Kg"',
    'Search "Dr. Fixit Seelan"',
    'Search "CPVC Pipe"',
    'Search "Birla White Putty"',
  ],
  trendingSearches: [
    "UltraTech PPC",
    "ACC Suraksha",
    "Dr. Fixit LW+",
    "12mm Sariya",
    "Birla Putty",
    "Astral CPVC",
    "Fevicol SH",
    "Kajaria Vitrified Tiles",
  ],
  stageShortcuts: [
    {
      id: "stage-foundation",
      label: "Foundation & RCC",
      icon: "layers",
      description: "Cement, TMT Steel, Morang & Gitti",
      keywords: ["cement", "sariya", "tmt", "morang", "gitti", "rmc", "concrete"],
      categorySlugs: ["cement-civil-works", "bricks-sand-gitti-aac", "rmc-ready-mix-concrete"],
      isActive: true,
      order: 1,
    },
    {
      id: "stage-brickwork",
      label: "Brickwork & Plaster",
      icon: "grid",
      description: "Red Bricks, AAC Blocks, Sand & White Cement",
      keywords: ["brick", "eent", "aac", "sand", "baalu", "plaster", "mortar"],
      categorySlugs: ["bricks-sand-gitti-aac", "cement-civil-works"],
      isActive: true,
      order: 2,
    },
    {
      id: "stage-waterproofing",
      label: "Waterproofing",
      icon: "shield",
      description: "Seelan Prevention, LW+, SBR Latex & Coatings",
      keywords: ["dr fixit", "waterproof", "seelan", "leakage", "chemical", "lw+"],
      categorySlugs: ["cement-civil-works", "paints-putty-primer", "tile-stone-installation"],
      isActive: true,
      order: 3,
    },
    {
      id: "stage-plumbing",
      label: "Plumbing Setup",
      icon: "droplets",
      description: "CPVC / UPVC Pipes, Tanks & Sanitaryware",
      keywords: ["cpvc", "pipe", "nal", "toti", "tank", "bath", "sanitary", "faucet"],
      categorySlugs: ["cpvc-plumbing-tanks", "sanitary-bath-fittings", "kitchen-sinks-faucets"],
      isActive: true,
      order: 4,
    },
    {
      id: "stage-electrical",
      label: "Electrical & Solar",
      icon: "zap",
      description: "FR Wires, MCBs, Architectural Lights & Rooftop Solar",
      keywords: ["wire", "taar", "mcb", "switch", "light", "bijli", "cable", "fan", "solar", "panel", "inverter"],
      categorySlugs: ["wires-mcb-electrical", "lighting", "solar-rooftop-power", "home-appliances"],
      isActive: true,
      order: 5,
    },
    {
      id: "stage-painting",
      label: "Painting & Finishing",
      icon: "paintbrush",
      description: "Putty, Primers, Emulsions & Plywood/Fevicol",
      keywords: ["paint", "putty", "putti", "primer", "rang", "fevicol", "plywood"],
      categorySlugs: ["paints-putty-primer", "plywood-boards", "fevicol-adhesives-sealants"],
      isActive: true,
      order: 6,
    },
  ],
  voiceSearchEnabled: true,
  siteParchiEnabled: true,
  updatedAt: new Date().toISOString(),
};

const DEFAULT_SYNONYMS: SearchSynonymRule[] = [
  {
    id: "syn-sariya",
    keywords: ["sariya", "saria", "loha", "rod", "tmt", "sariyaa", "steel bar"],
    mapsTo: "TMT Bars / Steel",
    categorySlug: "cement-civil-works",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-morang",
    keywords: ["morang", "balu", "baalu", "reti", "river sand", "moram", "maurang"],
    mapsTo: "Sand & Aggregates",
    categorySlug: "bricks-sand-gitti-aac",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-gitti",
    keywords: ["gitti", "bajri", "stone dust", "aggregate", "rodi", "20mm"],
    mapsTo: "Coarse Aggregates / Grit",
    categorySlug: "bricks-sand-gitti-aac",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-seelan",
    keywords: ["seelan", "leakage", "dampness", "waterproof", "waterproofing", "chemical", "tar"],
    mapsTo: "Waterproofing & Chemicals",
    categorySlug: "cement-civil-works",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-putti",
    keywords: ["putti", "putty", "safed cement", "white", "birla wite", "wall putty"],
    mapsTo: "Wall Putty / White Cement",
    categorySlug: "paints-putty-primer",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-bijli",
    keywords: ["taar", "bijli", "wire", "switch", "mcb", "cable", "board"],
    mapsTo: "Wires, MCB & Electricals",
    categorySlug: "wires-mcb-electrical",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-plumbing",
    keywords: ["nal", "toti", "pipe", "tanki", "cpvc", "upvc", "sink"],
    mapsTo: "CPVC Plumbing & Sanitaryware",
    categorySlug: "cpvc-plumbing-tanks",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-bricks",
    keywords: ["eent", "eenta", "int", "brick", "bricks", "block", "masala", "aac"],
    mapsTo: "Bricks / Mortars / Plaster",
    categorySlug: "bricks-sand-gitti-aac",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-ply",
    keywords: ["ply", "plywood", "darwaza", "chaukhat", "fevicol", "chipkana", "hinge", "lock"],
    mapsTo: "Plywood, Doors & Adhesives",
    categorySlug: "plywood-boards",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-paint",
    keywords: ["rang", "paint", "paints", "primer", "distemper", "emulsion"],
    mapsTo: "Paints, Putty & Primer",
    categorySlug: "paints-putty-primer",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-solar",
    keywords: ["solar", "panel", "topcon", "dcr", "upneda", "pm surya ghar", "acdb", "dcdb", "mc4", "earthing"],
    mapsTo: "Solar & Rooftop Power",
    categorySlug: "solar-rooftop-power",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
  {
    id: "syn-lighting",
    keywords: ["light", "led", "panel light", "cob", "batten", "tubelight", "strip", "smps driver", "bulb", "flood"],
    mapsTo: "Lighting & Architectural LED",
    categorySlug: "lighting",
    isActive: true,
    updatedAt: new Date().toISOString(),
  },
];

const BUILTIN_SPELLING_CORRECTIONS: Record<string, string[]> = {
  cemnt: ["cement", "ppc", "opc"],
  siment: ["cement"],
  ultratek: ["ultratech", "cement"],
  ultratetch: ["ultratech"],
  birlawite: ["birla", "white", "putty"],
  wite: ["white", "putty"],
  putti: ["putty", "birla", "jk"],
  fevikol: ["fevicol", "adhesive"],
  kajaria: ["kajaria", "tile", "vitrified"],
  asain: ["asian", "paints"],
};

const HINDI_NUMBER_WORDS: Record<string, number> = {
  one: 1, two: 2, three: 3, four: 4, five: 5, six: 6, seven: 7, eight: 8, nine: 9, ten: 10,
  twenty: 20, thirty: 30, forty: 40, fifty: 50, hundred: 100,
  ek: 1, do: 2, teen: 3, char: 4, paanch: 5, chhe: 6, saat: 7, aath: 8, nau: 9, das: 10,
  bees: 20, tees: 30, chalis: 40, pachas: 50, sau: 100,
};

const KNOWN_UNITS = new Set([
  "bag", "bags", "bora", "bori", "kg", "kilo", "ltr", "litre", "litres", "liter", "liters",
  "ton", "tonne", "tonnes", "mt", "pc", "pcs", "piece", "pieces", "nag", "nos",
  "box", "boxes", "sqft", "sq.ft", "bundle", "bundles", "roll", "rolls", "pkt", "packet",
  "sheet", "sheets", "length", "lengths", "drum", "drums", "bucket", "buckets", "can", "cans",
]);

function normalizeText(s: string): string {
  return String(s || "")
    .toLowerCase()
    .replace(/[._/\\-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(s: string): string[] {
  return normalizeText(s)
    .split(" ")
    .filter((t) => t.length >= 2 || /^\d+$/.test(t));
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  const la = a.length;
  const lb = b.length;
  if (la === 0) return lb;
  if (lb === 0) return la;
  if (Math.abs(la - lb) > 3) return 99;
  const prev = Array.from({ length: lb + 1 }, (_, i) => i);
  for (let i = 1; i <= la; i++) {
    const cur = [i];
    for (let j = 1; j <= lb; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      cur[j] = Math.min(cur[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= lb; j++) prev[j] = cur[j];
  }
  return prev[lb];
}

function buildSearchableText(p: MasterProductRecord): string {
  const specs = [
    ...(p.specTags || []).map((s) => `${s.label} ${s.value}`),
    ...(p.highlights || []).map((s) => `${s.label} ${s.value}`),
    ...(p.keyInfo || []).map((s) => `${s.label} ${s.value}`),
    ...(p.usageTips || []),
    ...(p.variants || []).map((v) => `${v.label} ${v.unit}`),
  ].join(" ");
  return normalizeText(`${p.title} ${p.brand} ${p.categorySlug} ${p.subcategory || ""} ${p.unit} ${p.description} ${specs}`);
}

interface ParsedIntent {
  cleanQuery: string;
  inferredMaxPrice?: number;
  inferredMinPrice?: number;
  boostTokens: string[];
}

function parseQueryIntent(rawQuery: string): ParsedIntent {
  let clean = rawQuery.trim();
  let inferredMaxPrice: number | undefined;
  let inferredMinPrice: number | undefined;
  const boostTokens: string[] = [];

  const underMatch = clean.match(/\b(?:under|below|less\s+than|max|upto|se\s+kam)\s*₹?\s*(\d{2,7})\b/i);
  if (underMatch) {
    inferredMaxPrice = Number(underMatch[1]);
    clean = clean.replace(underMatch[0], " ").trim();
  }

  const aboveMatch = clean.match(/\b(?:above|over|more\s+than|min|se\s+zyada)\s*₹?\s*(\d{2,7})\b/i);
  if (aboveMatch) {
    inferredMinPrice = Number(aboveMatch[1]);
    clean = clean.replace(aboveMatch[0], " ").trim();
  }

  const weightMatch = clean.match(/\b(\d+\s*(?:kg|ltr|l|mm|inch|ft))\b/i);
  if (weightMatch) {
    boostTokens.push(normalizeText(weightMatch[1]));
  }

  const isCodeMatch = clean.match(/\b(is\s*\d{3,5})\b/i);
  if (isCodeMatch) {
    boostTokens.push(normalizeText(isCodeMatch[1]));
  }

  return {
    cleanQuery: clean.replace(/\s+/g, " ").trim(),
    inferredMaxPrice,
    inferredMinPrice,
    boostTokens,
  };
}

class SearchEngineService {
  private store: PersistedSearchStore | null = null;
  private pgTablesReady = false;

  private loadFromDisk(): PersistedSearchStore {
    try {
      if (fs.existsSync(SEARCH_STORE_PATH)) {
        const raw = JSON.parse(fs.readFileSync(SEARCH_STORE_PATH, "utf8"));
        return {
          config: { ...DEFAULT_CONFIG, ...(raw?.config || {}) },
          synonyms: Array.isArray(raw?.synonyms) && raw.synonyms.length > 0 ? raw.synonyms : DEFAULT_SYNONYMS,
          logs: Array.isArray(raw?.logs) ? raw.logs.slice(0, 500) : [],
          requests: Array.isArray(raw?.requests) ? raw.requests : [],
        };
      }
    } catch (err) {
      logger.warn({ err }, "[SearchEngine] Failed reading search disk store; using defaults");
    }
    const fresh: PersistedSearchStore = {
      config: { ...DEFAULT_CONFIG },
      synonyms: [...DEFAULT_SYNONYMS],
      logs: [],
      requests: [],
    };
    this.saveToDisk(fresh);
    return fresh;
  }

  private saveToDisk(data: PersistedSearchStore) {
    try {
      fs.mkdirSync(path.dirname(SEARCH_STORE_PATH), { recursive: true });
      fs.writeFileSync(SEARCH_STORE_PATH, JSON.stringify(data, null, 2), "utf8");
    } catch (err) {
      logger.warn({ err }, "[SearchEngine] Failed persisting search disk store");
    }
  }

  private async ensurePgTables(): Promise<void> {
    if (this.pgTablesReady) return;
    try {
      await query(`
        CREATE TABLE IF NOT EXISTS search_config (
          id VARCHAR(32) PRIMARY KEY DEFAULT 'default',
          config_json JSONB NOT NULL DEFAULT '{}'::jsonb,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS search_synonyms (
          id VARCHAR(64) PRIMARY KEY,
          keywords_json JSONB NOT NULL DEFAULT '[]'::jsonb,
          maps_to VARCHAR(160) NOT NULL,
          category_slug VARCHAR(120) DEFAULT '',
          is_active BOOLEAN NOT NULL DEFAULT TRUE,
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS search_logs (
          id VARCHAR(64) PRIMARY KEY,
          query TEXT NOT NULL,
          normalized_query TEXT NOT NULL,
          result_count INTEGER NOT NULL DEFAULT 0,
          matched_synonym VARCHAR(160),
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
        CREATE TABLE IF NOT EXISTS search_requests (
          id VARCHAR(64) PRIMARY KEY,
          item_name VARCHAR(200) NOT NULL,
          quantity_text VARCHAR(80) NOT NULL DEFAULT '1',
          phone VARCHAR(30) NOT NULL DEFAULT '',
          pincode VARCHAR(12) NOT NULL DEFAULT '',
          status VARCHAR(32) NOT NULL DEFAULT 'NEW',
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
          updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        );
      `);
      this.pgTablesReady = true;
    } catch {
      // Postgres optional in offline dev
    }
  }

  private async ensureLoaded(): Promise<PersistedSearchStore> {
    if (this.store) return this.store;
    const local = this.loadFromDisk();
    this.store = local;
    try {
      await this.ensurePgTables();
      const cfgRes = await query(`SELECT config_json FROM search_config WHERE id = 'default' LIMIT 1`);
      if (cfgRes.rows?.[0]?.config_json && Object.keys(cfgRes.rows[0].config_json).length > 0) {
        this.store.config = { ...DEFAULT_CONFIG, ...cfgRes.rows[0].config_json };
      } else {
        await query(
          `INSERT INTO search_config (id, config_json) VALUES ('default', $1::jsonb) ON CONFLICT (id) DO NOTHING`,
          [JSON.stringify(this.store.config)]
        );
      }

      const synRes = await query(`SELECT id, keywords_json, maps_to, category_slug, is_active, updated_at FROM search_synonyms`);
      if (synRes.rows?.length > 0) {
        this.store.synonyms = synRes.rows.map((r: any) => ({
          id: r.id,
          keywords: Array.isArray(r.keywords_json) ? r.keywords_json : [],
          mapsTo: r.maps_to,
          categorySlug: r.category_slug || "",
          isActive: Boolean(r.is_active),
          updatedAt: r.updated_at ? new Date(r.updated_at).toISOString() : new Date().toISOString(),
        }));
      } else {
        for (const s of this.store.synonyms) {
          await query(
            `INSERT INTO search_synonyms (id, keywords_json, maps_to, category_slug, is_active) VALUES ($1, $2::jsonb, $3, $4, $5) ON CONFLICT (id) DO NOTHING`,
            [s.id, JSON.stringify(s.keywords), s.mapsTo, s.categorySlug || "", s.isActive]
          );
        }
      }

      const reqRes = await query(`SELECT id, item_name, quantity_text, phone, pincode, status, created_at, updated_at FROM search_requests ORDER BY created_at DESC LIMIT 100`);
      if (reqRes.rows?.length > 0) {
        this.store.requests = reqRes.rows.map((r: any) => ({
          id: r.id,
          itemName: r.item_name,
          quantityText: r.quantity_text,
          phone: r.phone,
          pincode: r.pincode || "",
          status: r.status || "NEW",
          createdAt: new Date(r.created_at).toISOString(),
          updatedAt: new Date(r.updated_at).toISOString(),
        }));
      }
      this.saveToDisk(this.store);
    } catch {
      // keep disk store
    }
    return this.store;
  }

  public async getConfig(): Promise<{ config: SearchStudioConfig; synonyms: SearchSynonymRule[] }> {
    const s = await this.ensureLoaded();
    return {
      config: s.config,
      synonyms: s.synonyms.filter((r) => r.isActive),
    };
  }

  public async updateConfig(patch: Partial<SearchStudioConfig>): Promise<SearchStudioConfig> {
    const s = await this.ensureLoaded();
    s.config = {
      ...s.config,
      ...patch,
      placeholders: Array.isArray(patch.placeholders)
        ? patch.placeholders.map((x) => String(x).trim()).filter(Boolean)
        : s.config.placeholders,
      trendingSearches: Array.isArray(patch.trendingSearches)
        ? patch.trendingSearches.map((x) => String(x).trim()).filter(Boolean)
        : s.config.trendingSearches,
      stageShortcuts: Array.isArray(patch.stageShortcuts) ? patch.stageShortcuts : s.config.stageShortcuts,
      updatedAt: new Date().toISOString(),
    };
    this.saveToDisk(s);
    try {
      await this.ensurePgTables();
      await query(
        `INSERT INTO search_config (id, config_json, updated_at) VALUES ('default', $1::jsonb, NOW())
         ON CONFLICT (id) DO UPDATE SET config_json = EXCLUDED.config_json, updated_at = NOW()`,
        [JSON.stringify(s.config)]
      );
    } catch {}
    return s.config;
  }

  public async upsertSynonym(input: {
    id?: string;
    keywords: string[];
    mapsTo: string;
    categorySlug?: string;
    isActive?: boolean;
  }): Promise<SearchSynonymRule> {
    const s = await this.ensureLoaded();
    const id = input.id?.trim() || `syn-${crypto.randomBytes(4).toString("hex")}`;
    const rule: SearchSynonymRule = {
      id,
      keywords: Array.from(new Set(input.keywords.map((k) => k.trim().toLowerCase()).filter(Boolean))),
      mapsTo: input.mapsTo.trim(),
      categorySlug: (input.categorySlug || "").trim(),
      isActive: input.isActive !== undefined ? Boolean(input.isActive) : true,
      updatedAt: new Date().toISOString(),
    };
    const idx = s.synonyms.findIndex((r) => r.id === id);
    if (idx >= 0) s.synonyms[idx] = rule;
    else s.synonyms.unshift(rule);
    this.saveToDisk(s);
    try {
      await this.ensurePgTables();
      await query(
        `INSERT INTO search_synonyms (id, keywords_json, maps_to, category_slug, is_active, updated_at)
         VALUES ($1, $2::jsonb, $3, $4, $5, NOW())
         ON CONFLICT (id) DO UPDATE SET keywords_json = EXCLUDED.keywords_json, maps_to = EXCLUDED.maps_to, category_slug = EXCLUDED.category_slug, is_active = EXCLUDED.is_active, updated_at = NOW()`,
        [rule.id, JSON.stringify(rule.keywords), rule.mapsTo, rule.categorySlug || "", rule.isActive]
      );
    } catch {}
    return rule;
  }

  public async deleteSynonym(id: string): Promise<boolean> {
    const s = await this.ensureLoaded();
    const before = s.synonyms.length;
    s.synonyms = s.synonyms.filter((r) => r.id !== id);
    this.saveToDisk(s);
    try {
      await this.ensurePgTables();
      await query(`DELETE FROM search_synonyms WHERE id = $1`, [id]);
    } catch {}
    return s.synonyms.length < before;
  }

  private matchSynonymRule(tokens: string[], normalizedQ: string, rules: SearchSynonymRule[]): SearchSynonymRule | null {
    for (const rule of rules) {
      if (!rule.isActive) continue;
      for (const kw of rule.keywords) {
        const cleanKw = normalizeText(kw);
        if (!cleanKw) continue;
        if (normalizedQ === cleanKw || normalizedQ.includes(cleanKw) || tokens.some((t) => t === cleanKw || levenshtein(t, cleanKw) <= 1)) {
          return rule;
        }
      }
    }
    return null;
  }

  private expandTokens(tokens: string[], matchedRule: SearchSynonymRule | null): string[] {
    const expanded = new Set<string>(tokens);
    for (const t of tokens) {
      if (BUILTIN_SPELLING_CORRECTIONS[t]) {
        BUILTIN_SPELLING_CORRECTIONS[t].forEach((alt) => expanded.add(alt));
      }
    }
    if (matchedRule) {
      tokenize(matchedRule.mapsTo).forEach((w) => expanded.add(w));
      if (matchedRule.categorySlug) {
        tokenize(matchedRule.categorySlug).forEach((w) => expanded.add(w));
      }
    }
    return Array.from(expanded);
  }

  private scoreProduct(
    p: MasterProductRecord,
    rawClean: string,
    tokens: string[],
    expandedTokens: string[],
    matchedRule: SearchSynonymRule | null,
    boostTokens: string[]
  ): number {
    const titleNorm = normalizeText(p.title);
    const brandNorm = normalizeText(p.brand);
    const catNorm = normalizeText(p.categorySlug);
    const searchable = buildSearchableText(p);
    const searchWords = tokenize(searchable);

    let score = 0;

    if (rawClean && titleNorm === rawClean) score += 160;
    else if (rawClean && titleNorm.startsWith(rawClean)) score += 125;
    else if (rawClean && titleNorm.includes(rawClean)) score += 105;

    if (rawClean && (brandNorm === rawClean || catNorm === rawClean)) score += 90;
    else if (rawClean && (brandNorm.includes(rawClean) || catNorm.includes(rawClean))) score += 75;

    // Direct token matches in title vs specs/description
    let directTokenHits = 0;
    for (const tok of tokens) {
      if (titleNorm.includes(tok)) {
        score += 40;
        directTokenHits++;
      } else if (brandNorm.includes(tok) || catNorm.includes(tok)) {
        score += 32;
        directTokenHits++;
      } else if (searchable.includes(tok)) {
        score += 24;
        directTokenHits++;
      } else {
        // Check typo correction tokens
        const corrections = BUILTIN_SPELLING_CORRECTIONS[tok] || [];
        if (corrections.some((c) => searchable.includes(c))) {
          score += 36;
          directTokenHits++;
        } else if (tok.length >= 4 && searchWords.some((w) => levenshtein(tok, w) <= (tok.length >= 6 ? 2 : 1))) {
          // Fuzzy edit-distance match
          score += 18;
          directTokenHits++;
        }
      }
    }

    // Synonym expansion boost
    if (matchedRule) {
      if (matchedRule.categorySlug && p.categorySlug === matchedRule.categorySlug) {
        score += 55;
      }
      for (const expTok of expandedTokens) {
        if (!tokens.includes(expTok) && searchable.includes(expTok)) {
          score += 20;
        }
      }
    }

    // Technical spec / weight / IS-code boost (e.g. "50 kg", "is 1489")
    for (const bt of boostTokens) {
      if (searchable.includes(bt)) score += 35;
    }

    // Require multi-token queries without synonym rescue to match at least one meaningful signal
    if (tokens.length > 0 && directTokenHits === 0 && !matchedRule) {
      return 0;
    }
    if (p.isFeatured && score > 0) score += 4;
    if (p.isInStock && score > 0) score += 3;

    return score;
  }

  private async logSearchAsync(rawQuery: string, resultCount: number, matchedSynonym?: string) {
    const trimmed = rawQuery.trim();
    if (trimmed.length < 2) return;
    const normalized = normalizeText(trimmed);
    const entry: SearchLogRecord = {
      id: `slog-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`,
      query: trimmed,
      normalizedQuery: normalized,
      resultCount,
      matchedSynonym,
      createdAt: new Date().toISOString(),
    };
    const s = await this.ensureLoaded();
    s.logs = [entry, ...s.logs].slice(0, 500);
    this.saveToDisk(s);
    query(
      `INSERT INTO search_logs (id, query, normalized_query, result_count, matched_synonym) VALUES ($1, $2, $3, $4, $5)`,
      [entry.id, entry.query, entry.normalizedQuery, entry.resultCount, entry.matchedSynonym || null]
    ).catch(() => {});
  }

  public async search(params: {
    q?: string;
    category?: string;
    brand?: string;
    sort?: string;
    inStock?: boolean;
    bulkOnly?: boolean;
    stage?: string;
    minPrice?: number;
    maxPrice?: number;
    limit?: number;
    skipLog?: boolean;
  }) {
    const store = await this.ensureLoaded();
    const allProducts = await productStore.list({ includeArchived: false });
    const allCategories = await categoryStore.list({ activeOnly: true });

    const rawQ = String(params.q || "").trim();
    const intent = parseQueryIntent(rawQ);
    const effectiveMaxPrice = params.maxPrice ?? intent.inferredMaxPrice;
    const effectiveMinPrice = params.minPrice ?? intent.inferredMinPrice;

    const cleanNorm = normalizeText(intent.cleanQuery);
    const tokens = tokenize(cleanNorm);
    const matchedRule = tokens.length > 0 ? this.matchSynonymRule(tokens, cleanNorm, store.synonyms) : null;
    const expandedTokens = this.expandTokens(tokens, matchedRule);

    // Stage shortcut filter
    const activeStage = params.stage
      ? store.config.stageShortcuts.find((st) => st.id === params.stage || normalizeText(st.label) === normalizeText(params.stage!))
      : undefined;

    let scored = allProducts
      .map((p) => {
        const score =
          tokens.length === 0 && !activeStage
            ? p.isFeatured
              ? 20
              : 10
            : tokens.length === 0 && activeStage
              ? activeStage.categorySlugs.includes(p.categorySlug) ||
                activeStage.keywords.some((kw) => buildSearchableText(p).includes(normalizeText(kw)))
                ? 50
                : 0
              : this.scoreProduct(p, cleanNorm, tokens, expandedTokens, matchedRule, intent.boostTokens);
        return { product: p, score };
      })
      .filter((x) => x.score > 0);

    // Stage + Query combination
    if (activeStage && tokens.length > 0) {
      scored = scored.filter(
        ({ product: p }) =>
          activeStage.categorySlugs.includes(p.categorySlug) ||
          activeStage.keywords.some((kw) => buildSearchableText(p).includes(normalizeText(kw)))
      );
    }

    // Collect facets from pre-filter query matches
    const brandMap = new Map<string, number>();
    const catSlugMap = new Map<string, number>();
    for (const { product: p } of scored) {
      if (p.brand) brandMap.set(p.brand, (brandMap.get(p.brand) || 0) + 1);
      if (p.categorySlug) catSlugMap.set(p.categorySlug, (catSlugMap.get(p.categorySlug) || 0) + 1);
    }

    // Apply explicit UI filters
    if (params.category) {
      const catTarget = normalizeText(params.category);
      scored = scored.filter(({ product: p }) => normalizeText(p.categorySlug) === catTarget || normalizeText(p.categorySlug).includes(catTarget));
    }
    if (params.brand) {
      const brandTarget = normalizeText(params.brand);
      scored = scored.filter(({ product: p }) => normalizeText(p.brand) === brandTarget);
    }
    if (params.inStock) {
      scored = scored.filter(({ product: p }) => p.isInStock && p.stockQty > 0);
    }
    if (params.bulkOnly) {
      scored = scored.filter(({ product: p }) => p.bulkPrice > 0 && p.bulkPrice < p.sellingPrice);
    }
    if (typeof effectiveMinPrice === "number" && !Number.isNaN(effectiveMinPrice)) {
      scored = scored.filter(({ product: p }) => p.sellingPrice >= effectiveMinPrice);
    }
    if (typeof effectiveMaxPrice === "number" && !Number.isNaN(effectiveMaxPrice)) {
      scored = scored.filter(({ product: p }) => p.sellingPrice <= effectiveMaxPrice);
    }

    // Sort
    const sortMode = params.sort || "relevance";
    scored.sort((a, b) => {
      if (sortMode === "price_asc") return a.product.sellingPrice - b.product.sellingPrice;
      if (sortMode === "price_desc") return b.product.sellingPrice - a.product.sellingPrice;
      if (sortMode === "discount_desc") {
        const da = a.product.mrp > 0 ? (a.product.mrp - a.product.sellingPrice) / a.product.mrp : 0;
        const db = b.product.mrp > 0 ? (b.product.mrp - b.product.sellingPrice) / b.product.mrp : 0;
        return db - da;
      }
      return b.score - a.score;
    });

    const limit = params.limit && params.limit > 0 ? params.limit : 60;
    const items = scored.slice(0, limit).map(({ product }) => product);

    // Did-You-Mean suggestions if 0 results
    let didYouMean: string[] = [];
    if (items.length === 0 && rawQ.length >= 2) {
      const candidatePhrases = Array.from(
        new Set([
          ...store.config.trendingSearches,
          ...allCategories.map((c) => c.title),
          ...allProducts.map((p) => p.brand).filter(Boolean),
          ...allProducts.slice(0, 40).map((p) => p.title.split(" ").slice(0, 3).join(" ")),
        ])
      );
      didYouMean = candidatePhrases
        .map((cand) => {
          const candWords = tokenize(cand);
          let bestDist = 99;
          for (const t of tokens) {
            for (const cw of candWords) {
              bestDist = Math.min(bestDist, levenshtein(t, cw));
            }
          }
          return { cand, bestDist };
        })
        .filter((x) => x.bestDist <= 3)
        .sort((a, b) => a.bestDist - b.bestDist)
        .slice(0, 4)
        .map((x) => x.cand);
      if (didYouMean.length === 0) {
        didYouMean = store.config.trendingSearches.slice(0, 4);
      }
    }

    if (rawQ && !params.skipLog) {
      void this.logSearchAsync(rawQ, items.length, matchedRule?.mapsTo);
    }

    const availableCategories = Array.from(catSlugMap.entries()).map(([slug, count]) => {
      const cat = allCategories.find((c) => c.slug === slug);
      return {
        slug,
        title: cat?.title || slug,
        imageUrl: cat?.imageUrl || "",
        count,
      };
    });

    const availableBrands = Array.from(brandMap.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);

    return {
      query: rawQ,
      cleanQuery: intent.cleanQuery,
      total: scored.length,
      items,
      matchedSynonymHint: matchedRule
        ? { keyword: rawQ, mapsTo: matchedRule.mapsTo, categorySlug: matchedRule.categorySlug }
        : null,
      inferredFilters: {
        minPrice: effectiveMinPrice ?? null,
        maxPrice: effectiveMaxPrice ?? null,
      },
      didYouMean,
      facets: {
        categories: availableCategories,
        brands: availableBrands,
      },
    };
  }

  public async suggest(rawQ: string) {
    const q = normalizeText(rawQ);
    if (!q) {
      const cfg = await this.getConfig();
      return {
        categories: [],
        brands: [],
        products: [],
        trending: cfg.config.trendingSearches,
      };
    }

    const store = await this.ensureLoaded();
    const allCategories = await categoryStore.list({ activeOnly: true });
    const searchRes = await this.search({ q: rawQ, limit: 6, skipLog: true });

    const matchedRule = this.matchSynonymRule(tokenize(q), q, store.synonyms);

    const matchedCats = allCategories
      .filter((c) => {
        const t = normalizeText(`${c.title} ${c.slug} ${c.titleHi || ""}`);
        return t.includes(q) || (matchedRule?.categorySlug && c.slug === matchedRule.categorySlug);
      })
      .slice(0, 4)
      .map((c) => ({
        slug: c.slug,
        title: c.title,
        imageUrl: c.imageUrl,
        productCount: c.productCount || 0,
      }));

    return {
      query: rawQ,
      matchedSynonymHint: searchRes.matchedSynonymHint,
      categories: matchedCats,
      brands: searchRes.facets.brands.slice(0, 4),
      products: searchRes.items,
    };
  }

  public async parseParchiList(text: string) {
    const lines = String(text || "")
      .split(/\r?\n|;|•/)
      .map((l) => l.replace(/^[-*•\d.)\s]+/, (m) => (/^\d+\s+[a-zA-Z]/.test(l.trim()) ? m : "")).trim())
      .filter((l) => l.length >= 2);

    const parsedLines = [];
    for (let i = 0; i < lines.length; i++) {
      const rawLine = lines[i].trim();
      let working = rawLine;
      let qty = 1;
      let unit = "";

      // Extract leading or trailing number (e.g. "20 bag UltraTech", "Dr Fixit - 2 ltr")
      const leadNum = working.match(/^(\d{1,4})\s+(.*)$/);
      if (leadNum) {
        qty = Math.max(1, Math.min(2000, parseInt(leadNum[1], 10)));
        working = leadNum[2].trim();
      } else {
        const trailNum = working.match(/^(.*?)\s*[-x×:]?\s*(\d{1,4})\s*([a-zA-Z.]*)$/);
        if (trailNum && trailNum[1].trim().length >= 2) {
          qty = Math.max(1, Math.min(2000, parseInt(trailNum[2], 10)));
          if (trailNum[3] && KNOWN_UNITS.has(trailNum[3].toLowerCase())) {
            unit = trailNum[3];
          }
          working = trailNum[1].trim();
        } else {
          // Check Hindi/English word numbers at start ("paanch bag cement")
          const firstWord = working.split(/\s+/)[0]?.toLowerCase();
          if (firstWord && HINDI_NUMBER_WORDS[firstWord]) {
            qty = HINDI_NUMBER_WORDS[firstWord];
            working = working.slice(firstWord.length).trim();
          }
        }
      }

      // Extract unit right after qty ("bag", "ltr", "kg", "pcs", etc.)
      const firstToken = working.split(/\s+/)[0]?.toLowerCase().replace(/\.$/, "");
      if (firstToken && KNOWN_UNITS.has(firstToken)) {
        unit = working.split(/\s+/)[0];
        working = working.slice(unit.length).trim();
      }
      working = working.replace(/^(of|ka|ki|ke)\s+/i, "").trim();

      const matchRes = await this.search({ q: working || rawLine, limit: 5, skipLog: true });
      const best = matchRes.items[0] || null;

      let effectiveUnitPrice = best ? best.sellingPrice : 0;
      let bulkApplied = false;
      if (best && best.bulkPrice > 0 && best.bulkMinQty > 0 && qty >= best.bulkMinQty) {
        effectiveUnitPrice = best.bulkPrice;
        bulkApplied = true;
      }
      const mrpTotal = best ? (best.mrp || best.sellingPrice) * qty : 0;
      const lineTotal = effectiveUnitPrice * qty;

      parsedLines.push({
        lineId: `parchi-${i + 1}`,
        rawLine,
        detectedQty: qty,
        detectedUnit: unit || best?.unit || "unit",
        query: working || rawLine,
        matchedProduct: best,
        alternatives: matchRes.items.slice(1, 5),
        effectiveUnitPrice,
        bulkApplied,
        lineTotal,
        savings: Math.max(0, mrpTotal - lineTotal),
      });
    }

    const grandTotal = parsedLines.reduce((acc, l) => acc + l.lineTotal, 0);
    const totalSavings = parsedLines.reduce((acc, l) => acc + l.savings, 0);

    return {
      lines: parsedLines,
      matchedCount: parsedLines.filter((l) => l.matchedProduct !== null).length,
      totalLines: parsedLines.length,
      grandTotal,
      totalSavings,
    };
  }

  public async createSourcingRequest(input: {
    itemName: string;
    quantityText?: string;
    phone?: string;
    pincode?: string;
  }): Promise<SearchSourcingRequest> {
    const s = await this.ensureLoaded();
    const now = new Date().toISOString();
    const reqItem: SearchSourcingRequest = {
      id: `sreq-${Date.now()}-${crypto.randomBytes(2).toString("hex")}`,
      itemName: String(input.itemName || "").trim().slice(0, 180),
      quantityText: String(input.quantityText || "1").trim().slice(0, 60),
      phone: String(input.phone || "").trim().slice(0, 24),
      pincode: String(input.pincode || "").trim().slice(0, 10),
      status: "NEW",
      createdAt: now,
      updatedAt: now,
    };
    if (!reqItem.itemName) throw new Error("Item name is required");
    s.requests.unshift(reqItem);
    this.saveToDisk(s);
    try {
      await this.ensurePgTables();
      await query(
        `INSERT INTO search_requests (id, item_name, quantity_text, phone, pincode, status) VALUES ($1, $2, $3, $4, $5, $6)`,
        [reqItem.id, reqItem.itemName, reqItem.quantityText, reqItem.phone, reqItem.pincode || "", reqItem.status]
      );
    } catch {}
    return reqItem;
  }

  public async updateSourcingRequestStatus(
    id: string,
    status: "NEW" | "CONTACTED" | "ADDED_TO_CATALOG"
  ): Promise<SearchSourcingRequest | null> {
    const s = await this.ensureLoaded();
    const found = s.requests.find((r) => r.id === id);
    if (!found) return null;
    found.status = status;
    found.updatedAt = new Date().toISOString();
    this.saveToDisk(s);
    try {
      await this.ensurePgTables();
      await query(`UPDATE search_requests SET status = $2, updated_at = NOW() WHERE id = $1`, [id, status]);
    } catch {}
    return found;
  }

  public async getAdminStudioData(days = 30) {
    const s = await this.ensureLoaded();
    const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
    let logs = s.logs.filter((l) => Date.parse(l.createdAt) >= cutoff);

    // Pull latest Postgres logs if available
    try {
      await this.ensurePgTables();
      const res = await query(
        `SELECT id, query, normalized_query, result_count, matched_synonym, created_at
         FROM search_logs WHERE created_at >= NOW() - ($1 || ' days')::INTERVAL
         ORDER BY created_at DESC LIMIT 500`,
        [String(days)]
      );
      if (res.rows?.length > 0) {
        logs = res.rows.map((r: any) => ({
          id: r.id,
          query: r.query,
          normalizedQuery: r.normalized_query,
          resultCount: Number(r.result_count) || 0,
          matchedSynonym: r.matched_synonym || undefined,
          createdAt: new Date(r.created_at).toISOString(),
        }));
      }
    } catch {}

    const topMap = new Map<string, { query: string; count: number; lastSearchedAt: string; avgResults: number }>();
    const zeroMap = new Map<string, { query: string; count: number; lastSearchedAt: string }>();

    for (const l of logs) {
      const k = l.normalizedQuery || normalizeText(l.query);
      if (!k) continue;
      const cur = topMap.get(k);
      if (!cur) {
        topMap.set(k, { query: l.query, count: 1, lastSearchedAt: l.createdAt, avgResults: l.resultCount });
      } else {
        cur.avgResults = Math.round(((cur.avgResults * cur.count + l.resultCount) / (cur.count + 1)) * 10) / 10;
        cur.count += 1;
      }

      if (l.resultCount === 0) {
        const z = zeroMap.get(k);
        if (!z) zeroMap.set(k, { query: l.query, count: 1, lastSearchedAt: l.createdAt });
        else z.count += 1;
      }
    }

    return {
      config: s.config,
      synonyms: s.synonyms,
      analytics: {
        days,
        totalSearches: logs.length,
        topSearches: Array.from(topMap.values()).sort((a, b) => b.count - a.count).slice(0, 20),
        zeroResultQueries: Array.from(zeroMap.values()).sort((a, b) => b.count - a.count).slice(0, 20),
      },
      requests: s.requests,
    };
  }
}

export const searchEngine = new SearchEngineService();
