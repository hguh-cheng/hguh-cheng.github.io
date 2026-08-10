/* ============================================================================
   ℙ³ flag view.  Draws the fixed flag (point ⊂ line ⊂ plane) and the moving
   flag, projected from 3D to 2D, tweening the moving flag's three control
   points between the paper's seven states.  The element that moves at each
   step (M₃, M₂ or M₁) is highlighted in amber; once M·=F· everything settles.
   Coordinates & incidences in P3 (states.js) are verified geometrically.
   ============================================================================ */

const FLAG = (() => {
  const svg = document.getElementById('flag-svg');
  const W = 520, H = 400;

  /* --- isometric-ish projection of a 3D point to 2D screen --- */
  // camera: rotate around vertical then tilt; simple orthographic.
  const A = 0.62, E = 0.34;           // azimuth, elevation (radians-ish scalars)
  const SCALE = 46;                   // world→px
  const ORIGIN2D = { x: 250, y: 250 }; // where world (0,0,0) lands
  function project(P){
    const [x, y, z] = P;
    // world axes: x → right/back, y → right/front, z → up
    const sx = (x) * Math.cos(A) + (y) * Math.cos(A + 2.3);
    const sy = (x) * Math.sin(A) + (y) * Math.sin(A + 2.3) - z * (1.0 + E);
    return { x: ORIGIN2D.x + sx * SCALE, y: ORIGIN2D.y - sy * SCALE };
  }

  /* --- vector helpers --- */
  const sub = (a,b)=>[a[0]-b[0],a[1]-b[1],a[2]-b[2]];
  const add = (a,b)=>[a[0]+b[0],a[1]+b[1],a[2]+b[2]];
  const mul = (a,s)=>[a[0]*s,a[1]*s,a[2]*s];
  const cross = (a,b)=>[a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0]];
  const norm = a=>Math.hypot(a[0],a[1],a[2]);
  const unit = a=>{ const n=norm(a)||1; return [a[0]/n,a[1]/n,a[2]/n]; };
  const lerp3 = (a,b,t)=>[a[0]+(b[0]-a[0])*t, a[1]+(b[1]-a[1])*t, a[2]+(b[2]-a[2])*t];

  const fixed = GAME_P3_FIXED();
  function GAME_P3_FIXED(){ const f=P3.fixed; return { f1:f.f1, f2:f.f2, f3:f.f3 }; }

  /* Build the tween-able description of the moving flag at a *fractional*
     move index (e.g. 2.4 during animation). We lerp control points p,q,s. */
  function movingAt(fidx){
    const arr = P3.moving;              // 7 states (index 0..6)
    const lo = Math.max(0, Math.min(arr.length-1, Math.floor(fidx)));
    const hi = Math.max(0, Math.min(arr.length-1, Math.ceil(fidx)));
    const t = fidx - lo;
    const a = arr[lo], b = arr[hi];
    return {
      p: lerp3(a.p, b.p, t),
      q: lerp3(a.q, b.q, t),
      s: lerp3(a.s, b.s, t),
    };
  }

  /* --- drawing a plane: we render the portion of the plane inside a world
     bounding box as a filled quad. Plane given by point P0 and two in-plane
     directions; we clip to a disc for a clean look. --- */
  function planePolygon(P0, u, v, radius){
    u = unit(u); v = unit(v);
    // make v orthogonal-ish to u within the plane for a balanced quad
    const pts = [];
    const K = 10;
    for (let i=0;i<K;i++){
      const th = (i/K)*Math.PI*2;
      const p = add(P0, add(mul(u, Math.cos(th)*radius), mul(v, Math.sin(th)*radius)));
      pts.push(project(p));
    }
    return pts;
  }

  /* extend a segment through two points to a nice drawable chord */
  function chord(a, b, ext){
    const d = unit(sub(b,a));
    const mid = mul(add(a,b), 0.5);
    const half = norm(sub(b,a))/2 + (ext||0);
    return [ sub(mid, mul(d, half)), add(mid, mul(d, half)) ];
  }

  let built = false;
  function build(){
    svg.innerHTML='';
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    // static defs: soft grid floor for depth
    const floor = group('floor'); svg.appendChild(floor);
    drawFloor(floor);
    // layers
    svg.appendChild(group('lyr-fixed-plane'));
    svg.appendChild(group('lyr-move-plane'));
    svg.appendChild(group('lyr-cycle'));
    svg.appendChild(group('lyr-fixed'));
    svg.appendChild(group('lyr-move'));
    svg.appendChild(group('lyr-labels'));
    built = true;
  }

  function drawFloor(g){
    // faint ground grid on z=0 to anchor perspective
    const R = 3.6, step = 1.2;
    for (let x=-1.2; x<=R; x+=step){
      const a=project([x,-1.2,0]), b=project([x,R,0]);
      g.appendChild(seg(a,b, COL.hair, 1, 0.5));
    }
    for (let y=-1.2; y<=R; y+=step){
      const a=project([-1.2,y,0]), b=project([R,y,0]);
      g.appendChild(seg(a,b, COL.hair, 1, 0.5));
    }
  }

  /* main draw at fractional move index fidx and integer node (for cycle logic) */
  function draw(fidx, node){
    if (!built) build();
    const mv = movingAt(fidx);
    const activeM = activeMovingElement(fidx);   // 1,2,3, or 0 when settled/none
    const settled = fidx >= MOVE_COUNT - 1e-6;
    const br = activeBranch();
    const branchCol = br === 'A' ? COL.A : br === 'B' ? COL.B : COL.amber;

    // ------- FIXED plane (PF3 = z=0) -------
    const gfp = svg.querySelector('#lyr-fixed-plane'); gfp.innerHTML='';
    {
      const poly = planePolygon([1.4,1.4,0], [1,0,0], [0,1,0], 2.5);
      const pg = polygon(poly);
      pg.setAttribute('fill', COL.chalkDim); pg.setAttribute('opacity','0.06');
      pg.setAttribute('stroke', COL.muted); pg.setAttribute('stroke-opacity','0.35');
      pg.setAttribute('stroke-width','1');
      gfp.appendChild(pg);
    }

    // ------- MOVING plane (PM3) -------
    const gmp = svg.querySelector('#lyr-move-plane'); gmp.innerHTML='';
    {
      const P0 = mv.p;
      const u = sub(mv.q, mv.p);
      const v = sub(mv.s, mv.p);
      const poly = planePolygon(centroid(mv.p,mv.q,mv.s), u, v, 2.1);
      const pg = polygon(poly);
      const active = activeM === 3 && !settled;
      pg.setAttribute('fill', settled ? COL.chalkDim : (active ? COL.amber : branchCol));
      pg.setAttribute('opacity', active ? '0.16' : '0.09');
      pg.setAttribute('stroke', settled ? COL.muted : (active ? COL.amber : branchCol));
      pg.setAttribute('stroke-opacity', active ? '0.7' : '0.4');
      pg.setAttribute('stroke-width', active ? '1.6' : '1');
      if (active) pg.setAttribute('stroke-dasharray','5 4');
      gmp.appendChild(pg);
    }

    // ------- cycle hint: representative lines of the current cycle -------
    drawCycle(node, fidx);

    // ------- FIXED flag: line PF2 (x-axis) + point PF1 -------
    const gf = svg.querySelector('#lyr-fixed'); gf.innerHTML='';
    {
      const [a,b] = chord(fixed.f1, fixed.f2, 0.5);
      gf.appendChild(seg(project(a), project(b), COL.chalkDim, 2.4, 0.9));
      gf.appendChild(mkPoint(project(fixed.f1), COL.chalk, 5.2, true));
    }

    // ------- MOVING flag: line PM2 + point PM1 -------
    const gm = svg.querySelector('#lyr-move'); gm.innerHTML='';
    {
      const lineActive = activeM === 2 && !settled;
      const ptActive = activeM === 1 && !settled;
      const lineCol = settled ? COL.chalk : (lineActive ? COL.amber : branchCol);
      const [a,b] = chord(mv.p, mv.q, 0.5);
      const seln = seg(project(a), project(b), lineCol, lineActive ? 3 : 2.4, lineActive ? 1 : 0.92);
      if (lineActive) seln.setAttribute('stroke-dasharray','6 4');
      gm.appendChild(seln);
      const ptCol = settled ? COL.chalk : (ptActive ? COL.amber : branchCol);
      gm.appendChild(mkPoint(project(mv.p), ptCol, ptActive ? 6 : 5, false));
    }

    // ------- labels -------
    const gl = svg.querySelector('#lyr-labels'); gl.innerHTML='';
    if (!settled){
      label(gl, project(fixed.f1), 'PF₁', COL.chalkDim, 12, -6);
      const fmid = project(mul(add(fixed.f1,fixed.f2),0.5));
      label(gl, {x:fmid.x, y:fmid.y+16}, 'PF₂', COL.chalkDim, 12, 0);
      label(gl, project(mv.p), 'PM₁', activeM===1?COL.amber:branchCol, 12, -6);
      const mmid = project(mul(add(mv.p,mv.q),0.5));
      label(gl, {x:mmid.x-4,y:mmid.y-8}, 'PM₂', activeM===2?COL.amber:branchCol, 12, 0);
    } else {
      const c = project([1.6,0.9,0.15]);
      label(gl, c, 'M· = F·', COL.chalk, 13, 0);
    }
  }

  // which moving element is active at fractional index fidx?
  // moves 0..5 move M[activeM]: [3,2,3,1,2,3]. During a transition floor(fidx)=i is done,
  // the move IN PROGRESS is index ceil(fidx)-1? We treat integer states as resting.
  function activeActiveMap(){ return P3.activeM; } // [3,2,3,1,2,3]
  function activeMovingElement(fidx){
    // highlight the element that is moving into state ceil(fidx) when mid-transition,
    // otherwise (at a rest integer state) highlight the element that JUST moved to reach here.
    const eps = 1e-6;
    if (fidx <= eps) return 0;                       // start, transverse, nothing active
    const arr = P3.activeM;
    const hi = Math.ceil(fidx - eps);                // 1..6 → move index (hi-1)
    const moveIdx = Math.min(arr.length, Math.max(1, hi)) - 1;
    return arr[moveIdx];
  }

  /* Representative sampling of the CURRENT cycle, to hint at the geometry:
     - early (before fork resolves): lines meeting both PM2 and PF2 → a ruled family
     - branch A (through the point): pencil of lines through PF1
     - branch B (in the plane): lines lying in the moving/fixed plane
     This is a schematic hint, not a full variety. */
  function drawCycle(node, fidx){
    const g = svg.querySelector('#lyr-cycle'); g.innerHTML='';
    const br = activeBranch();
    const mv = movingAt(fidx);
    const col = br === 'A' ? COL.A : br === 'B' ? COL.B : COL.amber;
    const op = 0.5;

    const lineFF = chord(fixed.f1, fixed.f2, 0.5); // PF2
    const lineMM = chord(mv.p, mv.q, 0.5);         // PM2

    const drawLine3 = (a,b,c,o,w)=> g.appendChild(seg(project(a),project(b), c, w||1.4, o));

    if (br === 'A'){
      // pencil of lines through PF1 (a few directions), settling look
      const dirs = [[1,0.6,0.5],[1,-0.4,0.7],[0.3,1,0.6],[-0.5,0.7,0.9],[0.8,0.9,0.2]];
      dirs.forEach(d=>{
        const u=unit(d);
        drawLine3(sub(fixed.f1,mul(u,0.2)), add(fixed.f1,mul(u,2.4)), col, 0.34, 1.3);
      });
    } else if (br === 'B'){
      // lines lying in the plane z=0 (fixed plane) passing near the region — a fan in-plane
      const base=[0.2,0.2,0];
      const dirs=[[1,0.15,0],[1,0.6,0],[1,1.1,0],[0.5,1,0],[1.4,1,0]];
      dirs.forEach(d=>{
        const u=unit(d);
        drawLine3(sub(base,mul(u,0.2)), add(base,mul(u,3.0)), col, 0.34, 1.3);
      });
    } else {
      // lines meeting both skew lines PM2 and PF2: sample transversals
      const K=5;
      for(let i=1;i<=K;i++){
        const t=i/(K+1);
        const pOnF = lerp3(lineFF[0], lineFF[1], t);
        const pOnM = lerp3(lineMM[0], lineMM[1], (i%2? t:1-t));
        drawLine3(pOnF, pOnM, col, 0.30, 1.2);
      }
    }
  }

  /* ---- svg primitives ---- */
  function centroid(a,b,c){ return [ (a[0]+b[0]+c[0])/3,(a[1]+b[1]+c[1])/3,(a[2]+b[2]+c[2])/3 ]; }
  function seg(a,b,st,w,op){ const e=document.createElementNS(svgNS,'line');
    e.setAttribute('x1',a.x);e.setAttribute('y1',a.y);e.setAttribute('x2',b.x);e.setAttribute('y2',b.y);
    e.setAttribute('stroke',st);e.setAttribute('stroke-width',w);e.setAttribute('stroke-linecap','round');
    if(op!=null)e.setAttribute('opacity',op); return e; }
  function polygon(pts){ const e=document.createElementNS(svgNS,'polygon');
    e.setAttribute('points', pts.map(p=>`${p.x.toFixed(1)},${p.y.toFixed(1)}`).join(' ')); return e; }
  function mkPoint(p, col, r, ring){ const g=document.createElementNS(svgNS,'g');
    const c=document.createElementNS(svgNS,'circle');
    c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',r);
    c.setAttribute('fill',col);
    if(ring){ const o=document.createElementNS(svgNS,'circle');
      o.setAttribute('cx',p.x);o.setAttribute('cy',p.y);o.setAttribute('r',r+3.5);
      o.setAttribute('fill','none');o.setAttribute('stroke',col);o.setAttribute('stroke-width','1.2');
      o.setAttribute('opacity','0.5'); g.appendChild(o); }
    g.appendChild(c); return g; }
  function label(g, p, s, col, size, dy){ const e=document.createElementNS(svgNS,'text');
    e.setAttribute('x',p.x+8);e.setAttribute('y',p.y+(dy||0));e.setAttribute('fill',col);
    e.setAttribute('font-size',size||12);e.setAttribute('font-family',"'JetBrains Mono',monospace");
    e.textContent=s; g.appendChild(e); return e; }
  function group(id){ const g=document.createElementNS(svgNS,'g'); if(id)g.setAttribute('id',id); return g; }

  return { build, draw };
})();
