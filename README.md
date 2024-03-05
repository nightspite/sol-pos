# Solana Point of Sale 
## Requirements
- node 18.18.2
- pnpm 8.9.2
- Docker

## Installation
```bash
pnpm install

docker-compose up -d # start the database in Docker

pnpm db:push
pnpm db:seed
```

## Development
```bash
pnpm dev
```

## Production
```bash
pnpm build
pnpm start
```