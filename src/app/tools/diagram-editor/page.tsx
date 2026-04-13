'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import mermaid from 'mermaid';

mermaid.initialize({
  startOnLoad: false,
  theme: 'default',
  securityLevel: 'loose',
});

function MermaidPreview({ code, onError, onSvgReady }: { code: string; onError: (err: string) => void; onSvgReady: (svg: string) => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');

  useEffect(() => {
    if (!code.trim()) {
      setSvg('');
      setError('');
      onSvgReady('');
      return;
    }

    const renderDiagram = async () => {
      try {
        const id = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        const { svg } = await mermaid.render(id, code);
        setSvg(svg);
        setError('');
        onError('');
        onSvgReady(svg);
      } catch (err: any) {
        setError(err.message || '渲染失败');
        setSvg('');
        onError(err.message || '渲染失败');
        onSvgReady('');
      }
    };
    renderDiagram();
  }, [code, onError, onSvgReady]);

  if (error) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="max-w-md w-full p-6 bg-red-50 border border-red-200 rounded-lg">
          <h3 className="text-red-600 font-medium mb-2">渲染错误</h3>
          <p className="text-red-500 text-sm break-words">{error}</p>
        </div>
      </div>
    );
  }

  if (!svg) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <p className="text-gray-400">预览区域</p>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef} 
      className="flex-1 overflow-auto p-8 flex items-start justify-center"
      dangerouslySetInnerHTML={{ __html: svg }} 
    />
  );
}

const templates = [
  {
    name: '流程图',
    icon: '📊',
    code: `flowchart TD
    A[开始] --> B{判断}
    B -->|是| C[执行A]
    B -->|否| D[执行B]
    C --> E[结束]
    D --> E`,
  },
  {
    name: '流程图(横版)',
    icon: '➡️',
    code: `flowchart LR
    A[开始] --> B{判断}
    B -->|是| C[执行A]
    B -->|否| D[执行B]
    C --> E[结束]
    D --> E`,
  },
  {
    name: '序列图',
    icon: '📨',
    code: `sequenceDiagram
    participant 用户
    participant 系统
    participant 数据库
    
    用户->>系统: 提交请求
    系统->>数据库: 查询数据
    数据库-->>系统: 返回结果
    系统-->>用户: 返回响应`,
  },
  {
    name: '类图',
    icon: '🏗️',
    code: `classDiagram
    class Animal {
        +String name
        +int age
        +eat()
        +sleep()
    }
    class Dog {
        +String breed
        +bark()
    }
    class Cat {
        +String color
        +meow()
    }
    Animal <|-- Dog
    Animal <|-- Cat`,
  },
  {
    name: '状态图',
    icon: '🔄',
    code: `stateDiagram-v2
    [*] --> 待机
    待机 --> 运行: 开始
    运行 --> 暂停: 暂停
    暂停 --> 运行: 继续
    运行 --> [*]: 结束
    暂停 --> [*]: 结束`,
  },
  {
    name: '甘特图',
    icon: '📅',
    code: `gantt
    title 项目进度
    dateFormat  YYYY-MM-DD
    section 阶段一
    需求分析: a1, 2024-01-01, 7d
    设计: a2, after a1, 5d
    section 阶段二
    开发: b1, after a2, 14d
    测试: b2, after b1, 7d`,
  },
  {
    name: '饼图',
    icon: '🥧',
    code: `pie title 市场份额
    "产品A" : 45
    "产品B" : 30
    "产品C" : 15
    "其他" : 10`,
  },
  {
    name: 'ER图',
    icon: '🔗',
    code: `erDiagram
    CUSTOMER ||--o{ ORDER : places
    ORDER ||--|{ LINE-ITEM : contains
    PRODUCT ||--o{ LINE-ITEM : "is included in"
    CUSTOMER {
        string name
        string email
        string address
    }
    ORDER {
        int id
        date created
        string status
    }`,
  },
  {
    name: '思维导图',
    icon: '🧠',
    code: `mindmap
    root((主题))
        分支1
            子主题A
            子主题B
        分支2
            子主题C
            子主题D
        分支3
            子主题E`,
  },
  {
    name: '用户旅程',
    icon: '👤',
    code: `journey
    title 用户购物流程
    section 搜索
      打开App: 5: 用户
      搜索商品: 5: 用户
      浏览结果: 4: 用户
    section 下单
      查看详情: 5: 用户
      加入购物车: 5: 用户
      提交订单: 5: 用户
    section 支付
      选择支付方式: 4: 用户
      完成支付: 5: 用户`,
  },
];

export default function DiagramEditorPage() {
  const [code, setCode] = useState<string>(templates[0].code);
  const [error, setError] = useState<string>('');
  const [showTemplates, setShowTemplates] = useState(true);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleCodeChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setCode(e.target.value);
  };

  const handleTemplateSelect = (template: typeof templates[0]) => {
    setCode(template.code);
    setError('');
  };

  const handleReset = () => {
    setCode('');
    setError('');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    alert('已复制到剪贴板');
  };

  const [svgContent, setSvgContent] = useState<string>('');

  const handleExportSVG = () => {
    if (!svgContent) {
      alert('请先创建图表');
      return;
    }
    const blob = new Blob([svgContent], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.svg';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleExportPNG = async () => {
    if (!svgContent) {
      alert('请先创建图表');
      return;
    }
    try {
      // 提取SVG的viewBox获取实际尺寸
      const viewBoxMatch = svgContent.match(/viewBox="0 0 (\d+) (\d+)"/);
      let width = 800;
      let height = 600;
      
      if (viewBoxMatch) {
        width = parseInt(viewBoxMatch[1]);
        height = parseInt(viewBoxMatch[2]);
      }

      // 创建SVG Blob
      const svgBlob = new Blob([svgContent], { type: 'image/svg+xml;charset=utf-8' });
      const svgUrl = URL.createObjectURL(svgBlob);

      // 创建图片并绘制到Canvas
      const img = new Image();
      
      await new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error('图片加载失败'));
        img.src = svgUrl;
      });

      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);

      // 导出PNG
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.href = dataUrl;
      link.download = 'diagram.png';
      link.click();

      URL.revokeObjectURL(svgUrl);
    } catch (err: any) {
      console.error('Export error:', err);
      alert('导出失败: ' + (err?.message || String(err)));
    }
  };

  const handleExportMD = () => {
    const mdContent = `\`\`\`mermaid\n${code}\n\`\`\``;
    const blob = new Blob([mdContent], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'diagram.md';
    link.click();
    URL.revokeObjectURL(url);
  };

  const insertText = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    
    let start = textarea.selectionStart;
    let end = textarea.selectionEnd;
    
    // 验证光标位置有效
    if (typeof start !== 'number' || start < 0) {
      start = code.length;
    }
    if (typeof end !== 'number' || end < 0) {
      end = code.length;
    }
    
    const newCode = code.substring(0, start) + text + code.substring(end);
    setCode(newCode);
    
    setTimeout(() => {
      textarea.focus();
      const newPos = start + text.length;
      textarea.setSelectionRange(newPos, newPos);
    }, 0);
  };

  const toolbarActions = [
    { label: '矩形', title: '矩形节点', action: () => insertText('[节点] ') },
    { label: '圆角', title: '圆角矩形', action: () => insertText('(节点) ') },
    { label: '菱形', title: '判断节点', action: () => insertText('{节点} ') },
    { label: '圆形', title: '圆形节点', action: () => insertText('((节点)) ') },
    { label: '-->', title: '箭头连线', action: () => insertText('--> ') },
    { label: '---', title: '实线', action: () => insertText('--- ') },
    { label: '-.-', title: '虚线', action: () => insertText('-.- ') },
    { label: '|标签|', title: '分支标签', action: () => insertText('|是| ') },
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
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className={`px-4 py-2 rounded-lg text-sm ${showTemplates ? 'bg-blue-100 text-blue-700' : 'bg-gray-200 text-gray-700'}`}
          >
            {showTemplates ? '隐藏模板' : '显示模板'}
          </button>
        </div>

        <h2 className="text-2xl font-bold mb-6">图表编辑器</h2>

        <div className="flex gap-6 h-[calc(100vh-220px)]">
          {/* 模板列表 */}
          {showTemplates && (
            <div className="w-56 flex-shrink-0 bg-white rounded-lg shadow p-4 overflow-y-auto">
              <h3 className="text-sm font-medium text-gray-600 mb-3">选择模板</h3>
              <div className="space-y-2">
                {templates.map((template, i) => (
                  <button
                    key={i}
                    onClick={() => handleTemplateSelect(template)}
                    className="w-full text-left px-3 py-2 text-sm rounded hover:bg-blue-50 hover:text-blue-600 transition-colors"
                  >
                    <span className="mr-2">{template.icon}</span>
                    {template.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* 编辑器 */}
          <div className="flex-1 flex flex-col bg-white rounded-lg shadow overflow-hidden">
            <div className="flex items-center justify-between p-3 border-b bg-gray-50">
              <div className="flex items-center gap-2 flex-wrap">
                {toolbarActions.map((action, i) => (
                  <button
                    key={i}
                    onClick={action.action}
                    title={action.title}
                    className="px-2 py-1 text-xs bg-white border rounded hover:bg-gray-100"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
              <div className="flex gap-2">
                <button
                  onClick={handleCopy}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  复制
                </button>
                <button
                  onClick={handleReset}
                  className="px-3 py-1 text-sm bg-gray-200 text-gray-700 rounded hover:bg-gray-300"
                >
                  清空
                </button>
                <button
                  onClick={handleExportSVG}
                  className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                >
                  导出SVG
                </button>
                <button
                  onClick={handleExportPNG}
                  className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700"
                >
                  导出PNG
                </button>
                <button
                  onClick={handleExportMD}
                  className="px-3 py-1 text-sm bg-purple-600 text-white rounded hover:bg-purple-700"
                >
                  导出MD
                </button>
              </div>
            </div>
            
            <textarea
              ref={textareaRef}
              value={code}
              onChange={handleCodeChange}
              className="flex-1 p-4 resize-none focus:outline-none font-mono text-sm border-none"
              placeholder="输入 Mermaid 代码..."
            />
          </div>

          {/* 预览 */}
          <div className="flex-1 bg-white rounded-lg shadow overflow-hidden flex flex-col">
            <div className="p-2 border-b bg-gray-50 text-sm text-gray-600">
              预览 {error && <span className="text-red-500 ml-2">(有错误)</span>}
            </div>
            <MermaidPreview code={code} onError={setError} onSvgReady={setSvgContent} />
          </div>
        </div>

        {/* 语法提示 */}
        <div className="mt-4 p-4 bg-blue-50 rounded-lg">
          <h4 className="font-medium text-blue-800 mb-2">语法提示</h4>
          <div className="text-sm text-blue-700 space-y-1">
            <p>• 流程图: <code>flowchart TD/LR/BT/RL</code> - 方向 (上下/左右/下上/右左)</p>
            <p>• 节点: <code>[矩形]</code> <code>(圆角)</code> <code>{`{菱形}`}</code> <code>((圆形))</code></p>
            <p>• 连线: <code>--&gt;</code> 箭头 <code>---</code> 实线 <code>-.-</code> 虚线</p>
            <p>• 子图: <code>subgraph 名称 ... end</code></p>
            <p>• 更多语法请参考: <a href="https://mermaid.js.org/intro/" target="_blank" className="underline">Mermaid 官方文档</a></p>
          </div>
        </div>
      </div>
    </div>
  );
}