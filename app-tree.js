/* ============================================================================
   The checkergame tree.  Lays out the binary tree of states left→right
   (root at left, leaves at right), colours the two branches, and highlights
   the node currently displayed plus the path taken to reach it.
   ============================================================================ */

const TREE = (() => {
  const svg = document.getElementById('tree-svg');

  // ---- compute a tidy layout ----
  // Depth = move index (0..MOVE_COUNT). We place each node at x = depth*colW.
  // y is assigned by an in-order-ish sweep so children fan out around parents.
  let layout = null;

  function computeLayout(){
    const colW = 118, rowH = 62, padX = 26, padY = 26;
    const pos = {};                 // stateId -> {x,y, branch}
    let nextLeafY = 0;

    // assign branch tag to each node by walking from root
    function assignBranch(sid, branch){
      const nd = NODES[sid];
      pos[sid] = pos[sid] || {};
      pos[sid].branch = branch;
      (nd.children||[]).forEach(ch => {
        let b = branch;
        if (nd.children.length === 2){ b = branchOfChoice(ch.choice); }
        assignBranch(ch.child, b);
      });
    }
    assignBranch(GAME.root, null);

    // y by recursive layout: leaf gets next slot; internal = mean of children
    function place(sid){
      const nd = NODES[sid];
      const x = padX + nd.move * colW;
      if (!nd.children || nd.children.length === 0){
        const y = padY + nextLeafY * rowH; nextLeafY++;
        pos[sid].x = x; pos[sid].y = y;
        return y;
      }
      const ys = nd.children.map(ch => place(ch.child));
      const y = ys.reduce((a,b)=>a+b,0)/ys.length;
      pos[sid].x = x; pos[sid].y = y;
      return y;
    }
    place(GAME.root);

    const maxX = Math.max(...Object.values(pos).map(p=>p.x)) + colW*0.7 + padX;
    const maxY = padY + Math.max(1,nextLeafY) * rowH;
    layout = { pos, colW, rowH, padX, padY, W: maxX, H: maxY };
  }

  function build(){ computeLayout(); }

  function draw(){
    if (!layout) computeLayout();
    const { pos, W, H } = layout;
    svg.setAttribute('viewBox', `0 0 ${W} ${H}`);
    svg.setAttribute('width', Math.max(W, 640));
    svg.setAttribute('height', H);
    svg.innerHTML='';

    const pathSet = new Set(state.path);
    const curId = state.path[state.pos];

    // ---- edges ----
    const eLayer = g();
    for (const nd of NODES){
      const from = pos[nd.id]; if(!from) continue;
      (nd.children||[]).forEach(ch => {
        const to = pos[ch.child];
        const childBranch = pos[ch.child].branch;
        const col = childBranch === 'A' ? COL.A : childBranch === 'B' ? COL.B : COL.muted;
        const onPath = pathSet.has(nd.id) && pathSet.has(ch.child);
        const p = document.createElementNS(svgNS,'path');
        const c1x = from.x + (to.x-from.x)*0.5;
        p.setAttribute('d', `M ${from.x+22} ${from.y} C ${c1x} ${from.y}, ${c1x} ${to.y}, ${to.x-22} ${to.y}`);
        p.setAttribute('fill','none');
        p.setAttribute('stroke', col);
        p.setAttribute('stroke-width', onPath ? 2.6 : 1.4);
        p.setAttribute('opacity', onPath ? 0.95 : 0.32);
        eLayer.appendChild(p);
        // choice label at a real fork
        if (nd.children.length === 2){
          const midx=(from.x+to.x)/2, midy=(from.y+to.y)/2;
          const t=document.createElementNS(svgNS,'text');
          t.setAttribute('x',midx-2);t.setAttribute('y',midy + (to.y<from.y? -6:14));
          t.setAttribute('fill',col);t.setAttribute('font-size','10.5');
          t.setAttribute('text-anchor','middle');
          t.setAttribute('font-family',"'JetBrains Mono',monospace");
          t.setAttribute('opacity', onPath?1:0.6);
          t.textContent = ch.choice;
          eLayer.appendChild(t);
        }
      });
    }
    svg.appendChild(eLayer);

    // ---- nodes ----
    const nLayer = g();
    for (const nd of NODES){
      const p = pos[nd.id]; if(!p) continue;
      const isLeaf = !nd.children || nd.children.length===0;
      const isBranch = nd.children && nd.children.length===2;
      const onPath = pathSet.has(nd.id);
      const isCur = nd.id === curId;
      const branch = p.branch;
      const bc = branch==='A'?COL.A:branch==='B'?COL.B:COL.muted;

      const node = g();
      const r = isLeaf ? 15 : 11;
      const c = document.createElementNS(svgNS,'circle');
      c.setAttribute('cx',p.x);c.setAttribute('cy',p.y);c.setAttribute('r',r);
      c.setAttribute('fill', isCur ? COL.amber : (onPath ? shade(bc,0.22) : 'rgba(255,255,255,0.02)'));
      c.setAttribute('stroke', isCur ? COL.amber : (isLeaf ? bc : (onPath?bc:COL.hair)));
      c.setAttribute('stroke-width', isCur ? 3 : (isLeaf?2.2:1.6));
      node.appendChild(c);

      if (isBranch){
        // fork glyph
        const t=document.createElementNS(svgNS,'text');
        t.setAttribute('x',p.x);t.setAttribute('y',p.y+3.5);t.setAttribute('text-anchor','middle');
        t.setAttribute('font-size','11');t.setAttribute('fill', isCur?'#1a1206':COL.chalkDim);
        t.setAttribute('font-family',"'JetBrains Mono',monospace");
        t.textContent='⋔'; node.appendChild(t);
      }
      if (isLeaf){
        // partition mini-diagram inside/next to the leaf
        const t=document.createElementNS(svgNS,'text');
        t.setAttribute('x',p.x);t.setAttribute('y',p.y+3.5);t.setAttribute('text-anchor','middle');
        t.setAttribute('font-size','9');t.setAttribute('fill', isCur?'#1a1206':'#fff');
        t.setAttribute('font-family',"'JetBrains Mono',monospace");
        t.textContent='{'+nd.output.join(',')+'}'; node.appendChild(t);
        // partition label below
        const lab=document.createElementNS(svgNS,'text');
        lab.setAttribute('x',p.x);lab.setAttribute('y',p.y+r+15);lab.setAttribute('text-anchor','middle');
        lab.setAttribute('font-size','10.5');lab.setAttribute('fill',bc);
        lab.setAttribute('font-family',"'JetBrains Mono',monospace");
        lab.textContent='λ=('+nd.partition.filter(x=>x>0).join(',')+')';
        node.appendChild(lab);
        const desc=document.createElementNS(svgNS,'text');
        desc.setAttribute('x',p.x);desc.setAttribute('y',p.y+r+29);desc.setAttribute('text-anchor','middle');
        desc.setAttribute('font-size','9.5');desc.setAttribute('fill',COL.chalkDim);
        desc.setAttribute('font-family',"'JetBrains Mono',monospace");
        desc.textContent = nd.id===10 ? 'through a point' : 'in a plane';
        node.appendChild(desc);
      } else if (!isBranch){
        // move number tiny label
        const t=document.createElementNS(svgNS,'text');
        t.setAttribute('x',p.x);t.setAttribute('y',p.y+3);t.setAttribute('text-anchor','middle');
        t.setAttribute('font-size','9');t.setAttribute('fill', isCur?'#1a1206':COL.muted);
        t.setAttribute('font-family',"'JetBrains Mono',monospace");
        t.textContent=String(nd.move); node.appendChild(t);
      }

      // clickable if the node is on a resolvable path from current choices
      c.style.cursor='pointer';
      node.addEventListener('click', ()=> jumpToStateInTree(nd.id));
      nLayer.appendChild(node);
    }
    svg.appendChild(nLayer);

    // root label
    const rp = pos[GAME.root];
    const rl=document.createElementNS(svgNS,'text');
    rl.setAttribute('x',rp.x);rl.setAttribute('y',rp.y-18);rl.setAttribute('text-anchor','middle');
    rl.setAttribute('font-size','10');rl.setAttribute('fill',COL.chalkDim);
    rl.setAttribute('font-family',"'JetBrains Mono',monospace");
    rl.textContent='root'; svg.appendChild(rl);
  }

  function g(){ return document.createElementNS(svgNS,'g'); }
  function shade(hex, a){
    // hex → rgba with alpha
    const h=hex.replace('#',''); const r=parseInt(h.substr(0,2),16),
      gg=parseInt(h.substr(2,2),16), b=parseInt(h.substr(4,2),16);
    return `rgba(${r},${gg},${b},${a})`;
  }

  return { build, draw };
})();

/* Clicking a tree node: navigate there if it's reachable under current choices,
   otherwise set the choices needed to reach it, then navigate. */
function jumpToStateInTree(targetId){
  stopPlay();
  // find path root→target
  const parent = {}; const choiceInto = {};
  (function dfs(sid){
    (NODES[sid].children||[]).forEach(ch=>{ parent[ch.child]=sid; choiceInto[ch.child]=ch.choice; dfs(ch.child); });
  })(GAME.root);
  const chain=[]; let s=targetId;
  while(s!==undefined){ chain.unshift(s); s=parent[s]; }
  // set choices along the chain at any real fork
  for(let i=0;i<chain.length-1;i++){
    const nd=NODES[chain[i]];
    if(nd.children && nd.children.length===2){
      state.choiceAt[nd.id]=choiceInto[chain[i+1]];
    }
  }
  // reset path to root then extend along choices
  state.pos=0; state.path=[GAME.root]; extendPath();
  // set pos to targetId's index in path
  const idx=state.path.indexOf(targetId);
  state.pos = idx>=0 ? idx : state.path.length-1;
  render();
}
