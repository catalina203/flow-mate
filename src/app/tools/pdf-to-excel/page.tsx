'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import * as XLSX from 'xlsx';

interface TableData {
  page: number;
  rows: string[][];
}

export default function PdfToExcelPage() {
  const [files, setFiles] = useState<File[]>([]);
  const [tables, setTables] = useState<TableData[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pdfjsRef = useRef<any>(null);

  useEffect(() => {
    const loadPdfJs = async () => {
      const pdfjsLib = await import('pdfjs-dist');
      pdfjsLib.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;
      pdfjsRef.current = pdfjsLib;
    };
    loadPdfJs();
  }, []);

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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      setFiles(droppedFiles);
      extractTablesFromPDFs(droppedFiles);
    } else {
      alert('请选择 PDF 文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf');
      if (selectedFiles.length > 0) {
        setFiles(selectedFiles);
        extractTablesFromPDFs(selectedFiles);
      }
    }
  };

  const extractTablesFromPDFs = async (fileList: File[]) => {
    setIsProcessing(true);
    setTables([]);
    setProgress(0);
    
    const extractedTables: TableData[] = [];
    const totalFiles = fileList.length;
    
    for (let f = 0; f < totalFiles; f++) {
      const file = fileList[f];
      try {
        const arrayBuffer = await file.arrayBuffer();
        const pdfDoc = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise;
        const pageCount = pdfDoc.numPages;
        
        for (let i = 1; i <= pageCount; i++) {
          const page = await pdfDoc.getPage(i);
          const textContent = await page.getTextContent();
          
          if (textContent.items.length === 0) continue;
          
          const items = textContent.items.map((item: any) => ({
            str: item.str,
            y: item.transform[5],
            x: item.transform[4]
          }));
          
          items.sort((a: any, b: any) => b.y - a.y);
          
          const rows: string[][] = [];
          let currentRow: string[] = [];
          let lastY = -1;
          const yThreshold = 5;
          
          for (const item of items) {
            if (lastY === -1 || Math.abs(item.y - lastY) > yThreshold) {
              if (currentRow.length > 0) {
                rows.push(currentRow);
              }
              currentRow = [item.str];
              lastY = item.y;
            } else {
              currentRow.push(item.str);
            }
          }
          if (currentRow.length > 0) {
            rows.push(currentRow);
          }
          
          if (rows.length > 0) {
            extractedTables.push({ page: i, rows });
          }
          
          setProgress(Math.round(((f * pageCount + i) / (totalFiles * pageCount)) * 100));
        }
      } catch (error) {
        console.error('Error extracting PDF:', error);
      }
    }
    
    setTables(extractedTables);
    setIsProcessing(false);
    setProgress(100);
  };

  const exportAsExcel = () => {
    if (tables.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const wb = XLSX.utils.book_new();
    
    tables.forEach((table, idx) => {
      if (table.rows.length > 0) {
        const ws = XLSX.utils.aoa_to_sheet(table.rows);
        XLSX.utils.book_append_sheet(wb, ws, `页${table.page}`);
      }
    });

    XLSX.writeFile(wb, 'pdf_extracted_data.xlsx');
  };

  const exportAsCSV = () => {
    if (tables.length === 0) {
      alert('没有可导出的数据');
      return;
    }

    const allRows: string[][] = [];
    tables.forEach(table => {
      allRows.push([`--- 第 ${table.page} 页 ---`]);
      table.rows.forEach(row => allRows.push(row));
      allRows.push([]);
    });

    const csvContent = allRows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pdf_extracted_data.csv';
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

        <h2 className="text-2xl font-bold mb-6">PDF 转 Excel</h2>

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
            accept="application/pdf"
            multiple
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放 PDF 文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">支持多个 PDF 文件</p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">已选择文件:</h3>
            <div className="flex flex-wrap gap-2">
              {files.map((file, idx) => (
                <span key={idx} className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
                  {file.name}
                </span>
              ))}
            </div>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-gray-600">正在提取数据... {progress}%</p>
          </div>
        )}

        {tables.length > 0 && !isProcessing && (
          <>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex justify-between items-center">
                <p className="text-gray-600">
                  共提取 {tables.reduce((acc, t) => acc + t.rows.length, 0)} 行数据，来自 {tables.length} 页
                </p>
                <div className="flex gap-2">
                  <button onClick={exportAsExcel} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    导出 Excel
                  </button>
                  <button onClick={exportAsCSV} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm">
                    导出 CSV
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-6">
              {tables.slice(0, 5).map((table, idx) => (
                <div key={idx} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="bg-gray-50 px-4 py-2 border-b">
                    <span className="font-medium">第 {table.page} 页</span>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <tbody className="divide-y divide-gray-200">
                        {table.rows.slice(0, 20).map((row, rowIdx) => (
                          <tr key={rowIdx} className="hover:bg-gray-50">
                            <td className="px-4 py-2 text-sm text-gray-400 w-12">{rowIdx + 1}</td>
                            {row.map((cell, cellIdx) => (
                              <td key={cellIdx} className="px-4 py-2 text-sm text-gray-700 whitespace-nowrap">
                                {cell}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  {table.rows.length > 20 && (
                    <div className="px-4 py-2 text-sm text-gray-500 text-center">
                      ... 还有 {table.rows.length - 20} 行
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
