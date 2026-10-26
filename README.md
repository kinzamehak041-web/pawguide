# PawGuide - Pet Care Website

Search any pet and read how to feed, house, groom, train and keep it healthy.

## Run
1. Install Node.js (v14 or newer): https://nodejs.org
2. In this folder run: `node server.js`  (or `npm start`)
3. Open http://localhost:3000

No `npm install` needed - there are no dependencies.

## API
- `GET /api/pets?q=cat&category=Birds` - search
- `GET /api/pets/:id` - full care guide
- `GET /api/categories`

## Add more pets
Edit `data/pets.json` and copy the structure of an existing pet. Restart the server.
