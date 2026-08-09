'use strict';

/* Automatically open About window after boot */
setTimeout(function(){ openApp('about'); }, isMobile() ? 300 : 2300);
