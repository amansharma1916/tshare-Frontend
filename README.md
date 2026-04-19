# TShare (Frontend + Backend)

TShare is a full-stack sharing app where users can quickly share **text, images, and PDFs** using short 4-digit codes, plus join a **public realtime chat room**.

This README describes the full project and how to run both apps together.

## Project Structure

```text
tshare-Frontend/   # React + Vite client
tshare-Backend/    # Express + MongoDB + Socket.IO API
```

## Features

- Share text and retrieve it by 4-digit code
- Upload image, then fetch or download by code
- Upload PDF, preview inline, or download by code
- Admin login and panel for managing content and codes
- Public room realtime chat with Socket.IO
- Room validation and active/inactive room controls

## Tech Stack

### Frontend
- React 19
- React Router
- Socket.IO Client
- Vite

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.IO
- Cloudinary + Multer

## Prerequisites

- Node.js 18+
- MongoDB database
- Cloudinary credentials

---

## 1) Backend Setup (`tshare-Backend`)

### Install

```bash
cd ../tshare-Backend
npm install
```

### Create `.env`

```env
MONGODB_URI=your_mongodb_connection_string
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
CORS_ORIGIN=http://localhost:5173
PORT=5000
```

### Run

```bash
# normal node server
npm start

# or nodemon
npm run server

# or vercel local dev
npm run dev
```

Backend default URL for local dev: `http://localhost:5000`

---

## 2) Frontend Setup (`tshare-Frontend`)

### Install

```bash
cd ../tshare-Frontend
npm install
```

### Create `.env`

```env
VITE_BACKEND_URL=http://localhost:5000
```

> Frontend throws an error on startup if `VITE_BACKEND_URL` is missing.

### Run

```bash
npm run dev
```

Frontend default URL: `http://localhost:5173`

---

## Scripts

### Frontend
- `npm run dev` - start Vite dev server
- `npm run build` - production build
- `npm run preview` - preview production build
- `npm run lint` - run ESLint

### Backend
- `npm start` - run Express server
- `npm run server` - run with nodemon
- `npm run dev` - run with `vercel dev`

## Main Frontend Routes

- `/` - landing page
- `/sharePage` - text sharing page
- `/share-image` - image sharing page
- `/share-pdf` - PDF sharing page
- `/recievePage` - receive shared content
- `/admin/login` - admin login
- `/admin/panel` - admin management panel
- `/public-room` - public realtime chat room

## Main API Endpoints

- Text: `POST /save`, `GET /get/:id`
- Images: `POST /image/upload`, `GET /image/:id`, `GET /image/download/:id`
- PDFs: `POST /pdf/upload`, `GET /pdf/:id`, `GET /pdf/preview/:id`, `GET /pdf/download/:id`
- Admin login/password: `POST /admin/login`, `PUT /admin/password`
- Admin text/image management: list, update, delete, code regeneration
- Public room admin: create/list/delete/toggle room status
- Public room client: `GET /public-room/validate/:code`, `GET /public-room/:code/messages`

## Socket.IO

- Server path: `/socket.io/`
- Core events: `join-room`, `send-message`, `room-joined`, `chat-message`, `user-joined`, `user-left`

## Notes

- Backend initializes default admin password as `admin123` on first run (change it from admin panel).
- Max upload size for image and PDF is 5MB.
- Cloudinary is required for image/PDF upload endpoints.

