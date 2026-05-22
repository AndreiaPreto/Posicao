import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { ARCANOS_MATRIZ, ArcanoData } from '../constants/arcanos';
import { questions } from '../data/questions';
import { triageQuestions } from '../data/triageQuestions';
import { mapeamentoQuestions } from '../data/mapeamentoQuestions';
import { auth, db } from '../services/firebase';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, getDocFromServer, serverTimestamp, updateDoc, increment, addDoc, deleteDoc } from 'firebase/firestore';
import { jsPDF } from 'jspdf';
import { useAccess } from '../context/AccessContext';
import { LogIn, UserPlus, LogOut, User as UserIcon, Play, Pause, Volume2, Clock, Music, Settings, Plus, Trash2, Upload, ShieldCheck, History, ChevronRight, Calendar, Users, BarChart3, Package, FileText, LayoutDashboard, CheckCircle, MessageCircle, ArrowRight, Tag, X, Check, CreditCard } from 'lucide-react';

interface AppUser {
  id: string;
  email?: string;
  paidStatus?: boolean;
  name?: string;
  birthDate?: string;
  whatsapp?: string;
  role?: string;
}

const meditations = [
  {
    id: 1,
    title: "Clareza Matinal",
    duration: "10:00",
    description: "Inicie seu dia limpando a névoa mental e focando no que é essencial.",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3"
  },
  {
    id: 2,
    title: "Descompressão Emocional",
    duration: "15:00",
    description: "Libere as tensões do dia e reorganize sua base vibracional.",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3"
  },
  {
    id: 3,
    title: "Sono Profundo e Alinhado",
    duration: "20:00",
    description: "Prepare seu campo para um descanso restaurador e alinhamento inconsciente.",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3"
  }
];

const rituais_mes = [
  {
    id: 1,
    date: "01 de Abril",
    title: "Ritual de Transbordo",
    phase: "Lua Cheia",
    description: "Ritual para reconhecer conquistas, liberar excessos e equilibrar emoções intensas.",
    benefits: [
      "Clareza emocional",
      "Liberação energética",
      "Expansão espiritual"
    ],
    importance: "A lua cheia amplifica energias — este ritual ajuda a canalizar essa força com consciência.",
    price: "R$ 21"
  },
  {
    id: 2,
    date: "05 de Abril",
    title: "Ritual de Renascimento",
    phase: "Páscoa",
    description: "Ritual simbólico de transformação e ativação de uma nova identidade.",
    benefits: [
      "Reprogramação emocional",
      "Abertura de novos ciclos",
      "Fortalecimento de propósito"
    ],
    importance: "A Páscoa é um portal energético ideal para renascer de forma consciente.",
    price: "R$ 21"
  },
  {
    id: 3,
    date: "09 de Abril",
    title: "Ritual de Desapego",
    phase: "Lua Minguante",
    description: "Limpeza energética e desapego de padrões, objetos e vínculos.",
    benefits: [
      "Leveza emocional",
      "Redução de bloqueios",
      "Clareza mental"
    ],
    importance: "Desapegar é essencial para permitir a entrada do novo.",
    price: "R$ 21"
  },
  {
    id: 4,
    date: "17 de Abril",
    title: "Ritual de Semeadura",
    phase: "Lua Nova",
    description: "Plantio de intenções e alinhamento energético com novos objetivos.",
    benefits: [
      "Foco e direção",
      "Ativação da manifestação",
      "Clareza de metas"
    ],
    importance: "Toda realidade começa com uma intenção bem definida.",
    price: "R$ 21"
  },
  {
    id: 5,
    date: "23 de Abril",
    title: "Ritual de Abertura de Caminhos",
    phase: "Energia Espiritual",
    spiritual: "São Jorge / Ogum",
    description: "Ritual de força, proteção e desbloqueio de caminhos.",
    benefits: ["Coragem", "Proteção", "Abertura de oportunidades"],
    importance: "Conecta intenção com ação e avanço.",
    price: "R$ 21"
  },
  {
    id: 6,
    date: "24 de Abril",
    title: "Ritual de Expansão",
    phase: "Lua Crescente",
    description: "Ação prática para sustentar e expandir intenções.",
    benefits: [
      "Disciplina",
      "Execução de objetivos",
      "Autoconfiança"
    ],
    importance: "A ação é o elo entre intenção e manifestação.",
    price: "R$ 21"
  },
  {
    id: 7,
    date: "29 de Abril",
    title: "Ritual de Clareza e Propósito",
    phase: "Energia Espiritual",
    spiritual: "Santa Catarina de Sena",
    description: "Alinhamento com propósito e tomada de decisões.",
    benefits: ["Clareza mental", "Direcionamento", "Conexão espiritual"],
    importance: "Fecha o ciclo com consciência e alinhamento.",
    price: "R$ 21"
  }
];

type Page = 'home' | 'diagnostico_info' | 'reprogramacao_pessoal_info' | 'clube_clarear_info' | 'clube_taro_info' | 'rituais_mes_info' | 'reprogramar_eu_info' | 'diagnostico_quiz_intro' | 'intro' | 'quiz' | 'analysis' | 'final' | 'auth' | 'checkout' | 'clube_clarear_content' | 'clube_taro_content' | 'admin_dashboard' | 'dashboard' | 'mapeamento_intro' | 'mapeamento_form' | 'mapeamento_analysis' | 'mapeamento_result' | 'jornada_emocional' | 'confirmation' | 'reprogramacao_form' | 'reprogramacao_scheduling' | 'triage_quiz' | 'triage_result';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.2
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1] as any
    }
  }
};

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId: string | undefined;
    email: string | null | undefined;
    emailVerified: boolean | undefined;
    isAnonymous: boolean | undefined;
    tenantId: string | null | undefined;
    providerInfo: {
      providerId: string;
      displayName: string | null;
      email: string | null;
      photoUrl: string | null;
    }[];
  }
}

const handleFirestoreError = (error: unknown, operationType: OperationType, path: string | null) => {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData.map(provider => ({
        providerId: provider.providerId,
        displayName: provider.displayName,
        email: provider.email,
        photoUrl: provider.photoURL
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
};

const AdminDashboardTab = ({ stats, users, onTestMapeamento, onSimulatePurchase }: { stats: any, users: any[], onTestMapeamento: () => void, onSimulatePurchase: () => void }) => (
  <div className="space-y-12">
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
      {[
        { label: 'Total Usuários', value: stats.usersCount, icon: Users },
        { label: 'Mapeamentos', value: stats.mappingsCount, icon: BarChart3 },
        { label: 'Solicitações', value: stats.requestsCount, icon: MessageCircle },
        { label: 'Receita Est.', value: `R$ ${stats.revenue}`, icon: Package },
        { label: 'Usuários Ativos', value: stats.activeUsers, icon: ShieldCheck },
      ].map((stat, i) => (
        <div key={i} className="glass-card p-6 md:p-8 border-gold-main/10">
          <stat.icon size={20} className="text-gold-main/30 mb-6" />
          <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">{stat.label}</p>
          <p className="serif text-2xl md:text-3xl text-gold-light">{stat.value}</p>
        </div>
      ))}
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="glass-card p-6 md:p-10">
        <h3 className="serif text-2xl text-gold-light mb-8">Atividade Recente</h3>
        <div className="space-y-4">
          {users.slice(0, 5).map((u, i) => (
            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold-main/40">
                  <UserIcon size={18} />
                </div>
                <div>
                  <p className="text-gold-light text-sm font-medium truncate max-w-[150px] md:max-w-none">{u.email}</p>
                  <p className="text-[10px] text-white/20 uppercase tracking-widest">Novo Usuário</p>
                </div>
              </div>
              <span className="text-[10px] text-white/20">Recente</span>
            </div>
          ))}
        </div>
      </div>

      <div className="glass-card p-6 md:p-10 border-emerald-500/20 bg-emerald-500/[0.02]">
        <h3 className="serif text-2xl text-emerald-400 mb-8 flex items-center gap-3">
          <ShieldCheck size={24} />
          Modo de Teste (Admin)
        </h3>
        <p className="text-white/40 text-sm mb-8 font-light">
          Use estas ferramentas para testar as funcionalidades do app sem precisar realizar pagamentos reais.
        </p>
        <div className="grid grid-cols-1 gap-4">
          <button 
            onClick={onTestMapeamento}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
          >
            <div className="text-left">
              <p className="text-gold-light text-sm font-medium">Testar Mapeamento</p>
              <p className="text-[10px] text-white/20 uppercase tracking-widest">Acesso direto ao Quiz de 10 perguntas</p>
            </div>
            <ArrowRight size={18} className="text-gold-main/40 group-hover:text-gold-main transition-colors" />
          </button>

          <button 
            onClick={onSimulatePurchase}
            className="flex items-center justify-between p-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl transition-all group"
          >
            <div className="text-left">
              <p className="text-gold-light text-sm font-medium">Simular Compra de Diagnóstico</p>
              <p className="text-[10px] text-white/20 uppercase tracking-widest">Libera acesso ao Diagnóstico Posição</p>
            </div>
            <ArrowRight size={18} className="text-gold-main/40 group-hover:text-gold-main transition-colors" />
          </button>
        </div>
      </div>
    </div>
  </div>
);

const AdminUserDetailsView = ({ user, mappings, diagnosticos, requests, onBack }: { user: any, mappings: any[], diagnosticos: any[], requests: any[], onBack: () => void }) => {
  const userMappings = mappings.filter(m => m.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userDiagnosticos = diagnosticos.filter(d => d.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  const userRequests = requests.filter(r => r.userId === user.id).sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  // Combine and sort all activities for a timeline
  const timeline = [
    ...userMappings.map(m => ({ ...m, type: 'mapping' })),
    ...userDiagnosticos.map(d => ({ ...d, type: 'diagnostico' })),
    ...userRequests.map(r => ({ ...r, type: 'request' }))
  ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

  return (
    <div className="space-y-8">
      <button onClick={onBack} className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
        <ChevronRight size={14} className="rotate-180" />
        Voltar para Lista
      </button>

      <div className="glass-card p-8 md:p-10">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-10">
          <div>
            <span className="text-gold-main/30 text-[9px] uppercase tracking-[0.3em] mb-2 block font-bold">Perfil do Usuário</span>
            <h3 className="serif text-3xl text-gold-light">{user.email}</h3>
            <p className="text-white/20 text-[10px] mt-1">ID: {user.id}</p>
          </div>
          <div className="flex gap-4">
            <div className="text-right">
              <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-1">Status</p>
              <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${user.paidStatus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                {user.paidStatus ? 'Ativo' : 'Inativo'}
              </span>
            </div>
            <div className="text-right">
              <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold mb-1">Mapeamentos</p>
              <span className="text-gold-light font-medium">{userMappings.length}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="md:col-span-2 space-y-6">
            <h4 className="serif text-xl text-gold-light mb-6 flex items-center gap-3">
              <History size={20} className="text-gold-main/40" />
              Jornada de Evolução
            </h4>
            
            <div className="relative pl-8 border-l border-white/5 space-y-12">
              {timeline.map((item, i) => (
                <div key={i} className="relative">
                  <div className="absolute -left-[41px] top-0 w-4 h-4 rounded-full bg-black border-2 border-gold-main/40" />
                  
                  <div className="glass-card p-6 border-gold-main/5 hover:border-gold-main/20 transition-all">
                    <div className="flex justify-between items-start mb-4">
                      <span className={`text-[9px] uppercase tracking-widest font-bold px-2 py-0.5 rounded ${item.type === 'mapping' ? 'bg-gold-main/10 text-gold-main' : item.type === 'diagnostico' ? 'bg-blue-500/10 text-blue-400' : 'bg-emerald-500/10 text-emerald-400'}`}>
                        {item.type === 'mapping' ? 'Mapeamento' : item.type === 'diagnostico' ? 'Diagnóstico' : 'Solicitação'}
                      </span>
                      <span className="text-white/20 text-[10px]">{new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>

                    {item.type === 'mapping' ? (
                      <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Emoção Central</p>
                            <p className="text-gold-light text-sm">{item.emocao}</p>
                          </div>
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Arquétipo</p>
                            <p className="text-gold-light text-sm">{item.arquetipo}</p>
                          </div>
                        </div>

                        {item.answers && (
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4 space-y-3">
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-2">Respostas do Quiz (Mapeamento)</p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              {item.answers.map((ans: any, aidx: number) => (
                                <div key={aidx} className="flex flex-col gap-1">
                                  <span className="text-[8px] text-white/10 uppercase tracking-widest">P{ans.pergunta_id}</span>
                                  <span className="text-[11px] text-white/40 leading-tight">{ans.emocao} (Peso: {ans.peso})</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        <div>
                          <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Florais Recomendados</p>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {item.florais?.split(',').map((f: string, fi: number) => (
                              <span key={fi} className="text-[10px] bg-white/5 px-2 py-1 rounded border border-white/5 text-white/60">{f.trim()}</span>
                            ))}
                          </div>
                        </div>
                        {item.alignmentScore && (
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-2">Nível de Alinhamento: {item.alignmentScore}%</p>
                            <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                              <div className="h-full bg-gold-main" style={{ width: `${item.alignmentScore}%` }} />
                            </div>
                          </div>
                        )}
                      </div>
                    ) : item.type === 'diagnostico' ? (
                      <div className="space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Arquétipo (Arcano)</p>
                            <p className="text-gold-light text-sm">{item.archetype}</p>
                          </div>
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Temática</p>
                            <p className="text-gold-light text-sm">{item.theme}</p>
                          </div>
                        </div>

                        {item.arcanoData && (
                          <div className="space-y-4 pt-4 border-t border-white/5">
                            <div>
                              <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-2">Sombra Ativa</p>
                              <p className="text-white/60 text-xs capitalize">{item.arcanoData.sombra.join(', ').replace(/_/g, ' ')}</p>
                            </div>
                            <div>
                              <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-2">Direção de Evolução</p>
                              <p className="text-gold-light/80 text-xs italic">"{item.arcanoData.direcao}"</p>
                            </div>
                            <div>
                              <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-2">Caminhos Possíveis</p>
                              <div className="flex flex-wrap gap-2">
                                {item.arcanoData.evolucao.map((ev: string, idx: number) => (
                                  <span key={idx} className="text-[8px] uppercase tracking-widest bg-gold-main/5 border border-gold-main/10 px-2 py-0.5 rounded text-gold-main/60">{ev}</span>
                                ))}
                              </div>
                            </div>
                          </div>
                        )}

                        {item.answers && (
                          <div className="bg-white/[0.02] border border-white/5 rounded-xl p-4">
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-3">Respostas do Quiz (Diagnóstico)</p>
                            <div className="space-y-2">
                              {item.answers.map((ans: string, idx: number) => (
                                <div key={idx} className="text-[10px] text-white/40 flex gap-2">
                                  <span className="text-gold-main/30">Q{idx + 1}:</span>
                                  <span>Opção {ans}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <div>
                          <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Objetivo</p>
                          <p className="text-gold-light text-sm italic">"{item.objetivo}"</p>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Estado Emocional</p>
                            <p className="text-white/60 text-xs">{item.estadoEmocional}</p>
                          </div>
                          <div>
                            <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Status</p>
                            <span className="text-[10px] text-emerald-400 uppercase tracking-widest font-bold">{item.status}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {timeline.length === 0 && (
                <div className="text-center py-10 text-white/20 italic">
                  Nenhuma atividade registrada para este usuário ainda.
                </div>
              )}
            </div>
          </div>

          <div className="space-y-8">
            <div className="glass-card p-6 border-white/5">
              <h5 className="serif text-lg text-gold-light mb-6">Resumo de Dados</h5>
              <div className="space-y-4">
                <div>
                  <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">WhatsApp</p>
                  <p className="text-white/60 text-sm">{user.whatsapp || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Nome</p>
                  <p className="text-white/60 text-sm">{user.name || 'Não informado'}</p>
                </div>
                <div>
                  <p className="text-white/20 text-[9px] uppercase tracking-widest font-bold mb-1">Cargo/Papel</p>
                  <p className="text-white/60 text-sm capitalize">{user.role || 'Usuário'}</p>
                </div>
              </div>
            </div>

            <div className="glass-card p-6 border-white/5 bg-gold-main/[0.02]">
              <h5 className="serif text-lg text-gold-light mb-4">Ações Rápidas</h5>
              <div className="space-y-3">
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all text-left px-4 flex items-center justify-between">
                  Enviar Mensagem
                  <MessageCircle size={14} className="text-gold-main/40" />
                </button>
                <button className="w-full py-3 bg-white/5 hover:bg-white/10 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all text-left px-4 flex items-center justify-between">
                  Redefinir Acesso
                  <ShieldCheck size={14} className="text-gold-main/40" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const AdminUsersTab = ({ users, mappings, onSelectUser }: { users: any[], mappings: any[], onSelectUser: (user: any) => void }) => (
  <div className="glass-card p-6 md:p-10">
    <div className="flex justify-between items-center mb-10">
      <h3 className="serif text-2xl text-gold-light">Gestão de Usuários</h3>
      <div className="flex gap-4">
        <input type="text" placeholder="Buscar usuário..." className="input py-2 px-4 text-xs" />
      </div>
    </div>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/20">
            <th className="pb-6 font-bold">Usuário</th>
            <th className="pb-6 font-bold">Status</th>
            <th className="pb-6 font-bold">Mapeamentos</th>
            <th className="pb-6 font-bold text-right">Ações</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {users.map((u, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="py-6">
                <p className="text-gold-light font-medium">{u.email}</p>
                <p className="text-[10px] text-white/20">{u.id}</p>
              </td>
              <td className="py-6">
                <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${u.paidStatus ? 'bg-emerald-500/10 text-emerald-400' : 'bg-white/5 text-white/30'}`}>
                  {u.paidStatus ? 'Ativo' : 'Inativo'}
                </span>
              </td>
              <td className="py-6 text-white/40">
                {mappings.filter(m => m.userId === u.id).length}
              </td>
              <td className="py-6 text-right">
                <button 
                  onClick={() => onSelectUser(u)}
                  className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-widest font-bold"
                >
                  Ver Detalhes
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminMappingsTab = ({ mappings }: { mappings: any[] }) => (
  <div className="glass-card p-6 md:p-10">
    <h3 className="serif text-2xl text-gold-light mb-10">Histórico de Mapeamentos</h3>
    <div className="space-y-4">
      {mappings.map((m, i) => (
        <div key={i} className="p-6 border border-white/5 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4 group hover:border-gold-main/20 transition-all">
          <div className="flex items-center gap-6">
            <div className="w-12 h-12 rounded-full bg-gold-main/5 flex items-center justify-center text-gold-main/40">
              <BarChart3 size={20} />
            </div>
            <div>
              <h4 className="serif text-lg text-gold-light">{m.arquetipo}</h4>
              <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
                {m.userEmail} • {new Date(m.createdAt).toLocaleDateString('pt-BR')}
              </p>
            </div>
          </div>
          <button className="p-3 text-gold-main/20 hover:text-gold-main transition-colors self-end sm:self-auto">
            <ChevronRight size={18} />
          </button>
        </div>
      ))}
    </div>
  </div>
);

const AdminClubeTab = ({ 
  meditationData, 
  setMeditationData, 
  meditationList, 
  setMeditationList 
}: { 
  meditationData: any, 
  setMeditationData: (data: any) => void, 
  meditationList: any[], 
  setMeditationList: (list: any[]) => void 
}) => (
  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 lg:gap-12">
    <div className="lg:col-span-1">
      <div className="glass-card p-8">
        <h3 className="serif text-2xl text-gold-light mb-8 flex items-center gap-3">
          <Plus size={20} className="text-gold-main" />
          Novo Áudio
        </h3>
        <div className="space-y-6">
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Título</label>
            <input 
              type="text" 
              className="input"
              value={meditationData.title}
              onChange={(e) => setMeditationData({...meditationData, title: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Duração</label>
            <input 
              type="text" 
              className="input"
              value={meditationData.duration}
              onChange={(e) => setMeditationData({...meditationData, duration: e.target.value})}
            />
          </div>
          <div className="flex flex-col gap-2">
            <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">URL MP3</label>
            <input 
              type="text" 
              className="input"
              value={meditationData.url}
              onChange={(e) => setMeditationData({...meditationData, url: e.target.value})}
            />
          </div>
          <button 
            type="button"
            onClick={() => {
              if (meditationData.title && meditationData.url) {
                const newItem = { id: meditationList.length + 1, ...meditationData };
                setMeditationList([...meditationList, newItem]);
                setMeditationData({ title: '', description: '', duration: '', url: '' });
              }
            }}
            className="button w-full flex items-center justify-center gap-3"
          >
            <Upload size={18} />
            Publicar
          </button>
        </div>
      </div>
    </div>
    <div className="lg:col-span-2">
      <div className="glass-card p-8">
        <h3 className="serif text-2xl text-gold-light mb-8">Conteúdo Ativo</h3>
        <div className="space-y-4">
          {meditationList.map((item) => (
            <div key={item.id} className="p-6 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-gold-main/30 transition-all">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-gold-main/5 flex items-center justify-center text-gold-main/40">
                  <Music size={20} />
                </div>
                <div>
                  <h4 className="serif text-lg text-gold-light">{item.title}</h4>
                  <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">{item.duration} • Clube Clarear</p>
                </div>
              </div>
              <button 
                onClick={() => setMeditationList(meditationList.filter(m => m.id !== item.id))}
                className="p-3 text-white/10 hover:text-red-400/60 transition-colors"
              >
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AdminRequestsTab = ({ requests, users }: { requests: any[], users: any[] }) => (
  <div className="glass-card p-6 md:p-10">
    <h3 className="serif text-2xl text-gold-light mb-10">Solicitações de Reprogramação</h3>
    <div className="overflow-x-auto">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-white/5 text-[10px] uppercase tracking-widest text-white/20">
            <th className="pb-6 font-bold">Usuário</th>
            <th className="pb-6 font-bold">Produto</th>
            <th className="pb-6 font-bold">Objetivo</th>
            <th className="pb-6 font-bold">Status</th>
            <th className="pb-6 font-bold text-right">Data</th>
          </tr>
        </thead>
        <tbody className="text-sm">
          {requests.map((r, i) => (
            <tr key={i} className="border-b border-white/5 last:border-0">
              <td className="py-6">
                <p className="text-gold-light font-medium">{users.find(u => u.id === r.userId)?.email || r.userId}</p>
              </td>
              <td className="py-6 text-white/40">{r.productName}</td>
              <td className="py-6 text-white/40 max-w-xs truncate">{r.objetivo}</td>
              <td className="py-6">
                <span className={`px-3 py-1 rounded-full text-[9px] uppercase tracking-widest font-bold ${r.status === 'completed' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-gold-main/10 text-gold-main'}`}>
                  {r.status === 'completed' ? 'Concluído' : 'Pendente'}
                </span>
              </td>
              <td className="py-6 text-right text-white/20">
                {new Date(r.createdAt).toLocaleDateString('pt-BR')}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const AdminProductsTab = () => (
  <div className="glass-card p-6 md:p-10">
    <div className="flex justify-between items-center mb-10">
      <h3 className="serif text-2xl text-gold-light">Produtos e Ofertas</h3>
      <button className="button-outline py-2 px-4 text-xs flex items-center gap-2">
        <Plus size={14} /> Novo Produto
      </button>
    </div>
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {[
        { name: 'Diagnóstico POSIÇÃO', price: 'R$ 69', sales: 124, status: 'Ativo' },
        { name: 'Mapeamento Floral', price: 'R$ 9', sales: 452, status: 'Ativo' },
        { name: 'Clube Clarear', price: 'R$ 47/mês', sales: 89, status: 'Ativo' },
        { name: 'Clube do Tarô', price: 'R$ 27/mês', sales: 156, status: 'Ativo' },
        { name: 'Reprogramação Pessoal', price: 'R$ 197', sales: 42, status: 'Ativo' },
        { name: 'Reprograme-se', price: 'R$ 497', sales: 15, status: 'Ativo' },
      ].map((p, i) => (
        <div key={i} className="p-6 border border-white/5 rounded-2xl bg-white/[0.01] hover:border-gold-main/20 transition-all group">
          <div className="flex justify-between items-start mb-6">
            <h4 className="serif text-lg text-gold-light group-hover:text-gold-main transition-colors">{p.name}</h4>
            <span className="text-emerald-400 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">{p.status}</span>
          </div>
          <div className="flex justify-between items-end">
            <div>
              <p className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Preço</p>
              <p className="text-gold-light font-medium">{p.price}</p>
            </div>
            <div className="text-right">
              <p className="text-white/20 text-[10px] uppercase tracking-widest mb-1">Vendas</p>
              <p className="text-gold-light font-medium">{p.sales}</p>
            </div>
          </div>
        </div>
      ))}
    </div>
  </div>
);

const AdminSessionsTab = ({ appointments, users, onRefresh }: { appointments: any[], users: any[], onRefresh: () => void }) => {
  const handleStatusChange = async (id: string, status: string) => {
    try {
      await updateDoc(doc(db, 'appointments', id), { status });
      onRefresh();
    } catch (error) {
      console.error("Error updating appointment status:", error);
    }
  };

  const sortedAppointments = [...appointments].sort((a, b) => {
    const dateA = new Date(`${a.date}T${a.time}`);
    const dateB = new Date(`${b.date}T${b.time}`);
    return dateA.getTime() - dateB.getTime();
  });

  return (
    <div className="glass-card p-6 md:p-10">
      <h3 className="serif text-2xl text-gold-light mb-10">Agenda de Sessões</h3>
      <div className="space-y-6">
        {sortedAppointments.length === 0 ? (
          <div className="text-center py-20 border border-dashed border-white/10 rounded-3xl">
            <Calendar className="mx-auto text-white/10 mb-4" size={48} />
            <p className="text-white/20 text-sm font-light">Nenhum agendamento encontrado.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {sortedAppointments.map((s, i) => {
              const user = users.find(u => u.id === s.userId || u.uid === s.userId);
              const userName = user?.name || user?.displayName || s.userName || 'Cliente';
              const userEmail = user?.email || s.userEmail || 'N/A';
              
              return (
                <div key={i} className={`p-6 border rounded-2xl transition-all ${s.status === 'completed' ? 'border-emerald-500/20 bg-emerald-500/[0.02]' : 'border-white/5 hover:border-gold-main/20'}`}>
                  <div className="flex justify-between items-start mb-4">
                    <span className="text-gold-main/40 text-[9px] uppercase tracking-widest font-bold">{s.productName}</span>
                    <span className="text-white/20 text-[10px]">{s.date} • {s.time}</span>
                  </div>
                  <p className="text-gold-light font-medium mb-2">{userName}</p>
                  <p className="text-white/40 text-xs mb-4">{userEmail}</p>
                  <div className="flex gap-3">
                    {s.status === 'scheduled' ? (
                      <>
                        <button 
                          onClick={() => handleStatusChange(s.id, 'cancelled')}
                          className="flex-1 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all"
                        >
                          Cancelar
                        </button>
                        <button 
                          onClick={() => handleStatusChange(s.id, 'completed')}
                          className="flex-1 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-black rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all"
                        >
                          Concluir
                        </button>
                      </>
                    ) : (
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${s.status === 'completed' ? 'text-emerald-400' : 'text-red-400'}`}>
                        {s.status === 'completed' ? 'Concluída' : 'Cancelada'}
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

const AdminReportsTab = () => (
  <div className="glass-card p-6 md:p-10">
    <h3 className="serif text-2xl text-gold-light mb-10">Relatórios e Insights</h3>
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="p-8 border border-white/5 rounded-3xl bg-white/[0.01]">
        <h4 className="serif text-xl text-gold-light mb-6">Crescimento de Usuários</h4>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={[
              { name: 'Jan', value: 40 },
              { name: 'Fev', value: 75 },
              { name: 'Mar', value: 120 },
              { name: 'Abr', value: 180 },
            ]}>
              <defs>
                <linearGradient id="colorVal" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                  <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <Area type="monotone" dataKey="value" stroke="#D4AF37" fillOpacity={1} fill="url(#colorVal)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
      <div className="p-8 border border-white/5 rounded-3xl bg-white/[0.01]">
        <h4 className="serif text-xl text-gold-light mb-6">Conversão de Ofertas</h4>
        <div className="space-y-6">
          {[
            { label: 'Diagnóstico', value: 85 },
            { label: 'Mapeamento', value: 92 },
            { label: 'Clube', value: 45 },
          ].map((item, i) => (
            <div key={i}>
              <div className="flex justify-between text-[10px] uppercase tracking-widest font-bold mb-2">
                <span className="text-white/40">{item.label}</span>
                <span className="text-gold-main">{item.value}%</span>
              </div>
              <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                <div className="h-full bg-gold-main/40" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  </div>
);

const AdminCouponsTab = ({ coupons, onRefresh, setNotification }: { coupons: any[], onRefresh: () => void, setNotification: (n: any) => void }) => {
  const [newCoupon, setNewCoupon] = useState({ code: '', discountType: 'percentage', value: '' as any });
  const [isCreating, setIsCreating] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const handleCreate = async () => {
    const val = parseFloat(newCoupon.value);
    if (!newCoupon.code || isNaN(val) || val <= 0) return;
    setIsCreating(true);
    try {
      await addDoc(collection(db, 'coupons'), {
        ...newCoupon,
        value: val,
        code: newCoupon.code.toUpperCase(),
        active: true,
        createdAt: new Date().toISOString()
      });
      setNewCoupon({ code: '', discountType: 'percentage', value: '' });
      onRefresh();
      setNotification({ message: "Cupom criado com sucesso!", type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, 'coupons');
      setNotification({ message: "Erro ao criar cupom.", type: 'error' });
    } finally {
      setIsCreating(false);
    }
  };

  const toggleStatus = async (id: string, currentStatus: boolean) => {
    try {
      await updateDoc(doc(db, 'coupons', id), { active: !currentStatus });
      onRefresh();
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, `coupons/${id}`);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'coupons', id));
      onRefresh();
      setNotification({ message: "Cupom excluído com sucesso!", type: 'success' });
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, `coupons/${id}`);
      setNotification({ message: "Erro ao excluir cupom.", type: 'error' });
    }
  };

  return (
    <div className="glass-card p-6 md:p-10">
      <h3 className="serif text-2xl text-gold-light mb-10">Gerenciar Cupons</h3>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-12 p-6 border border-white/5 rounded-2xl bg-white/[0.01]">
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Código</label>
          <input 
            type="text" 
            placeholder="EX: POSICAO10" 
            className="input py-2 text-xs"
            value={newCoupon.code}
            onChange={(e) => setNewCoupon({...newCoupon, code: e.target.value.toUpperCase()})}
          />
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Tipo</label>
          <select 
            className="input py-2 text-xs"
            value={newCoupon.discountType}
            onChange={(e) => setNewCoupon({...newCoupon, discountType: e.target.value})}
          >
            <option value="percentage">Porcentagem (%)</option>
            <option value="fixed">Valor Fixo (R$)</option>
          </select>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] uppercase tracking-widest text-white/20 font-bold">Valor</label>
          <input 
            type="number" 
            placeholder="0" 
            className="input py-2 text-xs"
            value={newCoupon.value}
            onChange={(e) => setNewCoupon({...newCoupon, value: e.target.value})}
          />
        </div>
        <div className="flex items-end">
          <button 
            type="button"
            onClick={handleCreate}
            disabled={isCreating}
            className="button w-full py-2.5 text-xs"
          >
            {isCreating ? 'Criando...' : 'Criar Cupom'}
          </button>
        </div>
      </div>

      <div className="space-y-4">
        {coupons.map((c, i) => (
          <div key={i} className="p-6 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-gold-main/20 transition-all">
            <div className="flex items-center gap-6">
              <div className="w-12 h-12 rounded-full bg-gold-main/5 flex items-center justify-center text-gold-main/40">
                <Tag size={20} />
              </div>
              <div>
                <h4 className="serif text-lg text-gold-light">{c.code}</h4>
                <p className="text-white/20 text-[10px] uppercase tracking-widest font-bold">
                  {c.discountType === 'percentage' ? `${c.value}% de desconto` : `R$ ${c.value} de desconto`}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[9px] uppercase tracking-widest font-bold px-3 py-1 rounded-full ${c.active ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                {c.active ? 'Ativo' : 'Inativo'}
              </span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => toggleStatus(c.id, c.active)}
                  className="p-3 text-gold-main/20 hover:text-gold-main transition-colors"
                  title={c.active ? 'Desativar' : 'Ativar'}
                >
                  {c.active ? <X size={18} /> : <Check size={18} />}
                </button>
                <button 
                  onClick={() => {
                    if (confirmDeleteId === c.id) {
                      handleDelete(c.id);
                      setConfirmDeleteId(null);
                    } else {
                      setConfirmDeleteId(c.id);
                    }
                  }}
                  onMouseLeave={() => setConfirmDeleteId(null)}
                  className={`p-3 transition-colors flex items-center gap-2 ${confirmDeleteId === c.id ? 'text-red-400 bg-red-400/10 rounded-xl' : 'text-white/20 hover:text-red-400'}`}
                  title="Excluir"
                >
                  {confirmDeleteId === c.id ? <span className="text-[10px] font-bold uppercase tracking-widest">Confirmar?</span> : <Trash2 size={18} />}
                </button>
              </div>
            </div>
          </div>
        ))}
        {coupons.length === 0 && (
          <p className="text-center text-white/20 italic py-10">Nenhum cupom cadastrado.</p>
        )}
      </div>
    </div>
  );
};


const Diagnostico = () => {
  const { access, refreshAccess } = useAccess();
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', whatsapp: '', birthDate: '' });
  const [authError, setAuthError] = useState<string | React.ReactNode>(null);
  const [intendedPage, setIntendedPage] = useState<Page | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{name: string, price: string} | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [reprogramacaoData, setReprogramacaoData] = useState({ estadoEmocional: '', objetivo: '', observacoes: '' });
  const [isSubmittingReprogramacao, setIsSubmittingReprogramacao] = useState(false);
  
  // Scheduling State
  const [appointments, setAppointments] = useState<any[]>([]);
  const [selectedDate, setSelectedDate] = useState<string>('');
  const [selectedTime, setSelectedTime] = useState<string>('');
  const [isScheduling, setIsScheduling] = useState(false);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{code: string, discountType: string, value: number} | null>(null);
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false);
  const [couponError, setCouponError] = useState<string | null>(null);

  const applyCoupon = async () => {
    if (!couponCode.trim()) return;
    setIsApplyingCoupon(true);
    setCouponError(null);
    
    try {
      const q = query(collection(db, 'coupons'), where('code', '==', couponCode.trim().toUpperCase()), where('active', '==', true));
      const querySnapshot = await getDocs(q);
      
      if (querySnapshot.empty) {
        setCouponError('Cupom inválido ou expirado.');
        setAppliedCoupon(null);
      } else {
        const couponData = querySnapshot.docs[0].data() as any;
        setAppliedCoupon({
          code: couponData.code,
          discountType: couponData.discountType,
          value: couponData.value
        });
        setCouponError(null);
      }
    } catch (error) {
      console.error('Erro ao validar cupom:', error);
      setCouponError('Erro ao validar cupom. Verifique sua conexão.');
    } finally {
      setIsApplyingCoupon(false);
    }
  };

  const handleReprogramacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    showPage('reprogramacao_scheduling');
  };

  const handleSchedulingSubmit = async () => {
    if (!selectedDate || !selectedTime) {
      setNotification({ message: 'Por favor, selecione uma data e horário.', type: 'error' });
      return;
    }

    setIsScheduling(true);
    try {
      if (user) {
        // 1. Save Reprogramacao Request
        await addDoc(collection(db, 'reprogramacao_requests'), {
          userId: user.uid,
          userEmail: user.email,
          productName: selectedProduct?.name || 'Reprogramação Pessoal',
          estadoEmocional: reprogramacaoData.estadoEmocional,
          objetivo: reprogramacaoData.objetivo,
          observacoes: reprogramacaoData.observacoes || '',
          status: 'pending',
          createdAt: new Date().toISOString(),
          appointmentDate: selectedDate,
          appointmentTime: selectedTime
        });

        // 2. Save Appointment
        await addDoc(collection(db, 'appointments'), {
          userId: user.uid,
          date: selectedDate,
          time: selectedTime,
          productName: selectedProduct?.name || 'Reprogramação Pessoal',
          status: 'scheduled',
          createdAt: new Date().toISOString()
        });

        setNotification({ message: 'Agendamento realizado com sucesso!', type: 'success' });
        showPage('home');
        // Reset states
        setReprogramacaoData({ estadoEmocional: '', objetivo: '', observacoes: '' });
        setSelectedDate('');
        setSelectedTime('');
      }
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, 'appointments');
      setNotification({ message: 'Erro ao realizar agendamento. Tente novamente.', type: 'error' });
    } finally {
      setIsScheduling(false);
    }
  };
  const refreshAdminData = async () => {
    const usersSnapshot = await getDocs(collection(db, 'users'));
    setAdminUsers(usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as AppUser[]);
    
    const mappingsSnapshot = await getDocs(collection(db, 'mappings'));
    setAdminMappings(mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    
    const requestsSnapshot = await getDocs(collection(db, 'reprogramacao_requests'));
    setAdminRequests(requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const couponsSnapshot = await getDocs(collection(db, 'coupons'));
    setAdminCoupons(couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));

    const appointmentsSnapshot = await getDocs(collection(db, 'appointments'));
    setAdminAppointments(appointmentsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
  };

  const [currentAudio, setCurrentAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminMeditationData, setAdminMeditationData] = useState({ title: '', description: '', duration: '', url: '' });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'mappings' | 'products' | 'clube' | 'sessions' | 'reports' | 'requests' | 'coupons'>('dashboard');
  const [adminStats, setAdminStats] = useState({
    usersCount: 0,
    mappingsCount: 0,
    requestsCount: 0,
    revenue: 0,
    activeUsers: 0
  });
  const [adminUsers, setAdminUsers] = useState<AppUser[]>([]);
  const [adminMappings, setAdminMappings] = useState<any[]>([]);
  const [adminDiagnosticos, setAdminDiagnosticos] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [adminCoupons, setAdminCoupons] = useState<any[]>([]);
  const [adminAppointments, setAdminAppointments] = useState<any[]>([]);
  const [selectedAdminUser, setSelectedAdminUser] = useState<any | null>(null);
  const [meditationList, setMeditationList] = useState(meditations);
  const [notification, setNotification] = useState<{message: string, type: 'success' | 'error' | 'info'} | null>(null);
  const [mapeamentoData, setMapeamentoData] = useState({
    emocao: '',
    padrao: '',
    defesa: '',
    ferida: '',
    desejo: '',
    arquetipo: ''
  });
  const [mapeamentoAnswers, setMapeamentoAnswers] = useState<any[]>([]);
  const [currentMapeamentoStep, setCurrentMapeamentoStep] = useState(0);
  const [mapeamentoResult, setMapeamentoResult] = useState<string | null>(null);
  const [currentFlorais, setCurrentFlorais] = useState<string>('');
  const [selectedArcano, setSelectedArcano] = useState<ArcanoData | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<any | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false);
  const [isAuthInitialized, setIsAuthInitialized] = useState(false);
  const finalizingRef = React.useRef(false);

  const calculateStatus = (createdAt: string) => {
    const createdDate = new Date(createdAt);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - createdDate.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays <= 7) return { label: 'Início de Integração', code: 'integration', color: 'text-blue-400' };
    if (diffDays <= 20) return { label: 'Processo Ativo', code: 'active', color: 'text-emerald-400' };
    return { label: 'Reavaliação', code: 'reevaluate', color: 'text-gold-main' };
  };
  
  const [currentIndex, setCurrentIndex] = useState(0);
  const [triageIndex, setTriageIndex] = useState(0);
  const [triageAnswers, setTriageAnswers] = useState<string[]>([]);
  const [triageResult, setTriageResult] = useState<{title: string, text: string, button: string, target: Page} | null>(null);
  const [answers, setAnswers] = useState<string[]>([]);
  const [analysisText, setAnalysisText] = useState("Observando padrões de posicionamento...");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const q = query(collection(db, 'appointments'), where('status', '==', 'scheduled'));
        const querySnapshot = await getDocs(q);
        const docs = querySnapshot.docs.map(doc => doc.data());
        setAllAppointments(docs);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [page]);

  useEffect(() => {
    const testConnection = async () => {
      try {
        await getDocFromServer(doc(db, 'test', 'connection'));
      } catch (error) {
        if (error instanceof Error && error.message.includes('the client is offline')) {
          console.error("Please check your Firebase configuration. The client is offline.");
        }
      }
    };
    testConnection();

    const unsubscribe = onAuthStateChanged(auth, async (u) => {
      try {
        setUser(u);
        if (u) {
          // Check if user is admin
          try {
            const userDoc = await getDoc(doc(db, 'users', u.uid));
            const data = userDoc.data();
            setUserData(data);
            const isDefaultAdmin = u.email === "andreiapreto@gmail.com";
            setIsAdmin(data?.role === 'admin' || isDefaultAdmin);
          } catch (error) {
            handleFirestoreError(error, OperationType.GET, `users/${u.uid}`);
          }
        } else {
          setIsAdmin(false);
          setUserData(null);
        }
      } catch (error) {
        console.error("Error in onAuthStateChanged:", error);
      } finally {
        setIsAuthInitialized(true);
        // Only set loading to false if we're not in the middle of finalizing a payment
        const params = new URLSearchParams(window.location.search);
        const isPaymentSuccess = params.get('payment_success') === 'true';
        if (!isPaymentSuccess && !finalizingRef.current) {
          setLoading(false);
        }
      }
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  useEffect(() => {
    if (user) {
      const fetchHistory = async () => {
        try {
          const q = query(collection(db, 'mappings'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
          const querySnapshot = await getDocs(q);
          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          setHistory(docs);
        } catch (error) {
          console.error("Error fetching history:", error);
          handleFirestoreError(error, OperationType.LIST, 'mappings');
        }
      };
      fetchHistory();
    }
  }, [user]);

  useEffect(() => {
    if (isAdmin) {
      const fetchAdminStats = async () => {
        try {
          const usersSnapshot = await getDocs(collection(db, 'users'));
          const mappingsSnapshot = await getDocs(collection(db, 'mappings'));
          const diagnosticosSnapshot = await getDocs(collection(db, 'diagnosticos'));
          const requestsSnapshot = await getDocs(collection(db, 'reprogramacao_requests'));
          const couponsSnapshot = await getDocs(collection(db, 'coupons'));
          
          const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
          const mappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const diagnosticos = diagnosticosSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const coupons = couponsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          setAdminUsers(users);
          setAdminMappings(mappings);
          setAdminDiagnosticos(diagnosticos);
          setAdminRequests(requests);
          setAdminCoupons(coupons);
          
          setAdminStats({
            usersCount: users.length,
            mappingsCount: mappings.length,
            requestsCount: requests.length,
            revenue: users.reduce((acc, u) => acc + (u.paidStatus ? 69 : 0), 0),
            activeUsers: users.filter(u => u.paidStatus).length
          });
        } catch (error) {
          console.error("Error fetching admin stats:", error);
        }
      };
      fetchAdminStats();
    }
  }, [isAdmin]);

  // Handle Payment Success
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const isPaymentSuccess = params.get('payment_success') === 'true';
    const buyProduct = params.get('buy');
    
    // Wait for auth to be initialized before making decisions based on user state
    if (!isAuthInitialized) return;

    if (buyProduct && user) {
      // Clear the param
      window.history.replaceState({}, document.title, window.location.pathname);
      
      if (buyProduct === 'diagnostico') {
        const product = { name: 'Diagnóstico POSIÇÃO', price: 'R$ 69' };
        setSelectedProduct(product);
        handleCheckout(product.name, 6900, false);
      } else if (buyProduct === 'clube') {
        const product = { name: 'Clube POSIÇÃO', price: 'R$ 47 /mês' };
        setSelectedProduct(product);
        handleCheckout(product.name, 4700, true);
      }
    }

    if (isPaymentSuccess && !finalizingRef.current) {
      const finalizePayment = async () => {
        finalizingRef.current = true;
        setIsFinalizingPayment(true);
        setLoading(true);
        console.log("💳 Finalizing payment...");

        // Clear URL params IMMEDIATELY to prevent re-triggering
        window.history.replaceState({}, document.title, window.location.pathname);

        const storedData = localStorage.getItem('pending_auth_data');
        const storedProduct = localStorage.getItem('pending_product');
        
        if (storedData && storedProduct) {
          const data = JSON.parse(storedData);
          const product = JSON.parse(storedProduct);
          console.log("📦 Product:", product.name);
          
          try {
            let currentUser = auth.currentUser;
            
            if (!currentUser && data.email && data.password) {
              console.log("👤 No user found, attempting login/signup...");
              try {
                const userCredential = await createUserWithEmailAndPassword(auth, data.email, data.password);
                currentUser = userCredential.user;
              } catch (e: any) {
                if (e.code === 'auth/email-already-in-use') {
                  const userCredential = await signInWithEmailAndPassword(auth, data.email, data.password);
                  currentUser = userCredential.user;
                } else {
                  throw e;
                }
              }
            }

            if (currentUser) {
              console.log("💾 Updating user doc for", currentUser.uid);
              await setDoc(doc(db, 'users', currentUser.uid), {
                uid: currentUser.uid,
                name: data.name || currentUser.displayName || 'Usuário',
                email: data.email || currentUser.email,
                birthDate: data.birthDate || '',
                whatsapp: data.whatsapp || '',
                role: 'user',
                paidStatus: true,
                mappingCredits: increment(product.name === 'Mapeamento Emocional Floral' ? 1 : 0),
                clube_ativo: product.name.includes('Clube'),
                lastPurchase: product.name,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              
              setSelectedProduct(product);
              localStorage.removeItem('pending_auth_data');
              localStorage.removeItem('pending_product');
              
              console.log("🔄 Refreshing access...");
              await refreshAccess(currentUser.uid);
              
              console.log("🚀 Redirecting to correct page...");
              if (product.name === 'Mapeamento Emocional Floral') {
                showPage('mapeamento_form');
              } else {
                showPage('confirmation');
              }
            } else {
              console.warn("⚠️ No current user after auth attempt");
              setPage('auth');
            }
          } catch (err: any) {
            console.error("❌ Error finalizing payment:", err);
            if (err.code === 'auth/operation-not-allowed') {
              setNotification({ message: "Erro: O método de login por E-mail/Senha não está ativado no Console do Firebase.", type: 'error' });
            } else if (err.code === 'auth/network-request-failed') {
              setNotification({ message: "Erro de conexão: Verifique bloqueadores de anúncios ou rede.", type: 'error' });
            } else {
              setNotification({ message: "Erro ao finalizar pagamento: " + (err.message || "Erro desconhecido"), type: 'error' });
            }
            setPage('home');
          } finally {
            setLoading(false);
            setIsFinalizingPayment(false);
            finalizingRef.current = false;
          }
        } else {
          console.warn("⚠️ No stored data found for payment finalization");
          setLoading(false);
          setIsFinalizingPayment(false);
          finalizingRef.current = false;
        }
      };
      finalizePayment();
    }
  }, [user, loading, isAuthInitialized]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        if (!authData.name || !authData.email || !authData.password || !authData.birthDate) {
          setAuthError('Por favor, preencha todos os campos obrigatórios.');
          return;
        }
        const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            name: authData.name,
            email: authData.email,
            birthDate: authData.birthDate,
            whatsapp: authData.whatsapp,
            role: 'user',
            paidStatus: false,
            createdAt: new Date().toISOString()
          });
        } catch (error) {
          handleFirestoreError(error, OperationType.CREATE, `users/${userCredential.user.uid}`);
        }
      } else {
        await signInWithEmailAndPassword(auth, authData.email, authData.password);
      }
      setPage(intendedPage || 'home');
      setIntendedPage(null);
    } catch (err: any) {
      console.error("Auth error:", err);
      if (err.code === 'auth/operation-not-allowed') {
        setAuthError("Erro: O método de login por E-mail/Senha não está ativado no Console do Firebase.");
      } else if (err.code === 'auth/network-request-failed') {
        setAuthError(
          <div className="space-y-4">
            <p>Erro de conexão: O Google Firebase está sendo bloqueado pela sua rede ou ad-blocker.</p>
            <p className="text-[10px] opacity-80 italic">DICA: Tente abrir o app em uma NOVA ABA (ícone no canto superior direito).</p>
          </div>
        );
      } else if (err.code === 'auth/invalid-credential') {
        setAuthError("E-mail ou senha incorretos.");
      } else {
        setAuthError(err.message || "Ocorreu um erro na autenticação.");
      }
    }
  };

  const handleGoogleSignIn = async () => {
    setAuthError(null);
    const provider = new GoogleAuthProvider();
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      
        // Check if user exists in Firestore
        try {
          const userDoc = await getDoc(doc(db, 'users', user.uid));
          if (!userDoc.exists()) {
            try {
              await setDoc(doc(db, 'users', user.uid), {
                uid: user.uid,
                name: user.displayName || 'Usuário Google',
                email: user.email,
                birthDate: '',
                whatsapp: '',
                role: 'user',
                paidStatus: false,
                createdAt: new Date().toISOString()
              });
            } catch (error) {
              handleFirestoreError(error, OperationType.CREATE, `users/${user.uid}`);
            }
          }
        } catch (error) {
          handleFirestoreError(error, OperationType.GET, `users/${user.uid}`);
        }
      
      setPage(intendedPage || 'home');
      setIntendedPage(null);
    } catch (err: any) {
      console.error("Google Auth error:", err);
      setAuthError(err.message);
    }
  };

  const generatePrescriptionPDF = (userName: string, florais: string) => {
    const doc = new jsPDF();
    
    // Header
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(212, 175, 55); // Gold color
    doc.text("RECEITA FLORAL", 105, 40, { align: "center" });
    
    doc.setDrawColor(212, 175, 55);
    doc.setLineWidth(0.5);
    doc.line(40, 45, 170, 45);
    
    // Content
    doc.setFont("helvetica", "normal");
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    doc.text(`Cliente: ${userName}`, 20, 70);
    doc.text(`Data: ${new Date().toLocaleDateString('pt-BR')}`, 20, 80);
    
    doc.setFont("helvetica", "bold");
    doc.text("Fórmula Recomendada:", 20, 100);
    
    doc.setFont("helvetica", "italic");
    doc.setFontSize(14);
    doc.text(florais, 20, 115, { maxWidth: 170 });
    
    doc.setFontSize(10);
    doc.setTextColor(150, 150, 150);
    doc.text("Este é um mapeamento vibracional e não substitui acompanhamento médico.", 105, 280, { align: "center" });
    
    doc.save(`Receita_Floral_${userName.replace(/\s+/g, '_')}.pdf`);
  };

  const handleLogout = () => {
    signOut(auth);
    setPage('home');
    setUserData(null);
    setUser(null);
    setIsAdmin(false);
    setHistory([]);
    setMapeamentoResult(null);
    setSelectedArcano(null);
  };

  const toggleAudio = (id: number) => {
    if (currentAudio === id) {
      if (isPlaying) {
        audioRef.current?.pause();
      } else {
        audioRef.current?.play();
      }
      setIsPlaying(!isPlaying);
    } else {
      const meditation = meditations.find(m => m.id === id);
      if (meditation) {
        if (audioRef.current) {
          audioRef.current.src = meditation.url;
          audioRef.current.play();
          setCurrentAudio(id);
          setIsPlaying(true);
        }
      }
    }
  };

  const showPage = (newPage: Page) => {
    if ((newPage === 'clube_clarear_info' || newPage === 'clube_clarear_content') && !isAdmin) {
      setNotification({ message: "O Clube Clarear está em construção. Acesso em breve!", type: 'info' });
      return;
    }

    if (newPage === 'reprogramacao_pessoal_info' && access?.reprogramacao_pessoal_comprada) {
      setPage('reprogramacao_form');
      return;
    }

    if (newPage === 'reprogramar_eu_info' && access?.reprogramar_eu_comprado) {
      setPage('reprogramacao_form');
      return;
    }

    const publicPages: Page[] = [
      'home', 
      'auth', 
      'diagnostico_info', 
      'reprogramacao_pessoal_info', 
      'clube_clarear_info', 
      'reprogramar_eu_info', 
      'clube_taro_info',
      'clube_clarear_content',
      'clube_taro_content',
      'checkout',
      'mapeamento_intro',
      'reprogramacao_form'
    ];
    
    if (!user && !auth.currentUser && !publicPages.includes(newPage)) {
      setIntendedPage(newPage);
      setPage('auth');
      return;
    }

    if (newPage === 'admin_dashboard' && !isAdmin) {
      setPage('home');
      return;
    }

    if (newPage === 'mapeamento_form' && !isAdmin && (!access?.mappingCredits || access.mappingCredits <= 0)) {
      setPage('mapeamento_intro');
      return;
    }

    setPage(newPage);
  };

  const handleCheckout = async (productName: string, initialAmount: number, isSubscription: boolean = false) => {
    setAuthError(null);
    setIsProcessingPayment(true);
    
    try {
      let currentFirebaseUid = user?.uid;
      
      if (!user) {
        // If no user, we need them to sign up first
        setIntendedPage('checkout');
        setPage('auth');
        setIsProcessingPayment(false);
        return;
      }

      let amount = initialAmount;
      // Apply coupon discount if applicable
      if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
          amount = Math.round(amount * (1 - appliedCoupon.value / 100));
        } else if (appliedCoupon.discountType === 'fixed') {
          amount = Math.max(0, amount - appliedCoupon.value * 100);
        }
      }

      localStorage.setItem('pending_auth_data', JSON.stringify({ email: user.email, name: user.displayName }));
      localStorage.setItem('pending_product', JSON.stringify({ name: productName, price: amount / 100 }));

      // Call server to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName,
          amount,
          isSubscription,
          customerEmail: user.email,
          firebaseUid: currentFirebaseUid,
          metadata: {
            productName,
            firebaseUid: currentFirebaseUid,
            couponCode: appliedCoupon?.code
          }
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      setAuthError(err.message || "Ocorreu um erro ao processar o pagamento.");
      setIsProcessingPayment(false);
    }
  };

  const handleCheckoutAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsProcessingPayment(true);
    
    try {
      if (!selectedProduct) return;

      // Parse price string to cents
      // Example: "R$ 69" -> 6900
      // Example: "R$ 9" -> 900
      // Example: "R$ 39 /mês" -> 3900
      const priceValue = parseInt(selectedProduct.price.replace(/\D/g, ''));
      let amount = priceValue * 100;

      // Apply coupon discount if applicable
      if (appliedCoupon) {
        if (appliedCoupon.discountType === 'percentage') {
          amount = Math.round(amount * (1 - appliedCoupon.value / 100));
        } else if (appliedCoupon.discountType === 'fixed') {
          amount = Math.max(0, amount - appliedCoupon.value * 100);
        }
      }

      const isSubscription = selectedProduct.price.includes('/mês');

      // Save pending data to finalize after redirect
      let currentFirebaseUid = user?.uid;
      
      if (!user) {
        if (!authData.email || !authData.password || !authData.name || !authData.birthDate) {
          setAuthError('Por favor, preencha todos os campos obrigatórios.');
          setIsProcessingPayment(false);
          return;
        }
        if (authData.password.length < 6) {
          setAuthError('A senha deve ter pelo menos 6 caracteres.');
          setIsProcessingPayment(false);
          return;
        }
        
        // Create account BEFORE checkout to have a firebaseUid
        try {
          const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
          currentFirebaseUid = userCredential.user.uid;
          
          // Pre-create user doc
          try {
            await setDoc(doc(db, 'users', currentFirebaseUid), {
              uid: currentFirebaseUid,
              name: authData.name,
              email: authData.email,
              birthDate: authData.birthDate,
              whatsapp: authData.whatsapp || '',
              role: 'user',
              paidStatus: false,
              createdAt: new Date().toISOString()
            }, { merge: true });
          } catch (error) {
            handleFirestoreError(error, OperationType.WRITE, `users/${currentFirebaseUid}`);
          }
        } catch (e: any) {
          if (e.code === 'auth/email-already-in-use') {
            const userCredential = await signInWithEmailAndPassword(auth, authData.email, authData.password);
            currentFirebaseUid = userCredential.user.uid;
          } else if (e.code === 'auth/operation-not-allowed') {
            throw new Error("O cadastro por e-mail/senha não está habilitado no Firebase. Por favor, habilite-o no console do Firebase.");
          } else {
            throw e;
          }
        }
        
        localStorage.setItem('pending_auth_data', JSON.stringify(authData));
      } else {
        localStorage.setItem('pending_auth_data', JSON.stringify({ email: user.email, name: user.displayName }));
      }
      localStorage.setItem('pending_product', JSON.stringify(selectedProduct));

      // Call server to create checkout session
      const response = await fetch('/api/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: selectedProduct.name,
          amount: amount,
          isSubscription: isSubscription,
          customerEmail: user?.email || authData.email,
          firebaseUid: currentFirebaseUid,
          metadata: {
            productName: selectedProduct.name,
            whatsapp: authData.whatsapp,
            firebaseUid: currentFirebaseUid
          }
        }),
      });

      const { url, error } = await response.json();

      if (error) {
        throw new Error(error);
      }

      // Redirect to Stripe
      window.location.href = url;
    } catch (err: any) {
      console.error("Checkout error:", err);
      if (err.code === 'auth/network-request-failed') {
        setAuthError(
          <div className="space-y-4">
            <p>Erro de conexão: O Google Firebase está sendo bloqueado pela sua rede ou ad-blocker.</p>
            <p className="text-[10px] opacity-80 italic">DICA: Tente abrir o app em uma NOVA ABA (ícone no canto superior direito).</p>
          </div>
        );
      } else {
        setAuthError(err.message || "Ocorreu um erro ao processar o pagamento.");
      }
      setIsProcessingPayment(false);
    }
  };

  const startQuiz = () => {
    showPage('quiz');
    setCurrentIndex(0);
  };

  const handleAnswer = (value: string) => {
    const newAnswers = [...answers, value];
    setAnswers(newAnswers);
    
    if (currentIndex + 1 >= questions.length) {
      finishQuiz(newAnswers);
    } else {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleTriageAnswer = (index: number) => {
    const letters = ["A", "B", "C", "D"];
    const newAnswers = [...triageAnswers, letters[index]];
    setTriageAnswers(newAnswers);
    
    if (triageIndex < triageQuestions.length - 1) {
      setTriageIndex(triageIndex + 1);
    } else {
      calculateTriageResult(newAnswers);
    }
  };

  const calculateTriageResult = (finalAnswers: string[]) => {
    const contagem: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
    finalAnswers.forEach(r => contagem[r]++);
    
    const maior = Object.keys(contagem).reduce((a, b) => contagem[a] > contagem[b] ? a : b);
    
    let result = { title: "", text: "", button: "", target: 'home' as Page };
    
    if (maior === "A") {
      result = {
        title: "Clareza emocional",
        text: "Você está em um momento de excesso mental e precisa organizar o que está confuso antes de agir.",
        button: "Ir para Clube Clarear",
        target: 'clube_clarear_info'
      };
    } else if (maior === "B") {
      result = {
        title: "Regulação emocional",
        text: "Existe uma carga emocional ativa influenciando suas decisões.",
        button: "Ir para Reprogramação Pessoal",
        target: 'reprogramacao_pessoal_info'
      };
    } else if (maior === "C") {
      result = {
        title: "Direcionamento",
        text: "Você precisa de respostas externas claras para avançar.",
        button: "Ir para Clube do Tarô",
        target: 'clube_taro_info'
      };
    } else {
      result = {
        title: "Estrutura",
        text: "Você precisa organizar sua posição interna e suas decisões.",
        button: "Ir para Diagnóstico POSIÇÃO",
        target: 'diagnostico_info'
      };
    }
    
    setTriageResult(result);
    setPage('triage_result');
  };

  const startTriage = () => {
    setTriageIndex(0);
    setTriageAnswers([]);
    setPage('triage_quiz');
  };

  const finishQuiz = async (finalAnswers: string[]) => {
    showPage('analysis');
    
    // Calculate archetype based on most frequent answer
    const counts: { [key: string]: number } = {};
    finalAnswers.forEach(a => counts[a] = (counts[a] || 0) + 1);
    const mostFrequent = Object.keys(counts).reduce((a, b) => (counts[a] || 0) > (counts[b] || 0) ? a : b);
    
    let arcanoName = '';
    let theme = '';
    
    switch(mostFrequent) {
      case 'A': arcanoName = 'Imperador'; theme = 'Rigidez e Controle'; break;
      case 'B': arcanoName = 'Justica'; theme = 'Sobrecarga e Dever'; break;
      case 'C': arcanoName = 'Roda da Fortuna'; theme = 'Evitação e Flexibilidade'; break;
      case 'D': arcanoName = 'Eremita'; theme = 'Isolamento e Proteção'; break;
      default: arcanoName = 'Louco'; theme = 'Busca por Sentido';
    }

    const arcanoData = ARCANOS_MATRIZ.find(a => a.arcano === arcanoName) || ARCANOS_MATRIZ[0];
    setSelectedArcano(arcanoData);

    // Save to Firestore
    if (user) {
      try {
        const diagRef = doc(collection(db, 'diagnosticos'));
        await setDoc(diagRef, {
          userId: user.uid,
          userName: userData?.name || user.email || 'Usuário',
          archetype: arcanoData.arcano,
          theme,
          answers: finalAnswers,
          arcanoData,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'diagnosticos');
      }
    }
    
    setMapeamentoResult(`Sua análise revelou o arquétipo **${arcanoData.arcano}**. Sua temática principal é **${theme}**.`);
    
    setTimeout(() => {
      setAnalysisText(`Seu padrão dominante é ${arcanoData.arcano}. Isso revela uma tendência a ${theme.toLowerCase()}.`);
    }, 1500);

    setTimeout(() => {
      showPage('final');
    }, 3500);
  };

  const progress = (currentIndex / questions.length) * 100;

  if (loading) return <div className="flex items-center justify-center h-screen text-gold-main font-serif italic text-xl">Inspirando clareza...</div>;

  return (
    <>
      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[100] px-6 py-3 rounded-2xl border flex items-center gap-3 shadow-2xl backdrop-blur-xl ${
              notification.type === 'success' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
              notification.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
              'bg-gold-main/10 border-gold-main/20 text-gold-main'
            }`}
          >
            {notification.type === 'success' ? <CheckCircle size={18} /> : 
             notification.type === 'error' ? <X size={18} /> : 
             <Tag size={18} />}
            <span className="text-xs uppercase tracking-widest font-bold">{notification.message}</span>
            <button onClick={() => setNotification(null)} className="ml-4 opacity-40 hover:opacity-100 transition-opacity">
              <X size={14} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="atmosphere"></div>
      <div className="relative z-10 min-h-screen">
        {/* User Status Bar */}
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row justify-between items-center px-6 py-6 md:py-8 gap-4 sm:gap-0">
          <h1 className="text-xl md:text-2xl text-gold-main tracking-widest uppercase text-sm font-light">Posição</h1>
          {user ? (
            <div className="flex items-center gap-3 md:gap-4 text-gold-main/80 text-[10px] md:text-xs">
              <div className="flex items-center gap-2">
                <UserIcon size={12} className="md:w-3.5 md:h-3.5" />
                <span className="font-light tracking-wide truncate max-w-[100px] sm:max-w-none">{user.email?.split('@')[0]}</span>
              </div>
              {isAdmin && (
                <button 
                  onClick={() => showPage('admin_dashboard')}
                  className="bg-gold-main/10 text-gold-main px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium hover:bg-gold-main/20 transition-colors flex items-center gap-2"
                >
                  <Settings size={12} />
                  Admin
                </button>
              )}
              <button 
                onClick={() => showPage('jornada_emocional')}
                className="bg-gold-main/10 text-gold-main px-3 py-1 rounded-full text-[10px] uppercase tracking-widest font-medium hover:bg-gold-main/20 transition-colors flex items-center gap-2"
              >
                <History size={12} />
                Minha Jornada
              </button>
              <button onClick={handleLogout} className="text-gold-main/40 hover:text-gold-main transition-colors">
                <LogOut size={14} />
              </button>
            </div>
          ) : (
            <button 
              onClick={() => setPage('auth')} 
              className="text-gold-main/60 hover:text-gold-main text-xs flex items-center gap-2 uppercase tracking-widest font-light"
            >
              <LogIn size={14} /> Entrar
            </button>
          )}
        </div>

        <AnimatePresence mode="wait">
          {page === 'home' && (
            <motion.div 
              key="home"
              variants={containerVariants}
              initial="hidden"
              animate="visible"
              exit={{ opacity: 0, transition: { duration: 0.3 } }}
              className="animate-screen max-w-5xl mx-auto"
            >
              <motion.header variants={itemVariants} className="mb-16 md:mb-32 flex flex-col sm:flex-row justify-between items-center sm:items-end text-center sm:text-left gap-8">
                <div>
                  <h1 className="serif text-5xl md:text-6xl text-gold-light mb-4">Posição</h1>
                  <p className="text-gold-main/30 uppercase tracking-[0.4em] md:tracking-[0.6em] text-[9px] md:text-[10px] font-bold">Alinhamento Interno</p>
                </div>
                <div className="flex flex-col gap-6 items-center sm:items-end">
                  {isAdmin && (
                    <button 
                      onClick={() => showPage('admin_dashboard')}
                      className="text-emerald-400 hover:text-emerald-300 transition-all duration-500 text-[10px] uppercase tracking-[0.3em] font-bold pb-2 border-b border-emerald-500/10 hover:border-emerald-500 flex items-center gap-2"
                    >
                      <ShieldCheck size={14} /> Admin
                    </button>
                  )}
                  <button 
                    onClick={() => user ? setPage('jornada_emocional') : showPage('auth')}
                    className="text-gold-main/40 hover:text-gold-main transition-all duration-500 text-[10px] uppercase tracking-[0.3em] font-bold pb-2 border-b border-gold-main/10 hover:border-gold-main"
                  >
                    {user ? 'Painel' : 'Acessar'}
                  </button>
                </div>
              </motion.header>

              <motion.div variants={itemVariants} className="space-y-12 md:space-y-24">
                {/* Triage Quiz Section */}
                <div className="glass-card border-gold-main/20 bg-gold-main/[0.02] p-8 md:p-12 text-center max-w-3xl mx-auto">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.5em] block font-bold mb-6">Orientação</span>
                  <h2 className="serif text-4xl text-gold-light mb-6">Não sabe por onde começar?</h2>
                  <p className="text-white/40 text-sm font-light leading-relaxed mb-10 max-w-xl mx-auto">
                    Faça o teste rápido de 15 perguntas para identificar sua necessidade imediata e descobrir qual caminho do POSIÇÃO é o mais indicado para o seu momento atual.
                  </p>
                  <button 
                    onClick={startTriage}
                    className="button px-12"
                  >
                    Descobrir meu Caminho
                  </button>
                </div>

                {/* Hero text: apresentação antes dos Caminhos */}
                <motion.div variants={itemVariants} className="text-center max-w-2xl mx-auto space-y-4 py-8">
                  <p className="text-white/25 text-[10px] uppercase tracking-[0.5em] font-bold">
                    Alinhamento Interno
                  </p>
                  <h2 className="serif text-4xl md:text-5xl text-gold-light leading-tight font-serif">
                    Quando sua base está desalinhada,<br />
                    <em className="text-gold-main/70 font-light italic">tudo parece mais difícil.</em>
                  </h2>
                  <p className="text-white/35 font-light leading-relaxed text-base max-w-lg mx-auto">
                    Decisões, relacionamentos, propósito — tudo flui melhor quando você está em posição.
                    Escolha o caminho que faz sentido para o seu momento agora.
                  </p>
                </motion.div>

                {/* Main Journeys Section */}
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-[1px] flex-1 bg-gold-main/10" />
                    <h3 className="serif text-3xl text-gold-light/60">Caminhos POSIÇÃO</h3>
                    <div className="h-[1px] flex-1 bg-gold-main/10" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-12">
                    {[
                      {
                        id: 'mapeamento_intro',
                        title: 'Mapeamento Emocional Floral',
                        desc: 'Descubra sua emoção dominante, seu arquétipo ativo e sua fórmula floral personalizada.',
                        tag: 'Mapeamento',
                        cta: 'Descobrir meu padrão',
                      },
                      {
                        id: 'rituais_mes_info',
                        title: 'Rituais do Mês',
                        desc: 'Reconecte-se com os ciclos da vida. Rituais lunares guiados, entregues direto para você praticar no seu ritmo.',
                        tag: 'Agenda',
                        cta: 'Ver rituais do mês',
                      },
                      {
                        id: 'clube_taro_info',
                        title: 'Clube do Tarô',
                        desc: 'Orientação semanal e leitura energética mensal para manter o fluxo constante.',
                        tag: 'Comunidade',
                        cta: 'Entrar para o Clube',
                      },
                      {
                        id: 'biblioteca',
                        title: 'Biblioteca de E-books',
                        desc: 'Sua estante virtual premium de materiais, guias e e-books exclusivos.',
                        tag: 'Conteúdo Premium',
                        cta: 'Explorar biblioteca',
                      },
                      {
                        id: 'clube_clarear_info',
                        title: 'Clube Clarear',
                        desc: isAdmin
                          ? 'Práticas semanais focadas em clareza mental e estabilidade emocional profunda.'
                          : 'Em breve: práticas semanais focadas em clareza mental e estabilidade emocional.',
                        tag: isAdmin ? 'Prática' : 'Em Breve',
                        cta: isAdmin ? 'Acessar o Clube' : 'Entrar na lista de espera',
                      },
                      {
                        id: 'reprogramacao_pessoal_info',
                        title: 'Reprogramação Pessoal',
                        desc: 'Áudio de frequência personalizada para alinhar sua base interna através de uma sessão individual.',
                        tag: 'Atendimento Único',
                        cta: 'Criar minha frequência',
                      },
                      {
                        id: 'diagnostico_info',
                        title: 'Diagnóstico POSIÇÃO',
                        desc: 'Mapeie sua frequência atual e descubra o caminho exato para o seu alinhamento.',
                        tag: 'Mapeamento',
                        cta: 'Iniciar diagnóstico',
                      },
                    ].map((item) => (
                      <motion.div 
                        key={item.id}
                        variants={itemVariants}
                        className="glass-card flex flex-col justify-between group cursor-pointer"
                        onClick={() => {
                          if (item.id === 'clube_clarear_info' && !isAdmin) {
                            setNotification({
                              message: '✉️ Lista de espera aberta! Em breve você receberá novidades.',
                              type: 'info'
                            });
                            return;
                          }
                          if (item.id === 'biblioteca') {
                            navigate('/biblioteca');
                          } else {
                            showPage(item.id as Page);
                          }
                        }}
                      >
                        <div>
                          <span className="text-gold-main/20 text-[9px] uppercase tracking-[0.3em] mb-6 block font-bold">{item.tag}</span>
                          <h2 className="serif text-4xl text-gold-light mb-6 group-hover:text-gold-main transition-colors duration-500">{item.title}</h2>
                          <p className="text-white/40 text-sm leading-relaxed mb-10 font-light">{item.desc}</p>
                        </div>
                        <button className="button-outline w-full">{item.cta}</button>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Secondary Section: Sessões Individuais */}
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-[1px] flex-1 bg-gold-main/10" />
                    <h3 className="serif text-3xl text-gold-light/60">Sessões Individuais</h3>
                    <div className="h-[1px] flex-1 bg-gold-main/10" />
                  </div>
                  <div className="grid md:grid-cols-1 max-w-2xl mx-auto">
                    {[
                      { id: 'reprogramar_eu_info', title: 'Reprograme-se', desc: 'Processo guiado completo para reorganizar padrões e crenças limitantes.', tag: 'Transformação' }
                    ].map((item) => (
                      <motion.div 
                        key={item.id}
                        variants={itemVariants}
                        className="glass-card flex flex-col md:flex-row items-center justify-between group cursor-pointer gap-8"
                        onClick={() => showPage(item.id as Page)}
                      >
                        <div className="flex-1">
                          <span className="text-gold-main/20 text-[9px] uppercase tracking-[0.3em] mb-4 block font-bold">Atendimento Único</span>
                          <h2 className="serif text-3xl text-gold-light mb-4 group-hover:text-gold-main transition-colors duration-500">{item.title}</h2>
                          <p className="text-white/40 text-sm font-light leading-relaxed">{item.desc}</p>
                        </div>
                        <button className="button-outline whitespace-nowrap px-8">Saber Mais</button>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </motion.div>

              <motion.footer variants={itemVariants} className="mt-40 text-center pb-20">
                <div className="w-12 h-[1px] bg-gold-main/20 mx-auto mb-10" />
                <p className="text-gold-main/20 text-[9px] uppercase tracking-[0.5em] font-medium">
                  © 2026 Posição • Alinhamento de Frequência
                </p>
              </motion.footer>
            </motion.div>
          )}

          {page === 'auth' && (
            <motion.div 
              key="auth"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="animate-screen text-left max-w-md mx-auto"
            >
              <div className="back" onClick={() => setPage('home')}>← Voltar</div>
              <h2 className="serif text-5xl text-gold-light mb-12 text-center">{authMode === 'login' ? 'Bem-vindo' : 'Criar Conta'}</h2>
              
              <div className="glass-card p-6 md:p-10">
                <form onSubmit={handleAuth} className="flex flex-col gap-8">
                  {authMode === 'signup' && (
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Nome Completo</label>
                      <input 
                        type="text" 
                        value={authData.name}
                        onChange={(e) => setAuthData({...authData, name: e.target.value})}
                        className="input"
                        placeholder="Seu nome"
                        required
                      />
                    </div>
                  )}
                  
                  {authMode === 'signup' && (
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Data de Nascimento</label>
                      <input 
                        type="date" 
                        value={authData.birthDate}
                        onChange={(e) => setAuthData({...authData, birthDate: e.target.value})}
                        className="input"
                        required
                      />
                    </div>
                  )}

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Email</label>
                    <input 
                      type="email" 
                      value={authData.email}
                      onChange={(e) => setAuthData({...authData, email: e.target.value})}
                      className="input"
                      placeholder="email@exemplo.com"
                      required
                    />
                  </div>

                  <div className="flex flex-col gap-3">
                    <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Senha</label>
                    <input 
                      type="password" 
                      value={authData.password}
                      onChange={(e) => setAuthData({...authData, password: e.target.value})}
                      className="input"
                      placeholder="••••••••"
                      required
                    />
                  </div>

                  {authError && (
                    <div className="text-red-400/80 text-xs text-center font-light">
                      {typeof authError === 'string' ? authError : authError}
                    </div>
                  )}

                  <button type="submit" className="button w-full mt-4">
                    {authMode === 'login' ? 'Entrar' : 'Cadastrar'}
                  </button>

                  <div className="relative flex items-center justify-center my-4">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-white/10"></div>
                    </div>
                    <span className="relative px-4 text-[9px] uppercase tracking-widest text-white/20 bg-[#0a0a0a]">ou</span>
                  </div>

                  <button 
                    type="button" 
                    onClick={handleGoogleSignIn}
                    className="flex items-center justify-center gap-3 w-full py-4 px-6 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 transition-all text-xs tracking-widest uppercase font-bold"
                  >
                    <svg className="w-4 h-4" viewBox="0 0 24 24">
                      <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                      <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                      <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
                      <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                    </svg>
                    Entrar com Google
                  </button>
                </form>

                <div className="mt-10 text-center flex flex-col gap-4">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
                  >
                    {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'mapeamento_intro' && (
            <motion.div 
              key="mapeamento_intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-center max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => setPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Mapeamento Emocional Floral
              </p>
              <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-6 block font-bold">🌿 Mapeamento Emocional Floral</span>
              <h2 className="serif text-5xl md:text-6xl text-gold-light mb-12">Você não sente o que sente por acaso.</h2>
              
              <div className="glass-card p-6 md:p-10 text-left mb-12">
                <p className="text-white/60 mb-8 leading-relaxed text-lg font-light">
                  Existe um padrão emocional ativo influenciando suas decisões, seu comportamento e até sua energia.
                </p>
                <p className="text-white/60 mb-10 leading-relaxed text-lg font-light">
                  Neste mapeamento, você vai acessar:
                </p>
                <div className="space-y-4 mb-12">
                  {[
                    'Sua emoção dominante',
                    'O padrão que está se repetindo',
                    'O arquétipo ativo no seu campo',
                    'Sua fórmula floral personalizada'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/80">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main" />
                      {item}
                    </div>
                  ))}
                </div>
                <div className="text-center space-y-4">
                  <div className="text-gold-main text-3xl serif mb-4">
                    {appliedCoupon ? (
                      <div className="flex flex-col items-center">
                        <span className="text-white/20 text-xs line-through">R$ 9,00</span>
                        <span>R$ {Math.max(0, (9 * (appliedCoupon.discountType === 'percentage' ? (1 - appliedCoupon.value / 100) : 1) - (appliedCoupon.discountType === 'fixed' ? appliedCoupon.value : 0))).toFixed(0)},00</span>
                      </div>
                    ) : 'R$ 9,00'}
                  </div>

                  {(isAdmin || (access?.mappingCredits && access.mappingCredits > 0)) ? (
                    <div className="mb-6">
                      {isAdmin ? (
                        <span className="text-gold-main text-xs uppercase tracking-widest block mb-4">
                          👑 Modo Administrador: Acesso Liberado
                        </span>
                      ) : (
                        <span className="text-emerald-400 text-xs uppercase tracking-widest block mb-4">
                          ✨ Você possui {access.mappingCredits} {access.mappingCredits === 1 ? 'crédito' : 'créditos'}
                        </span>
                      )}
                      <button 
                        type="button"
                        onClick={() => showPage('mapeamento_form')}
                        className="button w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                      >
                        ✨ Iniciar meu Mapeamento
                      </button>
                    </div>
                  ) : (
                    <button 
                      type="button"
                      onClick={() => {
                        setSelectedProduct({ name: 'Mapeamento Emocional Floral', price: 'R$ 9' });
                        showPage('checkout');
                      }}
                      className="button w-full"
                    >
                      👉 Quero acessar meu mapeamento
                    </button>
                  )}

                  {isAdmin && (
                    <button 
                      type="button"
                      onClick={() => showPage('mapeamento_form')}
                      className="text-emerald-400 hover:text-emerald-300 text-[10px] uppercase tracking-widest font-bold flex items-center justify-center gap-2 py-4 border border-emerald-500/20 rounded-2xl bg-emerald-500/5 hover:bg-emerald-500/10 transition-all w-full"
                    >
                      <ShieldCheck size={14} /> Testar Mapeamento (Admin)
                    </button>
                  )}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'mapeamento_form' && (
            <motion.div 
              key="mapeamento_form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => {
                if (currentMapeamentoStep > 0) {
                  setCurrentMapeamentoStep(currentMapeamentoStep - 1);
                } else {
                  setPage('home');
                }
              }}>← {currentMapeamentoStep > 0 ? 'Voltar Pergunta' : 'Sair'}</div>
              
              <div className="flex justify-between items-center mb-8">
                <div>
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-2 block font-bold">Mapeamento Emocional Floral</span>
                  <h2 className="serif text-3xl text-gold-light">Pergunta {currentMapeamentoStep + 1} de {mapeamentoQuestions.length}</h2>
                </div>
                <div className="text-right">
                  <span className="text-gold-main text-xl font-serif">{Math.round(((currentMapeamentoStep) / mapeamentoQuestions.length) * 100)}%</span>
                </div>
              </div>

              <div className="h-1 w-full bg-white/5 rounded-full mb-12 overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${((currentMapeamentoStep) / mapeamentoQuestions.length) * 100}%` }}
                  className="h-full bg-gold-main shadow-[0_0_15px_rgba(212,175,55,0.5)]"
                />
              </div>
              
              <div className="space-y-8">
                <h3 className="serif text-2xl text-gold-light leading-relaxed">
                  {mapeamentoQuestions[currentMapeamentoStep].pergunta}
                </h3>

                <div className="grid grid-cols-1 gap-4">
                  {mapeamentoQuestions[currentMapeamentoStep].opcoes.map((opcao, idx) => (
                    <button
                      key={idx}
                      onClick={async () => {
                        const newAnswers = [...mapeamentoAnswers];
                        newAnswers[currentMapeamentoStep] = {
                          pergunta_id: mapeamentoQuestions[currentMapeamentoStep].id,
                          texto: opcao.texto,
                          emocao: opcao.emocao,
                          peso: opcao.peso,
                          florais: opcao.florais,
                          tipo: mapeamentoQuestions[currentMapeamentoStep].tipo
                        };
                        setMapeamentoAnswers(newAnswers);

                        if (currentMapeamentoStep < mapeamentoQuestions.length - 1) {
                          setCurrentMapeamentoStep(currentMapeamentoStep + 1);
                        } else {
                          // Finalize and Analyze
                          setPage('mapeamento_analysis');
                          try {
                            const apiKey = process.env.GEMINI_API_KEY;
                            if (!apiKey || apiKey === 'undefined') {
                              throw new Error("API Key do Gemini não configurada.");
                            }

                            const ai = new GoogleGenAI({ apiKey });
                            
                            // Prepare context for AI
                            const quizContext = newAnswers.map(a => `- ${a.tipo}: ${a.texto} (Emoção: ${a.emocao})`).join('\n');
                            const suggestedFlorais = Array.from(new Set(newAnswers.flatMap(a => a.florais))).join(', ');

                            // Populate mapeamentoData for backward compatibility (e.g. result page logic)
                            const derivedData = {
                              emocao: newAnswers.find(a => a.tipo === 'emocao')?.texto || '',
                              padrao: newAnswers.find(a => a.tipo === 'padrao')?.texto || '',
                              defesa: newAnswers.find(a => a.tipo === 'defesa')?.texto || '',
                              ferida: newAnswers.find(a => a.tipo === 'ferida')?.texto || '',
                              desejo: newAnswers.find(a => a.tipo === 'expansao')?.texto || '',
                              arquetipo: 'Calculado pela IA'
                            };
                            setMapeamentoData(derivedData);

                            // Step 1: Select Florais (Refined by AI)
                            let floraisList = suggestedFlorais;
                            try {
                              const selectResponse = await ai.models.generateContent({
                                model: "gemini-3-flash-preview",
                                contents: `Você é um especialista em Florais de Bach.
Com base nas respostas do quiz abaixo, selecione a fórmula ideal (4 a 6 florais).

RESPOSTAS DO QUIZ:
${quizContext}

FLORAIS SUGERIDOS PELO MAPEAMENTO:
${suggestedFlorais}

REGRAS:
- Selecione entre 4 e 6 florais.
- Priorize os florais que aparecem mais vezes ou que tratam a ferida/emoção central.
- Retorne apenas os nomes dos florais separados por vírgula.`,
                              });
                              floraisList = selectResponse.text || suggestedFlorais;
                            } catch (e) {
                              console.error("Error selecting florais with AI:", e);
                            }

                            // Step 2: Generate Full Report
                            let resultText = "";
                            try {
                              const reportResponse = await ai.models.generateContent({
                                model: "gemini-3.1-pro-preview",
                                contents: `Você é um especialista em análise emocional e Florais de Bach.
Gere um relatório terapêutico personalizado (Mapeamento Emocional Floral).

DADOS DO QUIZ:
${quizContext}

FLORAIS SELECIONADOS:
${floraisList}

LISTA DE ARCANOS POSSÍVEIS (Escolha o que melhor representa o padrão do usuário):
${ARCANOS_MATRIZ.map(a => a.arcano).join(', ')}

ESTRUTURA DA RESPOSTA (Markdown):
1. TÍTULO: "Seu Mapeamento Emocional"
2. ARCANO DETECTADO: Retorne apenas o nome do Arcano escolhido da lista acima. Ex: "ARCANO: Imperador"
3. LEITURA EMOCIONAL: Analise os padrões identificados no quiz (2-3 parágrafos).
4. ARQUÉTIPO ATIVO: Identifique o arquétipo que mais se manifesta nessas respostas e explique por quê.
5. FÓRMULA FLORAL: Liste os florais (${floraisList}) e explique brevemente a função de cada um para este caso.
6. MODO DE USO: 4 gotas, 4 vezes ao dia.
7. TEMPO DE AÇÃO: Percepções em 3-7 dias, ajustes profundos em 21 dias.
8. FRASE DE CONSCIÊNCIA: Uma frase curta e poderosa para o momento do usuário.
9. PRÓXIMO PASSO: Orientação final de evolução.
10. SCORE: Gere um número de 0 a 100 de alinhamento emocional. Retorne como "SCORE: [numero]".`,
                              });
                              resultText = reportResponse.text || "";
                            } catch (e) {
                              console.error("Error generating report with Pro:", e);
                              // Fallback to Flash if Pro fails
                              const fallbackResponse = await ai.models.generateContent({
                                model: "gemini-3-flash-preview",
                                contents: `Gere um relatório simplificado de mapeamento emocional floral com base nestes dados: ${quizContext}. Florais: ${floraisList}. Escolha um Arcano de: ${ARCANOS_MATRIZ.map(a => a.arcano).join(', ')}. Retorne no formato: ARCANO: [Nome], seguido da análise.`,
                              });
                              resultText = fallbackResponse.text || "Não foi possível gerar o relatório completo no momento.";
                            }

                            const scoreMatch = resultText.match(/SCORE:\s*(\d+)/);
                            const score = scoreMatch ? parseInt(scoreMatch[1]) : 75;
                            
                            const arcanoMatch = resultText.match(/ARCANO:\s*([^\n]+)/);
                            let arcanoName = arcanoMatch ? arcanoMatch[1].replace(/[#*:]/g, '').trim() : '';
                            
                            // Robust arcano detection
                            if (!arcanoName || !ARCANOS_MATRIZ.some(a => a.arcano.toLowerCase() === arcanoName.toLowerCase())) {
                              const foundArcano = ARCANOS_MATRIZ.find(a => resultText.toLowerCase().includes(a.arcano.toLowerCase()));
                              if (foundArcano) arcanoName = foundArcano.arcano;
                              else arcanoName = 'Louco'; // Safe fallback
                            }

                            const arcanoData = ARCANOS_MATRIZ.find(a => a.arcano.toLowerCase() === arcanoName.toLowerCase()) || ARCANOS_MATRIZ[0];
                            setSelectedArcano(arcanoData);
                            setCurrentFlorais(floraisList);

                            setMapeamentoResult(resultText);
                            
                              // Save to Firestore
                              if (user) {
                                try {
                                  await addDoc(collection(db, 'mappings'), {
                                    userId: user.uid,
                                    userEmail: user.email,
                                    type: 'mapeamento_floral',
                                    arcano: arcanoName,
                                    answers: newAnswers.map(a => ({
                                      pergunta_id: a.pergunta_id,
                                      emocao: a.emocao,
                                      peso: a.peso
                                    })),
                                    // For backward compatibility in admin/history
                                    emocao: derivedData.emocao,
                                    padrao: derivedData.padrao,
                                    defesa: derivedData.defesa,
                                    ferida: derivedData.ferida,
                                    desejo: derivedData.desejo,
                                    arquetipo: arcanoName,
                                    result: resultText,
                                    alignmentScore: score,
                                    florais: floraisList,
                                    createdAt: new Date().toISOString(),
                                    phrase: resultText.split('FRASE DE CONSCIÊNCIA')[1]?.split('---')[0]?.replace(/[#*:]/g, '').trim() || ''
                                  });

                                // Refresh history
                                const q = query(collection(db, 'mappings'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
                                const querySnapshot = await getDocs(q);
                                const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                                setHistory(docs);

                                // Decrement mapping credits
                                if (!isAdmin) {
                                  await updateDoc(doc(db, 'users', user.uid), {
                                    mappingCredits: increment(-1)
                                  });
                                  refreshAccess(user.uid);
                                }
                                } catch (error) {
                                  handleFirestoreError(error, OperationType.CREATE, 'mappings');
                                  console.error("Firestore save error:", error);
                                  // We don't throw here to still show the result to the user
                                }
                            }

                            setPage('mapeamento_result');
                          } catch (err: any) {
                            console.error("Error in mapping analysis:", err);
                            setMapeamentoResult("Desculpe, ocorreu um erro ao processar sua análise. Por favor, tente novamente em instantes.\n\nDetalhes: " + err.message);
                            setPage('mapeamento_result');
                          }
                        }
                      }}
                      className="w-full p-6 bg-white/5 border border-white/5 rounded-2xl text-left hover:bg-gold-main/10 hover:border-gold-main/30 transition-all group flex justify-between items-center"
                    >
                      <span className="text-white/60 group-hover:text-gold-light transition-colors">{opcao.texto}</span>
                      <ArrowRight size={18} className="text-gold-main/20 group-hover:text-gold-main group-hover:translate-x-1 transition-all" />
                    </button>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'mapeamento_analysis' && (
            <motion.div 
              key="mapeamento_analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-screen flex flex-col items-center justify-center text-center min-h-[60vh]"
            >
              <div className="w-24 h-24 border-2 border-gold-main/20 border-t-gold-main rounded-full animate-spin mb-12" />
              <h2 className="serif text-3xl text-gold-light mb-6">Sintonizando sua frequência...</h2>
              <p className="text-white/40 font-light tracking-widest uppercase text-[10px] animate-pulse">
                Analisando padrões arquetípicos e florais
              </p>
            </motion.div>
          )}

          {page === 'mapeamento_result' && (
            <motion.div 
              key="mapeamento_result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-4xl mx-auto"
            >
              <div className="back" onClick={() => setPage('home')}>← Voltar</div>
              
              {selectedArcano && (
                <div className="mb-12 glass-card border-gold-main/30 bg-gold-main/[0.03] p-8 md:p-12">
                  <div className="flex flex-col md:flex-row gap-12 items-center">
                    <div className="w-48 h-72 bg-gold-main/10 rounded-2xl border border-gold-main/20 flex flex-col items-center justify-center p-6 text-center relative overflow-hidden group">
                      <div className="absolute inset-0 bg-gold-main/5 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <span className="text-gold-main/20 text-[8px] uppercase tracking-[0.5em] mb-4 font-bold">Arquétipo</span>
                      <h3 className="serif text-3xl text-gold-light mb-4">{selectedArcano.arcano}</h3>
                      <div className="w-12 h-[1px] bg-gold-main/30" />
                    </div>
                    
                    <div className="flex-1 space-y-8">
                      <div>
                        <h4 className="text-gold-main/40 text-[10px] uppercase tracking-widest font-bold mb-3">Sombra Ativa</h4>
                        <div className="flex flex-wrap gap-2">
                          {selectedArcano.sombra.map((s, i) => (
                            <span key={i} className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] text-white/60 uppercase tracking-wider">
                              {s.replace(/_/g, ' ')}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div>
                        <h4 className="text-gold-main/40 text-[10px] uppercase tracking-widest font-bold mb-3">Direção de Cura</h4>
                        <p className="text-gold-light text-lg font-light italic">"{selectedArcano.direcao}"</p>
                      </div>

                      <div>
                        <h4 className="text-gold-main/40 text-[10px] uppercase tracking-widest font-bold mb-3">Caminhos de Evolução</h4>
                        <div className="flex flex-wrap gap-4">
                          {selectedArcano.evolucao.map((e, i) => (
                            <div key={i} className="flex items-center gap-2 text-white/40 text-xs">
                              <ArrowRight size={12} className="text-gold-main/40" />
                              <span>{e}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div className="glass-card p-6 md:p-10 md:p-16">
                <div className="markdown-body prose prose-invert max-w-none">
                  <ReactMarkdown>{mapeamentoResult || ''}</ReactMarkdown>
                </div>

                <div className="mt-20 pt-12 border-t border-gold-main/10 text-center">
                  <p className="text-white/60 mb-8 leading-relaxed italic">
                    Existe um nível mais profundo desse padrão que não aparece sozinho. Ele precisa ser acessado e reorganizado.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => {
                        // Logic to suggest session based on pattern
                        const pattern = mapeamentoData.padrao.toLowerCase();
                        if (pattern.includes('ansiedade') || pattern.includes('controle')) {
                          showPage('reprogramacao_pessoal_info');
                        } else if (pattern.includes('confusão') || pattern.includes('indecisão')) {
                          showPage('clube_clarear_info');
                        } else if (pattern.includes('autoestima')) {
                          showPage('reprogramar_eu_info');
                        } else {
                          showPage('reprogramacao_pessoal_info');
                        }
                      }}
                      className="button"
                    >
                      👉 Trabalhar isso com acompanhamento
                    </button>
                    <button 
                      onClick={() => showPage('jornada_emocional')}
                      className="button bg-white/5 border-white/10 text-white/60 hover:bg-white/10"
                    >
                      Ver meu histórico completo
                    </button>
                    <button 
                      onClick={() => generatePrescriptionPDF(userData?.name || user?.displayName || 'Cliente', currentFlorais)}
                      className="button bg-gold-main/20 border-gold-main/40 text-gold-main hover:bg-gold-main/30 flex items-center gap-2 justify-center"
                    >
                      <FileText size={18} /> Baixar Receita (PDF)
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'diagnostico_info' && (
            <motion.div 
              key="diagnostico_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Diagnóstico POSIÇÃO
              </p>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Mapeamento de Frequência</span>
                </div>
                <h2 className="serif text-4xl md:text-5xl text-gold-light mb-6">Diagnóstico POSIÇÃO</h2>
                <div className="price mb-8 md:mb-10">R$ 69</div>
                
                <p className="text-white/40 mb-8 md:mb-12 leading-relaxed text-base md:text-lg font-light">
                  Uma jornada profunda para identificar os padrões invisíveis que moldam sua realidade e descobrir o caminho para o seu alinhamento essencial.
                </p>
                
                <div className="space-y-6 mb-16">
                  {[
                    'Acesso vitalício ao questionário estruturado',
                    'Análise personalizada via áudio de frequência',
                    'Mapa de posicionamento interno exclusivo',
                    'Suporte prioritário para dúvidas'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main/40" />
                      {item}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    setSelectedProduct({ name: 'Diagnóstico POSIÇÃO', price: 'R$ 69' });
                    showPage('checkout');
                  }}
                  className="button w-full"
                >
                  Iniciar Jornada
                </button>
              </div>
            </motion.div>
          )}

          {page === 'reprogramacao_pessoal_info' && (
            <motion.div 
              key="reprogramacao_pessoal_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Reprogramação Pessoal
              </p>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Frequência Personalizada</span>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-6">Reprogramação Pessoal</h2>
                <div className="price mb-10">R$ 129</div>
                
                <p className="text-white/40 mb-12 leading-relaxed text-lg font-light">
                  Um áudio de frequência exclusiva, desenhado para dissolver crenças limitantes e reorganizar sua base vibracional interna.
                </p>
                
                <div className="space-y-6 mb-16">
                  {[
                    'Diagnóstico profundo de padrões limitantes',
                    'Frequências sonoras de alinhamento específico',
                    'Sugestões subliminares personalizadas',
                    'Guia prático de escuta e integração'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main/40" />
                      {item}
                    </div>
                  ))}
                </div>

                {access?.reprogramacao_pessoal_comprada ? (
                  <button 
                    onClick={() => showPage('reprogramacao_form')}
                    className="button w-full"
                  >
                    Preencher Questionário
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedProduct({ name: 'Reprogramação Pessoal', price: 'R$ 129' });
                      showPage('checkout');
                    }}
                    className="button w-full"
                  >
                    Criar Minha Frequência
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {page === 'clube_clarear_info' && (
            <motion.div 
              key="clube_clarear_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Clube Clarear
              </p>
              {!isAdmin ? (
                <div className="glass-card p-12 text-center">
                  <Clock className="mx-auto text-gold-main/20 mb-6" size={48} />
                  <h2 className="serif text-3xl text-gold-light mb-4">Em Construção</h2>
                  <p className="text-white/40 mb-8">Estamos preparando as melhores práticas para você. O Clube Clarear estará disponível em breve!</p>
                  <button onClick={() => showPage('home')} className="button-outline">Voltar ao Início</button>
                </div>
              ) : (
                <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Manutenção Diária</span>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-6">Clube Clarear</h2>
                <div className="price mb-10">R$ 39 <span className="text-xs uppercase tracking-widest text-white/20">/ mês</span></div>
                
                <p className="text-white/40 mb-12 leading-relaxed text-lg font-light">
                  Práticas semanais focadas em limpar a névoa mental e emocional, mantendo sua clareza e base interna inabaláveis.
                </p>
                
                <div className="space-y-6 mb-16">
                  {[
                    'Prática de alinhamento inédita toda semana',
                    'Biblioteca completa de meditações guiadas',
                    'Comunidade exclusiva de membros',
                    'Descontos em outros produtos de 20%'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main/40" />
                      {item}
                    </div>
                  ))}
                </div>

                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => {
                      setSelectedProduct({ name: 'Clube Clarear', price: 'R$ 39 /mês' });
                      showPage('checkout');
                    }}
                    className="button w-full"
                  >
                    Fazer Parte do Clube
                  </button>
                  
                  {user && (
                    <button 
                      onClick={() => showPage('clube_clarear_content')}
                      className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-[0.2em] font-bold mt-4"
                    >
                      Já sou membro, acessar conteúdo
                    </button>
                  )}
                </div>
              </div>
              )}
            </motion.div>
          )}

          {page === 'rituais_mes_info' && (
            <motion.div 
              key="rituais_mes_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Rituais do Mês
              </p>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01] mb-12">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Agenda Mensal</span>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-6">Rituais do Mês</h2>
                <p className="text-white/40 mb-8 leading-relaxed text-lg font-light">
                  Rituais coletivos, realizados off-line e enviados por mensagem vídeo e áudio para sua prática individual. Escolha abaixo o ritual que deseja participar:
                </p>
              </div>

              <div className="grid gap-6">
                {rituais_mes.map((ritual) => (
                  <motion.div 
                    key={ritual.id}
                    whileHover={{ y: -5 }}
                    className="glass-card p-8 border-gold-main/10 bg-white/[0.02] group"
                  >
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-gold-main/40 text-[10px] uppercase tracking-widest block">{ritual.date}</span>
                          <span className="text-gold-main/20 text-[10px] uppercase tracking-widest block">•</span>
                          <span className="text-gold-main/60 text-[10px] uppercase tracking-widest block font-bold">{ritual.phase}</span>
                          {ritual.spiritual && (
                            <>
                              <span className="text-gold-main/20 text-[10px] uppercase tracking-widest block">•</span>
                              <span className="text-gold-main/80 text-[10px] uppercase tracking-widest block font-bold italic">{ritual.spiritual}</span>
                            </>
                          )}
                        </div>
                        <h3 className="serif text-2xl text-gold-light group-hover:text-gold-main transition-colors">{ritual.title}</h3>
                      </div>
                      <div className="text-gold-main font-medium">{ritual.price}</div>
                    </div>
                    <p className="text-white/40 text-sm font-light mb-6 leading-relaxed">
                      {ritual.description}
                    </p>
                    
                    <div className="mb-6">
                      <p className="text-gold-main/30 text-[9px] uppercase tracking-widest mb-3 font-bold">Importância</p>
                      <p className="text-white/30 text-xs italic font-light leading-relaxed">
                        "{ritual.importance}"
                      </p>
                    </div>

                    <div className="mb-8">
                      <p className="text-gold-main/30 text-[9px] uppercase tracking-widest mb-3 font-bold">Benefícios</p>
                      <div className="flex flex-wrap gap-2">
                        {ritual.benefits.map((benefit, idx) => (
                          <span key={idx} className="text-[9px] text-white/40 bg-white/5 px-2 py-1 rounded-full border border-white/5">
                            {benefit}
                          </span>
                        ))}
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setSelectedProduct({ name: `Ritual: ${ritual.title}`, price: ritual.price });
                        showPage('checkout');
                      }}
                      className="button-outline w-full py-4 text-xs tracking-[0.2em]"
                    >
                      Participar deste Ritual
                    </button>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {page === 'clube_clarear_content' && (
            <motion.div 
              key="clube_clarear_content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-4xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Conteúdo do Clube Clarear
              </p>
              
              {!isAdmin ? (
                <div className="glass-card p-12 text-center">
                  <Clock className="mx-auto text-gold-main/20 mb-6" size={48} />
                  <h2 className="serif text-3xl text-gold-light mb-4">Em Construção</h2>
                  <p className="text-white/40 mb-8">Estamos preparando as melhores práticas para você. O Clube Clarear estará disponível em breve!</p>
                  <button onClick={() => showPage('home')} className="button-outline">Voltar ao Início</button>
                </div>
              ) : (
                <>
                  <header className="mb-10 md:mb-16 flex justify-between items-end">
                    <div>
                      <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Área de Membros</span>
                      <h2 className="serif text-4xl md:text-5xl text-gold-light mb-6">Clube Clarear</h2>
                    </div>
                  </header>

                  <div className="grid gap-8">
                {meditationList.map((meditation) => (
                  <div 
                    key={meditation.id}
                    className={`glass-card p-8 flex flex-col md:flex-row items-center gap-8 transition-all duration-500 ${currentAudio === meditation.id ? 'border-gold-main/40 bg-gold-main/[0.03]' : 'border-gold-main/10 hover:border-gold-main/30'}`}
                  >
                    <div 
                      onClick={() => toggleAudio(meditation.id)}
                      className={`w-16 h-16 rounded-full flex items-center justify-center cursor-pointer transition-all duration-500 ${currentAudio === meditation.id && isPlaying ? 'bg-gold-main text-black' : 'bg-gold-main/10 text-gold-main hover:bg-gold-main/20'}`}
                    >
                      {currentAudio === meditation.id && isPlaying ? <Pause size={24} /> : <Play size={24} className="ml-1" />}
                    </div>

                    <div className="flex-1 text-center md:text-left">
                      <div className="flex flex-col md:flex-row md:items-center gap-4 mb-2">
                        <h3 className="serif text-2xl text-gold-light">{meditation.title}</h3>
                        <div className="flex items-center justify-center md:justify-start gap-2 text-gold-main/40 text-[10px] uppercase tracking-widest font-bold">
                          <Clock size={12} />
                          <span>{meditation.duration}</span>
                        </div>
                      </div>
                      <p className="text-white/40 text-sm font-light leading-relaxed">
                        {meditation.description}
                      </p>
                    </div>

                    {currentAudio === meditation.id && (
                      <div className="flex items-center gap-4 text-gold-main animate-pulse">
                        <Music size={16} />
                        <span className="text-[10px] uppercase tracking-widest font-bold">Reproduzindo</span>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <audio 
                ref={audioRef} 
                onEnded={() => setIsPlaying(false)}
                onPlay={() => setIsPlaying(true)}
                onPause={() => setIsPlaying(false)}
                className="hidden"
              />

              <footer className="mt-20 text-center pb-20">
                <p className="text-gold-main/20 text-[9px] uppercase tracking-[0.5em] font-medium">
                  Novas práticas todas as segundas-feiras
                </p>
              </footer>
              </>
              )}
            </motion.div>
          )}

          {page === 'clube_taro_content' && (
            <motion.div 
              key="clube_taro_content"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-4xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Conteúdo do Clube do Tarô
              </p>
              
              <header className="mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Área de Membros</span>
                  <h2 className="serif text-4xl md:text-5xl text-gold-light mb-6">Clube do Tarô</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de fazer minha pergunta semanal do Clube do Tarô.', '_blank')}
                    className="button bg-emerald-500/10 border-emerald-500/30 text-emerald-400 flex items-center gap-3 px-6 py-3 rounded-full hover:bg-emerald-500/20 transition-all"
                  >
                    <MessageCircle size={18} />
                    Pergunta Semanal (WhatsApp)
                  </button>
                </div>
              </header>

              <div className="grid gap-12">
                <section className="glass-card p-8 md:p-12 border-gold-main/20">
                  <div className="flex items-center gap-4 mb-8">
                    <div className="w-12 h-12 rounded-full bg-gold-main/10 flex items-center justify-center text-gold-main">
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="serif text-2xl text-gold-light">Leitura do Mês</h3>
                      <p className="text-gold-main/30 text-[10px] uppercase tracking-widest font-bold">Março 2026</p>
                    </div>
                  </div>
                  
                  <div className="prose prose-invert max-w-none text-white/60 font-light leading-relaxed space-y-6">
                    <p>Este mês, as energias indicam um período de colheita e reflexão profunda. A carta central é **A Estrela**, sugerindo esperança, renovação e clareza espiritual.</p>
                    <p>É o momento ideal para alinhar seus desejos mais profundos com suas ações diárias. Não tenha medo de brilhar sua própria luz, mesmo que o caminho pareça incerto.</p>
                    <div className="p-6 bg-gold-main/5 border-l-2 border-gold-main rounded-r-xl italic">
                      "A clareza não vem de fora, mas do silêncio que você permite dentro de si."
                    </div>
                  </div>
                </section>

                <section className="grid md:grid-cols-2 gap-8">
                  <div className="glass-card p-8 border-white/5 hover:border-gold-main/20 transition-all group">
                    <h4 className="serif text-xl text-gold-light mb-4">Sua Pergunta Semanal</h4>
                    <p className="text-white/40 text-sm mb-6 font-light">Você tem direito a uma pergunta direcionada por semana. Nossa equipe responderá em até 24h úteis.</p>
                    <button 
                      onClick={() => window.open('https://wa.me/5511999999999?text=Olá! Gostaria de fazer minha pergunta semanal do Clube do Tarô.', '_blank')}
                      className="text-emerald-400 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2 group-hover:gap-4 transition-all"
                    >
                      Enviar agora <ArrowRight size={14} />
                    </button>
                  </div>
                  <div className="glass-card p-8 border-white/5 hover:border-gold-main/20 transition-all group">
                    <h4 className="serif text-xl text-gold-light mb-4">Arquivo de Leituras</h4>
                    <p className="text-white/40 text-sm mb-6 font-light">Acesse as leituras energéticas de meses anteriores para acompanhar sua evolução.</p>
                    <button className="text-gold-main/40 text-[10px] uppercase tracking-widest font-bold flex items-center gap-2">
                      Em breve <Clock size={14} />
                    </button>
                  </div>
                </section>
              </div>

              <footer className="mt-20 text-center pb-20">
                <p className="text-gold-main/20 text-[9px] uppercase tracking-[0.5em] font-medium">
                  Sabedoria Ancestral • Conexão Diária
                </p>
              </footer>
            </motion.div>
          )}

          {page === 'reprogramar_eu_info' && (
            <motion.div 
              key="reprogramar_eu_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Reprograme-se
              </p>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Transformação Estrutural</span>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-6">Reprograme-se</h2>
                <div className="price mb-10">R$ 249</div>
                
                <p className="text-white/40 mb-12 leading-relaxed text-lg font-light">
                  Um processo guiado completo e profundo para quem deseja reorganizar padrões internos e mudar definitivamente sua posição no mundo.
                </p>
                
                <div className="space-y-6 mb-16">
                  {[
                    'Módulos estruturados de reprogramação mental',
                    'Exercícios práticos de alinhamento diário',
                    'Acompanhamento de progresso personalizado',
                    'Acesso vitalício a todo o conteúdo'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main/40" />
                      {item}
                    </div>
                  ))}
                </div>

                {access?.reprogramar_eu_comprado ? (
                  <button 
                    onClick={() => showPage('reprogramacao_form')}
                    className="button w-full"
                  >
                    Preencher Questionário
                  </button>
                ) : (
                  <button 
                    onClick={() => {
                      setSelectedProduct({ name: 'Reprograme-se', price: 'R$ 249' });
                      showPage('checkout');
                    }}
                    className="button w-full"
                  >
                    Iniciar Transformação
                  </button>
                )}
              </div>
            </motion.div>
          )}

          {page === 'clube_taro_info' && (
            <motion.div 
              key="clube_taro_info"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Clube do Tarô
              </p>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Orientação Energética</span>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-6">Clube do Tarô</h2>
                <div className="price mb-10">R$ 117 <span className="text-xs uppercase tracking-widest text-white/20">/ mês</span></div>
                
                <p className="text-white/40 mb-12 leading-relaxed text-lg font-light">
                  Um espaço sagrado para orientação semanal e aprofundamento através da sabedoria ancestral do Tarô.
                </p>
                
                <div className="space-y-6 mb-16">
                  {[
                    'Uma pergunta direcionada por semana',
                    'Leitura mensal personalizada de alinhamento',
                    'Descontos exclusivos em consultas individuais',
                    'Comunidade de membros focada em expansão'
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-4 text-white/60 text-sm font-light">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold-main/40" />
                      {item}
                    </div>
                  ))}
                </div>

                <button 
                  onClick={() => {
                    setSelectedProduct({ name: 'Clube do Tarô', price: 'R$ 117 /mês' });
                    showPage('checkout');
                  }}
                  className="button w-full"
                >
                  Entrar para o Clube
                </button>
              </div>
            </motion.div>
          )}
          {page === 'confirmation' && (
            <motion.div 
              key="confirmation"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.05 }}
              className="animate-screen text-center max-w-2xl mx-auto py-20"
            >
              <div className="w-24 h-24 rounded-full bg-gold-main/10 flex items-center justify-center mx-auto mb-10 text-gold-main">
                <CheckCircle size={48} />
              </div>
              <h2 className="serif text-5xl text-gold-light mb-6">Pagamento Confirmado</h2>
              <p className="text-white/40 text-lg mb-12 font-light leading-relaxed">
                {selectedProduct?.name === 'Reprogramação Pessoal' || selectedProduct?.name === 'Reprograme-se' ? (
                  `Sua solicitação de frequência pessoal foi recebida com sucesso. Nossa equipe iniciará o desenvolvimento do seu áudio exclusivo e o prazo de entrega é de até 7 dias úteis.`
                ) : (
                  `Sua assinatura foi ativada com sucesso. Você já pode acessar todos os conteúdos exclusivos do ${selectedProduct?.name || 'seu plano'}.`
                )}
              </p>
              <div className="glass-card p-6 md:p-10 mb-12 text-left">
                <h3 className="text-gold-main/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-6">Detalhes do Pedido</h3>
                <div className="flex justify-between items-center mb-4">
                  <span className="text-white/30 text-sm">Produto</span>
                  <span className="text-gold-light font-medium">{selectedProduct?.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-white/30 text-sm">Status</span>
                  <span className="text-emerald-400 font-medium">Ativo</span>
                </div>
                <div className="flex justify-between items-center mt-4 pt-4 border-t border-white/5">
                  <span className="text-white/30 text-sm">Ambiente</span>
                </div>
              </div>
              <button 
                onClick={() => {
                  if (selectedProduct?.name === 'Reprogramação Pessoal' || selectedProduct?.name === 'Reprograme-se') {
                    showPage('reprogramacao_form');
                  } else {
                    setPage('home');
                  }
                }}
                className="button w-full"
              >
                {selectedProduct?.name === 'Reprogramação Pessoal' || selectedProduct?.name === 'Reprograme-se' ? 'Preencher Questionário' : 'Começar a Explorar'}
              </button>
            </motion.div>
          )}

          {page === 'reprogramacao_form' && (
            <motion.div 
              key="reprogramacao_form"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Início</div>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01] p-8 md:p-12">
                <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold mb-4">Personalização</span>
                <h2 className="serif text-4xl text-gold-light mb-8">Sua Frequência Pessoal</h2>
                
                <p className="text-white/40 mb-10 font-light leading-relaxed">
                  Para criarmos seu áudio de reprogramação exclusivo, precisamos entender seu momento atual e seus objetivos.
                </p>

                <form onSubmit={handleReprogramacaoSubmit} className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">Como você se sente emocionalmente hoje?</label>
                    <textarea 
                      required
                      value={reprogramacaoData.estadoEmocional}
                      onChange={(e) => setReprogramacaoData({...reprogramacaoData, estadoEmocional: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold-main/30 min-h-[120px]"
                      placeholder="Descreva seu estado emocional atual..."
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">Qual seu principal objetivo com este áudio?</label>
                    <textarea 
                      required
                      value={reprogramacaoData.objetivo}
                      onChange={(e) => setReprogramacaoData({...reprogramacaoData, objetivo: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold-main/30 min-h-[120px]"
                      placeholder="O que você deseja reprogramar ou alcançar?"
                    />
                  </div>

                  <div className="space-y-3">
                    <label className="text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">Observações Adicionais (Opcional)</label>
                    <textarea 
                      value={reprogramacaoData.observacoes}
                      onChange={(e) => setReprogramacaoData({...reprogramacaoData, observacoes: e.target.value})}
                      className="w-full bg-white/[0.03] border border-white/10 rounded-xl p-4 text-white placeholder:text-white/10 focus:outline-none focus:border-gold-main/30 min-h-[80px]"
                      placeholder="Algo mais que gostaria de compartilhar?"
                    />
                  </div>

                  <button 
                    type="submit"
                    disabled={isSubmittingReprogramacao}
                    className="button w-full flex items-center justify-center gap-3"
                  >
                    {isSubmittingReprogramacao ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        Enviar Questionário
                        <ChevronRight size={18} />
                      </>
                    )}
                  </button>
                </form>
              </div>
            </motion.div>
          )}

          {page === 'reprogramacao_scheduling' && (
            <motion.div 
              key="reprogramacao_scheduling"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('reprogramacao_form')}>← Voltar</div>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01] p-8 md:p-12">
                <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold mb-4">Agendamento</span>
                <h2 className="serif text-4xl text-gold-light mb-8">Escolha sua Sessão</h2>
                
                <p className="text-white/40 mb-10 font-light leading-relaxed">
                  Selecione uma data e horário para sua sessão individual de 1h (Segunda a Sexta, das 09h às 17h).
                </p>

                <div className="space-y-8">
                  <div className="space-y-3">
                    <label className="text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">Data da Sessão</label>
                    <input 
                      type="date" 
                      min={new Date().toISOString().split('T')[0]}
                      value={selectedDate}
                      onChange={(e) => {
                        const date = new Date(e.target.value);
                        const day = date.getUTCDay();
                        if (day === 0 || day === 6) {
                          setNotification({ message: 'Sessões disponíveis apenas de segunda a sexta.', type: 'info' });
                          return;
                        }
                        setSelectedDate(e.target.value);
                      }}
                      className="input w-full"
                    />
                  </div>

                  {selectedDate && (
                    <div className="space-y-4">
                      <label className="text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">Horários Disponíveis</label>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {['09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00'].map((time) => {
                          const taken = allAppointments.some(app => app.date === selectedDate && app.time === time && app.status === 'scheduled');
                          return (
                            <button
                              key={time}
                              disabled={taken}
                              onClick={() => setSelectedTime(time)}
                              className={`py-3 px-4 rounded-xl text-xs font-bold transition-all border ${
                                selectedTime === time 
                                  ? 'bg-gold-main text-black border-gold-main' 
                                  : taken 
                                    ? 'bg-white/5 text-white/10 border-white/5 cursor-not-allowed'
                                    : 'bg-white/5 text-white/60 border-white/10 hover:border-gold-main/30'
                              }`}
                            >
                              {time}
                              {taken && <span className="block text-[8px] opacity-50 mt-1">Ocupado</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  <button 
                    onClick={handleSchedulingSubmit}
                    disabled={isScheduling || !selectedDate || !selectedTime}
                    className="button w-full flex items-center justify-center gap-3 mt-8"
                  >
                    {isScheduling ? (
                      <div className="w-5 h-5 border-2 border-black/20 border-t-black rounded-full animate-spin" />
                    ) : (
                      <>
                        Confirmar Agendamento
                        <Check size={18} />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'jornada_emocional' && (
            <motion.div 
              key="jornada_emocional"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-4xl mx-auto"
            >
              <div className="back" onClick={() => {
                if (selectedMapping) {
                  setSelectedMapping(null);
                } else {
                  showPage('home');
                }
              }}>← {selectedMapping ? 'Voltar para Lista' : 'Voltar'}</div>
              
              <header className="mb-12 flex justify-between items-end">
                <div>
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Histórico</span>
                  <h2 className="serif text-5xl text-gold-light mb-6">Sua Jornada Emocional</h2>
                </div>
              </header>
                {!selectedMapping && history.length > 1 && (
                  <div className="glass-card p-6 border-gold-main/20 bg-gold-main/[0.02] mb-8">
                    <p className="text-gold-main/60 text-sm italic">
                      "Você tem repetido padrões de {history[0].padrao} nos últimos mapeamentos. Isso indica uma oportunidade de aprofundamento."
                    </p>
                  </div>
                )}

              {selectedMapping ? (
                <div className="glass-card p-6 md:p-10 md:p-16">
                  <div className="flex justify-between items-start mb-12">
                    <div>
                      <span className={`text-[10px] uppercase tracking-widest font-bold ${calculateStatus(selectedMapping.createdAt).color}`}>
                        {calculateStatus(selectedMapping.createdAt).label}
                      </span>
                      <h3 className="serif text-3xl text-gold-light mt-2">{selectedMapping.emocao}</h3>
                      <p className="text-white/40 text-sm mt-1">{new Date(selectedMapping.createdAt).toLocaleDateString('pt-BR')}</p>
                    </div>
                    <div className="text-right">
                      <span className="text-gold-main/30 text-[10px] uppercase tracking-widest block mb-1">Arquétipo</span>
                      <span className="text-gold-main text-sm font-medium">{selectedMapping.arquetipo}</span>
                    </div>
                  </div>

                  <div className="markdown-body prose prose-invert max-w-none mb-16">
                    <ReactMarkdown>{selectedMapping.result}</ReactMarkdown>
                  </div>

                  <div className="grid md:grid-cols-2 gap-12 pt-12 border-t border-gold-main/10">
                    <div>
                      <h4 className="text-gold-main uppercase tracking-widest text-[10px] font-bold mb-6">Fórmula Floral</h4>
                      <div className="space-y-3">
                        {selectedMapping.florais?.split(',').map((floral: string, i: number) => (
                          <div key={i} className="flex items-center gap-3 text-white/60 text-sm">
                            <div className="w-1 h-1 rounded-full bg-gold-main/40" />
                            {floral.trim()}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="text-gold-main uppercase tracking-widest text-[10px] font-bold mb-6">Frase de Consciência</h4>
                      <p className="text-white/60 italic font-light leading-relaxed">
                        "{selectedMapping.phrase || 'A clareza é o primeiro passo para o alinhamento.'}"
                      </p>
                    </div>
                  </div>

                  <div className="mt-16 pt-12 border-t border-gold-main/10 flex flex-col md:flex-row gap-4 justify-center">
                    <button 
                      onClick={() => showPage('mapeamento_intro')}
                      className="button"
                    >
                      Refazer Mapeamento
                    </button>
                    <button 
                      onClick={() => generatePrescriptionPDF(userData?.name || user?.displayName || 'Cliente', selectedMapping.florais)}
                      className="button bg-gold-main/20 border-gold-main/40 text-gold-main hover:bg-gold-main/30 flex items-center gap-2 justify-center"
                    >
                      <FileText size={18} /> Baixar Receita (PDF)
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-12">
                  {history.length > 1 && (
                    <div className="glass-card p-8 border-gold-main/20 bg-gold-main/[0.02]">
                      <div className="flex justify-between items-center mb-8">
                        <div>
                          <h3 className="serif text-2xl text-gold-light">Evolução do Alinhamento</h3>
                          <p className="text-gold-main/40 text-xs uppercase tracking-widest mt-1">Progresso nos últimos mapeamentos</p>
                        </div>
                        <div className="text-right">
                          <span className="text-gold-main text-3xl font-light">{history[0].alignmentScore || '--'}%</span>
                          <span className="text-gold-main/30 text-[10px] uppercase tracking-widest block">Nível Atual</span>
                        </div>
                      </div>
                      
                      <div className="h-[200px] w-full mt-8">
                        <ResponsiveContainer width="100%" height="100%">
                          <AreaChart data={[...history].reverse().map(item => ({
                            date: new Date(item.createdAt).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
                            score: item.alignmentScore || 50,
                            emocao: item.emocao
                          }))}>
                            <defs>
                              <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#D4AF37" stopOpacity={0.3}/>
                                <stop offset="95%" stopColor="#D4AF37" stopOpacity={0}/>
                              </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#D4AF37" opacity={0.1} vertical={false} />
                            <XAxis 
                              dataKey="date" 
                              axisLine={false} 
                              tickLine={false} 
                              tick={{ fill: '#D4AF37', fontSize: 10, opacity: 0.5 }}
                              dy={10}
                            />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip 
                              contentStyle={{ 
                                backgroundColor: '#1A1612', 
                                border: '1px solid rgba(212, 175, 55, 0.2)',
                                borderRadius: '12px',
                                fontSize: '12px',
                                color: '#D4AF37'
                              }}
                              itemStyle={{ color: '#D4AF37' }}
                              labelStyle={{ color: 'rgba(212, 175, 55, 0.5)', marginBottom: '4px' }}
                            />
                            <Area 
                              type="monotone" 
                              dataKey="score" 
                              stroke="#D4AF37" 
                              strokeWidth={2}
                              fillOpacity={1} 
                              fill="url(#colorScore)" 
                              animationDuration={2000}
                            />
                          </AreaChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                  )}

                  <div className="grid gap-6">
                    {history.length > 0 ? (
                      history.map((item) => {
                        const status = calculateStatus(item.createdAt);
                        return (
                          <div 
                            key={item.id}
                            onClick={() => setSelectedMapping(item)}
                            className="glass-card p-8 flex flex-col sm:flex-row justify-between items-center gap-6 cursor-pointer border-gold-main/10 hover:border-gold-main/40 transition-all duration-500 group"
                          >
                            <div className="flex items-center gap-6 w-full sm:w-auto">
                              <div className="w-12 h-12 rounded-full bg-gold-main/5 flex items-center justify-center text-gold-main/40 group-hover:text-gold-main transition-colors">
                                <Calendar size={20} />
                              </div>
                              <div>
                                <div className="flex items-center gap-3 mb-1">
                                  <h4 className="serif text-xl text-gold-light">{item.emocao}</h4>
                                  <span className={`text-[8px] uppercase tracking-widest font-bold ${status.color}`}>
                                    {status.label}
                                  </span>
                                </div>
                                <p className="text-white/30 text-xs font-light">
                                  {new Date(item.createdAt).toLocaleDateString('pt-BR')} • {item.arquetipo} • {item.alignmentScore || '--'}% Alinhamento
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end">
                              <div className="flex -space-x-2">
                                {item.florais?.split(',').slice(0, 3).map((_: any, i: number) => (
                                  <div key={i} className="w-6 h-6 rounded-full bg-gold-main/10 border border-gold-main/20" />
                                ))}
                              </div>
                              <ChevronRight size={18} className="text-gold-main/20 group-hover:text-gold-main transition-colors" />
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="glass-card p-6 md:p-10 md:p-16 text-center">
                        <p className="text-white/20 italic mb-8">Nenhum registro encontrado em sua jornada.</p>
                        <button 
                          onClick={() => showPage('mapeamento_intro')}
                          className="button"
                        >
                          Iniciar Primeiro Mapeamento
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </motion.div>
          )}

          {page === 'admin_dashboard' && (
            <motion.div 
              key="admin_dashboard"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-7xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              
              <header className="mb-10 md:mb-16 flex flex-col sm:flex-row justify-between items-center sm:items-end gap-6">
                <div className="text-center sm:text-left">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Painel de Controle</span>
                  <h2 className="serif text-4xl md:text-5xl text-gold-light mb-6">Administração</h2>
                </div>
                <div className="flex items-center gap-4 flex-wrap justify-center sm:justify-end">
                  <div className="flex items-center gap-3 text-gold-main/40 text-[10px] uppercase tracking-widest font-bold bg-gold-main/5 px-4 py-2 rounded-full border border-gold-main/10">
                    <ShieldCheck size={14} />
                    <span>Acesso Restrito</span>
                  </div>
                </div>
              </header>

              <div className="flex flex-col lg:flex-row gap-12">
                {/* Sidebar Navigation */}
                <aside className="lg:w-64 flex flex-col gap-2">
                  {[
                    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
                    { id: 'users', label: 'Usuários', icon: Users },
                    { id: 'mappings', label: 'Mapeamentos', icon: BarChart3 },
                    { id: 'requests', label: 'Solicitações', icon: MessageCircle },
                    { id: 'products', label: 'Produtos', icon: Package },
                    { id: 'clube', label: 'Clube Clarear', icon: Music },
                    { id: 'sessions', label: 'Sessões', icon: Clock },
                    { id: 'reports', label: 'Relatórios', icon: FileText },
                    { id: 'coupons', label: 'Cupons', icon: Tag },
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => {
                        setAdminTab(tab.id as any);
                        setSelectedAdminUser(null);
                      }}
                      className={`flex items-center gap-4 px-6 py-4 rounded-2xl transition-all duration-300 text-sm font-medium tracking-wide ${
                        adminTab === tab.id 
                          ? 'bg-gold-main text-black shadow-lg shadow-gold-main/20' 
                          : 'text-white/40 hover:text-gold-main hover:bg-white/5'
                      }`}
                    >
                      <tab.icon size={18} />
                      {tab.label}
                    </button>
                  ))}
                </aside>

                {/* Main Content Area */}
                <main className="flex-1">
                  {adminTab === 'dashboard' && (
                    <AdminDashboardTab 
                      stats={adminStats} 
                      users={adminUsers} 
                      onTestMapeamento={() => showPage('mapeamento_form')}
                      onSimulatePurchase={async () => {
                        if (user) {
                          try {
                            await updateDoc(doc(db, 'users', user.uid), {
                              paidStatus: true,
                              updatedAt: new Date().toISOString()
                            });
                            await refreshAccess();
                            setNotification({ message: "Compra simulada com sucesso! Acesso liberado.", type: 'success' });
                          } catch (error) {
                            console.error("Error simulating purchase:", error);
                            setNotification({ message: "Erro ao simular compra.", type: 'error' });
                          }
                        }
                      }}
                    />
                  )}

                  {adminTab === 'users' && (
                    selectedAdminUser ? (
                      <AdminUserDetailsView 
                        user={selectedAdminUser} 
                        mappings={adminMappings} 
                        diagnosticos={adminDiagnosticos}
                        requests={adminRequests} 
                        onBack={() => setSelectedAdminUser(null)} 
                      />
                    ) : (
                      <AdminUsersTab 
                        users={adminUsers} 
                        mappings={adminMappings} 
                        onSelectUser={setSelectedAdminUser} 
                      />
                    )
                  )}

                  {adminTab === 'mappings' && (
                    <AdminMappingsTab mappings={adminMappings} />
                  )}

                  {adminTab === 'clube' && (
                    <AdminClubeTab 
                      meditationData={adminMeditationData}
                      setMeditationData={setAdminMeditationData}
                      meditationList={meditationList}
                      setMeditationList={setMeditationList}
                    />
                  )}

                  {adminTab === 'products' && (
                    <AdminProductsTab />
                  )}

                  {adminTab === 'sessions' && (
                    <AdminSessionsTab appointments={adminAppointments} users={adminUsers} onRefresh={refreshAdminData} />
                  )}

                  {adminTab === 'reports' && (
                    <AdminReportsTab />
                  )}

                  {(adminTab === 'requests') && (
                    <AdminRequestsTab requests={adminRequests} users={adminUsers} />
                  )}

                  {adminTab === 'coupons' && (
                    <AdminCouponsTab coupons={adminCoupons} onRefresh={refreshAdminData} setNotification={setNotification} />
                  )}
                </main>
              </div>
            </motion.div>
          )}

          {page === 'checkout' && (
            <motion.div 
              key="checkout"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
              className="animate-screen text-left max-w-5xl mx-auto"
            >
              <div className="back" onClick={() => showPage('home')}>← Voltar</div>
              <h2 className="serif text-4xl md:text-5xl text-gold-light mb-10 md:mb-16 text-center">Finalizar Assinatura</h2>
              
              <div className="grid md:grid-cols-2 gap-8 md:gap-12 items-start">
                <div className="flex flex-col gap-6 md:gap-8">
                  {!user && (
                    <div className="glass-card p-6 md:p-10">
                      <h3 className="text-gold-main/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-6 md:mb-8">Seus Dados</h3>
                      <div className="flex flex-col gap-4 md:gap-6">
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Nome Completo</label>
                          <input 
                            type="text" 
                            placeholder="Seu nome" 
                            className="input"
                            value={authData.name}
                            onChange={(e) => setAuthData({...authData, name: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Data de Nascimento</label>
                          <input 
                            type="date" 
                            className="input"
                            value={authData.birthDate}
                            onChange={(e) => setAuthData({...authData, birthDate: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">E-mail</label>
                          <input 
                            type="email" 
                            placeholder="email@exemplo.com" 
                            className="input"
                            value={authData.email}
                            onChange={(e) => setAuthData({...authData, email: e.target.value})}
                            required
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Senha</label>
                          <input 
                            type="password" 
                            placeholder="••••••••" 
                            className="input"
                            value={authData.password}
                            onChange={(e) => setAuthData({...authData, password: e.target.value})}
                          />
                        </div>
                        <div className="flex justify-end items-center mt-2">
                          <button 
                            type="button"
                            onClick={() => {
                              setIntendedPage('checkout');
                              setPage('auth');
                            }}
                            className="text-gold-main/40 text-[10px] hover:text-gold-main transition-colors text-right font-bold uppercase tracking-widest"
                          >
                            Já tem uma conta? Entre aqui
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {user && (
                    <div className="glass-card p-6 md:p-10">
                      <h3 className="text-gold-main/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-4 md:mb-6">Logado como</h3>
                      <p className="text-xl md:text-2xl text-gold-light font-serif">{user.email}</p>
                    </div>
                  )}

                  <div className="glass-card p-6 md:p-10">
                    <h3 className="text-gold-main/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-8">Pagamento</h3>
                    <div className="p-6 md:p-10 border border-dashed border-gold-main/10 rounded-3xl text-center bg-white/[0.01] space-y-4">
                      <div className="flex justify-center gap-4 mb-2">
                        <CreditCard className="text-gold-main/40" size={24} />
                        <ShieldCheck className="text-gold-main/40" size={24} />
                      </div>
                      <p className="text-gold-main/60 text-xs font-medium">Checkout Seguro via Stripe</p>
                      <p className="text-white/20 text-[10px] font-light leading-relaxed">
                        Aceitamos Cartão de Crédito e PIX (via Stripe). Sua transação é protegida com criptografia de ponta a ponta.
                      </p>
                      <div className="pt-4 flex flex-col gap-2">
                        <p className="text-[9px] text-white/10 uppercase tracking-widest">Instruções:</p>
                        <p className="text-[10px] text-white/30 italic">1. Clique em "Ativar Agora" abaixo</p>
                        <p className="text-[10px] text-white/30 italic">2. Você será levado ao ambiente seguro do Stripe</p>
                        <p className="text-[10px] text-white/30 italic">3. Após o pagamento, você retornará automaticamente</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-8 sticky top-12">
                  <div className="glass-card p-6 md:p-10 border-gold-main/20 bg-gold-main/[0.01]">
                    <h3 className="text-gold-main/40 font-bold tracking-[0.3em] uppercase text-[10px] mb-10">Resumo do Pedido</h3>
                    <div className="flex justify-between items-start mb-8">
                      <div>
                        <span className="text-white/20 text-[10px] uppercase tracking-widest block mb-2">Produto</span>
                        <span className="serif text-3xl text-gold-light">{selectedProduct?.name || 'Assinatura'}</span>
                      </div>
                    </div>
                    <div className="flex justify-between items-end pt-10 border-t border-white/5">
                      <span className="text-white/20 text-[10px] uppercase tracking-widest font-bold">Total</span>
                      <div className="text-right">
                        {appliedCoupon && (
                          <div className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest mb-1">
                            -{appliedCoupon.discountType === 'percentage' ? `${appliedCoupon.value}%` : `R$ ${appliedCoupon.value}`} OFF
                          </div>
                        )}
                        <span className="price">
                          {appliedCoupon ? `R$ ${Math.max(0, (parseInt(selectedProduct?.price.replace(/\D/g, '') || '0') * (appliedCoupon.discountType === 'percentage' ? (1 - appliedCoupon.value / 100) : 1) - (appliedCoupon.discountType === 'fixed' ? appliedCoupon.value : 0))).toFixed(0)}` : (selectedProduct?.price || 'R$ --')}
                        </span>
                      </div>
                    </div>

                    {/* Coupon Section */}
                    <div className="mt-8 pt-8 border-t border-white/5">
                      <div className="flex flex-col gap-2">
                        <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Cupom de Desconto</label>
                        <div className="flex gap-2">
                          <input 
                            type="text" 
                            placeholder="CÓDIGO" 
                            className="input flex-1 py-2 text-xs"
                            value={couponCode}
                            onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                          />
                          <button 
                            type="button"
                            onClick={applyCoupon}
                            disabled={isApplyingCoupon || !couponCode.trim()}
                            className="px-4 py-2 bg-gold-main/10 hover:bg-gold-main text-gold-main hover:text-black rounded-xl text-[10px] uppercase tracking-widest font-bold transition-all disabled:opacity-50"
                          >
                            {isApplyingCoupon ? '...' : 'Aplicar'}
                          </button>
                        </div>
                        {couponError && <p className="text-red-400/60 text-[9px] mt-1 italic">{couponError}</p>}
                        {appliedCoupon && <p className="text-emerald-400/60 text-[9px] mt-1 italic">Cupom {appliedCoupon.code} aplicado com sucesso!</p>}
                      </div>
                    </div>
                    
                    {authError && (
                      <div className="text-red-400/60 text-xs mt-8 text-center font-light italic">
                        {typeof authError === 'string' ? authError : authError}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-4 mt-12">
                      {access?.diagnostico_comprado && selectedProduct?.name === 'Mapeamento Emocional Floral' ? (
                        <button 
                          type="button"
                          onClick={() => showPage('mapeamento_form')}
                          className="button w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        >
                          Continuar para o Mapeamento
                        </button>
                      ) : access?.clube_ativo && selectedProduct?.name.includes('Clube') ? (
                        <button 
                          type="button"
                          onClick={() => showPage('clube_clarear_content')}
                          className="button w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        >
                          Acessar o Clube
                        </button>
                      ) : (
                        <>
                          <button 
                            type="button"
                            onClick={handleCheckoutAndSignup}
                            disabled={isProcessingPayment}
                            className="button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessingPayment ? 'Processando...' : 'Ativar Agora'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center justify-center gap-4 text-white/10 text-[9px] uppercase tracking-[0.4em] font-medium">
                    <div className="w-8 h-[1px] bg-white/5" />
                    Ambiente Seguro
                    <div className="w-8 h-[1px] bg-white/5" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'triage_quiz' && (
            <motion.div 
              key="triage_quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-screen max-w-2xl mx-auto"
            >
              <div className="mb-12 flex justify-between items-center">
                <div className="flex-1 mr-8">
                  <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
                    <span>Progresso</span>
                    <span>{Math.round(((triageIndex + 1) / triageQuestions.length) * 100)}%</span>
                  </div>
                  <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold-main"
                      initial={{ width: 0 }}
                      animate={{ width: `${((triageIndex + 1) / triageQuestions.length) * 100}%` }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                    />
                  </div>
                </div>
                <div className="text-white/20 text-[10px] font-bold tracking-widest">
                  {triageIndex + 1} / {triageQuestions.length}
                </div>
              </div>

              <div className="glass-card p-5 md:p-12 border-gold-main/10">
                <h3 className="serif text-2xl md:text-3xl text-gold-light mb-10 leading-snug">
                  {triageQuestions[triageIndex].q}
                </h3>
                <div className="grid gap-4">
                  {triageQuestions[triageIndex].a.map((texto, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 10, backgroundColor: "rgba(197, 160, 40, 0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleTriageAnswer(idx)}
                      className="p-4 md:p-6 rounded-3xl border border-white/5 bg-white/[0.02] transition-colors cursor-pointer text-white/60 font-light text-sm"
                    >
                      {texto}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'triage_result' && triageResult && (
            <motion.div 
              key="triage_result"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-center max-w-2xl mx-auto"
            >
              <div className="glass-card p-5 md:p-12 border-gold-main/20 bg-gold-main/[0.01]">
                <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.5em] block font-bold mb-6">Resultado do seu Momento</span>
                <h2 className="serif text-4xl md:text-5xl text-gold-light mb-8">{triageResult.title}</h2>
                <p className="text-white/40 font-light leading-relaxed mb-12 text-base md:text-lg">
                  {triageResult.text}
                </p>
                <div className="flex flex-col gap-4">
                  <button 
                    onClick={() => showPage(triageResult.target)}
                    className="button w-full"
                  >
                    {triageResult.button}
                  </button>
                  <button 
                    onClick={startTriage}
                    className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-[0.2em] font-bold mt-4"
                  >
                    Refazer teste
                  </button>
                  <button 
                    onClick={() => setPage('home')}
                    className="text-white/20 hover:text-white/40 transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
                  >
                    Voltar ao Início
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {page === 'diagnostico_quiz_intro' && (
            <motion.div 
              key="diagnostico_quiz_intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="back" onClick={() => showPage('diagnostico_info')}>← Voltar</div>
              <p className="text-[10px] text-white/15 uppercase tracking-widest mb-6 font-bold">
                Início → Diagnóstico POSIÇÃO → Quiz
              </p>
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Mergulho Interno</span>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-8">Diagnóstico POSIÇÃO</h2>
                
                <div className="space-y-6 mb-12 text-white/40 font-light leading-relaxed">
                  <p>Uma leitura de posicionamento interno que revela padrões invisíveis nas suas decisões.</p>
                  <p>Você responderá algumas perguntas estruturadas que nos permitirão identificar o arquétipo ativo na sua base hoje.</p>
                </div>

                <button 
                  onClick={() => showPage('intro')}
                  className="button w-full"
                >
                  Liberar Diagnóstico
                </button>
              </div>
            </motion.div>
          )}

          {page === 'intro' && (
            <motion.div 
              key="intro"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-center max-w-xl mx-auto"
            >
              <div className="glass-card border-gold-main/10 bg-white/[0.01]">
                <div className="flex justify-center mb-8">
                </div>
                <h2 className="serif text-4xl text-gold-light mb-8">Antes de começar</h2>
                <p className="text-white/40 mb-12 leading-relaxed font-light">
                  Não existem respostas certas ou erradas. Apenas padrões que podem estar guiando suas decisões hoje. Permita-se responder com sinceridade.
                </p>
                <button 
                  onClick={startQuiz}
                  className="button w-full"
                >
                  Começar Jornada
                </button>
              </div>
            </motion.div>
          )}

          {page === 'quiz' && (
            <motion.div 
              key="quiz"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-screen max-w-2xl mx-auto"
            >
              <div className="mb-12 flex justify-between items-center">
                <div className="flex-1 mr-8">
                  <div className="flex justify-between items-center mb-4 text-[10px] uppercase tracking-[0.3em] text-white/20 font-bold">
                    <span>Progresso</span>
                    <span>{Math.round(progress)}%</span>
                  </div>
                  <div className="h-[2px] bg-white/5 rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-gold-main"
                      initial={{ width: 0 }}
                      animate={{ width: `${progress}%` }}
                      transition={{ duration: 0.5, ease: "circOut" }}
                    />
                  </div>
                </div>
                <div className="flex items-center justify-center py-4">
                </div>
              </div>

              <div className="glass-card p-5 md:p-12 border-gold-main/10">
                <h3 className="serif text-2xl md:text-3xl text-gold-light mb-10 leading-snug">
                  {questions[currentIndex].question}
                </h3>
                <div className="grid gap-4">
                  {questions[currentIndex].options.map((opt, idx) => (
                    <motion.div 
                      key={idx}
                      whileHover={{ x: 10, backgroundColor: "rgba(197, 160, 40, 0.05)" }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleAnswer(opt.value)}
                      className="p-4 md:p-6 rounded-3xl border border-white/5 bg-white/[0.02] transition-colors cursor-pointer text-white/60 font-light text-sm"
                    >
                      {opt.text}
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {page === 'analysis' && (
            <motion.div 
              key="analysis"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="animate-screen flex flex-col items-center justify-center text-center gap-12 min-h-[60vh]"
            >
              <div className="relative">
                <div className="w-24 h-24 rounded-full border border-gold-main/20 animate-ping absolute inset-0" />
                <div className="w-24 h-24 rounded-full border border-gold-main/40 animate-pulse flex items-center justify-center">
                  <div className="w-2 h-2 rounded-full bg-gold-main" />
                </div>
              </div>
              <div className="space-y-4">
                <h3 className="serif text-3xl text-gold-light">Tecendo sua análise</h3>
                <p className="text-white/30 text-sm font-light tracking-widest uppercase">
                  {analysisText}
                </p>
              </div>
            </motion.div>
          )}

          {page === 'final' && (
            <motion.div 
              key="final"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="animate-screen text-left max-w-2xl mx-auto"
            >
              <div className="glass-card p-6 md:p-12 border-gold-main/20 bg-gold-main/[0.01]">
                <h2 className="serif text-5xl text-gold-light mb-12 text-center">Seu Diagnóstico</h2>
                
                {selectedArcano && (
                  <div className="space-y-10 mb-12">
                    <div className="flex flex-col items-center text-center pb-10 border-b border-white/5">
                      <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">🃏 Seu arquétipo atual</span>
                      <h3 className="serif text-4xl text-gold-main">{selectedArcano.arcano}</h3>
                    </div>

                    <div className="grid gap-8">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">
                          <div className="w-1 h-1 rounded-full bg-gold-main" />
                          🧠 Sombra ativa
                        </div>
                        <p className="text-white/60 font-light leading-relaxed capitalize">
                          {selectedArcano.sombra.join(', ').replace(/_/g, ' ')}
                        </p>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">
                          <div className="w-1 h-1 rounded-full bg-gold-main" />
                          🔮 Caminhos possíveis
                        </div>
                        <div className="flex flex-wrap gap-2">
                          {selectedArcano.evolucao.map((ev, i) => (
                            <span key={i} className="px-3 py-1 rounded-full bg-gold-main/5 border border-gold-main/10 text-gold-light/80 text-[10px] uppercase tracking-wider">
                              {ev}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <div className="flex items-center gap-3 text-gold-main/60 text-[10px] uppercase tracking-widest font-bold">
                          <div className="w-1 h-1 rounded-full bg-gold-main" />
                          🌿 Direção
                        </div>
                        <p className="text-gold-light/90 font-medium leading-relaxed italic">
                          "{selectedArcano.direcao}"
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="space-y-6 text-white/40 font-light leading-relaxed mb-12 text-center pt-6 border-t border-white/5">
                  <p>Suas respostas revelam padrões importantes sobre a forma como você tem ocupado seu lugar neste momento.</p>
                  <p>Vou analisar seu diagnóstico com profundidade e enviar um áudio personalizado para o seu WhatsApp.</p>
                  <p className="text-gold-main/60 italic">Prazo médio: até 48h.</p>
                </div>
                
                <button 
                  onClick={() => navigate('/')}
                  className="button w-full"
                >
                  Concluir Jornada
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </>
  );
};

export default Diagnostico;
