'use strict';

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
