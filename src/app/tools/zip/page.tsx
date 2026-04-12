'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import JSZip from 'jszip';

interface FileItem {
  file: File;
  name: string;
  size: number;
}

export default function ZipPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [compressLevel, setCompressLevel] = useState(6);
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
      name: f.name,
      size: f.size,
    }));
    setFiles(prev => [...prev, ...fileItems]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const compressToZip = async () => {
    if (files.length === 0) {
      alert('请先选择文件');
      return;
    }

    setIsProcessing(true);

    try {
      const zip = new JSZip();
      
      for (const item of files) {
        const arrayBuffer = await item.file.arrayBuffer();
        zip.file(item.name, arrayBuffer);
      }

      const blob = await zip.generateAsync({ 
        type: 'blob',
        compression: 'DEFLATE',
        compressionOptions: { level: compressLevel }
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'archive.zip';
      link.click();
      URL.revokeObjectURL(url);
      
      alert('压缩完成！');
    } catch (error) {
      console.error('Compress error:', error);
      alert('压缩失败');
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

        <h2 className="text-2xl font-bold mb-6">ZIP 压缩</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">压缩级别:</label>
            <input
              type="range"
              min="1"
              max="9"
              value={compressLevel}
              onChange={(e) => setCompressLevel(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600">
              {compressLevel <= 3 ? '快速' : compressLevel <= 6 ? '平衡' : '最强'}
            </span>
          </div>
        </div>

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
            multiple
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-gray-600 mb-2">拖放文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">可同时选择多个文件</p>
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
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">文件名</th>
                    <th className="px-4 py-2 text-left text-xs font-medium text-gray-500">大小</th>
                    <th className="px-4 py-2 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {files.map((item, idx) => (
                    <tr key={idx} className="border-t">
                      <td className="px-4 py-2 text-sm text-gray-800">{item.name}</td>
                      <td className="px-4 py-2 text-sm text-gray-500">{formatSize(item.size)}</td>
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
            <button
              onClick={compressToZip}
              disabled={isProcessing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {isProcessing ? '压缩中...' : '压缩为 ZIP'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}