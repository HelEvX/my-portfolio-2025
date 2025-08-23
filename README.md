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

### Dependencies

- [jsdom](https://github.com/jsdom/jsdom) – work with HTML/DOM in Node
- [sharp](https://sharp.pixelplumbing.com/) – image processing (resize, optimize)

See `package.json` for exact version details.

### Setup

Clone the repo, then install dependencies:

npm install

Run helper scripts as needed, for example:

node add-post.js (Append a blog post entry to search.json with optional auto-summary + auto URL)
npm run build-blog (Build blog listing pages with 6 posts per page)
npm run update-nav (Update Prev/Next navigation)

npm run images (Generate multiple resized JPEG + WebP versions from one master image)

## Deployment

This project is deployed automatically to Netlify from the `main` branch.  
Live site: [https://heleenevers.be](https://heleenevers.be)

## Privacy

See [Privacy Notice](privacy.html).

## License

© 2025 Heleen Evers. All rights reserved.  
This project is for personal/portfolio use and not intended for reuse as a template.
