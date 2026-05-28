
# Quant Regime Engine

**Hidden Markov Model (HMM) trading system with regime detection, automated execution, and AI-driven insights.**

A real-time quantitative trading dashboard built with React, TypeScript, and Gemini AI. The system detects market regimes, executes simulated trades, tracks performance, and maintains an intelligent trade journal.

![Dashboard Preview](https://via.placeholder.com/800x400/0A0A0A/10b981?text=Quant+Regime+Engine+Dashboard)

## ✨ Features

- **Market Regime Detection** — Uses Hidden Markov Models (conceptual) to identify Bullish, Bearish, Mean-Reverting, and High Volatility regimes
- **Real-time Analytics Dashboard** — Live PnL, win rate, equity curve, drawdown, and performance metrics
- **AI Trade Journal** — Powered by Google Gemini — automatically generates deep post-trade analysis and reflections
- **Voice Control** — Hands-free assistant (PnL check, regime status, enable/disable trading)
- **Simulated Trading Engine** — One-click trade simulation with realistic regime-based logic
- **Beautiful Dark UI** — Modern, professional trading interface with smooth animations

## 🛠 Tech Stack

- **Frontend**: React 19 + TypeScript + Vite + Tailwind CSS + Recharts
- **Backend**: Express + TypeScript
- **AI**: Google Gemini (`@google/genai`)
- **Voice**: Web Speech API
- **Styling**: Tailwind + Lucide Icons + Motion (Framer Motion)

## 🚀 Quick Start

### Prerequisites
- Node.js (v18+)
- Gemini API Key (from [Google AI Studio](https://aistudio.google.com))

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/youngslim4985-sketch/quant-regime-engine.git
   cd quant-regime-engine
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   ```
   Add your Gemini API key to `.env.local`:
   ```env
   GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000)

## 📊 How It Works

1. **Regime Detection** — The system classifies market conditions
2. **Trade Execution** — Simulated trades are logged with regime context
3. **AI Analysis** — Gemini generates insightful journal entries analyzing performance, psychology, and regime alignment
4. **Performance Tracking** — Real-time equity curve and risk metrics

## 🎮 Usage

- Click **"SIMULATE TRADE"** to generate random regime-aware trades
- Switch between **Dashboard**, **AI Journal**, and **Voice Assistant** tabs
- Use voice commands like:
  - *"What's our PnL?"*
  - *"Current regime?"*
  - *"Turn off trading"*

## 📁 Project Structure

```bash
├── src/
│   └── App.tsx              # Main React application
├── server.ts                # Express backend + API routes
├── trades.csv               # Trade history (auto-generated)
├── journal.txt              # AI-generated trade journal
├── .env.example
├── package.json
└── vite.config.ts
```

## 🔮 Future Enhancements

- Real market data integration (Binance, Alpaca, etc.)
- True Hidden Markov Model implementation
- Backtesting engine
- Portfolio optimization
- Risk management module
- Deployment-ready Docker setup

## 🤝 Contributing

Contributions, issues, and feature requests are welcome!

## 📄 License

MIT License

---

**Built with ❤️ for quant traders and AI enthusiasts**

*Generated from Google Gemini AI Studio template*
```

---

**Would you like me to adjust anything?** For example:
- Make it more technical
- Add screenshots (if you provide them)
- Include performance benchmarks
- Add installation instructions for production

Just let me know!