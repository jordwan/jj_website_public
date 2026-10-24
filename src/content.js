/* Edit this file to change what the About and Portfolio pages say. */

export const about = {
  name: "Jordan",
  handle: "jordwan",
  location: "South Okanagan, BC",
  tagline: "systems · ledgers · interfaces",
  intro: [
    "I build software across the whole stack: the interfaces people touch, the services that keep them honest, and the ledgers underneath that make the result verifiable.",
    "Most of the work lives at the edges, where distributed systems, cryptographic protocols and real-time data meet a screen someone actually has to use. Ethereum and the XRP Ledger are home turf. The rest of the toolkit changes with the problem.",
    "Based in the Okanagan. Maybe available for the interesting ones.",
  ],
  stack: [
    { group: "interfaces", items: ["React", "TypeScript", "motion", "design systems"] },
    { group: "systems", items: ["Node", "serverless", "event streams", "edge caching"] },
    { group: "ledgers", items: ["Ethereum", "XRP Ledger", "smart contracts", "tokenization"] },
    { group: "signals", items: ["real-time data", "observability", "automation", "AI tooling"] },
  ],
  principles: [
    "Correct first. Fast second. Invisible last.",
    "Boring infrastructure, interesting products.",
    "The best interface is the one you stop noticing.",
    "Verify, then trust.",
  ],
  links: [
    { label: "github.com/jordwan", href: "https://github.com/jordwan" },
    { label: "info@jordwan.com", href: "mailto:info@jordwan.com" },
  ],
};

export const projects = [
  {
    title: "Jordwan.com",
    year: "2026",
    status: "live",
    tags: ["React", "Vite", "SHA-256", "serverless"],
    blurb:
      "Blockchain, hidden in plain sight. A quiet landing page with a working chain underneath: proof of work you mine with your hands, signatures you draw, a Merkle tree you fold yourself, and a visitor chain that remembers everyone who made it to the end. Every hash is real. The site is the portfolio piece.",
  },
  {
    title: "FootyFiend.com",
    year: "2009",
    status: "live",
    tags: ["Next.js", "Supabase", "community", "video"],
    blurb:
      "The Future of Snowboarding. A living archive and launchpad for snowboard and skate footage: riders drop clips, the community ranks them, and the leaderboard decides who owns the week. Fifteen years deep and still the first tab the culture opens.",
  },
  {
    title: "Ledger Lens",
    status: "concept",
    tags: ["React", "d3", "JSON-RPC"],
    blurb:
      "A block explorer rebuilt as a timeline. Scrub through history, watch the mempool breathe, and pull a single address as a thread through the entire chain. The data was always there. Nobody had made it legible.",
  },
  {
    title: "8a340a…0b81",
    sealed: true,
    cipher: [
      "8a34 0af0 a215 9ca5 7fef 04ee 8453 afec 1193",
      "4539 cc7a 8a7a 71aa 83f4 3768 f09a 8659 8c0b",
      "7df6 02a9 aba0 a3b4 5052 a2d4 e554 7829 2386",
      "6696 d909 4b14 b40f 9f83 15df d4a4 15f1 0833",
    ],
  },
  {
    title: "StreetzCalling.com",
    year: "2019",
    status: "live",
    tags: ["React", "brand", "storefront"],
    blurb:
      "Product of the Streetz. A streetwear label's digital storefront, cut to the essentials and built for the drop: fast, dark, mobile-first, and ready to scale from the first release to a full catalogue.",
  },
  {
    title: "Okanagan Pulse",
    status: "concept",
    tags: ["Next.js", "maps", "open data"],
    blurb:
      "The valley on one screen. Lake temperature, trail conditions, smoke and ferry waits pulled live from public feeds and composed to be glanced at, not studied. The morning check, before the morning.",
  },
  {
    title: "Mint Kit",
    status: "concept",
    tags: ["TypeScript", "wagmi", "components"],
    blurb:
      "The unglamorous half of every mint, solved once and done properly. Wallet connect, supply meters, quantity pickers and transaction toasts as drop-in components, themeable to anything and battle-tested where it counts.",
  },
  {
    title: "0c4d17…fb6e",
    sealed: true,
    cipher: [
      "0c4d 17fd 8e9f 69ed 2b58 0be0 dc4b 1c59 ecff",
      "3a98 cf24 932e e7b6 fbb3 6c13 a058 dc35 17b4",
      "c583 45e3 9a99 e0b8 f955 8826 0be0 2c75 af94",
      "71ed c57e cc44 926c b7fc e17a c64b a2ea cb82",
    ],
  },
  {
    title: "Pixel Forecast",
    status: "concept",
    tags: ["Canvas", "weather API", "pixel art"],
    blurb:
      "A weather app with no numbers. A tiny animated pixel city that rains, snows, fogs and glows with the real forecast, down to the hour. You just look out the window.",
  },
  {
    title: "SquirrelyMonz",
    year: "2023",
    status: "archived",
    tags: ["Solidity", "ERC-721", "Hardhat", "ethers", "MetaMask"],
    blurb:
      "An NFT collection with its own on-chain mint, end to end. Hardened ERC-721 contract, per-wallet limits, reentrancy guards, and a React mint site wired straight into MetaMask. Shipped, audited by use, still standing.",
  },
];
