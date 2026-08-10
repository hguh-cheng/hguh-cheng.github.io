/* ============================================================================
   A Geometric Littlewood–Richardson Rule — interactive Figure 3
   n=4, k=2, α=β={2,4}.  Data in states.js (GAME, P3), verified against the paper.
   ============================================================================ */
'use strict';

const N = GAME.n;                 // 4
const NODES = GAME.nodes;         // 11 states
const MOVE_COUNT = GAME.perms.length - 1;  // 6 moves
const svgNS = 'http://www.w3.org/2000/svg';

/* ---- branch colours (must match CSS) ---- */
const COL = {
  A: getVar('--A'), Asoft: getVar('--A-soft'),
  B: getVar('--B'), Bsoft: getVar('--B-soft'),
  amber: getVar('--amber'), amberLine: getVar('--amber-line'),
  paperInk: getVar('--paper-ink'), muted: getVar('--muted'),
  chalk: getVar('--chalk'), chalkDim: getVar('--chalk-dim'),
  hair: getVar('--hair'), paper: getVar('--paper'), paperLine: getVar('--paper-line'),
};
function getVar(n){ return getComputedStyle(document.documentElement).getPropertyValue(n).trim(); }

/* ============================================================================
   The current PATH: a list of state ids from root to the current frontier,
   plus a pointer `pos` (0..path.length-1) marking which state we're viewing.
   Advancing past a branch requires a choice; choices are remembered per-branch
   so Prev/Next feel stable.
   ============================================================================ */
const state = {
  path: [GAME.root],   // state ids visited (root .. deepest chosen)
  pos: 0,              // index into path currently displayed
  choiceAt: {},        // stateId -> 'stay'|'swap' chosen at that branch
  playing: false,
  playTimer: null,
};

/* which branch (A/B) does a given choice at the fork lead to?
   From the verified tree: at the fork (state 2, move 2),
   'swap' -> {1,4} partition (2)   = branch A (crimson)
   'stay' -> {2,3} partition (1,1) = branch B (indigo)               */
function branchOfChoice(choice){ return choice === 'swap' ? 'A' : 'B'; }

/* Determine, for the CURRENT path, which coloured branch (if any) we're on.
   Returns 'A','B', or null (before/at the fork with no choice yet). */
function activeBranch(){
  for (const sid of state.path){
    const nd = NODES[sid];
    if (nd.children && nd.children.length === 2){
      const ch = state.choiceAt[sid];
      if (ch) return branchOfChoice(ch);
    }
  }
  return null;
}

/* node currently displayed */
function curNode(){ return NODES[state.path[state.pos]]; }

/* Is the displayed node an unresolved branch (needs a choice to go on)? */
function atUnresolvedBranch(){
  const nd = curNode();
  return nd.children && nd.children.length === 2 && !state.choiceAt[nd.id]
         && state.pos === state.path.length - 1;
}

/* Rebuild path forward from current pos using remembered choices, so that
   after picking a branch (or when possible) the path extends automatically
   down single-child chains. */
function extendPath(){
  // truncate anything after pos
  state.path = state.path.slice(0, state.pos + 1);
  let sid = state.path[state.path.length - 1];
  while (true){
    const nd = NODES[sid];
    if (!nd.children || nd.children.length === 0) break;
    let next = null;
    if (nd.children.length === 1){
      next = nd.children[0].child;
    } else {
      const ch = state.choiceAt[nd.id];
      if (!ch) break;                        // need a decision here
      const found = nd.children.find(c => c.choice === ch);
      next = found ? found.child : null;
      if (next === null) break;
    }
    state.path.push(next);
    sid = next;
  }
}

/* ---- navigation ---- */
function goNext(){
  if (atUnresolvedBranch()) return;          // must choose first
  if (state.pos < state.path.length - 1){
    state.pos++;
  } else {
    // try to extend (covers the case where a choice was just made)
    extendPath();
    if (state.pos < state.path.length - 1) state.pos++;
  }
  render();
}
function goPrev(){
  stopPlay();
  if (state.pos > 0){ state.pos--; render(); }
}
function restart(){
  stopPlay();
  state.path = [GAME.root]; state.pos = 0; state.choiceAt = {};
  render();
}
function jumpTo(targetPos){
  stopPlay();
  if (targetPos <= state.path.length - 1){
    state.pos = targetPos; render();
  }
}
function choose(choice){
  const nd = curNode();
  if (!(nd.children && nd.children.length === 2)) return;
  state.choiceAt[nd.id] = choice;
  extendPath();
  // step forward into the chosen child immediately
  if (state.pos < state.path.length - 1) state.pos++;
  render();
}

/* ---- autoplay: walk to the end of the current resolvable branch ---- */
function togglePlay(){
  if (state.playing){ stopPlay(); return; }
  // If we're at an unresolved branch, default to 'swap' (branch A) so play has somewhere to go
  if (atUnresolvedBranch()) state.choiceAt[curNode().id] = 'swap';
  extendPath();
  state.playing = true;
  document.getElementById('btn-play').textContent = '❚❚ Pause';
  const stepDelay = 900;
  const tick = () => {
    if (!state.playing) return;
    if (atUnresolvedBranch()){ state.choiceAt[curNode().id] = 'swap'; extendPath(); }
    if (state.pos < state.path.length - 1){
      state.pos++; render();
      state.playTimer = setTimeout(tick, stepDelay);
    } else {
      stopPlay();
    }
  };
  render();
  state.playTimer = setTimeout(tick, stepDelay);
}
function stopPlay(){
  state.playing = false;
  if (state.playTimer){ clearTimeout(state.playTimer); state.playTimer = null; }
  const b = document.getElementById('btn-play');
  if (b) b.textContent = '▷ Play';
}

/* small linear-algebra + tween helpers used by the flag view are in app-geom.js */
