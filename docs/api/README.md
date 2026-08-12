# Fikrie Portfolio API Documentation

API reference and importable collections for all REST endpoints.

## Files

| File | Description |
|------|-------------|
| [openapi.yaml](./openapi.yaml) | OpenAPI 3.0 specification |
| [fikrie-portfolio.postman_collection.json](./fikrie-portfolio.postman_collection.json) | Postman Collection v2.1 |

## Quick start

### Postman

1. Open Postman → **Import** → select `fikrie-portfolio.postman_collection.json`
2. Set the collection variable `baseUrl` (default: `http://localhost:3000`)
3. Log in at `/login` in your browser
4. Copy the `portfolio_session=authenticated` cookie into Postman's cookie jar for `localhost`
5. Run authenticated requests

### OpenAPI / Swagger

Import `openapi.yaml` into any OpenAPI-compatible tool:

- [Swagger Editor](https://editor.swagger.io/)
- [Stoplight](https://stoplight.io/)
- VS Code extension: **OpenAPI (Swagger) Editor**

## Authentication

| Cookie | Value |
|--------|-------|
| `portfolio_session` | `authenticated` |

Login is handled by **Server Actions** at `/login` (not a REST endpoint):

- `loginAction` — sign in
- `registerAction` — create account
- `logoutAction` — sign out

Default dev credentials: username `fafiff`, password `password`

## Endpoint summary (28 endpoints)

### Public (no auth)

- `POST /api/auth/recover`
- `POST /api/contact`
- `GET /api/family/media`
- `GET /api/family/{member}/blogs`
- `GET /api/lifestyle/{category}/blogs`
- `GET /api/lifestyle/{category}/media`
- `GET /api/portfolio`
- `GET /api/settings/content`
- `GET /api/settings/config`
- `GET /api/settings/reviews`

### Authenticated (session cookie required)

All `POST`, `PATCH`, and `DELETE` endpoints except the two public POST routes above.

## Path parameters

| Parameter | Valid values |
|-----------|--------------|
| `{member}` | `rafael`, `mikhail`, `mira` |
| `{category}` | `hobbies`, `sports`, `travel` |
| `{sectionId}` | `syncsoft`, `telstra-thealth`, `enett`, `dws`, `kmart` |

## Data storage

| Data | File | Uploads |
|------|------|---------|
| Family blogs | `data/family-blogs.json` | `public/family/{member}/` |
| Family media | `data/family-media.json` | `public/family/{member}/` |
| Lifestyle | `data/lifestyle.json` | `public/lifestyle/{category}/` |
| Portfolio | `data/portfolio.json` | `public/portfolio/{sectionId}/` |
| Reviews | `data/reviews.json` | `public/reviews/` |
| Site content | `data/site-content.json` | `public/profile/` |
| Site config | `data/site-config.json` | — |
| Contact messages | `data/contact-messages.json` | — |
| Users | `data/users.json` | — |
