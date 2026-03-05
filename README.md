# SignDocs — Document Signing & Stamping Editor

A cross-platform desktop application for opening, signing, stamping, and exporting PDF/Word documents. Built with [Tauri](https://tauri.app/) + Vanilla JS.

[![Release](https://img.shields.io/github/v/release/Createitv/sign-docs)](https://github.com/Createitv/sign-docs/releases/latest)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

[中文文档](README.zh.md)

---

## Features

- **Open Documents** — Load PDF, DOCX, and DOC files from disk
- **Electronic Seal** — Upload a custom stamp image or generate one online (circular company seal with star)
- **Handwritten Signature** — Draw a freehand signature on a canvas pad and place it anywhere
- **Draggable Elements** — Stamps, signatures, and text boxes can be freely repositioned
- **Text Boxes** — Add moveable, editable text annotations over any document
- **PDF Export** — Save the final document (with all overlays) as a PDF file

## Downloads

Get the latest release from the [Releases page](https://github.com/Createitv/sign-docs/releases/latest).

| Platform | File |
|----------|------|
| macOS Apple Silicon | `SignDocs_*_aarch64.dmg` |
| macOS Intel | `SignDocs_*_x64.dmg` |
| Windows | `SignDocs_*_x64-setup.exe` / `.msi` |
| Linux | `SignDocs_*_amd64.AppImage` / `.deb` |

## Development

**Prerequisites:** [Rust](https://rustup.rs/) · [Node.js 18+](https://nodejs.org/) · [Tauri prerequisites](https://tauri.app/start/prerequisites/)

```bash
git clone https://github.com/Createitv/sign-docs.git
cd sign-docs
npm install
npm run tauri dev
```

### Build for production

```bash
npm run tauri build
```

Built bundles are output to `src-tauri/target/release/bundle/`.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop shell | Tauri 2 (Rust) |
| Frontend | Vanilla JS + Vite |
| PDF rendering | PDF.js |
| DOCX conversion | Mammoth.js |
| PDF export | html2canvas + jsPDF |

## License

MIT
