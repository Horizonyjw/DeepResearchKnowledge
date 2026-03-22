import React, { useContext, useMemo, useState } from "react";
import { Navbar } from "../components/Navbar";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { AuthContext } from "../contexts/authContext";
import { applyUserPreferences, login, persistAuth, register } from "../lib/api";

type Mode = "login" | "register";
type MessageState = {
  type: "success" | "error";
  text: string;
} | null;

export default function LoginPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirectTarget = useMemo(() => searchParams.get("redirect") || "/", [searchParams]);
  const { setIsAuthenticated, setUser } = useContext(AuthContext);
  const [mode, setMode] = useState<Mode>("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<MessageState>(null);

  const validate = () => {
    if (!email || !password || (mode === "register" && !name.trim())) {
      return "请完整填写表单";
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return "请输入有效的邮箱地址";
    }

    if (password.length < 6) {
      return "密码至少需要 6 位";
    }

    return "";
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);

    const validationError = validate();
    if (validationError) {
      setMessage({ type: "error", text: validationError });
      return;
    }

    setLoading(true);

    try {
      if (mode === "register") {
        await register({ name: name.trim(), email, password, rememberMe });
        setMode("login");
        setPassword("");
        setMessage({ type: "success", text: "注册成功，请使用刚创建的账号登录" });
        return;
      }

      const response = await login({ email, password, rememberMe });
      persistAuth(response, rememberMe);
      setIsAuthenticated(true);
      setUser(response.user || null);
      applyUserPreferences(response.user?.preferences);
      setMessage({ type: "success", text: "登录成功，正在跳转..." });
      window.setTimeout(() => navigate(redirectTarget), 300);
    } catch (err: any) {
      setMessage({ type: "error", text: err?.message || "操作失败，请稍后重试" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />

      <div className="flex-1 flex items-center justify-center px-4 py-8">
        <motion.div
          className="w-full max-w-md bg-white rounded-lg shadow-md overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="p-6">
            <div className="flex rounded-md bg-gray-100 p-1 mb-6">
              <button
                type="button"
                onClick={() => {
                  setMode("login");
                  setMessage(null);
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "login" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                登录
              </button>
              <button
                type="button"
                onClick={() => {
                  setMode("register");
                  setMessage(null);
                }}
                className={`flex-1 rounded-md px-4 py-2 text-sm font-medium transition-colors ${
                  mode === "register" ? "bg-white text-gray-900 shadow-sm" : "text-gray-500"
                }`}
              >
                注册
              </button>
            </div>

            <div className="text-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">{mode === "login" ? "欢迎回来" : "创建账号"}</h2>
              <p className="text-gray-600 mt-1">
                {mode === "login" ? "请登录您的账号" : "注册后即可保存您的个性化设置"}
              </p>
            </div>

            <form onSubmit={handleAuth}>
              {mode === "register" ? (
                <div className="mb-4">
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    用户名
                  </label>
                  <input
                    type="text"
                    id="name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="请输入用户名"
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                    autoComplete="name"
                  />
                </div>
              ) : null}

              <div className="mb-4">
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  邮箱地址
                </label>
                <input
                  type="email"
                  id="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="请输入邮箱"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  autoComplete="email"
                />
              </div>

              <div className="mb-2">
                <div className="flex justify-between items-center mb-1">
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                    密码
                  </label>
                  <button
                    type="button"
                    className="text-sm text-blue-600 hover:text-blue-800 focus:outline-none"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? "隐藏" : "查看"}
                  </button>
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="请输入密码"
                  className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-700"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                />
              </div>

              <div className="min-h-8 mb-4">
                {message ? (
                  <p className={`text-sm ${message.type === "success" ? "text-green-600" : "text-red-600"}`}>
                    {message.text}
                  </p>
                ) : null}
              </div>

              <div className="flex items-center mb-6">
                <input
                  type="checkbox"
                  id="remember-me"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-700">
                  记住我
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-60"
              >
                {loading ? (mode === "login" ? "登录中..." : "注册中...") : mode === "login" ? "登录" : "注册"}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
