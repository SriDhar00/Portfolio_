# Sridhar N — Portfolio Website

A fast, responsive, JSON-driven portfolio built with plain HTML, CSS and JavaScript
(no build step, no framework required — works everywhere, including GitHub Pages,
Netlify, and Vercel).

## Design concept — "Signal Trace"

The visual identity is a PCB / circuit motif: a traveling signal line runs down the
left edge of the page (visible on wide screens) and connects every section, like a
trace on a circuit board — a nod to your Computer & Communication Engineering
background. The hero's dashboard card echoes your Power BI project. Accent color
is signal teal (`#52E3C2`) with an amber highlight; type pairs Space Grotesk
(headings), Inter (body) and IBM Plex Mono (labels/data).

## Folder structure

```
portfolio/
├── index.html          → all sections, structure only
├── 404.html             → custom not-found page
├── css/style.css        → all styling, theme tokens, animations
├── js/main.js           → reads the JSON files below and renders every section
├── data/
│   ├── profile.json      → name, title, bio, stats, contact basics
│   ├── skills.json        → skill categories + progress-bar levels
│   ├── projects.json      → project cards (title, tech, features, links)
│   ├── education.json     → education timeline
│   ├── experience.json    → internship / work timeline
│   ├── certificates.json  → certificate cards
│   └── socials.json       → GitHub / LinkedIn / email / phone links
└── assets/
    ├── profile.jpg      → your photo (used in the hero card)
    ├── resume.pdf        → your resume (used by the Download Resume button)
    └── favicon.svg
```

## How to update your portfolio (no code required)

- **Add/edit a project** → edit `data/projects.json`. A new object in the array
  becomes a new project card automatically.
- **Change GitHub/LinkedIn links** → edit `data/socials.json`. Every social
  button updates automatically.
- **Update your resume** → replace `assets/resume.pdf` with your new file
  (keep the same filename). The Download button always points to this file.
- **Update your photo** → replace `assets/profile.jpg` with a new image
  (keep the same filename, ideally a portrait, at least 600px tall).
- **Update skills, education, experience, certificates** → edit the matching
  JSON file in `data/`.

You never need to touch `index.html` or `js/main.js` for normal updates.

## Running it locally

Because the site loads `data/*.json` with `fetch()`, it must be served over
`http://`, not opened directly as a `file://` path (browsers block JSON fetch
from local files for security). Use any static server, for example:

```bash
# Python
python3 -m http.server 8080

# Node
npx serve .
```

Then open `http://localhost:8080`.

## Deploying

- **GitHub Pages**: push this folder to a repo, enable Pages on the `main`
  branch (root), done.
- **Netlify**: drag-and-drop the `portfolio` folder into Netlify, or connect
  the repo — no build command needed (leave the build command blank, publish
  directory `/`).
- **Vercel**: import the repo as a static project (framework preset:
  "Other"), no build command needed.

## Notes / things worth filling in

A few resume details were left as clear placeholders — update these in the
matching JSON file whenever you have the real values:

- `data/experience.json` — the internship's company name and exact duration.
- `data/certificates.json` — each certificate's issuing platform, plus a
  `link` to the certificate if you have one.
- `data/projects.json` — add `demo` links if any project has a live URL, and
  drop a screenshot path into `image` if you want real project screenshots
  instead of the icon placeholder.
- `data/profile.json` → `"portfolio"` field / `data/socials.json` →
  `"portfolio"` — your live site URL, once deployed.

## Contact form

The contact form validates input in the browser but does not send email on
its own (this is a static site with no backend). Wire it up to a service like
[Formspree](https://formspree.io) or [EmailJS](https://www.emailjs.com/) by
pointing the form's submit handler at their API — a few lines in
`js/main.js` inside `initContactForm()`.
