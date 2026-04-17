#!/bin/bash
# Development setup script for Finance Manager

echo "🚀 Installing dependencies..."
pnpm install

echo "📦 Generating Prisma client..."
pnpm db:generate

echo "🗄️  Setting up database..."
# Create .env.local if it doesn't exist
if [ ! -f .env.local ]; then
  cp .env.example .env.local
  echo "⚠️  Created .env.local - Please update DATABASE_URL and other secrets"
fi

echo "✅ Setup complete!"
echo ""
echo "Next steps:"
echo "1. Update .env.local with your DATABASE_URL and other secrets"
echo "2. Run 'pnpm db:migrate' to create database tables"
echo "3. Run 'pnpm dev' to start development servers"
