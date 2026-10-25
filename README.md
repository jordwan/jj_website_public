# Jordwan.com

Personal site: animated background, title, nav bar, About Me and Portfolio
pages. Built with React + Vite. Routes are client-side (`src/router.jsx`);
`vercel.json` rewrites deep links to `index.html`.

Page copy for About and Portfolio lives in `src/content.js`. Portfolio items
marked `status: "concept"` are placeholder ideas (the label is not shown on
the page). Items with `sealed: true` render as hash-only cards. Cards do not
link anywhere.

```shell
npm install
npm run dev      # local dev server
npm run build    # production build to dist/
npm run preview  # preview the production build
```

## Background

The animated city is `public/bg/bg.mp4` (1280×770, H.264, 528 frames at
30 fps, 17.6 s loop), re-encoded from the original 85 MB GIF with no change
to length or frame rate. Phones get `bg-mobile.mp4` (854 wide). The
component in `src/Background.jsx` autoplays muted inline, retries on the
first touch if the browser refuses autoplay (iOS Low Power Mode), and
drifts the poster frame slowly until the video is actually playing so the
page is never still.

## Easter eggs

- Click the title or the email to open a hidden two-level, 20-block mini
  blockchain. Every block is a real SHA-256 hash linked to the one before it.
  Progress is saved in the browser.
- Press the backtick key for a small command line (`help` lists commands).
- On touch devices the text steps show an ink pad: whatever you draw is
  hashed and the hash becomes your input. The ⌨ button switches to the
  normal keyboard. The oracle step offers four questions drawn from the 900
  in `src/easter/questions.txt`, or you can ask your own.

## Remnants API (shared traces between visitors)

Level 2 shows faint traces left by earlier visitors (signature outlines, a
40-character note, and the tip hash of their chain) and lets you anchor yours.
The client talks to `/api/remnants`.

### Netlify (production)

`netlify.toml` builds with Vite, publishes `dist/`, routes `/api/remnants` to
`netlify/functions/remnants.mjs`, and rewrites all other paths to
`index.html` for the client-side routes. The function stores remnants in
**Netlify Blobs**, which is built into every Netlify site, so there is nothing
to provision: push to the production branch and it works. Check it with:

```shell
curl https://<your-site>/api/remnants
```

### Vercel (alternative)

`api/remnants.js` is the same API as a Vercel function backed by Upstash
Redis (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`, or the legacy
`KV_REST_API_*` names). `vercel.json` provides the SPA rewrite.

### Behaviour and limits

Without a backend the site still works: the client falls back to a local
echo of your own anchors and labels it as such. The API keeps the last 500
remnants, strips control characters, caps note and signature size, and
rate-limits anchoring to 6 per IP per hour. IPs are used only for the rate
limit and are not stored. Shared logic lives in `api/_lib/remnants-core.js`.
