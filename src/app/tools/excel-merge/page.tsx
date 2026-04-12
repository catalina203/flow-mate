'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface ExcelFile {
  file: File;
  name: string;
  sheets: string[];
}

export default function ExcelMergePage() {
  const [files, setFiles] = useState<ExcelFile[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [mergeMode, setMergeMode] = useState<'sheet' | 'rows'>('sheet');
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
      addFiles(droppedFiles);
    } else {
      alert('请选择 Excel 或 CSV 文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => 
        f.name.endsWith('.xlsx') || f.name.endsWith('.xls') || f.name.endsWith('.csv')
      );
      if (selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
    }
  };

  const addFiles = async (fileList: File[]) => {
    const newFiles: ExcelFile[] = [];
    
    for (const file of fileList) {
      try {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data, { type: 'array' });
        newFiles.push({
          file,
          name: file.name,
          sheets: workbook.SheetNames
        });
      } catch (error) {
        console.error('Error reading file:', error);
      }
    }
    
    setFiles(prev => [...prev, ...newFiles]);
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const mergeFiles = async () => {
    if (files.length < 2) {
      alert('请至少选择 2 个文件');
      return;
    }

    setIsProcessing(true);

    try {
      const wb = XLSX.utils.book_new();
      
      if (mergeMode === 'sheet') {
        for (const fileData of files) {
          const data = await fileData.file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
            const ws = XLSX.utils.aoa_to_sheet(jsonData);
            XLSX.utils.book_append_sheet(wb, ws, `${fileData.name.replace(/\.[^.]+$/, '')}_${sheetName}`);
          }
        }
      } else {
        let allHeaders: string[] = [];
        let allRows: string[][] = [];
        
        for (const fileData of files) {
          const data = await fileData.file.arrayBuffer();
          const workbook = XLSX.read(data, { type: 'array' });
          
          for (const sheetName of workbook.SheetNames) {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
            
            if (allHeaders.length === 0 && jsonData.length > 0) {
              allHeaders = jsonData[0].map(String);
              allRows = jsonData.slice(1).map(row => row.map(String));
            } else if (jsonData.length > 0) {
              allRows = allRows.concat(jsonData.slice(1).map(row => row.map(String)));
            }
          }
        }
        
        const ws = XLSX.utils.aoa_to_sheet([allHeaders, ...allRows]);
        XLSX.utils.book_append_sheet(wb, ws, '合并数据');
      }

      XLSX.writeFile(wb, 'merged.xlsx');
    } catch (error) {
      console.error('Error merging files:', error);
      alert('合并失败');
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

        <h2 className="text-2xl font-bold mb-6">Excel 合并</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">合并模式</label>
          <div className="flex gap-4">
            <label className="flex items-center">
              <input
                type="radio"
                name="mergeMode"
                value="sheet"
                checked={mergeMode === 'sheet'}
                onChange={() => setMergeMode('sheet')}
                className="mr-2"
              />
              <span className="text-sm">每个文件的每个 Sheet 作为新 Sheet</span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="mergeMode"
                value="rows"
                checked={mergeMode === 'rows'}
                onChange={() => setMergeMode('rows')}
                className="mr-2"
              />
              <span className="text-sm">所有数据合并到一行（按行追加）</span>
            </label>
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
            multiple
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放 Excel 文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">支持 .xlsx, .xls, .csv 格式，可多选</p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">已选择 {files.length} 个文件</h3>
              <button 
                onClick={() => setFiles([])} 
                className="text-sm text-red-600 hover:text-red-700"
              >
                清空全部
              </button>
            </div>
            <div className="space-y-2">
              {files.map((file, idx) => (
                <div key={idx} className="flex items-center justify-between bg-white rounded-lg shadow p-3">
                  <div className="flex items-center gap-3">
                    <span className="text-green-600 text-xl">📊</span>
                    <div>
                      <p className="font-medium text-gray-800">{file.name}</p>
                      <p className="text-sm text-gray-500">{file.sheets.length} 个 Sheet</p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {files.length >= 2 && (
          <div className="text-center">
            <button
              onClick={mergeFiles}
              disabled={isProcessing}
              className={`px-8 py-3 rounded-lg text-white font-medium ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '合并中...' : '合并文件'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
