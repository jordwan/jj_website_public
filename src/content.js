/* Edit this file to change what the About and Portfolio pages say. */

export const about = {
  name: "Jordan",
  handle: "jordwan",
  location: "Kelowna, BC",
  tagline: "web developer · ethereum & xrp ledger builder · pixel-art enjoyer",
  intro: [
    "I build things for the web, mostly in React, and I like the parts where the browser does more than it was supposed to. This site is a small example: the homepage looks like a title and a nav bar, but there is a working blockchain hiding behind it.",
    "Blockchain is the other half of what I do. I write and ship on Ethereum, from Solidity contracts and the tooling around them to the front ends that talk to wallets, and I build on the XRP Ledger, where payments, trust lines and tokens are first-class and transactions settle in seconds. The interesting problems are the ones where cryptography, UI and real people meet.",
    "Based in the Okanagan. Happiest with a mechanical keyboard, a long trail, and a problem that looks simple and isn't.",
  ],
  stack: [
    { group: "frontend", items: ["React", "Vite", "TypeScript", "CSS", "SVG"] },
    { group: "backend", items: ["Node", "serverless", "Redis", "Postgres"] },
    { group: "ethereum", items: ["Solidity", "Hardhat", "ethers", "OpenZeppelin", "wagmi"] },
    { group: "xrp ledger", items: ["xrpl.js", "payments", "trust lines", "issued tokens", "hooks"] },
    { group: "tools", items: ["Git", "Vercel", "Figma", "a lot of terminal"] },
  ],
  principles: [
    "Ship the small version first.",
    "Make the fast path the default path.",
    "Hide something delightful where only the curious will find it.",
    "Leave the codebase cleaner than the git log you found it in.",
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
];
