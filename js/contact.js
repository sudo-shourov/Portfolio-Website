'use strict';

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
