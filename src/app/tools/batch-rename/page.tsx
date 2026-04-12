'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface FileItem {
  file: File;
  originalName: string;
  newName: string;
}

export default function BatchRenamePage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [startNum, setStartNum] = useState(1);
  const [padding, setPadding] = useState(3);
  const [replaceFrom, setReplaceFrom] = useState('');
  const [replaceTo, setReplaceTo] = useState('');
  const [mode, setMode] = useState<'number' | 'replace' | 'prefix'>('number');
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    addFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      addFiles(Array.from(e.target.files));
    }
  };

  const addFiles = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(f => ({
      file: f,
      originalName: f.name,
      newName: f.name,
    }));
    setFiles(prev => [...prev, ...fileItems]);
    updateNames([...files, ...fileItems]);
  };

  const updateNames = (fileList: FileItem[]) => {
    const updated = fileList.map((item, idx) => {
      let newName = item.originalName;
      const ext = item.originalName.includes('.') ? '.' + item.originalName.split('.').pop() : '';
      const baseName = item.originalName.replace(/\.[^.]+$/, '');

      if (mode === 'number') {
        const num = String(startNum + idx).padStart(padding, '0');
        newName = `${prefix}${baseName}${suffix}_${num}${ext}`;
      } else if (mode === 'replace' && replaceFrom) {
        newName = item.originalName.replace(new RegExp(replaceFrom, 'g'), replaceTo);
      } else if (mode === 'prefix') {
        newName = `${prefix}${baseName}${suffix}${ext}`;
      }

      return { ...item, newName };
    });
    setFiles(updated);
  };

  React.useEffect(() => {
    if (files.length > 0) {
      updateNames(files);
    }
  }, [mode, prefix, suffix, startNum, padding, replaceFrom, replaceTo]);

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    updateNames(newFiles);
  };

  const downloadRenamed = () => {
    if (files.length === 0) return;
    
    const csvContent = files.map(f => `${f.originalName},${f.newName}`).join('\n');
    const blob = new Blob(['原文件名,新文件名\n' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'rename_list.csv';
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
          <Link href="/tools?category=文件压缩" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文件压缩
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">批量重命名</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2 mb-4">
            <button onClick={() => setMode('number')} className={`px-4 py-2 rounded text-sm ${mode === 'number' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>编号模式</button>
            <button onClick={() => setMode('replace')} className={`px-4 py-2 rounded text-sm ${mode === 'replace' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>替换模式</button>
            <button onClick={() => setMode('prefix')} className={`px-4 py-2 rounded text-sm ${mode === 'prefix' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>前后缀模式</button>
          </div>

          {mode === 'number' && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">前缀</label>
                <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="文件前缀" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">后缀</label>
                <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="文件后缀" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">起始编号</label>
                <input type="number" value={startNum} onChange={(e) => setStartNum(Number(e.target.value))} className="w-full border rounded px-3 py-2 text-sm" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">位数</label>
                <input type="number" value={padding} onChange={(e) => setPadding(Number(e.target.value))} min="1" max="10" className="w-full border rounded px-3 py-2 text-sm" />
              </div>
            </div>
          )}

          {mode === 'replace' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">查找</label>
                <input type="text" value={replaceFrom} onChange={(e) => setReplaceFrom(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="要替换的文本" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">替换为</label>
                <input type="text" value={replaceTo} onChange={(e) => setReplaceTo(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="替换为" />
              </div>
            </div>
          )}

          {mode === 'prefix' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600 mb-1">前缀</label>
                <input type="text" value={prefix} onChange={(e) => setPrefix(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="文件前缀" />
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">后缀</label>
                <input type="text" value={suffix} onChange={(e) => setSuffix(e.target.value)} className="w-full border rounded px-3 py-2 text-sm" placeholder="文件后缀" />
              </div>
            </div>
          )}
        </div>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">可选择多个文件</p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">已选择 {files.length} 个文件</span>
              <button onClick={() => setFiles([])} className="text-sm text-red-600 hover:underline">清空全部</button>
            </div>
            <div className="bg-white rounded-lg shadow overflow-hidden">
              <table className="min-w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">原文件名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">新文件名</th>
                    <th className="px-4 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-800 truncate max-w-[200px]">{item.originalName}</td>
                      <td className="px-4 py-2 text-sm text-blue-600 truncate max-w-[200px]">{item.newName}</td>
                      <td className="px-4 py-2">
                        <button onClick={() => removeFile(idx)} className="text-red-500 hover:text-red-700">×</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {files.length > 0 && (
          <div className="text-center">
            <button onClick={downloadRenamed} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium">
              导出重命名列表
            </button>
          </div>
        )}
      </div>
    </div>
  );
}