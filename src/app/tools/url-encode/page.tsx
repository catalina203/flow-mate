'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function UrlEncodePage() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');

  const handleEncode = () => {
    try {
      setOutput(encodeURIComponent(input));
    } catch (e) {
      setOutput('编码失败');
    }
  };

  const handleDecode = () => {
    try {
      setOutput(decodeURIComponent(input));
    } catch (e) {
      setOutput('解码失败');
    }
  };

  const handleEncodeAll = () => {
    try {
      setOutput(encodeURI(input));
    } catch (e) {
      setOutput('编码失败');
    }
  };

  const handleDecodeAll = () => {
    try {
      setOutput(decodeURI(input));
    } catch (e) {
      setOutput('解码失败');
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

        <h2 className="text-2xl font-bold mb-6">URL 编码</h2>

        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              className="w-full h-64 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 font-mono text-sm"
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
            URL 编码 (encodeURIComponent)
          </button>
          <button
            onClick={handleDecode}
            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
          >
            URL 解码
          </button>
          <button
            onClick={handleEncodeAll}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            编码全部 (encodeURI)
          </button>
          <button
            onClick={handleDecodeAll}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
          >
            解码全部 (decodeURI)
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

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">说明</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• <code>encodeURIComponent</code> - 编码所有特殊字符，适合编码 URL 参数值</p>
            <p>• <code>encodeURI</code> - 保留字符 (/:@&amp;=+$,) 不编码，适合编码完整 URL</p>
            <p>• 例如: <code>你好世界</code> → <code>%E4%BD%A0%E5%A5%BD%E4%B8%96%E7%95%8C</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}