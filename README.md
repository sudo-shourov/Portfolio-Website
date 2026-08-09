# shourov.os — Shirajul Alam Shourov's portfolio

Three files, each with one job. Keep them in the same folder — `index.html` loads the other two by relative path.

```
index.html   → structure & content (your name, bio, projects, links)
style.css    → all colors, fonts, spacing, layout
script.js    → window dragging, terminal, theme/sound toggles, the buddy
```

## What to edit, and where

**Your info** → `index.html`. Search the file for `EDIT:` — every one marks a
spot meant for your own content: project links, gallery images, and the
YouTube link (left as a placeholder since no channel URL was given yet — it's
in the Links window). LinkedIn, GitHub, Instagram, Facebook, and your email
are already wired up.

**Colors & fonts** → top of `style.css`, inside `:root`, `[data-theme="light"]`,
and `[data-theme="dark"]`. Change the hex values there and the whole site
updates — nothing else in the file needs to change.

```css
[data-theme="light"]{
  --teal:#1FA895;   /* accent color */
  --coral:#FF6F91;  /* accent color */
  --gold:#E7A400;   /* accent color */
  ...
}
```

To swap a font, change the Google Fonts `<link>` near the top of `index.html`
and the matching `--font-display` / `--font-mono` / `--font-body` variables
in `style.css`.

**Behavior** → `script.js`. This is where the window manager, the terminal
commands, and the desktop buddy live. You shouldn't need to touch it just to
personalize the site — only if you want to change how something *works*
(e.g. add a new terminal command, or a new app window).

## Previewing it

Just open `index.html` in a browser — no build step, no server required.

## Hosting it

Upload all three files (keeping them in the same folder) to any static host:
GitHub Pages, Netlify, Vercel, Cloudflare Pages, etc. all work with zero
configuration since this is plain HTML/CSS/JS.
