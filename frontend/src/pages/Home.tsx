import { useContext, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '../components/Navbar';
import { AuthContext } from '../contexts/authContext';
import { fetchSearchHistory, type HistoryItem } from '../lib/api';

const HOT_TOPICS = ['人工智能', '气候变化', '区块链应用', '基因编辑', '量子计算'];

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [historyItems, setHistoryItems] = useState<HistoryItem[]>([]);
  const [historyOpen, setHistoryOpen] = useState(false);
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

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 container mx-auto px-4 py-16 flex flex-col justify-between">
        <div className="text-center py-8">
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

        <div className="mb-12 w-full max-w-3xl mx-auto">
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
            <p className="text-gray-500">需要个性化您的使用体验？</p>
            <Link to="/preferences" className="mt-2 inline-block text-blue-600 hover:text-blue-800 transition-colors">
              前往偏好设置
            </Link>
          </div>

          <div className="mt-8">
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
        </div>
      </div>
    </div>
  );
}
