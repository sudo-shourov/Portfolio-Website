'use strict';

/* =========================================================
   BINDINGS — wires the DOM to the window manager in core.js:
   opening apps from icons, close/minimize buttons, dragging
   and resizing windows, and the Escape shortcut.
   ========================================================= */

/* App launch click bindings */
document.querySelectorAll('.app-icon').forEach(function(btn){
  btn.addEventListener('click', function(){ openApp(btn.getAttribute('data-app')); });
});

/* App cross-trigger bindings (e.g. "View Resume" button inside About window) */
document.querySelectorAll('[data-app-trigger]').forEach(function(btn){
  btn.addEventListener('click', function(){
    var targetApp = btn.getAttribute('data-app-trigger');
    openApp(targetApp);
  });
});

/* Window control buttons & click-to-focus */
windowsLayer.querySelectorAll('.window').forEach(function(win){
  var appId = win.getAttribute('data-app');
  win.addEventListener('mousedown', function(){ focusApp(appId); });
  
  var closeBtn = win.querySelector('[data-close]');
  var minBtn = win.querySelector('[data-min]');
  if (closeBtn) closeBtn.addEventListener('click', function(e){ e.stopPropagation(); closeApp(appId); });
  if (minBtn) minBtn.addEventListener('click', function(e){ e.stopPropagation(); minimizeApp(appId); });

  if (!win.querySelector('.resize-handle')) {
    var handle = document.createElement('div');
    handle.className = 'resize-handle';
    win.appendChild(handle);
  }
});

/* Dragging and Resizing utilizing requestAnimationFrame for GPU performance */
windowsLayer.querySelectorAll('.window').forEach(function(win){
  var bar = win.querySelector('.window-titlebar');
  var handle = win.querySelector('.resize-handle');
  var appId = win.getAttribute('data-app');

  var isDragging = false;
  var isResizing = false;

  var startPointerX = 0, startPointerY = 0;
  var startWinX = 0, startWinY = 0;
  var startWidth = 0, startHeight = 0;

  var currentX = 0, currentY = 0;
  var currentWidth = 0, currentHeight = 0;

  var rafId = null;

  function updateWindowPosition() {
    if (isDragging) {
      var st = running[appId];
      if (st) {
        st.x = currentX;
        st.y = currentY;
        applyTransform(win, currentX, currentY);
      }
    }
    if (isResizing) {
      win.style.width = currentWidth + 'px';
      win.style.height = currentHeight + 'px';
    }
    rafId = null;
  }

  function scheduleUpdate() {
    if (!rafId) {
      rafId = requestAnimationFrame(updateWindowPosition);
    }
  }

  /* Drag start */
  if (bar) {
    bar.addEventListener('pointerdown', function(e){
      if (isMobile() || e.target.closest('.traffic')) return;
      isDragging = true;
      var st = running[appId];
      startWinX = st ? st.x : 0;
      startWinY = st ? st.y : 60;
      startPointerX = e.clientX;
      startPointerY = e.clientY;

      bar.setPointerCapture(e.pointerId);
      focusApp(appId);
    });
  }

  /* Resize start */
  if (handle) {
    handle.addEventListener('pointerdown', function(e){
      if (isMobile()) return;
      e.stopPropagation();
      isResizing = true;
      startWidth = win.offsetWidth;
      startHeight = win.offsetHeight;
      startPointerX = e.clientX;
      startPointerY = e.clientY;

      handle.setPointerCapture(e.pointerId);
      focusApp(appId);
    });
  }

  /* Move handler with bounding boundaries */
  function onPointerMove(e) {
    if (!isDragging && !isResizing) return;

    var deskRect = desktopEl.getBoundingClientRect();
    var deltaX = e.clientX - startPointerX;
    var deltaY = e.clientY - startPointerY;

    if (isDragging) {
      var x = startWinX + deltaX;
      var y = startWinY + deltaY;

      x = Math.max(4, Math.min(x, deskRect.width - win.offsetWidth - 4));
      y = Math.max(48, Math.min(y, deskRect.height - win.offsetHeight - 4));

      currentX = x;
      currentY = y;
    }

    if (isResizing) {
      var w = startWidth + deltaX;
      var h = startHeight + deltaY;

      w = Math.max(280, Math.min(w, deskRect.width - 24));
      h = Math.max(200, Math.min(h, deskRect.height - 80));

      currentWidth = w;
      currentHeight = h;
    }

    scheduleUpdate();
  }

  /* Pointer release */
  function onPointerUp(e) {
    if (isDragging && bar) {
      isDragging = false;
      try { bar.releasePointerCapture(e.pointerId); } catch(err){}
    }
    if (isResizing && handle) {
      isResizing = false;
      try { handle.releasePointerCapture(e.pointerId); } catch(err){}
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = null;
    }
  }

  if (bar) {
    bar.addEventListener('pointermove', onPointerMove);
    bar.addEventListener('pointerup', onPointerUp);
    bar.addEventListener('pointercancel', onPointerUp);
  }

  if (handle) {
    handle.addEventListener('pointermove', onPointerMove);
    handle.addEventListener('pointerup', onPointerUp);
    handle.addEventListener('pointercancel', onPointerUp);
  }
});

/* Global Keyboard Shortcuts */
window.addEventListener('keydown', function(e){
  if (e.key === 'Escape') {
    var activeId = Object.keys(running).find(function(id){ return running[id].tabEl.classList.contains('active'); });
    if (activeId) minimizeApp(activeId);
  }
});
