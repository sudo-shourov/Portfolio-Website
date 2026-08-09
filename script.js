(function(){
  'use strict';

  var isMobile = function(){ return window.matchMedia('(max-width:760px)').matches; };

  /* ---------------- BOOT SCREEN ---------------- */
  var boot = document.getElementById('boot');
  function dismissBoot(){
    if (!boot || boot.classList.contains('hide')) return;
    boot.classList.add('hide');
    setTimeout(function(){ boot.style.display = 'none'; }, 400);
  }
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    dismissBoot();
  } else if (boot) {
    boot.addEventListener('click', dismissBoot);
    window.addEventListener('keydown', dismissBoot, { once: true });
    setTimeout(dismissBoot, 2200);
  }

  /* ---------------- THEME & SOUND CONTROLS ---------------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById('themeToggle');
  if (themeBtn) {
    themeBtn.addEventListener('click', function(){
      var next = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      themeBtn.textContent = next === 'dark' ? '☀️' : '🌙';
      blip(next === 'dark' ? 220 : 440);
    });
    themeBtn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀️' : '🌙';
  }

  /* Web Audio Synthesizer */
  var soundOn = true;
  var soundBtn = document.getElementById('soundToggle');
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

  if (soundBtn) {
    soundBtn.setAttribute('aria-pressed', 'true');
    soundBtn.textContent = '🔊';

    soundBtn.addEventListener('click', function(){
      soundOn = !soundOn;
      soundBtn.setAttribute('aria-pressed', String(soundOn));
      soundBtn.textContent = soundOn ? '🔊' : '🔈';
      if (soundOn) blip(520, .08);
    });
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

  /* ---------------- SYSTEM CLOCK ---------------- */
  var clockEl = document.getElementById('clock');
  function tickClock(){
    if (!clockEl) return;
    var d = new Date();
    var h = d.getHours(), m = d.getMinutes();
    var ampm = h >= 12 ? 'PM' : 'AM';
    h = h % 12; if (h === 0) h = 12;
    clockEl.textContent = h + ':' + String(m).padStart(2,'0') + ' ' + ampm;
  }
  tickClock();
  setInterval(tickClock, 1000 * 15);

  /* ---------------- COPY EMAIL TO CLIPBOARD ---------------- */
  var copyBtn = document.getElementById('copyEmail');
  if (copyBtn) {
    copyBtn.addEventListener('click', function(){
      var textEl = document.getElementById('emailText');
      if (!textEl) return;
      var text = textEl.textContent;
      navigator.clipboard && navigator.clipboard.writeText(text).then(function(){
        copyBtn.textContent = 'copied!';
        setTimeout(function(){ copyBtn.textContent = 'copy'; }, 1400);
      });
    });
  }

  /* ---------------- DESKTOP BUDDY MASCOT ---------------- */
  var buddy = document.getElementById('buddy');
  var bubble = document.getElementById('buddyBubble');
  var BUDDY_LINES = ['hi there! (｡•̀ᴗ-)✧', 'boop!', 'click an icon to explore ✨', 'try opening the terminal!', 'you found me!', 'have a nice day :)'];
  
  function buddySay(){
    if (!bubble || !buddy) return;
    bubble.textContent = BUDDY_LINES[Math.floor(Math.random() * BUDDY_LINES.length)];
    bubble.classList.add('show');
    buddy.classList.remove('jump'); void buddy.offsetWidth; buddy.classList.add('jump');
    blip(880, .06);
    clearTimeout(buddy._t);
    buddy._t = setTimeout(function(){ bubble.classList.remove('show'); }, 2200);
  }

  if (buddy) {
    buddy.addEventListener('click', buddySay);
    buddy.addEventListener('keydown', function(e){ if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); buddySay(); } });
  }

  /* ---------------- TERMINAL CLI ENVIRONMENT ---------------- */
  var termOutput = document.getElementById('termOutput');
  var termInput = document.getElementById('termInput');

  var HELP_TEXT = [
    'available commands:',
    '  help              show this list',
    '  about             open the about window',
    '  resume            view resume in pdf reader',
    '  work / projects   open the work window',
    '  gallery           open the gallery window',
    '  contact           open the contact window',
    '  links             open the links window',
    '  whoami            ...take a guess',
    '  date              show the current date/time',
    '  theme <light|dark> switch desktop theme',
    '  echo <text>       repeat text back',
    '  clear             clear terminal screen',
    '  exit              close terminal'
  ].join('\n');

  function printLine(text, cls){
    if (!termOutput) return;
    var div = document.createElement('div');
    if (cls) div.className = cls;
    div.textContent = text;
    termOutput.appendChild(div);
    termOutput.scrollTop = termOutput.scrollHeight;
  }

  function runCommand(raw){
    var input = raw.trim();
    printLine('visitor@shourov.os:~$ ' + input, 'cmd-line');
    if (!input) return;

    var cleanInput = input.toLowerCase().replace(/[^a-z0-9\s]/g, '').trim();
    var parts = input.split(/\s+/);
    var cmd = parts[0].toLowerCase();
    var rest = parts.slice(1).join(' ');

    /* 1. Conversational Queries */
    var greetings = ['hello', 'hi', 'hey', 'yo', 'sup', 'heyy', 'hola', 'namaste'];
    if (greetings.includes(cleanInput)) {
      printLine("Hey there! 👋 Welcome to my portfolio OS. Type 'help' to see available terminal commands!");
      return;
    }

    var howAreYou = ['how are you', 'how are u', 'hows it going', 'how are you doing'];
    if (howAreYou.includes(cleanInput)) {
      printLine("System status nominal! Operating smoothly and ready to assist you. 🙂");
      return;
    }

    var thanks = ['thanks', 'thank you', 'thx', 'ty'];
    if (thanks.includes(cleanInput)) {
      printLine("You're very welcome! Feel free to explore more apps around the desktop. 😊");
      return;
    }

    var creators = ['who made you', 'who created you', 'who built this', 'who are you'];
    if (creators.includes(cleanInput)) {
      printLine("This portfolio OS environment was designed and engineered by Shirajul Alam Shourov!");
      return;
    }

    /* 2. System Commands */
    switch(cmd){
      case 'help': printLine(HELP_TEXT); break;
      case 'about': openApp('about'); printLine('opening about.txt ...'); break;
      case 'resume': case 'pdf': openApp('pdf-viewer'); printLine('opening resume.pdf in viewer ...'); break;
      case 'work': case 'projects': openApp('work'); printLine('opening work ...'); break;
      case 'gallery': openApp('gallery'); printLine('opening gallery ...'); break;
      case 'links': openApp('links'); printLine('opening links ...'); break;
      case 'contact': openApp('contact'); printLine('opening contact ...'); break;
      case 'whoami': printLine("you're currently exploring Shourov's interactive Web OS portfolio. welcome!"); break;
      case 'date': printLine(new Date().toString()); break;
      case 'echo': printLine(rest); break;
      case 'clear': if (termOutput) termOutput.innerHTML = ''; break;
      case 'theme':
        if (rest === 'light' || rest === 'dark') {
          root.setAttribute('data-theme', rest);
          if (themeBtn) themeBtn.textContent = rest === 'dark' ? '☀️' : '🌙';
          printLine('theme changed to ' + rest + '.');
        } else {
          printLine("usage: theme <light|dark>", 'err');
        }
        break;
      case 'sudo':
        printLine('nice try! permission denied — this is a client-side web terminal 😄', 'err');
        break;
      case 'ls':
        printLine(Object.keys(APP_META).join('  '));
        break;
      case 'exit': case 'close':
        printLine('closing terminal ...');
        setTimeout(function(){ closeApp('terminal'); }, 250);
        break;
      default:
        printLine("command not recognized: '" + cmd + "' — type 'help' for options or say hi! 👋", 'err');
    }
  }

  if (termInput) {
    termInput.addEventListener('keydown', function(e){
      if (e.key === 'Enter') {
        var val = termInput.value;
        termInput.value = '';
        runCommand(val);
      }
    });
  }

  /* Automatically open About window after boot */
  setTimeout(function(){ openApp('about'); }, isMobile() ? 300 : 2300);

})();