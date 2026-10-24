import React, { useEffect, useRef, useState } from "react";
import { sha256, short } from "./hash";
import { TOTAL, PER_LEVEL } from "./ChainExperience";
import { loadRemnants } from "./remnants";
import "./Easter.css";

const HELP = "help · whoami · chain · remnants · archive · mine · hash <text> · clear · exit";

export default function Terminal({ chain }) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [lines, setLines] = useState([{ text: "type help", cls: "" }]);
  const ref = useRef(null);

  useEffect(() => {
    const onKey = (e) => {
      const tag = document.activeElement?.tagName;
      const typing = tag === "INPUT" || tag === "TEXTAREA";
      if (!open && !typing && (e.key === "`" || e.key === "~")) {
        e.preventDefault();
        setOpen(true);
      } else if (open && e.key === "Escape") {
        e.preventDefault();
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);

  const print = (text, cls = "") =>
    setLines((l) => [...l, { text, cls }].slice(-8));

  async function run(raw) {
    const [cmd, ...rest] = raw.trim().split(/\s+/);
    const arg = rest.join(" ");
    print(`> ${raw}`, "cmd");
    switch (cmd) {
      case "help":
        print(HELP);
        break;
      case "whoami":
        print("jordwan · south okanagan, bc · web development / blockchain");
        break;
      case "chain": {
        const n = chain.blocks.length;
        if (!n) print("no blocks yet. try: mine");
        else {
          print(`${n} / ${TOTAL} blocks · level ${Math.min(2, Math.floor(n / PER_LEVEL) + 1)} · tip ${short(chain.blocks[n - 1].hash)}`, "accent");
          if (n >= TOTAL) print("chain complete.");
        }
        break;
      }
      case "remnants": {
        const r = await loadRemnants();
        print(`${r.count} visitor${r.count === 1 ? "" : "s"} anchored${r.online ? "" : " (local echo)"}`, "accent");
        r.remnants.slice(0, 3).forEach((x) => print(`#${x.n} · ${x.note || "—"} · ${short(x.tip)}`));
        break;
      }
      case "archive":
        window.history.pushState({}, "", "/archive");
        window.dispatchEvent(new PopStateEvent("popstate"));
        setOpen(false);
        break;
      case "mine":
        chain.setOpen(true);
        setOpen(false);
        break;
      case "hash":
        if (!arg) print("usage: hash <text>");
        else print(await sha256(arg), "accent");
        break;
      case "clear":
        setLines([]);
        break;
      case "exit":
        setOpen(false);
        break;
      case "":
        break;
      default:
        print(`command not found: ${cmd}`);
    }
  }

  if (!open) return null;

  return (
    <div className="term" onClick={() => ref.current?.focus()}>
      <div className="term-out">
        {lines.map((l, i) => (
          <div key={i} className={l.cls}>
            {l.text}
          </div>
        ))}
      </div>
      <form
        className="term-in"
        onSubmit={(e) => {
          e.preventDefault();
          const v = input;
          setInput("");
          run(v);
        }}
      >
        <span>&gt;</span>
        <input
          ref={ref}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          spellCheck={false}
          autoComplete="off"
        />
      </form>
    </div>
  );
}
