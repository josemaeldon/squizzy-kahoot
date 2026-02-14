#!/bin/sh
# Health check script for Docker container
wget --no-verbose --tries=1 --spider http://localhost:3000/api/ping || exit 1
