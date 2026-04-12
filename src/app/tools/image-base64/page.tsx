'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';

interface ImageItem {
  file: File;
  preview: string;
  base64: string;
}

export default function ImageBase64Page() {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [images, setImages] = useState<ImageItem[]>([]);
  const [textInput, setTextInput] = useState('');
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
    if (droppedFiles.length > 0) {
      processFiles(droppedFiles);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files).filter(f => f.type.startsWith('image/'));
      processFiles(selectedFiles);
    }
  };

  const processFiles = async (files: File[]) => {
    const newImages: ImageItem[] = [];
    for (const file of files) {
      const reader = new FileReader();
      const result = await new Promise<string>((resolve) => {
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });
      newImages.push({
        file,
        preview: result,
        base64: result,
      });
    }
    setImages(newImages);
  };

  const decodeBase64 = () => {
    if (!textInput.trim()) {
      alert('请输入 Base64 字符串');
      return;
    }

    try {
      const base64 = textInput.includes(',') ? textInput : `data:image/png;base64,${textInput}`;
      setImages([{
        file: new File(['decoded'], 'decoded.png'),
        preview: base64,
        base64: base64,
      }]);
    } catch (error) {
      alert('无效的 Base64 字符串');
    }
  };

  const copyBase64 = (base64: string) => {
    navigator.clipboard.writeText(base64);
    alert('已复制到剪贴板');
  };

  const downloadBase64 = (base64: string, filename: string) => {
    const link = document.createElement('a');
    link.href = base64;
    link.download = filename;
    link.click();
  };

  const encodeToCSS = (base64: string) => {
    const css = `background-image: url('${base64}');`;
    navigator.clipboard.writeText(css);
    alert('CSS 背景代码已复制');
  };

  const encodeToHTML = (base64: string) => {
    const html = `<img src="${base64}" alt="image" />`;
    navigator.clipboard.writeText(html);
    alert('HTML img 标签已复制');
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

        <h2 className="text-2xl font-bold mb-6">图片 Base64 转换</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex gap-2">
            <button onClick={() => { setMode('encode'); setImages([]); setTextInput(''); }} className={`px-4 py-2 rounded text-sm ${mode === 'encode' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              图片 → Base64
            </button>
            <button onClick={() => { setMode('decode'); setImages([]); setTextInput(''); }} className={`px-4 py-2 rounded text-sm ${mode === 'decode' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
              Base64 → 图片
            </button>
          </div>
        </div>

        {mode === 'encode' && (
          <>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors mb-6 ${
                isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
              }`}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
            >
              <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" multiple className="hidden" />
              <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-gray-600 mb-2">拖放图片到此处或点击选择</p>
            </div>

            {images.length > 0 && (
              <div className="space-y-4">
                {images.map((img, idx) => (
                  <div key={idx} className="bg-white rounded-lg shadow p-4">
                    <div className="flex gap-4">
                      <img src={img.preview} alt="Preview" className="w-24 h-24 object-cover rounded" />
                      <div className="flex-1">
                        <p className="font-medium text-gray-800 mb-2">{img.file.name}</p>
                        <textarea
                          value={img.base64}
                          readOnly
                          className="w-full h-20 text-xs font-mono border rounded p-2 bg-gray-50 resize-none"
                        />
                        <div className="flex gap-2 mt-2">
                          <button onClick={() => copyBase64(img.base64)} className="px-3 py-1 bg-blue-600 text-white rounded text-xs hover:bg-blue-700">
                            复制
                          </button>
                          <button onClick={() => encodeToCSS(img.base64)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">
                            复制 CSS
                          </button>
                          <button onClick={() => encodeToHTML(img.base64)} className="px-3 py-1 bg-gray-200 text-gray-700 rounded text-xs hover:bg-gray-300">
                            复制 HTML
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </>
        )}

        {mode === 'decode' && (
          <div className="bg-white rounded-lg shadow p-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">输入 Base64 字符串</label>
            <textarea
              value={textInput}
              onChange={(e) => setTextInput(e.target.value)}
              placeholder="粘贴 Base64 字符串（支持 data:image/...;base64, 格式）"
              className="w-full h-48 border border-gray-300 rounded p-3 text-sm font-mono resize-none"
            />
            <div className="mt-4 flex gap-2">
              <button onClick={decodeBase64} className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                转换为图片
              </button>
            </div>

            {images.length > 0 && (
              <div className="mt-6 p-4 bg-gray-50 rounded">
                <p className="text-sm font-medium text-gray-700 mb-2">解码结果：</p>
                <img src={images[0].preview} alt="Decoded" className="max-w-full max-h-64 rounded" />
                <div className="mt-4 flex gap-2">
                  <button onClick={() => downloadBase64(images[0].preview, 'decoded.png')} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm">
                    下载图片
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}