'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface FileItem {
  file: File;
  type: string;
}

interface GroupedFiles {
  [key: string]: FileItem[];
}

const typeMap: Record<string, string> = {
  'image': '图片',
  'video': '视频',
  'audio': '音频',
  'pdf': 'PDF',
  'word': 'Word',
  'excel': 'Excel',
  'zip': '压缩包',
  'text': '文本',
  'other': '其他',
};

const getFileType = (file: File): string => {
  const name = file.name.toLowerCase();
  if (name.match(/\.(jpg|jpeg|png|gif|webp|bmp|svg)$/)) return 'image';
  if (name.match(/\.(mp4|avi|mov|wmv|flv|mkv)$/)) return 'video';
  if (name.match(/\.(mp3|wav|flac|aac|ogg)$/)) return 'audio';
  if (name.endsWith('.pdf')) return 'pdf';
  if (name.match(/\.(doc|docx)$/)) return 'word';
  if (name.match(/\.(xls|xlsx)$/)) return 'excel';
  if (name.match(/\.(zip|rar|7z|tar|gz)$/)) return 'zip';
  if (name.match(/\.(txt|md|log)$/)) return 'text';
  return 'other';
};

export default function FileSortPage() {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [groupedFiles, setGroupedFiles] = useState<GroupedFiles>({});
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
    processFiles(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      processFiles(Array.from(e.target.files));
    }
  };

  const processFiles = (newFiles: File[]) => {
    const fileItems: FileItem[] = newFiles.map(f => ({
      file: f,
      type: getFileType(f),
    }));
    setFiles(fileItems);

    const grouped: GroupedFiles = {};
    fileItems.forEach(item => {
      if (!grouped[item.type]) grouped[item.type] = [];
      grouped[item.type].push(item);
    });
    setGroupedFiles(grouped);
  };

  const downloadGroup = async (type: string) => {
    const groupFiles = groupedFiles[type];
    if (!groupFiles || groupFiles.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const item of groupFiles) {
      const arrayBuffer = await item.file.arrayBuffer();
      zip.file(item.file.name, arrayBuffer);
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${typeMap[type] || type}_files.zip`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const downloadAll = async () => {
    if (files.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (const item of files) {
      const folder = zip.folder(typeMap[item.type] || 'other');
      if (folder) {
        const arrayBuffer = await item.file.arrayBuffer();
        folder.file(item.file.name, arrayBuffer);
      }
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'sorted_files.zip';
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

        <h2 className="text-2xl font-bold mb-6">文件分类</h2>

        <div
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'}`}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <input type="file" ref={fileInputRef} onChange={handleFileSelect} multiple className="hidden" />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
          </svg>
          <p className="text-gray-600 mb-2">拖放文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">可选择多个文件自动分类</p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">共 {files.length} 个文件</span>
              <div className="flex gap-2">
                <button onClick={downloadAll} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                  下载全部 ZIP
                </button>
                <button onClick={() => { setFiles([]); setGroupedFiles({}); }} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm">
                  清空
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Object.entries(groupedFiles).map(([type, items]) => (
                <div key={type} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b flex justify-between items-center">
                    <div className="flex items-center gap-2">
                      <span className="text-xl">
                        {type === 'image' ? '🖼️' : type === 'video' ? '🎬' : type === 'audio' ? '🎵' : 
                         type === 'pdf' ? '📄' : type === 'word' ? '📝' : type === 'excel' ? '📊' : 
                         type === 'zip' ? '📦' : type === 'text' ? '📝' : '📁'}
                      </span>
                      <span className="font-medium text-gray-800">{typeMap[type] || type}</span>
                      <span className="text-sm text-gray-500">({items.length})</span>
                    </div>
                    <button onClick={() => downloadGroup(type)} className="text-sm text-blue-600 hover:underline">
                      下载
                    </button>
                  </div>
                  <div className="max-h-48 overflow-auto p-2">
                    {items.map((item, idx) => (
                      <div key={idx} className="text-sm text-gray-600 py-1 truncate px-2 hover:bg-gray-50">
                        {item.file.name}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}