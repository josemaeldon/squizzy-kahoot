# Testing Guide

This guide helps you test the Squizzy application locally.

## Prerequisites

- Docker and Docker Compose installed
- Docker Swarm initialized (run `docker swarm init` if not already done)

## Quick Test

### 1. Start the Services

```bash
# Set database password
export POSTGRES_PASSWORD=test123

# Deploy stack
docker stack deploy -c docker-compose.yml squizzy
```

### 2. Wait for Services to Start

```bash
# Check service status
docker stack services squizzy

# Should show both services as 1/1 or 2/2 replicas
```

### 3. Test the Application

#### Health Check
```bash
curl http://localhost:3000/api/ping
# Expected: "pong"
```

#### Access Web Interface
Open browser: http://localhost:3000

## Cleanup

```bash
docker stack rm squizzy
```
