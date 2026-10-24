import { useEffect, useRef, useState } from "react";

export const EMAIL = "info@jordwan.com";
export const MAILTO = `mailto:${EMAIL}`;

/* Open the mail client without navigating the page (desktop browsers hand
   the mailto: to the OS handler and the tab stays put). */
function openMailInBackground() {
  const f = document.createElement("iframe");
  f.style.display = "none";
  f.src = MAILTO;
  document.body.appendChild(f);
  setTimeout(() => f.remove(), 4000);
}

/* Returns { hint, onEmail }. Desktop: mail opens in the background.
   Touch: first tap copies the address and arms a second tap that opens mail,
   so nobody is pulled out of the site by accident. */
export function useEmail(onActivate) {
  const [hint, setHint] = useState("");
  const armed = useRef(false);
  const timer = useRef(null);
  useEffect(() => () => clearTimeout(timer.current), []);

  const onEmail = async (e) => {
    e.preventDefault();
    onActivate?.();
    const touch = window.matchMedia("(pointer: coarse)").matches;
    if (!touch) {
      openMailInBackground();
      return;
    }
    if (armed.current) {
      armed.current = false;
      setHint("");
      window.location.href = MAILTO;
      return;
    }
    try {
      await navigator.clipboard.writeText(EMAIL);
      setHint("copied · tap again to open mail");
    } catch {
      setHint("tap again to open mail");
    }
    armed.current = true;
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      armed.current = false;
      setHint("");
    }, 6000);
  };

  return { hint, onEmail };
}
