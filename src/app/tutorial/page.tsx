export default function Tutorial() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* 导航栏 */}
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
            <a href="/tools" className="text-gray-700 hover:text-blue-600 font-medium">工具</a>
            <a href="/tutorial" className="text-blue-600 font-medium border-b-2 border-blue-600">教程</a>
            <a href="/about" className="text-gray-700 hover:text-blue-600 font-medium">关于</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">使用教程</h2>

        {/* 教程步骤 */}
        <div className="space-y-12">
          {/* 步骤 1 */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">1</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">导入文件</h3>
                <p className="text-gray-600 mb-4">
                  您可以通过以下两种方式导入文件：
                </p>
                <ul className="list-disc list-inside space-y-2 text-gray-600 mb-4">
                  <li>将文件拖放到文件导入区域</li>
                  <li>点击文件导入区域，在弹出的文件选择器中选择文件</li>
                </ul>
                <div className="bg-blue-50 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    <strong>支持的文件格式：</strong>Excel (.xlsx, .xls)、CSV (.csv)、PDF (.pdf) 和图片 (.jpg, .jpeg, .png, .gif)
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 步骤 2 */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-green-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">2</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">配置任务</h3>
                <p className="text-gray-600 mb-4">
                  在任务配置区域，您可以添加以下任务：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-800">去重</p>
                    <p className="text-gray-500 text-sm">移除重复内容</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-800">排序</p>
                    <p className="text-gray-500 text-sm">对内容排序</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-800">合并列</p>
                    <p className="text-gray-500 text-sm">合并多列数据</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-800">拆分</p>
                    <p className="text-gray-500 text-sm">拆分为多部分</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center mx-auto mb-2">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                      </svg>
                    </div>
                    <p className="font-medium text-gray-800">压缩</p>
                    <p className="text-gray-500 text-sm">压缩文件大小</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  您可以根据需要添加多个任务，它们将按照添加的顺序执行。
                </p>
              </div>
            </div>
          </div>

          {/* 步骤 3 */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">3</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">执行任务</h3>
                <p className="text-gray-600 mb-4">
                  配置完成后，点击「执行任务」按钮开始处理文件。所有操作均在本地浏览器中完成，不会上传到服务器，保护您的隐私。
                </p>
                <div className="bg-green-50 rounded-lg p-4 mb-4">
                  <p className="text-green-800 text-sm">
                    <strong>提示：</strong>您还可以点击「保存模板」按钮，将当前的任务配置保存到本地，以便下次使用。
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* 步骤 4 */}
          <div className="bg-white rounded-lg shadow p-8">
            <div className="flex items-start space-x-4">
              <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-white font-bold text-xl">4</span>
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-semibold mb-4 text-gray-800">导出结果</h3>
                <p className="text-gray-600 mb-4">
                  任务执行完成后，您可以将处理结果导出为以下格式：
                </p>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-sm">X</span>
                      </div>
                      <p className="font-medium text-gray-800">Excel</p>
                    </div>
                    <p className="text-gray-600 text-sm">适用于表格数据 (.xlsx)</p>
                  </div>
                  <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-sm">P</span>
                      </div>
                      <p className="font-medium text-gray-800">PDF</p>
                    </div>
                    <p className="text-gray-600 text-sm">适用于文档 (.pdf)</p>
                  </div>
                  <div className="bg-yellow-50 rounded-lg p-4 border border-yellow-200">
                    <div className="flex items-center mb-2">
                      <div className="w-8 h-8 bg-yellow-600 rounded-lg flex items-center justify-center mr-2">
                        <span className="text-white font-bold text-sm">Z</span>
                      </div>
                      <p className="font-medium text-gray-800">ZIP</p>
                    </div>
                    <p className="text-gray-600 text-sm">适用于多个图片文件</p>
                  </div>
                </div>
                <p className="text-gray-600">
                  导出的文件将直接下载到您的设备，不会存储在任何服务器上。
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* 常见问题 */}
        <div className="mt-12">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">常见问题</h3>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-2 text-gray-800">Q: 我的文件会被上传到服务器吗？</h4>
              <p className="text-gray-600">A: 不会。所有文件处理操作均在您的本地浏览器中完成，不会上传到任何服务器，保护您的隐私和数据安全。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-2 text-gray-800">Q: 支持处理多大的文件？</h4>
              <p className="text-gray-600">A: 由于所有操作均在浏览器中完成，文件大小受限于您设备的内存。对于大型文件，建议分批处理。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-2 text-gray-800">Q: 保存的模板存储在哪里？</h4>
              <p className="text-gray-600">A: 模板存储在您浏览器的 localStorage 中，仅在本地设备上可用。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <h4 className="font-semibold mb-2 text-gray-800">Q: 支持哪些浏览器？</h4>
              <p className="text-gray-600">A: 支持所有现代浏览器，包括 Chrome、Firefox、Safari 和 Edge。</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
