# Vue3 项目

基于 Vue 3 + Vite + Vant 的移动端项目模板

## 技术栈

- **Vue 3.5.13** - 渐进式 JavaScript 框架
- **Vite 6.1.0** - 下一代前端构建工具
- **Vant 4.8.2** - 轻量、可靠的移动端 Vue 组件库
- **Pinia 3.0.1** - Vue 的状态管理库
- **Vue Router 4.5.0** - Vue.js 官方路由管理器
- **Axios 1.6.2** - 基于 Promise 的 HTTP 客户端
- **ECharts 5.6.0** - 强大的数据可视化图表库

## 功能特性

- ✅ Vue 3 Composition API
- ✅ Vite 快速构建
- ✅ Vant UI 组件库
- ✅ Pinia 状态管理
- ✅ Vue Router 路由管理
- ✅ Axios 请求封装
- ✅ 加密工具（RSA、AES、MD5、SHA256）
- ✅ 工具函数（防抖、节流、深拷贝等）
- ✅ ESLint + Prettier 代码规范
- ✅ Sass 样式预处理器
- ✅ VConsole 移动端调试工具

## 项目结构

```
vue3-dome/
├── public/                 # 静态资源
├── src/
│   ├── api/               # API 接口
│   ├── assets/            # 资源文件
│   ├── components/        # 公共组件
│   ├── router/            # 路由配置
│   ├── store/             # Pinia 状态管理
│   ├── styles/            # 全局样式
│   ├── utils/             # 工具函数
│   ├── views/             # 页面组件
│   ├── App.vue            # 根组件
│   └── main.js            # 入口文件
├── .eslintrc.cjs          # ESLint 配置
├── .prettierrc            # Prettier 配置
├── vite.config.js         # Vite 配置
└── package.json           # 项目配置
```

## 开始使用

### 安装依赖

```bash
npm install
```

### 开发运行

```bash
npm run dev
```

项目将在 `http://localhost:8080` 启动

### 构建生产

```bash
npm run build
```

### 预览构建

```bash
npm run preview
```

### 代码检查

```bash
npm run lint
```

### 代码格式化

```bash
npm run format
```

## 环境变量

复制 `.env.example` 文件为 `.env` 并配置相应的环境变量：

```env
VITE_API_BASE_URL=http://localhost:3000/api
VITE_APP_TITLE=Vue3 项目
```

## 开发规范

- 使用 ESLint 进行代码检查
- 使用 Prettier 进行代码格式化
- 组件使用 Composition API
- 样式使用 Scss 预处理器

## License

MIT
