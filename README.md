# Browser Games Collection

A collection of browser-based games built with Next.js and TypeScript, designed for deployment on Kubernetes.

## Features

- **Next.js Static Export**: Fully static site generation for optimal performance
- **TypeScript**: Type-safe game logic
- **Kubernetes-Ready**: Multi-stage Docker build with nginx serving
- **Monorepo Structure**: Single node_modules, unified build system
- **Zero Server-Side Processing**: Pure client-side games

## Games

- **魔界ランナー (Makai Runner)**: Side-scrolling action game
- **神経衰弱 (Memory Game)**: Card matching memory game
- **テトリス (Tetris)**: Classic puzzle game

## Quick Start

### Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Production Build

```bash
# Build for production (static export)
npm run build

# Output directory: ./out
```

### Docker Build

```bash
# Build Docker image
docker build -t browser-games:latest .

# Run container
docker run -p 8080:80 browser-games:latest

# Access at http://localhost:8080
```

## Kubernetes Deployment

### Prerequisites

- Kubernetes cluster
- kubectl configured
- Docker image pushed to registry (optional)

### Deploy

```bash
# Apply all manifests
kubectl apply -f k8s/

# Or individually
kubectl apply -f k8s/deployment.yaml
kubectl apply -f k8s/service.yaml
kubectl apply -f k8s/ingress.yaml  # Optional
```

### Check Status

```bash
# Check deployment
kubectl get deployments
kubectl get pods

# Check service
kubectl get services

# Get service URL (for LoadBalancer)
kubectl get service browser-games
```

## Project Structure

```
browser_games/
├── app/                          # Next.js App Router
│   ├── layout.tsx               # Root layout
│   ├── page.tsx                 # Home page (game list)
│   ├── makai-runner/
│   │   ├── page.tsx            # Makai Runner page component
│   │   └── game/               # Game logic (TypeScript)
│   └── tetris/
│       └── page.tsx            # Tetris page component
├── public/                      # Static assets
│   ├── makai-runner/assets/    # Makai Runner sprites
│   └── tetris/                 # Tetris assets
├── k8s/                         # Kubernetes manifests
│   ├── deployment.yaml         # Pod deployment
│   ├── service.yaml            # Service (LoadBalancer)
│   └── ingress.yaml            # Ingress (optional)
├── package.json                # Unified dependencies
├── next.config.js              # Next.js static export config
├── tsconfig.json               # TypeScript config
└── Dockerfile                  # Multi-stage build

# Standalone game directories
makai_runner/                   # Standalone TypeScript game
memory_game/                    # Standalone TypeScript game
tetris/                         # Original source
```

## Technologies

- **Framework**: Next.js 14 (App Router, Static Export)
- **Language**: TypeScript
- **Runtime**: Node.js
- **Container**: Docker (multi-stage build)
- **Web Server**: nginx (alpine)
- **Orchestration**: Kubernetes

## Build Details

### Dockerfile

- **Stage 1**: Node.js builder - installs deps, builds Next.js
- **Stage 2**: nginx alpine - serves static files from `./out`
- **Final Image Size**: ~20-30MB

### Next.js Configuration

- `output: 'export'`: Generates static HTML/JS
- `distDir: 'out'`: Output directory
- `images.unoptimized: true`: No image optimization for static export

## Adding New Games

1. Create new directory: `app/your-game/`
2. Add page component: `app/your-game/page.tsx`
3. Add game logic: `app/your-game/game/`
4. Add assets: `public/your-game/`
5. Update home page: Add link in `app/page.tsx`
6. Build and deploy

## Performance

- **First Load JS**: ~87-99 kB
- **Static Generation**: All pages pre-rendered
- **CDN-Friendly**: Fully cacheable assets
- **Scalable**: Stateless containers

## License

MIT
