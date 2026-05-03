# DinoGaia Subgraph

## Subgraph
The DinoGaia subgraph makes it effortless for explorers, analytics dashboards, and companion dapps to consume every minted creature without replaying logs. Instead of probing contracts or rewriting indexing logic per client, this service materializes the `DinoFactory:DinoCreated` events into a typed PostgreSQL-backed catalog with GraphQL and SQL endpoints. It keeps the on-chain genesis, status, and stats for every Dino in sync with the factory, so downstream teams can move fast on trusted insights.

## Features
- 🚀 **Event-first capture** — Ponder handles `DinoFactory:DinoCreated`, pulls the full Dino snapshot, and persists it as a single canonical record.
- 🎯 **Typed schema** — The generated schema mirrors the on-chain `Dino` struct, including genesis metadata plus status, progress, and stats fields.
- 🧠 **Dual API surface** — Query dinos via GraphQL or SQL through the built-in Hono-powered API server.
- 💎 **Ready for composability** — Clients can reuse the schema to build dashboards, leaderboards, or analytics without additional indexing logic.

## Tech stack
- **Ponder** for event handling, schema generation, and db wiring.
- **Hono + ponder:api** to serve GraphQL and direct SQL endpoints.
- **Viem** for type-safe contract reads inside webhook handlers.
- **Typescript + pnpm** for a fast, modern dev experience.

## Installation
```bash
cd server/subgraph
pnpm install
pnpm codegen      # regenerate the schema after ABI changes
pnpm dev          # run the Ponder dev server (default port 8000)
```

## Usage example
Start the dev server and send a GraphQL query against `http://localhost:8000/graphql`:
```graphql
query GetDino($dinoId: BigInt!) {
  dino(where: { dinoId: $dinoId }) {
    name
    owner
    level
    weight
    health
  }
}
```
Variables:
```json
{
  "dinoId": "1"
}
```

## Roadmap
- [x] Wire DinoFactory event to a Ponder onchain table
- [ ] Capture hatching and upgrade events for richer timelines
- [ ] Add persisted views for leaderboard and rarity analytics
- [ ] Publish a hosted GraphQL playground with caching hints

## Contribution & Community
We welcome feedback and improvements from the community. Please:
1. Open an issue if you spot gaps or bugs in the event handling or schema.
2. Submit a PR against `server/subgraph` with clean commits and descriptive test steps.