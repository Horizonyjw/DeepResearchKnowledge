import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { AuthContext } from '../contexts/authContext';
import { fetchSearchHistory, type HistoryItem } from '../lib/api';

const HOT_TOPICS = ['人工智能', '气候变化', '区块链应用', '基因编辑', '量子计算'];

// 内容示例数据 - 包含文献综述和论文
const FEED_CONTENT = [
  // 热点文章
  {
    id: 1,
    title: 'OpenClaw: 开源多智能体协作框架的突破性进展',
    summary: 'OpenClaw 最新版本引入了创新的动态任务分配机制，使多智能体系统的协作效率提升了40%。该框架支持异构智能体间的无缝通信，为复杂任务分解提供了新的解决方案。',
    type: 'article',
    date: '2026-03-15',
    tags: ['多智能体', '开源框架', 'AI协作'],
    source: '文献综述'
  },
  {
    id: 2,
    title: '基于OpenClaw的科研助手系统设计与实现',
    summary: '研究者利用OpenClaw框架构建了自动化科研助手，能够完成文献检索、数据分析和论文草稿生成等任务。系统在学术场景中的应用展现了强大的实用价值。',
    type: 'article',
    date: '2026-03-14',
    tags: ['科研助手', '自动化', '应用案例'],
    source: '文献综述'
  },
  {
    id: 3,
    title: 'OpenClaw vs 传统多智能体框架：性能对比研究',
    summary: '本论文详细对比了OpenClaw与其他主流多智能体框架在任务完成效率、资源消耗和扩展性方面的表现。实验结果表明OpenClaw在复杂场景下具有明显优势。',
    type: 'article',
    date: '2026-03-13',
    tags: ['性能对比', '研究论文', 'Benchmark'],
    source: '文献综述'
  },
  {
    id: 4,
    title: '智能体协作中的知识共享机制研究',
    summary: '探讨了基于OpenClaw的知识蒸馏技术在智能体协作中的应用，提出了一种高效的知识传递协议，显著减少了通信开销。',
    type: 'article',
    date: '2026-03-12',
    tags: ['知识共享', '通信协议', '优化算法'],
    source: '文献综述'
  },
  // 学术论文
  {
    id: 5,
    title: 'Large Language Models for Scientific Research: A Comprehensive Survey',
    summary: 'This survey provides a systematic review of LLM applications in scientific research, covering literature review, experiment design, and paper writing...',
    type: 'paper',
    date: '2026-03-15',
    authors: 'Zhang, Y., Wang, L., Liu, X. et al.',
    journal: 'Nature Machine Intelligence',
    arxivId: '2603.12345',
    tags: ['大语言模型', '科研应用', '综述'],
    source: '学术论文'
  },
  {
    id: 6,
    title: 'Efficient Multi-Agent Collaboration via Dynamic Task Allocation',
    summary: 'We propose a novel dynamic task allocation mechanism for multi-agent systems that adapts to agent capabilities and task requirements in real-time...',
    type: 'paper',
    date: '2026-03-14',
    authors: 'Chen, J., Smith, R., Brown, T.',
    journal: 'ICML 2026',
    arxivId: '2603.12346',
    tags: ['多智能体', '任务分配', '优化算法'],
    source: '学术论文'
  },
  {
    id: 7,
    title: 'Knowledge Distillation in Heterogeneous Agent Systems',
    summary: 'This paper introduces a knowledge distillation framework for heterogeneous agent systems, enabling efficient knowledge transfer between agents with different architectures...',
    type: 'paper',
    date: '2026-03-13',
    authors: 'Williams, A., Johnson, M., Lee, S.',
    journal: 'AAAI Conference on Artificial Intelligence',
    arxivId: '2603.12347',
    tags: ['知识蒸馏', '异构系统', '智能体协作'],
    source: '学术论文'
  },
  {
    id: 8,
    title: 'Reinforcement Learning for Scientific Discovery: Challenges and Opportunities',
    summary: 'We examine the application of reinforcement learning algorithms in scientific discovery processes, identifying key challenges and proposing future research directions...',
    type: 'paper',
    date: '2026-03-12',
    authors: 'Martinez, C., Kim, D., Patel, R.',
    journal: 'Science Advances',
    arxivId: '2603.12348',
    tags: ['强化学习', '科学发现', '研究展望'],
    source: '学术论文'
  },
  {
    id: 9,
    title: 'Automated Literature Review Generation Using Multi-Agent Systems',
    summary: 'We present an automated literature review system powered by multiple specialized agents that collaboratively search, analyze, and synthesize academic papers...',
    type: 'paper',
    date: '2026-03-11',
    authors: 'Anderson, P., Taylor, M., Wilson, K.',
    journal: 'ACL 2026',
    arxivId: '2603.12349',
    tags: ['文献综述', '多智能体', '自动化'],
    source: '学术论文'
  },
  {
    id: 10,
    title: 'Ethical Considerations in AI-Powered Research Assistants',
    summary: 'This paper discusses the ethical implications of using AI agents in academic research, including issues of authorship, bias, and reproducibility...',
    type: 'paper',
    date: '2026-03-10',
    authors: 'Roberts, E., Garcia, F., Thompson, H.',
    journal: 'AI and Ethics',
    arxivId: '2603.12350',
    tags: ['AI伦理', '科研助手', '负责任AI'],
    source: '学术论文'
  }
];

// 分类选项 - 按照教育部学科分类标准，包含完整的二级专业
const CATEGORY_STRUCTURE = [
  {
    name: '理学',
    subcategories: ['数学', '基础数学', '应用数学', '计算数学', '概率论与数理统计', '运筹学与控制论', '物理学', '理论物理', '凝聚态物理', '光学', '原子与分子物理', '等离子体物理', '声学', '化学', '无机化学', '有机化学', '物理化学', '分析化学', '高分子化学与物理', '天文学', '地理学', '自然地理学', '人文地理学', '地图学与地理信息系统', '大气科学', '气象学', '大气物理学与大气环境', '海洋科学', '物理海洋学', '海洋化学', '海洋生物学', '海洋地质', '地球物理学', '固体地球物理学', '空间物理学', '地质学', '矿物学岩石学矿床学', '地球化学', '古生物学与地层学', '构造地质学', '第四纪地质学', '生物学', '植物学', '动物学', '生理学', '水生生物学', '微生物学', '神经生物学', '遗传学', '发育生物学', '细胞生物学', '生物化学与分子生物学', '生物物理学', '生态学', '统计学']
  },
  {
    name: '工学',
    subcategories: ['力学', '一般力学与力学基础', '固体力学', '流体力学', '工程力学', '机械工程', '机械制造及其自动化', '机械电子工程', '机械设计及理论', '车辆工程', '光学工程', '仪器科学与技术', '精密仪器及机械', '测试计量技术及仪器', '材料科学与工程', '材料物理与化学', '材料学', '材料加工工程', '冶金工程', '冶金物理化学', '钢铁冶金', '有色金属冶金', '动力工程及工程热物理', '工程热物理', '热能工程', '动力机械及工程', '流体机械及工程', '制冷及低温工程', '化工过程机械', '电气工程', '电机与电器', '电力系统及其自动化', '高电压与绝缘技术', '电力电子与电力传动', '电工理论与新技术', '电子科学与技术', '物理电子学', '电路与系统', '微电子学与固体电子学', '电磁场与微波技术', '信息与通信工程', '通信与信息系统', '信号与信息处理', '控制科学与工程', '控制理论与控制工程', '检测技术与自动化装置', '系统工程', '模式识别与智能系统', '导航制导与控制', '计算机科学与技术', '计算机系统结构', '计算机软件与理论', '计算机应用技术', '人工智能', '数据科学', '机器学习', '计算机视觉', '自然语言处理', '建筑学', '建筑历史与理论', '建筑设计及其理论', '城市规划与设计', '建筑技术科学', '土木工程', '岩土工程', '结构工程', '市政工程', '供热供燃气通风及空调工程', '防灾减灾工程及防护工程', '桥梁与隧道工程', '水利工程', '水文学及水资源', '水力学及河流动力学', '水工结构工程', '水利水电工程', '港口海岸及近海工程', '测绘科学与技术', '大地测量学与测量工程', '摄影测量与遥感', '地图制图学与地理信息工程', '化学工程与技术', '化学工程', '化学工艺', '生物化工', '应用化学', '工业催化', '地质资源与地质工程', '矿产普查与勘探', '地球探测与信息技术', '地质工程', '矿业工程', '采矿工程', '矿物加工工程', '安全技术及工程', '石油与天然气工程', '油气井工程', '油气田开发工程', '油气储运工程', '纺织科学与工程', '纺织工程', '纺织材料与纺织品设计', '纺织化学与染整工程', '服装设计与工程', '轻工技术与工程', '制浆造纸工程', '制糖工程', '发酵工程', '皮革化学与工程', '交通运输工程', '道路与铁道工程', '交通信息工程及控制', '交通运输规划与管理', '载运工具运用工程', '船舶与海洋工程', '船舶与海洋结构物设计制造', '轮机工程', '水声工程', '航空宇航科学与技术', '飞行器设计', '航空宇航推进理论与工程', '航空宇航制造工程', '人机与环境工程', '兵器科学与技术', '武器系统与运用工程', '兵器发射理论与技术', '火炮自动武器与弹药工程', '军事化学与烟火技术', '核科学与技术', '核能科学与工程', '核燃料循环与材料', '核技术及应用', '辐射防护及环境保护', '农业工程', '农业机械化工程', '农业水土工程', '农业生物环境与能源工程', '农业电气化与自动化', '林业工程', '森林工程', '木材科学与技术', '林产化学加工工程', '环境科学与工程', '环境科学', '环境工程', '生物医学工程', '食品科学与工程', '食品科学', '粮食油脂及植物蛋白工程', '农产品加工及贮藏工程', '水产品加工及贮藏工程', '城乡规划学', '风景园林学', '软件工程', '生物工程', '安全科学与工程', '公安技术', '网络空间安全', '智能科学与技术', '机器人工程', '物联网工程', '大数据技术与工程']
  },
  {
    name: '农学',
    subcategories: ['作物学', '作物栽培学与耕作学', '作物遗传育种', '园艺学', '果树学', '蔬菜学', '茶学', '农业资源与环境', '土壤学', '植物营养学', '植物保护', '植物病理学', '农业昆虫与害虫防治', '农药学', '畜牧学', '动物遗传育种与繁殖', '动物营养与饲料科学', '草业科学', '特种经济动物饲养', '兽医学', '基础兽医学', '预防兽医学', '临床兽医学', '林学', '林木遗传育种', '森林培育', '森林保护学', '森林经理学', '野生动植物保护与利用', '园林植物与观赏园艺', '水土保持与荒漠化防治', '水产', '水产养殖', '捕捞学', '渔业资源', '草学']
  },
  {
    name: '医学',
    subcategories: ['基础医学', '人体解剖与组织胚胎学', '免疫学', '病原生物学', '病理学与病理生理学', '法医学', '放射医学', '临床医学', '内科学', '儿科学', '老年医学', '神经病学', '精神病与精神卫生学', '皮肤病与性病学', '影像医学与核医学', '临床检验诊断学', '外科学', '妇产科学', '眼科学', '耳鼻咽喉科学', '肿瘤学', '康复医学与理疗学', '运动医学', '麻醉学', '急诊医学', '口腔医学', '口腔基础医学', '口腔临床医学', '公共卫生与预防医学', '流行病与卫生统计学', '劳动卫生与环境卫生学', '营养与食品卫生学', '儿少卫生与妇幼保健学', '卫生毒理学', '军事预防医学', '中医学', '中医基础理论', '中医临床基础', '中医医史文献', '方剂学', '中医诊断学', '中医内科学', '中医外科学', '中医骨伤科学', '中医妇科学', '中医儿科学', '中医五官科学', '针灸推拿学', '中西医结合', '中西医结合基础', '中西医结合临床', '药学', '药物化学', '药剂学', '生药学', '药物分析学', '微生物与生化药学', '药理学', '中药学', '特种医学', '医学技术', '护理学']
  },
  {
    name: '人文社科',
    subcategories: ['哲学', '马克思主义哲学', '中国哲学', '外国哲学', '逻辑学', '伦理学', '美学', '宗教学', '科学技术哲学', '理论经济学', '政治经济学', '经济思想史', '经济史', '西方经济学', '世界经济', '人口资源与环境经济学', '应用经济学', '国民经济学', '区域经济学', '财政学', '金融学', '产业经济学', '国际贸易学', '劳动经济学', '统计学', '数量经济学', '国防经济', '法学', '法学理论', '法律史', '宪法学与行政法学', '刑法学', '民商法学', '诉讼法学', '经济法学', '环境与资源保护法学', '国际法学', '军事法学', '政治学', '政治学理论', '中外政治制度', '科学社会主义与国际共产主义运动', '中共党史', '国际政治', '国际关系', '外交学', '社会学', '社会学', '人口学', '人类学', '民俗学', '民族学', '民族学', '马克思主义民族理论与政策', '中国少数民族经济', '中国少数民族史', '中国少数民族艺术', '马克思主义理论', '马克思主义基本原理', '马克思主义发展史', '马克思主义中国化研究', '国外马克思主义研究', '思想政治教育', '中国近现代史基本问题研究', '教育学', '教育学原理', '课程与教学论', '教育史', '比较教育学', '学前教育学', '高等教育学', '成人教育学', '职业技术教育学', '特殊教育学', '教育技术学', '心理学', '基础心理学', '发展与教育心理学', '应用心理学', '体育学', '体育人文社会学', '运动人体科学', '体育教育训练学', '民族传统体育学', '中国语言文学', '文艺学', '语言学及应用语言学', '汉语言文字学', '中国古典文献学', '中国古代文学', '中国现当代文学', '中国少数民族语言文学', '比较文学与世界文学', '外国语言文学', '英语语言文学', '俄语语言文学', '法语语言文学', '德语语言文学', '日语语言文学', '印度语言文学', '西班牙语语言文学', '阿拉伯语语言文学', '欧洲语言文学', '亚非语言文学', '外国语言学及应用语言学', '新闻传播学', '新闻学', '传播学', '考古学', '中国史', '世界史']
  },
  {
    name: '管理学',
    subcategories: ['管理科学与工程', '工商管理', '会计学', '企业管理', '旅游管理', '技术经济及管理', '农林经济管理', '农业经济管理', '林业经济管理', '公共管理', '行政管理', '社会医学与卫生事业管理', '教育经济与管理', '社会保障', '土地资源管理', '图书情报与档案管理', '图书馆学', '情报学', '档案学']
  },
  {
    name: '艺术学',
    subcategories: ['艺术学理论', '音乐与舞蹈学', '戏剧与影视学', '美术学', '设计学', '艺术设计', '视觉传达设计', '环境设计', '产品设计', '服装与服饰设计', '数字媒体艺术']
  },
  {
    name: '交叉学科',
    subcategories: ['集成电路科学与工程', '国家安全学', '智能科学与技术', '纳米科学与工程', '数据科学', '人工智能', '遥感科学与技术', '生物信息学', '金融科技', '智能制造工程', '智慧农业', '量子信息科学', '脑科学', '合成生物学', '碳中和科学与工程']
  }
];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('最新');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [hoveredCategory, setHoveredCategory] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useContext(AuthContext);

  useEffect(() => {
    if (!isAuthenticated) {
      setHistoryItems([]);
      setHistoryOpen(false);
      return;
    }

    fetchSearchHistory()
      .then((items) => setHistoryItems(items.slice(0, 8)))
      .catch(() => setHistoryItems([]));
  }, [isAuthenticated]);

  const filteredHistory = useMemo(() => {
    const keyword = searchQuery.trim().toLowerCase();
    if (!keyword) return historyItems;
    return historyItems.filter((item) => item.query.toLowerCase().includes(keyword));
  }, [historyItems, searchQuery]);

  const navigateToSearch = (query: string) => {
    const cleaned = query.trim();
    if (!cleaned) return;

    const encodedQuery = encodeURIComponent(cleaned);
    setHistoryOpen(false);

    if (!isAuthenticated) {
      navigate(`/login?redirect=${encodeURIComponent(`/search?query=${encodedQuery}`)}`);
      return;
    }

    navigate(`/search?query=${encodedQuery}`);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    navigateToSearch(searchQuery);
  };

  const handleHistorySelect = (query: string) => {
    setSearchQuery(query);
    navigateToSearch(query);
  };

  // 根据标签筛选内容
  const filteredContent = useMemo(() => {
    if (activeTab === '分类' && selectedCategory) {
      return FEED_CONTENT.filter(item => item.tags.includes(selectedCategory));
    }
    return FEED_CONTENT;
  }, [activeTab, selectedCategory]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-16 flex flex-col justify-start">
        <div className="text-center py-12 -mt-12">
          <motion.h1
            className="text-3xl font-bold text-gray-800 mb-4"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Deep Research
          </motion.h1>
          <motion.p
            className="text-gray-600 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            深度研究助手，帮助您快速获取学术文献和研究资料。
          </motion.p>
        </div>

        <div className="mb-12 w-full max-w-7xl mx-auto">
          <motion.div
            className="relative"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <form onSubmit={handleSearch} className="flex shadow-md rounded-lg overflow-hidden">
              <input
                type="text"
                placeholder="输入关键词搜索..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onFocus={() => setHistoryOpen(true)}
                onBlur={() => {
                  window.setTimeout(() => setHistoryOpen(false), 120);
                }}
                className="flex-1 px-4 py-3 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                搜索
              </button>
            </form>

            {isAuthenticated && historyOpen && filteredHistory.length > 0 ? (
              <div className="absolute left-0 right-0 top-full mt-2 z-30 rounded-lg border border-gray-200 bg-white shadow-lg">
                <div className="px-4 py-3 border-b border-gray-100 text-sm font-medium text-gray-700">
                  搜索历史
                </div>
                <div className="py-2">
                  {filteredHistory.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onMouseDown={(e) => {
                        e.preventDefault();
                        handleHistorySelect(item.query);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      {item.query}
                    </button>
                  ))}
                </div>
              </div>
            ) : null}
          </motion.div>

          <div className="mt-4 text-center">
            <p className="text-gray-500 text-sm">需要个性化您的使用体验？</p>
            <Link to="/preferences" className="mt-2 inline-block text-blue-600 hover:text-blue-800 transition-colors text-sm">
              前往偏好设置
            </Link>
          </div>

          <div className="mt-1">
            <h3 className="text-sm font-medium text-gray-600 mb-3 text-left">热门搜索：</h3>
            <div className="flex flex-wrap gap-2">
              {HOT_TOPICS.map((tag) => (
                <button
                  key={tag}
                  className="px-3 py-1 text-xs bg-gray-100 text-gray-700 rounded-full hover:bg-gray-200 transition-colors"
                  onClick={() => {
                    setSearchQuery(tag);
                    navigateToSearch(tag);
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* 每日推送板块 - 整体大框 */}
          <div className="mt-16 border border-gray-200 bg-white">
            {/* 板块标题 */}
            <div className="px-6 py-3 border-b border-gray-200 bg-gray-50">
              <h2 className="text-lg font-semibold text-gray-800">每日推送</h2>
              <p className="text-xs text-gray-500 mt-1">为您精选最新学术动态与研究成果</p>
            </div>

            {/* 选项板块 */}
            <div className="flex items-center border-b border-gray-200">
              <div className="px-6 py-3 bg-gray-50 border-r border-gray-200">
                <span className="text-sm font-medium text-gray-600">筛选方式</span>
              </div>
              <div className="flex flex-1">
                <button
                  onClick={() => {
                    setActiveTab('最热');
                    setSelectedCategory('');
                    setShowCategoryDropdown(false);
                    setHoveredCategory(null);
                  }}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === '最热'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  热门推荐
                </button>
                <button
                  onClick={() => {
                    setActiveTab('最新');
                    setSelectedCategory('');
                    setShowCategoryDropdown(false);
                    setHoveredCategory(null);
                  }}
                  className={`px-6 py-3 text-sm font-medium transition-colors ${
                    activeTab === '最新'
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                      : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                  }`}
                >
                  最新发布
                </button>
                <div className="relative">
                  <button
                    onClick={() => {
                      setShowCategoryDropdown(!showCategoryDropdown);
                      if (!showCategoryDropdown) {
                        setHoveredCategory(null);
                      }
                    }}
                    className={`px-6 py-3 text-sm font-medium transition-colors ${
                      activeTab === '分类'
                        ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50'
                        : 'text-gray-600 hover:text-gray-800 hover:bg-gray-50'
                    }`}
                  >
                    学科分类 ▼
                  </button>
                  {showCategoryDropdown && (
                    <div 
                      className="absolute left-0 top-full mt-0 z-20 w-[800px] bg-white border border-gray-200 shadow-lg"
                      onMouseLeave={() => setHoveredCategory(null)}
                    >
                      <div className="flex h-[500px]">
                        {/* 左侧大类列表 */}
                        <div className="w-1/4 border-r border-gray-200 overflow-y-auto">
                          {CATEGORY_STRUCTURE.map((category) => (
                            <div
                              key={category.name}
                              className={`px-3 py-2 text-sm cursor-pointer transition-colors ${
                                hoveredCategory === category.name
                                  ? 'bg-blue-50 text-blue-600'
                                  : 'text-gray-700 hover:bg-gray-50'
                              }`}
                              onMouseEnter={() => setHoveredCategory(category.name)}
                            >
                              {category.name}
                            </div>
                          ))}
                        </div>
                        
                        {/* 右侧细分专业列表 */}
                        <div className="w-3/4 overflow-y-auto">
                          {hoveredCategory ? (
                            <div className="p-3">
                              <div className="grid grid-cols-2 gap-1">
                                {CATEGORY_STRUCTURE.find(c => c.name === hoveredCategory)?.subcategories.map((sub) => (
                                  <button
                                    key={sub}
                                    onClick={() => {
                                      setActiveTab('分类');
                                      setSelectedCategory(sub);
                                      setShowCategoryDropdown(false);
                                      setHoveredCategory(null);
                                    }}
                                    className={`w-full px-3 py-2 text-left text-sm transition-colors rounded ${
                                      selectedCategory === sub
                                        ? 'bg-blue-50 text-blue-600'
                                        : 'text-gray-700 hover:bg-gray-50'
                                    }`}
                                  >
                                    {sub}
                                  </button>
                                ))}
                              </div>
                            </div>
                          ) : (
                            <div className="flex items-center justify-center h-full text-sm text-gray-400">
                              请选择学科大类
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* 内容推送 */}
            <div className="p-6">
              <h3 className="text-base font-medium text-gray-700 mb-4">
                {activeTab === '分类' && selectedCategory 
                  ? `${selectedCategory}领域最新内容` 
                  : activeTab === '最新' 
                    ? '最新发布内容' 
                    : '热门推荐内容'}
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredContent.map((item) => (
                  <div
                    key={item.id}
                    className="border border-gray-200 hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => {
                      if (item.type === 'article') {
                        alert(`查看全文: ${item.title}\n\n完整内容将在后续版本中提供。`);
                      } else {
                        alert(`查看论文: ${item.title}\n\narXiv ID: ${item.arxivId}\n完整内容将在后续版本中提供。`);
                      }
                    }}
                  >
                    <div className="p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <span className={`text-xs px-2 py-0.5 ${
                            item.type === 'article' 
                              ? 'bg-blue-50 text-blue-600' 
                              : 'bg-green-50 text-green-600'
                          }`}>
                            {item.source}
                          </span>
                          <h4 className="text-base font-semibold text-gray-800 line-clamp-1 flex-1">
                            {item.title}
                          </h4>
                        </div>
                        <span className="text-xs text-gray-500">{item.date}</span>
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-3 mb-3">
                        {item.summary}
                      </p>
                      {item.type === 'paper' && (
                        <p className="text-xs text-gray-500 mb-2">
                          {item.authors} • {item.journal}
                        </p>
                      )}
                      <div className="flex flex-wrap gap-2">
                        {item.tags.map((tag) => (
                          <span
                            key={tag}
                            className="px-2 py-1 text-xs bg-gray-100 text-gray-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* 底部提示 */}
            <div className="px-6 py-4 border-t border-gray-200 bg-gray-50">
              <p className="text-sm text-gray-400 text-center">—— 已经到最底部了哦 ——</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}