import { useEffect, useMemo, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { toast } from 'sonner';
import { Navbar } from '../components/Navbar';
import { generateResearchReport, type ResearchPaper } from '../lib/api';

type ReferenceItem = {
  id: string;
  title: string;
  authors: string[];
  year: number;
  source: string;
  type: string;
  detailUrl?: string;
};

type ReportBlock =
  | { type: 'h1' | 'h2' | 'h3'; text: string }
  | { type: 'p'; text: string }
  | { type: 'ul'; items: string[] }
  | { type: 'ol'; items: string[] };

function parseMarkdown(content: string): ReportBlock[] {
  const lines = String(content || '').replace(/\r\n/g, '\n').split('\n');
  const blocks: ReportBlock[] = [];

  let paragraph: string[] = [];
  let listBuffer: string[] = [];
  let listType: 'ul' | 'ol' | null = null;

  const flushParagraph = () => {
    if (paragraph.length > 0) {
      blocks.push({ type: 'p', text: paragraph.join(' ') });
      paragraph = [];
    }
  };

  const flushList = () => {
    if (listType && listBuffer.length > 0) {
      blocks.push({ type: listType, items: [...listBuffer] });
    }
    listType = null;
    listBuffer = [];
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();

    if (!line) {
      flushParagraph();
      flushList();
      continue;
    }

    if (line.startsWith('# ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h1', text: line.slice(2).trim() });
      continue;
    }

    if (line.startsWith('## ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h2', text: line.slice(3).trim() });
      continue;
    }

    if (line.startsWith('### ')) {
      flushParagraph();
      flushList();
      blocks.push({ type: 'h3', text: line.slice(4).trim() });
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      if (listType && listType !== 'ul') flushList();
      listType = 'ul';
      listBuffer.push(line.replace(/^[-*]\s+/, '').trim());
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      if (listType && listType !== 'ol') flushList();
      listType = 'ol';
      listBuffer.push(line.replace(/^\d+\.\s+/, '').trim());
      continue;
    }

    flushList();
    paragraph.push(line);
  }

  flushParagraph();
  flushList();
  return blocks;
}

function reportTypeTitle(reportType: string, query: string) {
  if (reportType === 'detailed') return `${query}详细研究综述`;
  if (reportType === 'comparative') return `${query}对比综述`;
  return `${query}研究综述`;
}

function wordCountOf(text: string) {
  return String(text || '').replace(/\s+/g, '').length;
}

function escapeHtml(text: string) {
  return String(text || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function blocksToPrintableHtml(blocks: ReportBlock[]) {
  return blocks
    .map((block) => {
      if (block.type === 'h1') return `<h1>${escapeHtml(block.text)}</h1>`;
      if (block.type === 'h2') return `<h2>${escapeHtml(block.text)}</h2>`;
      if (block.type === 'h3') return `<h3>${escapeHtml(block.text)}</h3>`;
      if (block.type === 'p') return `<p>${escapeHtml(block.text)}</p>`;
      if (block.type === 'ul') {
        return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
      }
      return `<ol>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`;
    })
    .join('');
}

export default function ReportGenerationPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [report, setReport] = useState('');
  const [error, setError] = useState('');
  const [progress, setProgress] = useState(10);
  const [searchQuery, setSearchQuery] = useState('');
  const [reportTitle, setReportTitle] = useState('');
  const [generatedAt, setGeneratedAt] = useState('');
  const [selectedReferences, setSelectedReferences] = useState<ReferenceItem[]>([]);
  const [downloadDialogOpen, setDownloadDialogOpen] = useState(false);

  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const query = searchParams.get('query') || '人工智能';
    const reportType = (searchParams.get('reportType') as 'summary' | 'detailed' | 'comparative') || 'summary';

    setSearchQuery(query);
    setReportTitle(reportTypeTitle(reportType, query));
    setGeneratedAt(new Date().toLocaleString('zh-CN'));
    setError('');
    setLoading(true);
    setProgress(10);

    const progressTimer = window.setInterval(() => {
      setProgress((prev) => Math.min(prev + Math.random() * 10, 92));
    }, 500);

    try {
      const selectedPapersJson = localStorage.getItem('selectedPapers');
      let selectedPapers: ResearchPaper[] = [];

      if (selectedPapersJson) {
        const parsed = JSON.parse(selectedPapersJson);
        if (Array.isArray(parsed)) {
          selectedPapers = parsed;
        }
      }

      setSelectedReferences(
        selectedPapers.map((paper, index) => ({
          id: String(paper.id || `ref-${index + 1}`),
          title: paper.title,
          authors: paper.authors || [],
          year: paper.publicationYear,
          source: paper.source,
          type: paper.type,
          detailUrl: paper.detailUrl,
        }))
      );

      generateResearchReport({ query, papers: selectedPapers, reportType })
        .then((result) => {
          setReport(result);
          setProgress(100);
          setLoading(false);
        })
        .catch((err: any) => {
          setError(err?.message || '生成综述失败，请稍后重试');
          setLoading(false);
          window.clearInterval(progressTimer);
        })
        .finally(() => {
          window.clearInterval(progressTimer);
        });
    } catch {
      setError('读取参考文献信息失败');
      setLoading(false);
      window.clearInterval(progressTimer);
    }

    return () => window.clearInterval(progressTimer);
  }, [location.search]);

  const reportBlocks = useMemo(() => parseMarkdown(report), [report]);
  const computedWordCount = useMemo(() => wordCountOf(report), [report]);

  const handleRetry = () => {
    navigate(0);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    navigate(`/search?query=${encodeURIComponent(searchQuery.trim())}`);
  };

  const downloadMarkdown = () => {
    const blob = new Blob([report], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${reportTitle}.md`;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(url);
    toast.success('已下载为 Markdown 文件');
  };

  const downloadPdf = () => {
    const printableHtml = blocksToPrintableHtml(reportBlocks);
    const popup = window.open('', '_blank', 'width=960,height=720');

    if (!popup) {
      toast.error('浏览器拦截了弹窗，请允许当前页面打开新窗口');
      return;
    }

    popup.document.write(`
      <!doctype html>
      <html lang="zh-CN">
        <head>
          <meta charset="utf-8" />
          <title>${escapeHtml(reportTitle)}</title>
          <style>
            body {
              font-family: "Microsoft YaHei", "PingFang SC", sans-serif;
              margin: 40px auto;
              max-width: 900px;
              color: #111827;
              line-height: 1.8;
              padding: 0 24px;
            }
            h1 { font-size: 28px; margin: 0 0 20px; }
            h2 { font-size: 22px; margin: 28px 0 12px; }
            h3 { font-size: 18px; margin: 22px 0 10px; }
            p { margin: 0 0 14px; }
            ul, ol { margin: 0 0 14px 22px; padding: 0; }
            li { margin-bottom: 8px; }
            .meta {
              color: #6b7280;
              font-size: 13px;
              margin-bottom: 28px;
            }
            @media print {
              body { margin: 18mm auto; }
            }
          </style>
        </head>
        <body>
          <h1>${escapeHtml(reportTitle)}</h1>
          <div class="meta">
            生成时间：${escapeHtml(generatedAt)}<br />
            字数：${computedWordCount}<br />
            引用文献：${selectedReferences.length} 篇
          </div>
          ${printableHtml}
        </body>
      </html>
    `);
    popup.document.close();
    popup.focus();
    popup.print();
    popup.close();
    toast.success('已打开 PDF 打印窗口，请在系统弹窗中保存为 PDF');
  };

  const handleDownloadChoice = (format: 'md' | 'pdf') => {
    setDownloadDialogOpen(false);
    if (format === 'md') {
      downloadMarkdown();
      return;
    }
    downloadPdf();
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(report);
      toast.success('综述内容已复制');
    } catch {
      toast.error('复制失败，请稍后重试');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <form onSubmit={handleSearch}>
            <div className="flex shadow-md rounded-lg overflow-hidden max-w-4xl mx-auto">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="输入关键词重新搜索"
                className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </div>
          </form>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-[minmax(0,1fr)_320px] gap-6">
          <section className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            {loading ? (
              <div className="py-16 flex flex-col items-center">
                <motion.div
                  className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full mb-6"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                />
                <h2 className="text-xl font-semibold text-gray-800 mb-3">正在生成综述</h2>
                <div className="w-full max-w-xl bg-gray-200 rounded-full h-2.5 mb-2">
                  <div className="bg-blue-600 h-2.5 rounded-full transition-all" style={{ width: `${progress}%` }} />
                </div>
                <p className="text-sm text-gray-500">正在整理论文摘要并生成结构化综述，请稍候。</p>
              </div>
            ) : error ? (
              <div className="py-16 text-center">
                <h2 className="text-xl font-semibold text-gray-800 mb-2">综述生成失败</h2>
                <p className="text-gray-600 mb-6">{error}</p>
                <div className="flex justify-center gap-3">
                  <button
                    onClick={handleRetry}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    重试
                  </button>
                  <Link
                    to="/"
                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                  >
                    返回首页
                  </Link>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-8">
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-3">{reportTitle}</h1>
                    <div className="flex flex-wrap items-center gap-4 text-sm text-gray-500">
                      <span>生成时间：{generatedAt}</span>
                      <span>字数：{computedWordCount}</span>
                      <span>引用文献：{selectedReferences.length} 篇</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <button
                      onClick={handleCopy}
                      className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                      复制
                    </button>
                    <button
                      onClick={() => setDownloadDialogOpen(true)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                      下载
                    </button>
                  </div>
                </div>

                <article className="space-y-5 text-gray-800 leading-8">
                  {reportBlocks.map((block, index) => {
                    if (block.type === 'h1') {
                      return <h1 key={index} className="text-3xl font-bold text-gray-900">{block.text}</h1>;
                    }

                    if (block.type === 'h2') {
                      return <h2 key={index} className="text-2xl font-semibold text-gray-900 pt-4">{block.text}</h2>;
                    }

                    if (block.type === 'h3') {
                      return <h3 key={index} className="text-xl font-medium text-gray-900 pt-2">{block.text}</h3>;
                    }

                    if (block.type === 'ul') {
                      return (
                        <ul key={index} className="list-disc pl-6 space-y-2 text-gray-700">
                          {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                        </ul>
                      );
                    }

                    return block.type === 'ol' ? (
                      <ol key={index} className="list-decimal pl-6 space-y-2 text-gray-700">
                        {block.items.map((item, itemIndex) => <li key={itemIndex}>{item}</li>)}
                      </ol>
                    ) : (
                      <p key={index} className="text-gray-700">{block.text}</p>
                    );
                  })}
                </article>
              </div>
            )}
          </section>

          <aside className="bg-white rounded-lg shadow-sm border border-gray-200 p-5 h-fit">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">参考文献</h2>
            {selectedReferences.length > 0 ? (
              <div className="space-y-4">
                {selectedReferences.map((ref, index) => (
                  <div key={ref.id || index} className="border-b border-gray-100 pb-4 last:border-b-0">
                    <div className="text-sm font-medium text-gray-900 mb-1">{index + 1}. {ref.title}</div>
                    <div className="text-xs text-gray-600 mb-1">
                      {ref.authors.length > 0 ? ref.authors.join(', ') : '作者信息未提供'}
                    </div>
                    <div className="text-xs text-gray-500 mb-2">
                      {ref.year || '年份未提供'} · {ref.source || '来源未提供'}
                    </div>
                    {ref.detailUrl ? (
                      <a
                        href={ref.detailUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-800"
                      >
                        查看原文
                      </a>
                    ) : null}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-gray-500">当前没有可用的参考文献。</p>
            )}
          </aside>
        </div>
      </div>

      {downloadDialogOpen ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
          <div className="w-full max-w-md rounded-xl bg-white shadow-xl border border-gray-200 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">选择下载格式</h2>
            <p className="text-sm text-gray-600 mb-6">
              请选择要导出的文件格式。PDF 会打开系统打印窗口，你可以在其中保存为 PDF。
            </p>
            <div className="space-y-3">
              <button
                type="button"
                onClick={() => handleDownloadChoice('pdf')}
                className="w-full rounded-lg border border-blue-600 bg-blue-600 px-4 py-3 text-white hover:bg-blue-700 transition-colors"
              >
                下载为 PDF
              </button>
              <button
                type="button"
                onClick={() => handleDownloadChoice('md')}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-700 hover:bg-gray-50 transition-colors"
              >
                下载为 Markdown
              </button>
            </div>
            <button
              type="button"
              onClick={() => setDownloadDialogOpen(false)}
              className="mt-4 w-full rounded-lg px-4 py-2 text-sm text-gray-500 hover:bg-gray-50 transition-colors"
            >
              取消
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
