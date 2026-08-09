'use strict';

/* =========================================================
   CORE — shared helpers + the window manager engine.
   Loaded first: other files (bindings, terminal, buddy, etc.)
   rely on the globals defined here (blip, openApp, closeApp,
   minimizeApp, focusApp, running, APP_META, root, desktopEl).
   ========================================================= */

var isMobile = function(){ return window.matchMedia('(max-width:760px)').matches; };

var root = document.documentElement;

/* ---------------- WEB AUDIO SYNTHESIZER ---------------- */
var soundOn = true;
var audioCtx = null;

function blip(freq, dur){
  if (!soundOn) return;
  try {
    if (!audioCtx) audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    var osc = audioCtx.createOscillator();
    var gain = audioCtx.createGain();
    osc.type = 'sine';
    osc.frequency.value = freq || 440;
    gain.gain.setValueAtTime(0.06, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + (dur || 0.12));
    osc.connect(gain).connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + (dur || 0.12));
  } catch(e) { /* silent fail */ }
}

/* ---------------- WINDOW MANAGER ---------------- */
var windowsLayer = document.getElementById('windowsLayer');
var runningTabs = document.getElementById('runningTabs');
var desktopEl = document.getElementById('desktop');
var zTop = 10;
var running = {}; // appId -> { winEl, tabEl, minimized, x, y }

var APP_META = {
  about:        { icon:'🙂', title:'about.txt' },
  work:         { icon:'🗂️', title:'work' },
  gallery:      { icon:'🖼️', title:'gallery' },
  links:        { icon:'🔗', title:'links' },
  contact:      { icon:'✉️', title:'contact' },
  terminal:     { icon:'⌨️', title:'terminal' },
  'pdf-viewer': { icon:'📄', title:'Viewer' }
};

function winEl(appId){ return windowsLayer.querySelector('.window[data-app="'+appId+'"]'); }

function applyTransform(win, x, y) {
  win.style.transform = 'translate3d(' + Math.round(x) + 'px, ' + Math.round(y) + 'px, 0px)';
}

function focusApp(appId){
  var st = running[appId];
  if (!st) return;
  zTop += 1;
  st.winEl.style.zIndex = zTop;
  Object.keys(running).forEach(function(id){
    running[id].tabEl.classList.toggle('active', id === appId);
  });
}

function openApp(appId){
  var el = winEl(appId);
  if (!el) return;
  if (!running[appId]) {
    var meta = APP_META[appId] || { icon: '📄', title: appId };
    var tab = document.createElement('button');
    tab.className = 'run-tab';
    tab.innerHTML = meta.icon + ' <span>' + meta.title + '</span>';
    tab.addEventListener('click', function(){ toggleFromTaskbar(appId); });
    runningTabs.appendChild(tab);

    // Default spawn positioning clears top menubar safely
    var initialLeft = isMobile() ? 0 : 130 + (Object.keys(running).length * 20);
    var initialTop = isMobile() ? 0 : 60 + (Object.keys(running).length * 20);

    el.style.left = '0px';
    el.style.top = '0px';

    running[appId] = { 
      winEl: el, 
      tabEl: tab, 
      minimized: false,
      x: initialLeft,
      y: initialTop
    };

    applyTransform(el, initialLeft, initialTop);
    el.classList.add('open');
    blip(660, .07);
  } else {
    running[appId].minimized = false;
    el.classList.add('open');
  }
  focusApp(appId);
}

function closeApp(appId){
  var st = running[appId];
  if (!st) return;
  st.winEl.classList.remove('open');
  st.tabEl.remove();
  delete running[appId];
  blip(300, .07);
}

function minimizeApp(appId){
  var st = running[appId];
  if (!st) return;
  st.minimized = true;
  st.winEl.classList.remove('open');
  st.tabEl.classList.remove('active');
}

function toggleFromTaskbar(appId){
  var st = running[appId];
  if (!st) return;
  if (st.minimized || !st.winEl.classList.contains('open')) {
    st.minimized = false;
    st.winEl.classList.add('open');
    focusApp(appId);
  } else if (st.tabEl.classList.contains('active')) {
    minimizeApp(appId);
  } else {
    focusApp(appId);
  }
}
