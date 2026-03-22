import json
import time
import os
import pickle
import asyncio
from datetime import datetime
from pathlib import Path
from typing import List, Dict, Tuple
from tqdm import tqdm
from openai import OpenAI
from dotenv import load_dotenv
from paperscraper.arxiv import get_and_dump_arxiv_papers


class TopicCrawler:
    """高性能arXiv论文爬虫 - 基于paperscraper库"""

    def __init__(self,
                 keyword: str,
                 save_dir: str = "./topic_papers",
                 max_results: int = 100):
        self.keyword = keyword
        self.save_dir = Path(save_dir)
        self.max_results = max_results
        self.cache_file = self.save_dir / "cache.pkl"

        # 创建目录结构
        self.pdfs_dir = self.save_dir / "pdfs"
        self.metadata_dir = self.save_dir / "metadata"

        for dir_path in [self.pdfs_dir, self.metadata_dir]:
            dir_path.mkdir(parents=True, exist_ok=True)

        # 加载缓存
        self.cached_papers = self.load_cache()

        # 异步配置
        self.semaphore_limit = 20
        self.batch_size = 500

    # LLM查询转换 - 静态方法
    @staticmethod
    def get_query(user_input: str) -> str:
        """使用智谱GLM-4 API将中文查询转换为paperscraper可用的搜索关键词

        注意：paperscraper会在关键词前自动添加 all: 前缀
        因此只需要返回纯关键词，不要添加任何前缀
        """
        load_dotenv()
        api_key = os.getenv('API_KEY')

        if not api_key:
            print("警告: 未设置API_KEY")
            return user_input

        client = OpenAI(
            api_key=api_key,
            base_url="https://open.bigmodel.cn/api/paas/v4/"
        )

        system_prompt = '''你是一个学术搜索助手，负责将用户的中文查询转换为 paperscraper 库可用的搜索关键词。

重要说明：paperscraper 库会在关键词前自动添加 "all:" 前缀，因此你只需要返回纯关键词，不要添加任何前缀！

任务规则：
1. 分析用户输入的中文关键词
2. 如果是特定类别（如"人工智能"、"机器学习"、"计算机视觉"、"自然语言处理"等），返回对应的 arXiv 类别代码（cs.AI, cs.LG, cs.CV, cs.CL 等）
3. 如果是通用概念或技术术语（如"注意力机制"、"神经网络"、"深度学习"等），返回英文关键词
4. 返回格式：只需返回搜索关键词字符串，不要添加任何前缀（cat:、all: 等），不要添加任何解释

类别参考：
- cs.AI：人工智能
- cs.LG：机器学习
- cs.CV：计算机视觉
- cs.CL：自然语言处理
- cs.NE：神经与计算
- cs.RO：机器人学

示例：
输入：人工智能 → 输出：cs.AI
输入：机器学习 → 输出：cs.LG
输入：计算机视觉 → 输出：cs.CV
输入：自然语言处理 → 输出：cs.CL
输入：注意力机制 → 输出：attention mechanism
输入：深度学习 → 输出：deep learning
输入：神经网络 → 输出：neural network'''

        full_messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_input}
        ]

        try:
            response = client.chat.completions.create(
                model="glm-4.7-flash",
                messages=full_messages,
                temperature=0.3
            )
            ai_reply = response.choices[0].message.content.strip()

            return ai_reply
        except Exception as e:
            print(f"LLM API调用失败: {e}")
            return user_input

    def load_cache(self) -> Dict:
        """加载缓存数据"""
        if self.cache_file.exists():
            try:
                with open(self.cache_file, 'rb') as f:
                    return pickle.load(f)
            except:
                return {}
        return {}

    def save_cache(self):
        """保存缓存数据"""
        with open(self.cache_file, 'wb') as f:
            pickle.dump(self.cached_papers, f)

    def parse_date(self, date_str: str) -> datetime:
        """解析日期字符串"""
        try:
            return datetime.fromisoformat(date_str.replace('Z', '+00:00'))
        except:
            try:
                return datetime.strptime(date_str[:10], '%Y-%m-%d')
            except:
                return datetime.now()

    def search_papers(self, max_search: int = 10000):
        """搜索论文 - 使用paperscraper库"""
        # 使用LLM转换关键词
        search_keyword = self.get_query(self.keyword)
        print(f" 正在搜索关键词: {self.keyword}")
        print(f" LLM转换后: {search_keyword}")
        print(f" 初始搜索数量: {max_search}, 目标筛选: {self.max_results}")

        papers = []

        # 使用paperscraper搜索论文
        print("\n 正在获取论文信息...")
        start_time = time.time()

        # 确保保存目录存在
        os.makedirs(self.save_dir, exist_ok=True)

        # 构建查询,只需要传入纯关键词
        keywords = [search_keyword]

        # 创建临时文件用于存储搜索结果
        temp_file = self.save_dir / "_temp_search.jsonl"

        try:
            # 搜索论文并保存到临时文件
            get_and_dump_arxiv_papers(
                keywords=keywords,
                output_filepath=str(temp_file),
                max_results=max_search
            )

            # 读取搜索结果
            if temp_file.exists():
                with open(temp_file, 'r', encoding='utf-8') as f:
                    for line in f:
                        try:
                            paper_data = json.loads(line.strip())
                            paper_id = paper_data.get('doi', '').replace('10.48550/arXiv.', '')

                            # 检查缓存
                            if paper_id in self.cached_papers:
                                papers.append(self.cached_papers[paper_id])
                            else:
                                paper_info = {
                                    'id': paper_id,
                                    'doi': paper_data.get('doi', ''),
                                    'title': paper_data.get('title', ''),
                                    'abstract': paper_data.get('abstract', ''),
                                    'published': self.parse_date(paper_data.get('date', '')),
                                    'pdf_url': f'https://arxiv.org/pdf/{paper_id}.pdf',
                                    'entry_url': f'https://arxiv.org/abs/{paper_id}',
                                }

                                papers.append(paper_info)
                                self.cached_papers[paper_id] = paper_info

                        except json.JSONDecodeError:
                            continue

                # 读取完成后立即删除临时文件
                try:
                    temp_file.unlink()
                except:
                    pass
        except Exception as e:
            print(f" 搜索过程出错: {e}")
            if temp_file.exists():
                try:
                    temp_file.unlink()
                except:
                    pass

        elapsed = time.time() - start_time
        print(f" 成功获取 {len(papers)} 篇论文 (耗时: {elapsed:.1f}秒)")
        self.save_cache()
        return papers

    async def fetch_citations_batch(self, paper_titles: List[str], paper_ids: List[str] = None) -> Dict[str, int]:
        """批量获取引用数 - 支持重试和国内镜像"""
        import requests
        import concurrent.futures

        results = {}
        success_count = 0
        fail_count = 0

        def fetch_with_retry(paper_id, title, max_retries=3):
            """带多重备用API的重试 - 优化版"""
            nonlocal success_count, fail_count

            # 尝试次数 - 减少主API重试，依赖备用API
            for attempt in range(max_retries):
                try:
                    # 方法1: Semantic Scholar API (最快)
                    url = f"https://api.semanticscholar.org/graph/v1/paper/arXiv:{paper_id}"
                    params = {"fields": "citationCount"}

                    response = requests.get(
                        url,
                        params=params,
                        timeout=6
                    )

                    if response.status_code == 200:
                        data = response.json()
                        citation = data.get('citationCount', 0) or 0
                        success_count += 1
                        return paper_id, citation
                    elif response.status_code == 404:
                        break
                    else:
                        if attempt < max_retries - 1:
                            time.sleep(0.3)
                            continue
                except Exception as e:
                    if attempt < max_retries - 1:
                        time.sleep(0.3)
                        continue

            # 备用方案1: Semantic Scholar 标题搜索
            try:
                url = "https://api.semanticscholar.org/graph/v1/paper/search"
                params = {"query": title[:80], "fields": "citationCount", "limit": 1}

                response = requests.get(
                    url,
                    params=params,
                    timeout=6
                )

                if response.status_code == 200:
                    data = response.json()
                    if data.get('data') and len(data['data']) > 0:
                        paper = data['data'][0]
                        citation = paper.get('citationCount', 0) or 0
                        success_count += 1
                        return paper_id, citation
            except:
                pass

            # 备用方案2: CrossRef API
            try:
                url = f"https://api.crossref.org/works?query=arXiv:{paper_id}&rows=1"
                response = requests.get(
                    url,
                    timeout=6
                )

                if response.status_code == 200:
                    data = response.json()
                    if data.get('message', {}).get('items'):
                        item = data['message']['items'][0]
                        citation = item.get('is-referenced-by-count', 0) or 0
                        success_count += 1
                        return paper_id, citation
            except:
                pass

            # 备用方案3: OpenAlex API
            try:
                url = f"https://api.openalex.org/works?filter=arxiv:{paper_id}&per_page=1"
                response = requests.get(
                    url,
                    timeout=6
                )

                if response.status_code == 200:
                    data = response.json()
                    if data.get('results') and len(data['results']) > 0:
                        paper = data['results'][0]
                        citation = paper.get('cited_by_count', 0) or 0
                        success_count += 1
                        return paper_id, citation
            except:
                pass

            fail_count += 1
            return paper_id, 0

        # 使用线程池并发 - 带进度条
        print(" 正在获取引用数...")

        items_to_fetch = []
        for title, paper_id in zip(paper_titles, paper_ids or [None] * len(paper_titles)):
            if paper_id:
                items_to_fetch.append((paper_id, title))

        if items_to_fetch:
            # 并发数
            with concurrent.futures.ThreadPoolExecutor(max_workers=30) as executor:
                # 先提交所有任务
                futures = {executor.submit(fetch_with_retry, pid, title): pid for pid, title in items_to_fetch}

                # 使用tqdm显示进度
                with tqdm(total=len(items_to_fetch), desc="获取引用数") as pbar:
                    for future in concurrent.futures.as_completed(futures):
                        try:
                            key, count = future.result(timeout=12)
                            results[key] = count
                        except concurrent.futures.TimeoutError:
                            # 超时的任务算失败
                            pid = futures[future]
                            results[pid] = 0
                        except Exception:
                            pass
                        pbar.update(1)

        print(f" 引用数获取完成: 成功 {success_count}, 失败 {fail_count}")

        # 提示网络状态
        if success_count == 0 and fail_count > 0:
            print("\n" + "=" * 60)
            print(" 引用数获取全部失败！")
            print(" 可能原因：")
            print(" 1. 国内网络无法访问 Semantic Scholar API")
            print(" 2. 代理配置未生效")
            print(" 解决方案：")
            print(" - 请设置 HTTP_PROXY/HTTPS_PROXY 环境变量")
            print(" - 或使用VPN/代理软件")
            print(" - 当前将按发布时间排序论文")
            print("=" * 60 + "\n")

        return results

    def calculate_score(self, paper: Dict, citation_weight: float = 0.7) -> float:
        """计算论文综合分数"""
        try:
            if isinstance(paper['published'], str):
                published_date = datetime.fromisoformat(paper['published'].replace('Z', '+00:00'))
            else:
                published_date = paper['published']
            days_since_publish = (datetime.now() - published_date.replace(tzinfo=None)).days
        except:
            days_since_publish = 0

        time_score = max(0, 1 - days_since_publish / 3650)

        citation_count = paper.get('citation_count', 0)
        if citation_count > 0:
            citation_score = min(1.0, (citation_count ** 0.5) / 10)
        else:
            citation_score = 0

        total_score = (citation_score * citation_weight +
                       time_score * (1 - citation_weight))

        return total_score

    async def rank_papers_async(self, papers: List[Dict], citation_weight: float = 0.7) -> List[Dict]:
        """异步排序论文 - 全局比较所有论文"""
        print("\n 正在获取引用数并计算分数...")

        # 对所有论文获取引用数（全局比较）
        paper_titles = [p['title'] for p in papers]
        paper_ids = [p['id'] for p in papers]

        print(f" 目标筛选论文数: {len(papers)}, 需获取引用数: {len(paper_titles)}")

        start_time = time.time()
        citation_map = await self.fetch_citations_batch(paper_titles, paper_ids)
        elapsed = time.time() - start_time
        print(f" 引用数获取完成 (耗时: {elapsed:.1f}秒)")

        for paper in papers:
            paper['citation_count'] = citation_map.get(paper['id'], citation_map.get(paper['title'], 0))
            paper['score'] = self.calculate_score(paper, citation_weight)

        ranked_papers = sorted(papers, key=lambda x: x['score'], reverse=True)

        print(f" 排序完成，已选出Top {self.max_results}篇论文")
        return ranked_papers[:self.max_results]

    def rank_papers(self, papers: List[Dict], citation_weight: float = 0.7) -> List[Dict]:
        """排序论文 - 同步入口"""
        return asyncio.run(self.rank_papers_async(papers, citation_weight))

    def download_single_pdf(self, paper_id: str) -> Tuple[bool, str]:
        """下载单篇论文PDF - 使用同步requests"""
        import requests

        pdf_path = self.pdfs_dir / f"{paper_id}.pdf"

        if pdf_path.exists():
            return True, paper_id

        # 备用URL列表 - 优先使用国内镜像
        pdf_urls = [
            # 优先 ar5iv 国内镜像（最快）
            f"https://ar5iv.org/pdf/{paper_id}.pdf",
            # 其他镜像
            f"https://arxiv.org/pdf/{paper_id}.pdf",
            # Jina AI 代理
            f"https://r.jina.ai/http://arxiv.org/pdf/{paper_id}.pdf",
        ]

        for url in pdf_urls:
            try:
                response = requests.get(url, timeout=60, headers={'User-Agent': 'Mozilla/5.0'})

                if response.status_code == 200:
                    content = response.content
                    # 检查是否为PDF
                    if len(content) > 1000 and content[:4] == b'%PDF':
                        with open(pdf_path, 'wb') as f:
                            f.write(content)
                        if pdf_path.exists() and pdf_path.stat().st_size > 1000:
                            return True, paper_id
                elif response.status_code == 404:
                    continue
                elif response.status_code == 429:
                    time.sleep(3)
                    continue
            except requests.exceptions.Timeout:
                continue
            except requests.exceptions.RequestException:
                continue

        return False, paper_id

    def download_papers(self, papers: List[Dict], max_workers: int = 20):
        """批量下载论文 - 使用线程池并发"""
        import concurrent.futures

        print(f"\n 开始下载 {len(papers)} 篇论文...")

        # 统计已下载的论文
        papers_to_download = []
        for paper in papers:
            pdf_path = self.pdfs_dir / f"{paper.get('id', '')}.pdf"
            if not pdf_path.exists():
                papers_to_download.append(paper.get('id', ''))

        print(f" 需下载: {len(papers_to_download)} 篇")
        print(f" 并发数: {max_workers}")

        if not papers_to_download:
            print(" 所有论文已存在，跳过下载")
            return

        success_count = 0
        failed_papers = []

        # 使用线程池并发下载
        with concurrent.futures.ThreadPoolExecutor(max_workers=max_workers) as executor:
            # 提交所有任务
            future_to_paper = {executor.submit(self.download_single_pdf, paper_id): paper_id
                               for paper_id in papers_to_download}

            # 使用tqdm显示进度
            with tqdm(total=len(papers_to_download), desc="下载PDF") as pbar:
                for future in concurrent.futures.as_completed(future_to_paper):
                    paper_id = future_to_paper[future]
                    try:
                        success, pid = future.result()
                        if success:
                            success_count += 1
                        else:
                            failed_papers.append(pid)
                    except Exception:
                        failed_papers.append(paper_id)
                    pbar.update(1)

        # 输出失败论文列表
        if failed_papers:
            print(f"\n 下载失败论文数: {len(failed_papers)}")
            print(f" 失败论文ID: {', '.join(failed_papers[:5])}")

        print(f" 成功下载 {success_count}/{len(papers_to_download)} 篇论文")

    def save_metadata(self, papers: List[Dict]):
        """保存论文元数据（只保留JSON格式）"""
        print("\n 正在保存元数据...")

        # 直接保存为JSON数组
        json_path = self.metadata_dir / "papers_metadata.json"
        with open(json_path, 'w', encoding='utf-8') as f:
            json.dump(papers, f, ensure_ascii=False, indent=2, default=str)

        print(f" 元数据已保存至: {json_path}")
        print(f" 论文数量: {len(papers)}")

    # 主入口
    def main(self,
             initial_search: int = 1000,
             citation_weight: float = 0.7,
             download_pdf: bool = True):
        """运行爬虫主流程

        参数:
            initial_search: 初始搜索论文数量
            citation_weight: 引用数权重 (0-1)
            download_pdf: 是否下载PDF (默认False，因网络问题)
        """
        start_time = time.time()

        print("=" * 80)
        print(" arXiv 论文爬虫启动 (基于paperscraper)")
        print("=" * 80)

        # 1. 搜索论文
        papers = self.search_papers(max_search=initial_search)

        if not papers:
            print(" 未找到相关论文")
            return

        # 2. 排序筛选
        top_papers = self.rank_papers(papers, citation_weight)

        # 3. 保存元数据
        self.save_metadata(top_papers)

        # 4. 下载PDF (默认关闭，因网络问题)
        if download_pdf:
            print("\n 注意: 由于网络原因，PDF下载可能失败")
            self.download_papers(top_papers, max_workers=10)

        # 统计信息
        elapsed_time = time.time() - start_time
        print("\n" + "=" * 80)
        print(" 爬取完成!")
        print(f"  总耗时: {elapsed_time:.2f} 秒 ({elapsed_time / 60:.1f} 分钟)")
        print(f" 论文总数: {len(top_papers)}")
        print(f" 保存位置: {self.save_dir.absolute()}")
        print("=" * 80)
        print("\n 元数据文件已保存:")
        print(f"  - JSON: {self.metadata_dir / 'papers_metadata.json'}")
        print("=" * 80)


# 使用示例
if __name__ == "__main__":
    crawler = TopicCrawler(keyword="transformer", max_results=100)
    crawler.main()