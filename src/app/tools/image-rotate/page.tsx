'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function ImageRotatePage() {
  const [image, setImage] = useState<{ src: string; name: string } | null>(null);
  const [angle, setAngle] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadImage(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (droppedFiles.length > 0) {
      loadImage(droppedFiles[0]);
    }
  };

  const loadImage = (file: File) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      setImage({ src: e.target?.result as string, name: file.name });
      setAngle(0);
      setFlipH(false);
      setFlipV(false);
    };
    reader.readAsDataURL(file);
  };

  const rotateLeft = () => setAngle(prev => prev - 90);
  const rotateRight = () => setAngle(prev => prev + 90);
  const flipHorizontal = () => setFlipH(prev => !prev);
  const flipVertical = () => setFlipV(prev => !prev);
  const reset = () => {
    setAngle(0);
    setFlipH(false);
    setFlipV(false);
  };

  const downloadTransformed = async () => {
    if (!image) return;
    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;
      
      if (Math.abs(angle) === 90 || Math.abs(angle) === 270) {
        [width, height] = [height, width];
      }
      
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.translate(width / 2, height / 2);
      ctx.rotate((angle * Math.PI) / 180);
      if (flipH) ctx.scale(-1, 1);
      if (flipV) ctx.scale(1, -1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = image.name.replace(/\.[^.]+$/, '') + '_transformed.png';
      link.click();
      setIsProcessing(false);
    };
    img.src = image.src;
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

        <h2 className="text-2xl font-bold mb-6">图片旋转</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex gap-2">
              <button onClick={rotateLeft} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-2">
                <span>↺</span> 左转 90°
              </button>
              <button onClick={rotateRight} className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 flex items-center gap-2">
                <span>↻</span> 右转 90°
              </button>
            </div>
            <div className="flex gap-2">
              <button onClick={flipHorizontal} className={`px-4 py-2 rounded flex items-center gap-2 ${flipH ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                ⇆ 水平翻转
              </button>
              <button onClick={flipVertical} className={`px-4 py-2 rounded flex items-center gap-2 ${flipV ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}>
                ⇅ 垂直翻转
              </button>
            </div>
            <button onClick={reset} className="px-4 py-2 text-gray-600 hover:text-gray-800">
              重置
            </button>
          </div>
          <div className="mt-4 text-sm text-gray-600">
            当前旋转: {angle}° | 水平翻转: {flipH ? '是' : '否'} | 垂直翻转: {flipV ? '是' : '否'}
          </div>
        </div>

        {!image && (
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-gray-600 mb-2">拖放图片到此处或点击选择</p>
            <p className="text-gray-400 text-sm">支持 PNG、JPG、WebP 等格式</p>
          </div>
        )}

        {image && (
          <div className="mb-6">
            <div className="bg-white rounded-lg shadow p-4 mb-4">
              <div className="flex justify-center">
                <img 
                  src={image.src} 
                  alt="Preview" 
                  className="max-w-full max-h-96 object-contain"
                  style={{ 
                    transform: `rotate(${angle}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})`
                  }}
                />
              </div>
            </div>
            <div className="text-center space-x-4">
              <button
                onClick={downloadTransformed}
                disabled={isProcessing}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {isProcessing ? '处理中...' : '下载结果'}
              </button>
              <button
                onClick={() => setImage(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
              >
                更换图片
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}