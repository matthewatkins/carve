# create-carve-app

The CLI for Carve, a modern TypeScript stack with microservices architecture, combining Nuxt, Elysia, ORPC, Better Auth, and more.

## Quick Start

### Create a New Project

```bash
# Create a new Carve project with bun, pnpm, or npm
bun create carve-app@latest

# Or with a specific name
bun create carve-app@latest my-carve-project
```

The CLI will:
- Download the Carve template
- Rename all references from "carve" to your project name
- Create environment files
- Set up database (optional)
- Initialize git repository (optional)
- Provide clear next steps


- `bun dev` - Start all services
- `bun run dev:web` - Start web app only
- `bun run dev:auth` - Start auth server only
- `bun run dev:api` - Start API server only
- `bun run db:push:auth` - Push auth schema
- `bun run db:push:api` - Push API schema
- `bun run db:studio:auth` - Open auth database studio
- `bun run db:studio:api` - Open API database studio

## License

This project is free to use, clone, and share for non-commercial purposes.
You may not sell, modify, or use the source code for commercial projects.
See [LICENSE.txt](./LICENSE.txt) for details.
