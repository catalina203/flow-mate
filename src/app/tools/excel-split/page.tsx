'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

export default function ExcelSplitPage() {
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<string[]>([]);
  const [splitMode, setSplitMode] = useState<'sheet' | 'rows'>('sheet');
  const [rowsPerFile, setRowsPerFile] = useState(1000);
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
      f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
    );
    if (droppedFiles.length > 0) {
      loadFile(droppedFiles[0]);
    } else {
      alert('请选择 Excel 或 CSV 文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const loadFile = async (selectedFile: File) => {
    setFile(selectedFile);
    try {
      const data = await selectedFile.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      setSheets(workbook.SheetNames);
    } catch (error) {
      console.error('Error reading file:', error);
    }
  };

  const splitFile = async () => {
    if (!file) {
      alert('请选择文件');
      return;
    }

    setIsProcessing(true);

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });

      if (splitMode === 'sheet') {
        for (const sheetName of workbook.SheetNames) {
          const wb = XLSX.utils.book_new();
          const worksheet = workbook.Sheets[sheetName];
          XLSX.utils.book_append_sheet(wb, worksheet, sheetName);
          XLSX.writeFile(wb, `${sheetName}.xlsx`);
        }
      } else {
        const worksheet = workbook.Sheets[workbook.SheetNames[0]];
        const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
        
        const headers = jsonData[0] || [];
        const allRows = jsonData.slice(1);
        const totalRows = allRows.length;
        const numFiles = Math.ceil(totalRows / rowsPerFile);
        
        for (let i = 0; i < numFiles; i++) {
          const start = i * rowsPerFile;
          const end = Math.min(start + rowsPerFile, totalRows);
          const rows = allRows.slice(start, end);
          
          const wb = XLSX.utils.book_new();
          const ws = XLSX.utils.aoa_to_sheet([headers, ...rows]);
          XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
          XLSX.writeFile(wb, `part_${i + 1}.xlsx`);
        }
      }

      alert('拆分完成！');
    } catch (error) {
      console.error('Error splitting file:', error);
      alert('拆分失败');
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
          <Link href="/tools?category=文档转换" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文档转换
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">Excel 拆分</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">拆分模式</label>
          <div className="flex flex-col gap-3">
            <label className="flex items-center">
              <input
                type="radio"
                name="splitMode"
                value="sheet"
                checked={splitMode === 'sheet'}
                onChange={() => setSplitMode('sheet')}
                className="mr-2"
              />
              <span className="text-sm">按 Sheet 拆分（每个 Sheet 单独保存为一个文件）</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="splitMode"
                value="rows"
                checked={splitMode === 'rows'}
                onChange={() => setSplitMode('rows')}
                className="mr-2"
              />
              <span className="text-sm">按行数拆分（将数据分成多个文件）</span>
            </label>
            {splitMode === 'rows' && (
              <div className="ml-6 mt-2">
                <label className="text-sm text-gray-600">每个文件行数：</label>
                <input
                  type="number"
                  value={rowsPerFile}
                  onChange={(e) => setRowsPerFile(Number(e.target.value))}
                  className="ml-2 border border-gray-300 rounded px-2 py-1 text-sm w-24"
                  min="1"
                />
              </div>
            )}
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
            accept=".xlsx,.xls,.csv"
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放 Excel 文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">支持 .xlsx, .xls, .csv 格式</p>
        </div>

        {file && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4">
              <div className="flex items-center gap-3">
                <span className="text-green-600 text-xl">📊</span>
                <div>
                  <p className="font-medium text-gray-800">{file.name}</p>
                  <p className="text-sm text-gray-500">{sheets.length} 个 Sheet</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {file && (
          <div className="text-center">
            <button
              onClick={splitFile}
              disabled={isProcessing}
              className={`px-8 py-3 rounded-lg text-white font-medium ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '拆分中...' : '开始拆分'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
