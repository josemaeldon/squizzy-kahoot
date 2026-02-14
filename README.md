# Squizzy: A Kahoot-style real-time quiz game

![Squizzy logo](https://repository-images.githubusercontent.com/222647703/1c3ab900-1fdf-11ea-924e-10ed07035d95)

Squizzy is a real-time quiz game with self-hosted PostgreSQL backend.

- Real-time web app built with [Vue][vue], optimized for mobile
- Self-hosted with Docker Swarm
- PostgreSQL database backend
- Easy deployment with Docker
- **Full admin interface - No SQL knowledge required!**

## Features

- 🎮 Real-time multiplayer quiz game
- 🔐 Admin authentication system
- 📝 Complete quiz and question management through UI
- 📱 QR code generation for easy match access
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

6. Login to admin panel:
   - Navigate to `/login`
   - Enter your admin credentials
   - Start creating quizzes!

For detailed deployment instructions, see [DOCKER_DEPLOYMENT.md](DOCKER_DEPLOYMENT.md).

## Complete Workflow (No SQL Required!)

### 1. Initial Setup
- On first access, complete the setup wizard at `/setup`
- Create an admin username and password
- Optionally load sample quiz data
- Click "Complete Setup"

### 2. Login to Admin Panel
- Navigate to `/login`
- Enter your admin credentials created during setup
- You'll be redirected to the admin dashboard

### 3. Create a Quiz
1. Go to the **Quizzes** tab
2. Click **"+ Criar Novo Quiz"**
3. Enter a title and description
4. Click **"Salvar"**

### 4. Add Questions to Quiz
1. Find your quiz in the list
2. Click **"📝 Perguntas"** button
3. Click **"+ Adicionar Pergunta"**
4. Enter:
   - Question text
   - Time limit (seconds)
   - Points value
   - 2-6 multiple choice answers
   - Mark at least one answer as correct
5. Click **"Salvar Pergunta"**
6. Repeat to add more questions

### 5. Create a Match (Game Session)
1. Go to the **Partidas** tab
2. Click **"+ Criar Nova Partida"**
3. Select the quiz you want to use
4. Enter a unique slug (URL-friendly name)
5. Click **"Salvar"**

### 6. Share the Match
1. Click **"📱 QR Code"** to display a QR code
2. Players scan the QR code with their phones
3. Or click **"Copiar Link"** to share the URL directly
4. Players join at: `http://your-server/match/your-slug`

### 7. Manage Your Content
- **Edit Quiz**: Click "Editar" on any quiz to modify title/description
- **Edit Questions**: Click "📝 Perguntas" then "Editar" on any question
- **Delete Content**: Click "Excluir" (with confirmation)
- **Logout**: Click "Sair" in the top right

## Architecture

- **Frontend**: Vue.js single-page application
- **Backend**: Node.js with Express
- **Database**: PostgreSQL 13
- **Deployment**: Docker Swarm with automatic scaling

## Database Schema

The application includes:
- **Admins**: Admin user credentials (bcrypt hashed)
- **Quizzes**: Quiz metadata and configuration
- **Questions**: Quiz questions with time limits and points
- **Choices**: Multiple choice answers
- **Matches**: Game sessions
- **Players**: Player information
- **Answers**: Player responses and scoring

## API Endpoints

### Public Endpoints
- `GET /api/ping` - Health check
- `GET /api/setup-status` - Check if setup is complete
- `POST /api/setup` - Complete initial setup
- `POST /api/sign-up-player` - Register player for a match
- `POST /api/submit-answer` - Submit answer to a question
- `POST /api/withdraw-player` - Remove player from match
- `GET /api/get-match-details` - Get match details

### Admin Endpoints (Authentication Required)
- `POST /api/admin/login` - Admin login
- `POST /api/admin/logout` - Admin logout
- `GET /api/admin/auth-status` - Check authentication status
- `GET /api/admin/quizzes` - List all quizzes
- `POST /api/admin/quizzes` - Create a new quiz
- `PUT /api/admin/quizzes` - Update a quiz
- `DELETE /api/admin/quizzes` - Delete a quiz
- `GET /api/admin/questions?quizId=<id>` - Get questions for a quiz
- `POST /api/admin/questions` - Create a new question
- `PUT /api/admin/questions` - Update a question
- `DELETE /api/admin/questions` - Delete a question
- `GET /api/admin/matches` - List all matches
- `POST /api/admin/matches` - Create a new match
- `PUT /api/admin/matches` - Update a match
- `DELETE /api/admin/matches` - Delete a match

## Local Development

### Prerequisites
- Node.js 12.x or higher
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

## Security Features

- Admin authentication with bcrypt password hashing
- Session-based authentication with HttpOnly cookies
- Rate limiting on API endpoints
- SQL injection protection via parameterized queries
- CORS protection

## GitHub Actions

The project includes a GitHub Actions workflow that automatically builds and pushes Docker images to GitHub Container Registry (ghcr.io) on every push to main/master branch.

To use the published image:
```bash
docker pull ghcr.io/josemaeldon/squizzy-kahoot:latest
```

## Troubleshooting

### Can't access admin panel
- Make sure you completed the setup wizard first
- Go to `/login` and enter your admin credentials
- If you forgot your password, you'll need to reset it in the database

### Questions not showing up
- Make sure you added questions to your quiz via the admin panel
- Check that each question has at least one correct answer
- Verify the quiz ID matches the questions in the database

### Match not found
- Verify the match was created in the admin panel
- Check that the slug matches exactly (case-sensitive)
- Ensure the quiz associated with the match has questions

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## License

MIT License - see LICENSE file for details.

[vue]: https://vuejs.org
