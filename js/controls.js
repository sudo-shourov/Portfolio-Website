'use strict';

/* ---------------- THEME & SOUND CONTROLS ---------------- */
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

var soundBtn = document.getElementById('soundToggle');
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
