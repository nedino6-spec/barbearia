#!/bin/sh

# Push any pending migrations and ensure DB is ready
npx prisma db push

# Start the WhatsApp bot in the background
npm run bot &

# Start the Next.js server in the foreground
npm run start
