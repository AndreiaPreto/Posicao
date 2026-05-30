import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import { getFirestore } from "firebase-admin/firestore";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let rawDb: any;
let db: any;

const inMemoryStore: Record<string, Record<string, any>> = {};
let isUsingInMemoryFallback = false;

function processInMemoryValue(val: any, currentVal: any) {
  if (val === undefined || val === null) return val;
  if (typeof val === 'object') {
    if (val._methodName === 'FieldValue.increment' || val.constructor?.name?.includes('Increment') || ('operand' in val)) {
      const operand = val._operand !== undefined ? val._operand : (val.operand !== undefined ? val.operand : 1);
      return (Number(currentVal) || 0) + operand;
    }
    if (val._methodName === 'FieldValue.serverTimestamp' || val.constructor?.name?.includes('Timestamp')) {
      return new Date().toISOString();
    }
  }
  return val;
}

function createInMemoryDocRef(colName: string, docId: string) {
  return {
    exists: inMemoryStore[colName]?.[docId] !== undefined,
    id: docId,
    ref: {
      delete: async () => {
        if (inMemoryStore[colName]) {
          delete inMemoryStore[colName][docId];
        }
      }
    },
    get: async () => {
      const data = inMemoryStore[colName]?.[docId];
      return {
        exists: data !== undefined,
        id: docId,
        ref: {
          delete: async () => {
            if (inMemoryStore[colName]) {
              delete inMemoryStore[colName][docId];
            }
          }
        },
        data: () => data || null
      };
    },
    set: async (newData: any, options?: { merge?: boolean }) => {
      if (!inMemoryStore[colName]) inMemoryStore[colName] = {};
      const oldData = inMemoryStore[colName][docId] || {};
      const mergedData = options?.merge ? { ...oldData } : {};
      
      Object.keys(newData).forEach(key => {
        mergedData[key] = processInMemoryValue(newData[key], oldData[key]);
      });
      inMemoryStore[colName][docId] = mergedData;
    },
    update: async (updateData: any) => {
      if (!inMemoryStore[colName]) inMemoryStore[colName] = {};
      const oldData = inMemoryStore[colName][docId] || {};
      
      Object.keys(updateData).forEach(key => {
        oldData[key] = processInMemoryValue(updateData[key], oldData[key]);
      });
      inMemoryStore[colName][docId] = oldData;
    },
    delete: async () => {
      if (inMemoryStore[colName]) {
        delete inMemoryStore[colName][docId];
      }
    }
  };
}

function createInMemoryCollection(colName: string) {
  return {
    doc: (docId: string) => createInMemoryDocRef(colName, docId),
    get: async () => {
      const colStore = inMemoryStore[colName] || {};
      const docs = Object.entries(colStore).map(([id, data]) => ({
        id,
        ref: {
          delete: async () => {
            delete colStore[id];
          }
        },
        data: () => data
      }));
      return { docs };
    }
  };
}

function buildSafeDb(unwrappedDb: any, forceFallback: boolean = false) {
  if (forceFallback) {
    isUsingInMemoryFallback = true;
  }
  return {
    collection: (colName: string) => {
      return {
        doc: (docId: string) => {
          return {
            get: async () => {
              if (isUsingInMemoryFallback) {
                return createInMemoryDocRef(colName, docId).get();
              }
              try {
                return await unwrappedDb.collection(colName).doc(docId).get();
              } catch (err: any) {
                if (err && (err.message?.includes("PERMISSION_DENIED") || err.code === 7 || err.status === 7 || String(err).includes("PERMISSION_DENIED"))) {
                  console.warn(`⚠️ [SafeDB] PERMISSION_DENIED on get ${colName}/${docId}. Falling back to InMemory DB.`);
                  isUsingInMemoryFallback = true;
                  return createInMemoryDocRef(colName, docId).get();
                }
                throw err;
              }
            },
            set: async (data: any, options?: any) => {
              if (isUsingInMemoryFallback) {
                return createInMemoryDocRef(colName, docId).set(data, options);
              }
              try {
                return await unwrappedDb.collection(colName).doc(docId).set(data, options);
              } catch (err: any) {
                if (err && (err.message?.includes("PERMISSION_DENIED") || err.code === 7 || err.status === 7 || String(err).includes("PERMISSION_DENIED"))) {
                  console.warn(`⚠️ [SafeDB] PERMISSION_DENIED on set ${colName}/${docId}. Falling back to InMemory DB.`);
                  isUsingInMemoryFallback = true;
                  return createInMemoryDocRef(colName, docId).set(data, options);
                }
                throw err;
              }
            },
            update: async (data: any) => {
              if (isUsingInMemoryFallback) {
                return createInMemoryDocRef(colName, docId).update(data);
              }
              try {
                return await unwrappedDb.collection(colName).doc(docId).update(data);
              } catch (err: any) {
                if (err && (err.message?.includes("PERMISSION_DENIED") || err.code === 7 || err.status === 7 || String(err).includes("PERMISSION_DENIED"))) {
                  console.warn(`⚠️ [SafeDB] PERMISSION_DENIED on update ${colName}/${docId}. Falling back to InMemory DB.`);
                  isUsingInMemoryFallback = true;
                  return createInMemoryDocRef(colName, docId).update(data);
                }
                throw err;
              }
            },
            delete: async () => {
              if (isUsingInMemoryFallback) {
                return createInMemoryDocRef(colName, docId).delete();
              }
              try {
                return await unwrappedDb.collection(colName).doc(docId).delete();
              } catch (err: any) {
                if (err && (err.message?.includes("PERMISSION_DENIED") || err.code === 7 || err.status === 7 || String(err).includes("PERMISSION_DENIED"))) {
                  console.warn(`⚠️ [SafeDB] PERMISSION_DENIED on delete ${colName}/${docId}. Falling back to InMemory DB.`);
                  isUsingInMemoryFallback = true;
                  return createInMemoryDocRef(colName, docId).delete();
                }
                throw err;
              }
            }
          };
        },
        get: async () => {
          if (isUsingInMemoryFallback) {
            return createInMemoryCollection(colName).get();
          }
          try {
            return await unwrappedDb.collection(colName).get();
          } catch (err: any) {
            if (err && (err.message?.includes("PERMISSION_DENIED") || err.code === 7 || err.status === 7 || String(err).includes("PERMISSION_DENIED"))) {
              console.warn(`⚠️ [SafeDB] PERMISSION_DENIED on query ${colName}. Falling back to InMemory DB.`);
              isUsingInMemoryFallback = true;
              return createInMemoryCollection(colName).get();
            }
            throw err;
          }
        }
      };
    }
  };
}

try {
  let app: admin.app.App;
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    if (!admin.apps.length) {
      try {
        app = admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId,
        });
      } catch (authError) {
        console.error("⚠️ Erro ao inicializar Firebase Admin com applicationDefault:", authError);
        // Fallback to basic initialization without credentials
        app = admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
    } else {
      app = admin.apps[0];
    }
    // Use named database if provided via getFirestore helper from firebase-admin/firestore
    rawDb = firebaseConfig.firestoreDatabaseId 
      ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
      : getFirestore(app);
  } else {
    console.warn("⚠️ firebase-applet-config.json não encontrado.");
    if (!admin.apps.length) {
      app = admin.initializeApp();
    } else {
      app = admin.apps[0];
    }
    rawDb = getFirestore(app);
  }
  db = buildSafeDb(rawDb);
} catch (error) {
  console.error("❌ Erro crítico ao inicializar Firebase Admin:", error);
  db = buildSafeDb(null, true);
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
const isMockKey = !stripeKey || stripeKey === "sk_test_mock" || stripeKey.startsWith("mk_");

if (isMockKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY não encontrada ou inválida (mock). Usando modo de simulação (sk_test_mock).");
}
const stripe = new Stripe(isMockKey ? "sk_test_mock" : stripeKey!);

async function ensureAdminAccount() {
  const adminEmail = "andreiapreto@gmail.com";
  const adminPassword = "And1267$";
  
  try {
    console.log(`[Self-Heal] Ensuring admin account for ${adminEmail}...`);
    let userRecord;
    try {
      userRecord = await admin.auth().getUserByEmail(adminEmail);
      console.log(`[Self-Heal] Admin user already exists. Updating password to requested one...`);
      await admin.auth().updateUser(userRecord.uid, {
        password: adminPassword,
        emailVerified: true
      });
      console.log(`[Self-Heal] Password updated successfully for existing user.`);
    } catch (authError: any) {
      if (authError.code === 'auth/user-not-found') {
        console.log(`[Self-Heal] Admin user not found. Creating a new account...`);
        userRecord = await admin.auth().createUser({
          email: adminEmail,
          password: adminPassword,
          emailVerified: true,
          displayName: "Andréia Preto"
        });
        console.log(`[Self-Heal] Created new admin user.`);
      } else {
        throw authError;
      }
    }

    if (userRecord && userRecord.uid) {
      // Also ensure the user document exists in Firestore and has the 'admin' role
      const userRef = db.collection("users").doc(userRecord.uid);
      const docSnap = await userRef.get();
      if (!docSnap.exists) {
        console.log(`[Self-Heal] Creating Firestore admin user document...`);
        await userRef.set({
          uid: userRecord.uid,
          email: adminEmail,
          name: "Andréia Preto",
          role: "admin",
          paidStatus: true,
          mappingCredits: 999,
          createdAt: new Date().toISOString()
        });
      } else {
        const data = docSnap.data();
        if (data?.role !== "admin") {
          console.log(`[Self-Heal] Updating Firestore user document role to admin...`);
          await userRef.update({
            role: "admin"
          });
        }
      }
      console.log(`[Self-Heal] Admin account is fully verified, updated, and ready!`);
    }
  } catch (err: any) {
    if (err && (err.message?.includes("Identity Toolkit API") || err.code === 'auth/internal-error')) {
      console.warn("⚠️ Firebase Authentication API (Identity Toolkit API) is not enabled in Google Cloud Console. Skipping admin user creation in Auth, but will still try to write default admin document in Firestore if db is active...");
      try {
        const uId = "admin_fallback_uid_andreiapreto"; 
        const userRef = db.collection("users").doc(uId);
        const docSnap = await userRef.get();
        if (!docSnap.exists) {
          console.log(`[Self-Heal] Creating fallback Firestore admin user document due to lack of Auth Service...`);
          await userRef.set({
            uid: uId,
            email: adminEmail,
            name: "Andréia Preto",
            role: "admin",
            paidStatus: true,
            mappingCredits: 999,
            createdAt: new Date().toISOString()
          });
        } else {
          const data = docSnap.data();
          if (data?.role !== "admin") {
            await userRef.update({
              role: "admin"
            });
          }
        }
        console.log(`[Self-Heal] Direct Firestore Admin document updated and ready with fallback uid.`);
      } catch (dbErr) {
        console.error("⚠️ Fallback admin document generation failed:", dbErr);
      }
    } else {
      console.error("[Self-Heal] Error in ensureAdminAccount:", err);
    }
  }
}

const OFFICIAL_PRODUCTS = [
  {
    id: "diagnostico-de-posicao",
    name: "Diagnóstico de Posição",
    slug: "diagnostico-de-posicao",
    category: "Diagnóstico",
    type: "one_time",
    price: 69,
    description: "Mapeie sua frequência atual e descubra o caminho exato para o seu alinhamento.",
    active: true,
    order: 1,
    legacyNames: ["Diagnóstico Posição", "Diagnóstico POSIÇÃO", "diagnostico-posicao"]
  },
  {
    id: "mapa-de-posicao-floral",
    name: "Mapa de Posição - Floral",
    slug: "mapa-de-posicao-floral",
    category: "Mapeamento",
    type: "one_time",
    price: 9,
    description: "Descubra sua emoção dominante, seu arquétipo ativo e sua fórmula floral personalizada.",
    active: true,
    order: 2,
    legacyNames: ["Mapeamento Floral", "Mapeamento Emocional Floral", "mapeamento-floral"]
  },
  {
    id: "reset-de-posicao",
    name: "Reset de Posição",
    slug: "reset-de-posicao",
    category: "Reprogramação",
    type: "one_time",
    price: 197,
    description: "Processo guiado completo para reorganizar padrões e crenças limitantes. Áudio de frequência personalizada para alinhar sua base interna.",
    active: true,
    order: 3,
    legacyNames: ["Reprograme-se", "Reprogramação Pessoal", "reprograme-se", "reprogramacao-pessoal"]
  },
  {
    id: "clube-posicao-nucleo-taro",
    name: "Clube Posição - Núcleo Tarô",
    slug: "clube-posicao-nucleo-taro",
    category: "Clube",
    type: "subscription",
    price: 117,
    description: "Leituras, direcionamentos e acompanhamento simbólico para clareza, decisão e posicionamento.",
    active: true,
    order: 4,
    legacyNames: ["Clube do Tarô", "Clube do Tarot", "clube-do-taro"]
  },
  {
    id: "clube-posicao-nucleo-clarear",
    name: "Clube Posição - Núcleo Clarear",
    slug: "clube-posicao-nucleo-clarear",
    category: "Clube",
    type: "subscription",
    price: 47,
    description: "Meditações, práticas guiadas e conteúdos para reorganização emocional e energética.",
    active: true,
    order: 5,
    legacyNames: ["Clube Clarear", "clube-clarear"]
  },
  {
    id: "ciclos-de-posicao-do-mes",
    name: "Ciclos de Posição do Mês",
    slug: "ciclos-de-posicao-do-mes",
    category: "Ciclos",
    type: "monthly",
    price: 39,
    description: "Ciclos de posicionamento e acompanhamento energético de rituais mensais.",
    active: true,
    order: 6,
    legacyNames: ["Rituais Mensais", "rituais-mensais", "Rituais do Mês"]
  },
  {
    id: "biblioteca-posicao",
    name: "Biblioteca Posição",
    slug: "biblioteca-posicao",
    category: "Biblioteca",
    type: "library",
    price: 29,
    description: "Acesso à biblioteca com ebooks e materiais especiais.",
    active: true,
    order: 7,
    legacyNames: ["Biblioteca de Ebooks", "Biblioteca", "biblioteca-ebooks"]
  }
];

async function ensureProductsExist() {
  try {
    console.log("[Self-Heal] Syncing products in Firestore...");
    for (const prod of OFFICIAL_PRODUCTS) {
      const docRef = db.collection("products").doc(prod.id);
      const docSnap = await docRef.get();
      
      const payload = {
        ...prod,
        createdAt: docSnap.exists ? (docSnap.data()?.createdAt || new Date().toISOString()) : new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      
      await docRef.set(payload, { merge: true });
      console.log(`[Self-Heal] Synced product: ${prod.name}`);
    }
    
    const allProdDocs = await db.collection("products").get();
    for (const doc of allProdDocs.docs) {
      const data = doc.data();
      const docId = doc.id;
      
      if (!OFFICIAL_PRODUCTS.some(p => p.id === docId)) {
        const foundOfficial = OFFICIAL_PRODUCTS.find(p => 
          p.legacyNames.includes(data.name || "") ||
          p.legacyNames.includes(docId) ||
          p.legacyNames.includes(data.slug || "")
        );
        
        if (foundOfficial) {
          console.log(`[Self-Heal] Found legacy product document "${docId}". Migrating to "${foundOfficial.id}"...`);
          const newDocRef = db.collection("products").doc(foundOfficial.id);
          await newDocRef.set({
            ...foundOfficial,
            createdAt: data.createdAt || new Date().toISOString(),
            updatedAt: new Date().toISOString()
          }, { merge: true });
          
          await doc.ref.delete();
          console.log(`[Self-Heal] Legacy product "${docId}" successfully migrated.`);
        }
      }
    }
  } catch (err) {
    console.error("[Self-Heal] Error syncing products:", err);
  }
}

async function startServer() {
  // Run the admin sync process on startup
  await ensureAdminAccount();
  await ensureProductsExist();

  const app = express();
  const PORT = process.env.PORT || 3000;

  // Middleware for Stripe Webhook (needs raw body)
  app.post("/api/webhook", express.raw({ type: "application/json" }), async (req, res) => {
    const sig = req.headers["stripe-signature"];
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

    let event;

    try {
      if (webhookSecret && sig) {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
      } else {
        // Fallback for local testing without secret
        event = JSON.parse(req.body.toString());
      }
    } catch (err: any) {
      console.error(`Webhook Error: ${err.message}`);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    try {
      switch (event.type) {
        case "checkout.session.completed": {
          const session = event.data.object as Stripe.Checkout.Session;
          console.log(`Payment confirmed for session: ${session.id}`);
          
          const firebaseUid = session.metadata?.firebaseUid;
          if (firebaseUid) {
            await db.collection("users").doc(firebaseUid).update({
              paidStatus: true,
              mappingCredits: admin.firestore.FieldValue.increment(1),
              lastPaymentAt: admin.firestore.FieldValue.serverTimestamp(),
            });
          }
          break;
        }
        case "customer.subscription.updated":
        case "customer.subscription.deleted": {
          const subscription = event.data.object as Stripe.Subscription;
          const customerId = subscription.customer as string;
          const customer = await stripe.customers.retrieve(customerId) as Stripe.Customer;
          
          const firebaseUid = customer.metadata?.firebaseUid;
          if (firebaseUid) {
            const isActive = subscription.status === "active";
            await db.collection("users").doc(firebaseUid).update({
              clube_ativo: isActive,
              subscriptionStatus: subscription.status,
              subscriptionId: subscription.id,
            });
            console.log(`User ${firebaseUid} subscription status updated to: ${subscription.status}`);
          }
          break;
        }
        default:
          console.log(`Unhandled event type ${event.type}`);
      }
    } catch (dbError) {
      console.error("Error updating Firestore from webhook:", dbError);
    }

    res.json({ received: true });
  });

  app.use(express.json());

  // API Routes
  app.post("/api/create-checkout-session", async (req, res) => {
    const { productName, amount, isSubscription, customerEmail, firebaseUid, metadata } = req.body;

    try {
      // Simulation Mode if Stripe key is missing or is mock
      if (isMockKey) {
        console.log("🛠️ Simulation Mode: Creating mock checkout session for", productName);
        
        // In simulation mode, we just return a success URL that will trigger the webhook logic manually
        // or we can just redirect to the success page.
        // To make it feel real, we'll return a URL that points back to our server to "confirm" the payment
        const successUrl = `${process.env.APP_URL || "http://localhost:3000"}/?payment_success=true&session_id=mock_session_${Date.now()}`;
        return res.json({ url: successUrl });
      }

      // Find or create Stripe customer
      let stripeCustomerId: string;
      const customers = await stripe.customers.list({
        email: customerEmail,
        limit: 1,
      });

      if (customers.data.length > 0) {
        stripeCustomerId = customers.data[0].id;
        // Ensure metadata is updated with firebaseUid
        if (customers.data[0].metadata.firebaseUid !== firebaseUid) {
          await stripe.customers.update(stripeCustomerId, {
            metadata: { ...customers.data[0].metadata, firebaseUid },
          });
        }
      } else {
        const customer = await stripe.customers.create({
          email: customerEmail,
          metadata: { firebaseUid },
        });
        stripeCustomerId = customer.id;
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ["card"],
        customer: stripeCustomerId,
        line_items: [
          {
            price_data: {
              currency: "brl",
              product_data: {
                name: productName,
              },
              unit_amount: amount, // in cents
              recurring: isSubscription ? { interval: "month" } : undefined,
            },
            quantity: 1,
          },
        ],
        mode: isSubscription ? "subscription" : "payment",
        metadata: { ...metadata, firebaseUid },
        success_url: `${process.env.APP_URL || "http://localhost:3000"}/?payment_success=true&session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${process.env.APP_URL || "http://localhost:3000"}/?payment_cancel=true`,
      });

      res.json({ url: session.url });
    } catch (error: any) {
      console.error("Stripe Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // User Access API
  app.get("/api/user-access", async (req, res) => {
    const { uid } = req.query;
    
    if (!uid) {
      return res.json({
        user_id: "anonymous",
        diagnostico_comprado: false,
        clube_ativo: false,
        reprogramacao_pessoal_comprada: false,
        reprogramar_eu_comprado: false,
      });
    }

    try {
      const userDoc = await db.collection("users").doc(uid as string).get();
      if (userDoc.exists) {
        const userData = userDoc.data();
        let isAdmin = userData?.role === 'admin';
        
        // If not admin in DB, check email
        if (!isAdmin) {
          try {
            const userRecord = await admin.auth().getUser(uid as string);
            if (userRecord.email && userRecord.email.toLowerCase() === 'andreiapreto@gmail.com') {
              isAdmin = true;
              if (userData?.role !== 'admin') {
                await db.collection("users").doc(uid as string).update({ role: 'admin' });
              }
            }
          } catch (e) {
            console.error("Error fetching user record:", e);
          }
        }

        return res.json({
          user_id: uid,
          diagnostico_comprado: isAdmin || (userData?.mappingCredits || 0) > 0,
          mappingCredits: isAdmin ? 999 : (userData?.mappingCredits || 0),
          clube_ativo: userData?.clube_ativo || false,
          reprogramacao_pessoal_comprada: userData?.reprogramacao_pessoal_comprada || false,
          reprogramar_eu_comprado: userData?.reprogramar_eu_comprado || false,
        });
      }
      
      res.json({
        user_id: uid,
        diagnostico_comprado: false,
        mappingCredits: 0,
        clube_ativo: false,
        reprogramacao_pessoal_comprada: false,
        reprogramar_eu_comprado: false,
      });
    } catch (error) {
      console.error("Error fetching user access:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  });

  // Gemini Mapeamento API
  app.post("/api/gemini/mapeamento", async (req, res) => {
    const { quizContext, suggestedFlorais, arcanosList } = req.body;

    if (!quizContext || !suggestedFlorais || !arcanosList) {
      return res.status(400).json({ error: "Missing required fields (quizContext, suggestedFlorais, arcanosList)" });
    }

    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY do servidor não configurada.");
      }
      
      console.log(`[Gemini Route] Configured key verified. Length: ${apiKey.length}. Starts with: ${apiKey.substring(0, 4)}...`);

      const ai = new GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });

      // Step 1: Select Florais (Refined by AI) using non-deprecated model "gemini-3.5-flash"
      let floraisList = suggestedFlorais;
      try {
        const selectResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
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
      } catch (e: any) {
        console.error("Error selecting florais with AI:", e);
      }

      // Step 1.2: Sanity check resulting florais list
      if (floraisList) {
        floraisList = floraisList.replace(/[#*`:]/g, "").trim();
      }

      // Step 2: Generate Full Report using non-deprecated model "gemini-3.5-flash"
      let resultText = "";
      try {
        const reportResponse = await ai.models.generateContent({
          model: "gemini-3.5-flash",
          contents: `Você é um especialista em análise emocional e Florais de Bach.
Gere um relatório terapêutico personalizado (Mapeamento Emocional Floral).

DADOS DO QUIZ:
${quizContext}

FLORAIS SELECIONADOS (coloque exatamente estes):
${floraisList}

LISTA DE ARCANOS POSSÍVEIS (Escolha o que melhor representa o padrão do usuário):
${arcanosList.join(', ')}

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
      } catch (e: any) {
        console.error("Error generating report with Gemini 3.5 Flash:", e);
        throw e;
      }

      res.json({
        floraisList,
        resultText
      });

    } catch (error: any) {
      console.error("Gemini route error:", error);
      res.status(500).json({ error: error.message || "Failed to make Gemini API calls." });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath, { index: false }));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
