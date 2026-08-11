/* Interactive diamond mesh for the hero. Self-contained — no-ops if the canvas is missing. */
(function () {
  "use strict";

  const canvas = document.getElementById("hero-mesh");
  const hero = document.getElementById("top");
  if (!canvas || !hero) return;

  const ctx = canvas.getContext("2d", { alpha: true });
  if (!ctx) return;

  const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
  let reduceMotion = motionQuery.matches;

  let dpr = 1;
  let width = 0;
  let height = 0;
  let nodes = [];
  let edges = [];
  let diamond = null;
  let rafId = 0;
  let running = false;
  let heroVisible = true;
  const pointer = { x: 0, y: 0, active: false, tx: 0, ty: 0 };
  let lastFrame = 0;

  // Gem-cut diamond: flat table top, girdle at cy, pointed pavilion below
  function inGemDiamond(x, y, cx, cy, halfW, crownH, pavilionH, tableHalfW) {
    const dy = y - cy;
    if (dy < -crownH || dy > pavilionH) return false;
    const dx = Math.abs(x - cx);
    if (dy <= 0) {
      // Crown: trapezoid from girdle width → table width
      return dx <= halfW - (halfW - tableHalfW) * (-dy / crownH);
    } else {
      // Pavilion: triangle to a point
      return dx <= halfW * (1 - dy / pavilionH);
    }
  }

  function rebuild() {
    const rect = hero.getBoundingClientRect();
    width = Math.max(1, Math.floor(rect.width));
    height = Math.max(1, Math.floor(rect.height));
    dpr = Math.min(window.devicePixelRatio || 1, 2);

    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = width + "px";
    canvas.style.height = height + "px";
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

    const isNarrow = width < 720;
    const spacing = Math.max(52, Math.min(82, width / 13));
    const cx = isNarrow ? width * 0.5 : width * 0.78;
    const cy = height * 0.38;
    const halfW = Math.min(width * (isNarrow ? 0.44 : 0.30), height * 0.28);
    const tableHalfW = halfW * 0.55;
    const crownH = halfW * 0.45;
    const pavilionH = halfW * 1.05;

    nodes = [];
    edges = [];
    diamond = { cx, cy, halfW, crownH, pavilionH, tableHalfW };

    let row = 0;
    for (let y = -spacing; y <= height + spacing; y += spacing * 0.87) {
      const xOff = (row % 2) * (spacing * 0.5);
      for (let x = -spacing + xOff; x <= width + spacing; x += spacing) {
        const inside = inGemDiamond(x, y, cx, cy, halfW, crownH, pavilionH, tableHalfW);
        const rim = !inside && inGemDiamond(x, y, cx, cy, halfW * 1.06, crownH * 1.06, pavilionH * 1.06, tableHalfW * 1.06);

        if (!inside && !rim) continue;

        let hash = Math.abs(Math.sin(x * 12.9898 + y * 78.233) * 43758.5453);
        hash = hash - Math.floor(hash);

        if (rim && hash > 0.5) continue;

        const layer = inside ? 1 : 0.35;
        nodes.push({
          bx: x,
          by: y,
          x,
          y,
          phase: hash * Math.PI * 2,
          speed: 0.5 + hash * 1.0,
          amp: (inside ? 13 : 6) * (0.75 + (1 - hash) * 0.5),
          layer,
          r: inside ? 1.2 + hash * 0.7 : 0.8 + hash * 0.3
        });
      }
      row += 1;
    }

    const maxDist = spacing * 1.2;
    const maxDistSq = maxDist * maxDist;
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const dx = nodes[i].bx - nodes[j].bx;
        const dy = nodes[i].by - nodes[j].by;
        const d2 = dx * dx + dy * dy;
        if (d2 > maxDistSq || d2 < 1) continue;
        edges.push({
          a: i,
          b: j,
          strength: (nodes[i].layer + nodes[j].layer) * 0.5
        });
      }
    }
  }

  function drawDiamondShell(t, intensity) {
    if (!diamond) return;
    const d = diamond;
    const pulse = 0.9 + 0.1 * Math.sin((t || 0) * 0.8);

    // Gem-cut outline: flat table → girdle → pointed pavilion
    ctx.beginPath();
    ctx.moveTo(d.cx - d.tableHalfW, d.cy - d.crownH); // table left
    ctx.lineTo(d.cx + d.tableHalfW, d.cy - d.crownH); // table right
    ctx.lineTo(d.cx + d.halfW, d.cy);                   // girdle right
    ctx.lineTo(d.cx, d.cy + d.pavilionH);               // bottom point
    ctx.lineTo(d.cx - d.halfW, d.cy);                   // girdle left
    ctx.closePath();

    const fillRadius = Math.max(d.halfW, d.crownH + d.pavilionH) * 0.7;
    const fill = ctx.createRadialGradient(d.cx, d.cy + d.pavilionH * 0.2, 0, d.cx, d.cy, fillRadius);
    fill.addColorStop(0, "rgba(74, 159, 196, " + (0.10 * intensity * pulse) + ")");
    fill.addColorStop(0.65, "rgba(74, 159, 196, " + (0.03 * intensity) + ")");
    fill.addColorStop(1, "rgba(74, 159, 196, 0)");
    ctx.fillStyle = fill;
    ctx.fill();

    ctx.strokeStyle = "rgba(120, 200, 230, " + (0.20 * intensity) + ")";
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  function drawStatic() {
    ctx.clearRect(0, 0, width, height);
    drawDiamondShell(0, 1);

    for (let e = 0; e < edges.length; e++) {
      const edge = edges[e];
      const na = nodes[edge.a];
      const nb = nodes[edge.b];
      const alpha = 0.12 + edge.strength * 0.22;
      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = "rgba(120, 190, 220, " + alpha + ")";
      ctx.lineWidth = 1;
      ctx.stroke();
    }

    for (let n = 0; n < nodes.length; n++) {
      const node = nodes[n];
      const a = 0.25 + node.layer * 0.45;
      ctx.beginPath();
      ctx.arc(node.x, node.y, node.r, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(210, 235, 248, " + a + ")";
      ctx.fill();
    }
  }

  function frame(now) {
    if (!running) return;
    rafId = requestAnimationFrame(frame);

    if (now - lastFrame < 16) return;
    lastFrame = now;

    const t = now * 0.001;
    const pActive = pointer.active && !reduceMotion;

    // Smooth pointer follow
    const ease = pActive ? 0.22 : 0.08;
    pointer.tx += (pointer.x - pointer.tx) * ease;
    pointer.ty += (pointer.y - pointer.ty) * ease;
    const sx = pointer.tx;
    const sy = pointer.ty;

    const influence = Math.min(width, height) * 0.42;
    const influenceSq = influence * influence;

    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      let ox = Math.sin(t * node.speed + node.phase) * node.amp;
      let oy = Math.cos(t * node.speed * 0.85 + node.phase * 1.1) * node.amp;

      if (pActive) {
        const dx = sx - node.bx;
        const dy = sy - node.by;
        const d2 = dx * dx + dy * dy;
        if (d2 < influenceSq && d2 > 0.5) {
          const dist = Math.sqrt(d2);
          let f = 1 - dist / influence;
          f = f * f;
          // Strong magnetic pull + swirl so motion is obvious
          ox += dx * f * 0.42;
          oy += dy * f * 0.42;
          ox += -dy * f * 0.12;
          oy += dx * f * 0.12;
        }
      }

      node.x = node.bx + ox;
      node.y = node.by + oy;
    }

    ctx.clearRect(0, 0, width, height);
    drawDiamondShell(t, 1);

    if (pActive) {
      const glow = ctx.createRadialGradient(sx, sy, 0, sx, sy, influence);
      glow.addColorStop(0, "rgba(120, 210, 240, 0.10)");
      glow.addColorStop(0.5, "rgba(74, 159, 196, 0.04)");
      glow.addColorStop(1, "rgba(74, 159, 196, 0)");
      ctx.fillStyle = glow;
      ctx.fillRect(0, 0, width, height);
    }

    for (let e = 0; e < edges.length; e++) {
      const edge = edges[e];
      const na = nodes[edge.a];
      const nb = nodes[edge.b];
      const mx = (na.x + nb.x) * 0.5;
      const my = (na.y + nb.y) * 0.5;
      let alpha = 0.07 + edge.strength * 0.16;

      if (pActive) {
        const pdx = sx - mx;
        const pdy = sy - my;
        const pd = Math.sqrt(pdx * pdx + pdy * pdy);
        if (pd < influence) {
          alpha += (1 - pd / influence) * 0.5;
        }
      }

      alpha *= 0.88 + 0.12 * Math.sin(t * 1.4 + edge.a * 0.12);
      alpha = Math.min(alpha, 0.82);

      ctx.beginPath();
      ctx.moveTo(na.x, na.y);
      ctx.lineTo(nb.x, nb.y);
      ctx.strokeStyle = "rgba(150, 215, 240, " + alpha + ")";
      ctx.lineWidth = alpha > 0.35 ? 1.0 : 0.7;
      ctx.stroke();
    }

    for (let n = 0; n < nodes.length; n++) {
      const nd = nodes[n];
      let na2 = 0.22 + nd.layer * 0.38;
      let radius = nd.r;

      if (pActive) {
        const ndx = sx - nd.x;
        const ndy = sy - nd.y;
        const ndd = Math.sqrt(ndx * ndx + ndy * ndy);
        if (ndd < influence) {
          const boost = 1 - ndd / influence;
          na2 = Math.min(1, na2 + boost * 0.65);
          radius += boost * 2.0;
        }
      }

      ctx.beginPath();
      ctx.arc(nd.x, nd.y, radius, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(220, 240, 250, " + na2 + ")";
      ctx.fill();

      // Hot core near cursor
      if (pActive && na2 > 0.7) {
        ctx.beginPath();
        ctx.arc(nd.x, nd.y, radius * 0.45, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(255, 255, 255, " + ((na2 - 0.7) * 1.2) + ")";
        ctx.fill();
      }
    }
  }

  function start() {
    if (running) return;
    running = true;
    lastFrame = 0;
    rafId = requestAnimationFrame(frame);
  }

  function stop() {
    running = false;
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  }

  function setPointerFromEvent(event) {
    const rect = hero.getBoundingClientRect();
    let clientX;
    let clientY;

    if (event.touches && event.touches.length) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.changedTouches && event.changedTouches.length) {
      clientX = event.changedTouches[0].clientX;
      clientY = event.changedTouches[0].clientY;
    } else {
      clientX = event.clientX;
      clientY = event.clientY;
    }

    // Track anywhere over the hero box (including empty right side)
    const over =
      clientX >= rect.left &&
      clientX <= rect.right &&
      clientY >= rect.top &&
      clientY <= rect.bottom;

    if (over) {
      pointer.x = clientX - rect.left;
      pointer.y = clientY - rect.top;
      pointer.active = true;
    } else {
      pointer.active = false;
    }
  }

  function onVisibility() {
    if (document.hidden) {
      stop();
    } else if (heroVisible) {
      start();
    }
  }

  function boot() {
    rebuild();
    if (diamond) {
      pointer.x = pointer.tx = diamond.cx;
      pointer.y = pointer.ty = diamond.cy;
    }
    start();
  }

  boot();

  // Always track pointer — reduce-motion gets static hover glow, animated mode gets full effect
  window.addEventListener("pointermove", setPointerFromEvent, { passive: true });
  window.addEventListener("pointerdown", setPointerFromEvent, { passive: true });
  window.addEventListener("touchstart", setPointerFromEvent, { passive: true });
  window.addEventListener("touchmove", setPointerFromEvent, { passive: true });
  window.addEventListener("touchend", () => {
    pointer.active = false;
  }, { passive: true });

  document.addEventListener("visibilitychange", onVisibility);

  // Pause when the hero scrolls out of view
  if ("IntersectionObserver" in window) {
    const heroObserver = new IntersectionObserver((entries) => {
      heroVisible = entries[0].isIntersecting;
      if (heroVisible && !document.hidden) {
        start();
      } else {
        stop();
      }
    }, { threshold: 0 });
    heroObserver.observe(hero);
  }

  // If the user toggles OS reduce-motion, reconfigure
  function onMotionChange(e) {
    reduceMotion = e.matches;
    if (reduceMotion) {
      // Reset nodes to base positions; loop keeps running but skips idle drift
      for (let i = 0; i < nodes.length; i++) {
        nodes[i].x = nodes[i].bx;
        nodes[i].y = nodes[i].by;
      }
      pointer.active = false;
    } else if (!running) {
      start();
    }
  }
  if (motionQuery.addEventListener) {
    motionQuery.addEventListener("change", onMotionChange);
  } else if (motionQuery.addListener) {
    motionQuery.addListener(onMotionChange);
  }

  let resizeTimer = 0;
  function onResize() {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
      const wasActive = pointer.active;
      const px = pointer.x;
      const py = pointer.y;
      rebuild();
      if (wasActive) {
        pointer.x = Math.min(width, Math.max(0, px));
        pointer.y = Math.min(height, Math.max(0, py));
      }
      if (!running) start();
    }, 100);
  }

  window.addEventListener("resize", onResize, { passive: true });
  if (typeof ResizeObserver !== "undefined") {
    new ResizeObserver(onResize).observe(hero);
  }
})();