'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface DiffLine {
  type: 'equal' | 'add' | 'remove';
  content: string;
  lineNum: { left?: number; right?: number };
}

export default function DiffPage() {
  const [leftText, setLeftText] = useState('');
  const [rightText, setRightText] = useState('');
  const [diffResult, setDiffResult] = useState<DiffLine[]>([]);
  const [isDraggingLeft, setIsDraggingLeft] = useState(false);
  const [isDraggingRight, setIsDraggingRight] = useState(false);
  const leftFileRef = useRef<HTMLInputElement>(null);
  const rightFileRef = useRef<HTMLInputElement>(null);

  const computeDiff = () => {
    if (!leftText && !rightText) {
      alert('请输入要比较的文本');
      return;
    }

    const leftLines = leftText.split('\n');
    const rightLines = rightText.split('\n');
    const result: DiffLine[] = [];

    let i = 0, j = 0;
    
    while (i < leftLines.length || j < rightLines.length) {
      if (i >= leftLines.length) {
        result.push({ type: 'add', content: rightLines[j], lineNum: { right: j + 1 } });
        j++;
      } else if (j >= rightLines.length) {
        result.push({ type: 'remove', content: leftLines[i], lineNum: { left: i + 1 } });
        i++;
      } else if (leftLines[i] === rightLines[j]) {
        result.push({ type: 'equal', content: leftLines[i], lineNum: { left: i + 1, right: j + 1 } });
        i++;
        j++;
      } else {
        result.push({ type: 'remove', content: leftLines[i], lineNum: { left: i + 1 } });
        result.push({ type: 'add', content: rightLines[j], lineNum: { right: j + 1 } });
        i++;
        j++;
      }
    }

    setDiffResult(result);
  };

  const handleFileSelect = (side: 'left' | 'right', e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (side === 'left') setLeftText(event.target.result as string);
          else setRightText(event.target.result as string);
        }
      };
      reader.readAsText(e.target.files[0]);
    }
  };

  const handleDrop = (side: 'left' | 'right', e: React.DragEvent) => {
    e.preventDefault();
    if (side === 'left') setIsDraggingLeft(false);
    else setIsDraggingRight(false);
    
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('text/') || f.name.endsWith('.txt') || f.name.endsWith('.log') || f.name.endsWith('.md')
    );
    if (droppedFiles.length > 0) {
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          if (side === 'left') setLeftText(event.target.result as string);
          else setRightText(event.target.result as string);
        }
      };
      reader.readAsText(droppedFiles[0]);
    }
  };

  const clearAll = () => {
    setLeftText('');
    setRightText('');
    setDiffResult([]);
  };

  const stats = diffResult.reduce((acc, line) => {
    if (line.type === 'add') acc.added++;
    else if (line.type === 'remove') acc.removed++;
    else acc.unchanged++;
    return acc;
  }, { added: 0, removed: 0, unchanged: 0 });

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

        <h2 className="text-2xl font-bold mb-6">文本比对</h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">原始文本 (左)</label>
              <button
                onClick={() => leftFileRef.current?.click()}
                className="text-sm text-blue-600 hover:underline"
              >
                导入文件
              </button>
              <input
                type="file"
                ref={leftFileRef}
                onChange={(e) => handleFileSelect('left', e)}
                accept=".txt,.log,.md,.json,.xml,.csv,.js,.ts"
                className="hidden"
              />
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-2 ${isDraggingLeft ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingLeft(true); }}
              onDragLeave={() => setIsDraggingLeft(false)}
              onDrop={(e) => handleDrop('left', e)}
            >
              <textarea
                value={leftText}
                onChange={(e) => setLeftText(e.target.value)}
                placeholder="输入原始文本或拖放文件..."
                className="w-full h-48 p-3 border border-gray-200 rounded text-sm font-mono resize-none"
              />
            </div>
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">修改后文本 (右)</label>
              <button
                onClick={() => rightFileRef.current?.click()}
                className="text-sm text-blue-600 hover:underline"
              >
                导入文件
              </button>
              <input
                type="file"
                ref={rightFileRef}
                onChange={(e) => handleFileSelect('right', e)}
                accept=".txt,.log,.md,.json,.xml,.csv,.js,.ts"
                className="hidden"
              />
            </div>
            <div
              className={`border-2 border-dashed rounded-lg p-2 ${isDraggingRight ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
              onDragOver={(e) => { e.preventDefault(); setIsDraggingRight(true); }}
              onDragLeave={() => setIsDraggingRight(false)}
              onDrop={(e) => handleDrop('right', e)}
            >
              <textarea
                value={rightText}
                onChange={(e) => setRightText(e.target.value)}
                placeholder="输入修改后文本或拖放文件..."
                className="w-full h-48 p-3 border border-gray-200 rounded text-sm font-mono resize-none"
              />
            </div>
          </div>
        </div>

        <div className="text-center mb-6">
          <button
            onClick={computeDiff}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            开始比对
          </button>
          <button
            onClick={clearAll}
            className="ml-4 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
          >
            清空
          </button>
        </div>

        {diffResult.length > 0 && (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
              <span className="font-medium text-gray-700">比对结果</span>
              <div className="flex gap-4 text-sm">
                <span className="text-green-600">+ {stats.added} 行</span>
                <span className="text-red-600">- {stats.removed} 行</span>
                <span className="text-gray-500">= {stats.unchanged} 行</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <tbody>
                  {diffResult.map((line, idx) => (
                    <tr key={idx} className={`${
                      line.type === 'add' ? 'bg-green-50' : 
                      line.type === 'remove' ? 'bg-red-50' : ''
                    }`}>
                      <td className="px-2 py-1 text-xs text-gray-400 w-12 text-right">
                        {line.lineNum.left || ''}
                      </td>
                      <td className="px-2 py-1 text-xs text-gray-400 w-12 text-right">
                        {line.lineNum.right || ''}
                      </td>
                      <td className="px-2 py-1 text-xs w-6">
                        {line.type === 'add' ? '+' : line.type === 'remove' ? '-' : ' '}
                      </td>
                      <td className="px-4 py-1 text-sm font-mono whitespace-pre">
                        {line.content || ' '}
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