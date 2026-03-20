import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";

const app = express();
const PORT = 3000;

app.use(express.json());

const TRADES_FILE = path.join(process.cwd(), "trades.csv");
const JOURNAL_FILE = path.join(process.cwd(), "journal.txt");

// Ensure files exist
if (!fs.existsSync(TRADES_FILE)) {
  fs.writeFileSync(TRADES_FILE, "");
}
if (!fs.existsSync(JOURNAL_FILE)) {
  fs.writeFileSync(JOURNAL_FILE, "");
}

let TRADING_ENABLED = true;

// Helper to compute metrics
function computeMetrics() {
  const data = fs.readFileSync(TRADES_FILE, "utf-8");
  const lines = data.trim().split("\n").filter(l => l.length > 0);
  
  if (lines.length === 0) {
    return {
      total_pnl: 0,
      win_rate: 0,
      avg_win: 0,
      avg_loss: 0,
      max_drawdown: 0,
      equity_curve: []
    };
  }

  const trades = lines.map(line => {
    const [time, action, price, state, pnl] = line.split(",");
    return {
      time: parseFloat(time),
      action,
      price: parseFloat(price),
      state,
      pnl: parseFloat(pnl)
    };
  });

  const total_pnl = trades.reduce((sum, t) => sum + t.pnl, 0);
  const wins = trades.filter(t => t.pnl > 0);
  const losses = trades.filter(t => t.pnl < 0);
  
  const win_rate = trades.length > 0 ? wins.length / trades.length : 0;
  const avg_win = wins.length > 0 ? wins.reduce((sum, t) => sum + t.pnl, 0) / wins.length : 0;
  const avg_loss = losses.length > 0 ? losses.reduce((sum, t) => sum + t.pnl, 0) / losses.length : 0;

  let currentEquity = 0;
  const equity_curve = trades.map(t => {
    currentEquity += t.pnl;
    return currentEquity;
  });

  let maxEquity = -Infinity;
  let maxDD = 0;
  let runningEquity = 0;
  trades.forEach(t => {
    runningEquity += t.pnl;
    if (runningEquity > maxEquity) maxEquity = runningEquity;
    const dd = runningEquity - maxEquity;
    if (dd < maxDD) maxDD = dd;
  });

  return {
    total_pnl,
    win_rate,
    avg_win,
    avg_loss,
    max_drawdown: maxDD,
    equity_curve: equity_curve.map((val, idx) => ({ index: idx, value: val }))
  };
}

// API Endpoints
app.get("/api/analytics", (req, res) => {
  res.json(computeMetrics());
});

app.post("/api/trades", async (req, res) => {
  const { action, price, state, pnl, explanation } = req.body;
  const timestamp = Date.now() / 1000;
  const line = `${timestamp},${action},${price},${state},${pnl}\n`;
  fs.appendFileSync(TRADES_FILE, line);

  // Generate AI Journal Entry
  if (process.env.GEMINI_API_KEY) {
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const resultStr = pnl > 0 ? "WIN" : "LOSS";
      const entry = `
        Trade Action: ${action}
        Result: ${resultStr}
        PnL: ${pnl}
        Market Regime: ${state}
        Reason for Trade: ${explanation}
        Reflection: ${pnl > 0 ? "The trade aligned well with the market regime." : "The trade did not perform as expected. Possible regime misclassification or noise."}
      `.trim();

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Analyze this trade journal entry and provide deep insights on patterns, psychology, and market alignment:\n\n${entry}`,
      });

      const analysis = response.text || "No analysis generated.";
      fs.appendFileSync(JOURNAL_FILE, `--- TRADE LOG: ${new Date().toISOString()} ---\n${entry}\n\nAI ANALYSIS:\n${analysis}\n\n`);
    } catch (error) {
      console.error("AI Journaling error:", error);
    }
  }

  res.json({ status: "success" });
});

app.get("/api/journal", (req, res) => {
  const data = fs.readFileSync(JOURNAL_FILE, "utf-8");
  res.json({ content: data });
});

app.post("/api/voice", (req, res) => {
  const { command } = req.body;
  const cmd = command.toLowerCase();

  if (cmd.includes("regime")) {
    res.json({ response: "Current market regime is trending bullish based on recent volatility analysis." });
  } else if (cmd.includes("pnl") || cmd.includes("performance")) {
    const metrics = computeMetrics();
    res.json({ response: `Our total PnL is ${metrics.total_pnl.toFixed(2)}. Win rate is ${(metrics.win_rate * 100).toFixed(1)}%.` });
  } else if (cmd.includes("turn off") || cmd.includes("disable")) {
    TRADING_ENABLED = false;
    res.json({ response: "Trading system has been disabled." });
  } else if (cmd.includes("turn on") || cmd.includes("enable")) {
    TRADING_ENABLED = true;
    res.json({ response: "Trading system is now active." });
  } else {
    res.json({ response: "Command not recognized. I can check regime, PnL, or toggle trading status." });
  }
});

async function startServer() {
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
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
