'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import mammoth from 'mammoth';

export default function WordToPdfPage() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState(false);
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.name.endsWith('.docx') || f.name.endsWith('.doc')
    );
    if (droppedFiles.length > 0) {
      loadFile(droppedFiles[0]);
    } else {
      alert('请选择 Word 文件 (.docx, .doc)');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const loadFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsProcessing(true);

    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      const result = await mammoth.convertToHtml({ arrayBuffer });
      setContent(result.value);
    } catch (error) {
      console.error('Error reading Word file:', error);
      alert('读取文件失败，请确保是有效的 Word 文档');
    }

    setIsProcessing(false);
  };

  const exportAsHtml = () => {
    if (!content) {
      alert('没有可导出的内容');
      return;
    }

    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${file?.name || 'document'}</title>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; max-width: 800px; margin: 0 auto; }
    table { border-collapse: collapse; width: 100%; }
    table, th, td { border: 1px solid #ddd; }
    th, td { padding: 8px; text-align: left; }
  </style>
</head>
<body>
${content}
</body>
</html>`;

    const blob = new Blob([htmlContent], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace(/\.[^.]+$/, '')}.html`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const exportAsText = () => {
    if (!content) {
      alert('没有可导出的内容');
      return;
    }

    const text = content.replace(/<[^>]+>/g, '\n').replace(/\n+/g, '\n').trim();
    const blob = new Blob([text], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${file?.name.replace(/\.[^.]+$/, '')}.txt`;
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
          <Link href="/tools?category=文档转换" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文档转换
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">Word 转 PDF</h2>
        
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 text-sm">
            注意：由于浏览器端限制，Word 转 PDF 功能暂时只能导出 HTML 和文本格式。
            如需完整的 PDF 转换功能，建议使用专业桌面软件。
          </p>
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
            accept=".docx,.doc"
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放 Word 文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">支持 .docx, .doc 格式</p>
        </div>

        {file && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <span className="text-blue-600 text-xl">📝</span>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <p className="text-gray-600 mt-2">正在处理...</p>
          </div>
        )}

        {content && !isProcessing && (
          <>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <h3 className="font-medium text-gray-700 mb-2">文档预览</h3>
              <div 
                className="prose max-w-none text-sm text-gray-600 max-h-96 overflow-auto border rounded p-4"
                dangerouslySetInnerHTML={{ __html: content.substring(0, 2000) + (content.length > 2000 ? '...' : '') }}
              />
            </div>

            <div className="flex justify-center gap-4">
              <button
                onClick={exportAsHtml}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                导出 HTML
              </button>
              <button
                onClick={exportAsText}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
              >
                导出文本
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}