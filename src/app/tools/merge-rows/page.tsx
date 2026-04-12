'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function MergeRowsPage() {
  const [inputText, setInputText] = useState('');
  const [separator, setSeparator] = useState(', ');
  const [trimSpace, setTrimSpace] = useState(true);
  const [removeEmpty, setRemoveEmpty] = useState(true);
  const [outputText, setOutputText] = useState('');
  const [mergeMode, setMergeMode] = useState<'lines' | 'cols'>('lines');

  const executeMerge = () => {
    if (!inputText) {
      alert('请输入要合并的文本');
      return;
    }

    if (mergeMode === 'lines') {
      let lines = inputText.split('\n');
      if (trimSpace) lines = lines.map(l => l.trim());
      if (removeEmpty) lines = lines.filter(l => l.length > 0);
      setOutputText(lines.join(separator));
    } else {
      const rows = inputText.trim().split('\n').map(row => row.split(','));
      if (rows.length > 0) {
        const maxCols = Math.max(...rows.map(r => r.length));
        const merged: string[] = [];
        for (let i = 0; i < maxCols; i++) {
          const colValues = rows.map(r => r[i]?.trim() || '').filter(v => removeEmpty ? v.length > 0 : true);
          if (colValues.length > 0) {
            merged.push(colValues.join(separator));
          }
        }
        setOutputText(merged.join('\n'));
      }
    }
  };

  const copyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      alert('已复制到剪贴板');
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged.txt';
    link.click();
    URL.revokeObjectURL(url);
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
          <Link href="/tools?category=文本处理" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文本处理
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">行合并</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4 mb-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">合并模式:</label>
              <select
                value={mergeMode}
                onChange={(e) => setMergeMode(e.target.value as 'lines' | 'cols')}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="lines">按行合并（纵向）</option>
                <option value="cols">按列合并（横向）</option>
              </select>
            </div>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">分隔符:</label>
              <input
                type="text"
                value={separator}
                onChange={(e) => setSeparator(e.target.value)}
                className="border border-gray-300 rounded px-3 py-2 text-sm w-24"
                placeholder=", "
              />
            </div>
          </div>
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={trimSpace}
                onChange={(e) => setTrimSpace(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">去除首尾空格</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={removeEmpty}
                onChange={(e) => setRemoveEmpty(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">移除空行</span>
            </label>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">输入文本（每行一项）</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入要合并的文本，每行一项..."
              className="w-full h-64 p-3 border border-gray-300 rounded text-sm font-mono resize-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">输出结果</label>
              <div className="flex gap-2">
                <button onClick={copyOutput} disabled={!outputText} className="text-sm text-blue-600 hover:underline disabled:opacity-50">复制</button>
                <button onClick={downloadOutput} disabled={!outputText} className="text-sm text-blue-600 hover:underline disabled:opacity-50">下载</button>
              </div>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="合并结果..."
              className="w-full h-64 p-3 border border-gray-200 rounded text-sm font-mono bg-gray-50 resize-none"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={executeMerge}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            执行合并
          </button>
        </div>
      </div>
    </div>
  );
}