# Docker Swarm Deployment Guide

This guide explains how to deploy Squizzy using Docker Swarm with self-hosted PostgreSQL.

## Prerequisites

- Docker Swarm initialized (`docker swarm init`)
- PostgreSQL database (included in docker-compose.yml)

## Environment Setup

1. Create a `.env` file with your database configuration:
```bash
POSTGRES_PASSWORD=your-secure-password-here
```

Note: The database schema and initial data will be configured through the web-based setup wizard on first access.

## Deploy to Docker Swarm

### Option 1: Using Docker Compose (Recommended)

1. Pull the latest image:
```bash
docker pull ghcr.io/josemaeldon/squizzy-kahoot:latest
```

2. Deploy the stack:
```bash
docker stack deploy -c docker-compose.yml squizzy
```

3. Check the status:
```bash
docker stack services squizzy
docker service logs squizzy_squizzy
docker service logs squizzy_postgres
```

4. Access the application at http://localhost:3000 and complete the setup wizard:
   - Enter an admin username and password
   - Choose whether to load sample quiz data
   - Click "Complete Setup"

### Option 2: Manual Deployment

1. Create the overlay network:
```bash
docker network create --driver overlay squizzy-network
```

2. Deploy PostgreSQL:
```bash
docker service create \
  --name postgres \
  --network squizzy-network \
  --env POSTGRES_DB=squizzy \
  --env POSTGRES_USER=squizzy \
  --env POSTGRES_PASSWORD=your-password \
  --mount type=volume,source=postgres_data,target=/var/lib/postgresql/data \
  postgres:13-alpine
```

3. Deploy the application:
```bash
docker service create \
  --name squizzy \
  --replicas 2 \
  --network squizzy-network \
  --publish 3000:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --env POSTGRES_HOST=postgres \
  --env POSTGRES_PORT=5432 \
  --env POSTGRES_DB=squizzy \
  --env POSTGRES_USER=squizzy \
  --env POSTGRES_PASSWORD=your-password \
  ghcr.io/josemaeldon/squizzy-kahoot:latest
```

## Update Deployment

To update to a new version:

```bash
docker service update --image ghcr.io/josemaeldon/squizzy-kahoot:latest squizzy_squizzy
```

## Scaling

Scale the number of replicas:

```bash
docker service scale squizzy_squizzy=5
```

## Health Check

The application includes a health check endpoint at `/api/ping`. Docker will automatically restart unhealthy containers.

Test manually:
```bash
curl http://localhost:3000/api/ping
```

## Monitoring

View logs:
```bash
docker service logs -f squizzy_squizzy
```

View service details:
```bash
docker service ps squizzy_squizzy
```

## Rollback

If something goes wrong:
```bash
docker service rollback squizzy_squizzy
```

## Remove Deployment

```bash
docker stack rm squizzy
# or
docker service rm squizzy_squizzy
```

## Configuration

### Database Configuration

The application uses PostgreSQL as its database. Configuration is done via environment variables:

- `POSTGRES_HOST`: PostgreSQL host (default: postgres)
- `POSTGRES_PORT`: PostgreSQL port (default: 5432)
- `POSTGRES_DB`: Database name (default: squizzy)
- `POSTGRES_USER`: Database user (default: squizzy)
- `POSTGRES_PASSWORD`: Database password (required)

### Initial Data

The database schema is initialized through the web-based setup wizard on first access. You can choose to load sample quiz data during the setup process.

To add your own quizzes, you can:
1. Connect to the PostgreSQL database
2. Insert data using SQL
3. Or create a web interface for quiz management (future enhancement)

## Troubleshooting

### Container won't start
- Check logs: `docker service logs squizzy_squizzy`
- Verify database connection is working
- Ensure PostgreSQL service is healthy: `docker service ps squizzy_postgres`

### Can't connect to API
- Verify the service is running: `docker service ls`
- Check network connectivity: `docker network inspect squizzy-network`
- Ensure port 3000 is accessible

### Database connection errors
- Check PostgreSQL is running: `docker service ps squizzy_postgres`
- Verify environment variables are correct
- Check PostgreSQL logs: `docker service logs squizzy_postgres`

### Build fails
- Check that all dependencies are installed
- Verify Node.js version (requires 12.x)
- Review build logs in GitHub Actions

## Production Considerations

1. **Load Balancing**: Docker Swarm automatically load balances across replicas
2. **High Availability**: Deploy on multiple nodes for redundancy
3. **SSL/TLS**: Use a reverse proxy (nginx, Traefik) for HTTPS
4. **Monitoring**: Set up monitoring with Prometheus/Grafana
5. **Backups**: Regularly backup PostgreSQL data volume
6. **Database Performance**: Consider connection pooling and query optimization
7. **Security**: Use strong passwords and secure network policies

## Database Backup and Restore

### Backup
```bash
docker exec $(docker ps -q -f name=squizzy_postgres) pg_dump -U squizzy squizzy > backup.sql
```

### Restore
```bash
cat backup.sql | docker exec -i $(docker ps -q -f name=squizzy_postgres) psql -U squizzy squizzy
```

## Notes

- This application uses PostgreSQL as its database (self-hosted)
- The application is stateless and can be scaled horizontally
- All data is stored in PostgreSQL database
- Database schema is automatically initialized on first startup
