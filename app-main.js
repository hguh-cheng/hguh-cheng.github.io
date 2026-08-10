/* ============================================================================
   Integration layer.  Defines render() — the orchestrator that redraws the
   board, the ℙ³ flags and the tree, updates the caption, permutation label,
   move-dots and branch chooser — plus the per-move narrative, the KaTeX
   result strip, and all event wiring.  Loaded last.
   ============================================================================ */
'use strict';

/* ---- self-contained inline math (no external typesetter) ----
   Small vocabulary is enough for this page: Schubert classes, a cup product,
   partitions and jumping-number sets.  Rendered with styled HTML spans. */
const MATHHTML = {
  cycleSet : 'Ω<sub>□</sub>(M) <span class="op">∩</span> Ω<sub>□</sub>(F) <span class="op">⊂</span> <span class="parn">𝔾(1,3)</span>',
  split    : '[cycle] <span class="op">=</span> [Ω<sub>(2)</sub>] <span class="op">+</span> [Ω<sub>(1,1)</sub>]',
  leafPlane: 'λ = (1,1) <span class="op">⟺</span> <span class="set">{2,3}</span>',
  leafPoint: 'λ = (2) <span class="op">⟺</span> <span class="set">{1,4}</span>',
  product  : '[Ω<sub>□</sub>] <span class="op">∪</span> [Ω<sub>□</sub>] <span class="op">=</span> [Ω<sub>(2)</sub>] <span class="op">+</span> [Ω<sub>(1,1)</sub>]',
};
function setMath(el, html){ if (el) el.innerHTML = html ? ('<span class="m">'+html+'</span>') : ''; }

/* ============================================================================
   Per-state narrative, keyed by state id.  Text follows Vakil's Figure 3
   walk-through (§1.5): the two skew lines, the fork at the second
   degeneration, and the two resulting Schubert varieties.
   `math` (optional) is a KaTeX string shown under the prose.
   ============================================================================ */
const CAP = {
  0: { tag:'Setup · transverse',
       body:'We start with two <b>transverse</b> flags M and F. The cycle we set out to resolve is the set of lines of ℙ³ meeting <b>both</b> skew lines PM₂ and PF₂ — the Schubert intersection Ω<sub>□</sub>(M) ∩ Ω<sub>□</sub>(F). On the board the black checkers sit on the anti-diagonal (σ = 4321: fully transverse); the two white checkers encode this locus of lines.',
       math:'cycleSet' },
  1: { tag:'Move 1 · plane PM₃ swings',
       body:'The moving plane PM₃ rotates until it just contains the fixed point PF₁. The cycle does not change — it is still the lines meeting both PM₂ and PF₂. There is no white checker in the critical row, so this move imposes no condition on the k-plane.',
       math:null },
  2: { tag:'Move 2 · the lines meet — cycle splits · ⋔',
       body:'The moving line PM₂ swings until it <b>meets</b> the fixed line PF₂; the two now cross at PF₁. The locus of lines meeting both breaks into <b>two</b> irreducible pieces, each with multiplicity 1. On the board the critical row <em>and</em> the critical diagonal each carry a white checker — the single configuration that offers a genuine choice. Pick a branch below.',
       math:'split' },

  /* branch B — STAY — lines contained in a plane — partition (1,1) — indigo */
  3: { tag:'Branch B · lines in a plane · Move 3',
       body:'The <b>stay</b> option: the lines lying in the plane spanned by PM₂ and PF₂. The moving plane PM₃ swings again, and this condition is restated as “lines contained in PM₃.”',
       math:null },
  4: { tag:'Branch B · Move 4 · point PM₁',
       body:'The moving point PM₁ slides toward the fixed point. The white checkers swap rows to keep the k-plane confined to the plane.',
       math:null },
  5: { tag:'Branch B · Move 5 · line PM₂',
       body:'The moving line PM₂ settles onto the fixed line. The locus is now visibly the lines contained in the fixed plane.',
       math:null },
  6: { tag:'Branch B · resolved · a Schubert variety',
       body:'M and F coincide. The surviving cycle is the Schubert variety of lines <b>contained in a fixed plane</b>. On the board every white checker shares a square with a black one — output {2, 3}.',
       math:'leafPlane' },

  /* branch A — SWAP — lines through a point — partition (2) — crimson */
  7: { tag:'Branch A · lines through a point · Move 3',
       body:'The <b>swap</b> option: the lines through the crossing point PM₂ ∩ PF₂ = PF₁. The moving plane PM₃ swings to contain the fixed line PF₂.',
       math:null },
  8: { tag:'Branch A · Move 4 · point PM₁',
       body:'The moving point PM₁ slides onto the fixed point PF₁ — the very point through which every line of this family passes.',
       math:null },
  9: { tag:'Branch A · Move 5 · line PM₂',
       body:'The moving line PM₂ settles onto the fixed line. The locus is the family of lines through the fixed point.',
       math:null },
  10:{ tag:'Branch A · resolved · a Schubert variety',
       body:'M and F coincide. The surviving cycle is the Schubert variety of lines <b>through a fixed point</b> — output {1, 4}.',
       math:'leafPoint' },
};

/* ============================================================================
   The ℙ³ flag animation.  render() asks the FLAG module to draw at a
   fractional move index; on a step we tween that index so the moving flag
   glides between the paper's seven rest states.
   ============================================================================ */
const flagAnim = { lastMove: null, raf: 0, token: 0 };
function drawFlag(node){
  const target = node.move;
  // animate whenever motion is allowed and the flag actually changed rest-state
  const doTween = !reducedMotion() && flagAnim.lastMove !== null && flagAnim.lastMove !== target;
  if (flagAnim.raf){ cancelAnimationFrame(flagAnim.raf); flagAnim.raf = 0; }

  if (!doTween){
    FLAG.draw(target, node);
    flagAnim.lastMove = target;
    return;
  }
  const from = flagAnim.lastMove, to = target;
  const dur = 460, t0 = performance.now();
  const my = ++flagAnim.token;
  const ease = t => t<0.5 ? 2*t*t : 1-Math.pow(-2*t+2,2)/2;
  const tick = (now)=>{
    if (my !== flagAnim.token) return;         // superseded
    let u = Math.min(1, (now - t0)/dur);
    const fidx = from + (to - from)*ease(u);
    FLAG.draw(fidx, node);
    if (u < 1){ flagAnim.raf = requestAnimationFrame(tick); }
    else { flagAnim.lastMove = to; flagAnim.raf = 0; }
  };
  flagAnim.raf = requestAnimationFrame(tick);
}

/* ============================================================================
   render() — single source of truth for the view.
   ============================================================================ */
function render(){
  const node = curNode();

  /* board permutation label */
  const permEl = document.getElementById('board-perm');
  if (permEl) permEl.textContent = 'σ = ' + GAME.perms[node.move];

  /* the three drawings */
  BOARD.draw(node);
  drawFlag(node);
  TREE.draw();

  /* flag panel meta */
  const fm = document.getElementById('flag-meta');
  if (fm){
    fm.textContent = node.move >= MOVE_COUNT ? 'M· = F· (settled)'
                   : node.move === 0 ? 'transverse'
                   : 'moving M' + P3.activeM[node.move-1] + ' →';
  }

  /* caption */
  const cap = CAP[node.id] || { tag:'', body:'', math:null };
  const stepEl = document.getElementById('cap-step');
  const bodyEl = document.getElementById('cap-body');
  const mathEl = document.getElementById('cap-math');
  if (stepEl){
    const br = activeBranch();
    const brTag = br === 'A' ? ' · <span class="tag" style="border-color:var(--A);color:var(--A)">through a point</span>'
                : br === 'B' ? ' · <span class="tag" style="border-color:var(--B);color:var(--B)">in a plane</span>'
                : '';
    stepEl.innerHTML = '<span class="tag">' + `move ${node.move} / ${MOVE_COUNT}` + '</span>'
                     + '<span>' + cap.tag + '</span>' + brTag;
  }
  if (bodyEl) bodyEl.innerHTML = cap.body;
  if (mathEl){ if (cap.math){ mathEl.style.display=''; setMath(mathEl, MATHHTML[cap.math]); } else { mathEl.style.display='none'; mathEl.innerHTML=''; } }

  /* move dots */
  renderDots();

  /* branch chooser */
  renderBranchChooser();

  /* transport button states */
  const atBranch = atUnresolvedBranch();
  const atEnd = (state.pos === state.path.length - 1) && !atBranch
                && (!curNode().children || curNode().children.length === 0);
  setDisabled('btn-prev', state.pos === 0);
  setDisabled('btn-next', atBranch || atEnd);
  setDisabled('btn-restart', state.pos === 0 && Object.keys(state.choiceAt).length === 0);
  const playBtn = document.getElementById('btn-play');
  if (playBtn) setDisabled('btn-play', atEnd && !state.playing);
}

function setDisabled(id, cond){ const b=document.getElementById(id); if(b) b.disabled = !!cond; }

/* ---- move dots (positions 0..MOVE_COUNT along the current path) ---- */
function renderDots(){
  const host = document.getElementById('movedots');
  if (!host) return;
  if (!host.dataset.built){
    host.innerHTML = '<span class="lbl">move</span>';
    for (let i=0;i<=MOVE_COUNT;i++){
      const b=document.createElement('button');
      b.className='mdot'; b.type='button'; b.textContent=String(i);
      b.setAttribute('aria-label','Go to move '+i);
      b.addEventListener('click', ()=>{ if (i < state.path.length) jumpTo(i); });
      host.appendChild(b);
    }
    host.dataset.built='1';
  }
  const dots = host.querySelectorAll('.mdot');
  dots.forEach((b,i)=>{
    b.classList.remove('done','current','branch','onA','onB');
    const reachable = i < state.path.length;
    b.disabled = !reachable;
    b.style.opacity = reachable ? '' : '.3';
    if (reachable){
      const nd = NODES[state.path[i]];
      if (i <= state.pos) b.classList.add('done');
      if (i === state.pos) b.classList.add('current');
      if (nd.children && nd.children.length===2) b.classList.add('branch');
      const br = branchColorOfPathIndex(i);
      if (br==='A') b.classList.add('onA');
      if (br==='B') b.classList.add('onB');
    }
  });
}
/* which branch does path[i] belong to (based on chosen fork), or null */
function branchColorOfPathIndex(i){
  let br=null;
  for (let j=0;j<=i;j++){
    const nd=NODES[state.path[j]];
    if (nd.children && nd.children.length===2){
      const ch=state.choiceAt[nd.id];
      if (ch && j < i) br = branchOfChoice(ch);   // colour appears *after* the fork
    }
  }
  return br;
}

/* ---- branch chooser (shown only at the unresolved fork) ---- */
function renderBranchChooser(){
  const box = document.getElementById('branch-choice');
  const label = document.getElementById('bc-label');
  if (!box) return;
  if (!atUnresolvedBranch()){ box.classList.add('hidden'); return; }
  box.classList.remove('hidden');
  if (label) label.innerHTML = 'The cycle splits. <b>Choose which piece to follow</b> — the other is saved for later:';
  if (!box.dataset.built){
    const bA=document.createElement('button');
    bA.className='choice choiceA'; bA.type='button';
    bA.innerHTML='Through a point <span class="sub">swap · λ=(2) · {1,4}</span>';
    bA.addEventListener('click', ()=>choose('swap'));
    const bB=document.createElement('button');
    bB.className='choice choiceB'; bB.type='button';
    bB.innerHTML='In a plane <span class="sub">stay · λ=(1,1) · {2,3}</span>';
    bB.addEventListener('click', ()=>choose('stay'));
    box.appendChild(bA); box.appendChild(bB);
    box.dataset.built='1';
  }
}

/* ============================================================================
   init — build modules, wire controls, render the result strip, first paint.
   ============================================================================ */
function init(){
  BOARD.build();
  FLAG.build();
  TREE.build();

  /* result strip: the computed product in G(2,4) */
  const rs = document.getElementById('result-strip');
  if (rs){
    rs.innerHTML = '<span class="lead">In G(2,4)</span>';
    const eq = document.createElement('span');
    setMath(eq, MATHHTML.product);
    rs.appendChild(eq);
    const co = document.createElement('span'); co.className='lead';
    co.style.marginLeft='auto'; co.textContent='c = 1  each';
    rs.appendChild(co);
  }

  /* buttons */
  wire('btn-next', goNext);
  wire('btn-prev', goPrev);
  wire('btn-restart', restart);
  wire('btn-play', togglePlay);

  /* keyboard */
  window.addEventListener('keydown', (e)=>{
    if (e.target && /^(INPUT|TEXTAREA)$/.test(e.target.tagName)) return;
    if (e.key==='ArrowRight'){ e.preventDefault(); goNext(); }
    else if (e.key==='ArrowLeft'){ e.preventDefault(); goPrev(); }
    else if (e.key===' '){ e.preventDefault(); togglePlay(); }
    else if (e.key==='Home'){ e.preventDefault(); restart(); }
  });

  render();
}
function wire(id, fn){ const b=document.getElementById(id); if(b) b.addEventListener('click', fn); }

if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', init);
} else { init(); }
