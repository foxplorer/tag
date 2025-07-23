<img width="198" height="123" alt="tag100" src="https://github.com/user-attachments/assets/90a5545f-7856-4be0-b1a7-f2bfcf5ff98e" />

> **tag is just a prompt**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-20232A?style=flat&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![Bitcoin SV](https://img.shields.io/badge/Bitcoin%20SV-EAB300?style=flat&logo=bitcoin&logoColor=white)](https://bitcoinsv.com/)

## 🎮 Game Overview

tag is a real-time multiplayer game built on Bitcoin SV's 1SatOrdinals protocol, featuring the iconic **10 million Pixel Foxes** from [Pixel Foxes](https://x.com/foxespixel). Since its launch on **September 21, 2024 at 3:18:09 PM**, the game has facilitated **428+ tags** across **10 million potential players**. Will tag become the largest and most well-documented game of tag ever?

### 🚀 Key Features

- **Real-time Multiplayer**: Live tag gameplay with instant blockchain verification
- **1SatOrdinals Integration**: Every tag is permanently recorded in inscriptions on Bitcoin SV
- **Space Rocks Collectibles**: Dynamic collectibles colored by the last 6 hex digits of the latest Bitcoin block hash
- **BountyFoxes Rewards**: Win individual Bounty Foxes and Bounty Foxes Groups when making successful tags
- **Mobile-Friendly Foxes**: Collect special Mobile-Friendly Foxes through SHUAllet integration
- **Dual Wallet Support**: 
  - Mobile: [SHUAllet.js](https://github.com/jdh7190/SHUAllet.js/) for mobile wallets
  - Browser: [Yours Wallet](https://github.com/yours-org/yours-wallet) extension
- **Spectator Mode**: Watch games without participating
- **Dynamic Chaser System**: New chaser every 30 seconds
- **Projectiles**: Chasers can shoot projectiles at other players
- **Live Statistics**: Real-time player counts, game numbers, and activity tracking

## 🏗️ Architecture

The game consists of three main components:

### Frontend (`/frontend`)
- **React + TypeScript** application
- Real-time canvas-based game engine
- Socket.io client for live multiplayer
- Responsive design for mobile and desktop
- Integration with both SHUAllet and Yours Wallet

### Socket Server (`/socket_server`)
- **Node.js + TypeScript** real-time game server
- Socket.io for live player synchronization
- Game state management and collision detection
- Player assignment and chaser rotation
- Activity tracking and blockchain integration
- Space rock generation and block hash monitoring
- Bounty Foxes assignments & sends

### Transaction Server (`/transaction_server`)
- **Bun + TypeScript** blockchain transaction server
- 1SatOrdinals inscription creation
- Bitcoin SV transaction handling
- Game metadata storage on-chain
- Space rock inscription with dynamic SVG generation
- Mobile-Friendly Foxes and Bounty Foxes distribution

## 🎯 How to Play

### Controls
- **Arrow Keys** or **WASD**: Move your character
- **B**: Boost speed (for all players)
- **N**: Shoot projectiles (chaser only)
- Joystick, zoom, full-screen, and shoot buttons available on mobile devices

### Game Rules
1. **Chaser Selection**: A new chaser is randomly selected every 30 seconds
2. **Tagging**: Chaser must touch other players to tag them
3. **Projectiles**: Chaser can shoot projectiles to tag from a distance
4. **Blockchain Recording**: Every successful tag is permanently recorded on Bitcoin SV
5. **BountyFoxes Rewards**: Successful tags can reward you with individual BountyFoxes or BountyFoxes groups
6. **Space Rocks**: Collect dynamic space rocks colored by the latest Bitcoin block hash
7. **Spectator Mode**: Watch games without participating
8. **Tagged Foxes Are Out Forever**: Once you're out, you're out forever

### Wallet Integration
- **Mobile Users**: Connect with SHUAllet.js for seamless mobile gameplay and access to mobile-friendly foxes
- **Desktop Users**: Use Yours Wallet browser extension
- **Automatic Routing**: Game automatically detects wallet type and routes accordingly

## 📊 Game Statistics

- **Total Tags**: 428+ (and counting)
- **Potential Players**: 10 million
- **Launch Date**: September 21, 2024, 3:18:09 PM
- **Current Epoch**: 1
- **Current Game Number**: Real-time tracking
- **Active Players**: Live count displayed in-game
- **Space Rocks**: Dynamic collectibles with blockchain-generated colors
- **BountyFoxes Distributed**: Individual and group rewards for successful tags
- **Mobile-Friendly Foxes**: SHUAllet-exclusive foxes for mobile players

## 🛠️ Development Setup

### Prerequisites
- Node.js v20.13.0+
- Bun (for transaction server)
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd tag-open-sauce
```

2. **Frontend Setup**
```bash
cd frontend
npm install
npm start
```

3. **Socket Server Setup**
```bash
cd socket_server
npm install
npm start
```

4. **Transaction Server Setup**
```bash
cd transaction_server
bun install
# Copy .env.example to .env and configure your WIF keys
bun run index.ts
```

### Environment Configuration

Create `.env` files in both server directories:

**socket_server/.env**
```env
PORT=5000
```

**transaction_server/.env**
```env
TAG_ONE_THOUSAND_PAYMENT_WIF=your_payment_wif
TAG_ORD_WIF=your_ord_wif
TAG_SIGNING_WIF=your_signing_wif
```

## 🔧 Technical Stack

### Frontend
- **React 18** with TypeScript
- **Socket.io Client** for real-time communication
- **Canvas API** for game rendering
- **Material-UI** for UI components
- **Framer Motion** for animations

### Backend
- **Node.js** with TypeScript
- **Socket.io** for real-time multiplayer
- **Express.js** for REST APIs
- **Bun** for high-performance transaction server

### Blockchain
- **Bitcoin SV** for transactions
- **1SatOrdinals** for game metadata
- **BSV SDK** for blockchain operations
- **[js-1sat-ord](https://github.com/BitcoinSchema/js-1sat-ord)** for ordinals handling

## 📚 Key Libraries & Resources

### 1SatOrdinals Protocol
[1SatOrdinals](https://1satordinals.com/) is a simple, powerful token protocol built on Bitcoin SV that enables fast, inexpensive, and fully scriptable ordinals via native Bitcoin Script. Our game leverages this protocol for all blockchain interactions.

### js-1sat-ord
The [js-1sat-ord](https://github.com/BitcoinSchema/js-1sat-ord) library is a JavaScript library for creating and managing 1SatOrdinal inscriptions and transactions. It uses `@bsv/sdk` under the hood and provides essential functionality for our game:

For more information, visit the [js-1sat-ord GitHub repository](https://github.com/BitcoinSchema/js-1sat-ord).

## 🌟 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Areas
- Game mechanics improvements
- UI/UX enhancements
- Performance optimizations
- New game modes
- Wallet integrations
- Much more

## 🤝 Community
- **GitHub Issues**: Report bugs and request features
- **Pull Requests**: Contribute to the codebase

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Pixel Foxes](https://x.com/foxespixel) for the iconic 10 million pixel foxes that bring the game to life and facilitate massive scale
- [SHUAllet.js](https://github.com/jdh7190/SHUAllet.js/) for mobile wallet integration
- [Yours Wallet](https://github.com/yours-org/yours-wallet) for browser extension support
- Bitcoin SV community for blockchain infrastructure
- All contributors and players who make this game possible

---
