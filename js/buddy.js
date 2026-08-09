'use strict';

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
