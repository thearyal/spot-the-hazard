(function(){
"use strict";

const QUESTIONS = [
  {
    q: "You spot a small oil spill in a busy aisle. What's the safest first action?",
    options: [
      "Walk around it and keep working",
      "Mark it with a cone and clean it up immediately",
      "Wait for someone else to notice it",
      "Cover it with a cardboard box"
    ],
    correct: 1,
    explain: "Slip hazards should be marked and cleaned up right away — walking around it just leaves it for the next person."
  },
  {
    q: "A fire exit has boxes stacked in front of it. What should you do?",
    options: [
      "Leave it, it's probably a short-term delivery",
      "Move the boxes and keep the exit clear at all times",
      "Only worry about it during a fire drill",
      "Report it at the end of the week"
    ],
    correct: 1,
    explain: "Emergency exits must stay clear at all times — in a real emergency, seconds matter."
  },
  {
    q: "What's the main danger of an overloaded or leaning racking shelf?",
    options: [
      "It looks untidy",
      "It can collapse or drop stock onto people below",
      "It slows down stock counts",
      "It voids the warehouse insurance instantly"
    ],
    correct: 1,
    explain: "Overloaded or damaged racking can fail suddenly, causing falling stock or a full collapse — a serious injury risk."
  },
  {
    q: "You see a forklift operating nearby with a raised load, close to walking workers. What's the safest behavior?",
    options: [
      "Walk underneath the load to save time",
      "Keep well clear and make eye contact with the operator before crossing its path",
      "Assume the operator has already seen you",
      "Wave and keep walking at the same pace"
    ],
    correct: 1,
    explain: "Never walk under a raised load, and always confirm the operator has seen you before crossing a forklift's path."
  },
  {
    q: "A worker on the floor isn't wearing a hard hat in a marked PPE zone. What should happen?",
    options: [
      "Nothing, hard hats are optional if you're careful",
      "They should be reminded to wear required PPE before continuing work",
      "Only visitors need to wear hard hats",
      "It's fine as long as no racking is nearby"
    ],
    correct: 1,
    explain: "PPE requirements apply to everyone in a marked zone — hard hats protect against falling objects, which is a real risk near racking."
  },
  {
    q: "You notice a chemical drum that appears to be leaking. What's the correct response?",
    options: [
      "Wipe it up with a rag and continue",
      "Report it immediately and keep others away from the area",
      "Ignore it if it's a small amount",
      "Move the drum yourself to a different aisle"
    ],
    correct: 1,
    explain: "Leaking chemicals can be hazardous to health — report it and keep the area clear rather than handling it yourself."
  },
  {
    q: "An extension cord powering equipment looks frayed and worn. What's the risk?",
    options: [
      "No real risk if the equipment still works",
      "Electric shock or fire hazard",
      "It only affects the equipment's warranty",
      "It will just slow the equipment down"
    ],
    correct: 1,
    explain: "Damaged cords can cause electric shock or start a fire — they should be taken out of service and replaced."
  },
  {
    q: "A fire extinguisher is blocked by stacked boxes. Why does this matter?",
    options: [
      "It doesn't — extinguishers are rarely needed",
      "In an emergency, it could cost critical time to reach and use it",
      "It only matters if the boxes are flammable",
      "Fire extinguishers don't expire so it's not urgent"
    ],
    correct: 1,
    explain: "Fire extinguishers need to be immediately accessible — a blocked one could make a small fire much worse."
  },
  {
    q: "What's the best general habit for staying safe while walking through a warehouse floor?",
    options: [
      "Stay on marked walkways and stay aware of your surroundings",
      "Take the shortest path between two points, even through racking",
      "Only look where you're walking, not around you",
      "Assume forklifts will always stop for pedestrians"
    ],
    correct: 0,
    explain: "Marked walkways exist for a reason — staying on them and staying alert is the single best habit for avoiding warehouse accidents."
  }
];

let current = 0;
let score = 0;
let answered = false;

const quizQuestion = document.getElementById('quizQuestion');
const quizOptions = document.getElementById('quizOptions');
const quizFeedback = document.getElementById('quizFeedback');
const quizCounter = document.getElementById('quizCounter');
const progressFill = document.getElementById('progressFill');
const quizScoreLive = document.getElementById('quizScoreLive');
const nextBtn = document.getElementById('nextBtn');
const quizActive = document.getElementById('quizActive');
const quizDone = document.getElementById('quizDone');

function renderQuestion(){
  answered = false;
  const item = QUESTIONS[current];
  quizCounter.textContent = `Question ${current+1} / ${QUESTIONS.length}`;
  progressFill.style.width = `${(current/QUESTIONS.length)*100}%`;
  quizQuestion.textContent = item.q;
  quizFeedback.classList.add('hidden');
  quizFeedback.className = 'quizFeedback hidden';
  nextBtn.classList.add('hidden');
  quizOptions.innerHTML = '';

  item.options.forEach((optText, idx) => {
    const btn = document.createElement('button');
    btn.className = 'quizOption';
    btn.textContent = optText;
    btn.addEventListener('click', () => selectAnswer(idx, btn));
    quizOptions.appendChild(btn);
  });
}

function selectAnswer(idx, btnEl){
  if(answered) return;
  answered = true;
  const item = QUESTIONS[current];
  const allBtns = quizOptions.querySelectorAll('.quizOption');
  allBtns.forEach(b => b.classList.add('disabledOpt'));

  if(idx === item.correct){
    score++;
    btnEl.classList.add('correct');
    quizFeedback.className = 'quizFeedback good';
    quizFeedback.textContent = '✔ Correct — ' + item.explain;
  } else {
    btnEl.classList.add('wrong');
    allBtns[item.correct].classList.add('correct');
    quizFeedback.className = 'quizFeedback bad';
    quizFeedback.textContent = '✘ Not quite — ' + item.explain;
  }
  quizFeedback.classList.remove('hidden');
  quizScoreLive.textContent = score;
  nextBtn.classList.remove('hidden');
}

function nextQuestion(){
  current++;
  if(current >= QUESTIONS.length){
    showResults();
  } else {
    renderQuestion();
  }
}

function showResults(){
  progressFill.style.width = '100%';
  quizActive.classList.add('hidden');
  quizDone.classList.remove('hidden');

  document.getElementById('quizScoreBig').textContent = score;

  const pct = score / QUESTIONS.length;
  const icon = document.getElementById('quizRankIcon');
  const name = document.getElementById('quizRankName');
  if(pct >= 0.9){ icon.textContent = '🏆'; name.textContent = 'Safety Expert'; }
  else if(pct >= 0.7){ icon.textContent = '🥇'; name.textContent = 'Sharp Eye'; }
  else if(pct >= 0.5){ icon.textContent = '🥈'; name.textContent = 'Good Awareness'; }
  else { icon.textContent = '📋'; name.textContent = 'Keep Learning'; }
}

function resetQuiz(){
  current = 0; score = 0; answered = false;
  quizScoreLive.textContent = '0';
  quizDone.classList.add('hidden');
  quizActive.classList.remove('hidden');
  renderQuestion();
}

nextBtn.addEventListener('click', nextQuestion);
document.getElementById('retakeBtn').addEventListener('click', resetQuiz);
document.getElementById('playFromQuizBtn').addEventListener('click', () => {
  window.location.href = 'game.html';
});
document.getElementById('quizHomeBtn').addEventListener('click', () => {
  window.location.href = 'index.html';
});

renderQuestion();

})();
