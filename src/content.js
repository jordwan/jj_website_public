/* Edit this file to change what the About and Portfolio pages say. */

export const about = {
  name: "Jordan",
  handle: "jordwan",
  location: "Kelowna, BC",
  tagline: "systems · ledgers · interfaces",
  intro: [
    "I build software across the whole stack: the interfaces people touch, the services that keep them honest, and the ledgers underneath that make the result verifiable.",
    "Most of the work lives at the edges, where distributed systems, cryptographic protocols and real-time data meet a screen someone actually has to use. Ethereum and the XRP Ledger are home turf. The rest of the toolkit changes with the problem.",
    "Based in the Okanagan. Available for the interesting ones.",
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
      "This site. A quiet landing page with a two-level, twenty-block blockchain hidden behind the title: real hashes, proof of work you hold to mine, a Merkle tree you fold by hand, and traces left by every visitor who anchored before you.",
    href: "/",
  },
  {
    title: "Ledger Lens",
    year: "concept",
    status: "concept",
    tags: ["React", "d3", "JSON-RPC"],
    blurb:
      "A block explorer that treats a chain like a timeline instead of a table. Scrub through blocks, watch the mempool drain, and follow a single address as a thread through the whole thing.",
  },
  {
    title: "Okanagan Pulse",
    year: "concept",
    status: "concept",
    tags: ["Next.js", "maps", "open data"],
    blurb:
      "Live snapshot of the valley: lake temperature, trail conditions, wildfire smoke and ferry waits on one screen, pulled from public feeds and designed to be glanced at, not studied.",
  },
  {
    title: "Mint Kit",
    year: "concept",
    status: "concept",
    tags: ["TypeScript", "wagmi", "components"],
    blurb:
      "Drop-in React components for mint pages: wallet connect, supply meter, quantity picker and transaction toasts, all themeable and all boring in the ways that matter.",
  },
  {
    title: "Pixel Forecast",
    year: "concept",
    status: "concept",
    tags: ["Canvas", "weather API", "pixel art"],
    blurb:
      "A weather widget rendered as a tiny animated pixel city. Rain, snow, neon, fog. The scene changes with the forecast and nobody needs to read a number.",
  },
  {
    title: "SquirrelyMonz",
    year: "2023",
    status: "archived",
    tags: ["Solidity", "ERC-721", "Hardhat", "ethers", "MetaMask"],
    blurb:
      "An NFT collection and its mint site. OpenZeppelin-based ERC-721 contract with per-wallet limits and reentrancy guards, deployed to a testnet, with a React front end that talked to MetaMask.",
  },
  {
    title: "▇▇▇▇▇▇▇ ▇▇",
    year: "sealed",
    status: "sealed",
    sealed: true,
    tags: ["[redacted]", "zero-knowledge", "settlement"],
    cipher: [
      "-----BEGIN SEALED PROJECT-----",
      "eW91IGZvdW5kIHRoZSBzZWFtLiB0aGUgcmVzdCBpcyB1",
      "bmRlciBuZGEgdW50aWwgdGhlIG5leHQgYmxvY2sgc2V0",
      "dGxlcy4gaW5mb0Bqb3Jkd2FuLmNvbSDCtyBzdWJqZWN0",
      "OiAweDAy",
      "-----END SEALED PROJECT-----",
    ],
  },
  {
    title: "0x1f · ▇▇▇▇▇",
    year: "sealed",
    status: "sealed",
    sealed: true,
    tags: ["custody", "[redacted]", "threshold sigs"],
    cipher: [
      "8a34 0af0 a215 9ca5 7fef 04ee 8453 afec 1193",
      "4539 cc7a 8a7a 71aa 83f4 3768 f09a 8659 8c0b",
      "7df6 02a9 aba0 a3b4 5052 a2d4 e554 7829 2386",
      "6696 d909 4b14 b40f 9f83 15df d4a4 15f1 0833",
    ],
  },
  {
    title: "Ξ∴◈ ▇▇▇▇",
    year: "sealed",
    status: "sealed",
    sealed: true,
    tags: ["consensus", "mesh", "[redacted]"],
    cipher: [
      "⟁⟟⟠ ⟊⟐⟑⟒ ⟓⟔⟕⟖⟗ ⟘⟙⟚ ⟛⟜⟝⟞⟟⟠⟡",
      "⟢⟣⟤ ⟥⟦⟧⟨⟩ ⟪⟫⟬⟭ ⟮⟯⟰⟱⟲⟳ ⟴⟵⟶",
      "⟷⟸⟹⟺ ⟻⟼⟽⟾ ⟿⤀⤁⤂⤃ ⤄⤅⤆⤇⤈⤉",
      "key rotates at the next block.",
    ],
  },
];
