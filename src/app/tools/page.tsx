'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface Tool {
  name: string;
  description: string;
  icon: string;
  href: string;
  category: string;
  comingSoon?: boolean;
}

const tools: Tool[] = [
  // 图表设计
  { name: 'Markdown 编辑器', description: '编辑 Markdown 笔记文档', icon: '📋', href: '/tools/markdown-editor', category: '图表设计' },
  { name: '图表编辑器', description: '绘制流程图、序列图等图表', icon: '📊', href: '/tools/diagram-editor', category: '图表设计' },

  // 办公文档
  { name: 'Word 预览/编辑', description: '在线预览和编辑 Word 文档', icon: '📝', href: '/tools/word', category: '办公文档' },
  { name: 'Excel 预览/编辑', description: '在线预览和编辑 Excel 表格', icon: '📗', href: '/tools/excel', category: '办公文档' },
  { name: 'PPT 预览/编辑', description: '在线预览和编辑 PowerPoint 文档', icon: '🖼️', href: '/tools/ppt', category: '办公文档' },

  // 文档转换
  { name: 'PDF 转 Excel', description: '将 PDF 表格提取为 Excel 文件', icon: '📄', href: '/tools/pdf-to-excel', category: '文档转换' },
  { name: '图片转 PDF', description: '将图片合并转换为 PDF 文件', icon: '📑', href: '/tools/image-to-pdf', category: '文档转换' },
  { name: 'Excel 合并', description: '将多个 Excel 文件合并为一个', icon: '🔗', href: '/tools/excel-merge', category: '文档转换' },
  { name: 'Excel 拆分', description: '按 sheet 或行数拆分 Excel', icon: '✂️', href: '/tools/excel-split', category: '文档转换' },
  { name: 'PDF 转图片', description: '将 PDF 每一页转换为图片', icon: '🖼️', href: '/tools/pdf-to-image', category: '文档转换' },
  { name: 'Word 转 PDF', description: '将 Word 文档转换为 PDF', icon: '📝', href: '/tools/word-to-pdf', category: '文档转换' },
  { name: 'PDF 合并', description: '将多个 PDF 文件合并为一个', icon: '📑', href: '/tools/pdf-merge', category: '文档转换' },
  { name: 'PDF 拆分', description: '将 PDF 拆分为多个文件', icon: '✂️', href: '/tools/pdf-split', category: '文档转换' },

  // 数据处理
  { name: '数据去重', description: '删除重复行，保留指定列重复项', icon: '🧹', href: '/tools/data-processing', category: '数据处理' },
  { name: '数据排序', description: '按指定列升序或降序排列', icon: '↕️', href: '/tools/data-processing', category: '数据处理' },
  { name: '数据筛选', description: '按条件筛选保留数据行', icon: '🔍', href: '/tools/data-processing', category: '数据处理' },
  { name: '列操作', description: '删除、重命名、调整列顺序', icon: '📊', href: '/tools/data-processing', category: '数据处理' },
  { name: '数据统计', description: '求和、平均值、计数等汇总', icon: '📈', href: '/tools/data-processing', category: '数据处理' },
  { name: '数据清洗', description: '去除空行、修正格式、文本处理', icon: '✨', href: '/tools/data-processing', category: '数据处理' },
  
  // 文本处理
  { name: '批量替换', description: '批量替换文本中的关键词', icon: '🔄', href: '/tools/batch-replace', category: '文本处理' },
  { name: '文本比对', description: '对比两个文本文件的差异', icon: '⚖️', href: '/tools/diff', category: '文本处理' },
  { name: '关键词提取', description: '从文本中提取关键词或短语', icon: '🏷️', href: '/tools/keywords', category: '文本处理' },
  { name: '格式转换', description: 'JSON/XML/CSV 格式互转', icon: '🔃', href: '/tools/format-convert', category: '文本处理' },
  { name: '行合并', description: '合并多行文本或列数据', icon: '➕', href: '/tools/merge-rows', category: '文本处理' },
  { name: '行拆分', description: '按分隔符拆分列数据', icon: '➖', href: '/tools/split-rows', category: '文本处理' },
  
  // 图片工具
  { name: '图片压缩', description: '压缩图片文件大小', icon: '🗜️', href: '/tools/image-compress', category: '图片工具' },
  { name: '图片裁剪', description: '裁剪图片指定区域', icon: '✂️', href: '/tools/image-crop', category: '图片工具' },
  { name: '格式转换', description: 'PNG/JPG/WebP 格式互转', icon: '🎨', href: '/tools/image-convert', category: '图片工具' },
  { name: '添加水印', description: '添加文字或图片水印', icon: '💧', href: '/tools/watermark', category: '图片工具' },
  { name: '图片旋转', description: '旋转或翻转图片', icon: '🔄', href: '/tools/image-rotate', category: '图片工具' },
  { name: '图片拼接', description: '水平或垂直拼接多张图片', icon: '🖼️', href: '/tools/image-merge', category: '图片工具' },
  { name: '图片 Base64', description: '图片与 Base64 互转', icon: '🔢', href: '/tools/image-base64', category: '图片工具' },
  
  // 文件压缩
  { name: 'ZIP 压缩', description: '将文件或文件夹压缩为 ZIP', icon: '📦', href: '/tools/zip', category: '文件压缩' },
  { name: 'ZIP 解压', description: '解压 ZIP/RAR/7z 文件', icon: '📂', href: '/tools/unzip', category: '文件压缩' },
  { name: '批量重命名', description: '批量修改文件名', icon: '✏️', href: '/tools/batch-rename', category: '文件压缩' },
  { name: '文件分类', description: '按类型将文件分类整理', icon: '📁', href: '/tools/file-sort', category: '文件压缩' },
  
  // 编码转换
  { name: '时间戳转换', description: 'Unix时间戳 ↔ 日期时间', icon: '⏰', href: '/tools/timestamp', category: '编码转换' },
  { name: 'JSON 格式化', description: '美化、压缩、验证 JSON', icon: '📋', href: '/tools/json-format', category: '编码转换' },
  { name: 'URL 编码', description: 'URL 编码/解码 (%编码)', icon: '🔗', href: '/tools/url-encode', category: '编码转换' },
  { name: 'Base64 编码', description: 'Base64 编码/解码', icon: '📝', href: '/tools/base64', category: '编码转换' },
  { name: 'HTML 编码', description: 'HTML 实体编码/解码', icon: '🏷️', href: '/tools/html-encode', category: '编码转换' },
  { name: 'Hash 加密', description: 'MD5/SHA 等哈希加密', icon: '🔐', href: '/tools/hash', category: '编码转换' },
  { name: 'UUID 生成', description: '生成 UUID/GUID', icon: '🎲', href: '/tools/uuid', category: '编码转换' },
];

const categories = ['办公文档', '图表设计', '文档转换', '数据处理', '文本处理', '图片工具', '文件压缩', '编码转换'];

const categoryIcons: Record<string, string> = {
  '办公文档': '📄',
  '图表设计': '📊',
  '文档转换': '📑',
  '数据处理': '📊',
  '文本处理': '📝',
  '图片工具': '🖼️',
  '文件压缩': '📦',
  '编码转换': '🔣',
};

function ToolsContent() {
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get('category');

  const filteredTools = categoryParam 
    ? tools.filter(t => t.category === decodeURIComponent(categoryParam))
    : tools;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Flow Mate</h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-gray-700 hover:text-blue-600 font-medium">首页</Link>
            <Link href="/tools" className="text-blue-600 font-medium border-b-2 border-blue-600">工具</Link>
            <Link href="/tutorial" className="text-gray-700 hover:text-blue-600 font-medium">教程</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">关于</Link>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap gap-2 mb-8">
          <Link
            href="/tools"
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              !categoryParam ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
          >
            全部
          </Link>
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/tools?category=${encodeURIComponent(cat)}`}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                categoryParam === cat ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
            >
              {categoryIcons[cat]} {cat}
            </Link>
          ))}
        </div>

        {categories.map((category) => {
          const categoryTools = filteredTools.filter(t => t.category === category);
          if (categoryTools.length === 0) return null;
          
          return (
            <div key={category} className="mb-10">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">{categoryIcons[category]}</span>
                <h2 className="text-xl font-bold text-gray-800">{category}</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {categoryTools.map((tool, index) => (
                  <Link
                    key={`${tool.href}-${index}`}
                    href={tool.comingSoon ? '#' : tool.href}
                    onClick={(e) => { if (tool.comingSoon) { e.preventDefault(); alert('表格编辑器功能正在优化中，敬请期待！'); }}}
                    className={`block bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-5 ${
                      tool.comingSoon ? 'opacity-60 cursor-pointer' : 'hover:-translate-y-1'
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className="text-2xl">{tool.icon}</span>
                      <div>
                        <h4 className="font-semibold text-gray-800 mb-1">
                          {tool.name}
                          {tool.comingSoon && <span className="ml-2 text-xs bg-gray-200 text-gray-600 px-2 py-0.5 rounded">即将推出</span>}
                        </h4>
                        <p className="text-sm text-gray-500">{tool.description}</p>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default function ToolsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">加载中...</div>}>
      <ToolsContent />
    </Suspense>
  );
}
