# WM-CV

CV site for William Martinez at willmartinez.win, hosted on Cloudflare Workers.

## Editing content
All wording is in `public/index.html`. Search for `EDIT` comments and replace the sample text.
- Add a role: copy one `<li class="reveal">` block in the Experience list.
- Add a photo: save it as `public/img/portrait.jpg` and follow the note in the Profile section.
- Highlight numbers: change `data-to`, `data-prefix` and `data-suffix` on each stat.

## Files
- `public/css/styles.css` design
- `public/js/loops.js` animated loops (silk ribbons, contour lines, orbit portrait, rosette)
- `public/js/main.js` scroll reveals, counters, print button
- `wrangler.jsonc` Cloudflare config and custom domain

## Deploy
Cloudflare builds `main` with `npx wrangler deploy`. Every push to `main` goes live.
"Download CV" opens the print dialog with a clean print layout (Save as PDF).
