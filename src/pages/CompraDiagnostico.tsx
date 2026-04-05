import React from 'react';
import { motion } from 'motion/react';
import { useAccess } from '../context/AccessContext';
import { useNavigate } from 'react-router-dom';
import { CreditCard, ShieldCheck, Sparkles } from 'lucide-react';

const CompraDiagnostico = () => {
  const { simulatePurchase } = useAccess();
  const navigate = useNavigate();

  const handlePurchase = () => {
    // Redirect to main page with buy parameter to trigger checkout
    navigate('/diagnostico?buy=diagnostico');
  };

  return (
    <div className="container min-h-screen flex flex-col gap-8 py-12">
      <header className="text-center space-y-4">
        <h2 className="serif text-3xl text-gold-light">Liberar Diagnóstico</h2>
        <p className="text-text-main/80">
          Este diagnóstico revela o arquétipo que está influenciando sua base hoje.
        </p>
      </header>

      <div className="card space-y-6">
        <div className="flex items-center justify-between border-b border-gold-main/20 pb-4">
          <span className="text-gold-light font-medium">Diagnóstico POSIÇÃO</span>
          <span className="text-2xl font-bold text-gold-main">R$ 69,00</span>
        </div>

        <ul className="space-y-3 text-sm text-text-main/70">
          <li className="flex items-center gap-2">
            <ShieldCheck size={16} className="text-gold-main" />
            Acesso vitalício ao questionário
          </li>
          <li className="flex items-center gap-2">
            <Sparkles size={16} className="text-gold-main" />
            Análise personalizada via áudio
          </li>
          <li className="flex items-center gap-2">
            <CreditCard size={16} className="text-gold-main" />
            Pagamento seguro via Stripe
          </li>
        </ul>

        <button 
          onClick={handlePurchase}
          className="btn-primary"
        >
          Liberar acesso agora
        </button>
      </div>

      <p className="text-center text-xs text-text-main/40 px-8">
        Ao clicar em liberar, você será redirecionado para o checkout seguro.
      </p>
    </div>
  );
};

export default CompraDiagnostico;
