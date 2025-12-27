#!/bin/bash
set -e

# TwentyCRM Installation Script
# Run on Lightsail VM: sudo bash install.sh

echo "=================================="
echo "TwentyCRM Installation Script"
echo "=================================="
echo ""

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [[ $EUID -ne 0 ]]; then
   echo -e "${RED}This script must be run as root (use sudo)${NC}"
   exit 1
fi

echo -e "${GREEN}Step 1: Create PostgreSQL Schema${NC}"
echo "Creating 'twenty' schema in 'chronos' database..."
sudo -u postgres psql -d chronos -f setup-database.sql
echo -e "${GREEN}✓ Database schema created${NC}"
echo ""

echo -e "${GREEN}Step 2: Generate Security Secrets & Configure Docker${NC}"
echo "Generating random secrets..."
ACCESS_SECRET=$(openssl rand -base64 32)
REFRESH_SECRET=$(openssl rand -base64 32)
LOGIN_SECRET=$(openssl rand -base64 32)
FILE_SECRET=$(openssl rand -base64 32)

mkdir -p /opt/twenty
cp docker-compose.yml /opt/twenty/docker-compose.yml

# Replace placeholders with generated secrets
sed -i "s|__GENERATED_ACCESS_SECRET__|$ACCESS_SECRET|g" /opt/twenty/docker-compose.yml
sed -i "s|__GENERATED_REFRESH_SECRET__|$REFRESH_SECRET|g" /opt/twenty/docker-compose.yml
sed -i "s|__GENERATED_LOGIN_SECRET__|$LOGIN_SECRET|g" /opt/twenty/docker-compose.yml
sed -i "s|__GENERATED_FILE_SECRET__|$FILE_SECRET|g" /opt/twenty/docker-compose.yml

echo -e "${GREEN}✓ Docker Compose configured with generated secrets${NC}"
echo ""

echo -e "${GREEN}Step 3: Configure Nginx${NC}"
cp nginx-twenty.conf /etc/nginx/sites-available/twenty
ln -sf /etc/nginx/sites-available/twenty /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
echo -e "${GREEN}✓ Nginx configured${NC}"
echo ""

echo -e "${YELLOW}Step 4: Add Cloudflare DNS Record${NC}"
echo "Please add this DNS record in Cloudflare:"
echo "  Type: A"
echo "  Name: crm"
echo "  Content: $(curl -s ifconfig.me)"
echo "  Proxy: Enabled (orange cloud)"
echo ""
read -p "Press Enter once DNS record is added..."
echo ""

echo -e "${GREEN}Step 5: Obtain SSL Certificate${NC}"
certbot --nginx -d crm.automatonicai.com --non-interactive --agree-tos --email geoff@automatonicai.com
echo -e "${GREEN}✓ SSL certificate obtained${NC}"
echo ""

echo -e "${GREEN}Step 6: Start TwentyCRM Service${NC}"
cd /opt/twenty
docker-compose up -d
echo "Waiting for TwentyCRM to initialize (30 seconds)..."
sleep 30
docker logs twenty --tail 20
echo -e "${GREEN}✓ TwentyCRM started${NC}"
echo ""

echo "=================================="
echo -e "${GREEN}Installation Complete!${NC}"
echo "=================================="
echo ""
echo "Access TwentyCRM at: https://crm.automatonicai.com"
echo ""
echo "Next steps:"
echo "1. Visit https://crm.automatonicai.com"
echo "2. Create admin account (geoff@automatonicai.com)"
echo "3. Set up workspace (Automatonic AI)"
echo ""
echo "Logs: docker logs -f twenty"
echo "Status: docker ps | grep twenty"
echo ""
