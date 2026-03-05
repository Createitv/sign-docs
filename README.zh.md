# SignDocs — 文档签章编辑器

跨平台桌面应用，支持打开、签名、盖章并导出 PDF/Word 文档。基于 [Tauri](https://tauri.app/) + 原生 JavaScript 构建。

[![Release](https://img.shields.io/github/v/release/Createitv/sign-docs)](https://github.com/Createitv/sign-docs/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md)

---

## 功能特性

- **打开文档** — 从本地磁盘加载 PDF、DOCX、DOC 文件
- **电子公章** — 上传自定义公章图片，或在线生成圆形公章（含五角星、环形文字、编号）
- **手写签名** — 在签名板上手绘签名，可设置笔色，放置到文档任意位置
- **自由拖动** — 公章、签名、文本框均可拖动到任意位置，精准定位
- **文本框** — 添加可移动、可编辑的文字标注，覆盖在文档上
- **导出 PDF** — 将最终文档（含所有签章）保存为 PDF 文件

## 下载安装

从 [Releases 页面](https://github.com/Createitv/sign-docs/releases/latest) 下载最新版本：

| 平台 | 文件 |
|------|------|
| macOS Apple Silicon (M1/M2/M3) | `SignDocs_*_aarch64.dmg` |
| macOS Intel | `SignDocs_*_x64.dmg` |
| Windows | `SignDocs_*_x64-setup.exe` / `.msi` |
| Linux | `SignDocs_*_amd64.AppImage` / `.deb` |

## 开发指南

**前置要求：** [Rust](https://rustup.rs/) · [Node.js 18+](https://nodejs.org/) · [Tauri 环境依赖](https://tauri.app/start/prerequisites/)

```bash
git clone https://github.com/Createitv/sign-docs.git
cd sign-docs
npm install
npm run tauri dev
```

### 生产构建

```bash
npm run tauri build
```

打包产物输出至 `src-tauri/target/release/bundle/`。

## 技术栈

| 层级 | 技术 |
|------|------|
| 桌面框架 | Tauri 2（Rust）|
| 前端 | 原生 JavaScript + Vite |
| PDF 渲染 | PDF.js |
| DOCX 转换 | Mammoth.js |
| PDF 导出 | html2canvas + jsPDF |

## 开源协议

MIT
