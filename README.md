# جارك | Gaarak
Post a small task on the map. The nearest neighbor helps and earns points that convert to cash.
- Frontend: vanilla JS + Leaflet + OpenStreetMap (free), Arabic RTL and English.
- Backend: zero-dependency Node server (`npm start`), JSON file store, REST API.
- Static hosting: with no backend the app falls back to a localStorage demo store.
## API
`GET /api/requests`, `POST /api/requests`, `POST /api/requests/:id/accept`, `POST /api/requests/:id/done`
## Notes
Demo rate: 1 point = 0.5 EGP. Real payouts, auth and abuse protection are the next step.

## Features
Map with category pins, search/sort/radius, urgent flag, accept and complete, ratings, cancel own request, points wallet with demo withdrawal and history, Arabic (Egyptian) and English, RTL, dark mode, installable PWA with offline cache, keyboard and screen-reader support, mobile bottom-sheet layout.
## Backend notes
Zero dependencies, 10 KB body limit, 60 write requests per minute per IP, input sanitizing. Not included yet: auth, real payments, moderation.
## Deploy
GitHub Pages serves `/docs` (copy of `/public`). Run `npm start` to serve with the live API.
