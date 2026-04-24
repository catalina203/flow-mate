'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function Base64Page() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [mode, setMode] = useState<'text' | 'file'>('text');

  const handleEncode = () => {
    try {
      const encoded = btoa(unescape(encodeURIComponent(input)));
      setOutput(encoded);
    } catch (e) {
      setOutput('编码失败');
    }
  };

  const handleDecode = () => {
    try {
      const decoded = decodeURIComponent(escape(atob(input)));
      setOutput(decoded);
    } catch (e) {
      setOutput('解码失败: 输入不是有效的 Base64');
    }
  };

  const handleFileEncode = async () => {
    try {
      const fileInput = document.createElement('input');
      fileInput.type = 'file';
      fileInput.click();
      fileInput.onchange = async (e: any) => {
        const file = e.target.files[0];
        if (!file) return;
        
        const buffer = await file.arrayBuffer();
        const bytes = Array.from(new Uint8Array(buffer));
        const base64 = btoa(String.fromCharCode(...bytes));
        setInput(file.name);
        setOutput(base64);
      };
    } catch (e) {
      setOutput('文件编码失败');
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(output);
  };

  const swapValues = () => {
    setInput(output);
    setOutput(input);
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
        <div className="mb-6 flex items-center justify-between">
          <Link href="/tools?category=编码转换" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回编码转换
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">Base64 编码</h2>

        <div className="flex gap-2 mb-4">
          <button
            onClick={() => setMode('text')}
            className={`px-4 py-2 rounded-lg ${mode === 'text' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            文本模式
          </button>
          <button
            onClick={() => setMode('file')}
            className={`px-4 py-2 rounded-lg ${mode === 'file' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
          >
            文件模式
          </button>
        </div>

        {mode === 'text' ? (
          <>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
                <textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                  placeholder="输入要编码/解码的文本"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">输出结果</label>
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-64 p-4 border rounded-lg bg-gray-50 font-mono text-sm"
                  placeholder="结果将显示在这里"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                onClick={handleEncode}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Base64 编码
              </button>
              <button
                onClick={handleDecode}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Base64 解码
              </button>
              <button
                onClick={swapValues}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
              >
                交换
              </button>
              <button
                onClick={copyToClipboard}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
              >
                复制结果
              </button>
            </div>
          </>
        ) : (
          <div className="mt-4">
            <button
              onClick={handleFileEncode}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              选择文件进行 Base64 编码
            </button>
            {output && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Base64 结果 (可复制)</label>
                <textarea
                  value={output}
                  readOnly
                  className="w-full h-64 p-4 border rounded-lg bg-gray-50 font-mono text-sm"
                />
              </div>
            )}
          </div>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">说明</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• Base64 常用于在 JSON、XML 中传输二进制数据</p>
            <p>• 文件模式可将图片等文件转为 Base64 字符串</p>
            <p>• 例如: <code>Hello</code> → <code>SGVsbG8=</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}