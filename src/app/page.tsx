import Link from 'next/link';

interface Tool {
  name: string;
  description: string;
  icon: string;
  href: string;
  category: string;
}

const tools: Tool[] = [
  // 文档转换
  { name: 'PDF 转 Excel', description: '将 PDF 表格提取为 Excel 文件', icon: '📄', href: '/tools/pdf-to-excel', category: '文档转换' },
  { name: 'PDF 转图片', description: '将 PDF 每一页转换为图片', icon: '🖼️', href: '/tools/pdf-to-image', category: '文档转换' },
  { name: '图片转 PDF', description: '将图片合并转换为 PDF 文件', icon: '📑', href: '/tools/image-to-pdf', category: '文档转换' },
  { name: 'Word 转 PDF', description: '将 Word 文档转换为 PDF', icon: '📝', href: '/tools/word-to-pdf', category: '文档转换' },
  { name: 'Excel 合并', description: '将多个 Excel 文件合并为一个', icon: '🔗', href: '/tools/excel-merge', category: '文档转换' },
  { name: 'Excel 拆分', description: '按 sheet 或行数拆分 Excel', icon: '✂️', href: '/tools/excel-split', category: '文档转换' },
  
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
  
  // 文件压缩
  { name: 'ZIP 压缩', description: '将文件或文件夹压缩为 ZIP', icon: '📦', href: '/tools/zip', category: '文件压缩' },
  { name: 'ZIP 解压', description: '解压 ZIP/RAR/7z 文件', icon: '📂', href: '/tools/unzip', category: '文件压缩' },
  { name: '批量重命名', description: '批量修改文件名', icon: '✏️', href: '/tools/batch-rename', category: '文件压缩' },
  { name: '文件分类', description: '按类型将文件分类整理', icon: '📁', href: '/tools/file-sort', category: '文件压缩' },

  // 编码转换
  { name: '时间戳转换', description: 'Unix时间戳 ↔ 日期时间', icon: '⏰', href: '/tools/timestamp', category: '编码转换' },
  { name: 'JSON 格式化', description: '美化、压缩、验证 JSON', icon: '📋', href: '/tools/json-format', category: '编码转换' },
];

const categories = ['文档转换', '数据处理', '文本处理', '图片工具', '文件压缩', '编码转换'];

const categoryIcons: Record<string, string> = {
  '文档转换': '📄',
  '数据处理': '📊',
  '文本处理': '📝',
  '图片工具': '🖼️',
  '文件压缩': '📦',
  '编码转换': '🔢',
};

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <nav className="bg-white/80 backdrop-blur-sm shadow-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Flow Mate
            </h1>
          </div>
          <div className="flex items-center space-x-6">
            <Link href="/" className="text-blue-600 font-medium border-b-2 border-blue-600">首页</Link>
            <Link href="/tools" className="text-gray-700 hover:text-blue-600 font-medium">所有工具</Link>
            <Link href="/tutorial" className="text-gray-700 hover:text-blue-600 font-medium">教程</Link>
            <Link href="/about" className="text-gray-700 hover:text-blue-600 font-medium">关于</Link>
          </div>
        </div>
      </nav>

      <section className="py-16 container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4 text-gray-800">
            办公自动化
            <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"> 一站式工具箱</span>
          </h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            完全在浏览器端处理，保护您的隐私。无需安装，任何设备随时使用。
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4 mb-12">
          {categories.map((cat) => (
            <Link
              key={cat}
              href={`/tools?category=${encodeURIComponent(cat)}`}
              className="bg-white rounded-xl shadow-sm hover:shadow-md transition-all p-4 flex items-center gap-3 group"
            >
              <span className="text-2xl">{categoryIcons[cat]}</span>
              <span className="font-medium text-gray-700 group-hover:text-blue-600">{cat}</span>
            </Link>
          ))}
        </div>

        {categories.map((category) => (
          <div key={category} className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <span className="text-2xl">{categoryIcons[category]}</span>
              <h3 className="text-2xl font-bold text-gray-800">{category}</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {tools.filter(t => t.category === category).map((tool) => (
                <Link
                  key={tool.href}
                  href={tool.href}
                  className="bg-white rounded-xl shadow-sm hover:shadow-md hover:-translate-y-1 transition-all p-5 group"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">{tool.icon}</span>
                    <div>
                      <h4 className="font-semibold text-gray-800 group-hover:text-blue-600 mb-1">{tool.name}</h4>
                      <p className="text-sm text-gray-500">{tool.description}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </section>

      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🔒</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">隐私优先</h4>
              <p className="text-gray-600">所有处理在浏览器完成，数据不上传服务器</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">⚡</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">快速高效</h4>
              <p className="text-gray-600">无需安装软件，浏览器打开即可使用</p>
            </div>
            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">🎯</span>
              </div>
              <h4 className="text-xl font-semibold mb-2">功能全面</h4>
              <p className="text-gray-600">一站式解决日常办公各类需求</p>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="container mx-auto px-4 text-center">
          <h3 className="text-3xl font-bold text-white mb-6">现在开始提升工作效率</h3>
          <Link href="/tools" className="px-8 py-3 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors inline-block font-medium">
            探索所有工具
          </Link>
        </div>
      </section>

      <footer className="bg-gray-900 text-white py-8">
        <div className="container mx-auto px-4 text-center">
          <p className="text-gray-400">© 2026 Flow Mate · 办公自动化工具箱</p>
        </div>
      </footer>
    </div>
  );
}
