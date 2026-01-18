# Keel 🚢

A daily warship guessing game for naval history enthusiasts. Think Wordle, but for identifying famous warships through their silhouettes and clues.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![React](https://img.shields.io/badge/React-19-61dafb.svg)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-3178c6.svg)
![Vite](https://img.shields.io/badge/Vite-7-646cff.svg)

## 🎮 How to Play

1. **Start with a Silhouette** - Each day presents a new mystery warship shown only as a silhouette
2. **Make Your Guess** - Search and select from a database of historical warships
3. **Receive Clues** - Each wrong guess reveals more information:
   - **Turn 1**: Ship silhouette only
   - **Turn 2**: Ship specifications (class, length, displacement, commission date)
   - **Turn 3**: Context clues (nation, conflicts, status)
   - **Turn 4**: Trivia fact
   - **Turn 5**: Photo reveal
4. **Win or Learn** - Identify the ship within 5 guesses, or discover what ship it was!

## ✨ Features

- 🎯 **Daily Challenge** - New ship every day, same for all players
- 🔍 **Smart Search** - Fuzzy search through warship database
- 📊 **Progressive Clues** - Balanced difficulty with escalating hints
- 🎉 **Share Results** - Copy your score to share with friends (spoiler-free!)
- 📱 **Responsive Design** - Play on desktop or mobile
- ⚡ **Fast & Lightweight** - Static site, no backend required

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite 7
- **Styling**: TailwindCSS 4 + Custom CSS
- **UI Components**: Radix UI primitives
- **Search**: Fuse.js for fuzzy matching
- **Testing**: Vitest + React Testing Library

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/keel.git
cd keel

# Install dependencies
npm install

# Start development server
npm run dev
```

The app will be available at `http://localhost:5173`

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run test         # Run tests
npm run test:watch   # Run tests in watch mode
npm run lint         # Lint code
npm run lint:fix     # Fix linting issues
npm run format       # Format code with Prettier
npm run typecheck    # TypeScript type checking
```

## 📁 Project Structure

```
keel/
├── public/
│   ├── game-data.json     # Current day's game data
│   └── ship-list.json     # Searchable ship database
├── src/
│   ├── components/
│   │   ├── Clues/         # Clue display components
│   │   ├── Game/          # Game layout
│   │   ├── GuessHistory/  # Guess tracking
│   │   ├── ShipSearch/    # Search interface
│   │   ├── Silhouette/    # Ship silhouette display
│   │   ├── TurnIndicator/ # Turn progress
│   │   ├── WinModal/      # Win screen & sharing
│   │   └── ui/            # Reusable UI components
│   ├── hooks/             # Custom React hooks
│   ├── styles/            # Global styles & animations
│   └── App.tsx            # Main application
├── scripts/
│   ├── data-pipeline/     # Ship data fetching from Wikidata
│   ├── game-generator/    # Daily puzzle generation
│   └── silhouette-poc/    # Silhouette generation tools
└── package.json
```

## 🎨 Game Data Format

The game loads data from `public/game-data.json`:

```json
{
  "date": "2024-01-18",
  "ship": {
    "id": "Q12345",
    "name": "HMS Example",
    "aliases": ["Example-class destroyer"]
  },
  "silhouette": "data:image/png;base64,...",
  "clues": {
    "specs": {
      "class": "Example-class",
      "displacement": "5000t",
      "length": "150m",
      "commissioned": "1942"
    },
    "context": {
      "nation": "United Kingdom",
      "conflicts": ["World War II"],
      "status": "Sunk 1944"
    },
    "trivia": "An interesting fact about this ship...",
    "photo": "https://example.com/photo.jpg"
  }
}
```

## 🔧 Data Pipeline

The project includes scripts to source ship data:

- **data-pipeline**: Fetches ship metadata from Wikidata via SPARQL
- **game-generator**: Creates daily puzzles with clues and silhouettes
- **silhouette-poc**: Generates ship silhouettes from photos

See each script's directory for specific setup instructions.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Ship data sourced from [Wikidata](https://www.wikidata.org/)
- Ship photos from [Wikimedia Commons](https://commons.wikimedia.org/)
- Inspired by [Wordle](https://www.nytimes.com/games/wordle/index.html)

---

**Play today's challenge!** 🚢
