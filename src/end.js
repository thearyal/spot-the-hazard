(function(){
"use strict";

// Max possible: 10+10+15+15+20+20+20+20+20 = 150 base + up to 9*3 speed = 177
// Use 150 as realistic "perfect" baseline for percentage grading
const MAX_SCORE = 150;

// ---- read results handed off by game.html ----
const score = parseInt(sessionStorage.getItem('hh_score') || '0', 10);
const finalTime = sessionStorage.getItem('hh_time') || '00:00';
const wrong = parseInt(sessionStorage.getItem('hh_wrong') || '0', 10);
const found = sessionStorage.getItem('hh_found') || '8';

document.getElementById('finalTime').textContent = finalTime;
document.getElementById('finalFound').textContent = found + ' / 9';
document.getElementById('finalWrong').textContent = wrong;

// ---- grade & rank ----
const pct = Math.max(0, Math.min(1, score / MAX_SCORE));

let grade, rankName, icon, stars;
if(pct >= 0.9 && wrong <= 1){
  grade = 'S'; rankName = 'Perfect Audit'; icon = '🏆'; stars = 3;
} else if(pct >= 0.7){
  grade = 'A'; rankName = 'Sharp Eye'; icon = '🥇'; stars = 3;
} else if(pct >= 0.5){
  grade = 'B'; rankName = 'Solid Walkthrough'; icon = '🥈'; stars = 2;
} else if(pct >= 0.25){
  grade = 'C'; rankName = 'Needs Another Pass'; icon = '🥉'; stars = 1;
} else {
  grade = 'D'; rankName = 'Missed Too Much'; icon = '📋'; stars = 0;
}

const badge = document.getElementById('rankBadge');
document.getElementById('rankIcon').textContent = icon;
document.getElementById('gradeLetter').textContent = grade;
if(grade === 'S') badge.classList.add('grade-S');
if(grade === 'D' || grade === 'C') badge.classList.add('grade-C');

document.getElementById('rankName').textContent = rankName;

// ---- certification tier ----
const correctAnswers = parseInt(found, 10) - wrong;
const pctCorrect = Math.max(0, correctAnswers / 9 * 100);

let certTier, certIcon, certClass;
if (pctCorrect >= 90) {
  certTier = 'Certified Safety Inspector'; certIcon = '🏅'; certClass = 'gold';
} else if (pctCorrect >= 60) {
  certTier = 'Passed — Refresher Recommended'; certIcon = '✅'; certClass = 'green';
} else {
  certTier = 'Needs Retraining'; certIcon = '⚠️'; certClass = 'red';
}

const certBadge = document.getElementById('certTier');
if(certBadge){
  document.getElementById('certIcon').textContent = certIcon;
  document.getElementById('certName').textContent = certTier;
  certBadge.classList.add(certClass);
}

// ---- timeout handling ----
const wasTimeout = sessionStorage.getItem('hh_timeout') === '1';
const timeoutMsg = document.getElementById('timeoutMsg');
if(wasTimeout && timeoutMsg){
  timeoutMsg.classList.remove('hidden');
}

for(let i=1;i<=3;i++){
  const starEl = document.getElementById('star'+i);
  if(i <= stars) starEl.classList.add('lit');
}

// ---- animated score count-up ----
const scoreEl = document.getElementById('scoreBig');
const duration = 900;
const startTs = performance.now();
function tick(now){
  const t = Math.min(1, (now - startTs) / duration);
  const eased = 1 - Math.pow(1 - t, 3); // ease-out cubic
  scoreEl.textContent = Math.round(eased * score);
  if(t < 1) requestAnimationFrame(tick);
}
requestAnimationFrame(tick);

// ---- high score tracking (persists across sessions in this browser) ----
try{
  const prevBest = parseInt(localStorage.getItem('hh_highscore') || '0', 10);
  if(score > prevBest){
    localStorage.setItem('hh_highscore', String(score));
    document.getElementById('newBestBadge').classList.remove('hidden');
  }
}catch(e){ /* localStorage unavailable — skip silently */ }

// ---- navigation ----
document.getElementById('restartBtn').addEventListener('click', ()=>{
  window.location.href = 'game.html';
});
document.getElementById('homeBtn').addEventListener('click', ()=>{
  window.location.href = 'index.html';
});

})();
