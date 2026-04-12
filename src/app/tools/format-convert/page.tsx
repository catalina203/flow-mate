'use client';

import React, { useState } from 'react';
import Link from 'next/link';

type FormatType = 'json' | 'xml' | 'csv';

export default function FormatConvertPage() {
  const [inputText, setInputText] = useState('');
  const [outputText, setOutputText] = useState('');
  const [inputFormat, setInputFormat] = useState<FormatType>('json');
  const [outputFormat, setOutputFormat] = useState<FormatType>('csv');
  const [error, setError] = useState('');

  const convert = () => {
    if (!inputText) {
      alert('请输入要转换的内容');
      return;
    }

    setError('');
    let data: any;

    try {
      if (inputFormat === 'json') {
        data = JSON.parse(inputText);
      } else if (inputFormat === 'csv') {
        const lines = inputText.trim().split('\n');
        const headers = lines[0].split(',').map(h => h.trim().replace(/^"|"$/g, ''));
        data = lines.slice(1).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"|"$/g, ''));
          const obj: Record<string, string> = {};
          headers.forEach((h, i) => obj[h] = values[i] || '');
          return obj;
        });
      } else if (inputFormat === 'xml') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(inputText, 'text/xml');
        const items = xmlDoc.getElementsByTagName('item');
        data = Array.from(items).map(item => {
          const obj: Record<string, string> = {};
          Array.from(item.children).forEach(child => {
            obj[child.tagName] = child.textContent || '';
          });
          return obj;
        });
      }
    } catch (e: any) {
      setError(`解析错误: ${e.message}`);
      return;
    }

    try {
      if (outputFormat === 'json') {
        setOutputText(JSON.stringify(data, null, 2));
      } else if (outputFormat === 'csv') {
        if (Array.isArray(data) && data.length > 0) {
          const headers = Object.keys(data[0]);
          const csvLines = [headers.join(',')];
          data.forEach((row: any) => {
            const values = headers.map(h => {
              const val = String(row[h] || '');
              return val.includes(',') ? `"${val}"` : val;
            });
            csvLines.push(values.join(','));
          });
          setOutputText(csvLines.join('\n'));
        } else {
          setOutputText('');
        }
      } else if (outputFormat === 'xml') {
        if (Array.isArray(data) && data.length > 0) {
          let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<root>\n';
          data.forEach((item: any) => {
            xml += '  <item>\n';
            Object.entries(item).forEach(([key, value]) => {
              xml += `    <${key}>${value}</${key}>\n`;
            });
            xml += '  </item>\n';
          });
          xml += '</root>';
          setOutputText(xml);
        } else {
          setOutputText('');
        }
      }
    } catch (e: any) {
      setError(`转换错误: ${e.message}`);
    }
  };

  const formatJson = () => {
    try {
      const obj = JSON.parse(inputText);
      setInputText(JSON.stringify(obj, null, 2));
      setInputFormat('json');
    } catch {
      alert('无效的 JSON');
    }
  };

  const copyOutput = () => {
    if (outputText) {
      navigator.clipboard.writeText(outputText);
      alert('已复制到剪贴板');
    }
  };

  const downloadOutput = () => {
    if (!outputText) return;
    const extensions: Record<FormatType, string> = { json: 'json', xml: 'xml', csv: 'csv' };
    const blob = new Blob([outputText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `output.${extensions[outputFormat]}`;
    link.click();
    URL.revokeObjectURL(url);
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
          <Link href="/tools?category=文本处理" className="text-blue-600 hover:underline flex items-center gap-2">
            ← 返回文本处理
          </Link>
        </div>

        <h2 className="text-2xl font-bold mb-6">格式转换</h2>

        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">输入格式:</label>
              <select
                value={inputFormat}
                onChange={(e) => setInputFormat(e.target.value as FormatType)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="json">JSON</option>
                <option value="csv">CSV</option>
                <option value="xml">XML</option>
              </select>
            </div>
            <span className="text-gray-400">→</span>
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-gray-700">输出格式:</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value as FormatType)}
                className="border border-gray-300 rounded px-3 py-2 text-sm"
              >
                <option value="csv">CSV</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
              </select>
            </div>
            {inputFormat === 'json' && (
              <button onClick={formatJson} className="ml-4 px-3 py-1 bg-gray-200 text-gray-700 rounded text-sm hover:bg-gray-300">
                格式化 JSON
              </button>
            )}
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-red-700">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block font-medium text-gray-700 mb-2">输入</label>
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder={`输入 ${inputFormat.toUpperCase()} 格式数据...`}
              className="w-full h-64 p-3 border border-gray-300 rounded text-sm font-mono resize-none"
            />
          </div>
          <div>
            <div className="flex justify-between items-center mb-2">
              <label className="font-medium text-gray-700">输出</label>
              <div className="flex gap-2">
                <button onClick={copyOutput} disabled={!outputText} className="text-sm text-blue-600 hover:underline disabled:opacity-50">复制</button>
                <button onClick={downloadOutput} disabled={!outputText} className="text-sm text-blue-600 hover:underline disabled:opacity-50">下载</button>
              </div>
            </div>
            <textarea
              value={outputText}
              readOnly
              placeholder="转换结果..."
              className="w-full h-64 p-3 border border-gray-200 rounded text-sm font-mono bg-gray-50 resize-none"
            />
          </div>
        </div>

        <div className="text-center">
          <button
            onClick={convert}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
          >
            转换为 {outputFormat.toUpperCase()}
          </button>
        </div>
      </div>
    </div>
  );
}