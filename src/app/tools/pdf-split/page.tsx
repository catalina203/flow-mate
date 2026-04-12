'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';
import JSZip from 'jszip';

export default function PdfSplitPage() {
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pageCount, setPageCount] = useState(0);
  const [splitMode, setSplitMode] = useState<'all' | 'range' | 'single'>('all');
  const [rangeInput, setRangeInput] = useState('');
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf');
    if (droppedFiles.length > 0) {
      loadPDF(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadPDF(e.target.files[0]);
    }
  };

  const loadPDF = async (file: File) => {
    setPdfFile(file);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      setPageCount(pdfDoc.getPageCount());
    } catch (error) {
      console.error('Error loading PDF:', error);
      alert('无法读取 PDF 文件');
    }
  };

  const splitPDF = async () => {
    if (!pdfFile) return;
    setIsProcessing(true);

    try {
      const arrayBuffer = await pdfFile.arrayBuffer();
      const sourcePdf = await PDFDocument.load(arrayBuffer);
      const totalPages = sourcePdf.getPageCount();

      const ranges: { start: number; end: number }[] = [];

      if (splitMode === 'all') {
        for (let i = 0; i < totalPages; i++) {
          ranges.push({ start: i, end: i + 1 });
        }
      } else if (splitMode === 'single') {
        for (let i = 0; i < totalPages; i++) {
          ranges.push({ start: i, end: i + 1 });
        }
      } else if (splitMode === 'range' && rangeInput) {
        const parts = rangeInput.split(',').map(s => s.trim());
        for (const part of parts) {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(n => parseInt(n.trim()) - 1);
            ranges.push({ start, end: end + 1 });
          } else {
            const page = parseInt(part) - 1;
            ranges.push({ start: page, end: page + 1 });
          }
        }
      }

      if (ranges.length === 1) {
        const newPdf = await PDFDocument.create();
        const [page] = await newPdf.copyPages(sourcePdf, [ranges[0].start]);
        newPdf.addPage(page);
        const pdfBytes = await newPdf.save();
        const blob = new Blob([pdfBytes], { type: 'application/pdf' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'split.pdf';
        link.click();
        URL.revokeObjectURL(url);
      } else {
        const zip = new JSZip();
        for (let i = 0; i < ranges.length; i++) {
          const { start, end } = ranges[i];
          const newPdf = await PDFDocument.create();
          const pageIndices: number[] = [];
          for (let p = start; p < end && p < totalPages; p++) {
            pageIndices.push(p);
          }
          const pages = await newPdf.copyPages(sourcePdf, pageIndices);
          pages.forEach(page => newPdf.addPage(page));
          const pdfBytes = await newPdf.save();
          zip.file(`page_${i + 1}.pdf`, pdfBytes);
        }
        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'split_pdfs.zip';
        link.click();
        URL.revokeObjectURL(url);
      }

      alert('拆分完成！');
    } catch (error) {
      console.error('Split error:', error);
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

        <h2 className="text-2xl font-bold mb-6">PDF 拆分</h2>

        {!pdfFile && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="application/pdf" className="hidden" />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-2">拖放 PDF 文件到此处或点击选择</p>
          </div>
        )}

        {pdfFile && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-2xl">📄</span>
                  <div>
                    <p className="font-medium text-gray-800">{pdfFile.name}</p>
                    <p className="text-sm text-gray-500">共 {pageCount} 页</p>
                  </div>
                </div>
                <button onClick={() => { setPdfFile(null); setPageCount(0); }} className="text-sm text-blue-600 hover:underline">
                  更换文件
                </button>
              </div>
            </div>

            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">拆分模式</label>
              <div className="flex flex-wrap gap-4 mb-4">
                <label className="flex items-center">
                  <input type="radio" name="splitMode" value="all" checked={splitMode === 'all'} onChange={() => setSplitMode('all')} className="mr-2" />
                  <span className="text-sm">每页一个文件</span>
                </label>
                <label className="flex items-center">
                  <input type="radio" name="splitMode" value="range" checked={splitMode === 'range'} onChange={() => setSplitMode('range')} className="mr-2" />
                  <span className="text-sm">按范围拆分</span>
                </label>
              </div>

              {splitMode === 'range' && (
                <div>
                  <label className="block text-sm text-gray-600 mb-1">输入页码范围（逗号分隔，如：1-3,5,7-10）</label>
                  <input
                    type="text"
                    value={rangeInput}
                    onChange={(e) => setRangeInput(e.target.value)}
                    placeholder="1-3,5,7-10"
                    className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
                  />
                </div>
              )}
            </div>

            <div className="text-center">
              <button onClick={splitPDF} disabled={isProcessing} className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium disabled:opacity-50">
                {isProcessing ? '处理中...' : '开始拆分'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}