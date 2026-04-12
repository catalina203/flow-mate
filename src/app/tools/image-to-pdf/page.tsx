'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { PDFDocument } from 'pdf-lib';

interface ImageFile {
  file: File;
  preview: string;
}

export default function ImageToPdfPage() {
  const [images, setImages] = useState<ImageFile[]>([]);
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
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => 
      f.type.startsWith('image/')
    );
    if (droppedFiles.length > 0) {
      addImages(droppedFiles);
    } else {
      alert('请选择图片文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => 
        f.type.startsWith('image/')
      );
      if (selectedFiles.length > 0) {
        addImages(selectedFiles);
      }
    }
  };

  const addImages = async (files: File[]) => {
    const newImages: ImageFile[] = [];
    
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

  const convertToPdf = async () => {
    if (images.length === 0) {
      alert('请先选择图片');
      return;
    }

    setIsProcessing(true);

    try {
      const pdfDoc = await PDFDocument.create();
      
      for (const img of images) {
        const imgData = await fetch(img.preview).then(r => r.arrayBuffer());
        let embeddedImg;
        
        if (img.file.type === 'image/png') {
          embeddedImg = await pdfDoc.embedPng(imgData);
        } else if (img.file.type === 'image/jpeg') {
          embeddedImg = await pdfDoc.embedJpg(imgData);
        } else {
          continue;
        }
        
        const page = pdfDoc.addPage([embeddedImg.width, embeddedImg.height]);
        page.drawImage(embeddedImg, {
          x: 0,
          y: 0,
          width: embeddedImg.width,
          height: embeddedImg.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'images.pdf';
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error converting to PDF:', error);
      alert('转换失败，请确保图片格式正确');
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

        <h2 className="text-2xl font-bold mb-6">图片转 PDF</h2>

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
            accept="image/png,image/jpeg,image/jpg"
            multiple
            className="hidden"
          />
          <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <p className="text-gray-600 mb-2">拖放图片到此处或点击选择</p>
          <p className="text-gray-400 text-sm">支持 PNG、JPG 格式，可多选</p>
        </div>

        {images.length > 0 && (
          <div className="mb-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-medium text-gray-700">已选择 {images.length} 张图片</h3>
              <button 
                onClick={() => setImages([])} 
                className="text-sm text-red-600 hover:text-red-700"
              >
                清空全部
              </button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {images.map((img, idx) => (
                <div key={idx} className="relative bg-white rounded-lg shadow p-2">
                  <img src={img.preview} alt={img.file.name} className="w-full h-24 object-cover rounded" />
                  <p className="text-xs text-gray-500 mt-1 truncate">{img.file.name}</p>
                  <div className="absolute top-1 right-1 flex gap-1">
                    <button
                      onClick={() => moveImage(idx, 'up')}
                      disabled={idx === 0}
                      className="w-6 h-6 bg-gray-800 text-white rounded text-xs disabled:opacity-50"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveImage(idx, 'down')}
                      disabled={idx === images.length - 1}
                      className="w-6 h-6 bg-gray-800 text-white rounded text-xs disabled:opacity-50"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeImage(idx)}
                      className="w-6 h-6 bg-red-500 text-white rounded text-xs"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {images.length > 0 && (
          <div className="text-center">
            <button
              onClick={convertToPdf}
              disabled={isProcessing}
              className={`px-8 py-3 rounded-lg text-white font-medium ${
                isProcessing 
                  ? 'bg-gray-400 cursor-not-allowed' 
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {isProcessing ? '转换中...' : '转换为 PDF'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
