export default function About() {
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
            <a href="/tutorial" className="text-gray-700 hover:text-blue-600 font-medium">教程</a>
            <a href="/about" className="text-blue-600 font-medium border-b-2 border-blue-600">关于</a>
          </div>
        </div>
      </nav>

      {/* 主内容 */}
      <div className="container mx-auto px-4 py-8">
        <h2 className="text-3xl font-bold mb-8 text-gray-800">关于 Flow Mate</h2>

        {/* 关于我们 */}
        <section className="mb-12">
          <div className="flex flex-col md:flex-row items-center">
            <div className="md:w-1/3 mb-6 md:mb-0">
              <div className="w-full h-64 md:h-80 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg shadow-lg flex items-center justify-center">
                <div className="text-center text-white">
                  <div className="w-24 h-24 bg-white/20 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <span className="text-5xl font-bold">F</span>
                  </div>
                  <p className="text-xl font-semibold">Flow Mate</p>
                </div>
              </div>
            </div>
            <div className="md:w-2/3 md:pl-8">
              <h3 className="text-2xl font-semibold mb-4 text-gray-800">我们的使命</h3>
              <p className="text-gray-600 mb-4">
                Flow Mate 是一款纯前端个人效率自动化工具，旨在帮助用户更高效地处理各种文件。我们相信，通过简化重复的文件处理任务，用户可以将更多时间和精力投入到更有创造性的工作中。
              </p>
              <p className="text-gray-600 mb-4">
                我们的工具完全在浏览器端运行，所有文件处理操作均在本地完成，不会上传到任何服务器，确保用户的数据隐私和安全。
              </p>
              <p className="text-gray-600">
                无论是处理Excel表格、CSV文件、PDF文档还是图片，Flow Mate 都能为您提供简单、高效的解决方案。
              </p>
            </div>
          </div>
        </section>

        {/* 核心功能 */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">核心功能</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">文件导入</h4>
              <p className="text-gray-600">支持 Excel、CSV、PDF 和图片文件的导入，完全在本地处理。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 7v10c0 2.21 3.582 4 8 4s8-1.79 8-4V7M4 7c0 2.21 3.582 4 8 4s8-1.79 8-4M4 7c0-2.21 3.582-4 8-4s8 1.79 8-4m0 5c0 2.21-3.582 4-8 4s-8-1.79-8-4" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">批量处理</h4>
              <p className="text-gray-600">支持去重、排序、合并列、拆分和压缩等多种批量处理操作。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">流程化操作</h4>
              <p className="text-gray-600">通过拖拽组合多步任务，创建自动化工作流程，提高效率。</p>
            </div>
            <div className="bg-white rounded-lg shadow p-6">
              <div className="w-12 h-12 bg-amber-100 rounded-lg flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3M3 17V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h4 className="text-lg font-semibold mb-2 text-gray-800">本地导出</h4>
              <p className="text-gray-600">支持导出为 Excel、PDF 和图片 ZIP 文件，所有操作均在本地完成。</p>
            </div>
          </div>
        </section>

        {/* 技术栈 */}
        <section className="mb-12">
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">技术栈</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-gray-900 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xl">N</span>
              </div>
              <p className="font-medium text-gray-800">Next.js</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-500 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xl">R</span>
              </div>
              <p className="font-medium text-gray-800">React</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-cyan-500 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xl">T</span>
              </div>
              <p className="font-medium text-gray-800">TailwindCSS</p>
            </div>
            <div className="bg-white rounded-lg shadow p-4 flex flex-col items-center justify-center">
              <div className="w-16 h-16 bg-blue-600 rounded-xl flex items-center justify-center mb-2">
                <span className="text-white font-bold text-xl">TS</span>
              </div>
              <p className="font-medium text-gray-800">TypeScript</p>
            </div>
          </div>
        </section>

        {/* 联系我们 */}
        <section>
          <h3 className="text-2xl font-semibold mb-6 text-gray-800">联系我们</h3>
          <div className="bg-white rounded-lg shadow">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-6">
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">联系方式</h4>
                <ul className="space-y-4">
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                    <span className="text-gray-600">contact@flowmate.com</span>
                  </li>
                  <li className="flex items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600 mr-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <span className="text-gray-600">北京市海淀区中关村大街1号</span>
                  </li>
                </ul>
              </div>
              <div>
                <h4 className="text-lg font-semibold mb-4 text-gray-800">反馈与建议</h4>
                <p className="text-gray-600 mb-4">
                  如果您有任何反馈或建议，欢迎通过邮件联系我们。我们会认真对待每一条反馈，不断改进我们的产品。
                </p>
                <p className="text-gray-600">
                  您也可以在 GitHub 上提交 issues 或 pull requests，帮助我们一起改进 Flow Mate。
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
