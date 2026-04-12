'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface Keyword {
  word: string;
  count: number;
  percentage: number;
}

export default function KeywordsPage() {
  const [inputText, setInputText] = useState('');
  const [keywords, setKeywords] = useState<Keyword[]>([]);
  const [minLength, setMinLength] = useState(2);
  const [maxKeywords, setMaxKeywords] = useState(20);
  const [excludeWords, setExcludeWords] = useState('的,了,在,是,我,有,和,就,不,人,这,中,大,为,上,个,国,说,要,会,时,子,用,出,来,们,为,得,着,下,过,发,后,然,加,小,么,之,道,山,知,去,行,过,里,会,可,她,因,日,那,得,此,生,自,法,民,能,还,此,所,本,去,文');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('text/') || f.name.endsWith('.txt') || f.name.endsWith('.log') || f.name.endsWith('.md')
    );
    if (droppedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setInputText(event.target.result as string);
        }
      };
      reader.readAsText(droppedFiles[0]);
    }
  };

  const extractKeywords = () => {
    if (!inputText) {
      alert('请输入要分析的文本');
      return;
    }

    const text = inputText.toLowerCase();
    const words = text.split(/[\s,\.\!\?\;\:\(\)\[\]\{\}\"\'\<\>\/\\]+/).filter(w => w.length >= minLength);
    const totalWords = words.length;

    const excludeSet = new Set(excludeWords.split(',').map(w => w.trim().toLowerCase()));
    const wordCount: Record<string, number> = {};

    for (const word of words) {
      if (excludeSet.has(word)) continue;
      wordCount[word] = (wordCount[word] || 0) + 1;
    }

    const sorted = Object.entries(wordCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, maxKeywords)
      .map(([word, count]) => ({
        word,
        count,
        percentage: Math.round((count / totalWords) * 100 * 100) / 100
      }));

    setKeywords(sorted);
  };

  const downloadKeywords = () => {
    if (keywords.length === 0) return;

    const content = keywords.map(k => `${k.word}\t${k.count}\t${k.percentage}%`).join('\n');
    const header = '关键词\t出现次数\t占比\n';
    
    const blob = new Blob([header + content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'keywords.txt';
    link.click();
    URL.revokeObjectURL(url);
  };

  const copyToClipboard = () => {
    const content = keywords.map(k => `${k.word} (${k.count}, ${k.percentage}%)`).join('\n');
    navigator.clipboard.writeText(content);
    alert('已复制到剪贴板');
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

        <h2 className="text-2xl font-bold mb-6">关键词提取</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最小词长</label>
              <input
                type="number"
                value={minLength}
                onChange={(e) => setMinLength(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                min="1"
                max="10"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">提取关键词数</label>
              <input
                type="number"
                value={maxKeywords}
                onChange={(e) => setMaxKeywords(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                min="5"
                max="100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">排除词 (逗号分隔)</label>
              <input
                type="text"
                value={excludeWords}
                onChange={(e) => setExcludeWords(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-700">输入文本</label>
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-blue-600 hover:underline"
            >
              导入文件
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".txt,.log,.md,.json,.csv"
              className="hidden"
            />
          </div>
          <div
            className={`border-2 border-dashed rounded-lg p-4 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
          >
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="输入要分析的文本或拖放文件..."
              className="w-full h-48 p-3 border border-gray-200 rounded text-sm font-mono resize-none"
            />
          </div>
          <p className="text-sm text-gray-500 mt-1">
            当前字数：{inputText.length} 字符
          </p>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={extractKeywords}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            提取关键词
          </button>
        </div>

        {keywords.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <span className="font-medium text-gray-700">提取结果 ({keywords.length} 个关键词)</span>
              <div className="flex gap-2">
                <button onClick={copyToClipboard} className="text-sm text-blue-600 hover:underline">复制</button>
                <button onClick={downloadKeywords} className="text-sm text-blue-600 hover:underline">下载</button>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">排名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">关键词</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">出现次数</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">占比</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">频率</th>
                  </tr>
                </thead>
                <tbody>
                  {keywords.map((kw, idx) => (
                    <tr key={idx} className="border-t hover:bg-gray-50">
                      <td className="px-4 py-2 text-sm text-gray-500">{idx + 1}</td>
                      <td className="px-4 py-2 text-sm font-medium text-gray-800">{kw.word}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{kw.count}</td>
                      <td className="px-4 py-2 text-sm text-gray-600">{kw.percentage}%</td>
                      <td className="px-4 py-2">
                        <div className="w-24 bg-gray-200 rounded-full h-2">
                          <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${Math.min(kw.percentage * 5, 100)}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}