'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';

interface ZipEntry {
  name: string;
  dir: boolean;
  date: Date;
  size: number;
}

export default function UnzipPage() {
  const [zipFile, setZipFile] = useState<File | null>(null);
  const [entries, setEntries] = useState<ZipEntry[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.name.endsWith('.zip') || f.name.endsWith('.rar') || f.name.endsWith('.7z')
    );
    if (droppedFiles.length > 0) {
      loadZipFile(droppedFiles[0]);
    } else {
      alert('请选择压缩文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadZipFile(e.target.files[0]);
    }
  };

  const loadZipFile = async (file: File) => {
    setZipFile(file);
    setIsProcessing(true);
    setSelectedFiles(new Set());

    try {
      const arrayBuffer = await file.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const fileEntries: ZipEntry[] = [];
      
      zip.forEach((relativePath, zipEntry) => {
        fileEntries.push({
          name: relativePath,
          dir: zipEntry.dir,
          date: zipEntry.date,
          size: 0,
        });
      });

      setEntries(fileEntries);
    } catch (error) {
      console.error('Error loading zip:', error);
      alert('无法读取压缩文件');
    }

    setIsProcessing(false);
  };

  const toggleFile = (name: string) => {
    setSelectedFiles(prev => {
      const newSet = new Set(prev);
      if (newSet.has(name)) {
        newSet.delete(name);
      } else {
        newSet.add(name);
      }
      return newSet;
    });
  };

  const selectAll = () => {
    if (selectedFiles.size === entries.length) {
      setSelectedFiles(new Set());
    } else {
      setSelectedFiles(new Set(entries.map(e => e.name)));
    }
  };

  const extractSelected = async () => {
    if (!zipFile || selectedFiles.size === 0) {
      alert('请选择要解压的文件');
      return;
    }

    setIsProcessing(true);

    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const folder = zip.folder('extracted');
      if (!folder) {
        alert('解压失败');
        setIsProcessing(false);
        return;
      }

      const selectedArray = Array.from(selectedFiles);
      
      for (const fileName of selectedArray) {
        const file = zip.file(fileName);
        if (file && !file.dir) {
          const blob = await file.async('blob');
          const url = URL.createObjectURL(blob);
          const link = document.createElement('a');
          link.href = url;
          link.download = fileName.split('/').pop() || fileName;
          link.click();
          URL.revokeObjectURL(url);
        }
      }
      
      alert('解压完成！');
    } catch (error) {
      console.error('Extract error:', error);
      alert('解压失败');
    }

    setIsProcessing(false);
  };

  const extractAll = async () => {
    if (!zipFile) return;
    
    setIsProcessing(true);

    try {
      const arrayBuffer = await zipFile.arrayBuffer();
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      const blob = await zip.generateAsync({ type: 'blob' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = zipFile.name.replace(/\.[^.]+$/, '') + '_extracted.zip';
      link.click();
      URL.revokeObjectURL(url);
      
      alert('已导出为 ZIP 文件');
    } catch (error) {
      console.error('Extract error:', error);
      alert('解压失败');
    }

    setIsProcessing(false);
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

        <h2 className="text-2xl font-bold mb-6">ZIP 解压</h2>

        {!zipFile && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".zip,.rar,.7z"
              className="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
            </svg>
            <p className="text-gray-600 mb-2">拖放压缩文件到此处或点击选择</p>
            <p className="text-gray-400 text-sm">支持 .zip 格式</p>
          </div>
        )}

        {zipFile && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📦</span>
                  <div>
                    <p className="font-medium text-gray-800">{zipFile.name}</p>
                    <p className="text-sm text-gray-500">{entries.length} 个文件/文件夹</p>
                  </div>
                </div>
                <button onClick={() => { setZipFile(null); setEntries([]); }} className="text-sm text-blue-600 hover:underline">
                  更换文件
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden">
              <div className="px-4 py-2 bg-gray-50 border-b flex justify-between items-center">
                <label className="flex items-center text-sm text-gray-600">
                  <input type="checkbox" checked={selectedFiles.size === entries.length} onChange={selectAll} className="mr-2" />
                  全选 ({selectedFiles.size}/{entries.length})
                </label>
              </div>
              <div className="max-h-96 overflow-auto">
                {entries.map((entry, idx) => (
                  <div key={idx} className="px-4 py-2 border-b hover:bg-gray-50 flex items-center">
                    <input 
                      type="checkbox" 
                      checked={selectedFiles.has(entry.name)} 
                      onChange={() => toggleFile(entry.name)}
                      className="mr-3"
                    />
                    <span className="mr-2">{entry.dir ? '📁' : '📄'}</span>
                    <span className="flex-1 text-sm text-gray-800 truncate">{entry.name}</span>
                    {!entry.dir && <span className="text-xs text-gray-500">{formatSize(entry.size)}</span>}
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={extractSelected}
                disabled={isProcessing || selectedFiles.size === 0}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                解压选中文件
              </button>
              <button
                onClick={extractAll}
                disabled={isProcessing}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                导出为 ZIP
              </button>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">处理中...</p>
          </div>
        )}
      </div>
    </div>
  );
}