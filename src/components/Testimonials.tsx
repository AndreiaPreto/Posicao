// src/components/Testimonials.tsx - Depoimentos dos clientes da Experiência Posição
import React from 'react';
import { motion } from 'motion/react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  rating: number;
  initials: string;
  tag: string;
}

const testimonials: Testimonial[] = [
  {
    id: 'test-1',
    name: 'Camila Medeiros',
    role: 'Executiva de Tecnologia',
    text: 'O Diagnóstico de Posição foi uma virada de chave absoluta na minha vida. Sair da profunda confusão mental e enxergar com total clareza a minha estrutura de presença energética e emocional mudou de forma definitiva a maneira como tomei decisões difíceis na minha carreira corporativa.',
    rating: 5,
    initials: 'CM',
    tag: 'Diagnóstico'
  },
  {
    id: 'test-2',
    name: 'Rodrigo Fonseca',
    role: 'Empreendedor e Gestor',
    text: 'O Método Posição conseguiu integrar o aspecto sutil, energético e intuitivo com direcionamentos de ação extremamente práticos e cirúrgicos. O mapa floral e o ritual de reprogramação pessoal me concederam a estabilidade sólida que eu buscava para poder focar meus projetos empresariais com real foco.',
    rating: 5,
    initials: 'RF',
    tag: 'Método Posição'
  },
  {
    id: 'test-3',
    name: 'Juliana Seixas',
    role: 'Psicóloga e Mentora',
    text: 'A conversa pessoal e acompanhamento com a Andréia Preto me libertaram de um ciclo persistente de autonegligência e estagnação no qual eu me encontrava. Sinto que voltei a ocupar verdadeiramente o meu lugar de direito, cheia de presença, estratégia, elegância e alinhamento interno.',
    rating: 5,
    initials: 'JS',
    tag: 'Sessão Pessoal'
  },
  {
    id: 'test-4',
    name: 'Beatriz Ramos',
    role: 'Designer de Interiores',
    text: 'A participação regular nas dinâmicas de frequência e reflexões do Clube POSIÇÃO de fato recalibraram o meu dia a dia. É um espaço de acolhimento e sofisticação essencial para mentes que buscam se afastar do ruído mundano para escutar a própria essência.',
    rating: 5,
    initials: 'BR',
    tag: 'Clube'
  },
  {
    id: 'test-5',
    name: 'Marcelo Guimarães',
    role: 'Diretor de Operações',
    text: 'Mais do que uma consulta tradicional, o trabalho da Andréia representa uma verdadeira mentoria de alto impacto estratégico para o posicionamento de vida. A precisão do diagnóstico dela é cirúrgica e traz uma robusta clareza intelectual de modo imediato.',
    rating: 5,
    initials: 'MG',
    tag: 'Direcionamento'
  },
  {
    id: 'test-6',
    name: 'Tatiana Kfouri',
    role: 'Educadora e Terapeuta',
    text: 'Compreender os padrões emocionais inconscientes que travavam meus passos em direção à autonomia foi um divisor de mares. O Método Posição representa, sem exagero, o sinônimo direto de verdade íntima desvelada, desbloqueio consciente e movimento real.',
    rating: 5,
    initials: 'TK',
    tag: 'Alinhamento'
  }
];

export const Testimonials: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 30 },
    show: { 
      opacity: 1, 
      y: 0,
      transition: {
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1] as any
      }
    }
  };

  return (
    <div className="mt-32 max-w-6xl mx-auto px-6" id="testimonials-section">
      {/* Cabeçalho */}
      <div className="text-center mb-16 space-y-4">
        <span className="text-gold-main/35 text-[9px] uppercase tracking-[0.4em] block font-bold">
          Ecos do Alinhamento
        </span>
        <h2 className="serif text-4xl sm:text-5xl text-gold-light leading-tight font-serif font-medium">
          Relatos de Clareza e Presença
        </h2>
        <p className="text-white/40 text-sm max-w-xl mx-auto font-light leading-relaxed">
          Histórias reais de quem passou pelo Método Posição e reconfigurou sua base emocional, assumindo com verdade a direção de sua jornada pessoal.
        </p>
      </div>

      {/* Grid de Depoimentos */}
      <motion.div 
        variants={containerVariants}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-100px" }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        id="testimonials-grid"
      >
        {testimonials.map((test) => (
          <motion.div
            key={test.id}
            variants={itemVariants}
            className="glass-card flex flex-col justify-between p-8 relative overflow-hidden group hover:border-gold-main/30 transition-all duration-500 h-full hover:shadow-[0_15px_30px_rgba(0,0,0,0.5)] bg-gradient-to-b from-white/[0.03] to-white/[0.01]"
            id={`testimonial-card-${test.id}`}
          >
            {/* Ícone sutil no fundo */}
            <Quote className="absolute right-6 top-6 text-gold-main/[0.04] w-12 h-12 transform group-hover:scale-110 group-hover:text-gold-main/[0.07] transition-all duration-500" />
            
            <div className="space-y-6">
              {/* Tag e Estrelas */}
              <div className="flex items-center justify-between">
                <span className="text-gold-main/40 text-[9px] uppercase tracking-[0.25em] font-bold border border-gold-main/10 px-2 py-0.5 rounded-full bg-gold-main/[0.02]">
                  {test.tag}
                </span>
                
                <div className="flex items-center gap-0.5">
                  {[...Array(test.rating)].map((_, i) => (
                    <Star key={i} className="w-3 h-3 fill-gold-main text-gold-main/80" />
                  ))}
                </div>
              </div>

              {/* Texto do depoimento */}
              <p className="text-white/75 text-sm leading-relaxed font-light italic">
                "{test.text}"
              </p>
            </div>

            {/* Perfil do cliente */}
            <div className="flex items-center gap-4 pt-6 mt-6 border-t border-white/5">
              {/* Avatar Monograma */}
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-gold-main/20 to-gold-main/5 border border-gold-main/30 flex items-center justify-center text-xs tracking-wider text-gold-light font-semibold font-sans">
                {test.initials}
              </div>

              {/* Informações detalhadas */}
              <div className="text-left">
                <h4 className="text-white/90 text-sm font-semibold tracking-wide block">
                  {test.name}
                </h4>
                <p className="text-gold-main/50 text-[10px] uppercase tracking-[0.1em] font-sans">
                  {test.role}
                </p>
              </div>
            </div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
};
