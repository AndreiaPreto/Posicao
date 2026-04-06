import express from "express";
import { createServer as createViteServer } from "vite";
import Stripe from "stripe";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import admin from "firebase-admin";
import fs from "fs";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Firebase Admin
const firebaseConfigPath = path.join(process.cwd(), "firebase-applet-config.json");
let db: admin.firestore.Firestore;

try {
  if (fs.existsSync(firebaseConfigPath)) {
    const firebaseConfig = JSON.parse(fs.readFileSync(firebaseConfigPath, "utf-8"));
    if (!admin.apps.length) {
      try {
        admin.initializeApp({
          credential: admin.credential.applicationDefault(),
          projectId: firebaseConfig.projectId,
        });
      } catch (authError) {
        console.error("⚠️ Erro ao inicializar Firebase Admin com applicationDefault:", authError);
        // Fallback to basic initialization without credentials (might work for public data or in some environments)
        admin.initializeApp({
          projectId: firebaseConfig.projectId,
        });
      }
    }
    // Use named database if provided
    db = firebaseConfig.firestoreDatabaseId 
      ? admin.firestore(firebaseConfig.firestoreDatabaseId)
      : admin.firestore();
  } else {
    console.warn("⚠️ firebase-applet-config.json não encontrado.");
    if (!admin.apps.length) {
      admin.initializeApp();
    }
    db = admin.firestore();
  }
} catch (error) {
  console.error("❌ Erro crítico ao inicializar Firebase Admin:", error);
  // Initialize a mock or empty db to prevent server crash
  // @ts-ignore
  db = {
    collection: () => ({
      doc: () => ({
        get: async () => ({ exists: false }),
        set: async () => {},
        update: async () => {},
        delete: async () => {},
      })
    })
  } as any;
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
const isMockKey = !stripeKey || stripeKey === "sk_test_mock" || stripeKey.startsWith("mk_");

if (isMockKey) {
  console.warn("⚠️ STRIPE_SECRET_KEY não encontrada ou inválida (mock). Usando modo de simulação (sk_test_mock).");
}
const stripe = new Stripe(isMockKey ? "sk_test_mock" : stripeKey!);

async function startServer() {
  const app = express();
  const PORT = 3000;

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
            if (userRecord.email === 'andreiapreto@gmail.com') {
              isAdmin = true;
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
