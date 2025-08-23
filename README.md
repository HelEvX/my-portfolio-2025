# heleenevers.be

Personal portfolio website for showcasing my work, blog posts, and resume.  
Built as a static site with HTML, CSS, and JavaScript, deployed via Netlify.

## Features

- Minimal, responsive design
- Contact form (via Netlify Forms)
- Blog comments (via Giscus + GitHub Discussions)
- Privacy notice page (GDPR-compliant)
- HTTPS provided by Netlify

## Tech stack

- HTML5 / CSS3 / Vanilla JavaScript
- Node.js (for build/helper scripts)
- Netlify (hosting + forms)
- Giscus (comments)
- GitHub (version control)

## Development

This project uses Node.js libraries for build-time helper tasks such as:

- Resizing/optimizing images automatically
- Building blog posts into pretty URLs
- Updating `search.json` with new content
- Managing previous/next navigation for blog posts
- Creating paginated blog listings

### Dependencies

- [jsdom](https://github.com/jsdom/jsdom) – work with HTML/DOM in Node
- [sharp](https://sharp.pixelplumbing.com/) – image processing (resize, optimize)

See `package.json` for exact version details.

### Scripts

- npm run images
- nmp run build-blog
- npm run update-nav

## Build Workflow

 Raw images     Raw blog posts (HTML/Markdown)
     │                   │
     │                   │
     ▼                   ▼
 [ sharp ]         [ jsdom scripts ]
 (resize/optimize) (generate pretty URLs,
                    update search.json,
                    create paginated blog,
                    add prev/next links)
     │                   │
     └───────────┬───────┘
                 ▼
        Final static site
 (HTML + CSS + JS + assets)
                 │
                 ▼
              Netlify
   (hosting, HTTPS, contact forms)

## Deployment

This project is deployed automatically to Netlify from the `main` branch.  
Live site: [https://heleenevers.be](https://heleenevers.be)

## Privacy

See [Privacy Notice](privacy.html).

## License

© 2025 Heleen Evers. All rights reserved.  
This project is for personal/portfolio use and not intended for reuse as a template.
