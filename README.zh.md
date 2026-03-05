# SignDocs — 文档签章编辑器

[![Release](https://img.shields.io/github/v/release/Createitv/sign-docs)](https://github.com/Createitv/sign-docs/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[English](README.md)

一款轻量、注重隐私的桌面文档签章工具。打开 PDF 或 Word 文件，在线生成公章、手写签名，将结果一键导出为 PDF。全程离线运行，文件不会上传到任何服务器。

基于 [Tauri](https://tauri.app/) + 原生 JS 构建，支持 macOS、Windows 和 Linux。

![SignDocs 截图](docs/screenshot.png)

## 功能亮点

- **打开文档** — 支持 PDF 和 Word（DOCX/DOC），使用 `pdf.js` 和 `docx-preview` 高保真渲染
- **电子公章** — 上传公章图片，或在线生成带环形文字、五角星、编号的圆形电子公章
- **手写签名** — 在专用签名板上绘制平滑的贝塞尔曲线笔迹，可自由选择笔色
- **文本框** — 在文档任意位置添加可拖拽、可编辑的文本框
- **导出 PDF** — 一键导出，公章、签名、标注全部合并到 PDF 中
- **离线 & 隐私** — 零网络请求，零数据采集，文件始终留在你的电脑上

## 快速开始

```bash
# 浏览器开发模式
npm install
npm run dev          # → http://localhost:1420

# 桌面应用（Tauri）
npm run tauri dev
```

## 下载

从 [Releases 页面](https://github.com/Createitv/sign-docs/releases/latest) 下载预编译安装包：

| 平台 | 文件 |
|------|------|
| macOS Apple Silicon (M1/M2/M3) | `SignDocs_*_aarch64.dmg` |
| macOS Intel | `SignDocs_*_x64.dmg` |
| Windows | `SignDocs_*_x64-setup.exe` |
| Linux | `SignDocs_*_amd64.AppImage` |

## 技术栈

| 层级 | 技术 |
|------|------|
| 外壳 | [Tauri 2](https://tauri.app/)（Rust） |
| 前端 | 原生 JS + Vite |
| PDF 渲染 | [pdf.js](https://mozilla.github.io/pdf.js/) |
| DOCX 渲染 | [docx-preview](https://github.com/VolodymyrBayworker/docx-preview) |
| PDF 导出 | [jsPDF](https://github.com/parallax/jsPDF) + [html2canvas](https://html2canvas.hertzen.com/) |

## 开源协议

[MIT](LICENSE) — 可免费用于个人和商业用途。
