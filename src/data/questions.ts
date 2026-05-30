export interface Option {
  text: string;
  arcanos: { nome: string; peso: number }[]; // cada resposta pesa em múltiplos arcanos
}

export interface Question {
  id: number;
  question: string;
  options: Option[];
}

export const questions: Question[] = [
  {
    id: 1,
    question: "Quando algo começa a sair do seu controle, sua primeira reação costuma ser:",
    options: [
      { text: "Tentar reorganizar tudo rapidamente.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Carro", peso: 2 }] },
      { text: "Sentir que precisa sustentar a situação sozinha.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Forca", peso: 2 }] },
      { text: "Observar em silêncio antes de agir.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Evitar olhar para o problema imediatamente.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Enforcado", peso: 2 }] }
    ]
  },
  {
    id: 2,
    question: "O que mais te trava quando precisa tomar uma decisão importante?",
    options: [
      { text: "Medo de escolher errado.", arcanos: [{ nome: "Enamorados", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Necessidade de ter certeza absoluta.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Medo de perder estabilidade.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Diabo", peso: 2 }] },
      { text: "Sensação de que ainda não está pronta.", arcanos: [{ nome: "Mundo", peso: 2 }, { nome: "Enforcado", peso: 2 }] }
    ]
  },
  {
    id: 3,
    question: "Nos vínculos afetivos, você tende a:",
    options: [
      { text: "Se adaptar para manter a harmonia.", arcanos: [{ nome: "Temperanca", peso: 2 }, { nome: "Enamorados", peso: 2 }] },
      { text: "Dar mais do que recebe.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Forca", peso: 2 }] },
      { text: "Proteger-se antes de confiar.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Buscar clareza direta sobre o que está acontecendo.", arcanos: [{ nome: "Justica", peso: 2 }, { nome: "Mago", peso: 2 }] }
    ]
  },
  {
    id: 4,
    question: "Quando o dinheiro entra, você geralmente:",
    options: [
      { text: "Já pensa nas responsabilidades.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Sente alívio, mas logo volta a se preocupar.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Roda da Fortuna", peso: 2 }] },
      { text: "Deseja usar para cuidar de todos.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Hierofante", peso: 2 }] },
      { text: "Sente vontade de expandir e realizar algo.", arcanos: [{ nome: "Sol", peso: 2 }, { nome: "Mago", peso: 2 }] }
    ]
  },
  {
    id: 5,
    question: "Quando pensa em sucesso, o que aparece primeiro?",
    options: [
      { text: "Mais cobrança.", arcanos: [{ nome: "Justica", peso: 2 }, { nome: "Imperador", peso: 2 }] },
      { text: "Mais exposição.", arcanos: [{ nome: "Sol", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Mais responsabilidade.", arcanos: [{ nome: "Forca", peso: 2 }, { nome: "Imperatriz", peso: 2 }] },
      { text: "Mais liberdade.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Mundo", peso: 2 }] }
    ]
  },
  {
    id: 6,
    question: "Diante de uma crise, você costuma:",
    options: [
      { text: "Agir rápido para resolver.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Mago", peso: 2 }] },
      { text: "Paralisar e esperar clarear.", arcanos: [{ nome: "Enforcado", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Assumir o peso emocional do ambiente.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Forca", peso: 2 }] },
      { text: "Cortar o que não faz mais sentido.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Torre", peso: 2 }] }
    ]
  },
  {
    id: 7,
    question: "Qual frase mais se aproxima do seu padrão interno?",
    options: [
      { text: "Se eu não fizer, ninguém faz.", arcanos: [{ nome: "Forca", peso: 2 }, { nome: "Imperatriz", peso: 2 }] },
      { text: "Se eu relaxar, algo pode dar errado.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Preciso entender antes de agir.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Preciso mudar, mas não sei por onde.", arcanos: [{ nome: "Roda da Fortuna", peso: 2 }, { nome: "Julgamento", peso: 2 }] }
    ]
  },
  {
    id: 8,
    question: "Quando algo termina, você tende a:",
    options: [
      { text: "Resistir até ter certeza.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Enforcado", peso: 2 }] },
      { text: "Tentar manter tudo em equilíbrio.", arcanos: [{ nome: "Temperanca", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Sentir medo do vazio.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Diabo", peso: 2 }] },
      { text: "Ver possibilidade de recomeço.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Estrela", peso: 2 }] }
    ]
  },
  {
    id: 9,
    question: "Sua relação com sua própria força costuma ser:",
    options: [
      { text: "Eu aguento muito, mesmo cansada.", arcanos: [{ nome: "Forca", peso: 2 }, { nome: "Imperatriz", peso: 2 }] },
      { text: "Eu preciso provar que dou conta.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Eu escondo minha força até me sentir segura.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Eu avanço quando sinto impulso.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Louco", peso: 2 }] }
    ]
  },
  {
    id: 10,
    question: "O que mais drena sua energia?",
    options: [
      { text: "Tentar controlar tudo.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Diabo", peso: 2 }] },
      { text: "Cuidar de todos.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Hierofante", peso: 2 }] },
      { text: "Pensar demais.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Ficar presa em ciclos.", arcanos: [{ nome: "Roda da Fortuna", peso: 2 }, { nome: "Enforcado", peso: 2 }] }
    ]
  },
  {
    id: 11,
    question: "Quando recebe uma oportunidade, você:",
    options: [
      { text: "Planeja tudo antes de aceitar.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Duvida se merece.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Sente entusiasmo e medo ao mesmo tempo.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Roda da Fortuna", peso: 2 }] },
      { text: "Tenta entender se está alinhada com seus valores.", arcanos: [{ nome: "Hierofante", peso: 2 }, { nome: "Enamorados", peso: 2 }] }
    ]
  },
  {
    id: 12,
    question: "Sua dificuldade com ação está mais ligada a:",
    options: [
      { text: "Medo de errar.", arcanos: [{ nome: "Justica", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Excesso de possibilidades.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Enamorados", peso: 2 }] },
      { text: "Cansaço acumulado.", arcanos: [{ nome: "Forca", peso: 2 }, { nome: "Enforcado", peso: 2 }] },
      { text: "Falta de direção clara.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Estrela", peso: 2 }] }
    ]
  },
  {
    id: 13,
    question: "Quando se sente insegura, você costuma:",
    options: [
      { text: "Buscar respostas externas.", arcanos: [{ nome: "Hierofante", peso: 2 }, { nome: "Estrela", peso: 2 }] },
      { text: "Se fechar emocionalmente.", arcanos: [{ nome: "Eremita", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Tentar controlar o ambiente.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Diabo", peso: 2 }] },
      { text: "Fazer mais para compensar.", arcanos: [{ nome: "Mago", peso: 2 }, { nome: "Forca", peso: 2 }] }
    ]
  },
  {
    id: 14,
    question: "Na sua história, você sente que precisou aprender cedo a:",
    options: [
      { text: "Ser forte.", arcanos: [{ nome: "Forca", peso: 2 }, { nome: "Imperador", peso: 2 }] },
      { text: "Cuidar.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Hierofante", peso: 2 }] },
      { text: "Observar.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Se proteger.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Torre", peso: 2 }] }
    ]
  },
  {
    id: 15,
    question: "Seu corpo parece pedir mais:",
    options: [
      { text: "Descanso.", arcanos: [{ nome: "Temperanca", peso: 2 }, { nome: "Enforcado", peso: 2 }] },
      { text: "Movimento.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Sol", peso: 2 }] },
      { text: "Acolhimento.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Estrela", peso: 2 }] },
      { text: "Liberação.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Torre", peso: 2 }] }
    ]
  },
  {
    id: 16,
    question: "Quando pensa em mudar de vida, o que surge?",
    options: [
      { text: "Preciso estruturar melhor.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Mundo", peso: 2 }] },
      { text: "Preciso me libertar.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Morte", peso: 2 }] },
      { text: "Preciso confiar mais.", arcanos: [{ nome: "Estrela", peso: 2 }, { nome: "Temperanca", peso: 2 }] },
      { text: "Preciso parar de repetir ciclos.", arcanos: [{ nome: "Roda da Fortuna", peso: 2 }, { nome: "Julgamento", peso: 2 }] }
    ]
  },
  {
    id: 17,
    question: "O que você mais evita encarar?",
    options: [
      { text: "A verdade de uma situação.", arcanos: [{ nome: "Torre", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Uma escolha necessária.", arcanos: [{ nome: "Enamorados", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Um fim inevitável.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Seu próprio desejo.", arcanos: [{ nome: "Diabo", peso: 2 }, { nome: "Sol", peso: 2 }] }
    ]
  },
  {
    id: 18,
    question: "Quando se compara com outras pessoas, você sente:",
    options: [
      { text: "Que deveria estar mais avançada.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Que precisa provar valor.", arcanos: [{ nome: "Sol", peso: 2 }, { nome: "Imperador", peso: 2 }] },
      { text: "Que talvez não esteja pronta.", arcanos: [{ nome: "Mundo", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Que está fora do seu tempo.", arcanos: [{ nome: "Roda da Fortuna", peso: 2 }, { nome: "Temperanca", peso: 2 }] }
    ]
  },
  {
    id: 19,
    question: "Seu maior chamado interno parece ser:",
    options: [
      { text: "Assumir direção.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Carro", peso: 2 }] },
      { text: "Criar algo seu.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Mago", peso: 2 }] },
      { text: "Escutar sua verdade.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Encerrar um ciclo.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Mundo", peso: 2 }] }
    ]
  },
  {
    id: 20,
    question: "Quando você se sente presa, o que costuma estar por trás?",
    options: [
      { text: "Medo de perder segurança.", arcanos: [{ nome: "Diabo", peso: 2 }, { nome: "Imperador", peso: 2 }] },
      { text: "Medo de decepcionar.", arcanos: [{ nome: "Hierofante", peso: 2 }, { nome: "Julgamento", peso: 2 }] },
      { text: "Medo de escolher.", arcanos: [{ nome: "Enamorados", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Medo de recomeçar.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Morte", peso: 2 }] }
    ]
  },
  {
    id: 21,
    question: "O que você busca quando procura espiritualidade?",
    options: [
      { text: "Direção.", arcanos: [{ nome: "Hierofante", peso: 2 }, { nome: "Estrela", peso: 2 }] },
      { text: "Proteção.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Sacerdotisa", peso: 2 }] },
      { text: "Cura.", arcanos: [{ nome: "Temperanca", peso: 2 }, { nome: "Estrela", peso: 2 }] },
      { text: "Confirmação.", arcanos: [{ nome: "Julgamento", peso: 2 }, { nome: "Justica", peso: 2 }] }
    ]
  },
  {
    id: 22,
    question: "Seu padrão diante do amor costuma ser:",
    options: [
      { text: "Entregar muito.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Enamorados", peso: 2 }] },
      { text: "Desconfiar antes de relaxar.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Tentar entender tudo.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Ter medo de perder liberdade.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Diabo", peso: 2 }] }
    ]
  },
  {
    id: 23,
    question: "Quando você precisa se posicionar, você:",
    options: [
      { text: "Fala com firmeza, mas depois se cobra.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Evita conflito.", arcanos: [{ nome: "Temperanca", peso: 2 }, { nome: "Enforcado", peso: 2 }] },
      { text: "Sente medo de desagradar.", arcanos: [{ nome: "Enamorados", peso: 2 }, { nome: "Hierofante", peso: 2 }] },
      { text: "Explode depois de acumular.", arcanos: [{ nome: "Torre", peso: 2 }, { nome: "Forca", peso: 2 }] }
    ]
  },
  {
    id: 24,
    question: "Qual movimento mais te cura neste momento?",
    options: [
      { text: "Organizar sua vida.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Mundo", peso: 2 }] },
      { text: "Reduzir peso.", arcanos: [{ nome: "Forca", peso: 2 }, { nome: "Temperanca", peso: 2 }] },
      { text: "Confiar na intuição.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Estrela", peso: 2 }] },
      { text: "Romper padrões.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Torre", peso: 2 }] }
    ]
  },
  {
    id: 25,
    question: "O que mais te sabota?",
    options: [
      { text: "Controle excessivo.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Diabo", peso: 2 }] },
      { text: "Autossacrifício.", arcanos: [{ nome: "Enforcado", peso: 2 }, { nome: "Imperatriz", peso: 2 }] },
      { text: "Confusão emocional.", arcanos: [{ nome: "Lua", peso: 2 }, { nome: "Sacerdotisa", peso: 2 }] },
      { text: "Impulsividade.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Carro", peso: 2 }] }
    ]
  },
  {
    id: 26,
    question: "Quando algo dá certo, você:",
    options: [
      { text: "Sente alegria, mas teme perder.", arcanos: [{ nome: "Sol", peso: 2 }, { nome: "Lua", peso: 2 }] },
      { text: "Aumenta a cobrança.", arcanos: [{ nome: "Justica", peso: 2 }, { nome: "Imperador", peso: 2 }] },
      { text: "Pensa no próximo passo.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Mago", peso: 2 }] },
      { text: "Tem dificuldade de reconhecer sua conquista.", arcanos: [{ nome: "Mundo", peso: 2 }, { nome: "Julgamento", peso: 2 }] }
    ]
  },
  {
    id: 27,
    question: "Seu maior desafio hoje é sustentar:",
    options: [
      { text: "Direção.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Imperador", peso: 2 }] },
      { text: "Prazer e abundância.", arcanos: [{ nome: "Imperatriz", peso: 2 }, { nome: "Sol", peso: 2 }] },
      { text: "Confiança.", arcanos: [{ nome: "Estrela", peso: 2 }, { nome: "Temperanca", peso: 2 }] },
      { text: "Transformação.", arcanos: [{ nome: "Morte", peso: 2 }, { nome: "Julgamento", peso: 2 }] }
    ]
  },
  {
    id: 28,
    question: "O que sua alma parece estar pedindo?",
    options: [
      { text: "Coragem para começar.", arcanos: [{ nome: "Louco", peso: 2 }, { nome: "Mago", peso: 2 }] },
      { text: "Maturidade para concluir.", arcanos: [{ nome: "Mundo", peso: 2 }, { nome: "Justica", peso: 2 }] },
      { text: "Silêncio para escutar.", arcanos: [{ nome: "Sacerdotisa", peso: 2 }, { nome: "Eremita", peso: 2 }] },
      { text: "Força para romper.", arcanos: [{ nome: "Torre", peso: 2 }, { nome: "Morte", peso: 2 }] }
    ]
  },
  {
    id: 29,
    question: "Se você parasse de repetir o padrão atual, o que mudaria primeiro?",
    options: [
      { text: "Minha forma de decidir.", arcanos: [{ nome: "Justica", peso: 2 }, { nome: "Enamorados", peso: 2 }] },
      { text: "Minha relação com dinheiro.", arcanos: [{ nome: "Imperador", peso: 2 }, { nome: "Diabo", peso: 2 }] },
      { text: "Minha relação comigo.", arcanos: [{ nome: "Sol", peso: 2 }, { nome: "Estrela", peso: 2 }] },
      { text: "Minha coragem de agir.", arcanos: [{ nome: "Carro", peso: 2 }, { nome: "Mago", peso: 2 }] }
    ]
  },
  {
    id: 30,
    question: "Para ocupar seu lugar, você sente que precisa:",
    options: [
      { text: "Estruturar sua base.", arcanos: [{ nome: "Imperador", peso: 3 }, { nome: "Mundo", peso: 3 }] },
      { text: "Confiar no próprio caminho.", arcanos: [{ nome: "Estrela", peso: 3 }, { nome: "Louco", peso: 3 }] },
      { text: "Encerrar o que pesa.", arcanos: [{ nome: "Morte", peso: 3 }, { nome: "Torre", peso: 3 }] },
      { text: "Assumir sua verdade.", arcanos: [{ nome: "Julgamento", peso: 3 }, { nome: "Sol", peso: 3 }] }
    ]
  }
];
