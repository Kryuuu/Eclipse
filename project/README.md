# Russian Roulette - Internet Computer Protocol

Aplikasi Russian Roulette yang dibangun dengan Motoko backend dan vanilla JavaScript frontend, berjalan di Internet Computer Protocol (ICP).

## Features

### Backend (Motoko)
- **Game Logic**: Simulasi revolver 6 chamber dengan random bullet placement
- **Player Statistics**: Tracking games played, rounds survived, best streak
- **Leaderboard**: Global ranking berdasarkan best streak
- **Authentication**: Integrasi dengan Internet Identity
- **Persistent Storage**: Data tersimpan di blockchain ICP

### Frontend (Vanilla JavaScript)
- **Real-time Game**: Interaksi langsung dengan backend Motoko
- **Visual Effects**: Animasi spinning chamber, trigger action, game over effects
- **Responsive Design**: Optimized untuk desktop dan mobile
- **Keyboard Shortcuts**: Space (trigger), S (spin), R (reset), N (new game)
- **Connection Status**: Real-time status koneksi ke ICP

## Setup Development

### Prerequisites
- Node.js (v16 atau lebih baru)
- DFX SDK (Internet Computer SDK)
- WSL2 (untuk Windows users)

### Installation

1. **Install DFX SDK**:
```bash
sh -ci "$(curl -fsSL https://sdk.dfinity.org/install.sh)"
```

2. **Clone dan setup project**:
```bash
git clone <repository-url>
cd russian-roulette-icp
npm install
```

3. **Start local ICP network**:
```bash
dfx start --background
```

4. **Deploy canisters**:
```bash
dfx deploy
```

5. **Start development server**:
```bash
npm run dev
```

## Deployment ke ICP Mainnet

1. **Setup cycles wallet**:
```bash
dfx identity --network ic get-wallet
```

2. **Deploy ke mainnet**:
```bash
dfx deploy --network ic
```

## Game Mechanics

### Rules
1. Revolver memiliki 6 chamber, 1 berisi peluru
2. Player spin chamber untuk random bullet placement
3. Pull trigger untuk menembak chamber saat ini
4. Jika chamber kosong = safe, lanjut ke chamber berikutnya
5. Jika chamber berisi peluru = game over
6. Goal: Survive sebanyak mungkin rounds

### Scoring
- **Rounds Survived**: Jumlah trigger pull yang safe
- **Best Streak**: Record tertinggi rounds survived
- **Games Played**: Total games dimainkan
- **Leaderboard**: Ranking global berdasarkan best streak

## Architecture

### Backend (Motoko)
```
src/russian_roulette_backend/main.mo
├── Types (GameState, PlayerStats, Game)
├── State Management (HashMap untuk players & games)
├── Game Logic (startNewGame, spinChamber, pullTrigger)
├── Statistics (updatePlayerStats, getLeaderboard)
└── Authentication (Internet Identity integration)
```

### Frontend (JavaScript)
```
src/russian_roulette_frontend/assets/
├── index.html (Game UI structure)
├── style.css (Dark theme styling)
├── main.js (ICP integration & game logic)
└── webpack.config.js (Build configuration)
```

## Security Features

- **Internet Identity**: Secure authentication tanpa password
- **Principal-based Access**: Setiap player diidentifikasi dengan Principal ID
- **Immutable Game State**: Game state tersimpan di blockchain
- **No Cheating**: Random number generation di backend
- **Transparent Logic**: Open source Motoko code

## Performance

- **Fast Queries**: Read operations menggunakan query calls
- **Efficient Updates**: Minimal state changes untuk gas optimization
- **Caching**: Frontend caching untuk better UX
- **Responsive**: Sub-second response times

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Push to branch
5. Create Pull Request

## License

MIT License - see LICENSE file for details.

## Support

Untuk pertanyaan atau issues, silakan buat GitHub issue atau hubungi developer.