<template>
  <section class="pdf-reader" :class="{ fullscreen: isFullscreen }">
    <header class="reader-header">
      <div class="document-info">
        <el-icon><Document /></el-icon>
        <div><strong>{{ title || 'PDF 教学资料' }}</strong><span v-if="pdf">共 {{ pageCount }} 页</span></div>
      </div>
      <div class="header-actions">
        <a :href="src" download><el-icon><Download /></el-icon><span>下载</span></a>
        <a :href="src" target="_blank" rel="noopener"><el-icon><Link /></el-icon><span>新窗口</span></a>
        <button type="button" @click="toggleFullscreen"><el-icon><FullScreen /></el-icon><span>{{ isFullscreen ? '退出全屏' : '全屏' }}</span></button>
      </div>
    </header>

    <nav class="reader-toolbar" aria-label="PDF阅读工具栏">
      <span class="continuous-label"><el-icon><Reading /></el-icon>连续滚动 · {{ pageCount || '--' }} 页</span>
      <span class="divider"></span>
      <button type="button" :disabled="scale <= .5" @click="zoom(-.2)"><el-icon><ZoomOut /></el-icon></button>
      <span class="zoom-value">{{ Math.round(scale * 100) }}%</span>
      <button type="button" :disabled="scale >= 3" @click="zoom(.2)"><el-icon><ZoomIn /></el-icon></button>
      <button type="button" :class="{ active: fitWidth }" @click="fitToWidth">适合宽度</button>
      <button type="button" @click="rotate"><el-icon><RefreshRight /></el-icon></button>
    </nav>

    <div ref="viewportRef" class="reader-viewport">
      <div v-if="loading" class="reader-state"><el-progress type="circle" :percentage="loadProgress"/><p>正在加载 PDF…</p></div>
      <el-result v-else-if="error" icon="error" title="PDF 加载失败" :sub-title="error"><template #extra><el-button @click="loadDocument">重新加载</el-button></template></el-result>
      <div v-show="!loading && !error" ref="pagesContainerRef" class="pages-column" aria-label="PDF连续页面"></div>
    </div>
  </section>
</template>

<script setup>
import { markRaw, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import * as pdfjsLib from 'pdfjs-dist'
import pdfWorker from 'pdfjs-dist/build/pdf.worker.min.mjs?url'

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker
const props = defineProps({ src: { type: String, required: true }, title: { type: String, default: '' } })
const emit = defineEmits(['page-change', 'loaded'])
const pagesContainerRef = ref(), viewportRef = ref(), pdf = shallowRef(null), loading = ref(false), error = ref('')
const pageCount = ref(0), scale = ref(1.2), rotation = ref(0)
const loadProgress = ref(0), fitWidth = ref(true), isFullscreen = ref(false)
let loadingTask, renderTasks = [], resizeObserver, abortController, renderSequence = 0, documentSequence = 0

async function loadDocument() {
  destroyDocument(); const documentId = ++documentSequence; error.value = ''; loading.value = true; loadProgress.value = 0
  try {
    if (!props.src) throw new Error('PDF地址为空')
    abortController = new AbortController()
    const response = await fetch(new URL(props.src, window.location.href), { signal: abortController.signal, credentials: 'same-origin' })
    if (!response.ok) throw new Error(`PDF HTTP ${response.status}`)
    const contentType = response.headers.get('content-type') || ''
    const buffer = await response.arrayBuffer()
    const bytes = new Uint8Array(buffer)
    const signature = String.fromCharCode(...bytes.slice(0, 5))
    if (!contentType.includes('pdf') && signature !== '%PDF-') throw new Error('服务器返回的内容不是PDF文件')
    loadProgress.value = 45
    loadingTask = pdfjsLib.getDocument({ data: bytes, useSystemFonts: true })
    loadingTask.onProgress = ({ loaded, total }) => { if (total) loadProgress.value = 45 + Math.min(54, Math.round(loaded / total * 54)) }
    const loadedPdf = await loadingTask.promise
    if (documentId !== documentSequence) { loadedPdf.destroy(); return }
    pdf.value = markRaw(loadedPdf); pageCount.value = pdf.value.numPages
    loading.value = false; await nextTick(); await renderAllPages(); emit('loaded', { pages: pageCount.value })
  } catch (e) {
    if (documentId === documentSequence && !['RenderingCancelledException','AbortError'].includes(e?.name)) error.value = friendlyError(e)
    if (documentId === documentSequence) loading.value = false
  }
}

async function renderAllPages() {
  if (!pdf.value || !pagesContainerRef.value || !viewportRef.value) return
  const sequence = ++renderSequence
  try {
    renderTasks.forEach(task => { try { task.cancel() } catch {} }); renderTasks = []
    pagesContainerRef.value.replaceChildren()
    const firstPage = await pdf.value.getPage(1)
    let targetScale = scale.value
    if (fitWidth.value) {
      const base = firstPage.getViewport({ scale: 1, rotation: rotation.value })
      targetScale = Math.max(.5, Math.min(3, (viewportRef.value.clientWidth - 72) / base.width))
      scale.value = Number(targetScale.toFixed(2))
    }
    for (let number = 1; number <= pageCount.value && sequence === renderSequence; number++) {
      const page = number === 1 ? firstPage : await pdf.value.getPage(number)
      const viewport = page.getViewport({ scale: targetScale, rotation: rotation.value })
      const ratio = Math.min(window.devicePixelRatio || 1, 2)
      const shell = document.createElement('article'); shell.className = 'pdf-page'; shell.dataset.page = String(number)
      const badge = document.createElement('span'); badge.className = 'page-badge'; badge.textContent = `${number} / ${pageCount.value}`
      const canvas = document.createElement('canvas'); canvas.setAttribute('aria-label', `PDF第${number}页`)
      canvas.width = Math.floor(viewport.width * ratio); canvas.height = Math.floor(viewport.height * ratio)
      canvas.style.width = `${Math.floor(viewport.width)}px`; canvas.style.height = `${Math.floor(viewport.height)}px`
      shell.append(canvas, badge); pagesContainerRef.value.appendChild(shell)
      const task = page.render({ canvasContext: canvas.getContext('2d', { alpha: false }), viewport, transform: ratio === 1 ? null : [ratio, 0, 0, ratio, 0, 0] })
      renderTasks.push(task); await task.promise
    }
    if (sequence === renderSequence) emit('page-change', { page: 1, pages: pageCount.value })
  } catch (e) {
    if (e?.name !== 'RenderingCancelledException' && sequence === renderSequence) error.value = friendlyError(e)
  }
}

function zoom(delta) { fitWidth.value = false; scale.value = Math.max(.5, Math.min(3, Number((scale.value + delta).toFixed(2)))); renderAllPages() }
function fitToWidth() { fitWidth.value = true; renderAllPages() }
function rotate() { rotation.value = (rotation.value + 90) % 360; renderAllPages() }
function toggleFullscreen() { isFullscreen.value = !isFullscreen.value; nextTick(renderAllPages) }
function friendlyError(e) { const message = e?.message || ''; if (/404|Missing PDF/i.test(message)) return '资料文件不存在或已被移除'; if (/401|403/.test(message)) return '没有权限读取该资料，请重新登录'; if (/不是PDF|Invalid PDF/i.test(message)) return '服务器返回的文件不是有效 PDF'; if (/CORS|Failed to fetch|NetworkError/i.test(message)) return '资料无法访问，请检查网络或文件权限'; return `${message || '暂时无法解析该 PDF，请下载后查看'}` }
function destroyDocument() { documentSequence++; renderSequence++; try { abortController?.abort() } catch {}; renderTasks.forEach(task => { try { task.cancel() } catch {} }); renderTasks = []; try { loadingTask?.destroy() } catch {}; try { pdf.value?.destroy() } catch {}; abortController = loadingTask = null; pdf.value = null; pagesContainerRef.value?.replaceChildren() }

watch(() => props.src, loadDocument)
onMounted(() => { resizeObserver = new ResizeObserver(() => { if (fitWidth.value && pdf.value) renderAllPages() }); if (viewportRef.value) resizeObserver.observe(viewportRef.value); loadDocument() })
onBeforeUnmount(() => { resizeObserver?.disconnect(); destroyDocument() })
</script>

<style scoped>
.pdf-reader{height:clamp(640px,72vh,880px);background:#e9edf3;border:1px solid #dfe4ea;border-radius:14px;overflow:hidden;display:flex;flex-direction:column}.pdf-reader.fullscreen{position:fixed;inset:0;z-index:3000;height:100vh;border-radius:0}.reader-header,.reader-toolbar{display:flex;align-items:center;justify-content:space-between;background:#fff;border-bottom:1px solid #e5e7eb;padding:12px 18px}.document-info,.document-info>div,.header-actions,.reader-toolbar{display:flex;align-items:center;gap:10px}.document-info>div{align-items:flex-start;flex-direction:column;gap:2px}.document-info span{font-size:12px;color:#8492a6}.header-actions a,.header-actions button,.reader-toolbar button{border:0;background:transparent;color:#475569;display:flex;align-items:center;gap:5px;cursor:pointer;text-decoration:none}.header-actions a:hover,.header-actions button:hover,.reader-toolbar button:hover:not(:disabled),.reader-toolbar button.active{color:#4f46e5;background:#eef2ff}.header-actions a,.header-actions button{padding:7px 10px;border-radius:7px}.reader-toolbar{justify-content:center;padding:8px;gap:8px;flex-shrink:0}.reader-toolbar button{min-height:32px;padding:6px 10px;border-radius:6px}.reader-toolbar button:disabled{opacity:.35;cursor:not-allowed}.continuous-label{display:flex;align-items:center;gap:6px;color:#475569;font-size:13px}.divider{width:1px;height:22px;background:#d8dee8;margin:0 5px}.zoom-value{min-width:48px;text-align:center;font-size:13px;color:#64748b}.reader-viewport{flex:1;overflow:auto;padding:32px 28px;scroll-behavior:smooth}.pages-column{width:max-content;min-width:100%;display:flex;flex-direction:column;align-items:center;gap:28px}.pages-column :deep(.pdf-page){position:relative;background:#fff;box-shadow:0 7px 24px rgba(15,23,42,.18);line-height:0}.pages-column :deep(.page-badge){position:absolute;right:10px;bottom:10px;padding:4px 8px;background:rgba(15,23,42,.68);color:#fff;border-radius:10px;font:11px/1.2 sans-serif;opacity:.72}.reader-state{margin:100px auto;text-align:center;color:#64748b}.reader-state p{margin-top:12px}@media(max-width:700px){.pdf-reader{height:clamp(500px,68vh,720px);min-height:0}.reader-header{align-items:flex-start}.header-actions span{display:none}.reader-toolbar{flex-wrap:wrap}.reader-viewport{padding:18px 10px}.pages-column{gap:18px}}
</style>
