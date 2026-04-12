'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface ImageItem {
  file: File;
  preview: string;
  originalSize: number;
  compressedSize: number;
  compressedUrl?: string;
}

export default function ImageCompressPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [quality, setQuality] = useState(0.8);
  const [maxWidth, setMaxWidth] = useState(1920);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + ' KB';
    return (bytes / (1024 * 1024)).toFixed(2) + ' MB';
  };

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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    addImages(droppedFiles);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      addImages(selectedFiles);
    }
  };

  const addImages = async (files: File[]) => {
    const newImages: ImageItem[] = [];
    for (const file of files) {
      const reader = new FileReader();
      const preview = await new Promise<string>((resolve) => {
        reader.onload = (e) => resolve(e.target?.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push({ file, preview, originalSize: file.size, compressedSize: 0 });
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const compressImages = async () => {
    if (images.length === 0) return;

    setIsProcessing(true);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const result = await compressImage(img.preview, maxWidth, quality);
        setImages(prev => prev.map((item, idx) => 
          idx === i ? { ...item, compressedSize: result.size, compressedUrl: result.url } : item
        ));
      } catch (error) {
        console.error('Compress error:', error);
      }
    }

    setIsProcessing(false);
  };

  const compressImage = (dataUrl: string, maxWidth: number, quality: number): Promise<{ url: string; size: number }> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = (height * maxWidth) / width;
          width = maxWidth;
        }

        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0, width, height);

        const compressedDataUrl = canvas.toDataURL('image/jpeg', quality);
        const base64 = compressedDataUrl.split(',')[1];
        const size = Math.round((base64.length * 3) / 4);
        
        resolve({ url: compressedDataUrl, size });
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const downloadImage = (img: ImageItem) => {
    const url = img.compressedUrl || img.preview;
    const link = document.createElement('a');
    link.href = url;
    link.download = img.file.name.replace(/\.[^.]+$/, '') + '_compressed.jpg';
    link.click();
  };

  const downloadAllAsZip = async () => {
    if (images.length === 0 || !images[0].compressedUrl) return;

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    images.forEach((img, idx) => {
      if (img.compressedUrl) {
        const base64Data = img.compressedUrl.split(',')[1];
        zip.file(`image_${idx + 1}_compressed.jpg`, base64Data, { base64: true });
      }
    });

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'compressed_images.zip';
    link.click();
    URL.revokeObjectURL(url);
  };

  const totalOriginal = images.reduce((acc, img) => acc + img.originalSize, 0);
  const totalCompressed = images.reduce((acc, img) => acc + (img.compressedSize || img.originalSize), 0);
  const savedPercent = totalOriginal > 0 ? Math.round((1 - totalCompressed / totalOriginal) * 100) : 0;

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
          <Link href="/tools?category=图片工具" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回图片工具
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">图片压缩</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">压缩质量</label>
              <div className="flex items-center gap-2">
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="flex-1"
                />
                <span className="text-sm text-gray-600">{Math.round(quality * 100)}%</span>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">最大宽度</label>
              <select
                value={maxWidth}
                onChange={(e) => setMaxWidth(Number(e.target.value))}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="800">800px</option>
                <option value="1024">1024px</option>
                <option value="1920">1920px</option>
                <option value="2560">2560px</option>
                <option value="0">保持原尺寸</option>
              </select>
            </div>
            <div className="flex items-center">
              <button
                onClick={compressImages}
                disabled={images.length === 0 || isProcessing}
                className={`w-full px-4 py-2 rounded text-white font-medium ${
                  images.length === 0 || isProcessing ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700'
                }`}
              >
                {isProcessing ? '压缩中...' : '开始压缩'}
              </button>
            </div>
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
            accept="image/*"
            multiple
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放图片到此处或点击选择</p>
          <p className="text-gray-400 text-sm">支持 PNG、JPG、WebP 等格式</p>
        </div>

        {images.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">已选择 {images.length} 张图片</span>
              <button onClick={() => setImages([])} className="text-sm text-red-600 hover:underline">清空全部</button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative">
                  <img src={img.preview} alt={img.file.name} className="w-full h-24 object-cover rounded" />
                  <button
                    onClick={() => removeImage(idx)}
                    className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full text-xs"
                  >
                    ×
                  </button>
                  {img.compressedSize > 0 && (
                    <div className="mt-1 text-xs text-center">
                      <span className="text-green-600">{formatSize(img.originalSize)}</span>
                      <span className="text-gray-400"> → </span>
                      <span className="text-blue-600">{formatSize(img.compressedSize)}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>
            {totalCompressed > 0 && (
              <div className="mt-4 pt-4 border-t text-center">
                <p className="text-gray-600">
                  原始大小: {formatSize(totalOriginal)} → 压缩后: {formatSize(totalCompressed)}
                  <span className="ml-2 text-green-600 font-medium">节省 {savedPercent}%</span>
                </p>
              </div>
            )}
          </div>
        )}

        {images.some(img => img.compressedUrl) && (
          <div className="text-center">
            <button
              onClick={downloadAllAsZip}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              打包下载全部
            </button>
          </div>
        )}
      </div>
    </div>
  );
}