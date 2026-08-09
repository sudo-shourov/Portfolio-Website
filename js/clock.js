'use strict';

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
