import { invoke } from '@tauri-apps/api/core';
import { open, save } from '@tauri-apps/plugin-dialog';
import * as pdfjsLib from 'pdfjs-dist';
import PDFWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url';
import mammoth from 'mammoth';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

// ===== PDF.js Worker Setup =====
pdfjsLib.GlobalWorkerOptions.workerSrc = PDFWorker;

// ===== State =====
let currentStampSrc = null;
let sigColor = '#1a1a2e';
let isDrawing = false;
let currentMode = 'edit'; // 'edit' | 'pdf' | 'docx'
let pdfDoc = null;

// ===== Toast =====
function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2600);
}

// ===== File Info =====
function setFileInfo(text) {
  document.getElementById('fileInfo').textContent = text;
}

// ===== New Document =====
window.newDocument = function () {
  currentMode = 'edit';
  pdfDoc = null;

  const docContent = document.getElementById('docContent');
  docContent.innerHTML = '';
  docContent.style.display = 'block';
  docContent.contentEditable = 'true';

  const pdfContainer = document.getElementById('pdfContainer');
  pdfContainer.style.display = 'none';
  pdfContainer.innerHTML = '';

  document.querySelectorAll('.placed-stamp, .placed-signature, .placed-text-box').forEach(el => el.remove());

  document.getElementById('editToolCard').style.opacity = '1';
  setFileInfo('未打开文件');
  showToast('新建文档');
};

// ===== Open Document =====
window.openDocument = async function () {
  try {
    const filePath = await open({
      multiple: false,
      filters: [
        { name: '文档', extensions: ['pdf', 'docx', 'doc'] },
        { name: 'PDF', extensions: ['pdf'] },
        { name: 'Word 文档', extensions: ['docx', 'doc'] },
      ],
    });

    if (!filePath) return;

    const fileName = filePath.split(/[/\\]/).pop();
    const ext = fileName.split('.').pop().toLowerCase();

    showToast('正在加载文档…');

    const base64 = await invoke('read_file_as_base64', { path: filePath });

    if (ext === 'pdf') {
      await renderPDF(base64, fileName);
    } else if (ext === 'docx' || ext === 'doc') {
      await renderDocx(base64, fileName);
    } else {
      showToast('不支持的文件格式');
    }
  } catch (err) {
    console.error(err);
    showToast('打开文件失败: ' + (err.message || err));
  }
};

// ===== Render PDF =====
async function renderPDF(base64, fileName) {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  pdfDoc = await pdfjsLib.getDocument({ data: bytes }).promise;

  const docContent = document.getElementById('docContent');
  docContent.style.display = 'none';
  docContent.contentEditable = 'false';

  const pdfContainer = document.getElementById('pdfContainer');
  pdfContainer.innerHTML = '';
  pdfContainer.style.display = 'block';

  // Remove old placed elements
  document.querySelectorAll('.placed-stamp, .placed-signature, .placed-text-box').forEach(el => el.remove());

  const docPage = document.getElementById('docPage');
  const pageWidth = docPage.clientWidth - 112; // subtract padding
  const dpr = window.devicePixelRatio || 1;

  for (let pageNum = 1; pageNum <= pdfDoc.numPages; pageNum++) {
    const page = await pdfDoc.getPage(pageNum);
    const scale = pageWidth / page.getViewport({ scale: 1 }).width;
    const viewport = page.getViewport({ scale });

    const canvas = document.createElement('canvas');
    // Buffer size accounts for device pixel ratio (crisp on Retina/HiDPI)
    canvas.width = Math.floor(viewport.width * dpr);
    canvas.height = Math.floor(viewport.height * dpr);
    // CSS display size in logical pixels (preserves aspect ratio)
    canvas.style.width = viewport.width + 'px';
    canvas.style.height = viewport.height + 'px';
    canvas.dataset.page = pageNum;

    pdfContainer.appendChild(canvas);

    const ctx = canvas.getContext('2d');
    ctx.scale(dpr, dpr);

    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;
  }

  currentMode = 'pdf';
  document.getElementById('editToolCard').style.opacity = '0.5';
  setFileInfo(`📄 ${fileName}  (${pdfDoc.numPages} 页)`);
  showToast(`PDF 已打开，共 ${pdfDoc.numPages} 页`);
}

// ===== Render DOCX =====
async function renderDocx(base64, fileName) {
  const binaryStr = atob(base64);
  const bytes = new Uint8Array(binaryStr.length);
  for (let i = 0; i < binaryStr.length; i++) {
    bytes[i] = binaryStr.charCodeAt(i);
  }

  const result = await mammoth.convertToHtml({ arrayBuffer: bytes.buffer });

  const docContent = document.getElementById('docContent');
  docContent.innerHTML = result.value;
  docContent.style.display = 'block';
  docContent.contentEditable = 'true';

  const pdfContainer = document.getElementById('pdfContainer');
  pdfContainer.style.display = 'none';
  pdfContainer.innerHTML = '';

  document.querySelectorAll('.placed-stamp, .placed-signature, .placed-text-box').forEach(el => el.remove());

  currentMode = 'docx';
  pdfDoc = null;
  document.getElementById('editToolCard').style.opacity = '1';
  setFileInfo(`📝 ${fileName}`);
  showToast('Word 文档已打开');
}

// ===== Text Formatting =====
window.fmt = function (cmd) {
  document.execCommand(cmd, false, null);
  document.getElementById('docContent').focus();
};

window.changeFont = function (f) {
  document.execCommand('fontName', false, f);
  document.getElementById('docContent').focus();
};

window.changeFontSize = function (s) {
  document.execCommand('fontSize', false, s);
  document.getElementById('docContent').focus();
};

// ===== Add Text Box =====
window.addTextBox = function () {
  const page = document.getElementById('docPage');
  const el = document.createElement('div');
  el.className = 'placed-text-box';
  el.style.cssText = 'left: 50%; top: 40%; transform: translate(-50%, -50%);';

  el.innerHTML = `
    <div class="text-handle">⠿ 文本框 <span style="font-size:10px;opacity:0.6">拖动移动</span></div>
    <div class="text-body" contenteditable="true" spellcheck="false">在此输入文字</div>
    <button class="remove-btn" onclick="this.parentElement.remove()">✕</button>
  `;

  const handle = el.querySelector('.text-handle');
  makeDraggable(el, page, handle);
  page.appendChild(el);
  el.querySelector('.text-body').focus();
};

// ===== Stamp Upload =====
window.handleStampUpload = function (e) {
  const file = e.target.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = (ev) => {
    currentStampSrc = ev.target.result;
    updateStampPreview();
    showToast('公章图片已加载');
  };
  reader.readAsDataURL(file);
};

function updateStampPreview() {
  const area = document.getElementById('stampPreview');
  if (currentStampSrc) {
    area.innerHTML = `<img src="${currentStampSrc}" alt="公章">`;
  }
}

// ===== Generate Stamp =====
window.openGenStamp = function () {
  document.getElementById('genStampModal').classList.add('show');
  drawGenStamp();
  ['stampCompany', 'stampCenter', 'stampCode'].forEach(id => {
    document.getElementById(id).addEventListener('input', drawGenStamp);
  });
};

window.closeGenStamp = function () {
  document.getElementById('genStampModal').classList.remove('show');
};

function drawGenStamp() {
  const canvas = document.getElementById('genStampCanvas');
  const ctx = canvas.getContext('2d');
  const w = canvas.width, h = canvas.height;
  const cx = w / 2, cy = h / 2, r = 88;

  ctx.clearRect(0, 0, w, h);

  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.strokeStyle = '#c0392b';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(cx, cy, r - 6, 0, Math.PI * 2);
  ctx.lineWidth = 1.5;
  ctx.stroke();

  drawStar(ctx, cx, cy - 6, 18, 8, 5);

  const company = document.getElementById('stampCompany').value || '某某科技有限公司';
  ctx.save();
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 15px sans-serif';
  const textR = r - 20;
  const totalAngle = Math.PI * 1.42;
  const startAngle = -Math.PI / 2 - totalAngle / 2;
  for (let i = 0; i < company.length; i++) {
    const angle = startAngle + (totalAngle / (company.length - 1 || 1)) * i;
    ctx.save();
    ctx.translate(cx + textR * Math.cos(angle), cy + textR * Math.sin(angle));
    ctx.rotate(angle + Math.PI / 2);
    ctx.fillText(company[i], -8, 6);
    ctx.restore();
  }
  ctx.restore();

  const centerText = document.getElementById('stampCenter').value || '合同专用章';
  ctx.fillStyle = '#c0392b';
  ctx.font = 'bold 14px serif';
  ctx.textAlign = 'center';
  ctx.fillText(centerText, cx, cy + 30);

  const code = document.getElementById('stampCode').value || '';
  if (code) {
    ctx.font = '11px sans-serif';
    ctx.fillText(code, cx, cy + 46);
  }
}

function drawStar(ctx, cx, cy, outerR, innerR, points) {
  ctx.beginPath();
  ctx.fillStyle = '#c0392b';
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outerR : innerR;
    const angle = (Math.PI / points) * i - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    i === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
  }
  ctx.closePath();
  ctx.fill();
}

window.useGenStamp = function () {
  const canvas = document.getElementById('genStampCanvas');
  currentStampSrc = canvas.toDataURL('image/png');
  updateStampPreview();
  closeGenStamp();
  showToast('公章已生成');
};

// ===== Place Stamp =====
window.placeStamp = function () {
  if (!currentStampSrc) {
    showToast('请先上传或生成公章');
    return;
  }
  const page = document.getElementById('docPage');
  const size = parseInt(document.getElementById('stampSize').value);
  const el = document.createElement('div');
  el.className = 'placed-stamp';
  el.style.cssText = `width:${size}px;height:${size}px;right:80px;bottom:120px;`;
  el.innerHTML = `<img src="${currentStampSrc}" alt="公章"><button class="remove-btn" onclick="this.parentElement.remove()">✕</button>`;
  makeDraggable(el, page);
  page.appendChild(el);
  showToast('公章已盖到文档');
};

document.getElementById('stampSize').addEventListener('input', function () {
  document.getElementById('stampSizeVal').textContent = this.value + 'px';
});

// ===== Signature Canvas =====
const sigCanvas = document.getElementById('sigCanvas');
const sigCtx = sigCanvas.getContext('2d');

function initSigCtx() {
  sigCtx.lineWidth = 2.5;
  sigCtx.lineCap = 'round';
  sigCtx.lineJoin = 'round';
  sigCtx.strokeStyle = sigColor;
}

function resizeSigCanvas() {
  const rect = sigCanvas.parentElement.getBoundingClientRect();
  const dpr = window.devicePixelRatio || 1;
  const w = Math.floor(rect.width);
  sigCanvas.width = w * dpr;
  sigCanvas.height = 140 * dpr;
  sigCanvas.style.height = '140px';
  sigCtx.scale(dpr, dpr);
  initSigCtx();
}

resizeSigCanvas();
window.addEventListener('resize', resizeSigCanvas);

function getPos(e) {
  const rect = sigCanvas.getBoundingClientRect();
  const t = e.touches ? e.touches[0] : e;
  return { x: t.clientX - rect.left, y: t.clientY - rect.top };
}

sigCanvas.addEventListener('mousedown', (e) => {
  isDrawing = true;
  sigCtx.beginPath();
  const p = getPos(e);
  sigCtx.moveTo(p.x, p.y);
});
sigCanvas.addEventListener('mousemove', (e) => {
  if (!isDrawing) return;
  const p = getPos(e);
  sigCtx.lineTo(p.x, p.y);
  sigCtx.stroke();
});
sigCanvas.addEventListener('mouseup', () => { isDrawing = false; });
sigCanvas.addEventListener('mouseleave', () => { isDrawing = false; });
sigCanvas.addEventListener('touchstart', (e) => {
  e.preventDefault();
  isDrawing = true;
  sigCtx.beginPath();
  const p = getPos(e);
  sigCtx.moveTo(p.x, p.y);
}, { passive: false });
sigCanvas.addEventListener('touchmove', (e) => {
  e.preventDefault();
  if (!isDrawing) return;
  const p = getPos(e);
  sigCtx.lineTo(p.x, p.y);
  sigCtx.stroke();
}, { passive: false });
sigCanvas.addEventListener('touchend', () => { isDrawing = false; });

window.setSigColor = function (c, el) {
  sigColor = c;
  sigCtx.strokeStyle = c;
  document.querySelectorAll('.sig-color-dot').forEach(d => d.classList.remove('active'));
  el.classList.add('active');
};

window.clearSignature = function () {
  const dpr = window.devicePixelRatio || 1;
  sigCtx.clearRect(0, 0, sigCanvas.width / dpr, sigCanvas.height / dpr);
};

window.placeSignature = function () {
  const data = sigCtx.getImageData(0, 0, sigCanvas.width, sigCanvas.height).data;
  const hasContent = Array.from(data).some((v, i) => i % 4 === 3 && v > 0);
  if (!hasContent) {
    showToast('请先手写签名');
    return;
  }
  const imgData = sigCanvas.toDataURL('image/png');
  const page = document.getElementById('docPage');
  const el = document.createElement('div');
  el.className = 'placed-signature';
  el.style.cssText = 'width:180px;height:65px;right:80px;bottom:60px;';
  el.innerHTML = `<img src="${imgData}" alt="签名"><button class="remove-btn" onclick="this.parentElement.remove()">✕</button>`;
  makeDraggable(el, page);
  page.appendChild(el);
  showToast('签名已放置到文档');
};

// ===== Draggable =====
function makeDraggable(el, container, handle) {
  const dragTarget = handle || el;
  let startX, startY, origX, origY;

  dragTarget.addEventListener('mousedown', onDown);
  dragTarget.addEventListener('touchstart', onDown, { passive: false });

  function onDown(e) {
    if (e.target.classList.contains('remove-btn')) return;
    if (e.target.classList.contains('text-body')) return;
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;

    // Convert right/bottom positioning to left/top
    if (!el.style.left || el.style.left === 'auto') {
      el.style.left = el.offsetLeft + 'px';
      el.style.top = el.offsetTop + 'px';
      el.style.right = 'auto';
      el.style.bottom = 'auto';
      el.style.transform = 'none';
    }

    startX = t.clientX;
    startY = t.clientY;
    origX = parseInt(el.style.left) || el.offsetLeft;
    origY = parseInt(el.style.top) || el.offsetTop;

    document.addEventListener('mousemove', onMove);
    document.addEventListener('mouseup', onUp);
    document.addEventListener('touchmove', onMove, { passive: false });
    document.addEventListener('touchend', onUp);
  }

  function onMove(e) {
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    el.style.left = (origX + t.clientX - startX) + 'px';
    el.style.top = (origY + t.clientY - startY) + 'px';
  }

  function onUp() {
    document.removeEventListener('mousemove', onMove);
    document.removeEventListener('mouseup', onUp);
    document.removeEventListener('touchmove', onMove);
    document.removeEventListener('touchend', onUp);
  }
}

// ===== Export PDF =====
window.exportPDF = async function () {
  let savePath;
  try {
    savePath = await save({
      filters: [{ name: 'PDF 文件', extensions: ['pdf'] }],
      defaultPath: 'document_signed.pdf',
    });
  } catch (e) {
    // Dialog cancelled
    return;
  }

  if (!savePath) return;

  showToast('正在生成 PDF，请稍候…');

  const page = document.getElementById('docPage');
  page.querySelectorAll('.remove-btn').forEach(b => (b.style.display = 'none'));

  try {
    const canvas = await html2canvas(page, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: '#fdfcf8',
      logging: false,
    });

    const imgData = canvas.toDataURL('image/jpeg', 0.95);
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();
    const ratio = canvas.width / canvas.height;
    let imgW = pageW;
    let imgH = pageW / ratio;

    if (imgH > pageH) {
      imgH = pageH;
      imgW = pageH * ratio;
    }

    pdf.addImage(imgData, 'JPEG', 0, 0, imgW, imgH);

    // Get PDF bytes as base64
    const pdfBase64 = pdf.output('datauristring').split(',')[1];

    await invoke('write_file_from_base64', { path: savePath, data: pdfBase64 });

    showToast('PDF 已保存！');
  } catch (err) {
    console.error(err);
    showToast('生成失败: ' + (err.message || err));
  } finally {
    page.querySelectorAll('.remove-btn').forEach(b => (b.style.display = ''));
  }
};

// ===== Init =====
document.getElementById('docContent').focus();
initSigCtx();
