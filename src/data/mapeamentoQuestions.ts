// ═══════════════════════════════════════════════════════════════
//  src/data/mapeamentoQuestions.ts — VERSÃO CORRIGIDA
//  Correções aplicadas:
//  ✓ Florais imprecisos corrigidos (Tristeza, Abandono, Falta controle)
//  ✓ Pergunta 3 gramaticalmente completa
//  ✓ Peso da pergunta final ajustado para 2
//  ✓ Redundância entre Q2 e Q5/Q8 reduzida
//  ✓ Overlap Q7/Q9 diferenciado (Larch vs Pine)
//  ✓ Nova pergunta 11 para capturar raiva/ressentimento (Holly, Willow)
//  ✓ Clematis adicionado para inconstância
//  ✓ Sweet Chestnut e Wild Rose adicionados para tristeza
// ═══════════════════════════════════════════════════════════════

export const mapeamentoQuestions = [
  {
    id: 1,
    tipo: "emocao",
    pergunta: "Nos últimos dias, o que mais tem predominado em você?",
    opcoes: [
      {
        texto: "Ansiedade ou preocupação constante",
        emocao: "ansiedade",
        peso: 3,
        florais: ["Aspen", "Mimulus", "White Chestnut"]
      },
      {
        texto: "Cansaço emocional profundo",
        emocao: "exaustao",
        peso: 3,
        florais: ["Olive", "Elm", "Oak"]
      },
      {
        texto: "Irritação ou impaciência",
        emocao: "irritacao",
        peso: 3,
        florais: ["Impatiens", "Vervain", "Holly"]
      },
      {
        // CORRIGIDO: Sweet Chestnut e Wild Rose adicionados
        texto: "Tristeza sem motivo claro",
        emocao: "tristeza",
        peso: 3,
        florais: ["Mustard", "Sweet Chestnut", "Wild Rose"]
      },
      {
        texto: "Sensação de estar perdida(o)",
        emocao: "confusao",
        peso: 3,
        florais: ["Wild Oat", "Scleranthus", "Cerato"]
      }
    ]
  },
  {
    id: 2,
    tipo: "estado",
    // CORRIGIDO: pergunta mais completa + opções reformuladas para reduzir redundância
    pergunta: "Como você percebe seu ritmo interno hoje?",
    opcoes: [
      {
        texto: "Acelerado — não consigo parar ou descansar",
        emocao: "agitacao",
        peso: 2,
        florais: ["Impatiens", "White Chestnut"]
      },
      {
        // CORRIGIDO: "Oscilando" trocado por "Pesado" para capturar Oak/Elm
        texto: "Pesado — como se carregasse um peso que não para",
        emocao: "sobrecarga_fisica",
        peso: 2,
        florais: ["Oak", "Elm"]
      },
      {
        // NOVO: Vazio captura Wild Rose e Clematis (não cobertos antes)
        texto: "Vazio — sem energia nem vontade de nada",
        emocao: "apatia",
        peso: 2,
        florais: ["Wild Rose", "Clematis", "Hornbeam"]
      },
      {
        texto: "Travado — quero agir mas não consigo",
        emocao: "bloqueio",
        peso: 2,
        florais: ["Hornbeam", "Larch"]
      },
      {
        texto: "Confuso — sem clareza sobre o que sinto",
        emocao: "confusao",
        peso: 2,
        florais: ["Wild Oat", "Scleranthus"]
      }
    ]
  },
  {
    id: 3,
    tipo: "mente",
    // CORRIGIDO: frase incompleta corrigida
    pergunta: "Como seus pensamentos se comportam no dia a dia?",
    opcoes: [
      {
        texto: "Se repetem o tempo todo — não consigo desligar",
        emocao: "ruminacao",
        peso: 3,
        florais: ["White Chestnut"]
      },
      {
        texto: "Antecipam problemas que ainda não aconteceram",
        emocao: "ansiedade",
        peso: 2,
        florais: ["Aspen", "Mimulus", "Red Chestnut"]
      },
      {
        texto: "Mudam constantemente — impossível manter foco",
        emocao: "instabilidade",
        peso: 2,
        florais: ["Scleranthus", "Clematis"]
      },
      {
        texto: "Geram indecisão — fico sem saber o que fazer",
        emocao: "indecisao",
        peso: 3,
        florais: ["Cerato", "Scleranthus", "Wild Oat"]
      },
      {
        texto: "Paralisam minhas ações por medo de errar",
        emocao: "bloqueio",
        peso: 3,
        florais: ["Hornbeam", "Larch", "Pine"]
      }
    ]
  },
  {
    id: 4,
    tipo: "gatilho",
    pergunta: "O que mais te desestabiliza atualmente?",
    opcoes: [
      {
        // CORRIGIDO: Cherry Plum sozinho era impreciso — adicionado Rock Rose e Elm
        texto: "Sensação de perder o controle — da mente ou da situação",
        emocao: "controle",
        peso: 3,
        florais: ["Cherry Plum", "Rock Rose", "Elm"]
      },
      {
        texto: "Excesso de responsabilidade que não para de crescer",
        emocao: "sobrecarga",
        peso: 3,
        florais: ["Elm", "Oak"]
      },
      {
        texto: "Situações do passado que ainda me afetam",
        emocao: "passado",
        peso: 2,
        florais: ["Honeysuckle", "Star of Bethlehem"]
      },
      {
        texto: "Medo do que pode acontecer no futuro",
        emocao: "ansiedade",
        peso: 3,
        florais: ["Aspen", "Mimulus"]
      },
      {
        texto: "Relações com outras pessoas que me drenam",
        emocao: "relacoes",
        peso: 2,
        florais: ["Holly", "Chicory", "Centaury"]
      }
    ]
  },
  {
    id: 5,
    tipo: "defesa",
    pergunta: "Quando algo te desestabiliza, você tende a:",
    opcoes: [
      {
        texto: "Tentar controlar tudo para me sentir segura",
        emocao: "controle",
        peso: 3,
        florais: ["Cherry Plum", "Rock Water"]
      },
      {
        texto: "Se afastar ou evitar o que está causando o desconforto",
        emocao: "evasao",
        peso: 2,
        florais: ["Water Violet", "Mimulus"]
      },
      {
        texto: "Se calar e guardar tudo para dentro",
        emocao: "repressao",
        peso: 2,
        florais: ["Agrimony", "Water Violet"]
      },
      {
        texto: "Se cobrar mais — como se o problema fosse sua falta de esforço",
        emocao: "autoexigencia",
        peso: 3,
        florais: ["Pine", "Larch", "Rock Water"]
      },
      {
        texto: "Reagir impulsivamente e se arrepender depois",
        emocao: "impulsividade",
        peso: 3,
        florais: ["Impatiens", "Cherry Plum"]
      }
    ]
  },
  {
    id: 6,
    tipo: "padrao",
    pergunta: "O que mais se repete na sua vida hoje?",
    opcoes: [
      {
        // CORRIGIDO: Clematis adicionado para falta de foco/conclusão
        texto: "Começo projetos e não consigo terminar",
        emocao: "inconstancia",
        peso: 3,
        florais: ["Hornbeam", "Clematis", "Wild Oat"]
      },
      {
        texto: "Assumo mais do que deveria e fico sobrecarregada",
        emocao: "sobrecarga",
        peso: 3,
        florais: ["Elm", "Oak", "Centaury"]
      },
      {
        texto: "Evito decisões importantes até não ter mais escolha",
        emocao: "indecisao",
        peso: 3,
        florais: ["Scleranthus", "Cerato", "Wild Oat"]
      },
      {
        texto: "Busco aprovação — fico insecure sem validação externa",
        emocao: "dependencia",
        peso: 3,
        florais: ["Cerato", "Centaury", "Larch"]
      },
      {
        texto: "Me saboto quando estou perto de algo bom",
        emocao: "autossabotagem",
        peso: 3,
        florais: ["Larch", "Pine", "Cherry Plum"]
      }
    ]
  },
  {
    id: 7,
    tipo: "ferida",
    pergunta: "O que mais te afeta profundamente?",
    opcoes: [
      {
        texto: "Medo de perder algo ou alguém importante",
        emocao: "medo",
        peso: 3,
        florais: ["Mimulus", "Red Chestnut", "Rock Rose"]
      },
      {
        texto: "Sentir que nunca sou suficiente",
        emocao: "baixa_autoestima",
        peso: 3,
        florais: ["Larch", "Pine"]
      },
      {
        texto: "Falta de reconhecimento pelo que faço",
        emocao: "ressentimento",
        peso: 2,
        florais: ["Willow", "Holly"]
      },
      {
        // CORRIGIDO: adicionado Chicory e Red Chestnut para cobrir a ferida completa
        texto: "Sensação de abandono ou de não pertencer",
        emocao: "abandono",
        peso: 3,
        florais: ["Star of Bethlehem", "Chicory", "Red Chestnut"]
      },
      {
        texto: "Pressão constante sem tempo para respirar",
        emocao: "pressao",
        peso: 3,
        florais: ["Elm", "Oak", "Rescue Remedy"]
      }
    ]
  },
  {
    id: 8,
    tipo: "corpo",
    pergunta: "Seu corpo tem respondido com:",
    opcoes: [
      {
        texto: "Tensão muscular constante — mandíbula, pescoço, ombros",
        emocao: "tensao",
        peso: 2,
        // CORRIGIDO: Impatiens + Rock Water para tensão muscular crônica
        florais: ["Impatiens", "Rock Water", "Vervain"]
      },
      {
        texto: "Cansaço extremo — mesmo depois de descansar",
        emocao: "exaustao",
        peso: 3,
        florais: ["Olive", "Hornbeam"]
      },
      {
        texto: "Dificuldade para dormir — mente que não para",
        emocao: "insonia",
        peso: 3,
        florais: ["White Chestnut", "Agrimony"]
      },
      {
        texto: "Agitação — ansiedade que sinto no corpo físico",
        emocao: "agitacao",
        peso: 2,
        // CORRIGIDO: Impatiens mais preciso que Vervain para agitação física
        florais: ["Impatiens", "Vervain"]
      },
      {
        texto: "Falta de energia — dificuldade de começar qualquer coisa",
        emocao: "desanimo",
        peso: 2,
        florais: ["Hornbeam", "Wild Rose", "Gentian"]
      }
    ]
  },
  {
    id: 9,
    tipo: "crenca",
    pergunta: "Qual dessas frases mais te representa hoje?",
    opcoes: [
      {
        texto: "Eu preciso dar conta de tudo sozinha",
        emocao: "sobrecarga",
        peso: 3,
        florais: ["Elm", "Oak", "Rock Water"]
      },
      {
        // CORRIGIDO: Pine adicionado para diferenciar crença de culpa vs falta de confiança (Larch)
        texto: "Eu não sou suficiente e tenho medo de decepcionar",
        emocao: "baixa_autoestima",
        peso: 3,
        florais: ["Pine", "Larch"]
      },
      {
        texto: "Algo sempre vai dar errado — nunca consigo manter o bom",
        emocao: "desanimo",
        peso: 2,
        florais: ["Gentian", "Sweet Chestnut"]
      },
      {
        texto: "Eu não posso errar — a perfeição é o mínimo esperado",
        emocao: "perfeccionismo",
        peso: 3,
        florais: ["Rock Water", "Pine"]
      },
      {
        texto: "Ninguém realmente me entende ou me vê",
        emocao: "solidao",
        peso: 2,
        florais: ["Heather", "Water Violet", "Agrimony"]
      }
    ]
  },
  {
    id: 10,
    tipo: "expansao",
    pergunta: "O que você mais precisa neste momento?",
    opcoes: [
      {
        texto: "Paz mental — que os pensamentos parem",
        emocao: "calma",
        // CORRIGIDO: peso 2 (era 1) para que florais de expansão entrem na fórmula
        peso: 2,
        florais: ["White Chestnut", "Agrimony"]
      },
      {
        texto: "Clareza — saber exatamente o que fazer",
        emocao: "clareza",
        peso: 2,
        florais: ["Scleranthus", "Wild Oat", "Cerato"]
      },
      {
        texto: "Segurança — sentir que estou protegida",
        emocao: "seguranca",
        peso: 2,
        florais: ["Aspen", "Mimulus", "Rock Rose"]
      },
      {
        texto: "Coragem — para dar o passo que sei que preciso dar",
        emocao: "coragem",
        peso: 2,
        florais: ["Mimulus", "Larch", "Centaury"]
      },
      {
        texto: "Leveza — parar de me cobrar tanto",
        emocao: "leveza",
        peso: 2,
        florais: ["Agrimony", "Pine", "Mustard"]
      }
    ]
  },
  {
    id: 11,
    tipo: "relacional",
    // NOVO: pergunta para capturar Holly, Willow, Honeysuckle — antes ausentes
    pergunta: "Quando pensa em pessoas próximas, o que mais sente?",
    opcoes: [
      {
        texto: "Raiva ou ressentimento de algo que não foi resolvido",
        emocao: "raiva",
        peso: 3,
        florais: ["Holly", "Willow"]
      },
      {
        texto: "Ciúme ou sensação de não ser prioridade",
        emocao: "ciume",
        peso: 3,
        florais: ["Holly", "Chicory"]
      },
      {
        texto: "Saudade intensa ou apego a uma fase passada",
        emocao: "saudade",
        peso: 2,
        florais: ["Honeysuckle", "Star of Bethlehem"]
      },
      {
        texto: "Preocupação excessiva com o bem-estar de quem amo",
        emocao: "preocupacao",
        peso: 2,
        florais: ["Red Chestnut", "Chicory"]
      },
      {
        texto: "Prefiro não pensar nisso — guardo tudo para mim",
        emocao: "repressao_relacional",
        peso: 2,
        florais: ["Agrimony", "Water Violet"]
      }
    ]
  }
];
