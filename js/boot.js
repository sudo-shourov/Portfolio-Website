'use strict';

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
