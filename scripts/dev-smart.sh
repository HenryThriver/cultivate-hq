#!/bin/bash

# Smart dev server management script

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🔍 Checking current dev server status...${NC}"

# Check for existing Next.js processes
EXISTING_NEXTJS=$(ps aux | grep "next dev" | grep -v grep)
if [ ! -z "$EXISTING_NEXTJS" ]; then
    echo -e "${YELLOW}⚠️  Found existing Next.js dev servers:${NC}"
    echo "$EXISTING_NEXTJS"
    echo ""
fi

# Check ports 3000-3003
echo -e "${GREEN}🔌 Checking ports 3000-3003:${NC}"
for port in 3000 3001 3002 3003; do
    if lsof -i :$port &> /dev/null; then
        PROCESS_INFO=$(lsof -i :$port | grep LISTEN | head -1)
        echo -e "${RED}Port $port: OCCUPIED${NC} - $PROCESS_INFO"
    else
        echo -e "${GREEN}Port $port: AVAILABLE${NC}"
    fi
done

echo ""
echo "What would you like to do?"
echo "1) Kill all Next.js processes and start fresh"
echo "2) Start dev server on next available port"
echo "3) Show process details for manual cleanup"
echo "4) Exit"

read -p "Choose option (1-4): " choice

case $choice in
    1)
        echo -e "${YELLOW}🧹 Killing all Next.js processes...${NC}"
        pkill -f "next dev" || echo "No Next.js processes found"
        pkill -f "npm run dev" || echo "No npm dev processes found"
        sleep 2
        echo -e "${GREEN}🚀 Starting fresh dev server...${NC}"
        npm run dev
        ;;
    2)
        echo -e "${GREEN}🚀 Starting dev server on next available port...${NC}"
        npm run dev
        ;;
    3)
        echo -e "${YELLOW}📋 Detailed process information:${NC}"
        ps aux | grep -E "next dev|npm run dev" | grep -v grep
        echo ""
        echo "To kill a specific process, use: kill <PID>"
        echo "To kill all Next.js processes: pkill -f 'next dev'"
        ;;
    4)
        echo -e "${GREEN}👋 Exiting...${NC}"
        exit 0
        ;;
    *)
        echo -e "${RED}❌ Invalid option${NC}"
        exit 1
        ;;
esac