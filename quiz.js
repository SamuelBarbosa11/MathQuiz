(function () {
const PRINCIPLE_LABEL = {
  adicao: "Princípio Aditivo",
  multiplicacao: "Princípio Multiplicativo",
  pombos: "Casa dos Pombos",
  uniao: "União de Conjuntos",
};

const rnd = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const fmt = (n) => n.toLocaleString("pt-BR");

function buildOptions(correct, distractors, suffix = "") {
  const pool = new Set([correct, ...distractors]);
  let bump = 1;
  while (pool.size < 4) {
    pool.add(correct + bump);
    bump = bump > 0 ? -bump : -bump + 1;
  }
  const arr = Array.from(pool).slice(0, 4);
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return {
    options: arr.map((n) => `${fmt(n)}${suffix}`),
    correctIndex: arr.indexOf(correct),
  };
}

const generators = [
  // 1 — Multiplicativo: combinações de perfil
  () => {
    const filtros = rnd(3, 6), fontes = rnd(2, 5), emojis = rnd(4, 7);
    const correct = filtros * fontes * emojis;
    const { options, correctIndex } = buildOptions(
      correct,
      [filtros + fontes + emojis, filtros * fontes, fontes * emojis],
      " combinações"
    );
    return {
      principle: "multiplicacao",
      scenario: "📸 Você está montando seu novo perfil no app GramSnap.",
      question: `Para a foto de perfil, há ${filtros} filtros disponíveis. Para o nome de usuário, você pode escolher entre ${fontes} estilos de fonte. E para a bio, ${emojis} emojis decorativos. Quantas combinações diferentes de perfil você consegue criar escolhendo um de cada?`,
      options,
      correctIndex,
      explanation: `Como cada escolha é independente, multiplicamos as opções: ${filtros} × ${fontes} × ${emojis} = ${correct}. Esse é o Princípio Multiplicativo da contagem.`,
    };
  },
  // 2 — Aditivo: vídeo OU carrossel
  () => {
    const v = rnd(4, 10), c = rnd(3, 9);
    const correct = v + c;
    const { options, correctIndex } = buildOptions(
      correct,
      [v * c, Math.abs(v - c), v + c + rnd(2, 5)],
      " formas"
    );
    return {
      principle: "adicao",
      scenario: "🎬 No app de vídeos curtos VibeTok você quer postar um conteúdo.",
      question: `Você pode publicar um vídeo OU um carrossel de fotos (não os dois ao mesmo tempo). Há ${v} templates de vídeo e ${c} templates de carrossel. De quantas formas diferentes você pode fazer uma única publicação?`,
      options,
      correctIndex,
      explanation: `Como as opções são exclusivas (vídeo OU carrossel), somamos: ${v} + ${c} = ${correct}. Esse é o Princípio Aditivo — usado quando os conjuntos são disjuntos.`,
    };
  },
  // 3 — Casa dos Pombos: aniversários
  () => {
    const alunos = rnd(366, 410);
    return {
      principle: "pombos",
      scenario: `🐦 Sua turma do 2º ano tem ${alunos} alunos no grupo do BlueBird.`,
      question: "É possível garantir que pelo menos dois alunos da turma fazem aniversário no mesmo dia do ano (considere 365 dias)?",
      options: [
        "Não, pode ser que todos sejam em dias diferentes.",
        "Sim, com certeza pelo menos dois compartilham o dia.",
        "Só se forem gêmeos.",
        "Depende do mês de nascimento.",
      ],
      correctIndex: 1,
      explanation: `Pelo Princípio da Casa dos Pombos: se há ${alunos} 'pombos' (alunos) e apenas 365 'casas' (dias do ano), pelo menos uma casa terá 2 pombos. É garantido!`,
    };
  },
  // 4 — União 2 conjuntos
  () => {
    const a = rnd(20, 35), b = rnd(18, 30);
    const inter = rnd(8, Math.min(a, b) - 2);
    const correct = a + b - inter;
    const { options, correctIndex } = buildOptions(
      correct,
      [a + b, a + b + inter, correct - rnd(3, 8)],
      " alunos"
    );
    return {
      principle: "uniao",
      scenario: "📊 Você fez uma pesquisa entre os alunos da sua sala sobre quais redes usam.",
      question: `${a} alunos usam o GramSnap, ${b} usam o VibeTok, e ${inter} usam as duas. Quantos alunos usam pelo menos uma dessas duas redes?`,
      options,
      correctIndex,
      explanation: `Inclusão-Exclusão: |A ∪ B| = |A| + |B| − |A ∩ B| = ${a} + ${b} − ${inter} = ${correct}.`,
    };
  },
  // 5 — Multiplicativo: senha
  () => {
    const letras = rnd(2, 3), digitos = rnd(2, 4);
    const correct = Math.pow(26, letras) * Math.pow(10, digitos);
    const { options, correctIndex } = buildOptions(
      correct,
      [26 * letras + 10 * digitos, Math.pow(26, letras) + Math.pow(10, digitos), correct * 2],
      " senhas"
    );
    return {
      principle: "multiplicacao",
      scenario: "🔐 Hora de criar a senha da sua nova conta no ChatRoom.",
      question: `A senha precisa ter exatamente ${letras + digitos} caracteres, sendo: ${letras} letras maiúsculas (A–Z, 26 opções cada) seguidas de ${digitos} dígitos (0–9, 10 opções cada). Quantas senhas diferentes são possíveis?`,
      options,
      correctIndex,
      explanation: `Multiplicamos: 26^${letras} × 10^${digitos} = ${fmt(correct)}. Princípio Multiplicativo aplicado posição por posição.`,
    };
  },
  // 6 — Casa dos Pombos: cores
  () => {
    const cores = rnd(8, 14);
    const pessoas = cores + rnd(1, 4);
    return {
      principle: "pombos",
      scenario: `💬 No grupo da escola no ChatRoom há ${pessoas} mensageiros ativos.`,
      question: `Cada um envia mensagens marcadas com uma das ${cores} cores de etiqueta disponíveis. É possível garantir que pelo menos dois mensageiros usaram a mesma cor de etiqueta?`,
      options: [
        "Não, todos podem ter cores diferentes.",
        "Sim, é matematicamente garantido.",
        "Só se combinarem antes.",
        "Apenas se houver repetição proposital.",
      ],
      correctIndex: 1,
      explanation: `Casa dos Pombos: ${pessoas} pessoas para apenas ${cores} cores → pelo menos duas dividem a mesma cor. Pombos > casas → repetição garantida.`,
    };
  },
  // 7 — União 3 conjuntos
  () => {
    const A = rnd(50, 70), B = rnd(35, 50), C = rnd(25, 40);
    const AB = rnd(12, 22), AC = rnd(10, 18), BC = rnd(8, 14), ABC = rnd(3, 7);
    const correct = A + B + C - AB - AC - BC + ABC;
    const { options, correctIndex } = buildOptions(
      correct,
      [A + B + C, A + B + C - AB - AC - BC, correct + rnd(5, 12)],
      " seguidores"
    );
    return {
      principle: "uniao",
      scenario: "🎵 Em uma enquete sobre playlists virais entre seguidores:",
      question: `${A} curtem funk, ${B} curtem sertanejo, ${C} curtem pop. ${AB} curtem funk e sertanejo, ${AC} curtem funk e pop, ${BC} curtem sertanejo e pop, e ${ABC} curtem todos os três. Quantos curtem pelo menos um desses gêneros?`,
      options,
      correctIndex,
      explanation: `Inclusão-Exclusão (3 conjuntos): ${A}+${B}+${C} − ${AB}−${AC}−${BC} + ${ABC} = ${correct}.`,
    };
  },
  // 8 — Multiplicativo: avatar
  () => {
    const cab = rnd(4, 8), pele = rnd(3, 6), cam = rnd(4, 7), ace = rnd(2, 5);
    const correct = cab * pele * cam * ace;
    const { options, correctIndex } = buildOptions(
      correct,
      [cab + pele + cam + ace, cab * pele, cab * pele * cam],
      " avatares"
    );
    return {
      principle: "multiplicacao",
      scenario: "🎨 Você vai customizar seu avatar no jogo PixelClash.",
      question: `Há ${cab} cortes de cabelo, ${pele} cores de pele, ${cam} camisetas e ${ace} acessórios. Cada avatar usa exatamente um item de cada categoria. Quantos avatares diferentes você pode montar?`,
      options,
      correctIndex,
      explanation: `${cab} × ${pele} × ${cam} × ${ace} = ${correct}. Decisões em sequência e independentes → Princípio Multiplicativo.`,
    };
  },
  // 9 — Aditivo: streaming
  () => {
    const com = rnd(5, 12), doc = rnd(4, 9), ser = rnd(3, 7);
    const correct = com + doc + ser;
    const { options, correctIndex } = buildOptions(
      correct,
      [com * doc * ser, com * doc, correct + rnd(3, 8)],
      " formas"
    );
    return {
      principle: "adicao",
      scenario: "📺 No streaming FlixPlay você vai assistir UM conteúdo agora.",
      question: `O catálogo tem ${com} filmes de comédia, ${doc} documentários e ${ser} séries que ainda não viu. Como você quer ver apenas uma coisa, de quantas formas pode escolher?`,
      options,
      correctIndex,
      explanation: `Categorias disjuntas e escolha única → soma: ${com} + ${doc} + ${ser} = ${correct}.`,
    };
  },
  // 10 — União: descobrir interseção
  () => {
    const A = rnd(40, 60), B = rnd(25, 40), inter = rnd(8, 18);
    const uniao = A + B - inter;
    const { options, correctIndex } = buildOptions(
      inter,
      [A + B - uniao + rnd(3, 8), Math.abs(A - inter), Math.abs(A - B)],
      " alunos"
    );
    return {
      principle: "uniao",
      scenario: "📱 Pesquisa rápida com alunos do colégio:",
      question: `${A} seguem o perfil oficial da escola e ${B} seguem o grêmio estudantil. Se ${uniao} alunos seguem ao menos um dos dois perfis, quantos seguem AMBOS?`,
      options,
      correctIndex,
      explanation: `De |A ∪ B| = |A| + |B| − |A ∩ B|, isolamos: |A ∩ B| = ${A} + ${B} − ${uniao} = ${inter}.`,
    };
  },
];

function generateDeck() {
  const deck = generators.map((g, i) => ({ id: i + 1, ...g() }));
  // embaralha a ordem das fases
  for (let i = deck.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

window.MathQuiz = { generateDeck, PRINCIPLE_LABEL };
})();
