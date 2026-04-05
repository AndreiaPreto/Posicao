export interface ArcanoData {
  arcano: string;
  sombra: string[];
  evolucao: string[];
  direcao: string;
}

export const ARCANOS_MATRIZ: ArcanoData[] = [
  {
    arcano: "Louco",
    sombra: ["dispersao", "fuga", "falta_de_direcao"],
    evolucao: ["Mago", "Imperador"],
    direcao: "criar direcao e assumir responsabilidade"
  },
  {
    arcano: "Mago",
    sombra: ["controle", "manipulacao", "inseguranca"],
    evolucao: ["Sacerdotisa", "Imperador"],
    direcao: "alinhar acao com clareza interna"
  },
  {
    arcano: "Sacerdotisa",
    sombra: ["bloqueio", "passividade", "isolamento"],
    evolucao: ["Imperatriz", "Mago"],
    direcao: "expressar o que sente e confiar na propria voz"
  },
  {
    arcano: "Imperatriz",
    sombra: ["dependencia", "excesso_emocional"],
    evolucao: ["Imperador", "Forca"],
    direcao: "equilibrar emocao com estrutura"
  },
  {
    arcano: "Imperador",
    sombra: ["rigidez", "controle", "dominancia"],
    evolucao: ["Sacerdotisa", "Temperanca", "Imperatriz"],
    direcao: "soltar controle e acessar confianca interna"
  },
  {
    arcano: "Hierofante",
    sombra: ["crencas_limitantes", "dogmas"],
    evolucao: ["Enamorados", "Mago"],
    direcao: "questionar verdades antigas"
  },
  {
    arcano: "Enamorados",
    sombra: ["indecisao", "dependencia"],
    evolucao: ["Imperador", "Justica"],
    direcao: "assumir escolha consciente"
  },
  {
    arcano: "Carro",
    sombra: ["forca_excessiva", "impulsividade"],
    evolucao: ["Temperanca", "Forca"],
    direcao: "equilibrar movimento com consciencia"
  },
  {
    arcano: "Justica",
    sombra: ["autojulgamento", "rigidez"],
    evolucao: ["Temperanca", "Sacerdotisa"],
    direcao: "trocar julgamento por compreensao"
  },
  {
    arcano: "Eremita",
    sombra: ["isolamento", "afastamento"],
    evolucao: ["Estrela", "Imperatriz"],
    direcao: "se abrir sem perder sua essencia"
  },
  {
    arcano: "Roda da Fortuna",
    sombra: ["instabilidade", "falta_de_controle"],
    evolucao: ["Justica", "Temperanca"],
    direcao: "ancorar-se internamente"
  },
  {
    arcano: "Forca",
    sombra: ["repressao", "controle_interno"],
    evolucao: ["Temperanca", "Imperatriz"],
    direcao: "sentir sem reprimir"
  },
  {
    arcano: "Enforcado",
    sombra: ["paralisia", "vitimizacao"],
    evolucao: ["Morte", "Carro"],
    direcao: "soltar para transformar"
  },
  {
    arcano: "Morte",
    sombra: ["resistencia", "apego"],
    evolucao: ["Temperanca", "Estrela"],
    direcao: "permitir encerramentos"
  },
  {
    arcano: "Temperanca",
    sombra: ["desequilibrio", "oscilacao"],
    evolucao: ["Sol", "Mundo"],
    direcao: "integrar partes internas"
  },
  {
    arcano: "Diabo",
    sombra: ["dependencia", "vicios", "apego"],
    evolucao: ["Torre", "Forca"],
    direcao: "assumir responsabilidade e libertar-se"
  },
  {
    arcano: "Torre",
    sombra: ["colapso", "quebra"],
    evolucao: ["Estrela", "Mundo"],
    direcao: "reconstruir com consciencia"
  },
  {
    arcano: "Estrela",
    sombra: ["fragilidade", "inseguranca"],
    evolucao: ["Sol", "Imperatriz"],
    direcao: "confiar e se expressar"
  },
  {
    arcano: "Lua",
    sombra: ["medo", "ilusao", "confusao"],
    evolucao: ["Sol", "Justica"],
    direcao: "trazer luz ao inconsciente"
  },
  {
    arcano: "Sol",
    sombra: ["necessidade_de_validacao"],
    evolucao: ["Mundo", "Imperador"],
    direcao: "brilhar com autenticidade"
  },
  {
    arcano: "Julgamento",
    sombra: ["culpa", "autocritica"],
    evolucao: ["Mundo", "Sol"],
    direcao: "se perdoar e renascer"
  },
  {
    arcano: "Mundo",
    sombra: ["medo_de_encerrar_ciclos"],
    evolucao: ["Louco"],
    direcao: "iniciar novo ciclo com consciencia"
  }
];
