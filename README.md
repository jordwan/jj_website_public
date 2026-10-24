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

## Easter eggs

- Click the title or the email to open a hidden two-level, 20-block mini
  blockchain. Every block is a real SHA-256 hash linked to the one before it.
  Progress is saved in the browser.
- Press the backtick key for a small command line (`help` lists commands).

## Remnants API (shared traces between visitors)

Level 2 shows faint traces left by earlier visitors (signature outlines, a
40-character note, and the tip hash of their chain) and lets you anchor yours.
That needs a tiny backend: `api/remnants.js`, a Vercel serverless function
backed by Upstash Redis.

To enable it:

1. Deploy the repo to Vercel (framework preset: Vite). The `api/` folder is
   picked up automatically.
2. In the Vercel project, add the **Upstash Redis** integration from the
   Marketplace (free tier is plenty). It sets `UPSTASH_REDIS_REST_URL` and
   `UPSTASH_REDIS_REST_TOKEN` for you. Legacy `KV_REST_API_*` names also work.
3. Redeploy.

Without the backend the site still works: the client falls back to a local
echo of your own anchors and labels it as such. The API keeps the last 500
remnants, strips control characters, caps note and signature size, and
rate-limits anchoring to 6 per IP per hour. IPs are used only for the rate
limit and are not stored.
