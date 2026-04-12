'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface ImageItem {
  file: File;
  preview: string;
}

export default function ImageMergePage() {
  const [images, setImages] = useState<ImageItem[]>([]);
  const [direction, setDirection] = useState<'horizontal' | 'vertical'>('horizontal');
  const [spacing, setSpacing] = useState(0);
  const [backgroundColor, setBackgroundColor] = useState('#ffffff');
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

  const moveImage = (index: number, direction: 'up' | 'down') => {
    const newImages = [...images];
    if (direction === 'up' && index > 0) {
      [newImages[index - 1], newImages[index]] = [newImages[index], newImages[index - 1]];
    } else if (direction === 'down' && index < newImages.length - 1) {
      [newImages[index], newImages[index + 1]] = [newImages[index + 1], newImages[index]];
    }
    setImages(newImages);
  };

  const mergeImages = async () => {
    if (images.length < 2) {
      alert('请至少选择 2 张图片');
      return;
    }

    setIsProcessing(true);

    const loadedImages: HTMLImageElement[] = await Promise.all(
      images.map(img => {
        return new Promise<HTMLImageElement>((resolve) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.src = img.preview;
        });
      })
    );

    let totalWidth = 0;
    let totalHeight = 0;
    const gap = spacing;

    if (direction === 'horizontal') {
      const maxHeight = Math.max(...loadedImages.map(img => img.height));
      totalWidth = loadedImages.reduce((sum, img) => sum + img.width, 0) + gap * (loadedImages.length - 1);
      totalHeight = maxHeight;
    } else {
      const maxWidth = Math.max(...loadedImages.map(img => img.width));
      totalHeight = loadedImages.reduce((sum, img) => sum + img.height, 0) + gap * (loadedImages.length - 1);
      totalWidth = maxWidth;
    }

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = totalHeight;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.fillStyle = backgroundColor;
    ctx.fillRect(0, 0, totalWidth, totalHeight);

    let currentX = 0;
    let currentY = 0;

    for (const img of loadedImages) {
      if (direction === 'horizontal') {
        ctx.drawImage(img, currentX, (totalHeight - img.height) / 2);
        currentX += img.width + gap;
      } else {
        ctx.drawImage(img, (totalWidth - img.width) / 2, currentY);
        currentY += img.height + gap;
      }
    }

    const url = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = url;
    link.download = 'merged_image.png';
    link.click();
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

        <h2 className="text-2xl font-bold mb-6">图片拼接</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">拼接方向</label>
              <select
                value={direction}
                onChange={(e) => setDirection(e.target.value as 'horizontal' | 'vertical')}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="horizontal">水平拼接 (← →)</option>
                <option value="vertical">垂直拼接 (↑ ↓)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">间距: {spacing}px</label>
              <input
                type="range"
                min="0"
                max="50"
                value={spacing}
                onChange={(e) => setSpacing(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">背景颜色</label>
              <div className="flex gap-2">
                <button onClick={() => setBackgroundColor('#ffffff')} className={`w-8 h-8 rounded border-2 ${backgroundColor === '#ffffff' ? 'border-blue-500' : 'border-gray-300'}`} style={{ backgroundColor: '#ffffff' }} />
                <button onClick={() => setBackgroundColor('#000000')} className={`w-8 h-8 rounded border-2 ${backgroundColor === '#000000' ? 'border-blue-500' : 'border-gray-300'}`} style={{ backgroundColor: '#000000' }} />
                <input type="color" value={backgroundColor} onChange={(e) => setBackgroundColor(e.target.value)} className="w-8 h-8" />
              </div>
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
          <p className="text-gray-400 text-sm">请选择至少 2 张图片</p>
        </div>

        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <span className="font-medium text-gray-700">已选择 {images.length} 张图片</span>
              <button onClick={() => setImages([])} className="text-sm text-red-600 hover:underline">清空全部</button>
            </div>
            <div className="flex flex-wrap gap-2">
              {images.map((img, idx) => (
                <div key={idx} className="relative group">
                  <img src={img.preview} alt={img.file.name} className="w-20 h-20 object-cover rounded" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                    <button onClick={() => moveImage(idx, 'up')} className="w-6 h-6 bg-white rounded text-xs">↑</button>
                    <button onClick={() => moveImage(idx, 'down')} className="w-6 h-6 bg-white rounded text-xs">↓</button>
                    <button onClick={() => removeImage(idx)} className="w-6 h-6 bg-red-500 text-white rounded text-xs">×</button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 text-center bg-black/50 text-white text-xs truncate">
                    {idx + 1}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length >= 2 && (
          <div className="text-center">
            <button
              onClick={mergeImages}
              disabled={isProcessing}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
            >
              {isProcessing ? '处理中...' : '拼接并下载'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}