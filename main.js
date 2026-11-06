/**
 * main.js - Hoodt. Tools 全域共用腳本
 * 功能：當 DOM 載入完成後，使用 fetch 分別抓取 header.html、footer.html 與 download-modal.html，
 * 並塞入 #header-placeholder、#footer-placeholder 與 #modal-placeholder 容器中。
 * 同時具備離線/本機雙擊 (file://) 安全備援機制與全域 showDownloadModal()。
 */

// 備援樣板 (當以 file:/// 直接雙擊開啟受瀏覽器 CORS 限制時自動切換，確保開箱即用)
const FALLBACK_HEADER = `
<div class="w-full max-w-full overflow-x-hidden transition-all shadow-[0_1px_3px_rgba(0,0,0,0.03)]">
  <div class="w-full bg-[#f8f2a1] py-2.5 px-4 text-center text-xs text-neutral-800 font-medium tracking-wide border-b border-black/5">
    <a href="https://www.surveycake.com/s/0aVWV" target="_blank" rel="noopener noreferrer" class="text-neutral-800 hover:text-neutral-800 no-underline hover:underline transition-none">找不到需要的工具嗎？點此填寫敲碗表單，讓我幫你做出來！</a>
  </div>
  <header class="bg-white/85 backdrop-blur-xl border-b border-neutral-200/80">
    <div class="max-w-[1520px] mx-auto px-4 sm:px-6 h-[44px] flex items-center justify-between gap-4">
      <div class="flex items-center shrink-0">
        <a href="index.html" class="inline-flex items-center hover:opacity-85 transition-opacity" title="返回首頁">
          <img
            src="https://hoodt.store/logo-tool.png"
            alt="Hoodt. Tools"
            class="h-[18px] w-auto object-contain block select-none"
            onerror="this.onerror=null; this.outerHTML='<span class=\\'font-bold text-sm tracking-tight text-neutral-900\\'>Hoodt.Tool</span>';"
          />
        </a>
      </div>
    </div>
  </header>
</div>
`;

const FALLBACK_FOOTER = `
<footer class="no-print mt-8 border-t border-gray-200 py-6 text-sm text-gray-500">
  <div class="max-w-[1520px] mx-auto px-4 sm:px-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-2 text-left">
    <div>
      Copyright © 2026 Hoodt.Tool線上工具箱 版權所有
    </div>
    <div class="flex items-center gap-2">
      <a href="terms.html" target="_blank" rel="noopener noreferrer" class="hover:text-gray-800 transition-colors">
        使用條款
      </a>
      <div>｜</div>
      <div class="relative group inline-flex items-center">
        <a href="#" target="_blank" rel="noopener noreferrer" class="hover:text-gray-800 transition-colors">
          請我喝咖啡
        </a>
        <div
          class="absolute bottom-full left-1/2 -translate-x-[40%] sm:left-auto sm:translate-x-0 sm:right-0 mb-2.5 w-64 sm:w-72 max-w-[calc(100vw-2.5rem)] p-3 bg-gray-900/95 backdrop-blur-sm text-white text-xs leading-relaxed rounded-xl shadow-xl pointer-events-none opacity-0 group-hover:opacity-100 transition-all duration-200 z-50 text-left"
          role="tooltip"
        >
          透過此連結前往蝦皮購物，您的結帳金額不變，但我能獲得微薄的分潤獎金支持網站運作！
          <div class="absolute top-full left-[40%] sm:left-auto sm:right-2 -mt-1 border-4 border-transparent border-t-gray-900/95"></div>
        </div>
      </div>
    </div>
  </div>
</footer>
`;

const FALLBACK_DOWNLOAD_MODAL = `
<div
  id="download-sponsorship-modal"
  class="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ease-out opacity-0 pointer-events-none select-none overflow-y-auto"
  role="dialog"
  aria-modal="true"
  aria-labelledby="download-modal-title"
>
  <div
    id="download-modal-card"
    class="w-[90%] min-[1080px]:w-[50%] max-w-3xl rounded-3xl shadow-2xl overflow-hidden relative transition-all duration-300 ease-out transform scale-95 flex flex-col text-left select-text my-auto border border-black/5"
  >
    <button
      type="button"
      id="btn-close-download-modal"
      class="absolute top-5 right-5 z-20 w-8 h-8 sm:w-9 sm:h-9 flex items-center justify-center rounded-full bg-gray-100 hover:bg-gray-200 text-gray-600 hover:text-gray-800 transition-colors duration-300 ease-out cursor-pointer shadow-sm"
      aria-label="關閉視窗"
    >
      <i class="fa-solid fa-xmark text-sm sm:text-base"></i>
    </button>
    <div class="bg-white p-8 sm:p-10 flex flex-col items-start text-left">
      <h3 id="download-modal-title" class="text-2xl sm:text-3xl font-bold text-gray-900 tracking-tight text-left mb-4">
        檔案下載成功！
      </h3>
      <div class="space-y-4 text-left text-gray-600 leading-relaxed text-sm sm:text-base w-full">
        <p>
          如果你覺得好用，想贊助我喝一杯飲料，<strong class="font-bold text-gray-900">你完全不用多花錢！</strong>
        </p>
        <p>
          如果你剛好要去蝦皮買東西，透過下方按鈕前往蝦皮下單（買其他東西也可以！），蝦皮就會從賣家賺的錢裡，分幾塊錢獎金給我。你的結帳金額完全不會變多！
        </p>
      </div>
      <div class="flex flex-wrap items-center gap-2.5 sm:gap-3 mt-6">
        <a
          id="btn-shopee-affiliate"
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="inline-flex items-center justify-center rounded-full px-5 sm:px-6 py-2 bg-[#EE4D2D] hover:bg-[#d63b1d] active:bg-[#c43217] text-white text-xs sm:text-sm font-medium tracking-wide transition-colors duration-300 ease-out cursor-pointer shadow-sm"
        >
          <i class="fa-solid fa-bag-shopping mr-1.5 text-xs sm:text-sm"></i>
          <span>前往支持</span>
        </a>
        <button
          type="button"
          id="btn-secondary-close-modal"
          class="inline-flex items-center justify-center rounded-full px-5 sm:px-6 py-2 bg-gray-100 hover:bg-gray-200 active:bg-gray-300 text-gray-600 hover:text-gray-800 text-xs sm:text-sm font-medium transition-colors duration-300 ease-out cursor-pointer"
        >
          我再想想看
        </button>
      </div>
    </div>
    <div class="bg-gray-50 border-t border-gray-200 py-[25px] px-8 sm:px-10">
      <h4 class="text-base sm:text-lg font-bold text-gray-800 mb-2">
        💡 還有想要什麼好用的工具嗎？
      </h4>
      <p class="text-xs sm:text-sm text-gray-600 leading-relaxed">
        如果你有任何想實現的功能，或是工作上遇到的痛點，歡迎<a
          href="#"
          target="_blank"
          rel="noopener noreferrer"
          class="text-blue-600 underline hover:text-blue-800 font-medium transition-colors duration-300 ease-out"
        >點此前往投稿許願表單</a>告訴我！
      </p>
    </div>
  </div>
</div>
`;

/**
 * 動態載入外部 HTML 片段
 * @param {string} placeholderId - 容器 DOM ID
 * @param {string} filePath - HTML 檔案路徑
 * @param {string} fallbackHtml - 讀取失敗時的備援 HTML
 */
async function loadPartial(placeholderId, filePath, fallbackHtml) {
  const container = document.getElementById(placeholderId);
  if (!container) return;

  try {
    const response = await fetch(filePath, { cache: 'no-cache' });
    if (!response.ok) {
      throw new Error(`HTTP 錯誤: ${response.status} (${filePath})`);
    }
    const htmlText = await response.text();
    container.innerHTML = htmlText;
  } catch (error) {
    console.warn(`[Hoodt.Tools] fetch "${filePath}" 載入失敗 (可能由於本機 file:/// 協定之瀏覽器跨域限制)，啟用內建備援樣板。`, error);
    if (!container.innerHTML.trim() && fallbackHtml) {
      container.innerHTML = fallbackHtml;
    }
  }
}

/**
 * 顯示「贊助感謝」下載彈窗 (由各工具下載完成後呼叫)
 */
function showDownloadModal() {
  const modal = document.getElementById('download-sponsorship-modal');
  if (!modal) return;
  const card = document.getElementById('download-modal-card');

  const closeModal = () => {
    modal.classList.add('opacity-0', 'pointer-events-none');
    modal.classList.remove('opacity-100', 'pointer-events-auto');
    if (card) {
      card.classList.add('scale-95');
      card.classList.remove('scale-100');
    }
    window.removeEventListener('keydown', handleKeyDown);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      closeModal();
    }
  };

  // 顯示視窗與卡片動態展開
  modal.classList.remove('opacity-0', 'pointer-events-none');
  modal.classList.add('opacity-100', 'pointer-events-auto');
  if (card) {
    card.classList.remove('scale-95');
    card.classList.add('scale-100');
  }

  // 綁定右上角關閉、次要按鈕、點擊背景遮罩與鍵盤 ESC 關閉
  const btnClose = document.getElementById('btn-close-download-modal');
  const btnSecClose = document.getElementById('btn-secondary-close-modal');
  if (btnClose) btnClose.onclick = closeModal;
  if (btnSecClose) btnSecClose.onclick = closeModal;

  modal.onclick = (e) => {
    if (e.target === modal) closeModal();
  };

  window.addEventListener('keydown', handleKeyDown);
}

// 註冊為全域函式供外部呼叫
window.showDownloadModal = showDownloadModal;

// 當 DOM 樹準備完成後執行載入
document.addEventListener('DOMContentLoaded', () => {
  loadPartial('header-placeholder', 'header.html', FALLBACK_HEADER);
  loadPartial('footer-placeholder', 'footer.html', FALLBACK_FOOTER);
  loadPartial('modal-placeholder', 'download-modal.html', FALLBACK_DOWNLOAD_MODAL);
});
