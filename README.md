# جارك | Gaarak
Post a small task on the map. The nearest neighbor helps and earns points that convert to cash.
- Frontend: vanilla JS + Leaflet + OpenStreetMap (free), Arabic RTL and English.
- Backend: zero-dependency Node server (`npm start`), JSON file store, REST API.
- Static hosting: with no backend the app falls back to a localStorage demo store.
## API
`GET /api/requests`, `POST /api/requests`, `POST /api/requests/:id/accept`, `POST /api/requests/:id/done`
## Notes
Demo rate: 1 point = 0.5 EGP. Real payouts, auth and abuse protection are the next step.
