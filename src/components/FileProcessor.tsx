'use client';

import React, { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import { PDFDocument } from 'pdf-lib';

interface SheetData {
  name: string;
  headers: string[];
  rows: string[][];
}

interface TaskConfig {
  id: string;
  type: string;
  name: string;
  config: Record<string, string>;
}

type FilePreviewType = 'excel' | 'image' | 'pdf' | 'text' | 'zip' | 'json' | 'unknown';

interface FilePreview {
  type: FilePreviewType;
  name: string;
  size: number;
  data?: any;
  content?: string;
}

export default function FileProcessor() {
  const [fileName, setFileName] = useState('');
  const [filePreview, setFilePreview] = useState<FilePreview | null>(null);
  const [sheets, setSheets] = useState<SheetData[]>([]);
  const [activeSheet, setActiveSheet] = useState(0);
  const [tasks, setTasks] = useState<TaskConfig[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultData, setResultData] = useState<SheetData | null>(null);
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
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      parseFile(droppedFiles[0]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      parseFile(selectedFiles[0]);
    }
  };

  const getFileType = (filename: string): FilePreviewType => {
    const ext = filename.split('.').pop()?.toLowerCase() || '';
    const excelExts = ['xlsx', 'xls', 'csv'];
    const imageExts = ['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg', 'bmp'];
    const textExts = ['txt', 'md', 'json', 'xml', 'html', 'css', 'js', 'ts', 'log'];
    const pdfExts = ['pdf'];
    const zipExts = ['zip', 'rar', '7z', 'tar', 'gz'];

    if (excelExts.includes(ext)) return 'excel';
    if (imageExts.includes(ext)) return 'image';
    if (pdfExts.includes(ext)) return 'pdf';
    if (textExts.includes(ext)) return 'text';
    if (zipExts.includes(ext)) return 'zip';
    if (ext === 'json') return 'json';
    return 'unknown';
  };

  const parseFile = async (file: File) => {
    const ext = file.name.split('.').pop()?.toLowerCase();
    const fileType = getFileType(file.name);
    
    setFileName(file.name);
    setResultData(null);
    setTasks([]);
    setSheets([]);

    const preview: FilePreview = {
      type: fileType,
      name: file.name,
      size: file.size,
    };

    if (fileType === 'excel') {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });

        const parsedSheets: SheetData[] = workbook.SheetNames.map((name) => {
          const worksheet = workbook.Sheets[name];
          const jsonData = XLSX.utils.sheet_to_json<string[]>(worksheet, { header: 1 });
          const headers = jsonData.length > 0 ? jsonData[0].map(String) : [];
          const rows = jsonData.slice(1).map((row) => row.map(String));
          return { name, headers, rows };
        });

        setSheets(parsedSheets);
        setActiveSheet(0);
        preview.data = { sheets: parsedSheets };
        setFilePreview({ ...preview });
      };
      reader.readAsArrayBuffer(file);
    } else if (fileType === 'image') {
      const reader = new FileReader();
      reader.onload = (e) => {
        preview.content = e.target?.result as string;
        setFilePreview({ ...preview });
      };
      reader.readAsDataURL(file);
    } else if (fileType === 'pdf') {
      const arrayBuffer = await file.arrayBuffer();
      const pdfDoc = await PDFDocument.load(arrayBuffer);
      const pageCount = pdfDoc.getPageCount();
      preview.data = { pageCount };
      setFilePreview({ ...preview });
    } else if (fileType === 'text' || fileType === 'json') {
      const text = await file.text();
      preview.content = text;
      setFilePreview({ ...preview });
    } else if (fileType === 'zip') {
      setFilePreview({ ...preview });
    } else {
      setFilePreview({ ...preview });
    }
  };

  const getCurrentData = (): SheetData | null => {
    if (resultData) return resultData;
    if (sheets.length === 0) return null;
    return sheets[activeSheet];
  };

  const addTask = (type: string) => {
    if (sheets.length === 0) {
      alert('请先导入文件');
      return;
    }

    const currentData = getCurrentData();
    if (!currentData || currentData.headers.length === 0) {
      alert('当前工作表没有数据');
      return;
    }

    const taskNameMap: Record<string, string> = {
      remove_duplicates: '去重',
      sort: '排序',
      filter: '筛选',
      delete_columns: '删除列',
      rename_column: '重命名列',
      statistics: '统计',
      clean: '清洗',
    };

    let config: Record<string, string> = {};
    
    switch (type) {
      case 'remove_duplicates':
        config = { column: currentData.headers[0] };
        break;
      case 'sort':
        config = { column: currentData.headers[0], order: 'asc' };
        break;
      case 'filter':
        config = { column: currentData.headers[0], operator: 'contains', value: '' };
        break;
      case 'delete_columns':
        config = { columns: currentData.headers[0] };
        break;
      case 'rename_column':
        config = { column: currentData.headers[0], newName: currentData.headers[0] + '_new' };
        break;
      case 'statistics':
        config = { column: currentData.headers[0], type: 'sum' };
        break;
      case 'clean':
        config = { trim: 'true', removeEmpty: 'true' };
        break;
    }

    const newTask: TaskConfig = {
      id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
      type,
      name: taskNameMap[type],
      config,
    };

    setTasks((prev) => [...prev, newTask]);
  };

  const removeTask = (id: string) => {
    setTasks((prev) => prev.filter((task) => task.id !== id));
  };

  const updateTaskConfig = (id: string, key: string, value: string) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === id ? { ...task, config: { ...task.config, [key]: value } } : task
      )
    );
  };

  const executeTasks = async () => {
    if (sheets.length === 0) {
      alert('请先导入文件');
      return;
    }
    if (tasks.length === 0) {
      alert('请先添加任务');
      return;
    }

    setIsProcessing(true);
    setResultData(null);

    const source = resultData || sheets[activeSheet];
    let currentHeaders = [...source.headers];
    let currentRows = source.rows.map((row) => [...row]);

    for (const task of tasks) {
      if (task.type === 'remove_duplicates') {
        const colIndex = currentHeaders.indexOf(task.config.column);
        if (colIndex === -1) continue;
        const seen = new Set<string>();
        currentRows = currentRows.filter((row) => {
          const val = row[colIndex] || '';
          if (seen.has(val)) return false;
          seen.add(val);
          return true;
        });
      } else if (task.type === 'sort') {
        const colIndex = currentHeaders.indexOf(task.config.column);
        if (colIndex === -1) continue;
        const isAsc = task.config.order === 'asc';
        currentRows.sort((a, b) => {
          const va = a[colIndex] || '';
          const vb = b[colIndex] || '';
          const na = Number(va);
          const nb = Number(vb);
          if (!isNaN(na) && !isNaN(nb)) {
            return isAsc ? na - nb : nb - na;
          }
          return isAsc ? va.localeCompare(vb) : vb.localeCompare(va);
        });
      } else if (task.type === 'filter') {
        const colIndex = currentHeaders.indexOf(task.config.column);
        if (colIndex === -1) continue;
        const operator = task.config.operator || 'contains';
        const value = task.config.value || '';
        currentRows = currentRows.filter((row) => {
          const cellValue = row[colIndex] || '';
          switch (operator) {
            case 'contains':
              return cellValue.includes(value);
            case 'equals':
              return cellValue === value;
            case 'starts_with':
              return cellValue.startsWith(value);
            case 'ends_with':
              return cellValue.endsWith(value);
            default:
              return true;
          }
        });
      } else if (task.type === 'delete_columns') {
        const colsToDelete = task.config.columns.split(',').map(c => c.trim());
        const keepIndices = currentHeaders
          .map((h, i) => colsToDelete.includes(h) ? -1 : i)
          .filter(i => i !== -1);
        currentHeaders = keepIndices.map(i => currentHeaders[i]);
        currentRows = currentRows.map(row => keepIndices.map(i => row[i]));
      } else if (task.type === 'rename_column') {
        const colIndex = currentHeaders.indexOf(task.config.column);
        if (colIndex !== -1 && task.config.newName) {
          currentHeaders[colIndex] = task.config.newName;
        }
      } else if (task.type === 'statistics') {
        const colIndex = currentHeaders.indexOf(task.config.column);
        if (colIndex !== -1) {
          const values = currentRows.map(row => Number(row[colIndex])).filter(n => !isNaN(n));
          const sum = values.reduce((a, b) => a + b, 0);
          const avg = values.length > 0 ? sum / values.length : 0;
          const count = currentRows.length;
          const max = values.length > 0 ? Math.max(...values) : 0;
          const min = values.length > 0 ? Math.min(...values) : 0;
          alert(`统计结果 (${task.config.column} 列):\n总和: ${sum.toFixed(2)}\n平均值: ${avg.toFixed(2)}\n最大值: ${max}\n最小值: ${min}\n行数: ${count}`);
        }
      } else if (task.type === 'clean') {
        currentRows = currentRows.filter(row => row.some(cell => cell && cell.trim()));
        currentRows = currentRows.map(row => row.map(cell => cell ? cell.trim() : ''));
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 300));

    setResultData({
      name: source.name,
      headers: currentHeaders,
      rows: currentRows,
    });

    setIsProcessing(false);
  };

  const exportAsExcel = () => {
    const data = resultData || (sheets.length > 0 ? sheets[activeSheet] : null);
    if (!data) {
      alert('没有可导出的数据');
      return;
    }

    const wsData = [data.headers, ...data.rows];
    const ws = XLSX.utils.aoa_to_sheet(wsData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, data.name);

    const baseName = fileName.replace(/\.[^.]+$/, '');
    const suffix = resultData ? '_processed' : '';
    XLSX.writeFile(wb, `${baseName}${suffix}.xlsx`);
  };

  const exportAsCSV = () => {
    const data = resultData || (sheets.length > 0 ? sheets[activeSheet] : null);
    if (!data) {
      alert('没有可导出的数据');
      return;
    }

    const csvContent = [
      data.headers.join(','),
      ...data.rows.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(',')),
    ].join('\n');

    const blob = new Blob(['\uFEFF' + csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    const baseName = fileName.replace(/\.[^.]+$/, '');
    const suffix = resultData ? '_processed' : '';
    link.href = url;
    link.download = `${baseName}${suffix}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const saveTemplate = () => {
    if (tasks.length === 0) {
      alert('请先添加任务');
      return;
    }
    const templateName = prompt('请输入模板名称:');
    if (!templateName) return;
    const templates = JSON.parse(localStorage.getItem('flowMateTemplates') || '[]');
    templates.push({ name: templateName, tasks, createdAt: new Date().toISOString() });
    localStorage.setItem('flowMateTemplates', JSON.stringify(templates));
    alert('模板保存成功！');
  };

  const loadTemplate = () => {
    const templates = JSON.parse(localStorage.getItem('flowMateTemplates') || '[]');
    if (templates.length === 0) {
      alert('没有保存的模板');
      return;
    }
    const selectedTemplateName = prompt(
      `请选择要加载的模板:\n${templates.map((t: any, i: number) => `${i + 1}. ${t.name}`).join('\n')}`
    );
    if (!selectedTemplateName) return;
    const idx = parseInt(selectedTemplateName) - 1;
    if (idx >= 0 && idx < templates.length) {
      setTasks(templates[idx].tasks);
      alert('模板加载成功！');
    } else {
      alert('无效的模板选择');
    }
  };

  const displayData = resultData || (sheets.length > 0 ? sheets[activeSheet] : null);
  const previewRows = displayData ? displayData.rows.slice(0, 100) : [];
  const totalRows = displayData ? displayData.rows.length : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow-md">
        <div className="container mx-auto px-4 py-3 flex justify-between items-center">
          <div className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-xl">F</span>
            </div>
            <h1 className="text-xl font-bold text-gray-800">Flow Mate</h1>
          </div>
          <div className="flex items-center space-x-6">
            <a href="/" className="text-gray-700 hover:text-blue-600 font-medium">首页</a>
            <a href="/tools" className="text-blue-600 font-medium border-b-2 border-blue-600">工具</a>
            <a href="/tutorial" className="text-gray-700 hover:text-blue-600 font-medium">教程</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium">关于</a>
          </div>
        </div>
      </nav>

      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">文件处理工具</h2>

        {/* 文件导入 */}
        <section className="mb-8">
          <h3 className="text-xl font-semibold mb-4 text-gray-700">
            文件导入
            {fileName && <span className="ml-3 text-sm font-normal text-green-600">已加载: {fileName}</span>}
          </h3>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
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
              accept=".xlsx,.xls,.csv,.png,.jpg,.jpeg,.gif,.webp,.svg,.bmp,.pdf,.txt,.md,.json,.xml,.html,.css,.js,.ts,.log,.zip,.rar,.7z,.tar,.gz"
              className="hidden"
            />
            <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-gray-400 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="text-gray-600 mb-2">拖放文件到此处或点击选择文件</p>
            <p className="text-gray-400 text-sm">拖放文件到此处或点击选择文件。支持多种文件格式</p>
          </div>
        </section>

        {/* 文件预览 */}
        {filePreview && filePreview.type !== 'excel' && filePreview.type !== 'unknown' && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">文件预览</h3>
              <span className="text-sm text-gray-500">
                {(filePreview.size / 1024).toFixed(2)} KB
              </span>
            </div>
            <div className="bg-white rounded-lg shadow p-4">
              {filePreview.type === 'image' && filePreview.content && (
                <div className="flex justify-center">
                  <img src={filePreview.content} alt={filePreview.name} className="max-w-full max-h-96 object-contain rounded" />
                </div>
              )}
              {filePreview.type === 'pdf' && filePreview.data && (
                <div className="flex items-center gap-4 p-4 bg-blue-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">{filePreview.name}</p>
                    <p className="text-sm text-gray-600">PDF 文档，共 {filePreview.data.pageCount} 页</p>
                  </div>
                </div>
              )}
              {filePreview.type === 'text' && filePreview.content && (
                <div className="bg-gray-50 rounded p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{filePreview.content.slice(0, 5000)}{filePreview.content.length > 5000 ? '\n...(内容过长，仅显示前 5000 字符)' : ''}</pre>
                </div>
              )}
              {filePreview.type === 'json' && filePreview.content && (
                <div className="bg-gray-50 rounded p-4 max-h-96 overflow-auto">
                  <pre className="text-sm text-gray-700 whitespace-pre-wrap font-mono">{(() => {
                    try {
                      return JSON.stringify(JSON.parse(filePreview.content || '{}'), null, 2).slice(0, 5000);
                    } catch {
                      return filePreview.content.slice(0, 5000);
                    }
                  })()}</pre>
                </div>
              )}
              {filePreview.type === 'zip' && (
                <div className="flex items-center gap-4 p-4 bg-yellow-50 rounded-lg">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-yellow-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 8h14M5 8a2 2 0 110-4h14a2 2 0 110 4M5 8v10a2 2 0 002 2h10a2 2 0 002-2V8m-9 4h4" />
                  </svg>
                  <div>
                    <p className="font-medium text-gray-800">{filePreview.name}</p>
                    <p className="text-sm text-gray-600">ZIP 压缩包</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        )}

        {/* Sheet 标签 */}
        {sheets.length > 1 && (
          <section className="mb-8">
            <div className="flex flex-wrap gap-2">
              {sheets.map((sheet, idx) => (
                <button
                  key={sheet.name}
                  onClick={() => { setActiveSheet(idx); setResultData(null); }}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    activeSheet === idx && !resultData
                      ? 'bg-blue-600 text-white'
                      : 'bg-white text-gray-700 hover:bg-gray-100'
                  }`}
                >
                  {sheet.name} ({sheet.rows.length}行)
                </button>
              ))}
            </div>
          </section>
        )}

        {/* 数据预览 */}
        {displayData && (
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-gray-700">
                数据预览
                {resultData && <span className="ml-3 text-sm font-normal text-orange-600">处理结果</span>}
              </h3>
              <p className="text-gray-500 text-sm">
                共 {totalRows} 行{totalRows > 100 ? '，显示前 100 行' : ''}
              </p>
            </div>
            <div className="bg-white rounded-lg shadow overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase w-16">#</th>
                    {displayData.headers.map((header, idx) => (
                      <th key={idx} className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {previewRows.map((row, rowIdx) => (
                    <tr key={rowIdx} className="hover:bg-gray-50">
                      <td className="px-4 py-3 text-sm text-gray-400">{rowIdx + 1}</td>
                      {displayData.headers.map((_, colIdx) => (
                        <td key={colIdx} className="px-4 py-3 text-sm text-gray-700 whitespace-nowrap max-w-[200px] truncate">
                          {row[colIdx] || ''}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        )}

        {/* 任务配置 */}
        <section className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-gray-700">任务配置</h3>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => addTask('remove_duplicates')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 去重
              </button>
              <button onClick={() => addTask('sort')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 排序
              </button>
              <button onClick={() => addTask('filter')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 筛选
              </button>
              <button onClick={() => addTask('delete_columns')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 删除列
              </button>
              <button onClick={() => addTask('rename_column')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 重命名列
              </button>
              <button onClick={() => addTask('statistics')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 统计
              </button>
              <button onClick={() => addTask('clean')} className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm">
                + 清洗
              </button>
            </div>
          </div>

          {tasks.length > 0 ? (
            <div className="space-y-3">
              {tasks.map((task, idx) => (
                <div key={task.id} className="bg-white rounded-lg shadow p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center">
                      <span className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold mr-3">{idx + 1}</span>
                      <p className="font-medium text-gray-800">{task.name}</p>
                    </div>
                    <button onClick={() => removeTask(task.id)} className="text-gray-400 hover:text-red-500 transition-colors">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex flex-wrap gap-4 ml-9">
                    <div className="flex items-center gap-2">
                      <label className="text-sm text-gray-500">依据列:</label>
                      <select
                        value={task.config.column || ''}
                        onChange={(e) => updateTaskConfig(task.id, 'column', e.target.value)}
                        className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                      >
                        {getCurrentData()?.headers.map((h) => (
                          <option key={h} value={h}>{h}</option>
                        ))}
                      </select>
                    </div>
                    {task.type === 'sort' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">排序:</label>
                        <select
                          value={task.config.order || 'asc'}
                          onChange={(e) => updateTaskConfig(task.id, 'order', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                        >
                          <option value="asc">升序</option>
                          <option value="desc">降序</option>
                        </select>
                      </div>
                    )}
                    {task.type === 'filter' && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">操作:</label>
                          <select
                            value={task.config.operator || 'contains'}
                            onChange={(e) => updateTaskConfig(task.id, 'operator', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            <option value="contains">包含</option>
                            <option value="equals">等于</option>
                            <option value="starts_with">开始于</option>
                            <option value="ends_with">结束于</option>
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">值:</label>
                          <input
                            type="text"
                            value={task.config.value || ''}
                            onChange={(e) => updateTaskConfig(task.id, 'value', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="输入筛选值"
                          />
                        </div>
                      </>
                    )}
                    {task.type === 'delete_columns' && (
                      <div className="flex items-center gap-2">
                        <label className="text-sm text-gray-500">删除列 (逗号分隔):</label>
                        <input
                          type="text"
                          value={task.config.columns || ''}
                          onChange={(e) => updateTaskConfig(task.id, 'columns', e.target.value)}
                          className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500 w-48"
                          placeholder="列1,列2"
                        />
                      </div>
                    )}
                    {task.type === 'rename_column' && (
                      <>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">原列名:</label>
                          <select
                            value={task.config.column || ''}
                            onChange={(e) => updateTaskConfig(task.id, 'column', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                          >
                            {getCurrentData()?.headers.map((h) => (
                              <option key={h} value={h}>{h}</option>
                            ))}
                          </select>
                        </div>
                        <div className="flex items-center gap-2">
                          <label className="text-sm text-gray-500">新名称:</label>
                          <input
                            type="text"
                            value={task.config.newName || ''}
                            onChange={(e) => updateTaskConfig(task.id, 'newName', e.target.value)}
                            className="text-sm border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-1 focus:ring-blue-500"
                            placeholder="新列名"
                          />
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <p className="text-gray-500">点击上方按钮添加任务</p>
            </div>
          )}
        </section>

        {/* 执行 & 导出 */}
        <section className="mb-8">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <p className="text-gray-600">
                  {fileName
                    ? <>已加载 <span className="font-semibold text-blue-600">{fileName}</span>，<span className="font-semibold text-blue-600">{tasks.length}</span> 个任务</>
                    : <span className="text-gray-400">请先导入文件</span>
                  }
                </p>
                {resultData && (
                  <p className="text-sm text-orange-600 mt-1">
                    处理完成：{resultData.rows.length} 行数据（原始 {sheets[activeSheet].rows.length} 行）
                  </p>
                )}
              </div>
              <div className="flex flex-wrap gap-3">
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm" onClick={loadTemplate}>加载模板</button>
                <button className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors text-sm" onClick={saveTemplate}>保存模板</button>
                <button
                  className={`px-6 py-2 text-white rounded-lg transition-colors text-sm ${isProcessing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                  onClick={executeTasks}
                  disabled={isProcessing}
                >
                  {isProcessing ? '处理中...' : '执行任务'}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 导出 */}
        {displayData && (
          <section>
            <h3 className="text-xl font-semibold mb-4 text-gray-700">导出结果</h3>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="flex flex-wrap gap-4">
                <button className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm" onClick={exportAsExcel}>导出为 Excel (.xlsx)</button>
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm" onClick={exportAsCSV}>导出为 CSV (.csv)</button>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
