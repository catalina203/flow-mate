'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function BatchReplacePage() {
  const [inputText, setInputText] = useState('');
  const [replacements, setReplacements] = useState<{ find: string; replace: string }[]>([
    { find: '', replace: '' }
  ]);
  const [outputText, setOutputText] = useState('');
  const [isRegex, setIsRegex] = useState(false);
  const [caseSensitive, setCaseSensitive] = useState(true);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const addReplacement = () => {
    setReplacements([...replacements, { find: '', replace: '' }]);
  };

  const removeReplacement = (index: number) => {
    setReplacements(replacements.filter((_, i) => i !== index));
  };

  const updateReplacement = (index: number, field: 'find' | 'replace', value: string) => {
    const newReplacements = [...replacements];
    newReplacements[index][field] = value;
    setReplacements(newReplacements);
  };

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
      f.type.startsWith('text/') || f.name.endsWith('.txt') || f.name.endsWith('.log')
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

  const executeReplace = () => {
    if (!inputText) {
      alert('请输入要处理的文本');
      return;
    }

    let result = inputText;

    for (const { find, replace } of replacements) {
      if (!find) continue;

      if (isRegex) {
        try {
          const flags = caseSensitive ? 'g' : 'gi';
          const regex = new RegExp(find, flags);
          result = result.replace(regex, replace);
        } catch (e) {
          alert(`正则表达式错误: ${find}`);
          return;
        }
      } else {
        if (caseSensitive) {
          result = result.split(find).join(replace);
        } else {
          const regex = new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
          result = result.replace(regex, replace);
        }
      }
    }

    setOutputText(result);
  };

  const copyToClipboard = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      alert('已复制到剪贴板');
    }
  };

  const downloadText = () => {
    if (!outputText) return;
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'replaced.txt';
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

        <h2 className="text-2xl font-bold mb-6">批量替换</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={isRegex}
                onChange={(e) => setIsRegex(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">使用正则表达式</span>
            </label>
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={caseSensitive}
                onChange={(e) => setCaseSensitive(e.target.checked)}
                className="mr-2"
              />
              <span className="text-sm">区分大小写</span>
            </label>
          </div>
        </div>

        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <label className="font-medium text-gray-700">替换规则</label>
            <button
              onClick={addReplacement}
              className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
            >
              + 添加规则
            </button>
          </div>
          <div className="space-y-2">
            {replacements.map((rule, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <input
                  type="text"
                  value={rule.find}
                  onChange={(e) => updateReplacement(idx, 'find', e.target.value)}
                  placeholder={isRegex ? '正则表达式' : '查找内容'}
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                <span className="text-gray-400">→</span>
                <input
                  type="text"
                  value={rule.replace}
                  onChange={(e) => updateReplacement(idx, 'replace', e.target.value)}
                  placeholder="替换为"
                  className="flex-1 border border-gray-300 rounded px-3 py-2 text-sm"
                />
                {replacements.length > 1 && (
                  <button
                    onClick={() => removeReplacement(idx)}
                    className="text-red-500 hover:text-red-700"
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
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
                accept=".txt,.log,.md,.json,.xml,.csv"
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
                placeholder="输入或拖放文本文件到此处..."
                className="w-full h-64 p-3 border border-gray-200 rounded text-sm font-mono resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">输出结果</label>
              <div className="flex gap-2">
                <button
                  onClick={copyToClipboard}
                  disabled={!outputText}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  复制
                </button>
                <button
                  onClick={downloadText}
                  disabled={!outputText}
                  className="text-sm text-blue-600 hover:underline disabled:opacity-50"
                >
                  下载
                </button>
              </div>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="替换结果将显示在这里..."
              className="w-full h-64 p-3 border border-gray-200 rounded text-sm font-mono bg-gray-50 resize-none"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={executeReplace}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            执行替换
          </button>
        </div>
      </div>
    </div>
  );
}