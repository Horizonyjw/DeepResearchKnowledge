const config = require("../config");
const { START_MARKER, END_MARKER, runPythonText } = require("./python-bridge");

function reportTypeLabel(type) {
  if (type === "detailed") return "详细综述";
  if (type === "comparative") return "对比综述";
  return "综述";
}

function cleanText(value) {
  return String(value || "")
    .replace(/\r/g, "\n")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, " ")
    .trim();
}

function truncate(text, maxLength = 180) {
  const normalized = cleanText(text);
  if (normalized.length <= maxLength) return normalized;
  return `${normalized.slice(0, maxLength).trim()}...`;
}

function uniquePapers(papers) {
  const seen = new Set();
  const result = [];

  for (const paper of Array.isArray(papers) ? papers : []) {
    const key = cleanText((paper && (paper.id || paper.title)) || "").toLowerCase();
    if (!key || seen.has(key)) continue;
    seen.add(key);
    result.push(paper);
  }

  return result;
}

function formatAuthors(authors) {
  if (!Array.isArray(authors) || authors.length === 0) return "作者信息未提供";
  return authors.slice(0, 6).join("、");
}

function collectKeywordHints(papers) {
  const text = papers
    .map((paper) => `${paper.title || ""} ${paper.abstract || ""}`.toLowerCase())
    .join(" ");

  const mapping = [
    { match: /(llm|large language model|foundation model|transformer)/, label: "大模型与生成式建模" },
    { match: /(retrieval|rag|knowledge)/, label: "检索增强与知识利用" },
    { match: /(benchmark|evaluation|metric)/, label: "评测体系与基准构建" },
    { match: /(agent|planning|tool)/, label: "智能体与工具调用" },
    { match: /(graph|gcn|knowledge graph)/, label: "图结构建模与关系推理" },
    { match: /(vision|image|multimodal)/, label: "多模态与视觉信息融合" },
    { match: /(clinical|biomedical|protein|gene)/, label: "垂直领域应用深化" },
    { match: /(efficiency|compression|distillation|latency)/, label: "效率优化与部署落地" },
    { match: /(trust|robust|safe|alignment|hallucination)/, label: "可靠性、安全性与可解释性" },
  ];

  return mapping.filter((item) => item.match.test(text)).map((item) => item.label);
}

function buildAbstract(query, papers, reportType) {
  const sources = [...new Set(papers.map((paper) => paper.source).filter(Boolean))].slice(0, 4);
  const years = papers.map((paper) => Number(paper.publicationYear)).filter(Boolean).sort((a, b) => a - b);
  const typeText =
    reportType === "comparative"
      ? "对比分析"
      : reportType === "detailed"
        ? "系统梳理"
        : "概览总结";

  const sourceText = sources.length > 0 ? `样本文献主要来自 ${sources.join("、")} 等来源。` : "";
  const yearText =
    years.length > 1
      ? `文献时间跨度覆盖 ${years[0]} 至 ${years[years.length - 1]} 年，能够反映该主题的近期发展脉络。`
      : years.length === 1
        ? `现有样本文献主要集中在 ${years[0]} 年前后。`
        : "";

  return [
    "## 摘要",
    `本文围绕“${query}”开展${typeText}，基于已检索到的代表性论文，从研究背景、核心方法、代表性工作、主要挑战以及未来趋势等方面进行组织化综述。${sourceText}${yearText}整体来看，该主题已经从单点方法探索逐步发展到面向真实场景的系统优化阶段，研究重点正在由单纯追求指标提升转向兼顾方法有效性、可解释性、可靠性与应用落地。`,
    "",
    `**关键词：** ${query}、文献综述、研究进展`,
    "",
  ].join("\n");
}

function buildIntroduction(query, papers) {
  const papersText = papers.length > 0 ? `本次综述选取了 ${papers.length} 篇代表性论文作为分析样本。` : "";

  return [
    "## 一、研究背景与问题提出",
    `“${query}”是当前学术研究与工程实践中持续升温的重要议题。随着相关理论、模型能力与数据资源不断成熟，研究者开始从不同视角讨论该主题的基础问题、方法路线、评估标准与应用边界。${papersText}为了避免零散阅读带来的信息碎片化，本文尝试以结构化方式梳理当前研究的主要脉络，并总结不同工作之间的联系与差异。`,
    "",
  ].join("\n");
}

function buildLandscape(query, papers) {
  const hints = collectKeywordHints(papers);
  const bulletItems =
    hints.length > 0
      ? hints
      : [
          "模型设计与核心算法改进",
          "数据、任务与实验评测框架构建",
          "真实场景中的应用迁移与性能验证",
          "可靠性、泛化性与解释性问题",
        ];

  return [
    "## 二、研究现状与主题脉络",
    `围绕“${query}”，现有研究大致可以归纳为以下几条主线：`,
    ...bulletItems.map((item) => `- ${item}`),
    "",
    "从整体脉络看，早期工作更多聚焦于方法可行性验证，近期研究则进一步强调统一评测、跨场景泛化以及面向复杂任务链路的系统整合能力。这说明该主题正在从“方法是否有效”转向“方法在何种条件下稳定有效”。",
    "",
  ].join("\n");
}

function buildRepresentativeStudies(papers) {
  if (papers.length === 0) {
    return [
      "## 三、代表性文献解读",
      "当前没有可用的代表性文献样本，因此本节暂无法展开逐篇分析。建议先完成论文筛选，再生成综述。",
      "",
    ].join("\n");
  }

  const entries = papers.slice(0, 8).map((paper, index) => {
    const abstract = truncate(paper.abstract, 220);
    const year = paper.publicationYear || "年份未提供";
    const source = paper.source || "来源未提供";
    return [
      `### ${index + 1}. ${paper.title || "未命名文献"}`,
      `- 作者：${formatAuthors(paper.authors)}`,
      `- 来源：${source}，${year}`,
      `- 核心内容：${abstract || "摘要信息不足，建议结合原文进一步核对具体方法与结论。"}`,
      "",
    ].join("\n");
  });

  return ["## 三、代表性文献解读", ...entries].join("\n");
}

function buildComparativeAnalysis(query, papers) {
  const sourceCount = [...new Set(papers.map((paper) => paper.source).filter(Boolean))].length;
  const yearCount = [...new Set(papers.map((paper) => paper.publicationYear).filter(Boolean))].length;

  return [
    "## 四、方法比较与综合分析",
    `综合已选文献可以看到，“${query}”领域的研究虽然在问题设定与技术路线方面存在差异，但通常都围绕同一核心目标展开：在保证结果质量的同时，提高方法的适用范围、稳定性与实际可用性。`,
    `从样本文献分布看，本次综述涉及 ${sourceCount || "多个"} 类来源、覆盖 ${yearCount || "多个"} 个年份阶段，说明该主题并非局限于单一发表渠道或单一时间窗口。`,
    "具体而言，不同研究工作之间的差异主要体现在三个方面：一是采用的知识来源与输入形式不同；二是方法评价重点不同，有的关注效果指标，有的更强调推理过程、可靠性或成本；三是应用场景差异显著，导致实验设计与结论外推范围并不完全一致。因此，在阅读相关成果时，不能仅以单个指标对方法优劣作出简单判断，而应结合任务背景、数据条件与评测标准进行整体分析。",
    "",
  ].join("\n");
}

function buildChallenges(query) {
  return [
    "## 五、主要问题与挑战",
    `尽管“${query}”相关研究已经积累了较多成果，但仍存在一些共性挑战：`,
    "- 评测标准不完全统一，不同论文在数据划分、基线选择和指标定义上存在差异，横向比较难度较大。",
    "- 许多工作强调实验结果提升，但对失败案例、边界条件和适用前提讨论不足，影响结论的可迁移性。",
    "- 部分研究在真实场景中的部署成本、可解释性与长期维护问题上论述较少，工程落地价值仍需进一步验证。",
    "- 当研究涉及大模型、复杂推理链或多模块系统时，鲁棒性与可复现性往往成为决定系统能否长期使用的关键因素。",
    "",
  ].join("\n");
}

function buildOutlook(query, reportType) {
  const focus =
    reportType === "comparative"
      ? "后续研究尤其需要建立更统一的比较框架，使不同方法能够在相同任务条件下进行可解释的对比。"
      : reportType === "detailed"
        ? "后续研究应进一步细化任务定义、数据治理策略和评测流程，从方法有效走向体系完备。"
        : "后续研究可重点推进统一评测、跨场景验证与实际应用闭环建设。";

  return [
    "## 六、未来趋势与研究展望",
    `整体而言，“${query}”已经从概念性探索逐步进入强调系统能力、实证证据和应用价值的阶段。`,
    "未来的研究重点很可能集中在以下几个方向：更高质量的数据与评价基准、更加透明的实验报告、更强的跨任务泛化能力，以及更加贴近真实业务流程的系统设计。",
    focus,
    "",
  ].join("\n");
}

function buildConclusion(query) {
  return [
    "## 七、结论",
    `本文围绕“${query}”对现有代表性研究进行了组织化梳理。综合来看，该领域已经形成较为清晰的方法演进路径，但距离稳定、可靠且可广泛复用的成熟范式仍有距离。后续工作应继续强化评测一致性、方法解释性与场景适配能力，从而推动相关研究成果真正转化为高质量的学术与应用价值。`,
    "",
  ].join("\n");
}

function buildReferences(papers) {
  const lines = papers.length > 0
    ? papers.slice(0, 12).map((paper, index) => {
        const authors = formatAuthors(paper.authors);
        const title = paper.title || "未命名文献";
        const source = paper.source || "来源未提供";
        const year = paper.publicationYear || "年份未提供";
        return `${index + 1}. ${authors}. ${title}. ${source}, ${year}.`;
      })
    : ["1. 当前没有可用的参考文献。"];

  return ["## 参考文献", ...lines, ""].join("\n");
}

function buildFallbackReport({ query, papers = [], reportType = "summary" }) {
  const selected = uniquePapers(papers).slice(0, 12);

  return [
    `# ${query}${reportTypeLabel(reportType)}`,
    "",
    buildAbstract(query, selected, reportType),
    buildIntroduction(query, selected),
    buildLandscape(query, selected),
    buildRepresentativeStudies(selected),
    buildComparativeAnalysis(query, selected),
    buildChallenges(query),
    buildOutlook(query, reportType),
    buildConclusion(query),
    buildReferences(selected),
  ]
    .join("\n")
    .trim();
}

function sanitizeExternalReport(content) {
  return cleanText(
    String(content || "")
      .replace(/<\/?(div|span|section|article|main|aside|header|footer)[^>]*>/gi, "")
      .replace(/class(Name)?="[^"]*"/gi, "")
      .replace(/ext-gray-\d+/gi, "")
      .replace(/^\s*#\s*$/gm, "")
  );
}

function isUsableReport(content) {
  const text = cleanText(content);
  if (!text) return false;
  if (text.length < 800) return false;
  if (/fallback draft/i.test(text)) return false;
  if (/workflow unavailable/i.test(text)) return false;
  if (/ext-gray-\d+/i.test(text)) return false;
  if (/selected papers/i.test(text) && !/##\s*参考文献/.test(text)) return false;
  if (!/^#\s+/m.test(text)) return false;
  if (!/##\s+/.test(text)) return false;
  return true;
}

async function buildReportViaPython({ query, papers = [], reportType = "summary" }) {
  const code = `
import copy
import json
import sys

from config import data, headers, url
from sse_client import stream_post_request

query = sys.argv[1]
report_type = sys.argv[2]
papers = json.loads(sys.argv[3])

abstract_list = {"pdfs": []}
for index, paper in enumerate(papers):
    abstract_list["pdfs"].append({
        "pdf_id": str(paper.get("id") or f"paper-{index + 1}"),
        "pdf_abstract": paper.get("abstract") or paper.get("summary") or "",
    })

payload = copy.deepcopy(data)
payload["query"] = f"""请围绕主题“{query}”生成一篇中文{report_type}。

要求：
1. 使用标准学术综述结构，至少包含：摘要、研究背景、研究现状、代表性工作、挑战、展望、结论、参考文献。
2. 语言必须正式、连贯，不要输出日志、HTML class 名、代码片段、占位符或无意义字符。
3. 输出使用 Markdown 格式，一级标题为综述标题，后续章节使用二级或三级标题。
4. 优先依据我提供的论文摘要撰写，不要编造不存在的实验数据。
5. 参考文献部分应尽量引用输入论文标题与来源信息。"""
payload.setdefault("inputs", {})
payload["inputs"]["abstract_list"] = abstract_list

answer = stream_post_request(url, headers, payload, output_file=None, output_format="md") or ""

print("${START_MARKER}")
print(answer)
print("${END_MARKER}")
`;

  return runPythonText({
    cwd: config.reportApiPath,
    code,
    args: [query, reportTypeLabel(reportType), JSON.stringify(papers)],
    timeoutMs: config.pythonReportTimeoutMs,
  });
}

async function buildReport(params) {
  try {
    const content = sanitizeExternalReport(await buildReportViaPython(params));
    if (isUsableReport(content)) {
      return content.trim();
    }
  } catch {
    // Fall back below.
  }

  return buildFallbackReport(params);
}

module.exports = {
  buildReport,
};
