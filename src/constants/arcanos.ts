export interface ArcanoData {
  arcano: string;
  numero: number;
  simbolo: string;
  sombra: string[];
  dom: string;
  ferida: string;
  direcao: string;
  evolucao: string[];
  mensagem: string;         // texto exibido no resultado do diagnóstico
  florais: string[];        // florais de Bach sugeridos
  reprogramacao: string;    // foco sugerido para a Reprogramação Pessoal
}

export const ARCANOS_MATRIZ: ArcanoData[] = [
  {
    arcano: "Louco",
    numero: 0,
    simbolo: "🌀",
    sombra: ["Fuga", "Dispersão", "Impulsividade", "Dificuldade de sustentar escolhas"],
    dom: "Liberdade, abertura, espontaneidade e coragem para iniciar.",
    ferida: "Medo de se comprometer e perder a liberdade",
    direcao: "Você não precisa fugir para se sentir livre. Direção também é liberdade.",
    evolucao: ["Mago", "Imperador"],
    mensagem: "Você está num momento de transição — cheio de potencial mas sem ancoramento. Sua alma pede movimento, mas seu sistema ainda não sabe para onde. O trabalho agora é criar direção sem perder a espontaneidade que é seu maior dom.",
    florais: ["Wild Oat", "Cerato", "Scleranthus"],
    reprogramacao: "Ancoramento e clareza de propósito sem perda de liberdade"
  },
  {
    arcano: "Mago",
    numero: 1,
    simbolo: "✦",
    sombra: ["Controle mental", "Manipulação", "Excesso de estratégia", "Ansiedade por resultado"],
    dom: "Ação, comunicação, iniciativa e poder de materialização.",
    ferida: "Usa o poder externo para compensar insegurança interna",
    direcao: "Seu poder cresce quando sua ação nasce da presença, não da pressa.",
    evolucao: ["Sacerdotisa", "Temperanca"],
    mensagem: "Você tem talento e ferramentas — mas algo impede você de usá-los com plena confiança. Sua energia está direcionada para fora enquanto a resposta está dentro. Quando você para de manipular o ambiente para se sentir segura, sua magia real emerge.",
    florais: ["Cerato", "Larch", "Rock Water"],
    reprogramacao: "Confiança na própria capacidade de manifestar sem precisar controlar"
  },
  {
    arcano: "Sacerdotisa",
    numero: 2,
    simbolo: "🌙",
    sombra: ["Dúvida", "Isolamento", "Passividade", "Excesso de análise"],
    dom: "Intuição, escuta interna, profundidade e sabedoria silenciosa.",
    ferida: "Guarda tanto que ninguém a conhece de verdade",
    direcao: "Sua intuição não precisa te paralisar. Ela pode te orientar em movimento.",
    evolucao: ["Imperatriz", "Estrela"],
    mensagem: "Você sente muito mais do que demonstra. Sua intuição é precisa — mas o medo de não ser compreendida faz você guardar seus insights para si. O caminho agora é aprender a confiar na sua percepção e expressá-la sem pedir permissão.",
    florais: ["Water Violet", "Agrimony", "Mimulus"],
    reprogramacao: "Abertura para expressão da voz interior sem medo de julgamento"
  },
  {
    arcano: "Imperatriz",
    numero: 3,
    simbolo: "🌸",
    sombra: ["Excesso de doação", "Carência", "Apego", "Dificuldade de limites"],
    dom: "Criação, nutrição, abundância, prazer e fertilidade de ideias.",
    ferida: "Confunde cuidar com controlar; precisa de amor externo para se sentir inteira",
    direcao: "Nutrir não significa se esvaziar. Receber também é parte da criação.",
    evolucao: ["Imperador", "Forca"],
    mensagem: "Você tem uma capacidade enorme de cuidar e nutrir os outros — mas esquece de incluir a si mesma nesse cuidado. Sua plenitude não depende de ser amada; ela vem de dentro. Quando você se torna sua própria fonte de amor, tudo ao redor floresce.",
    florais: ["Chicory", "Red Chestnut", "Heather"],
    reprogramacao: "Amor próprio como fonte primária — cuidar sem se perder"
  },
  {
    arcano: "Imperador",
    numero: 4,
    simbolo: "⚔️",
    sombra: ["Rigidez", "Controle excessivo", "Medo de perder autoridade", "Inflexibilidade"],
    dom: "Estrutura, direção, leadership, ordem e estabilidade.",
    ferida: "Usa o controle para disfarçar o medo de ser vulnerável",
    direcao: "Estrutura sustenta. Controle aprisiona.",
    evolucao: ["Sacerdotisa", "Temperanca"],
    mensagem: "Você construiu uma armadura eficiente — organização, controle, autoridade. Mas por dentro há uma exaustão de nunca poder descansar, nunca poder errar. Sua força real não está na rigidez: está na capacidade de confiar sem precisar controlar tudo.",
    florais: ["Vervain", "Rock Water", "Oak"],
    reprogramacao: "Flexibilidade interna — confiar no processo sem precisar controlar o resultado"
  },
  {
    arcano: "Hierofante",
    numero: 5,
    simbolo: "📜",
    sombra: ["Culpa", "Rigidez moral", "Dependência de aprovação externa", "Dogmatismo"],
    dom: "Valores, tradição, orientação, ensino e pertencimento espiritual.",
    ferida: "Vive segundo regras que nunca questionou — família, religião, sociedade",
    direcao: "Honrar valores não significa abandonar sua própria verdade.",
    evolucao: ["Enamorados", "Mago"],
    mensagem: "Você carrega crenças que não são suas — são da sua família, da sua religião, da sociedade. Essas crenças criaram uma gaiola que parece segurança. O trabalho agora é questionar: isso é o que eu acredito ou o que me ensinaram a acreditar?",
    florais: ["Rock Water", "Pine", "Centaury"],
    reprogramacao: "Desconstrução de crenças herdadas e construção de verdades próprias"
  },
  {
    arcano: "Enamorados",
    numero: 6,
    simbolo: "💛",
    sombra: ["Indecisão", "Dependência afetiva", "Conflito interno", "Medo de escolher"],
    dom: "Escolha consciente, vínculo, amor, integração e alinhamento de valores.",
    ferida: "Tem medo de fazer escolhas porque isso implica perder outras possibilidades",
    direcao: "Escolher é assumir um lugar. Não escolher também é uma escolha.",
    evolucao: ["Imperador", "Justica"],
    mensagem: "Você vive num estado de quase-escolha — está sempre entre dois caminhos, duas pessoas, duas versões de si mesma. Essa indecisão não é falta de inteligência: é medo de se comprometer com quem você é. Escolher é o maior ato de amor que você pode fazer por si mesma.",
    florais: ["Scleranthus", "Cerato", "Wild Oat"],
    reprogramacao: "Confiança na própria escolha — decidir como ato de amor próprio"
  },
  {
    arcano: "Carro",
    numero: 7,
    simbolo: "🚀",
    sombra: ["Pressa", "Agressividade", "Fuga pela ação", "Dificuldade de pausar"],
    dom: "Movimento, conquista, direção, avanço e foco.",
    ferida: "Usa a ação como fuga do que não quer sentir",
    direcao: "Avançar não é correr. É saber para onde sua energia está indo.",
    evolucao: ["Temperanca", "Forca"],
    mensagem: "Você age — e isso é um dom. Mas sua energia está tão voltada para fora que você perdeu contato com o que está dentro. A velocidade que você usa para avançar é la mesma que usa para não sentir. Quando você para e olha para dentro, a direção fica clara.",
    florais: ["Vervain", "Impatiens", "Cherry Plum"],
    reprogramacao: "Ação com consciência — mover-se a partir da clareza, não da fuga"
  },
  {
    arcano: "Forca",
    numero: 8,
    simbolo: "🦁",
    sombra: ["Resistência", "Repressão emocional", "Tentar aguentar tudo", "Orgulho silencioso"],
    dom: "Coragem, autocontrole, presença, vitalidade e domínio interno.",
    ferida: "Reprime emoções por acreditar que senti-las é perigoso ou fraco",
    direcao: "Força real não é suportar tudo. É acolher sem se abandonar.",
    evolucao: ["Temperanca", "Imperatriz"],
    mensagem: "Você tem uma força enorme — mas gasta boa parte dela contendo o que sente. A cena que seu arcano mostra é alguém domando uma fera — mas essa fera é você mesma, e ela não precisa ser domada, precisa ser compreendida. Sua força real é a de sentir tudo sem ser varrida.",
    florais: ["Agrimony", "Cherry Plum", "Pine"],
    reprogramacao: "Permissão para sentir — integrar a emoção sem repressão ou explosão"
  },
  {
    arcano: "Eremita",
    numero: 9,
    simbolo: "🕯️",
    sombra: ["Isolamento", "Frieza emocional", "Afastamento excessivo", "Medo de confiar"],
    dom: "Sabedoria, introspecção, maturidade, estudo e discernimento.",
    ferida: "Usa o isolamento para se proteger de decepções",
    direcao: "O silêncio pode revelar, mas não precisa virar solidão.",
    evolucao: ["Estrela", "Imperatriz"],
    mensagem: "Você encontrou segurança na solidão — e isso tem um valor real. Mas existe uma diferença entre escolher a introspecção e precisar do isolamento para se sentir segura. O desafio agora é se abrir para conexão sem abrir mão do que você é.",
    florais: ["Water Violet", "Agrimony", "Star of Bethlehem"],
    reprogramacao: "Abertura para conexão autêntica sem perda de identidade"
  },
  {
    arcano: "Roda da Fortuna",
    numero: 10,
    simbolo: "🎡",
    sombra: ["Instabilidade", "Repetição de ciclos", "Sensação de destino", "Falta de direção"],
    dom: "Mudança, ciclos, oportunidade, adaptação e movimento natural da vida.",
    ferida: "Sente que a vida acontece para ela, não por ela",
    direcao: "Ciclos se repetem até que você mude sua posição diante deles.",
    evolucao: ["Justica", "Temperanca"],
    mensagem: "Sua vida tem uma qualidade de montanha-russa — momentos altos e baixos que parecem fora do seu controle. Isso não é azar: é um padrão de desancoramento interno. Quando você encontra sua base, os ciclos externos deixam de te varrer.",
    florais: ["Scleranthus", "Walnut", "Elm"],
    reprogramacao: "Ancoramento interno — estabilidade que independe das circunstâncias"
  },
  {
    arcano: "Justica",
    numero: 11,
    simbolo: "⚖️",
    sombra: ["Autocrítica", "Julgamento", "Rigidez", "Cobrança", "Medo de errar"],
    dom: "Equilíbrio, verdade, responsabilidade, clareza e consequência.",
    ferida: "Julga a si mesma com uma dureza que jamais aplicaria aos outros",
    direcao: "Responsabilidade sem culpa abre caminho para decisões mais livres.",
    evolucao: ["Temperanca", "Sacerdotisa"],
    mensagem: "Você tem um senso de justiça muito desenvolvido — mas ele está mais voltado para dentro do que para fora. Você se cobra de uma forma que jamais cobraria uma pessoa que ama. O trabalho agora é aplicar a mesma compaixão que você dá aos outros a si mesma.",
    florais: ["Pine", "Rock Water", "Elm"],
    reprogramacao: "Autocompaixão — trocar a cobrança pela compreensão de si mesma"
  },
  {
    arcano: "Enforcado",
    numero: 12,
    simbolo: "🌀",
    sombra: ["Paralisia", "Vitimização", "Autossacrifício", "Dificuldade de agir"],
    dom: "Entrega, pausa, nova perspectiva, rendição e ressignificação.",
    ferida: "Espera ser salva ou que as coisas mudem por si sós",
    direcao: "Pausar pode curar. Permanecer suspensa por medo, não.",
    evolucao: ["Morte", "Carro"],
    mensagem: "Você está suspensa — entre o que era e o que poderia ser. Parece que está esperando que algo mude sem tomar a decisão que sabe que precisa tomar. A posição do Enforcado é desconfortável por design: ela força uma mudança de perspectiva que libera o que está preso.",
    florais: ["Wild Rose", "Hornbeam", "Cerato"],
    reprogramacao: "Passagem da espera passiva para a rendição ativa que transforma"
  },
  {
    arcano: "Morte",
    numero: 13,
    simbolo: "🌑",
    sombra: ["Resistência ao fim", "Apego", "Medo de mudança", "Prolongamento do desgaste"],
    dom: "Transformação, encerramento, libertação e renascimento.",
    ferida: "Se apega ao que já se foi porque teme o que pode vir",
    direcao: "Algumas portas só abrem quando você aceita encerrar ciclos.",
    evolucao: ["Temperanca", "Estrela"],
    mensagem: "Há algo na sua vida que já acabou — mas você ainda não fechou. Pode ser um relacionamento, uma versão de si mesma, uma crença. Esse arcano não fala de morte literal: fala de transformação radical. O que precisa ser enterrado para que algo novo possa nascer?",
    florais: ["Walnut", "Honeysuckle", "Wild Rose"],
    reprogramacao: "Fechamento de ciclos — permissão para deixar ir o que já cumpriu seu papel"
  },
  {
    arcano: "Temperanca",
    numero: 14,
    simbolo: "✨",
    sombra: ["Adiar decisões", "Suavizar demais", "Evitar conflito", "Excesso de espera"],
    dom: "Harmonia, cura, equilíbrio, integração e ritmo consciente.",
    ferida: "Vai de extremo a extremo sem encontrar o meio",
    direcao: "Equilíbrio não é evitar movimento. É mover-se sem se perder.",
    evolucao: ["Sol", "Mundo"],
    mensagem: "Você vive em extremos — muito ou nada, tudo ou ausência. A Temperança mostra duas taças sendo mescladas: não é sobre escolher uma ou outra. É sobre integrar. Seu trabalho agora é encontrar o espaço do meio onde as suas partes opostas coexistem em paz.",
    florais: ["Scleranthus", "Impatiens", "Water Violet"],
    reprogramacao: "Integração de polaridades internas — equilíbrio sem supressão"
  },
  {
    arcano: "Diabo",
    numero: 15,
    simbolo: "⛓️",
    sombra: ["Apego", "Compulsão", "Vícios emocionais", "Dependência", "Autossabotagem"],
    dom: "Consciência dos desejos, força instintiva, materialidade e poder pessoal.",
    ferida: "Está presa a algo ou alguém que sabe que não faz bem, mas não consegue soltar",
    direcao: "O que te prende também revela onde sua energia está sendo capturada.",
    evolucao: ["Torre", "Forca"],
    mensagem: "Há uma corrente que você mesma pode soltar — mas ainda não quer. O Diabo não é uma força externa: é la parte de você que prefere o conhecido doloroso ao desconhecido libertador. Reconhecer que a corrente está solta é o primeiro passo para escolher tirá-la.",
    florais: ["Agrimony", "Centaury", "Crab Apple"],
    reprogramacao: "Reconhecimento e integração da sombra — liberdade através da responsabilidade"
  },
  {
    arcano: "Torre",
    numero: 16,
    simbolo: "⚡",
    sombra: ["Crise", "Resistência à mudança", "Colapso", "Medo de perder estruturas falsas"],
    dom: "Ruptura libertadora, verdade, quebra de ilusões e reconstrução.",
    ferida: "Passa por rupturas repetidas sem integrar a mensagem",
    direcao: "Nem toda queda é punição. Às vezes é libertação daquilo que não sustenta mais.",
    evolucao: ["Estrela", "Mundo"],
    mensagem: "Algo está prestes a cair — ou já caiu. A Torre representa aquilo que foi construído sobre base frágil. Sua queda não é punição: é o sistema te mostrando o que precisava ser liberado. A pergunta não é por que isso aconteceu, mas o que você pode construir agora, sobre uma base real.",
    florais: ["Star of Bethlehem", "Rock Rose", "Walnut"],
    reprogramacao: "Reestruturação após ruptura — reconstruir com alicerces verdadeiros"
  },
  {
    arcano: "Estrela",
    numero: 17,
    simbolo: "⭐",
    sombra: ["Idealização", "Espera passiva", "Fuga pela fantasia", "Desconexão prática"],
    dom: "Esperança, inspiração, cura, fé e reconexão com o propósito.",
    ferida: "Teme que sua sensibilidade seja uma fraqueza",
    direcao: "Esperança precisa de chão para virar caminho.",
    evolucao: ["Sol", "Imperatriz"],
    mensagem: "Você tem uma sensibilidade rara — e às vezes isso parece um fardo. A Estrela aparece depois da Torre: ela é a esperança que surge quando o pior já passou. Você ainda está se recuperando, mas há uma luz genuína que começa a aparecer. Sua ferida é exatamente o lugar onde sua cura acontece.",
    florais: ["Larch", "Mimulus", "Star of Bethlehem"],
    reprogramacao: "Transformar sensibilidade em força — autoconfiança após a ruptura"
  },
  {
    arcano: "Lua",
    numero: 18,
    simbolo: "🌕",
    sombra: ["Medo", "Confusão", "Ilusão", "Ansiedade", "Projeções emocionais"],
    dom: "Sensibilidade, inconsciente, sonhos, percepção sutil e imaginação.",
    ferida: "Vive assombrada por medos que não consegue nomear",
    direcao: "Nem todo medo é aviso. Às vezes é memória pedindo acolhimento.",
    evolucao: ["Sol", "Sacerdotisa"],
    mensagem: "Você está num momento de névoa — onde as coisas não são o que parecem e o medo toma formas que não têm nome. A Lua é o arcano do inconsciente à flor da pele. Seu trabalho não é eliminar a confusão, mas aprender a caminhar com ela até que a clareza chegue naturalmente.",
    florais: ["Aspen", "Mimulus", "Red Chestnut"],
    reprogramacao: "Iluminação do inconsciente — nomear and dissolver os medos sem nome"
  },
  {
    arcano: "Sol",
    numero: 19,
    simbolo: "☀️",
    sombra: ["Necessidade de reconhecimento", "Exposição excessiva", "Medo de perder brilho"],
    dom: "Vitalidade, clareza, autoestima, alegria e expansão.",
    ferida: "Condiciona seu brilho à aprovação dos outros",
    direcao: "Brilhar não exige provar valor. Exige sustentar presença.",
    evolucao: ["Mundo", "Imperador"],
    mensagem: "Você tem um brilho real — mas ainda está esperando que alguém o valide para acreditar nele. O Sol não precisa de permissão para brilhar. Seu trabalho agora é descobrir como você brilha quando ninguém está olhando — e perceber que essa é a versão mais real de você.",
    florais: ["Larch", "Centaury", "Cerato"],
    reprogramacao: "Brilho autêntico — expressão de si mesmo independente da validação externa"
  },
  {
    arcano: "Julgamento",
    numero: 20,
    simbolo: "🔔",
    sombra: ["Culpa", "Cobrança", "Medo de julgamento", "Dificuldade de se perdoar"],
    dom: "Chamado interno, despertar, revisão de vida e renascimento de consciência.",
    ferida: "Vive em julgamento perpétuo de si mesma",
    direcao: "O chamado não vem para te punir. Vem para te reposicionar.",
    evolucao: ["Mundo", "Sol"],
    mensagem: "Você carrega um tribunal interno que não para. Juíza e ré ao mesmo tempo, você se condena por erros do passado que já não podem ser mudados. O Julgamento, em sua vibração positiva, é o chamado para o despertar — mas exige que você se absolva primeiro.",
    florais: ["Pine", "Willow", "Honeysuckle"],
    reprogramacao: "Autoperdão e renovação — libertar-se do tribunal interno"
  },
  {
    arcano: "Mundo",
    numero: 21,
    simbolo: "🌍",
    sombra: ["Medo de finalizar", "Sensação de não estar pronta", "Busca por perfeição"],
    dom: "Integração, realização, conclusão, pertencimento e maturidade.",
    ferida: "Teme encerrar porque não sabe o que vem depois",
    direcao: "Você não precisa estar perfeita para ocupar seu lugar.",
    evolucao: ["Louco"],
    mensagem: "Você está no limiar da completude — mas ainda não se permitiu celebrar o quanto já construiu. O Mundo é o arcano da integração: quando todas as partes se unem. Seu desafio não é conquistar mais, mas reconhecer que você já chegou em algum lugar e que este ciclo pode, finalmente, ser celebrado e encerrado.",
    florais: ["Wild Oat", "Walnut", "Honeysuckle"],
    reprogramacao: "Celebração e encerramento de ciclos — permissão para completar e recomeçar"
  }
];
