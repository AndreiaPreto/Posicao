import React from 'react';
import { motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import { useNavigate } from 'react-router-dom';
import { Check, Music, Users, Calendar } from 'lucide-react';

const AssinaturaClube = () => {
  const { simulatePurchase } = useAccess();
  const navigate = useNavigate();

  const handleSubscribe = () => {
    // Redirect to main page with buy parameter to trigger checkout
    navigate('/diagnostico?buy=clube');
  };

  return (
    <div className="container min-h-screen flex flex-col gap-8 py-12">
      <header className="text-center space-y-4">
        <h2 className="serif text-3xl text-gold-light">Clube POSIÇÃO</h2>
        <p className="text-text-main/80">
          Seu acesso às meditações está pausado. Renove sua assinatura para continuar acessando as práticas semanais.
        </p>
      </header>

      <div className="card space-y-6 relative overflow-hidden">
        <div className="absolute top-0 right-0 bg-gold-main text-deep-black px-4 py-1 text-[10px] font-bold uppercase tracking-widest transform rotate-45 translate-x-4 translate-y-2">
          Recomendado
        </div>

        <div className="space-y-2">
          <span className="text-gold-main text-xs uppercase tracking-widest font-bold">Plano Mensal</span>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gold-light">R$ 47,00</span>
            <span className="text-text-main/40 text-sm">/mês</span>
          </div>
        </div>

        <ul className="space-y-4 text-sm">
          {[
            { icon: Music, text: "Meditações semanais exclusivas" },
            { icon: Calendar, text: "Biblioteca completa de práticas" },
            { icon: Users, text: "Comunidade de alinhamento" }
          ].map((item, i) => (
            <li key={i} className="flex items-center gap-3 text-text-main/70">
              <item.icon size={18} className="text-gold-main shrink-0" />
              {item.text}
            </li>
          ))}
        </ul>

        <button 
          onClick={handleSubscribe}
          className="btn-primary"
        >
          Renovar assinatura
        </button>
      </div>

      <div className="flex flex-col gap-4">
        <p className="text-center text-xs text-text-main/40">
          Cancele a qualquer momento sem taxas.
        </p>
        <button 
          onClick={() => navigate('/')}
          className="text-gold-main/60 text-xs uppercase tracking-widest hover:text-gold-main transition-colors"
        >
          Voltar ao início
        </button>
      </div>
    </div>
  );
};

export default AssinaturaClube;
