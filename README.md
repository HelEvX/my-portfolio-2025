# heleenevers.be

Personal portfolio website for showcasing my work, blog posts, and resume.  
Built as a static site with HTML, CSS, and JavaScript, deployed via Netlify.

## Features

- Minimal, responsive design
- Blog with tags, categories, and archive pages
- Paginated blog listings and archive pages
- Contact form (via Netlify Forms)
- Blog comments (via Giscus + GitHub Discussions)
- Privacy notice page (GDPR-compliant)
- HTTPS provided by Netlify

## Tech Stack

- HTML5 / CSS3 / Vanilla JavaScript
- Node.js (for build/helper scripts)
- Netlify (hosting + forms)
- Giscus (comments)
- GitHub (version control)

## Development

This project uses Node.js libraries for build-time helper tasks such as:

- Resizing/optimizing images automatically
- Building blog posts into pretty URLs
- Creating paginated blog listings
- Generating tag and category archive pages
- Updating blog post metadata (titles, dates, breadcrumbs)
- Updating `search.json` with new content
- Managing previous/next navigation for blog posts

### Dependencies

- [jsdom](https://github.com/jsdom/jsdom) – work with HTML/DOM in Node
- [sharp](https://sharp.pixelplumbing.com/) – image processing (resize, optimize)

See `package.json` for exact version details.

### Scripts

- `npm run images` – Process and optimize images
- `npm run build-blog` – Generate paginated blog pages
- `npm run build-archives` – Generate tag/category archive pages
- `npm run build-all` – Build blog pages and archives together
- `npm run update-nav` – Update blog post navigation and metadata

## Build Workflow

```
┌─────────────────┐    ┌──────────────────────────────┐
│   Raw images    │    │   Raw blog posts             │
│                 │    │   (HTML/Markdown)            │
└─────────┬───────┘    └─────────────┬────────────────┘
          │                          │
          ▼                          ▼
    ┌──────────┐            ┌─────────────────┐
    │  sharp   │            │  jsdom scripts  │
    │ (resize/ │            │ • pretty URLs   │
    │ optimize)│            │ • search.json   │
    └─────┬────┘            │ • paginated     │
          │                 │   blog pages    │
          │                 │ • archive pages │
          │                 │ • prev/next nav │
          │                 └─────────┬───────┘
          │                           │
          └───────────┬─────────────────┘
                      ▼
            ┌──────────────────┐
            │ Final static site│
            │(HTML + CSS + JS  │
            │    + assets)     │
            └─────────┬────────┘
                      │
                      ▼
                ┌──────────┐
                │ Netlify  │
                │(hosting, │
                │ HTTPS,   │
                │ forms)   │
                └──────────┘
```

### Site Structure

```
/
├── index.html              # Homepage
├── blog.html               # Blog overview (page 1)
├── blog/page/2/            # Additional blog pages
├── categories/
│   ├── work/               # Category archive pages
│   ├── personal/
│   └── school/
├── tags/
│   ├── design/             # Tag archive pages
│   ├── motion-graphics/
│   └── [other-tags]/
├── assets/
│   ├── css/
│   ├── js/
│   ├── img/
│   └── pdfs/
└── posts/                  # Individual blog posts
```

## Deployment

This project is deployed automatically to Netlify from the `main` branch.  
Live site: [https://heleenevers.be](https://heleenevers.be)

## Privacy

See [Privacy Notice](privacy.html).

## License

© 2025 Heleen Evers. All rights reserved.  
This project is for personal/portfolio use and not intended for reuse as a template.