'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

export default function WatermarkPage() {
  const [image, setImage] = useState<{ src: string; name: string } | null>(null);
  const [watermarkText, setWatermarkText] = useState('Flow Mate');
  const [position, setPosition] = useState('bottom-right');
  const [fontSize, setFontSize] = useState(24);
  const [opacity, setOpacity] = useState(0.5);
  const [color, setColor] = useState('#ffffff');
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
    };
    reader.readAsDataURL(file);
  };

  const addWatermark = async () => {
    if (!image) {
      alert('请先选择图片');
      return;
    }

    setIsProcessing(true);

    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      ctx.drawImage(img, 0, 0);

      ctx.font = `${fontSize}px Arial`;
      ctx.fillStyle = color;
      ctx.globalAlpha = opacity;

      const textWidth = ctx.measureText(watermarkText).width;
      const padding = 20;
      let x: number, y: number;

      switch (position) {
        case 'top-left':
          x = padding;
          y = fontSize + padding;
          break;
        case 'top-right':
          x = img.width - textWidth - padding;
          y = fontSize + padding;
          break;
        case 'bottom-left':
          x = padding;
          y = img.height - padding;
          break;
        case 'bottom-right':
        default:
          x = img.width - textWidth - padding;
          y = img.height - padding;
          break;
        case 'center':
          x = (img.width - textWidth) / 2;
          y = img.height / 2;
          break;
      }

      ctx.fillText(watermarkText, x, y);

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = image.name.replace(/\.[^.]+$/, '') + '_watermarked.png';
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

        <h2 className="text-2xl font-bold mb-6">添加水印</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">水印文字</label>
              <input
                type="text"
                value={watermarkText}
                onChange={(e) => setWatermarkText(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">位置</label>
              <select
                value={position}
                onChange={(e) => setPosition(e.target.value)}
                className="w-full border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="top-left">左上</option>
                <option value="top-right">右上</option>
                <option value="bottom-left">左下</option>
                <option value="bottom-right">右下</option>
                <option value="center">居中</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">字体大小: {fontSize}px</label>
              <input
                type="range"
                min="12"
                max="72"
                value={fontSize}
                onChange={(e) => setFontSize(Number(e.target.value))}
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">透明度: {Math.round(opacity * 100)}%</label>
              <input
                type="range"
                min="0.1"
                max="1"
                step="0.1"
                value={opacity}
                onChange={(e) => setOpacity(Number(e.target.value))}
                className="w-full"
              />
            </div>
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">颜色</label>
            <div className="flex gap-2">
              <button onClick={() => setColor('#ffffff')} className={`w-8 h-8 rounded border-2 ${color === '#ffffff' ? 'border-blue-500' : 'border-gray-300'}`} style={{ backgroundColor: '#ffffff' }} />
              <button onClick={() => setColor('#000000')} className={`w-8 h-8 rounded border-2 ${color === '#000000' ? 'border-blue-500' : 'border-gray-300'}`} style={{ backgroundColor: '#000000' }} />
              <input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="w-8 h-8" />
            </div>
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
              <div className="flex items-center gap-3">
                <img src={image.src} alt="Preview" className="w-20 h-20 object-cover rounded" />
                <div>
                  <p className="font-medium text-gray-800">{image.name}</p>
                  <button onClick={() => setImage(null)} className="text-sm text-red-600 hover:underline">更换图片</button>
                </div>
              </div>
            </div>
            <div className="text-center">
              <button
                onClick={addWatermark}
                disabled={isProcessing}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {isProcessing ? '处理中...' : '添加水印并下载'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}