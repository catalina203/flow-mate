'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';

interface CropArea {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function ImageCropPage() {
  const [image, setImage] = useState<{ src: string; name: string } | null>(null);
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  const [isProcessing, setIsProcessing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setImage({ src: e.target?.result as string, name: file.name });
        setCropArea({ x: 0, y: 0, width: img.width, height: img.height });
      };
      img.src = e.target?.result as string;
    };
    reader.readAsDataURL(file);
  };

  const updateCropArea = (newArea: Partial<CropArea>) => {
    setCropArea(prev => ({
      ...prev,
      ...newArea,
      x: Math.max(0, Math.min(newArea.x ?? prev.x, imageSize.width - prev.width)),
      y: Math.max(0, Math.min(newArea.y ?? prev.y, imageSize.height - prev.height)),
      width: Math.max(10, Math.min(newArea.width ?? prev.width, imageSize.width - prev.x)),
      height: Math.max(10, Math.min(newArea.height ?? prev.height, imageSize.height - prev.y)),
    }));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !image) return;
    const dx = e.clientX - dragStart.x;
    const dy = e.clientY - dragStart.y;
    updateCropArea({
      x: cropArea.x + dx,
      y: cropArea.y + dy,
    });
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const setCropRatio = (ratio: string) => {
    if (!image) return;
    const [w, h] = ratio.split(':').map(Number);
    const imageRatio = imageSize.width / imageSize.height;
    const cropRatio = w / h;
    
    let width, height;
    if (cropRatio > imageRatio) {
      width = imageSize.width;
      height = width / cropRatio;
    } else {
      height = imageSize.height;
      width = height * cropRatio;
    }
    
    setCropArea({
      x: (imageSize.width - width) / 2,
      y: (imageSize.height - height) / 2,
      width,
      height,
    });
  };

  const downloadCropped = () => {
    if (!image || !canvasRef.current) return;
    setIsProcessing(true);

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const img = new Image();
    img.onload = () => {
      canvas.width = cropArea.width;
      canvas.height = cropArea.height;
      ctx.drawImage(img, cropArea.x, cropArea.y, cropArea.width, cropArea.height, 0, 0, cropArea.width, cropArea.height);

      const url = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = url;
      link.download = image.name.replace(/\.[^.]+$/, '') + '_cropped.png';
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

        <h2 className="text-2xl font-bold mb-6">图片裁剪</h2>

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
          <>
            <div className="bg-white rounded-lg shadow p-4 mb-6">
              <div className="flex flex-wrap gap-2 mb-4">
                <span className="text-sm text-gray-600">裁剪比例:</span>
                <button onClick={() => setCropRatio('1:1')} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">1:1</button>
                <button onClick={() => setCropRatio('4:3')} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">4:3</button>
                <button onClick={() => setCropRatio('16:9')} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">16:9</button>
                <button onClick={() => setCropRatio('3:2')} className="px-3 py-1 bg-gray-200 rounded text-sm hover:bg-gray-300">3:2</button>
                <button onClick={() => setCropArea({ x: 0, y: 0, width: imageSize.width, height: imageSize.height })} className="px-3 py-1 bg-blue-100 text-blue-600 rounded text-sm hover:bg-blue-200">整图</button>
                <button onClick={() => setImage(null)} className="ml-auto text-sm text-red-600 hover:underline">更换图片</button>
              </div>
              <p className="text-sm text-gray-500">提示: 拖动选框可移动裁剪区域</p>
            </div>

            <div className="relative inline-block mx-auto mb-6">
              <img src={image.src} alt="Crop" className="max-w-full" style={{ maxHeight: '500px' }} />
              <div
                className="absolute border-2 border-blue-500 bg-blue-500/20 cursor-move"
                style={{
                  left: `${(cropArea.x / imageSize.width) * 100}%`,
                  top: `${(cropArea.y / imageSize.height) * 100}%`,
                  width: `${(cropArea.width / imageSize.width) * 100}%`,
                  height: `${(cropArea.height / imageSize.height) * 100}%`,
                }}
                onMouseDown={handleMouseDown}
                onMouseMove={handleMouseMove}
                onMouseUp={handleMouseUp}
                onMouseLeave={handleMouseUp}
              />
            </div>

            <div className="text-center">
              <button
                onClick={downloadCropped}
                disabled={isProcessing}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
              >
                {isProcessing ? '处理中...' : '下载裁剪结果'}
              </button>
            </div>
          </>
        )}

        <canvas ref={canvasRef} className="hidden" />
      </div>
    </div>
  );
}