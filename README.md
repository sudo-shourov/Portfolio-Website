# 🖥️ Portfolio OS

An interactive, retro-modern Desktop OS interface built for web portfolios. Features **60+ FPS GPU-accelerated window management**, responsive mobile layouts, dynamic themes, and a built-in terminal.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![HTML5](https://img.shields.io/badge/HTML5-E34F26?logo=html5&logoColor=white)
![CSS3](https://img.shields.io/badge/CSS3-1572B6?logo=css3&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)

---

## ✨ Features

* 🚀 **Fluid Window Management**: Smooth, high-FPS window dragging and resizing powered by requestAnimationFrame and 3D GPU transforms (translate3d).
* 🌓 **Light/Dark Themes**: One-click dynamic color palette switching using CSS variables.
* ⌨️ **Interactive Terminal**: Fully working command line app supporting custom commands (help, about, work, theme, sudo, clear, etc.).
* 📱 **Fully Responsive**: Automatically adapts from a windowed desktop OS on large screens to a full-width mobile view on smaller devices.
* 🔊 **Audio Effects**: Subtle, optional Web Audio API retro sound effects.
* 🐥 **Desktop Buddy**: Interactive animated mascot with random speech bubbles and easter eggs.
* ⚡ **Zero Dependencies**: Pure HTML5, CSS3, and modern Vanilla JavaScript—no heavy frameworks or external bundlers required.

---

## 🛠️ Project Structure

.
├── index.html       # OS layout, windows, taskbar, and initial DOM structure
├── style.css        # Core design system, CSS variables, and layout styles
└── script.js       # Window manager, event listeners, clock, and terminal logic

---

## 🚀 Quick Start

Since this project requires no build steps or dependencies, running it locally is instant:

1. Clone the repository:
   git clone https://github.com/your-username/portfolio-os.git
   cd portfolio-os

2. Open in browser:
   - Double-click index.html to open it in any modern browser.
   - Or use Live Server in VS Code to run it on a local development server.

---

## 🎨 Customization

### Changing Personal Details
Update your bio, name, links, and avatar image directly inside the about section of index.html:

<div class="window" data-app="about">
  <div class="about-head">
    <div class="avatar">
      <img src="your-photo.jpg" alt="Your Name">
    </div>
    <div>
      <h2 class="name">Your Name</h2>
      <p class="role">Software Engineer & Designer</p>
    </div>
  </div>
</div>

### Adding Terminal Commands
Extend or customize available shell commands in script.js inside the runCommand() switch block:

switch(cmd) {
  case 'custom':
    printLine('This is a custom terminal response!');
    break;
}

---

## 💻 Tech Stack

* HTML5: Semantic markup for layout, windows, and accessibility tags.
* CSS3: CSS Custom Properties (variables), Flexbox, CSS Grid, and GPU hint optimizations (will-change).
* JavaScript (ES6+): Pointer Capture events, Web Audio API, and requestAnimationFrame render loops.

---

## 📄 License

Distributed under the MIT License. See LICENSE for more information.
