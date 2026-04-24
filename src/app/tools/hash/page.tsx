'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import CryptoJS from 'crypto-js';

export default function HashPage() {
  const [input, setInput] = useState('');
  const [results, setResults] = useState<Record<string, string>>({});

  const algorithms = ['MD5', 'SHA1', 'SHA256', 'SHA512', 'SHA3-256', 'SHA3-512', 'RIPEMD160'];

  const handleHash = () => {
    if (!input.trim()) {
      alert('请输入要加密的文本');
      return;
    }

    const newResults: Record<string, string> = {};
    
    newResults['MD5'] = CryptoJS.MD5(input).toString();
    newResults['SHA1'] = CryptoJS.SHA1(input).toString();
    newResults['SHA256'] = CryptoJS.SHA256(input).toString();
    newResults['SHA512'] = CryptoJS.SHA512(input).toString();
    newResults['SHA3-256'] = CryptoJS.SHA3(input, { outputLength: 256 }).toString();
    newResults['SHA3-512'] = CryptoJS.SHA3(input, { outputLength: 512 }).toString();
    newResults['RIPEMD160'] = CryptoJS.RIPEMD160(input).toString();
    
    setResults(newResults);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
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

        <h2 className="text-2xl font-bold mb-6">Hash 加密</h2>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">输入文本</label>
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="w-full h-32 p-4 border rounded-lg focus:ring-2 focus:ring-blue-500 font-mono text-sm"
            placeholder="输入要加密的文本"
          />
        </div>

        <button
          onClick={handleHash}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          生成 Hash
        </button>

        <div className="mt-6 grid gap-4">
          {algorithms.map(algo => (
            <div key={algo} className="bg-white p-4 rounded-lg shadow border">
              <div className="flex justify-between items-start mb-2">
                <span className="font-medium text-gray-700">{algo}</span>
                <button
                  onClick={() => copyToClipboard(results[algo] || '')}
                  className="text-sm text-blue-600 hover:underline"
                >
                  复制
                </button>
              </div>
              <code className="block text-sm font-mono text-gray-600 break-all">
                {results[algo] || '点击上方按钮生成'}
              </code>
            </div>
          ))}
        </div>

        <div className="mt-8 p-4 bg-yellow-50 rounded-lg">
          <h4 className="font-medium text-yellow-800 mb-2">注意</h4>
          <div className="text-sm text-yellow-700 space-y-2">
            <p>• Hash 是单向加密，不可解密，请牢记输入的原始文本</p>
            <p>• MD5 和 SHA1 因存在安全风险，不建议用于安全场景</p>
            <p>• SHA256 及以上算法目前被认为是安全的</p>
          </div>
        </div>
      </div>
    </div>
  );
}