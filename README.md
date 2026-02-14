# Squizzy: A Kahoot-style real-time quiz game

![Squizzy logo](https://repository-images.githubusercontent.com/222647703/1c3ab900-1fdf-11ea-924e-10ed07035d95)

Squizzy is a real-time quiz game with self-hosted PostgreSQL backend.

- Real-time web app built with [Vue][vue], optimized for mobile
- Self-hosted with Docker Swarm
- PostgreSQL database backend
- Easy deployment with Docker

## Features

- 🎮 Real-time multiplayer quiz game
- 🐘 Self-hosted PostgreSQL database
- 🐳 Docker Swarm ready
- 📱 Mobile-optimized interface
- 🔄 Automatic scaling and load balancing
- 💾 Built-in backup and restore
- 🚀 Auto-installer for easy first-time setup

## Quick Start

### Deploy with Docker Swarm

1. Clone the repository:
```bash
git clone https://github.com/josemaeldon/squizzy-kahoot.git
cd squizzy-kahoot
```

2. Set your database password:
```bash
export POSTGRES_PASSWORD=your-secure-password
```

3. Deploy the stack:
```bash
docker stack deploy -c docker-compose.yml squizzy
```

4. Access the application:
```
http://localhost:3000
```

5. Complete the setup wizard:
   - On first access, you'll be redirected to the setup page
   - Enter an admin username and password
   - Choose whether to load sample quiz data
   - Click "Complete Setup"

For detailed deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

## Architecture

- **Frontend**: Vue.js single-page application
- **Backend**: Node.js with Express
- **Database**: PostgreSQL 13
- **Deployment**: Docker Swarm with automatic scaling

## Database Schema

The application includes:
- **Quizzes**: Quiz metadata and configuration
- **Questions**: Quiz questions with time limits and points
- **Choices**: Multiple choice answers
- **Matches**: Game sessions
- **Players**: Player information
- **Answers**: Player responses and scoring

Sample data is automatically loaded on first startup if you choose to load it during the setup wizard.

## API Endpoints

- `GET /api/ping` - Health check
- `POST /api/sign-up-player` - Register player for a match
- `POST /api/submit-answer` - Submit answer to a question
- `POST /api/withdraw-player` - Remove player from match

## Local Development

### Prerequisites
- Node.js 12.x
- PostgreSQL 13+
- Docker (optional)

### Setup

1. Install dependencies:
```bash
npm install
```

2. Set up PostgreSQL database:
```bash
createdb squizzy
```

3. Configure environment:
```bash
cp .env.docker.example .env
# Edit .env with your database credentials
```

4. Start development server:
```bash
npm run dev
```

5. Open your browser and navigate to http://localhost:8080 (or the port shown in terminal)

6. Complete the setup wizard:
   - Enter an admin username and password
   - Choose whether to load sample quiz data
   - Click "Complete Setup"

### Build for Production

```bash
npm run build
npm start
```

## Configuration

Environment variables:

- `POSTGRES_HOST` - Database host (default: postgres)
- `POSTGRES_PORT` - Database port (default: 5432)
- `POSTGRES_DB` - Database name (default: squizzy)
- `POSTGRES_USER` - Database user (default: squizzy)
- `POSTGRES_PASSWORD` - Database password (required)
- `PORT` - Application port (default: 3000)
- `NODE_ENV` - Environment (development/production)

## GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and pushes Docker images to GitHub Container Registry (ghcr.io) on every push to main/master branch.

To use the published image:
```bash
docker pull ghcr.io/josemaeldon/squizzy-kahoot:latest
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

[vue]: https://vuejs.org
