'use client';

import { useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

const ONLYOFFICE_URL = 'http://localhost:8848';

export default function SpreadsheetEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [editorUrl, setEditorUrl] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  const loadFile = useCallback(async (selectedFile: File) => {
    setIsLoading(true);
    setFile(selectedFile);

    const bytes = await selectedFile.arrayBuffer();
    const blob = new Blob([bytes], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const objectUrl = URL.createObjectURL(blob);
    
    const url = `${ONLYOFFICE_URL}/#/?filename=${encodeURIComponent(selectedFile.name)}&url=${encodeURIComponent(objectUrl)}`;
    setEditorUrl(url);
    setIsLoading(false);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const handleNewFile = async () => {
    const worksheet = XLSX.utils.aoa_to_sheet([
      ['姓名', '年龄', '城市'],
      ['', '', ''],
    ]);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet1');
    
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const newFile = new File([blob], '新建表格.xlsx', { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    loadFile(newFile);
  };

  const handleReset = () => {
    setFile(null);
    setEditorUrl('');
  };

  const handleOpenInNewWindow = () => {
    if (editorUrl) {
      window.open(editorUrl, '_blank');
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
        </div>

        <h2 className="text-2xl font-bold mb-6">表格编辑器</h2>

        {!editorUrl ? (
          <div
            className="border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors border-gray-300 hover:border-gray-400"
          >
            <input
              type="file"
              onChange={handleFileSelect}
              accept=".xlsx,.xls"
              className="hidden"
              id="file-input"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-2">选择或拖放 Excel 文件到此处</p>
            <p className="text-gray-400 text-sm">支持 .xlsx, .xls 格式</p>
            <div className="mt-4 flex justify-center gap-4">
              <label
                htmlFor="file-input"
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
              >
                打开文件
              </label>
              <button
                onClick={handleNewFile}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                新建表格
              </button>
            </div>
            <div className="mt-4 p-4 bg-yellow-50 rounded-lg text-left max-w-md mx-auto">
              <p className="text-sm text-yellow-700">
                提示：请确保 ONLYOFFICE 服务已启动（端口 8848）
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">{file?.name || '新建表格'}</span>
                <span className="text-sm text-gray-500">(ONLYOFFICE 编辑器)</span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenInNewWindow}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                >
                  在新窗口打开
                </button>
                <label
                  htmlFor="file-input-new"
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm cursor-pointer"
                >
                  打开其他文件
                </label>
                <input
                  type="file"
                  id="file-input-new"
                  onChange={handleFileSelect}
                  accept=".xlsx,.xls"
                  className="hidden"
                />
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  关闭
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow overflow-hidden border" style={{ height: 'calc(100vh - 280px)' }}>
              {isLoading ? (
                <div className="flex items-center justify-center h-full">
                  <p className="text-gray-500">加载中...</p>
                </div>
              ) : (
                <iframe
                  ref={iframeRef}
                  src={editorUrl}
                  className="w-full h-full border-0"
                  allow="fullscreen"
                />
              )}
            </div>
          </>
        )}

        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">操作说明</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 点击<strong>在新窗口打开</strong>可解决 iframe 内无法下载的问题</p>
            <p>• 在新窗口中：File → Download as → 选择格式保存</p>
            <p>• 支持 XLSX、ODS、CSV、PDF 等格式</p>
          </div>
        </div>
      </div>
    </div>
  );
}