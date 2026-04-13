'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import mermaid from 'mermaid';

function MermaidDiagram({ code }: { code: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError('');
      } catch (err: any) {
        setError(err.message || '渲染失败');
        setSvg('');
      }
    };
    renderDiagram();
  }, [code]);

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded text-red-600 text-sm">
        Mermaid 渲染错误: {error}
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex justify-center p-4"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}

function CodeBlock(props: any) {
  const { className, children } = props;
  const match = /language-(\w+)/.exec(className || '');
  const isMermaid = match && match[1] === 'mermaid';
  
  if (isMermaid) {
    return <MermaidDiagram code={String(children)} />;
  }
  
  return (
    <pre className={className}>
      <code>{children}</code>
    </pre>
  );
}

export default function MarkdownEditorPage() {
  const [file, setFile] = useState<File | null>(null);
  const [content, setContent] = useState('');
  const [hasChanges, setHasChanges] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    mermaid.initialize({
      startOnLoad: false,
      theme: 'default',
      securityLevel: 'loose',
    });
  }, []);

  const mermaidRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (mermaidRef.current) {
      mermaid.run({
        nodes: mermaidRef.current.querySelectorAll('.mermaid'),
      }).catch((err) => {
        console.error('Mermaid render error:', err);
      });
    }
  }, [content, showPreview]);

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
      f.name.endsWith('.md') || f.name.endsWith('.markdown') || f.name.endsWith('.txt')
    );
    if (droppedFiles.length > 0) {
      loadFile(droppedFiles[0]);
    } else {
      alert('请选择 Markdown 文件');
    }
  };

  const loadFile = async (selectedFile: File) => {
    try {
      const text = await selectedFile.text();
      setFile(selectedFile);
      setContent(text);
      setHasChanges(false);
    } catch (error) {
      console.error('Error loading file:', error);
      alert('无法读取文件');
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      loadFile(e.target.files[0]);
    }
  };

  const handleOpenFile = () => {
    fileInputRef.current?.click();
  };

  const handleContentChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setContent(e.target.value);
    setHasChanges(true);
  };

  const handleSave = () => {
    const blob = new Blob([content], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file?.name || 'document.md';
    link.click();
    URL.revokeObjectURL(url);
    setHasChanges(false);
  };

  const handleReset = () => {
    setFile(null);
    setContent('');
    setHasChanges(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleNewFile = () => {
    setFile(new File(['# 新文档\n\n开始编写...'], '新建文档.md', { type: 'text/markdown' }));
    setContent('# 新文档\n\n开始编写...');
    setHasChanges(false);
  };

  const insertText = (before: string, after: string = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = content.substring(start, end);
    const newText = content.substring(0, start) + before + selectedText + after + content.substring(end);
    
    setContent(newText);
    setHasChanges(true);
    
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, start + before.length + selectedText.length);
    }, 0);
  };

  const toolbarActions = [
    { label: 'B', title: '粗体', action: () => insertText('**', '**') },
    { label: 'I', title: '斜体', action: () => insertText('*', '*') },
    { label: 'S', title: '删除线', action: () => insertText('~~', '~~') },
    { label: 'H1', title: '标题1', action: () => insertText('# ') },
    { label: 'H2', title: '标题2', action: () => insertText('## ') },
    { label: 'H3', title: '标题3', action: () => insertText('### ') },
    { label: '•', title: '无序列表', action: () => insertText('- ') },
    { label: '1.', title: '有序列表', action: () => insertText('1. ') },
    { label: '[]', title: '复选框', action: () => insertText('- [ ] ') },
    { label: '🔗', title: '链接', action: () => insertText('[', '](url)') },
    { label: '📷', title: '图片', action: () => insertText('![alt](', ')') },
    { label: '```', title: '代码块', action: () => insertText('```\n', '\n```') },
    { label: '>', title: '引用', action: () => insertText('> ') },
    { label: '---', title: '分割线', action: () => insertText('\n---\n') },
  ];

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
        <div className="mb-6 flex items-center justify-between">
          <Link href="/tools?category=文档转换" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文档转换
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">Markdown 编辑器</h2>

        {!content ? (
          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-colors ${
              isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={handleOpenFile}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              accept=".md,.markdown,.txt"
              className="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <p className="text-gray-600 mb-2">拖放 Markdown 文件到此处</p>
            <p className="text-gray-400 text-sm">支持 .md, .markdown, .txt 格式</p>
            <div className="mt-4 flex justify-center gap-4">
              <button
                onClick={(e) => { e.stopPropagation(); handleOpenFile(); }}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                打开文件
              </button>
              <button
                onClick={(e) => { e.stopPropagation(); handleNewFile(); }}
                className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                新建文档
              </button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(100vh-200px)]">
            <div className="flex justify-between items-center mb-4">
              <div className="flex items-center gap-4">
                <span className="text-gray-700 font-medium">{file?.name || '新建文档.md'}</span>
                {hasChanges && <span className="text-yellow-600 text-sm">(已修改)</span>}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleOpenFile}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 text-sm"
                >
                  打开文件
                </button>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  accept=".md,.markdown,.txt"
                  className="hidden"
                />
                <button
                  onClick={handleSave}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 text-sm font-medium"
                >
                  保存
                </button>
                <button
                  onClick={() => setShowPreview(!showPreview)}
                  className={`px-4 py-2 rounded-lg text-sm ${showPreview ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}
                >
                  {showPreview ? '隐藏预览' : '显示预览'}
                </button>
                <button
                  onClick={handleReset}
                  className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 text-sm"
                >
                  关闭
                </button>
              </div>
            </div>

            <div className="flex-1 flex gap-4">
              <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
                <div className="flex items-center gap-1 p-2 border-b bg-gray-50 flex-wrap">
                  {toolbarActions.map((action, i) => (
                    <button
                      key={i}
                      onClick={action.action}
                      title={action.title}
                      className="px-2 py-1 text-sm bg-white border rounded hover:bg-gray-100 min-w-[32px]"
                    >
                      {action.label}
                    </button>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={handleContentChange}
                  className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm"
                  placeholder="开始编写 Markdown..."
                />
              </div>

              {showPreview && (
                <div className="flex-1 bg-white rounded-lg shadow overflow-hidden">
                  <div className="p-2 border-b bg-gray-50 text-sm text-gray-600">
                    预览
                  </div>
                  <div ref={mermaidRef} className="p-4 overflow-auto h-full prose prose-sm max-w-none">
                    <ReactMarkdown 
                      remarkPlugins={[remarkGfm]}
                      components={{
                        code: CodeBlock,
                      }}
                    >
                      {content}
                    </ReactMarkdown>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}