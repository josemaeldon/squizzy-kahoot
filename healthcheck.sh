#!/bin/sh
# Health check script for Docker container
PORT=${PORT:-80}
wget --no-verbose --tries=1 --spider http://localhost:${PORT}/api/ping || exit 1
