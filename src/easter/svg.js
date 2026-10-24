/* Pointer event → SVG user-space coordinates, honouring the viewBox's
   letterboxing (preserveAspectRatio). Falls back to a plain stretch. */
export function svgPoint(svg, e) {
  const ctm = svg.getScreenCTM?.();
  if (ctm && typeof DOMPoint !== "undefined") {
    const p = new DOMPoint(e.clientX, e.clientY).matrixTransform(ctm.inverse());
    return { x: p.x, y: p.y };
  }
  const r = svg.getBoundingClientRect();
  const [, , w, h] = (svg.getAttribute("viewBox") || "0 0 300 100").split(/\s+/).map(Number);
  return { x: ((e.clientX - r.left) / r.width) * w, y: ((e.clientY - r.top) / r.height) * h };
}
