const { generateDeck, PRINCIPLE_LABEL } = window.MathQuiz;

const QUESTION_SECONDS = 60;

// ---------- Estado do jogo ----------
const game = {
  deck: [],
  index: 0,
  score: 0,
  // Por-questão:
  selected: null,
  locked: false,
  timedOut: false,
  timeLeft: QUESTION_SECONDS,
  timerId: null,
};

const app = document.getElementById("app");

// ---------- Helpers ----------
const pad = (n) => String(n).padStart(2, "0");

function clearTimer() {
  if (game.timerId) {
    clearInterval(game.timerId);
    game.timerId = null;
  }
}

// Cor do timer conforme tempo restante
function timerStatus(sec) {
  if (sec > 30) return "ok";
  if (sec > 15) return "warn";
  return "danger";
}

// ---------- Tela inicial ----------
function showStart() {
  clearTimer();
  app.innerHTML = `
    <section class="card scanline start">
      <div class="glow-blob" style="top:-6rem;right:-6rem;width:16rem;height:16rem;background:hsl(162 84% 51% / .2)"></div>
      <div class="glow-blob" style="bottom:-6rem;left:-6rem;width:16rem;height:16rem;background:hsl(152 100% 73% / .2)"></div>
      <span class="pill">Matemática Discreta · Ensino Médio</span>
      <h1><span class="glow">Math</span> Quiz</h1>
      <p class="lead">
        O quiz que disfarça matemática de feed.
        Resolva problemas de
        <strong style="color:var(--accent)"> contagem </strong>
        dentro do mundo das redes sociais.
      </p>
      <div class="features">
        <div class="feature"><div class="ico">🧠</div><p>Adição e Multiplicação</p></div>
        <div class="feature"><div class="ico">🕊️</div><p>Casa dos Pombos</p></div>
        <div class="feature"><div class="ico">🤝</div><p>União de Conjuntos</p></div>
      </div>
      <button class="btn lg" id="startBtn">▶ Começar partida</button>
      <p class="meta">10 fases · ⏱ 60s por questão · explicação após cada resposta</p>
    </section>
  `;
  app.querySelector("#startBtn").addEventListener("click", startGame);
}

// ---------- Início de partida ----------
function startGame() {
  game.deck = generateDeck();
  game.index = 0;
  game.score = 0;
  showQuestion();
}

// ---------- Tela de questão ----------
function showQuestion() {
  // Reset por questão
  game.selected = null;
  game.locked = false;
  game.timedOut = false;
  game.timeLeft = QUESTION_SECONDS;

  const q = game.deck[game.index];
  const total = game.deck.length;
  const progressPct = (game.index / total) * 100;

  app.innerHTML = `
    <div class="quiz-wrap">
      <div class="hud">
        <span>
          Fase <span style="color:var(--primary)">${pad(game.index + 1)}</span>
          <span style="opacity:.6"> / ${pad(total)}</span>
        </span>
        <div class="hud-right">
          <span class="chip timer ok" id="chipTimer">⏱ ${pad(game.timeLeft)}s</span>
          <span class="chip score">⚡ ${game.score} pts</span>
        </div>
      </div>

      <div class="global-bar"><span style="width:${progressPct}%"></span></div>

      <section class="card scanline question-card">
        <div class="glow-blob" style="top:-5rem;right:-4rem;width:11rem;height:11rem;background:hsl(162 84% 51% / .15)"></div>

        <div class="timer-bar"><span id="timerBar" class="ok" style="width:100%"></span></div>

        <span class="principle">${PRINCIPLE_LABEL[q.principle]}</span>
        <p class="scenario">${q.scenario}</p>
        <h2 class="qtext">${q.question}</h2>

        <div class="options" id="options">
          ${q.options.map((opt, i) => `
            <button class="option" data-i="${i}">
              <span class="letter">${String.fromCharCode(65 + i)}</span>
              <span class="text">${opt}</span>
            </button>
          `).join("")}
        </div>

        <!-- Feedback e botão "próximo" entram aqui depois da resposta -->
        <div id="afterAnswer"></div>
      </section>
    </div>
  `;

  // Liga clique nas alternativas
  app.querySelectorAll(".option").forEach((btn) => {
    btn.addEventListener("click", () => answerSelected(Number(btn.dataset.i)));
  });

  // Inicia o timer
  clearTimer();
  game.timerId = setInterval(tick, 1000);
}

// ---------- Tick do timer ----------
function tick() {
  if (game.locked) return; // segurança
  game.timeLeft -= 1;

  if (game.timeLeft <= 0) {
    game.timeLeft = 0;
    updateTimerUI();
    timeOut();
    return;
  }
  updateTimerUI();
}

function updateTimerUI() {
  const chip = document.getElementById("chipTimer");
  const bar  = document.getElementById("timerBar");
  if (!chip || !bar) return;

  const status = timerStatus(game.timeLeft);
  chip.textContent = `⏱ ${pad(game.timeLeft)}s`;
  chip.className = `chip timer ${status}${status === "danger" && !game.locked ? " pulse" : ""}`;
  bar.className = status;
  bar.style.width = `${(game.timeLeft / QUESTION_SECONDS) * 100}%`;
}

// ---------- Tempo esgotado ----------
function timeOut() {
  clearTimer();
  game.locked = true;
  game.timedOut = true;
  revealAnswer();
}

// ---------- Resposta selecionada ----------
function answerSelected(i) {
  if (game.locked) return;
  clearTimer();
  game.locked = true;
  game.selected = i;
  if (game.deck[game.index].correctIndex === i) {
    game.score += 1;
  }
  revealAnswer();
}

// ---------- Mostrar correta/errada + feedback ----------
function revealAnswer() {
  const q = game.deck[game.index];
  const total = game.deck.length;
  const isCorrect = game.selected === q.correctIndex;

  // Marca alternativas
  app.querySelectorAll(".option").forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correctIndex) {
      btn.classList.add("correct");
      btn.insertAdjacentHTML("beforeend", '<span class="icon">✓</span>');
    } else if (i === game.selected) {
      btn.classList.add("wrong");
      btn.insertAdjacentHTML("beforeend", '<span class="icon">✗</span>');
    } else {
      btn.classList.add("dim");
    }
  });

  // Atualiza pontuação no chip
  const scoreChip = app.querySelector(".chip.score");
  if (scoreChip) scoreChip.textContent = `⚡ ${game.score} pts`;

  // Insere feedback + botão "próxima"
  const titulo = isCorrect
    ? "💡 Mandou bem!"
    : game.timedOut
    ? "⏰ Tempo esgotado!"
    : "💡 Quase lá!";
  const isLast = game.index + 1 === total;

  document.getElementById("afterAnswer").innerHTML = `
    <div class="feedback ${isCorrect ? "ok" : "bad"}">
      <h3>${titulo}</h3>
      <p>${q.explanation}</p>
    </div>
    <button class="btn next-btn" id="nextBtn">
      ${isLast ? "Ver resultado" : "Próxima fase"} →
    </button>
  `;
  document.getElementById("nextBtn").addEventListener("click", nextQuestion);

  // Para o pulse do chip do timer
  updateTimerUI();
}

// ---------- Próxima questão / fim ----------
function nextQuestion() {
  if (game.index + 1 >= game.deck.length) {
    showResult();
  } else {
    game.index += 1;
    showQuestion();
  }
}

// ---------- Tela de resultado ----------
function showResult() {
  clearTimer();
  const total = game.deck.length;
  const pct = Math.round((game.score / total) * 100);
  const rank = getRank(pct);

  app.innerHTML = `
    <section class="card scanline result">
      <div class="glow-blob" style="top:-5rem;left:50%;transform:translateX(-50%);width:16rem;height:16rem;background:hsl(162 84% 51% / .3)"></div>
      <div class="trophy">🏆</div>
      <p class="label">Partida finalizada</p>
      <h2>${rank.emoji} ${rank.title}</h2>
      <p class="sub">${rank.sub}</p>
      <div class="stats">
        <div class="stat"><div class="k">Acertos</div><div class="v">${game.score}/${total}</div></div>
        <div class="stat hl"><div class="k">Precisão</div><div class="v">${pct}%</div></div>
        <div class="stat"><div class="k">XP</div><div class="v">${game.score * 100}</div></div>
      </div>
      <div class="global-bar" style="margin-bottom:1.5rem"><span style="width:${pct}%"></span></div>
      <div class="actions">
        <button class="btn" id="restartBtn">↻ Jogar novamente</button>
        <button class="btn outline" id="shareBtn">🔗 Compartilhar</button>
      </div>
    </section>
  `;
  document.getElementById("restartBtn").addEventListener("click", startGame);
  document.getElementById("shareBtn").addEventListener("click", shareResult);
}

function getRank(pct) {
  if (pct === 100) return { title: "LENDÁRIO",    sub: "Você é um/a verdadeiro/a mestre da contagem!", emoji: "👑" };
  if (pct >= 80)   return { title: "TOP DO FEED", sub: "Domínio insano dos princípios!",                emoji: "🔥" };
  if (pct >= 60)   return { title: "INFLUENCER",  sub: "Bom desempenho! Revise união de conjuntos.",    emoji: "⭐" };
  if (pct >= 40)   return { title: "EM ASCENSÃO", sub: "Pratique mais a Casa dos Pombos.",              emoji: "🚀" };
  return            { title: "MODO TREINO", sub: "Sem stress! Reveja os princípios e tente de novo.", emoji: "💪" };
}

function shareResult() {
  const total = game.deck.length;
  const pct = Math.round((game.score / total) * 100);
  const text = `Acertei ${game.score}/${total} (${pct}%) no Math Quiz — contagem disfarçada de rede social!`;
  if (navigator.share) {
    navigator.share({ title: "Math Quiz", text }).catch(() => {});
  } else {
    navigator.clipboard.writeText(text);
    showToast("Resultado copiado!");
  }
}

function showToast(msg) {
  const t = document.createElement("div");
  t.className = "toast";
  t.textContent = msg;
  document.body.appendChild(t);
  setTimeout(() => t.remove(), 2200);
}

// Boot
showStart();
