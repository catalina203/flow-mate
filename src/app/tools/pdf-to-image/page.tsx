'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface PagePreview {
  pageNum: number;
  dataUrl: string;
}

export default function PdfToImagePage() {
  const [files, setFiles] = useState<File[]>([]);
  const [pageImages, setPageImages] = useState<PagePreview[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [progress, setProgress] = useState(0);
  const [scale, setScale] = useState(2);
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
      convertPdfToImages(droppedFiles[0]);
    } else {
      alert('请选择 PDF 文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFiles([e.target.files[0]]);
      convertPdfToImages(e.target.files[0]);
    }
  };

  const convertPdfToImages = async (file: File) => {
    setIsProcessing(true);
    setPageImages([]);
    setProgress(0);

    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await pdfjsRef.current.getDocument({ data: arrayBuffer }).promise;
      const pageCount = pdfDoc.numPages;
      const images: PagePreview[] = [];

      for (let i = 1; i <= pageCount; i++) {
        const page = await pdfDoc.getPage(i);
        const viewport = page.getViewport({ scale });
        
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        if (context) {
          await page.render({ canvasContext: context, viewport, canvas }).promise;
          const dataUrl = canvas.toDataURL('image/png');
          images.push({ pageNum: i, dataUrl });
        }

        setProgress(Math.round((i / pageCount) * 100));
      }

      setPageImages(images);
    } catch (error) {
      console.error('Error converting PDF:', error);
      alert('转换失败');
    }

    setIsProcessing(false);
  };

  const downloadImage = (dataUrl: string, pageNum: number) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `page_${pageNum}.png`;
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (pageImages.length === 0) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    pageImages.forEach(({ dataUrl, pageNum }) => {
      const base64Data = dataUrl.split(',')[1];
      zip.file(`page_${pageNum}.png`, base64Data, { base64: true });
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'pdf_pages.zip';
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

        <h2 className="text-2xl font-bold mb-6">PDF 转图片</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">图片质量</label>
          <div className="flex items-center gap-4">
            <input
              type="range"
              min="1"
              max="3"
              step="0.5"
              value={scale}
              onChange={(e) => setScale(Number(e.target.value))}
              className="w-32"
            />
            <span className="text-sm text-gray-600">清晰度: {scale}x</span>
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
            accept="application/pdf"
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放 PDF 文件到此处或点击选择</p>
          <p className="text-gray-400 text-sm">将 PDF 每一页转换为 PNG 图片</p>
        </div>

        {files.length > 0 && (
          <div className="mb-6">
            <h3 className="font-medium text-gray-700 mb-2">已选择文件:</h3>
            <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-sm">
              {files[0].name}
            </span>
          </div>
        )}

        {isProcessing && (
          <div className="text-center py-8">
            <div className="w-full max-w-md mx-auto bg-gray-200 rounded-full h-2 mb-2">
              <div className="bg-blue-600 h-2 rounded-full transition-all" style={{ width: `${progress}%` }}></div>
            </div>
            <p className="text-gray-600">正在转换... {progress}%</p>
          </div>
        )}

        {pageImages.length > 0 && !isProcessing && (
          <>
            <div className="flex justify-between items-center mb-4">
              <p className="text-gray-600">共 {pageImages.length} 页</p>
              <button
                onClick={downloadAllAsZip}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                打包下载 ZIP
              </button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {pageImages.map(({ pageNum, dataUrl }) => (
                <div key={pageNum} className="bg-white rounded-lg shadow overflow-hidden">
                  <div className="relative">
                    <img src={dataUrl} alt={`Page ${pageNum}`} className="w-full" />
                    <div className="absolute top-2 right-2 bg-black/50 text-white px-2 py-1 rounded text-sm">
                      第 {pageNum} 页
                    </div>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={() => downloadImage(dataUrl, pageNum)}
                      className="w-full px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                    >
                      下载
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}