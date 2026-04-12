'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function TimestampPage() {
  const [timestamp, setTimestamp] = useState('');
  const [datetime, setDatetime] = useState('');
  const [result, setResult] = useState<string | null>(null);
  const [currentTimestamp, setCurrentTimestamp] = useState(Math.floor(Date.now() / 1000));

  React.useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTimestamp(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const timestampToDatetime = () => {
    if (!timestamp.trim()) {
      alert('请输入时间戳');
      return;
    }
    try {
      let ts = parseInt(timestamp);
      if (ts < 10000000000) ts *= 1000;
      const date = new Date(ts);
      setResult(date.toLocaleString('zh-CN'));
      setDatetime(date.toISOString().replace('T', ' ').split('.')[0]);
    } catch (error) {
      alert('无效的时间戳');
    }
  };

  const datetimeToTimestamp = () => {
    if (!datetime.trim()) {
      alert('请输入日期时间');
      return;
    }
    try {
      const date = new Date(datetime);
      const ts = Math.floor(date.getTime() / 1000);
      setResult(`时间戳: ${ts} (秒) / ${ts * 1000} (毫秒)`);
      setTimestamp(String(ts));
    } catch (error) {
      alert('无效的日期时间格式');
    }
  };

  const nowToTimestamp = () => {
    const ts = Math.floor(Date.now() / 1000);
    setTimestamp(String(ts));
    setResult(`当前时间戳: ${ts}`);
  };

  const getTodayRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0);
    const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59);
    setResult(`今日: ${Math.floor(start.getTime() / 1000)} - ${Math.floor(end.getTime() / 1000)}`);
  };

  const getMonthRange = () => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth(), 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    setResult(`本月: ${Math.floor(start.getTime() / 1000)} - ${Math.floor(end.getTime() / 1000)}`);
  };

  const formatTimestamp = (ts: number) => {
    const date = new Date(ts * 1000);
    return date.toLocaleString('zh-CN');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <span className="text-white font-bold text-xl">F</span>
              </div>
              <h1 className="text-xl font-bold text-gray-800">Flow Mate</h1>
            </Link>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">首页</Link>
            <Link href="/tools" className="text-gray-700 hover:text-blue-600 font-medium">工具</Link>
            <Link href="/tutorial" className="text-gray-700 hover:text-blue-600 font-medium">教程</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">关于</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/tools?category=编码转换" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回工具列表
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">时间戳转换</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">当前时间戳 (秒)</p>
              <p className="text-2xl font-mono text-gray-800">{currentTimestamp}</p>
            </div>
            <p className="text-sm text-gray-500">{formatTimestamp(currentTimestamp)}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-800 mb-4">时间戳 → 日期时间</h3>
            <input
              type="text"
              value={timestamp}
              onChange={(e) => setTimestamp(e.target.value)}
              placeholder="输入时间戳（如：1704067200）"
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button onClick={timestampToDatetime} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                转换
              </button>
              <button onClick={nowToTimestamp} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                当前时间
              </button>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-medium text-gray-800 mb-4">日期时间 → 时间戳</h3>
            <input
              type="datetime-local"
              value={datetime}
              onChange={(e) => setDatetime(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 text-sm mb-4"
            />
            <div className="flex gap-2">
              <button onClick={datetimeToTimestamp} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                转换
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <h3 className="font-medium text-gray-800 mb-4">快捷获取</h3>
          <div className="flex flex-wrap gap-2">
            <button onClick={getTodayRange} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              今日范围
            </button>
            <button onClick={getMonthRange} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              本月范围
            </button>
          </div>
        </div>

        {result && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-blue-800 font-medium">{result}</p>
          </div>
        )}

        <div className="mt-8 bg-white rounded-lg shadow p-6">
          <h3 className="font-medium text-gray-800 mb-4">常用时间戳参考</h3>
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left text-gray-500">时间</th>
                  <th className="px-4 py-2 text-left text-gray-500">时间戳 (秒)</th>
                  <th className="px-4 py-2 text-left text-gray-500">时间戳 (毫秒)</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t">
                  <td className="px-4 py-2">2024-01-01 00:00:00</td>
                  <td className="px-4 py-2 font-mono">1704038400</td>
                  <td className="px-4 py-2 font-mono">1704038400000</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">2024-06-01 00:00:00</td>
                  <td className="px-4 py-2 font-mono">1717200000</td>
                  <td className="px-4 py-2 font-mono">1717200000000</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">2025-01-01 00:00:00</td>
                  <td className="px-4 py-2 font-mono">1735689600</td>
                  <td className="px-4 py-2 font-mono">1735689600000</td>
                </tr>
                <tr className="border-t">
                  <td className="px-4 py-2">2030-01-01 00:00:00</td>
                  <td className="px-4 py-2 font-mono">1893456000</td>
                  <td className="px-4 py-2 font-mono">1893456000000</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}