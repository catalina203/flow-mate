'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';

const ONLYOFFICE_URL = 'http://localhost:8848';

interface DocTypeConfig {
  documentType: 'word' | 'cell' | 'slide';
  title: string;
}

const DOC_CONFIGS: Record<string, DocTypeConfig> = {
  word: {
    documentType: 'word',
    title: 'Word 文档',
  },
  excel: {
    documentType: 'cell',
    title: 'Excel 表格',
  },
  ppt: {
    documentType: 'slide',
    title: 'PowerPoint 演示',
  },
};

function OfficePage({ docType }: { docType: 'word' | 'excel' | 'ppt' }) {
  const [mode, setMode] = useState<'view' | 'edit'>('edit');
  const [editorUrl, setEditorUrl] = useState<string>('');
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const config = DOC_CONFIGS[docType];

  const handleOpenEditor = useCallback(() => {
    const url = `${ONLYOFFICE_URL}/#/?mode=${mode}&documentType=${config.documentType}`;
    setEditorUrl(url);
  }, [mode, config.documentType]);

  const handleOpenInNewWindow = () => {
    if (editorUrl) {
      window.open(editorUrl, '_blank');
    }
  };

  const toggleMode = (newMode: 'view' | 'edit') => {
    setMode(newMode);
    if (editorUrl) {
      const url = `${ONLYOFFICE_URL}/#/?mode=${newMode}&documentType=${config.documentType}`;
      setEditorUrl(url);
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
          <Link href="/tools?category=办公文档" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回办公文档
          </Link>
          <div className="flex gap-2">
            <button
              onClick={() => toggleMode('view')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === 'view' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              预览模式
            </button>
            <button
              onClick={() => toggleMode('edit')}
              className={`px-4 py-2 rounded-lg text-sm font-medium ${
                mode === 'edit' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'
              }`}
            >
              编辑模式
            </button>
          </div>
        </div>

        {!editorUrl ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-6">{config.title}</h2>
            <p className="text-gray-600 mb-4">点击下方按钮打开编辑器</p>
            <button
              onClick={handleOpenEditor}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-lg"
            >
              打开 {config.title}
            </button>
            <div className="mt-8 p-4 bg-yellow-50 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm text-yellow-700">
                提示：请确保 ONLYOFFICE 服务已启动（端口 8848）
              </p>
              <p className="text-sm text-yellow-700 mt-2">
                在编辑器中选择文件或新建文件即可开始编辑
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <span className="text-gray-700 font-medium">
                {mode === 'view' ? '预览模式' : '编辑模式'}
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenInNewWindow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  在新窗口打开
                </button>
                <button
                  onClick={() => setEditorUrl('')}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  关闭
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border" style={{ height: 'calc(100vh - 280px)' }}>
              <iframe
                ref={iframeRef}
                src={editorUrl}
                className="w-full h-full border-0"
                allow="fullscreen"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default function WordPage() {
  return <OfficePage docType="word" />;
}