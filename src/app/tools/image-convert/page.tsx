'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface ImageItem {
  file: File;
  preview: string;
}

export default function ImageConvertPage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [outputFormat, setOutputFormat] = useState<'png' | 'jpg' | 'webp'>('png');
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
      newImages.push({ file, preview });
    }
    setImages(prev => [...prev, ...newImages]);
  };

  const removeImage = (index: number) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const convertImages = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      try {
        const converted = await convertImage(img.preview, outputFormat);
        const link = document.createElement('a');
        link.href = converted;
        link.download = img.file.name.replace(/\.[^.]+$/, '') + '.' + outputFormat;
        link.click();
      } catch (error) {
        console.error('Convert error:', error);
      }
    }

    setIsProcessing(false);
    alert('转换完成！');
  };

  const convertImage = (dataUrl: string, format: string): Promise<string> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas not supported'));
          return;
        }
        ctx.drawImage(img, 0, 0);
        const mimeType = format === 'jpg' ? 'image/jpeg' : format === 'webp' ? 'image/webp' : 'image/png';
        resolve(canvas.toDataURL(mimeType));
      };
      img.onerror = reject;
      img.src = dataUrl;
    });
  };

  const downloadAllAsZip = async () => {
    if (images.length === 0) return;
    setIsProcessing(true);

    const JSZip = (await import('jszip')).default;
    const zip = new JSZip();

    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const converted = await convertImage(img.preview, outputFormat);
      const base64Data = converted.split(',')[1];
      zip.file(`${img.file.name.replace(/\.[^.]+$/, '')}.${outputFormat}`, base64Data, { base64: true });
    }

    const blob = await zip.generateAsync({ type: 'blob' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_images.zip`;
    link.click();
    URL.revokeObjectURL(url);
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
          <Link href="/tools?category=图片工具" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回图片工具
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">图片格式转换</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <label className="text-sm font-medium text-gray-700">输出格式:</label>
            <select
              value={outputFormat}
              onChange={(e) => setOutputFormat(e.target.value as 'png' | 'jpg' | 'webp')}
              className="border border-gray-300 rounded px-3 py-2 text-sm"
            >
              <option value="png">PNG</option>
              <option value="jpg">JPG</option>
              <option value="webp">WebP</option>
            </select>
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
          <p className="text-gray-400 text-sm">支持 PNG、JPG、WebP、BMP 等格式</p>
        </div>

        {images.length > 0 && (
          <div className="mb-6">
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
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="text-center space-x-4">
            <button
              onClick={convertImages}
              disabled={isProcessing}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              {isProcessing ? '转换中...' : '逐个下载'}
            </button>
            <button
              onClick={downloadAllAsZip}
              disabled={isProcessing}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              打包下载 ZIP
            </button>
          </div>
        )}
      </div>
    </div>
  );
}