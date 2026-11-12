# WM-CV

CV site for William Martinez at willmartinez.win, hosted on Cloudflare Workers.

## Editing content
All wording is in `public/index.html`. Search for `EDIT` comments and replace the sample text.
- Add a role: copy one `<li class="reveal">` block in the Experience list.
- Add a photo to a loop: put the file in `public/img/` and copy an `<img>` line inside a `data-photo-loop` block.
- Highlight numbers: change `data-to`, `data-prefix` and `data-suffix` on each stat.

## Files
- `public/css/styles.css` design
- `public/js/loops.js` animated backgrounds (silk ribbons, contour lines, rosette)
- `public/img/` photos of Will, cropped from family photos and toned in blues
- `public/js/main.js` scroll reveals, counters, print button
- `wrangler.jsonc` Cloudflare config and custom domain

## Deploy
Cloudflare builds `main` with `npx wrangler deploy`. Every push to `main` goes live.
"Download CV" opens the print dialog with a clean print layout (Save as PDF).
