import React, { createContext, useContext, useEffect, useState } from "react";

const Ctx = createContext({ path: "/", navigate: () => {} });

export function Router({ children }) {
  const [path, setPath] = useState(() => window.location.pathname);
  useEffect(() => {
    const onPop = () => setPath(window.location.pathname);
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const navigate = (to) => {
    if (to !== window.location.pathname) {
      window.history.pushState({}, "", to);
      setPath(to);
    }
    document.querySelector(".page")?.scrollTo?.(0, 0);
  };
  return <Ctx.Provider value={{ path, navigate }}>{children}</Ctx.Provider>;
}

export const useRoute = () => useContext(Ctx);

export function Link({ to, className = "", children, onClick }) {
  const { path, navigate } = useRoute();
  const active = path === to;
  return (
    <a
      href={to}
      className={`${className} ${active ? "active" : ""}`.trim()}
      aria-current={active ? "page" : undefined}
      onClick={(e) => {
        if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
        e.preventDefault();
        onClick?.(e);
        navigate(to);
      }}
    >
      {children}
    </a>
  );
}
