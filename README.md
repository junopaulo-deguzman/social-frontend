# Threadly frontend

Threadly is a Reddit-style social frontend built with React, Next-compatible routing, and Vinext. It currently runs as a complete interactive prototype with local mock data: feed sorting, searching, upvotes, downvotes, saved posts, profiles, sharing, and post creation all work in the browser.

## Run in WSL

Install Node.js 22.13 or newer inside WSL, then run:

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Go backend boundary

Keep the backend as a separate sibling project rather than mixing Go into this React repository:

```text
/home/juno/
  social-frontend/   # this project
  social-backend/    # Go API
```

Copy `.env.example` to `.env.local` when the API is ready. All frontend requests are centralized in `lib/api.ts`, with an initial contract for feed, posts, voting, saving, and profiles. The UI deliberately uses mock data until those endpoints exist.

Recommended first Go endpoints:

```text
GET    /v1/feed?sort=hot|new|top
POST   /v1/posts
PUT    /v1/posts/:id/vote
PUT    /v1/posts/:id/saved
DELETE /v1/posts/:id/saved
GET    /v1/users/:username
```

For local development, allow CORS from `http://localhost:3000`. For AWS practice, a sensible progression is React hosting first, then a Go service behind API Gateway or an Application Load Balancer, with DynamoDB or RDS added after the API works locally.

## Checks

```bash
npm run build
npm run lint
```
