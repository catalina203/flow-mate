'use client';

import { useState, useRef, lazy, Suspense } from 'react';
import Link from 'next/link';

const DocxEditor = lazy(() => import('@eigenpal/docx-js-editor').then(mod => ({ default: mod.DocxEditor })));

export default function DocumentEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  const [buffer, setBuffer] = useState<ArrayBuffer | null>(null);
  const [showEditor, setShowEditor] = useState(false);
  const editorRef = useRef<any>(null);
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
      f.name.endsWith('.docx')
    );
    if (droppedFiles.length > 0) {
      loadFile(droppedFiles[0]);
    } else {
      alert('请选择 DOCX 文件');
    }
  };

  const loadFile = async (selectedFile: File) => {
    setFile(selectedFile);
    setIsLoading(true);
    try {
      const arrayBuffer = await selectedFile.arrayBuffer();
      setBuffer(arrayBuffer);
      setShowEditor(true);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('无法读取文件，请确保是有效的 DOCX 文件');
    }
    setIsLoading(false);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleReset = () => {
    setFile(null);
    setBuffer(null);
    setShowEditor(false);
    setHasChanges(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const onDocSave = (savedBuffer: ArrayBuffer) => {
    try {
      const blob = new Blob([savedBuffer], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = file?.name || 'document.docx';
      link.click();
      URL.revokeObjectURL(url);
      setHasChanges(false);
    } catch (error) {
      console.error('Save error:', error);
    }
  };

  const handleSave = async () => {
    try {
      const saved = await editorRef.current?.save();
      if (saved) {
        const blob = new Blob([saved], { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = file?.name || 'document.docx';
        link.click();
        URL.revokeObjectURL(url);
        setHasChanges(false);
      }
    } catch (error) {
      console.error('Save error:', error);
    }
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
          <Link href="/tools?category=文档编辑" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文档编辑
          </Link>
          {showEditor && (
            <button
              onClick={handleReset}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
            >
              关闭文档
            </button>
          )}
        </div>

        <h2 className="text-2xl font-bold mb-6">文档编辑器</h2>

        {!showEditor ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleOpenFile}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".docx"
              className="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-2">拖放 DOCX 文件到此处</p>
            <p className="text-gray-400 text-sm">支持 .docx 格式</p>
            <button
              onClick={handleOpenFile}
              className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              打开文件
            </button>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">{file?.name || '未命名.docx'}</span>
                {hasChanges && <span className="text-yellow-600 text-sm">(已修改)</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenFile}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  打开文件
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".docx"
                  className="hidden"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  保存
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  关闭
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex-1 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <span className="ml-4 text-gray-600">加载中...</span>
              </div>
            ) : (
              <div className="flex-1 bg-white rounded-lg shadow overflow-hidden docx-editor-container">
                <Suspense fallback={
                  <div className="flex items-center justify-center h-full">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                  </div>
                }>
                  <DocxEditor 
                    ref={editorRef}
                    documentBuffer={buffer!} 
                    onChange={() => setHasChanges(true)}
                    showPrintButton={false}
                  />
                </Suspense>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}