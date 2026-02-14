# Docker Swarm Deployment Guide

This guide explains how to deploy Squizzy using Docker Swarm.

## Prerequisites

- Docker Swarm initialized (`docker swarm init`)
- Sanity.io project configured (see main README.md)
- SQUIZZY_WRITE_TOKEN from Sanity.io project

## Environment Setup

1. Create a `.env` file with your Sanity.io write token:
```bash
SQUIZZY_WRITE_TOKEN=your-sanity-write-token-here
```

2. Create a Docker Swarm secret for the token:
```bash
echo "your-sanity-write-token-here" | docker secret create squizzy_write_token -
```

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
```

### Option 2: Manual Deployment

1. Create the overlay network:
```bash
docker network create --driver overlay squizzy-network
```

2. Deploy the service:
```bash
docker service create \
  --name squizzy \
  --replicas 2 \
  --network squizzy-network \
  --publish 3000:3000 \
  --env NODE_ENV=production \
  --env PORT=3000 \
  --secret squizzy_write_token \
  --constraint 'node.role==worker' \
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

### Sanity Configuration

Update the `sanityClientConfig.js` file with your project ID and dataset:

```javascript
export const sanityClientConfig = {
  projectId: 'your-project-id',
  dataset: 'production',
  useCdn: false
}
```

### Environment Variables

- `NODE_ENV`: Set to `production` for production deployments
- `PORT`: Port the application listens on (default: 3000)
- `SQUIZZY_WRITE_TOKEN`: Sanity.io write token (required)

## Troubleshooting

### Container won't start
- Check logs: `docker service logs squizzy_squizzy`
- Verify the write token is correct
- Ensure the Sanity.io project is properly configured

### Can't connect to API
- Verify the service is running: `docker service ls`
- Check network connectivity: `docker network inspect squizzy-network`
- Ensure port 3000 is accessible

### Build fails
- Check that all dependencies are installed
- Verify Node.js version (requires 12.x)
- Review build logs in GitHub Actions

## Production Considerations

1. **Load Balancing**: Docker Swarm automatically load balances across replicas
2. **High Availability**: Deploy on multiple nodes for redundancy
3. **SSL/TLS**: Use a reverse proxy (nginx, Traefik) for HTTPS
4. **Monitoring**: Set up monitoring with Prometheus/Grafana
5. **Backups**: Sanity.io handles data backups, but export your content regularly

## Notes

- This application uses Sanity.io as its backend/CMS
- PostgreSQL is not used in this architecture (Sanity.io is the data store)
- The application is stateless and can be scaled horizontally
- Session data is stored in Sanity.io, not in local memory
