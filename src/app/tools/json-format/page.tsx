'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function JsonFormatPage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');

  const formatJson = () => {
    setError('');
    if (!input.trim()) {
      alert('请输入 JSON 内容');
      return;
    }
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj, null, 2));
    } catch (e: any) {
      setError(`JSON 格式错误: ${e.message}`);
    }
  };

  const compressJson = () => {
    setError('');
    if (!input.trim()) {
      alert('请输入 JSON 内容');
      return;
    }
    try {
      const obj = JSON.parse(input);
      setOutput(JSON.stringify(obj));
    } catch (e: any) {
      setError(`JSON 格式错误: ${e.message}`);
    }
  };

  const validateJson = () => {
    setError('');
    if (!input.trim()) {
      alert('请输入 JSON 内容');
      return;
    }
    try {
      JSON.parse(input);
      setOutput('✓ JSON 格式有效');
    } catch (e: any) {
      setError(`✗ JSON 格式无效: ${e.message}`);
    }
  };

  const sortKeys = () => {
    setError('');
    if (!input.trim()) {
      alert('请输入 JSON 内容');
      return;
    }
    try {
      const obj = JSON.parse(input);
      const sorted = sortObjectKeys(obj);
      setOutput(JSON.stringify(sorted, null, 2));
    } catch (e: any) {
      setError(`JSON 格式错误: ${e.message}`);
    }
  };

  const sortObjectKeys = (obj: any): any => {
    if (Array.isArray(obj)) {
      return obj.map(sortObjectKeys);
    }
    if (obj !== null && typeof obj === 'object') {
      return Object.keys(obj).sort().reduce((result, key) => {
        result[key] = sortObjectKeys(obj[key]);
        return result;
      }, {} as any);
    }
    return obj;
  };

  const escapeJson = () => {
    setError('');
    if (!input.trim()) {
      alert('请输入 JSON 内容');
      return;
    }
    try {
      setOutput(JSON.stringify(input));
    } catch (e: any) {
      setError(`错误: ${e.message}`);
    }
  };

  const unescapeJson = () => {
    setError('');
    try {
      const obj = JSON.parse(input);
      setOutput(obj);
    } catch (e: any) {
      setError(`错误: ${e.message}`);
    }
  };

  const copyOutput = () => {
    if (output) {
      navigator.clipboard.writeText(output);
      alert('已复制到剪贴板');
    }
  };

  const downloadOutput = () => {
    if (!output) return;
    const blob = new Blob([output], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'data.json';
    link.click();
    URL.revokeObjectURL(url);
  };

  const clearAll = () => {
    setInput('');
    setOutput('');
    setError('');
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

        <h2 className="text-2xl font-bold mb-6">JSON 格式化</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-2">
            <button onClick={formatJson} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              格式化 (美化)
            </button>
            <button onClick={compressJson} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
              压缩
            </button>
            <button onClick={validateJson} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
              验证
            </button>
            <button onClick={sortKeys} className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 text-sm">
              按键排序
            </button>
            <button onClick={escapeJson} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              转义
            </button>
            <button onClick={unescapeJson} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
              解除转义
            </button>
            <button onClick={clearAll} className="px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 text-sm ml-auto">
              清空
            </button>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">输入 JSON</label>
              <span className="text-sm text-gray-500">{input.length} 字符</span>
            </div>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder='{"name": "Flow Mate", "version": "1.0"}'
              className="w-full h-96 p-3 border border-gray-300 rounded text-sm font-mono resize-none"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">输出结果</label>
              <div className="flex gap-2">
                <button onClick={copyOutput} disabled={!output} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
                  复制
                </button>
                <button onClick={downloadOutput} disabled={!output} className="text-sm text-blue-600 hover:underline disabled:opacity-50">
                  下载
                </button>
              </div>
            </div>
            <textarea
              value={output}
              readOnly
              placeholder="结果将显示在这里..."
              className="w-full h-96 p-3 border border-gray-200 rounded text-sm font-mono bg-gray-50 resize-none"
            />
          </div>
        </div>
      </div>
    </div>
  );
}