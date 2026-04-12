import type { Metadata } from 'next';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'Flow Mate - 个人效率自动化工具',
  description: '一个纯前端个人效率自动化工具，支持文件导入、批量处理、流程化操作和本地导出',
  keywords: ['效率工具', '文件处理', 'Excel', 'CSV', 'PDF', '图片', '批量处理', '流程自动化'],
  authors: [{ name: 'Flow Mate' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh-CN">
      <body>
        {children}
      </body>
    </html>
  );
}
