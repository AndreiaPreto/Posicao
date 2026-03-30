import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { questions } from '../data/questions';
import { triageQuestions } from '../data/triageQuestions';
import { auth, db } from '../services/firebase';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  onAuthStateChanged, 
  signOut,
  User as FirebaseUser
} from 'firebase/auth';
import { doc, setDoc, getDoc, collection, query, where, getDocs, orderBy, getDocFromServer, serverTimestamp } from 'firebase/firestore';
import { useAccess } from '../context/AccessContext';
import { LogIn, UserPlus, LogOut, User as UserIcon, Play, Pause, Volume2, Clock, Music, Settings, Plus, Trash2, Upload, ShieldCheck, History, ChevronRight, Calendar, Users, BarChart3, Package, FileText, LayoutDashboard, CheckCircle, MessageCircle, ArrowRight } from 'lucide-react';

interface AppUser {
  id: string;
  email?: string;
  paidStatus?: boolean;
  name?: string;
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

type Page = 'home' | 'diagnostico_info' | 'reprogramacao_pessoal_info' | 'clube_clarear_info' | 'clube_taro_info' | 'rituais_mes_info' | 'reprogramar_eu_info' | 'diagnostico_quiz_intro' | 'intro' | 'quiz' | 'analysis' | 'final' | 'auth' | 'checkout' | 'clube_clarear_content' | 'clube_taro_content' | 'admin_dashboard' | 'dashboard' | 'mapeamento_intro' | 'mapeamento_form' | 'mapeamento_analysis' | 'mapeamento_result' | 'jornada_emocional' | 'confirmation' | 'reprogramacao_form' | 'triage_quiz' | 'triage_result';

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

const Diagnostico = () => {
  const { access, refreshAccess } = useAccess();
  const [page, setPage] = useState<Page>('home');
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [userData, setUserData] = useState<any>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [authMode, setAuthMode] = useState<'login' | 'signup'>('login');
  const [authData, setAuthData] = useState({ name: '', email: '', password: '', whatsapp: '' });
  const [authError, setAuthError] = useState<string | React.ReactNode>(null);
  const [intendedPage, setIntendedPage] = useState<Page | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<{name: string, price: string} | null>(null);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);
  const [reprogramacaoData, setReprogramacaoData] = useState({ estadoEmocional: '', objetivo: '', observacoes: '' });
  const [isSubmittingReprogramacao, setIsSubmittingReprogramacao] = useState(false);

  const handleReprogramacaoSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingReprogramacao(true);
    
    const path = 'reprogramacao_requests';
    try {
      if (user) {
        await setDoc(doc(collection(db, path)), {
          userId: user.uid,
          productName: selectedProduct?.name || 'Reprogramação Pessoal',
          estadoEmocional: reprogramacaoData.estadoEmocional,
          objetivo: reprogramacaoData.objetivo,
          observacoes: reprogramacaoData.observacoes || '',
          status: 'pending',
          createdAt: new Date().toISOString()
        });
      }
      showPage('home');
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    } finally {
      setIsSubmittingReprogramacao(false);
    }
  };
  const [currentAudio, setCurrentAudio] = useState<number | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [adminMeditationData, setAdminMeditationData] = useState({ title: '', description: '', duration: '', url: '' });
  const [adminTab, setAdminTab] = useState<'dashboard' | 'users' | 'mappings' | 'products' | 'clube' | 'sessions' | 'reports' | 'requests'>('dashboard');
  const [adminStats, setAdminStats] = useState({
    usersCount: 0,
    mappingsCount: 0,
    requestsCount: 0,
    revenue: 0,
    activeUsers: 0
  });
  const [adminUsers, setAdminUsers] = useState<AppUser[]>([]);
  const [adminMappings, setAdminMappings] = useState<any[]>([]);
  const [adminRequests, setAdminRequests] = useState<any[]>([]);
  const [meditationList, setMeditationList] = useState(meditations);
  const [mapeamentoData, setMapeamentoData] = useState({
    emocao: '',
    padrao: '',
    defesa: '',
    ferida: '',
    desejo: '',
    arquetipo: ''
  });
  const [mapeamentoResult, setMapeamentoResult] = useState<string | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [selectedMapping, setSelectedMapping] = useState<any | null>(null);
  const audioRef = React.useRef<HTMLAudioElement | null>(null);

  const [isFinalizingPayment, setIsFinalizingPayment] = useState(false);
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
          const requestsSnapshot = await getDocs(collection(db, 'reprogramacao_requests'));
          
          const users = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AppUser));
          const mappings = mappingsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const requests = requestsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          
          setAdminUsers(users);
          setAdminMappings(mappings);
          setAdminRequests(requests);
          
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
                whatsapp: data.whatsapp || '',
                role: 'user',
                paidStatus: true,
                clube_ativo: product.name.includes('Clube'),
                lastPurchase: product.name,
                updatedAt: new Date().toISOString()
              }, { merge: true });
              
              setSelectedProduct(product);
              localStorage.removeItem('pending_auth_data');
              localStorage.removeItem('pending_product');
              
              console.log("🔄 Refreshing access...");
              await refreshAccess();
              
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
              alert("Erro: O método de login por E-mail/Senha não está ativado no Console do Firebase.");
            } else if (err.code === 'auth/network-request-failed') {
              alert("Erro de conexão: Verifique bloqueadores de anúncios ou rede. DICA: Tente abrir o app em uma NOVA ABA (ícone no canto superior direito).");
            } else {
              alert("Erro ao finalizar pagamento: " + (err.message || "Erro desconhecido"));
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
  }, [user]);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    try {
      if (authMode === 'signup') {
        const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
        try {
          await setDoc(doc(db, 'users', userCredential.user.uid), {
            uid: userCredential.user.uid,
            name: authData.name,
            email: authData.email,
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
            <button 
              onClick={() => {
                localStorage.setItem('demo_mode', 'true');
                localStorage.setItem('demo_access', JSON.stringify({
                  diagnostico_comprado: true, // Allow access in demo mode
                  clube_ativo: true
                }));
                setPage(intendedPage || 'home');
                setIntendedPage(null);
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-500/30 transition-all"
            >
              Continuar em Modo de Demonstração (Sem Conta)
            </button>
          </div>
        );
      } else if (err.code === 'auth/invalid-credential') {
        setAuthError("E-mail ou senha incorretos.");
      } else {
        setAuthError(err.message || "Ocorreu um erro na autenticação.");
      }
    }
  };

  const handleLogout = () => {
    signOut(auth);
    setPage('home');
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

    setPage(newPage);
  };

  const handleCheckoutAndSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setIsProcessingPayment(true);
    
    try {
      if (!selectedProduct) return;

      // Parse price string to cents
      // Example: "R$ 147" -> 14700
      // Example: "R$ 39 /mês" -> 3900
      const priceValue = parseInt(selectedProduct.price.replace(/\D/g, ''));
      const amount = priceValue * 100;
      const isSubscription = selectedProduct.price.includes('/mês');

      // Save pending data to finalize after redirect
      let currentFirebaseUid = user?.uid;
      
      if (!user) {
        if (!authData.email || !authData.password || !authData.name) {
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
          await setDoc(doc(db, 'users', currentFirebaseUid), {
            uid: currentFirebaseUid,
            name: authData.name,
            email: authData.email,
            whatsapp: authData.whatsapp || '',
            role: 'user',
            paidStatus: false,
            createdAt: new Date().toISOString()
          }, { merge: true });
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
            <button 
              onClick={() => {
                // Bypass auth for demo purposes if network is blocked
                const mockUser = { uid: 'guest_' + Date.now(), email: authData.email || 'guest@example.com', displayName: authData.name || 'Convidado' };
                localStorage.setItem('demo_mode', 'true');
                localStorage.setItem('pending_auth_data', JSON.stringify({ email: mockUser.email, name: mockUser.displayName, whatsapp: authData.whatsapp }));
                localStorage.setItem('pending_product', JSON.stringify(selectedProduct));
                
                // Simulate success for demo
                const searchParams = new URLSearchParams(window.location.search);
                searchParams.set('payment_success', 'true');
                searchParams.set('product', selectedProduct.name);
                window.history.replaceState({}, '', `${window.location.pathname}?${searchParams.toString()}`);
                window.location.reload();
              }}
              className="mt-4 px-4 py-2 bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 rounded-full text-[10px] uppercase tracking-widest font-bold hover:bg-emerald-500/30 transition-all"
            >
              Continuar em Modo de Demonstração (Sem Conta)
            </button>
          </div>
        );
      } else {
        setAuthError(err.message || "Ocorreu um erro ao processar o pagamento.");
      }
      setIsProcessingPayment(false);
    }
  };

  const handleTestActivation = async () => {
    if (!selectedProduct) return;
    setIsProcessingPayment(true);
    setAuthError(null);

    try {
      let currentFirebaseUid = user?.uid;

      if (!user) {
        if (!authData.email || !authData.password || !authData.name) {
          setAuthError("Por favor, preencha todos os campos para criar sua conta de teste.");
          setIsProcessingPayment(false);
          return;
        }

        try {
          const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
          currentFirebaseUid = userCredential.user.uid;
          
          await setDoc(doc(db, 'users', currentFirebaseUid), {
            name: authData.name,
            email: authData.email,
            whatsapp: authData.whatsapp || '',
            role: 'user',
            paidStatus: false,
            createdAt: new Date().toISOString()
          }, { merge: true });
        } catch (e: any) {
          if (e.code === 'auth/email-already-in-use') {
            const userCredential = await signInWithEmailAndPassword(auth, authData.email, authData.password);
            currentFirebaseUid = userCredential.user.uid;
          } else if (e.code === 'auth/network-request-failed') {
            // Fallback for network error in test mode
            console.warn("Network error during test activation, using local fallback");
            localStorage.setItem('demo_mode', 'true');
            localStorage.setItem('demo_access', JSON.stringify({
              diagnostico_comprado: !selectedProduct.name.includes('Clube') && !selectedProduct.name.includes('Reprograma'),
              clube_ativo: selectedProduct.name.includes('Clube'),
              reprogramacao_pessoal_comprada: selectedProduct.name === 'Reprogramação Pessoal',
              reprogramar_eu_comprado: selectedProduct.name === 'Reprograme-se'
            }));
            
            if (selectedProduct.name === 'Mapeamento Emocional Floral') {
              showPage('mapeamento_form');
            } else if (selectedProduct.name === 'Clube do Tarô') {
              showPage('clube_taro_content');
            } else if (selectedProduct.name.includes('Clube')) {
              showPage('clube_clarear_content');
            } else {
              showPage('confirmation');
            }
            setIsProcessingPayment(false);
            return;
          } else {
            throw e;
          }
        }
      }

      if (!currentFirebaseUid) throw new Error("Usuário não identificado.");

      // Update Firestore directly for test mode
      const isClube = selectedProduct.name.includes('Clube');
      const isReprogramacao = selectedProduct.name === 'Reprogramação Pessoal';
      const isReprogrameSe = selectedProduct.name === 'Reprograme-se';
      
      const updateData: any = {
        lastPaymentAt: serverTimestamp(),
        testMode: true
      };

      if (isClube) {
        updateData.clube_ativo = true;
      } else if (isReprogramacao) {
        updateData.reprogramacao_pessoal_comprada = true;
      } else if (isReprogrameSe) {
        updateData.reprogramar_eu_comprado = true;
      } else {
        updateData.paidStatus = true;
      }

      try {
        await setDoc(doc(db, 'users', currentFirebaseUid), updateData, { merge: true });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, `users/${currentFirebaseUid}`);
      }

      // Force refresh access
      if (typeof refreshAccess === 'function') {
        await refreshAccess(currentFirebaseUid);
      }

      // Redirect
      if (selectedProduct.name === 'Mapeamento Emocional Floral') {
        showPage('mapeamento_form');
      } else if (selectedProduct.name === 'Clube do Tarô') {
        showPage('clube_taro_content');
      } else if (isClube) {
        showPage('clube_clarear_content');
      } else {
        showPage('confirmation');
      }

    } catch (err: any) {
      console.error("Test activation error:", err);
      setAuthError(err.message || "Erro na ativação de teste.");
    } finally {
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
    
    let archetype = '';
    let theme = '';
    
    switch(mostFrequent) {
      case 'A': archetype = 'O Controlador'; theme = 'Rigidez e Controle'; break;
      case 'B': archetype = 'O Responsável'; theme = 'Sobrecarga e Dever'; break;
      case 'C': archetype = 'O Adaptável'; theme = 'Evitação e Flexibilidade'; break;
      case 'D': archetype = 'O Retraído'; theme = 'Isolamento e Proteção'; break;
      default: archetype = 'O Explorador'; theme = 'Busca por Sentido';
    }

    // Save to Firestore
    if (user) {
      try {
        const diagRef = doc(collection(db, 'diagnosticos'));
        await setDoc(diagRef, {
          userId: user.uid,
          userName: userData?.name || user.email || 'Usuário',
          archetype,
          theme,
          answers: finalAnswers,
          createdAt: new Date().toISOString()
        });
      } catch (error) {
        handleFirestoreError(error, OperationType.WRITE, 'diagnosticos');
      }
    }
    
    setMapeamentoResult(`Sua análise revelou o arquétipo **${archetype}**. Sua temática principal é **${theme}**.`);
    
    setTimeout(() => {
      setAnalysisText(`Seu padrão dominante é ${archetype}. Isso revela uma tendência a ${theme.toLowerCase()}.`);
    }, 1500);

    setTimeout(() => {
      showPage('final');
    }, 3500);
  };

  const progress = (currentIndex / questions.length) * 100;

  if (loading) return <div className="flex items-center justify-center h-screen text-gold-main font-serif italic text-xl">Inspirando clareza...</div>;

  return (
    <>
      <div className="atmosphere"></div>
      <div className="relative z-10 min-h-screen">
        {/* Test Mode Banner */}
        <div className="bg-emerald-500/10 border-b border-emerald-500/20 py-2 text-center backdrop-blur-md sticky top-0 z-[100]">
          <p className="text-[10px] uppercase tracking-[0.5em] text-emerald-400 font-bold flex items-center justify-center gap-3">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            Modo de Teste Ativo • POSIÇÃO Beta
          </p>
        </div>
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
                  <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Modo Teste</span>
                  </div>
                  <button 
                    onClick={() => user ? setPage('jornada_emocional') : showPage('auth')}
                    className="text-gold-main/40 hover:text-gold-main transition-all duration-500 text-[10px] uppercase tracking-[0.3em] font-bold pb-2 border-b border-gold-main/10 hover:border-gold-main"
                  >
                    {user ? 'Painel' : 'Acessar'}
                  </button>
                </div>
              </motion.header>

              <motion.div variants={itemVariants} className="space-y-24">
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

                {/* Main Journeys Section */}
                <div className="space-y-12">
                  <div className="flex items-center gap-6">
                    <div className="h-[1px] flex-1 bg-gold-main/10" />
                    <h3 className="serif text-3xl text-gold-light/60">Caminhos POSIÇÃO</h3>
                    <div className="h-[1px] flex-1 bg-gold-main/10" />
                  </div>
                  <div className="grid md:grid-cols-2 gap-12">
                    {[
                      { id: 'mapeamento_intro', title: 'Mapeamento Emocional Floral', desc: 'Descubra sua emoção dominante, seu arquétipo ativo e sua fórmula floral personalizada.', tag: 'Mapeamento' },
                      { id: 'clube_taro_info', title: 'Clube do Tarô', desc: 'Orientação semanal e leitura energética mensal para manter o fluxo constante.', tag: 'Comunidade' },
                      { id: 'clube_clarear_info', title: 'Clube Clarear', desc: 'Práticas semanais focadas em clareza mental e estabilidade emocional profunda.', tag: 'Prática' },
                      { id: 'rituais_mes_info', title: 'Rituais do Mês', desc: 'Rituais coletivos realizados off-line e enviados por mensagem vídeo e áudio.', tag: 'Agenda' },
                      { id: 'reprogramacao_pessoal_info', title: 'Reprogramação Pessoal', desc: 'Áudio de frequência personalizada para alinhar sua base interna através de uma sessão individual.', tag: 'Atendimento Único' },
                      { id: 'diagnostico_info', title: 'Diagnóstico POSIÇÃO', desc: 'Mapeie sua frequência atual e descubra o caminho exato para o seu alinhamento.', tag: 'Mapeamento' }
                    ].map((item) => (
                      <motion.div 
                        key={item.id}
                        variants={itemVariants}
                        className="glass-card flex flex-col justify-between group cursor-pointer"
                        onClick={() => showPage(item.id as Page)}
                      >
                        <div>
                          <span className="text-gold-main/20 text-[9px] uppercase tracking-[0.3em] mb-6 block font-bold">{item.tag}</span>
                          <h2 className="serif text-4xl text-gold-light mb-6 group-hover:text-gold-main transition-colors duration-500">{item.title}</h2>
                          <p className="text-white/40 text-sm leading-relaxed mb-10 font-light">{item.desc}</p>
                        </div>
                        <button className="button-outline w-full">Explorar</button>
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
              <div className="flex justify-center mb-8">
                <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Modo Teste Ativo</span>
                </div>
              </div>
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

                  {authMode === 'signup' && (
                    <div className="flex flex-col gap-3">
                      <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">WhatsApp</label>
                      <input 
                        type="tel" 
                        value={authData.whatsapp}
                        onChange={(e) => setAuthData({...authData, whatsapp: e.target.value})}
                        className="input"
                        placeholder="(00) 00000-0000"
                        required
                      />
                    </div>
                  )}

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
                </form>

                <div className="mt-10 text-center flex flex-col gap-4">
                  <button 
                    onClick={() => setAuthMode(authMode === 'login' ? 'signup' : 'login')}
                    className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-[0.2em] font-bold"
                  >
                    {authMode === 'login' ? 'Não tem conta? Cadastre-se' : 'Já tem conta? Entre aqui'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setAuthMode('signup');
                      setAuthData({ name: 'Usuário Teste', email: `teste_${Date.now()}@exemplo.com`, password: 'password123', whatsapp: '(11) 99999-9999' });
                    }}
                    className="text-emerald-400/40 text-[9px] hover:text-emerald-400 transition-colors font-bold uppercase tracking-widest"
                  >
                    Preencher Dados de Teste
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
              <div className="flex justify-center mb-6">
                <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Modo Teste Ativo</span>
                </div>
              </div>
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
                <div className="text-center">
                  <div className="text-gold-main text-3xl serif mb-8">R$ 27,00</div>
                  {access?.diagnostico_comprado ? (
                    <button 
                      onClick={() => showPage('mapeamento_form')}
                      className="button w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                    >
                      ✨ Iniciar meu Mapeamento
                    </button>
                  ) : (
                    <button 
                      onClick={() => {
                        setSelectedProduct({ name: 'Mapeamento Emocional Floral', price: 'R$ 27' });
                        showPage('checkout');
                      }}
                      className="button w-full"
                    >
                      👉 Quero acessar meu mapeamento
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
              <div className="back" onClick={() => setPage('home')}>← Voltar</div>
              <div className="flex justify-between items-center mb-12">
                <h2 className="serif text-4xl text-gold-light">Conte-nos sobre seu momento atual</h2>
                <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Teste</span>
                </div>
              </div>
              
              <div className="glass-card p-6 md:p-10 space-y-8">
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Qual sua emoção dominante hoje?</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Ansiedade, Tristeza, Medo..."
                    value={mapeamentoData.emocao}
                    onChange={(e) => setMapeamentoData({...mapeamentoData, emocao: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Qual padrão emocional você percebe se repetindo?</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Procrastinação, busca por aprovação..."
                    value={mapeamentoData.padrao}
                    onChange={(e) => setMapeamentoData({...mapeamentoData, padrao: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Como você costuma se defender emocionalmente?</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Isolamento, agressividade, ironia..."
                    value={mapeamentoData.defesa}
                    onChange={(e) => setMapeamentoData({...mapeamentoData, defesa: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Qual sua maior ferida emocional?</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Rejeição, abandono, traição..."
                    value={mapeamentoData.ferida}
                    onChange={(e) => setMapeamentoData({...mapeamentoData, ferida: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Qual seu maior desejo atual?</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: Paz mental, sucesso profissional..."
                    value={mapeamentoData.desejo}
                    onChange={(e) => setMapeamentoData({...mapeamentoData, desejo: e.target.value})}
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-gold-main/40 font-bold">Com qual arquétipo você mais se identifica agora?</label>
                  <input 
                    type="text" 
                    className="input" 
                    placeholder="Ex: O Guerreiro, O Cuidador, O Explorador..."
                    value={mapeamentoData.arquetipo}
                    onChange={(e) => setMapeamentoData({...mapeamentoData, arquetipo: e.target.value})}
                  />
                </div>
                
                <div className="pt-8 flex flex-col gap-6">
                  <button 
                    type="button"
                    onClick={() => setMapeamentoData({
                      emocao: 'Ansiedade',
                      padrao: 'Procrastinação',
                      defesa: 'Isolamento',
                      ferida: 'Rejeição',
                      desejo: 'Paz interna',
                      arquetipo: 'O Explorador'
                    })}
                    className="text-emerald-400/40 text-[9px] hover:text-emerald-400 transition-colors font-bold uppercase tracking-widest text-center"
                  >
                    Preencher Dados de Teste
                  </button>
                  <button 
                    onClick={async () => {
                    if (!mapeamentoData.emocao || !mapeamentoData.padrao || !mapeamentoData.defesa || !mapeamentoData.ferida || !mapeamentoData.desejo || !mapeamentoData.arquetipo) {
                      alert("Por favor, preencha todos os campos.");
                      return;
                    }

                    setPage('mapeamento_analysis');
                    try {
                      const apiKey = process.env.GEMINI_API_KEY;
                      if (!apiKey || apiKey === 'undefined') {
                        throw new Error("API Key do Gemini não configurada. Por favor, configure-a nas configurações do projeto.");
                      }

                      const ai = new GoogleGenAI({ apiKey });
                      
                      // Step 1: Select Florais
                      const selectResponse = await ai.models.generateContent({
                        model: "gemini-3-flash-preview",
                        contents: `Você é um especialista em Florais de Bach com conhecimento profundo em emoções humanas, padrões comportamentais e leitura psicoemocional.
Sua função é selecionar entre 4 a 6 florais de Bach com base nos dados emocionais fornecidos.

REGRAS IMPORTANTES:
- Nunca selecione mais de 6 florais
- Nunca selecione menos de 4 florais
- Sempre inclua:
  1 floral principal (emoção dominante)
  1 floral de padrão comportamental
  1 floral de defesa emocional
  1 floral de raiz (ferida emocional)
  1 floral de expansão (estado desejado)
  +1 floral opcional (variação inteligente)

- Evite redundância (não repetir florais com função idêntica)
- Priorize coerência emocional
- Caso haja dúvida entre dois florais, escolha o mais profundo (não o mais superficial)

---
BASE DE CORRESPONDÊNCIA:
MEDOS: Aspen, Mimulus, Rock Rose, Cherry Plum, Red Chestnut
INCERTEZA: Cerato, Scleranthus, Gentian, Gorse, Hornbeam, Wild Oat
FALTA DE INTERESSE NO PRESENTE: Clematis, Honeysuckle, Wild Rose, Olive, White Chestnut, Mustard, Chestnut Bud
SOLIDÃO: Water Violet, Impatiens, Heather
SENSIBILIDADE: Agrimony, Centaury, Walnut, Holly
DESÂNIMO: Larch, Pine, Elm, Sweet Chestnut, Star of Bethlehem, Willow, Oak, Crab Apple
CONTROLE: Chicory, Vervain, Vine, Beech, Rock Water

---
ENTRADA:
Emoção dominante: ${mapeamentoData.emocao}
Padrão emocional: ${mapeamentoData.padrao}
Defesa emocional: ${mapeamentoData.defesa}
Ferida emocional: ${mapeamentoData.ferida}
Desejo atual: ${mapeamentoData.desejo}

---
INSTRUÇÃO FINAL:
Selecione de 4 a 6 florais coerentes com o quadro emocional.
Organize assim:
1. Floral principal:
2. Floral de padrão:
3. Floral de defesa:
4. Floral de raiz:
5. Floral de expansão:
6. Floral complementar (opcional):
Retorne apenas os nomes dos florais.`,
                      });
                      
                      const floraisList = selectResponse.text;

                      // Step 2: Generate Full Report and Score
                      const reportResponse = await ai.models.generateContent({
                        model: "gemini-3.1-pro-preview",
                        contents: `Você é um especialista em análise emocional com base em psicologia, florais de Bach e arquétipos comportamentais.
Sua função é gerar uma devolutiva terapêutica personalizada com base nos dados fornecidos.

IMPORTANTE:
- Não seja genérico
- Não repita frases padrão
- Não use linguagem mística exagerada
- Não use termos técnicos complexos
- Não julgue o usuário
- Não gere culpa
- Seja acolhedor, claro e direto

DADOS DE ENTRADA:
Emoção dominante: ${mapeamentoData.emocao}
Padrão emocional: ${mapeamentoData.padrao}
Mecanismo de defesa: ${mapeamentoData.defesa}
Ferida emocional: ${mapeamentoData.ferida}
Desejo atual: ${mapeamentoData.desejo}
Arquétipo identificado: ${mapeamentoData.arquetipo}
Florais selecionados: ${floraisList}

INSTRUÇÕES:
Gere a resposta seguindo EXATAMENTE essa estrutura:

---
1. TÍTULO: "Seu Mapeamento Emocional"
---
2. LEITURA EMOCIONAL (2 a 3 parágrafos)
Explique: O que a pessoa está sentindo, o padrão emocional por trás disso, como isso impacta a vida dela. Conecte com o arquétipo identificado.
---
3. ARQUÉTIPO ATIVO
Nome do arquétipo + breve explicação (máximo 3 linhas)
---
4. FÓRMULA FLORAL
Liste os florais e explique em 1 linha cada um (use a lista fornecida: ${floraisList}).
---
5. MODO DE USO
- 4 gotas, 4 vezes ao dia
- Pode incluir orientação simples adicional
---
6. TEMPO DE AÇÃO
- Percepções iniciais: 3 a 7 dias
- Ajustes mais profundos: 14 a 21 dias
---
7. REAVALIAÇÃO
- Recomendar reavaliação em 21 dias ou antes
---
8. DIRECIONAMENTO TERAPÊUTICO
Sugira continuidade com acompanhamento terapêutico. Seja sutil, sem forçar venda.
---
9. FRASE DE CONSCIÊNCIA
Crie uma frase impactante, curta e personalizada.
---
10. PRÓXIMO PASSO DE CONSCIÊNCIA
Finalize com uma mensagem que mostre como esse padrão pode ser transmutado e qual o próximo nível de percepção que o usuário deve buscar.
---
11. SCORE DE ALINHAMENTO
Gere um número de 0 a 100 representando o nível de alinhamento atual (onde 0 é desequilíbrio total e 100 é alinhamento pleno).
Retorne apenas o número após o rótulo "SCORE:".

FORMATO: Texto organizado, claro, fluido e humano em Markdown.`,
                      });

                      const resultText = reportResponse.text;
                      const scoreMatch = resultText.match(/SCORE:\s*(\d+)/);
                      const alignmentScore = scoreMatch ? parseInt(scoreMatch[1]) : 50;
                      
                      setMapeamentoResult(resultText);

                      // Save to Firestore
                      if (user) {
                        try {
                          const mappingRef = doc(collection(db, 'mappings'));
                          await setDoc(mappingRef, {
                            userId: user.uid,
                            createdAt: new Date().toISOString(),
                            emocao: mapeamentoData.emocao,
                            padrao: mapeamentoData.padrao,
                            defesa: mapeamentoData.defesa,
                            ferida: mapeamentoData.ferida,
                            desejo: mapeamentoData.desejo,
                            arquetipo: mapeamentoData.arquetipo,
                            florais: floraisList,
                            result: resultText,
                            alignmentScore: alignmentScore,
                            phrase: resultText.split('FRASE DE CONSCIÊNCIA')[1]?.split('---')[0]?.replace(/[#*:]/g, '').trim() || ''
                          });
                          
                          // Refresh history
                          const q = query(collection(db, 'mappings'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
                          const querySnapshot = await getDocs(q);
                          const docs = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                          setHistory(docs);
                        } catch (fsError) {
                          handleFirestoreError(fsError, OperationType.WRITE, 'mappings');
                        }
                      }

                      setPage('mapeamento_result');
                    } catch (error) {
                      console.error(error);
                      alert("Erro ao gerar mapeamento. Tente novamente.");
                      showPage('mapeamento_form');
                    }
                  }}
                  className="button w-full"
                >
                  Gerar Meu Mapeamento
                </button>
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
              <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 mb-8">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Modo Teste Ativo</span>
              </div>
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
              <div className="flex justify-center mb-12">
                <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Modo Teste Ativo</span>
                </div>
              </div>
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-6 md:mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Mapeamento de Frequência</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Frequência Personalizada</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Manutenção Diária</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01] mb-12">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Agenda Mensal</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
              
              <header className="mb-10 md:mb-16 flex justify-between items-end">
                <div>
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Área de Membros</span>
                  <h2 className="serif text-4xl md:text-5xl text-gold-light mb-6">Clube Clarear</h2>
                </div>
                <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 mb-6">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Modo Teste</span>
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
              
              <header className="mb-10 md:mb-16 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                <div>
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] mb-4 block font-bold">Área de Membros</span>
                  <h2 className="serif text-4xl md:text-5xl text-gold-light mb-6">Clube do Tarô</h2>
                </div>
                <div className="flex flex-col gap-4">
                  <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 self-end">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Modo Teste</span>
                  </div>
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Transformação Estrutural</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Orientação Energética</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
                  <span className="text-emerald-400/60 text-[10px] uppercase tracking-widest font-bold">Modo de Teste</span>
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
                <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10 mb-6">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Modo Teste</span>
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

                  <div className="mt-16 pt-12 border-t border-gold-main/10 text-center">
                    <button 
                      onClick={() => showPage('mapeamento_intro')}
                      className="button"
                    >
                      Refazer Mapeamento
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
                  <div className="flex items-center gap-3 text-emerald-400/40 text-[10px] uppercase tracking-widest font-bold bg-emerald-400/5 px-4 py-2 rounded-full border border-emerald-400/10">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Modo Teste</span>
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
                  ].map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setAdminTab(tab.id as any)}
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
                    <div className="space-y-12">
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
                        {[
                          { label: 'Total Usuários', value: adminStats.usersCount, icon: Users },
                          { label: 'Mapeamentos', value: adminStats.mappingsCount, icon: BarChart3 },
                          { label: 'Solicitações', value: adminStats.requestsCount, icon: MessageCircle },
                          { label: 'Receita Est.', value: `R$ ${adminStats.revenue}`, icon: Package },
                          { label: 'Usuários Ativos', value: adminStats.activeUsers, icon: ShieldCheck },
                        ].map((stat, i) => (
                          <div key={i} className="glass-card p-8 border-gold-main/10">
                            <stat.icon size={20} className="text-gold-main/30 mb-6" />
                            <p className="text-[10px] uppercase tracking-widest text-white/20 mb-2">{stat.label}</p>
                            <p className="serif text-3xl text-gold-light">{stat.value}</p>
                          </div>
                        ))}
                      </div>

                      <div className="glass-card p-6 md:p-10">
                        <h3 className="serif text-2xl text-gold-light mb-8">Atividade Recente</h3>
                        <div className="space-y-4">
                          {adminUsers.slice(0, 5).map((u, i) => (
                            <div key={i} className="flex items-center justify-between p-4 border-b border-white/5 last:border-0">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center text-gold-main/40">
                                  <UserIcon size={18} />
                                </div>
                                <div>
                                  <p className="text-gold-light text-sm font-medium">{u.email}</p>
                                  <p className="text-[10px] text-white/20 uppercase tracking-widest">Novo Usuário</p>
                                </div>
                              </div>
                              <span className="text-[10px] text-white/20">Recente</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'users' && (
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
                            {adminUsers.map((u, i) => (
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
                                  {adminMappings.filter(m => m.userId === u.id).length}
                                </td>
                                <td className="py-6 text-right">
                                  <button className="text-gold-main/40 hover:text-gold-main transition-colors text-[10px] uppercase tracking-widest font-bold">Ver Detalhes</button>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {adminTab === 'mappings' && (
                    <div className="glass-card p-6 md:p-10">
                      <h3 className="serif text-2xl text-gold-light mb-10">Histórico de Mapeamentos</h3>
                      <div className="space-y-4">
                        {adminMappings.map((m, i) => (
                          <div key={i} className="p-6 border border-white/5 rounded-2xl flex items-center justify-between group hover:border-gold-main/20 transition-all">
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
                            <button className="p-3 text-gold-main/20 hover:text-gold-main transition-colors">
                              <ChevronRight size={18} />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === 'clube' && (
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
                                value={adminMeditationData.title}
                                onChange={(e) => setAdminMeditationData({...adminMeditationData, title: e.target.value})}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">Duração</label>
                              <input 
                                type="text" 
                                className="input"
                                value={adminMeditationData.duration}
                                onChange={(e) => setAdminMeditationData({...adminMeditationData, duration: e.target.value})}
                              />
                            </div>
                            <div className="flex flex-col gap-2">
                              <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">URL MP3</label>
                              <input 
                                type="text" 
                                className="input"
                                value={adminMeditationData.url}
                                onChange={(e) => setAdminMeditationData({...adminMeditationData, url: e.target.value})}
                              />
                            </div>
                            <button 
                              onClick={() => {
                                if (adminMeditationData.title && adminMeditationData.url) {
                                  const newItem = { id: meditationList.length + 1, ...adminMeditationData };
                                  setMeditationList([...meditationList, newItem]);
                                  setAdminMeditationData({ title: '', description: '', duration: '', url: '' });
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
                  )}

                  {adminTab === 'requests' && (
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
                            {adminRequests.map((r, i) => (
                              <tr key={i} className="border-b border-white/5 last:border-0">
                                <td className="py-6">
                                  <p className="text-gold-light font-medium">{adminUsers.find(u => u.id === r.userId)?.email || r.userId}</p>
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
                  )}

                  {(adminTab === 'products' || adminTab === 'sessions' || adminTab === 'reports') && (
                    <div className="glass-card p-6 md:p-10 md:p-20 text-center">
                      <div className="w-20 h-20 rounded-full bg-gold-main/5 flex items-center justify-center mx-auto mb-8 text-gold-main/20">
                        <Settings size={40} />
                      </div>
                      <h3 className="serif text-3xl text-gold-light mb-4">Em Desenvolvimento</h3>
                      <p className="text-white/30 font-light italic">Esta seção do painel administrativo está sendo estruturada.</p>
                    </div>
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
                          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">E-mail</label>
                          <input 
                            type="email" 
                            placeholder="email@exemplo.com" 
                            className="input"
                            value={authData.email}
                            onChange={(e) => setAuthData({...authData, email: e.target.value})}
                          />
                        </div>
                        <div className="flex flex-col gap-2">
                          <label className="text-[10px] uppercase tracking-[0.2em] text-white/20 font-bold">WhatsApp</label>
                          <input 
                            type="text" 
                            placeholder="(00) 00000-0000" 
                            className="input"
                            value={authData.whatsapp}
                            onChange={(e) => setAuthData({...authData, whatsapp: e.target.value})}
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
                        <div className="flex justify-between items-center mt-2">
                          <button 
                            type="button"
                            onClick={() => setAuthData({ name: 'Usuário Teste', email: `teste_${Date.now()}@exemplo.com`, password: 'password123', whatsapp: '(11) 99999-9999' })}
                            className="text-emerald-400/40 text-[9px] hover:text-emerald-400 transition-colors text-left font-bold uppercase tracking-widest"
                          >
                            Preencher Dados de Teste
                          </button>
                          <button 
                            type="button"
                            onClick={() => showPage('auth')}
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
                    <div className="p-6 md:p-10 border border-dashed border-gold-main/10 rounded-3xl text-center bg-white/[0.01]">
                      <p className="text-gold-main/40 text-xs italic font-medium mb-2">Ambiente de Teste Ativo</p>
                      <p className="text-white/20 text-[10px] font-light">Os pagamentos serão processados em modo de teste (Stripe Sandbox).</p>
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
                      <span className="price">{selectedProduct?.price || 'R$ --'}</span>
                    </div>
                    
                    {authError && (
                      <div className="text-red-400/60 text-xs mt-8 text-center font-light italic">
                        {typeof authError === 'string' ? authError : authError}
                      </div>
                    )}
                    
                    <div className="flex flex-col gap-4 mt-12">
                      {access?.diagnostico_comprado && selectedProduct?.name === 'Mapeamento Emocional Floral' ? (
                        <button 
                          onClick={() => showPage('mapeamento_form')}
                          className="button w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        >
                          Continuar para o Mapeamento
                        </button>
                      ) : access?.clube_ativo && selectedProduct?.name.includes('Clube') ? (
                        <button 
                          onClick={() => showPage('clube_clarear_content')}
                          className="button w-full bg-emerald-500/20 border-emerald-500/40 text-emerald-400"
                        >
                          Acessar o Clube
                        </button>
                      ) : (
                        <>
                          <button 
                            onClick={handleCheckoutAndSignup}
                            disabled={isProcessingPayment}
                            className="button w-full disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {isProcessingPayment ? 'Processando...' : 'Ativar Agora'}
                          </button>
                          
                          <button 
                            onClick={handleTestActivation}
                            disabled={isProcessingPayment}
                            className="text-emerald-400/40 text-[9px] hover:text-emerald-400 transition-colors font-bold uppercase tracking-widest text-center py-2"
                          >
                            Ativar Modo Teste (Pular Pagamento)
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
              <div className="glass-card border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-between items-center mb-8">
                  <span className="text-gold-main/30 text-[10px] uppercase tracking-[0.4em] block font-bold">Mergulho Interno</span>
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Teste</span>
                  </div>
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
                  <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Modo Teste</span>
                  </div>
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
                <div className="flex items-center gap-2 text-emerald-400/40 text-[8px] uppercase tracking-widest font-bold bg-emerald-400/5 px-2 py-1 rounded-full border border-emerald-400/10">
                  <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                  <span>Teste</span>
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
              <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                <span>Modo Teste Ativo</span>
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
              className="animate-screen text-center max-w-2xl mx-auto"
            >
              <div className="glass-card p-6 md:p-12 border-gold-main/20 bg-gold-main/[0.01]">
                <div className="flex justify-center mb-8">
                  <div className="flex items-center gap-3 text-emerald-400/40 text-[9px] uppercase tracking-widest font-bold bg-emerald-400/5 px-3 py-1.5 rounded-full border border-emerald-400/10">
                    <div className="w-1 h-1 rounded-full bg-emerald-500 animate-pulse"></div>
                    <span>Modo Teste Ativo</span>
                  </div>
                </div>
                <h2 className="serif text-5xl text-gold-light mb-8">Obrigada por confiar</h2>
                <div className="space-y-6 text-white/40 font-light leading-relaxed mb-12">
                  <p className="text-gold-main/80 font-medium text-lg">{mapeamentoResult}</p>
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
