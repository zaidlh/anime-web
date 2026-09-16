// ============================================================
// أدوات مشتركة
// ============================================================
function toast(msg, kind) {
  let wrap = document.querySelector(".toast-wrap");
  if (!wrap) {
    wrap = document.createElement("div");
    wrap.className = "toast-wrap";
    document.body.appendChild(wrap);
  }
  const el = document.createElement("div");
  el.className = "toast" + (kind ? " " + kind : "");
  el.textContent = msg;
  wrap.appendChild(el);
  setTimeout(() => el.remove(), 4000);
}

async function apiPost(url, body) {
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body || {}),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `خطأ (${res.status})`);
  return data;
}

async function apiGet(url) {
  const res = await fetch(url);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `خطأ (${res.status})`);
  return data;
}

function escapeHtml(s) {
  return String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

function logLineClass(line) {
  if (/^(✅|💯|🚀)/.test(line)) return "ok";
  if (/^❌/.test(line)) return "err";
  if (/^(⚠️|🔍|🔄|⬆️)/.test(line)) return "warn";
  return "info";
}

function renderLog(panelEl, lines) {
  panelEl.innerHTML = lines.slice(-40)
    .map((l) => `<div class="${logLineClass(l)}">${escapeHtml(l)}</div>`)
    .join("");
  panelEl.scrollTop = panelEl.scrollHeight;
}

function pollJob(jobId, { onLog, onProgress, onDone, onError, interval = 1500 }) {
  const timer = setInterval(async () => {
    try {
      const job = await apiGet(`/api/job/${jobId}`);
      if (onLog) onLog(job.log || []);
      if (onProgress) onProgress(job.progress || 0);
      if (job.status !== "running") {
        clearInterval(timer);
        if (job.status === "error") { if (onError) onError(job); }
        else if (onDone) onDone(job);
      }
    } catch (e) {
      clearInterval(timer);
      if (onError) onError({ error: e.message });
    }
  }, interval);
  return timer;
}

// ============================================================
// صفحة: تحميل أنمي
// ============================================================
function initAnimePage() {
  const els = {
    searchInput: document.getElementById("anime-search-input"),
    searchBtn: document.getElementById("anime-search-btn"),
    resultsBox: document.getElementById("anime-results"),
    infoBox: document.getElementById("anime-info"),
    epGrid: document.getElementById("anime-episodes"),
    qualityGroup: document.getElementById("anime-quality"),
    toolbar: document.getElementById("anime-toolbar"),
    selectedCount: document.getElementById("anime-selected-count"),
    logCard: document.getElementById("anime-log-card"),
    logPanel: document.getElementById("anime-log-panel"),
    progressBar: document.getElementById("anime-progress-bar"),
    doneBox: document.getElementById("anime-done-box"),
  };
  if (!els.searchBtn) return;

  let currentAnime = null;
  let quality = "HD";
  const selected = new Set();

  els.searchBtn.onclick = doSearchOrFetch;
  els.searchInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doSearchOrFetch(); });

  async function doSearchOrFetch() {
    const text = els.searchInput.value.trim();
    if (!text) return;
    els.resultsBox.innerHTML = "";
    els.infoBox.innerHTML = "";
    els.epGrid.innerHTML = "";
    els.toolbar.style.display = "none";
    els.doneBox.innerHTML = "";
    if (text.startsWith("http")) {
      await doFetch(text);
      return;
    }
    els.resultsBox.innerHTML = `<div class="empty-state">🔎 جاري البحث عن «${escapeHtml(text)}»...</div>`;
    try {
      const { results } = await apiPost("/api/anime/search", { query: text });
      if (!results.length) {
        els.resultsBox.innerHTML = `<div class="empty-state">لا توجد نتائج. جرّب اسماً آخر أو ألصق الرابط مباشرة.</div>`;
        return;
      }
      els.resultsBox.innerHTML = `<div class="grid">` + results.map((r, i) => `
        <div class="ep-card" data-url="${escapeHtml(r.url)}" style="cursor:pointer">
          <span>🎬</span><span>${escapeHtml(r.title)}</span>
        </div>`).join("") + `</div>`;
      els.resultsBox.querySelectorAll(".ep-card").forEach((card) => {
        card.onclick = () => doFetch(card.dataset.url);
      });
    } catch (e) {
      els.resultsBox.innerHTML = `<div class="empty-state">❌ ${escapeHtml(e.message)}</div>`;
    }
  }

  async function doFetch(url) {
    els.resultsBox.innerHTML = `<div class="empty-state">⏳ جاري جلب بيانات الأنمي...</div>`;
    try {
      const { data } = await apiPost("/api/anime/fetch", { url });
      currentAnime = data;
      selected.clear();
      els.resultsBox.innerHTML = "";
      renderInfo();
      renderEpisodes();
      els.toolbar.style.display = "flex";
    } catch (e) {
      els.resultsBox.innerHTML = `<div class="empty-state">❌ ${escapeHtml(e.message)}</div>`;
    }
  }

  function renderInfo() {
    const info = currentAnime.Info.dict;
    const order = ["الحالة", "الاستوديو", "تم الإصدار", "المدة", "الموسم", "النوع", "الرقابة", "المخرج"];
    const badges = (info["صنف"] || "").split(",").filter(Boolean)
      .map((g) => `<span class="badge">${escapeHtml(g.trim())}</span>`).join("");
    const rows = order.filter((k) => info[k]).map((k) => `<div>• <b>${k}:</b> ${escapeHtml(info[k])}</div>`).join("");
    els.infoBox.innerHTML = `
      <div class="header-card">
        ${currentAnime.Image ? `<img src="${escapeHtml(currentAnime.Image)}" onerror="this.style.display='none'">` : ""}
        <div>
          <div class="title">${escapeHtml(currentAnime.Title)}</div>
          <div>${currentAnime.Episodes.length} حلقة متوفرة</div>
          <div>${badges}</div>
        </div>
      </div>
      <div class="card">${rows}</div>`;
  }

  function renderEpisodes() {
    els.epGrid.innerHTML = currentAnime.Episodes.map((ep) => `
      <div class="ep-card ${selected.has(ep.id) ? "selected" : ""}" data-id="${ep.id}">
        <span class="check">${selected.has(ep.id) ? "✓" : ""}</span>
        <span>الحلقة ${escapeHtml(ep.Episode)}</span>
      </div>`).join("");
    els.epGrid.querySelectorAll(".ep-card").forEach((card) => {
      card.onclick = () => {
        const id = Number(card.dataset.id);
        if (selected.has(id)) selected.delete(id); else selected.add(id);
        renderEpisodes();
        updateCount();
      };
    });
    updateCount();
  }

  function updateCount() {
    els.selectedCount.textContent = selected.size;
  }

  els.qualityGroup.querySelectorAll(".pill").forEach((pill) => {
    pill.onclick = () => {
      quality = pill.dataset.q;
      els.qualityGroup.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p === pill));
    };
  });

  document.getElementById("anime-dl-selected").onclick = () => startDownload([...selected]);
  document.getElementById("anime-dl-all").onclick = () => startDownload(currentAnime.Episodes.map((e) => e.id));

  async function startDownload(ids) {
    if (!ids.length) { toast("اختر حلقة واحدة على الأقل", "err"); return; }
    const episodes = ids.map((id) => {
      const ep = currentAnime.Episodes.find((e) => e.id === id);
      return { episode: ep.Episode, quality_data: ep[`quality-data-${quality}`] || [] };
    });
    els.logCard.style.display = "block";
    els.doneBox.innerHTML = "";
    renderLog(els.logPanel, [`🔄 بدء تحميل ${ids.length} حلقة بجودة ${quality}`]);
    try {
      const { job_id } = await apiPost("/api/anime/download", {
        anime_title: currentAnime.Title, quality, episodes,
      });
      pollJob(job_id, {
        onLog: (lines) => renderLog(els.logPanel, lines),
        onProgress: (p) => { els.progressBar.firstElementChild.style.width = (p * 100) + "%"; },
        onDone: () => {
          els.doneBox.innerHTML = `<div class="card">✅ اكتمل التحميل. <a class="btn btn-primary" href="/downloads">📤 الذهاب لصفحة الرفع لفيسبوك</a></div>`;
        },
        onError: (job) => toast(job.error || "حدث خطأ أثناء التحميل", "err"),
      });
    } catch (e) {
      toast(e.message, "err");
    }
  }
}

// ============================================================
// صفحة: تحميل يوتيوب
// ============================================================
function initYoutubePage() {
  const els = {
    urlInput: document.getElementById("yt-url-input"),
    fetchBtn: document.getElementById("yt-fetch-btn"),
    infoBox: document.getElementById("yt-info"),
    epGrid: document.getElementById("yt-videos"),
    qualityGroup: document.getElementById("yt-quality"),
    toolbar: document.getElementById("yt-toolbar"),
    selectedCount: document.getElementById("yt-selected-count"),
    logCard: document.getElementById("yt-log-card"),
    logPanel: document.getElementById("yt-log-panel"),
    progressBar: document.getElementById("yt-progress-bar"),
    doneBox: document.getElementById("yt-done-box"),
  };
  if (!els.fetchBtn) return;

  let currentData = null;
  let quality = "HD";
  const selected = new Set();

  els.fetchBtn.onclick = doFetch;
  els.urlInput.addEventListener("keydown", (e) => { if (e.key === "Enter") doFetch(); });

  async function doFetch() {
    const url = els.urlInput.value.trim();
    if (!url) return;
    els.infoBox.innerHTML = `<div class="empty-state">⏳ جاري جلب البيانات...</div>`;
    els.epGrid.innerHTML = "";
    els.toolbar.style.display = "none";
    els.doneBox.innerHTML = "";
    try {
      const { data } = await apiPost("/api/youtube/fetch", { url });
      currentData = data;
      selected.clear();
      els.infoBox.innerHTML = `
        <div class="header-card">
          <div>
            <div class="title">${escapeHtml(data.Info.title)}</div>
            <div>👤 ${escapeHtml(data.Info.uploader)} &nbsp; | &nbsp; 🎞️ ${data.Episodes.length} فيديو</div>
          </div>
        </div>`;
      renderVideos();
      els.toolbar.style.display = "flex";
    } catch (e) {
      els.infoBox.innerHTML = `<div class="empty-state">❌ ${escapeHtml(e.message)}</div>`;
    }
  }

  function renderVideos() {
    els.epGrid.innerHTML = currentData.Episodes.map((v) => `
      <div class="ep-card ${selected.has(v.id) ? "selected" : ""}" data-id="${v.id}">
        <span class="check">${selected.has(v.id) ? "✓" : ""}</span>
        <span>${escapeHtml(v.Title.slice(0, 45))} (${escapeHtml(v.Duration)})</span>
      </div>`).join("");
    els.epGrid.querySelectorAll(".ep-card").forEach((card) => {
      card.onclick = () => {
        const id = Number(card.dataset.id);
        if (selected.has(id)) selected.delete(id); else selected.add(id);
        renderVideos();
        els.selectedCount.textContent = selected.size;
      };
    });
    els.selectedCount.textContent = selected.size;
  }

  els.qualityGroup.querySelectorAll(".pill").forEach((pill) => {
    pill.onclick = () => {
      quality = pill.dataset.q;
      els.qualityGroup.querySelectorAll(".pill").forEach((p) => p.classList.toggle("active", p === pill));
    };
  });

  document.getElementById("yt-dl-selected").onclick = () => startDownload([...selected]);
  document.getElementById("yt-dl-all").onclick = () => startDownload(currentData.Episodes.map((v) => v.id));

  async function startDownload(ids) {
    if (!ids.length) { toast("اختر فيديو واحداً على الأقل", "err"); return; }
    const videos = ids.map((id) => currentData.Episodes.find((v) => v.id === id));
    els.logCard.style.display = "block";
    els.doneBox.innerHTML = "";
    renderLog(els.logPanel, [`🔄 بدء تحميل ${ids.length} فيديو بجودة ${quality}`]);
    try {
      const { job_id } = await apiPost("/api/youtube/download", { quality, videos });
      pollJob(job_id, {
        onLog: (lines) => renderLog(els.logPanel, lines),
        onProgress: (p) => { els.progressBar.firstElementChild.style.width = (p * 100) + "%"; },
        onDone: () => {
          els.doneBox.innerHTML = `<div class="card">✅ اكتمل التحميل. <a class="btn btn-primary" href="/downloads">📤 الذهاب لصفحة الرفع لفيسبوك</a></div>`;
        },
        onError: (job) => toast(job.error || "حدث خطأ أثناء التحميل", "err"),
      });
    } catch (e) {
      toast(e.message, "err");
    }
  }
}

// ============================================================
// صفحة: الملفات الجاهزة للرفع
// ============================================================
function initDownloadsPage() {
  const tbody = document.getElementById("downloads-tbody");
  const emptyState = document.getElementById("downloads-empty");
  const selectAll = document.getElementById("downloads-select-all");
  const uploadBtn = document.getElementById("downloads-upload-btn");
  const logCard = document.getElementById("downloads-log-card");
  const logPanel = document.getElementById("downloads-log-panel");
  const progressBar = document.getElementById("downloads-progress-bar");
  if (!tbody) return;

  let entries = [];

  async function load() {
    const { entries: e } = await apiGet("/api/downloads/list");
    entries = e;
    render();
  }

  function render() {
    if (!entries.length) {
      tbody.innerHTML = "";
      emptyState.style.display = "block";
      return;
    }
    emptyState.style.display = "none";
    tbody.innerHTML = entries.map((it) => `
      <tr>
        <td><input type="checkbox" class="row-check" data-id="${it.id}"></td>
        <td>${it.kind === "anime" ? "🎬" : "📺"} ${escapeHtml(it.title)}</td>
        <td>${escapeHtml(it.subtitle || "")}</td>
        <td>${(it.size / 1024 / 1024).toFixed(1)} MB</td>
        <td><span class="status-tag ${it.uploaded ? "uploaded" : "pending"}">${it.uploaded ? "تم الرفع" : "بانتظار الرفع"}</span></td>
        <td>
          <a class="btn btn-secondary" href="/downloads/file/${it.id}">⬇️ تنزيل</a>
          <button class="btn btn-danger" data-del="${it.id}">🗑️</button>
        </td>
      </tr>`).join("");
    tbody.querySelectorAll("[data-del]").forEach((btn) => {
      btn.onclick = async () => {
        if (!confirm("حذف هذا الملف نهائياً؟")) return;
        await apiPost(`/api/downloads/${btn.dataset.del}/delete`, {});
        load();
      };
    });
  }

  selectAll.onchange = () => {
    tbody.querySelectorAll(".row-check").forEach((cb) => { cb.checked = selectAll.checked; });
  };

  uploadBtn.onclick = async () => {
    const ids = [...tbody.querySelectorAll(".row-check:checked")].map((cb) => cb.dataset.id);
    if (!ids.length) { toast("اختر ملفاً واحداً على الأقل", "err"); return; }
    logCard.style.display = "block";
    renderLog(logPanel, [`🔄 بدء رفع ${ids.length} ملف إلى فيسبوك`]);
    try {
      const { job_id } = await apiPost("/api/upload/facebook", { entry_ids: ids });
      pollJob(job_id, {
        onLog: (lines) => renderLog(logPanel, lines),
        onProgress: (p) => { progressBar.firstElementChild.style.width = (p * 100) + "%"; },
        onDone: () => { toast("انتهى الرفع ✅", "ok"); load(); },
        onError: (job) => toast(job.error || "حدث خطأ أثناء الرفع", "err"),
      });
    } catch (e) {
      toast(e.message, "err");
    }
  };

  load();
}

document.addEventListener("DOMContentLoaded", () => {
  initAnimePage();
  initYoutubePage();
  initDownloadsPage();
});
