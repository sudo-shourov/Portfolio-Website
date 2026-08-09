'use strict';

/* =========================================================
   PDF VIEWER — renders resume.pdf onto a canvas inside the
   pdf-viewer window, fully replacing the browser's own PDF
   chrome with controls that match the OS theme: toolbar,
   fit-width, zoom %, page nav, spinner, keyboard shortcuts.
   Loads lazily the first time the window is opened.
   ========================================================= */

(function(){
  var canvas = document.getElementById('pdfCanvas');
  if (!canvas || typeof pdfjsLib === 'undefined') return;

  var ctx = canvas.getContext('2d');
  var pageInfoEl = document.getElementById('pdfPageInfo');
  var zoomInfoEl = document.getElementById('pdfZoomInfo');
  var prevBtn = document.getElementById('pdfPrev');
  var nextBtn = document.getElementById('pdfNext');
  var zoomInBtn = document.getElementById('pdfZoomIn');
  var zoomOutBtn = document.getElementById('pdfZoomOut');
  var fitBtn = document.getElementById('pdfFitWidth');
  var loadingEl = document.getElementById('pdfLoading');
  var errorEl = document.getElementById('pdfError');
  var wrapEl = document.querySelector('.pdf-canvas-wrap');
  var viewerWin = document.querySelector('.window[data-app="pdf-viewer"]');

  pdfjsLib.GlobalWorkerOptions.workerSrc =
    'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

  var pdfDoc = null;
  var pageNum = 1;
  var scale = 1.15;
  var MIN_SCALE = 0.4;
  var MAX_SCALE = 3;
  var rendering = false;
  var pendingPage = null;
  var startedLoading = false;

  function tick(){ if (typeof blip === 'function') blip(420, .05); }

  function updateToolbar(){
    if (pageInfoEl) pageInfoEl.textContent = pageNum + ' / ' + pdfDoc.numPages;
    if (zoomInfoEl) zoomInfoEl.textContent = Math.round(scale * 100) + '%';
    if (prevBtn) prevBtn.disabled = pageNum <= 1;
    if (nextBtn) nextBtn.disabled = pageNum >= pdfDoc.numPages;
    if (zoomOutBtn) zoomOutBtn.disabled = scale <= MIN_SCALE;
    if (zoomInBtn) zoomInBtn.disabled = scale >= MAX_SCALE;
  }

  function renderPage(num){
    rendering = true;
    canvas.classList.add('pdf-rendering');
    pdfDoc.getPage(num).then(function(page){
      var viewport = page.getViewport({ scale: scale });
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      page.render({ canvasContext: ctx, viewport: viewport }).promise.then(function(){
        rendering = false;
        canvas.classList.remove('pdf-rendering');
        if (pendingPage !== null) {
          var next = pendingPage;
          pendingPage = null;
          renderPage(next);
        }
      });
    });
    updateToolbar();
  }

  function queueRenderPage(num){
    if (rendering) { pendingPage = num; } else { renderPage(num); }
  }

  function showPage(num){
    if (!pdfDoc) return;
    pageNum = Math.max(1, Math.min(num, pdfDoc.numPages));
    queueRenderPage(pageNum);
  }

  function setZoom(next){
    if (!pdfDoc) return;
    scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, next));
    queueRenderPage(pageNum);
  }

  function fitWidth(){
    if (!pdfDoc || !wrapEl) return;
    pdfDoc.getPage(pageNum).then(function(page){
      var unscaled = page.getViewport({ scale: 1 });
      var available = wrapEl.clientWidth - 36; // account for padding
      setZoom(available / unscaled.width);
      tick();
    });
  }

  function loadPdf(){
    if (startedLoading) return;
    startedLoading = true;
    pdfjsLib.getDocument('resume.pdf').promise.then(function(doc){
      pdfDoc = doc;
      if (loadingEl) loadingEl.hidden = true;
      fitWidth();
      showPage(1);
    }).catch(function(err){
      console.error('PDF viewer: failed to load resume.pdf —', err);
      if (loadingEl) loadingEl.hidden = true;
      if (errorEl) {
        errorEl.hidden = false;
        var msgEl = errorEl.querySelector('.pdf-status-detail');
        if (msgEl) {
          msgEl.textContent = (window.location.protocol === 'file:')
            ? 'this page is open as a local file — serve it over http:// instead (see console for details).'
            : ((err && err.message) || 'unknown error') + ' (see console for details)';
        }
      }
    });
  }

  if (prevBtn) prevBtn.addEventListener('click', function(){ showPage(pageNum - 1); tick(); });
  if (nextBtn) nextBtn.addEventListener('click', function(){ showPage(pageNum + 1); tick(); });
  if (zoomInBtn) zoomInBtn.addEventListener('click', function(){ setZoom(scale + 0.15); tick(); });
  if (zoomOutBtn) zoomOutBtn.addEventListener('click', function(){ setZoom(scale - 0.15); tick(); });
  if (fitBtn) fitBtn.addEventListener('click', fitWidth);

  /* Keyboard shortcuts — only act while the PDF viewer window is
     the focused/active app, so they don't hijack typing elsewhere
     (e.g. the terminal). */
  document.addEventListener('keydown', function(e){
    var st = window.running && window.running['pdf-viewer'];
    if (!st || !st.tabEl || !st.tabEl.classList.contains('active')) return;
    if (e.key === 'ArrowRight') { showPage(pageNum + 1); tick(); }
    else if (e.key === 'ArrowLeft') { showPage(pageNum - 1); tick(); }
    else if (e.key === '+' || e.key === '=') { setZoom(scale + 0.15); tick(); }
    else if (e.key === '-' || e.key === '_') { setZoom(scale - 0.15); tick(); }
  });

  /* Load the PDF the first time the window is actually opened
     (via the desktop icon, the About window button, or 'resume'
     in the terminal) rather than on page load. */
  if (viewerWin) {
    var observer = new MutationObserver(function(){
      if (viewerWin.classList.contains('open')) loadPdf();
    });
    observer.observe(viewerWin, { attributes: true, attributeFilter: ['class'] });
    if (viewerWin.classList.contains('open')) loadPdf();
  }
})();
