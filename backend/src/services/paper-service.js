const https = require("https");
const config = require("../config");
const localPapers = require("../data/papers.json");
const { START_MARKER, END_MARKER, runPythonJson } = require("./python-bridge");

const QUERY_ALIASES = [
  { pattern: /人工智能|ai/i, terms: ["artificial intelligence", "ai", "intelligent systems"] },
  { pattern: /机器学习/i, terms: ["machine learning", "ml"] },
  { pattern: /深度学习/i, terms: ["deep learning", "neural networks"] },
  { pattern: /自然语言处理|nlp/i, terms: ["natural language processing", "nlp", "language models"] },
  { pattern: /计算机视觉/i, terms: ["computer vision", "vision models"] },
  { pattern: /区块链/i, terms: ["blockchain", "distributed ledger"] },
  { pattern: /基因编辑/i, terms: ["gene editing", "crispr"] },
  { pattern: /量子计算/i, terms: ["quantum computing"] },
  { pattern: /量子纠错|quantum error correction/i, terms: ["quantum error correction"] },
  { pattern: /蛋白质结构/i, terms: ["protein structure", "protein folding"] },
  { pattern: /气候变化/i, terms: ["climate change"] },
  { pattern: /检索增强生成|rag/i, terms: ["retrieval augmented generation", "rag"] },
];

function containsCjk(value) {
  return /[\u3400-\u9fff]/.test(String(value || ""));
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[“”"'`]/g, " ")
    .replace(/[^a-z0-9\u3400-\u9fff\s-]/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tokenize(value) {
  const normalized = normalize(value);
  if (!normalized) return [];

  if (containsCjk(normalized)) {
    return [normalized];
  }

  return normalized.split(" ").filter((item) => item.length > 1);
}

function expandQuery(query) {
  const normalized = normalize(query);
  const expanded = new Set([normalized]);

  for (const alias of QUERY_ALIASES) {
    if (alias.pattern.test(query) || alias.pattern.test(normalized)) {
      for (const term of alias.terms) {
        expanded.add(term);
      }
    }
  }

  return [...expanded].filter(Boolean);
}

function toYear(value) {
  if (!value) return 0;
  const date = new Date(value);
  return Number.isFinite(date.getFullYear()) ? date.getFullYear() : 0;
}

function normalizeAuthors(authors) {
  if (Array.isArray(authors)) return authors.filter(Boolean).slice(0, 8);
  if (typeof authors === "string" && authors.trim()) return [authors.trim()];
  return [];
}

function mapPaperType(rawType = "") {
  const value = String(rawType || "").toLowerCase();
  if (value.includes("proceedings") || value.includes("conference")) return "conference";
  if (value.includes("book")) return "book";
  if (value.includes("journal")) return "journal";
  return "article";
}

function buildScholarSearchUrl(title = "") {
  return `https://scholar.google.com/scholar?q=${encodeURIComponent(String(title || "").trim())}`;
}

function normalizeDetailUrl(rawUrl, title, source) {
  const value = String(rawUrl || "").trim();
  if (!value) {
    return buildScholarSearchUrl(title);
  }

  if (/^https?:\/\//i.test(value)) {
    return value;
  }

  if (/^10\./.test(value)) {
    return `https://doi.org/${value}`;
  }

  if (/arxiv/i.test(source || "") || /^\d{4}\.\d{4,5}(v\d+)?$/i.test(value)) {
    const arxivId = value
      .replace(/^arxiv:/i, "")
      .replace(/^https?:\/\/arxiv\.org\/(abs|pdf)\//i, "")
      .replace(/\.pdf$/i, "");
    return `https://arxiv.org/abs/${arxivId}`;
  }

  return buildScholarSearchUrl(title);
}

function scoreOverlap(text, queryVariants) {
  const haystack = normalize(text);
  let hits = 0;
  let total = 0;

  for (const variant of queryVariants) {
    const tokens = tokenize(variant);
    for (const token of tokens) {
      total += 1;
      if (haystack.includes(token)) {
        hits += 1;
      }
    }
  }

  return total === 0 ? 0 : hits / total;
}

function qualityPenalty(text) {
  const raw = String(text || "");
  let penalty = 0;
  if ((raw.match(/\\[a-z]+/gi) || []).length >= 2) penalty += 0.3;
  if ((raw.match(/\$[^$]+\$/g) || []).length >= 1) penalty += 0.3;
  return penalty;
}

function computeRelevanceScore(paper, queryVariants) {
  const titleScore = scoreOverlap(paper.title, queryVariants) * 0.55;
  const abstractScore = scoreOverlap(paper.abstract, queryVariants) * 0.3;
  const sourceScore = scoreOverlap(paper.source, queryVariants) * 0.05;
  const authorScore = scoreOverlap((paper.authors || []).join(" "), queryVariants) * 0.05;
  const citationBoost = Math.min(0.1, Math.log10((paper.citationCount || 0) + 1) / 20);
  const penalty = qualityPenalty(`${paper.title} ${paper.abstract}`);
  const raw = Math.max(0, titleScore + abstractScore + sourceScore + authorScore + citationBoost - penalty);
  return Math.round(Math.max(1, Math.min(100, raw * 100)));
}

function normalizeLocalPaper(paper) {
  return {
    id: paper.id,
    title: paper.title,
    authors: normalizeAuthors(paper.authors),
    publicationYear: Number(paper.publicationYear || 0),
    source: paper.source || "Local Corpus",
    abstract: paper.abstract || "",
    relevanceScore: Number(paper.relevanceScore || 50),
    type: mapPaperType(paper.type || ""),
    detailUrl: normalizeDetailUrl(paper.detailUrl, paper.title, paper.source),
    citationCount: Number(paper.citationCount || 0),
  };
}

function normalizeOpenAlexWork(work, queryVariants) {
  const authors = Array.isArray(work.authorships)
    ? work.authorships.map((item) => item?.author?.display_name).filter(Boolean).slice(0, 8)
    : [];

  const source =
    work?.primary_location?.source?.display_name ||
    work?.host_venue?.display_name ||
    "OpenAlex";

  const abstract = reconstructAbstract(work.abstract_inverted_index) || "Abstract not provided by source.";
  const paper = {
    id: String(work.id || `oa:${work.doi || work.display_name || Math.random()}`),
    title: work.display_name || "Untitled",
    authors,
    publicationYear: Number(work.publication_year || 0),
    source,
    abstract,
    type: mapPaperType(work.type || work.type_crossref || ""),
    detailUrl: normalizeDetailUrl(
      work?.primary_location?.landing_page_url || work?.primary_location?.pdf_url || work.doi || work.id,
      work.display_name,
      source,
    ),
    citationCount: Number(work.cited_by_count || 0),
  };

  return {
    ...paper,
    relevanceScore: computeRelevanceScore(paper, queryVariants),
  };
}

function reconstructAbstract(invertedIndex) {
  if (!invertedIndex || typeof invertedIndex !== "object") return "";
  const words = [];
  for (const [word, positions] of Object.entries(invertedIndex)) {
    if (!Array.isArray(positions)) continue;
    for (const position of positions) {
      words.push([position, word]);
    }
  }
  words.sort((a, b) => a[0] - b[0]);
  return words.map((item) => item[1]).join(" ");
}

function dedupeByTitle(items) {
  const seen = new Set();
  const result = [];
  for (const item of items) {
    const key = normalize(item.title);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(item);
  }
  return result;
}

function matchesFilters(paper, params) {
  if (params.type && paper.type !== params.type) return false;
  if (params.years.length > 0 && !params.years.includes(paper.publicationYear)) return false;
  if (params.author) {
    const value = normalize(params.author);
    if (!paper.authors.some((item) => normalize(item).includes(value))) return false;
  }
  if (params.source) {
    const value = normalize(params.source);
    if (!normalize(paper.source).includes(value)) return false;
  }
  return true;
}

function isRelevantEnough(paper, queryVariants) {
  const overlap = scoreOverlap(`${paper.title} ${paper.abstract} ${paper.source}`, queryVariants);
  if (overlap > 0.18) return true;
  if (containsCjk(queryVariants.join(" ")) && overlap > 0.08) return true;
  return false;
}

function buildComparator(sortBy) {
  if (sortBy === "publicationYear") {
    return (a, b) => b.publicationYear - a.publicationYear || b.relevanceScore - a.relevanceScore;
  }
  if (sortBy === "citationCount") {
    return (a, b) => b.citationCount - a.citationCount || b.relevanceScore - a.relevanceScore;
  }
  return (a, b) => b.relevanceScore - a.relevanceScore || b.citationCount - a.citationCount || b.publicationYear - a.publicationYear;
}

function aggregateFacets(items) {
  const countBy = (values) => {
    const map = new Map();
    for (const value of values) {
      if (!value && value !== 0) continue;
      map.set(value, (map.get(value) || 0) + 1);
    }
    return [...map.entries()].map(([value, count]) => ({ value, count }));
  };

  return {
    type: countBy(items.map((item) => item.type)).sort((a, b) => b.count - a.count),
    publicationYear: countBy(items.map((item) => item.publicationYear)).filter((item) => item.value).sort((a, b) => b.value - a.value),
    authors: countBy(items.flatMap((item) => item.authors)).sort((a, b) => b.count - a.count).slice(0, 20),
    sources: countBy(items.map((item) => item.source)).sort((a, b) => b.count - a.count),
  };
}

function paginate(items, page, pageSize) {
  const start = (page - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

function fetchJson(url, timeoutMs) {
  if (typeof fetch === "function") {
    return fetch(url, { headers: { "User-Agent": "DeepResearchKnowledge/1.0" } }).then(async (res) => {
      const json = await res.json().catch(() => ({}));
      return { ok: res.ok, status: res.status, json };
    });
  }

  return new Promise((resolve, reject) => {
    const req = https.get(url, { headers: { "User-Agent": "DeepResearchKnowledge/1.0" } }, (res) => {
      let raw = "";
      res.on("data", (chunk) => {
        raw += chunk;
      });
      res.on("end", () => {
        let json = {};
        try {
          json = raw ? JSON.parse(raw) : {};
        } catch {
          json = {};
        }
        resolve({ ok: res.statusCode >= 200 && res.statusCode < 300, status: res.statusCode, json });
      });
    });

    req.on("error", reject);
    req.setTimeout(timeoutMs, () => {
      req.destroy(new Error("Request timeout"));
    });
  });
}

async function lookupDetailUrlByTitle(title) {
  const cleanTitle = String(title || "").trim();
  if (!cleanTitle) return "";

  const url = new URL(`${config.openAlexBaseUrl}/works`);
  url.searchParams.set("search", cleanTitle);
  url.searchParams.set("per-page", "3");
  url.searchParams.set("select", "id,doi,display_name,primary_location,host_venue");

  if (config.openAlexEmail) {
    url.searchParams.set("mailto", config.openAlexEmail);
  }

  try {
    const response = await fetchJson(url.toString(), config.externalSearchTimeoutMs);
    if (!response.ok) return "";

    const results = Array.isArray(response.json?.results) ? response.json.results : [];
    const exact = results.find((item) => normalize(item.display_name) === normalize(cleanTitle)) || results[0];
    if (!exact) return "";

    const source = exact?.primary_location?.source?.display_name || exact?.host_venue?.display_name || "";
    return normalizeDetailUrl(
      exact?.primary_location?.landing_page_url || exact?.primary_location?.pdf_url || exact?.doi || exact?.id,
      exact?.display_name || cleanTitle,
      source,
    );
  } catch {
    return "";
  }
}

async function enrichDetailUrls(items) {
  return Promise.all(
    items.map(async (item) => {
      if (item.detailUrl && !item.detailUrl.includes("scholar.google.com")) {
        return item;
      }

      const lookedUp = await lookupDetailUrlByTitle(item.title);
      if (!lookedUp) return item;

      return {
        ...item,
        detailUrl: lookedUp,
      };
    }),
  );
}

async function fetchOpenAlexResults(queryVariants, requestedCount) {
  const primaryQuery = queryVariants.find((item) => !containsCjk(item)) || queryVariants[0] || "";
  if (!primaryQuery) return [];

  const url = new URL(`${config.openAlexBaseUrl}/works`);
  url.searchParams.set("search", primaryQuery);
  url.searchParams.set("per-page", String(Math.min(100, Math.max(25, requestedCount))));
  url.searchParams.set(
    "select",
    "id,doi,display_name,publication_year,type,type_crossref,cited_by_count,authorships,primary_location,host_venue,abstract_inverted_index",
  );
  if (config.openAlexEmail) {
    url.searchParams.set("mailto", config.openAlexEmail);
  }

  try {
    const response = await fetchJson(url.toString(), config.externalSearchTimeoutMs);
    if (!response.ok) return [];
    const items = Array.isArray(response.json?.results) ? response.json.results : [];
    return items.map((item) => normalizeOpenAlexWork(item, queryVariants));
  } catch {
    return [];
  }
}

async function fetchTopicCrawlerResults(query, limit) {
  const code = `
import json
import sys
from topic_crawler import TopicCrawler

keyword = sys.argv[1]
max_results = int(sys.argv[2])
initial_search = int(sys.argv[3])

crawler = TopicCrawler(keyword=keyword, max_results=max_results)
papers = crawler.search_papers(max_search=initial_search)
ranked = crawler.rank_papers(papers, citation_weight=0.7) if papers else []

print("${START_MARKER}")
print(json.dumps(ranked, ensure_ascii=False, default=str))
print("${END_MARKER}")
`;

  try {
    return await runPythonJson({
      cwd: config.databaseApiPath,
      code,
      args: [query, String(limit), String(Math.max(100, limit * 3))],
      timeoutMs: config.pythonSearchTimeoutMs,
    });
  } catch {
    return [];
  }
}

function normalizeCrawlerPaper(item, queryVariants) {
  const paper = {
    id: item.id || item.doi || item.url || item.entry_url || item.title,
    title: item.title || "Untitled",
    authors: normalizeAuthors(item.authors),
    publicationYear: toYear(item.published || item.updated || item.published_date),
    source: item.source || item.primary_category || (Array.isArray(item.categories) ? item.categories[0] : "") || "arXiv",
    abstract: item.abstract || item.summary || "",
    type: mapPaperType(item.type || item.primary_category || ""),
    detailUrl: normalizeDetailUrl(item.entry_url || item.url || item.pdf_url || item.doi || item.id, item.title, item.source || item.primary_category),
    citationCount: Number(item.citation_count || 0),
  };

  return {
    ...paper,
    relevanceScore: Math.max(
      Number(item.score ? Math.round(Number(item.score) * 100) : 0),
      computeRelevanceScore(paper, queryVariants),
    ),
  };
}

function filterAndRank(items, params, queryVariants) {
  return dedupeByTitle(items)
    .filter((item) => matchesFilters(item, params))
    .filter((item) => isRelevantEnough(item, queryVariants))
    .sort(buildComparator(params.sortBy));
}

async function searchPapers(params) {
  const page = Math.max(1, params.page || 1);
  const pageSize = Math.max(1, Math.min(50, params.pageSize || 10));
  const requestedCount = Math.min(80, Math.max(30, page * pageSize + 20));
  const queryVariants = expandQuery(params.query || "");

  const [openAlexResults, crawlerRaw] = await Promise.all([
    fetchOpenAlexResults(queryVariants, requestedCount),
    containsCjk(params.query || "") ? fetchTopicCrawlerResults(params.query || "", Math.min(60, requestedCount)) : Promise.resolve([]),
  ]);

  const crawlerResults = (Array.isArray(crawlerRaw) ? crawlerRaw : []).map((item) => normalizeCrawlerPaper(item, queryVariants));
  const realSourcePool = [...openAlexResults, ...crawlerResults];
  let combined = filterAndRank(realSourcePool, params, queryVariants);

  // 如果真实来源结果太少，放宽过滤条件，但仍然只用真实来源。
  if (combined.length < 5) {
    combined = dedupeByTitle(realSourcePool)
      .filter((item) => matchesFilters(item, params))
      .sort(buildComparator(params.sortBy))
      .slice(0, Math.max(20, page * pageSize));
  }

  // 只有在真实来源完全没有结果时，才使用本地种子数据兜底。
  if (combined.length === 0) {
    const localResults = localPapers.map(normalizeLocalPaper).map((paper) => ({
      ...paper,
      relevanceScore: Math.max(paper.relevanceScore, computeRelevanceScore(paper, queryVariants)),
    }));

    combined = dedupeByTitle(localResults)
      .filter((item) => matchesFilters(item, params))
      .sort(buildComparator(params.sortBy));
  }

  const pagedResults = await enrichDetailUrls(paginate(combined, page, pageSize));

  return {
    results: pagedResults,
    total: combined.length,
    page,
    pageSize,
    facets: aggregateFacets(combined),
  };
}

module.exports = {
  searchPapers,
};
