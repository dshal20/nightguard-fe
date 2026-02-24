# NightGuard Frontend

## Local Development

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Running with Docker (Production)

### 1. Set up environment variables

Create a `.env` file at the project root with the following variables:

```env
NEXT_PUBLIC_API_URL=https://your-api-url.com

NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

NEXT_PUBLIC_ADMIN_EMAILS=admin@example.com
```

> **Note:** `NEXT_PUBLIC_*` variables are baked into the JS bundle at build time. They must be passed as build args — not injected at runtime.

### 2. Build the image

Source your `.env` and build:

```bash
export $(grep -v '^#' .env | xargs)

docker build \
  --build-arg NEXT_PUBLIC_API_URL \
  --build-arg NEXT_PUBLIC_FIREBASE_API_KEY \
  --build-arg NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN \
  --build-arg NEXT_PUBLIC_FIREBASE_PROJECT_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET \
  --build-arg NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID \
  --build-arg NEXT_PUBLIC_FIREBASE_APP_ID \
  --build-arg NEXT_PUBLIC_ADMIN_EMAILS \
  -t nightguard-fe .
```

### 3. Run the container

```bash
docker run -p 3000:3000 nightguard-fe
```

The app will be available at [http://localhost:3000](http://localhost:3000).
