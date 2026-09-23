import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { GrainType, OrderStatus } from "./src/types";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // --- MOCK DATA ---
  const MOCK_PRODUCTS = [
    {
      id: "p1",
      name: "Gluten-Free Cereal Mix",
      description: "A delicious blend of ancient grains, nuts, and seeds. Perfect for sensitive stomachs.",
      price: 15.00,
      weight: "600g jar",
      stock: 120,
      grainType: GrainType.GLUTEN_FREE,
      image: "/assets/gluten free.png",
      isPopular: true
    },
    {
      id: "p2",
      name: "Rice Combo Cereal Mix",
      description: "A satisfying and energy-packed blend of brown rice, oats, and dried fruit.",
      price: 12.50,
      weight: "600g jar",
      stock: 85,
      grainType: GrainType.RICE_COMBO,
      image: "/assets/rice combo.png",
      isPopular: true
    },
    {
      id: "p3",
      name: "Maize Combo Cereal Mix",
      description: "A nutritious golden blend of toasted maize, honey, and nutrient-rich seeds.",
      price: 11.50,
      weight: "600g jar",
      stock: 60,
      grainType: GrainType.MAIZE_COMBO,
      image: "/assets/maize combo.png",
      isPopular: false
    }
  ];

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
    console.log(`3ripple Server running on http://localhost:${PORT}`);
  });
}

startServer();
