# THE NUMBER

A single-page website where a number goes up when you give it money.

## Setup

1. **Ko-fi page**: The in-page panel already points at `https://ko-fi.com/thisnumbershouldbebigger/?hidefeed=true&widget=true&embed=true`. If you change your Ko-fi handle, update `KOFI_EMBED` in `index.html`.

2. **Backend for the number**  
   - Install deps and start the small Node server:

   ```bash
   cd /Users/alexcarroll/Desktop/Absurd
   npm init -y
   npm install express
   node server.js
   ```

   - The server exposes:
     - `POST /api/kofi-webhook` – point your Ko-fi payment webhook at this URL.
     - `GET /api/total` – returns the current aggregate total in cents and dollars.

   - The running total is stored in `number.json`. It is initialised to `$6.00`; you can edit this file if you want to seed a different starting value.

3. **Configure Ko-fi webhook**  
   In your Ko-fi dashboard, set the webhook URL to your deployed server, e.g.:

   - Locally: `http://localhost:3000/api/kofi-webhook`

   Every successful payment will increment the stored total.

## Run locally

1. **Start the backend** (from this folder):

```bash
node server.js
```

2. **Open the frontend**

- Either just open `index.html` directly in your browser, or serve the folder:

```bash
python3 -m http.server 8000
```

Then visit `http://localhost:8000`. The large number will be replaced with the live value from `http://localhost:3000/api/total` when it responds.
