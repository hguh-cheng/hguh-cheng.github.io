/* ============================================================================
   Checkerboard renderer.  Draws the n×n board, the black checkers (two flags)
   and white checkers (the k-plane), highlights the critical row & diagonal,
   and animates checker motion between consecutive states.
   ============================================================================ */

const BOARD = (() => {
  const svg = document.getElementById('board-svg');
  const VB = 380;                 // viewBox size
  const PAD = 30;                 // room for row/col guides
  const G = VB - PAD * 2;         // grid pixel size
  const cell = G / N;

  // pixel centre of matrix cell (r,c), 1-indexed (row from top, col from left)
  function cx(c){ return PAD + (c - 0.5) * cell; }
  function cy(r){ return PAD + (r - 0.5) * cell; }

  // persistent checker elements keyed by identity so we can tween them
  // black checkers keyed by column index of the *initial* config? Rather, we key by a
  // stable id: black checkers keep identity across moves by matching nearest previous.
  let prevBlack = null, prevWhite = null;
  const blackEls = new Map();     // id -> <g>
  const whiteEls = new Map();

  function build(){
    svg.innerHTML = '';

    // ambient board face (paper) with subtle inset
    const face = rect(PAD - 6, PAD - 6, G + 12, G + 12, 8);
    face.setAttribute('fill', COL.paper);
    face.setAttribute('opacity', '0.045');
    face.setAttribute('stroke', COL.hair);
    svg.appendChild(face);

    // criticality highlight layers (row band + diagonal cells) — drawn under grid
    const hl = group('crit-hl'); svg.appendChild(hl);

    // grid
    const grid = group('grid');
    for (let i = 0; i <= N; i++){
      const p = PAD + i * cell;
      grid.appendChild(line(PAD, p, PAD + G, p, COL.paperLine, 1, 0.28));
      grid.appendChild(line(p, PAD, p, PAD + G, COL.paperLine, 1, 0.28));
    }
    svg.appendChild(grid);

    // anti-diagonal guide (the transverse "spine"): faint
    // row & column index guides
    const guides = group('guides');
    for (let i = 1; i <= N; i++){
      guides.appendChild(txt(PAD - 13, cy(i) + 3, String(i), 'cell-coord', 'end'));
      guides.appendChild(txt(cx(i), PAD - 9, String(i), 'cell-coord', 'middle'));
    }
    // flag labels: right column = M (moving), bottom row = F (fixed)
    guides.appendChild(txt(PAD + G + 15, PAD + G/2, 'M', '', 'middle', COL.chalkDim, 12, 'italic'));
    guides.appendChild(txt(PAD + G/2, PAD + G + 20, 'F', '', 'middle', COL.chalkDim, 12, 'italic'));
    svg.appendChild(guides);

    // layers for checkers
    svg.appendChild(group('layer-black'));
    svg.appendChild(group('layer-white'));

    prevBlack = prevWhite = null;
    blackEls.clear(); whiteEls.clear();
  }

  // Match checkers between states by nearest position (stable identity for tween)
  function matchIds(prev, cur){
    // returns array parallel to cur: each cur[i] gets id = index in prev of nearest unused
    if (!prev){ return cur.map((_, i) => i); }
    const used = new Set();
    return cur.map(pt => {
      let best = -1, bestD = 1e9;
      prev.forEach((pp, j) => {
        if (used.has(j)) return;
        const d = Math.abs(pp[0]-pt[0]) + Math.abs(pp[1]-pt[1]);
        if (d < bestD){ bestD = d; best = j; }
      });
      used.add(best);
      return best;
    });
  }

  function draw(node, opts = {}){
    const animate = opts.animate !== false && !reducedMotion();
    const dur = 460;

    // ---- criticality highlight ----
    const hl = svg.querySelector('#crit-hl');
    hl.innerHTML = '';
    if (node.move < MOVE_COUNT && typeof node.critRow === 'number'){
      // critical row band
      const band = rect(PAD, PAD + (node.critRow - 1) * cell, G, cell, 0);
      band.setAttribute('fill', COL.amber); band.setAttribute('opacity', '0.10');
      hl.appendChild(band);
      // critical diagonal cells
      (node.critDiag || []).forEach(([r,c]) => {
        const d = rect(PAD + (c-1)*cell, PAD + (r-1)*cell, cell, cell, 0);
        d.setAttribute('fill', COL.amber); d.setAttribute('opacity', '0.16');
        hl.appendChild(d);
      });
      // outline the descending checker's destination
      if (node.descTo){
        const [r,c] = node.descTo;
        const o = rect(PAD + (c-1)*cell + 2, PAD + (r-1)*cell + 2, cell-4, cell-4, 5);
        o.setAttribute('fill','none'); o.setAttribute('stroke', COL.amberLine);
        o.setAttribute('stroke-width','1.4'); o.setAttribute('stroke-dasharray','3 3');
        hl.appendChild(o);
      }
    }

    // ---- black checkers ----
    const layerB = svg.querySelector('#layer-black');
    const bIds = matchIds(prevBlack, node.black);
    const seenB = new Set();
    node.black.forEach((pt, i) => {
      const id = bIds[i]; seenB.add(id);
      let el = blackEls.get(id);
      const [r,c] = pt;
      if (!el){
        el = mkChecker('black');
        layerB.appendChild(el); blackEls.set(id, el);
        setPos(el, cx(c), cy(r), false);
      } else {
        setPos(el, cx(c), cy(r), animate, dur);
      }
    });
    // remove stale
    for (const [id, el] of blackEls){ if (!seenB.has(id)){ el.remove(); blackEls.delete(id); } }

    // ---- white checkers ----
    const layerW = svg.querySelector('#layer-white');
    const wIds = matchIds(prevWhite, node.whites);
    const seenW = new Set();
    node.whites.forEach((pt, i) => {
      const id = wIds[i]; seenW.add(id);
      let el = whiteEls.get(id);
      const [r,c] = pt;
      // colour white checkers by the active branch (subtle ring tint)
      const br = activeBranch();
      const ring = br === 'A' ? COL.A : br === 'B' ? COL.B : COL.paperInk;
      if (!el){
        el = mkChecker('white', ring);
        layerW.appendChild(el); whiteEls.set(id, el);
        setPos(el, cx(c), cy(r), false);
      } else {
        el.querySelector('circle.ring').setAttribute('stroke', ring);
        setPos(el, cx(c), cy(r), animate, dur);
      }
    });
    for (const [id, el] of whiteEls){ if (!seenW.has(id)){ el.remove(); whiteEls.delete(id); } }

    prevBlack = node.black.map(p => p.slice());
    prevWhite = node.whites.map(p => p.slice());
  }

  // ---- checker glyphs ----
  function mkChecker(kind, ring){
    const g = document.createElementNS(svgNS, 'g');
    g.setAttribute('class', 'checker ' + kind);
    const rad = cell * 0.30;
    if (kind === 'black'){
      const c = circle(0, 0, rad);
      c.setAttribute('fill', COL.paperInk);
      c.setAttribute('stroke', '#000'); c.setAttribute('stroke-width', '1');
      const hi = circle(-rad*0.28, -rad*0.30, rad*0.42);
      hi.setAttribute('fill', '#ffffff'); hi.setAttribute('opacity', '0.10');
      g.appendChild(c); g.appendChild(hi);
    } else {
      const c = circle(0, 0, rad);
      c.setAttribute('class', 'ring');
      c.setAttribute('fill', '#ffffff');
      c.setAttribute('stroke', ring || COL.paperInk); c.setAttribute('stroke-width', '2.1');
      const inner = circle(0, 0, rad*0.42);
      inner.setAttribute('fill', ring || COL.paperInk); inner.setAttribute('opacity', '0.9');
      g.appendChild(c); g.appendChild(inner);
    }
    return g;
  }

  // position helpers (translate a <g>)
  function setPos(el, x, y, animate, dur){
    if (!animate){
      el.setAttribute('transform', `translate(${x} ${y})`);
      el.style.transition = 'none';
      // force reflow so subsequent transitions apply
      void el.getBBox;
      return;
    }
    el.style.transition = `transform ${dur}ms cubic-bezier(.5,.05,.2,1)`;
    // use transform attribute animation via requestAnimationFrame trick:
    requestAnimationFrame(() => {
      el.setAttribute('transform', `translate(${x} ${y})`);
    });
  }

  // primitives
  function rect(x,y,w,h,r){ const e=document.createElementNS(svgNS,'rect');
    e.setAttribute('x',x);e.setAttribute('y',y);e.setAttribute('width',w);e.setAttribute('height',h);
    if(r){e.setAttribute('rx',r);e.setAttribute('ry',r);} return e; }
  function line(x1,y1,x2,y2,st,w,op){ const e=document.createElementNS(svgNS,'line');
    e.setAttribute('x1',x1);e.setAttribute('y1',y1);e.setAttribute('x2',x2);e.setAttribute('y2',y2);
    e.setAttribute('stroke',st);e.setAttribute('stroke-width',w||1); if(op!=null)e.setAttribute('opacity',op); return e; }
  function circle(cx_,cy_,r){ const e=document.createElementNS(svgNS,'circle');
    e.setAttribute('cx',cx_);e.setAttribute('cy',cy_);e.setAttribute('r',r); return e; }
  function txt(x,y,s,cls,anchor,fill,size,style){ const e=document.createElementNS(svgNS,'text');
    e.setAttribute('x',x);e.setAttribute('y',y); if(cls)e.setAttribute('class',cls);
    e.setAttribute('text-anchor',anchor||'start'); if(fill)e.setAttribute('fill',fill);
    if(size)e.setAttribute('font-size',size); if(style)e.setAttribute('font-style',style);
    e.textContent=s; return e; }
  function group(id){ const g=document.createElementNS(svgNS,'g'); if(id)g.setAttribute('id',id); return g; }

  return { build, draw };
})();

function reducedMotion(){
  return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
