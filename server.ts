import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { OrderStatus } from "./src/types";
import { fallbackProducts } from "./src/data/products";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // Shared catalogue for local development and the hosted frontend.
  const MOCK_PRODUCTS = fallbackProducts;

  // --- API ROUTES ---

  // Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // Fetch products (supports filtering by grainType)
  app.get("/api/products", (req, res) => {
    const { grainType } = req.query;
    if (grainType) {
      const filtered = MOCK_PRODUCTS.filter(p => p.grainType === grainType);
      return res.json(filtered);
    }
    res.json(MOCK_PRODUCTS);
  });

  // Fetch single product
  app.get("/api/products/:id", (req, res) => {
    const product = MOCK_PRODUCTS.find(p => p.id === req.params.id);
    if (!product) return res.status(404).json({ error: "Product not found" });
    res.json(product);
  });

  // Process checkout
  app.post("/api/checkout", (req, res) => {
    const orderData = req.body;
    console.log("Processing Order:", orderData);
    
    // In a real app, calculate tax/shipping server-side
    // and integrate with Stripe/Paystack/Momo
    const orderResponse = {
      orderId: "ORD-" + Math.random().toString(36).substr(2, 9).toUpperCase(),
      status: OrderStatus.PROCESSING,
      message: "Order placed successfully"
    };
    
    res.status(201).json(orderResponse);
  });

  // Delivery Calculator Logic (Server-side endpoint if needed)
  app.post("/api/calculate-delivery", (req, res) => {
    const { address, method } = req.body;
    // Logic: distance-based or zone-based pricing
    let fee = method === "express" ? 14.99 : 5.99;
    res.json({ fee });
  });

  // --- VITE MIDDLEWARE ---
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`3Ripple Server running on http://localhost:${PORT}`);
  });
}

startServer();
