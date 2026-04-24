'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function UuidPage() {
  const [count, setCount] = useState(5);
  const [uuids, setUuids] = useState<string[]>([]);
  const [version, setVersion] = useState<'v4' | 'v7'>('v4');

  const generateUuid = (): string => {
    if (version === 'v7') {
      const timestamp = Date.now();
      const timeHigh = (timestamp & 0xffffffff) >>> 0;
      const timeMid = ((timestamp >> 32) & 0xffff) | 0x7000;
      const timeLow = ((timestamp >> 48) & 0x3fff) | 0x8000;
      
      const random12 = new Uint8Array(10);
      crypto.getRandomValues(random12);
      
      const hex = Array.from(random12).map(b => b.toString(16).padStart(2, '0')).join('');
      return `${timeHigh.toString(16).padStart(8, '0')}-${timeMid.toString(16).padStart(4, '0')}-${timeLow.toString(16).padStart(4, '0')}-${hex.substring(0, 4)}-${hex.substring(4)}`;
    }
    
    const random16 = new Uint8Array(16);
    crypto.getRandomValues(random16);
    random16[6] = (random16[6] & 0x0f) | 0x40;
    random16[8] = (random16[8] & 0x3f) | 0x80;
    
    const hex = Array.from(random16).map(b => b.toString(16).padStart(2, '0')).join('');
    return `${hex.substring(0, 8)}-${hex.substring(8, 12)}-${hex.substring(12, 16)}-${hex.substring(16, 20)}-${hex.substring(20)}`;
  };

  const handleGenerate = () => {
    const newUuids: string[] = [];
    for (let i = 0; i < count; i++) {
      newUuids.push(generateUuid());
    }
    setUuids(newUuids);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  const copyAll = () => {
    navigator.clipboard.writeText(uuids.join('\n'));
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

        <h2 className="text-2xl font-bold mb-6">UUID 生成</h2>

        <div className="flex flex-wrap gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">数量</label>
            <input
              type="number"
              min="1"
              max="100"
              value={count}
              onChange={(e) => setCount(parseInt(e.target.value) || 1)}
              className="w-24 p-2 border rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">版本</label>
            <div className="flex gap-2">
              <button
                onClick={() => setVersion('v4')}
                className={`px-4 py-2 rounded-lg ${version === 'v4' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                UUID v4
              </button>
              <button
                onClick={() => setVersion('v7')}
                className={`px-4 py-2 rounded-lg ${version === 'v7' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'}`}
              >
                UUID v7
              </button>
            </div>
          </div>
        </div>

        <button
          onClick={handleGenerate}
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          生成 UUID
        </button>

        {uuids.length > 0 && (
          <>
            <div className="mt-4 flex gap-2">
              <button
                onClick={copyAll}
                className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 text-sm"
              >
                复制全部
              </button>
              <button
                onClick={handleGenerate}
                className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 text-sm"
              >
                重新生成
              </button>
            </div>

            <div className="mt-4 bg-white rounded-lg shadow border overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700 w-16">序号</th>
                    <th className="px-4 py-2 text-left text-sm font-medium text-gray-700">UUID</th>
                    <th className="px-4 py-2 text-right text-sm font-medium text-gray-700 w-20">操作</th>
                  </tr>
                </thead>
                <tbody>
                  {uuids.map((uuid, index) => (
                    <tr key={index} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-600">{index + 1}</td>
                      <td className="px-4 py-2 font-mono text-sm">{uuid}</td>
                      <td className="px-4 py-2 text-right">
                        <button
                          onClick={() => copyToClipboard(uuid)}
                          className="text-blue-600 hover:underline text-sm"
                        >
                          复制
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        <div className="mt-8 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">说明</h4>
          <div className="text-sm text-blue-700 space-y-2">
            <p>• <strong>UUID v4</strong> - 完全随机生成，不包含时间信息</p>
            <p>• <strong>UUID v7</strong> - 包含时间戳，按时间有序，适合数据库主键</p>
            <p>• UUID 格式: <code>xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx</code></p>
          </div>
        </div>
      </div>
    </div>
  );
}