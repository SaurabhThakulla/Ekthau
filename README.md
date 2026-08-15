<div align="center">

Ekthau

Disposable Camera for Real-World Events

Capture the moments. Let everyone contribute. See the event come alive in real time.








</div>

About

Ekthau is a digital disposable-camera platform for weddings, parties, festivals, and other events.

Guests scan an event QR code, open the camera in their browser, take photos, and contribute them to a shared event gallery.

The key idea is simple:

Take the photo. Keep enjoying the event. Ekthau handles the upload.

Ekthau is designed for real-world event conditions, including slow and unstable mobile networks. Original photos are preserved while uploads happen directly to Cloudflare R2 using a reliable, resumable upload pipeline.

Features

📸 Disposable camera experience — guests can take photos directly from their phones.

📱 No app installation required — browser-first guest experience.

⚡ Live photo wall — newly approved photos appear in real time.

☁️ Direct-to-R2 uploads — large media bypasses the application server.

🔄 Resumable uploads — interrupted large uploads can continue instead of restarting.

📥 Background upload queue — guests can keep taking photos while uploads run.

🌐 Network-aware uploading — upload concurrency adapts to mobile network conditions.

🖼️ Original-quality storage — originals are preserved instead of being destructively compressed.

🖼️ Thumbnail + preview pipeline — fast browsing without downloading full-resolution originals.

🔐 Signed upload authorization — R2 credentials never reach the browser.

👥 Guest sessions — uploads are associated with valid event sessions.

🛡️ Upload limits and validation — protects events from abuse.

⚡ Realtime metadata updates — Supabase Realtime powers the live experience.

Architecture

Ekthau separates application data from large media files.

                         EKTHAU

┌─────────────────────────────┐
│        Guest Browser        │
│                             │
│  Camera → Local Queue       │
│          → Upload Worker    │
└──────────────┬──────────────┘
               │
               │ 1. Request upload authorization
               ▼
┌─────────────────────────────┐
│     Supabase Edge Function  │
│                             │
│  • Validate guest session   │
│  • Validate event           │
│  • Validate file            │
│  • Generate upload access   │
└──────────────┬──────────────┘
               │
               │ 2. Temporary signed authorization
               ▼
┌─────────────────────────────┐
│       Cloudflare R2         │
│                             │
│  Original / Preview /       │
│  Thumbnail                  │
└──────────────┬──────────────┘
               │
               │ 3. Upload confirmed
               ▼
┌─────────────────────────────┐
│     Supabase PostgreSQL     │
│                             │
│  Media metadata             │
│  Event / Guest association  │
│  Upload status              │
└──────────────┬──────────────┘
               │
               │ 4. Realtime event
               ▼
┌─────────────────────────────┐
│       Live Wall / Gallery   │
└─────────────────────────────┘

Why this architecture?

Large files do not pass through the application server.

Instead:

Guest Phone ───────────────────────► Cloudflare R2
                    Direct upload

Guest Phone ───► Supabase Edge Function
                  Authorization only

This reduces application-server bandwidth and makes the system much easier to scale during large events.

Upload Flow

1. Guest captures a photo

The camera captures the original image.

For example:

20 MB JPEG

The original is kept intact.

2. Photo enters the local upload queue

The camera does not wait for the upload to finish.

Camera
  ↓
Local Queue
  ↓
Upload Worker

The guest can continue taking photos while previous photos upload in the background.

3. Supabase authorizes the upload

The browser calls the upload authorization Edge Function with information such as:

{
  "event_id": "...",
  "filename": "capture.jpg",
  "content_type": "image/jpeg",
  "session_token_hash": "..."
}

The Edge Function validates the guest and event before generating temporary R2 upload authorization.

4. Browser uploads directly to R2

The browser sends the file directly to Cloudflare R2.

Browser ─────────────────────► R2
            20 MB

The application server never has to receive the 20 MB file.

5. Large files use resumable multipart uploads

Large files can be split into parts:

20 MB

┌───────┐ ┌───────┐ ┌───────┐ ┌───────┐
│ 5 MB  │ │ 5 MB  │ │ 5 MB  │ │ 5 MB  │
└───────┘ └───────┘ └───────┘ └───────┘

If the network drops:

Part 1 ✓
Part 2 ✓
Part 3 ✗
Part 4 ✓

Only the failed part needs to be retried.

The entire file does not have to restart.

6. Media is registered in Supabase

After R2 confirms the upload:

R2 upload complete
        ↓
record_uploaded_media
        ↓
Supabase media table

The database stores metadata and references to the object in R2 rather than the large media bytes.

7. Live Wall updates through Realtime

Supabase Realtime broadcasts the new media metadata.

Supabase Realtime
       ↓
Live Wall
       ↓
R2 preview / thumbnail

Images themselves are not sent through WebSockets.

Media Storage Strategy

Ekthau separates media into different representations.

events/{event_id}/media/{media_id}/
│
├── original.jpg
├── preview.jpg
└── thumbnail.jpg

Original

Used for:

Full-resolution viewing

Downloads

Event archive

Preview

Used for:

Gallery

Larger media viewer

Mobile browsing

Thumbnail

Used for:

Live wall

Photo grids

Small cards

This prevents the Live Wall from downloading 10–20 MB originals for every photo.

Reliability on Slow Networks

Ekthau is specifically designed for event environments where mobile connectivity may be slow or unstable.

Upload queue

✓ Photo 1
✓ Photo 2
↑ Photo 3 — 67%
○ Photo 4
○ Photo 5

Connection loss

Uploading
    ↓
Internet lost
    ↓
Queue paused
    ↓
Internet returns
    ↓
Queue resumes

Adaptive concurrency

Network

Concurrent uploads

Very slow

1

Normal

1–2

Fast

2

The priority is reliability rather than saturating the guest's connection.

Security

Ekthau never exposes permanent R2 credentials to the browser.

The server keeps:

R2_ACCESS_KEY_ID
R2_SECRET_ACCESS_KEY

The browser receives only temporary upload authorization.

The upload authorization flow validates:

Event

Guest session

Session expiration

MIME type

File size

Event limits

Storage paths are generated server-side and are not freely chosen by the client.

Idempotent Media Registration

Distributed systems can fail between two successful operations.

For example:

R2 upload succeeds
        ↓
Database request fails
        ↓
Client retries

The retry must not create a duplicate media record.

Ekthau uses a unique media identifier/idempotency key so registration can safely be retried.

Abuse Protection

Because Ekthau is an event-facing public application, upload authorization does not mean unlimited uploads.

Recommended controls include:

Per-session upload limits

Per-event storage limits

Maximum file sizes

MIME validation

Rate limiting

Event expiration

Presigned URL expiration

Video duration/size limits

Monitoring and alerts

Tech Stack

Layer

Technology

Frontend

Next.js / React

Language

TypeScript

Styling

Tailwind CSS

Database

Supabase PostgreSQL

Authentication / Sessions

Supabase

Serverless API

Supabase Edge Functions

Realtime

Supabase Realtime

Media Storage

Cloudflare R2

Upload Protocol

S3-compatible / Multipart

Client Persistence

IndexedDB

Hosting

Vercel / compatible deployment

Project Structure

A simplified structure:

ekthau/
├── src/
│   ├── app/
│   │   ├── e/
│   │   │   └── [slug]/
│   │   │       └── camera/
│   │   └── ...
│   ├── components/
│   ├── lib/
│   └── ...
│
├── supabase/
│   ├── functions/
│   │   └── upload-url/
│   │       └── index.ts
│   ├── migrations/
│   └── ...
│
├── public/
├── package.json
├── .env.example
└── README.md

The exact structure may evolve as the application grows.

Getting Started

Prerequisites

Make sure you have:

Node.js 20+

npm / pnpm / yarn

A Supabase project

A Cloudflare account with R2 enabled

R2 bucket

Supabase CLI

Git

Installation

Clone the repository:

git clone https://github.com/<your-username>/ekthau.git
cd ekthau

Install dependencies:

npm install

Environment Variables

Create a local environment file:

cp .env.example .env.local

Configure the required values.

Example:

NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=

R2_ACCOUNT_ID=
R2_BUCKET_NAME=
R2_ACCESS_KEY_ID=
R2_SECRET_ACCESS_KEY=

Keep R2 credentials server-side. Never expose R2_SECRET_ACCESS_KEY through a NEXT_PUBLIC_* variable.

Supabase Edge Function secrets should be configured separately using the Supabase CLI or dashboard.

Development

Start the development server:

npm run dev

Open:

http://localhost:3000

Database

Run Supabase migrations according to the project's migration workflow.

The database is responsible for:

Events

Guest sessions

Media metadata

Upload status

Moderation state

Event relationships

The database should never be used as the primary store for large photo/video binaries.

R2 Setup

Create a Cloudflare R2 bucket and configure credentials for the server-side upload authorization function.

The R2 bucket should remain private unless a deliberate public-delivery strategy is configured.

The application should expose media through controlled URLs or the chosen R2 delivery layer rather than exposing the entire bucket.

Production Upload Flow

The production flow is:

Guest
  │
  ├── Capture original
  │
  ▼
Local Queue
  │
  ├── Retry
  ├── Resume
  └── Background upload
  │
  ▼
Supabase Edge Function
  │
  └── Temporary authorization
  │
  ▼
Cloudflare R2
  │
  ├── Original
  ├── Preview
  └── Thumbnail
  │
  ▼
Supabase PostgreSQL
  │
  └── Media metadata
  │
  ▼
Supabase Realtime
  │
  ▼
Live Wall

Design Principles

1. Large media bypasses the backend

Application servers should handle application logic, not proxy 20 MB photos.

2. Preserve originals

Network problems should not force destructive quality reduction.

3. Upload asynchronously

Taking a photo should never require waiting for an upload.

4. Resume instead of restart

Temporary network failures should not waste already-uploaded bytes.

5. Keep the Live Wall lightweight

Use thumbnails and previews instead of full-resolution originals.

6. Treat retries as normal

Mobile networks fail. The system should be designed around that reality.

7. Keep the architecture simple

Use managed infrastructure where it solves the problem. Avoid unnecessary microservices and infrastructure.

Scalability

The architecture separates media traffic from application traffic.

Instead of:

500 guests
    ↓
Application Server
    ↓
Storage

Ekthau uses:

500 guests
    │
    ├────────────────► R2
    ├────────────────► R2
    ├────────────────► R2
    ├────────────────► R2
    └────────────────► R2

Supabase
    │
    ├── Authorization
    ├── Metadata
    └── Realtime

This means increasing the number of guests does not automatically turn the application server into the media-upload bottleneck.

Roadmap

Potential future improvements:

Automatic image optimization pipeline

Advanced video transcoding

AI event highlights

Face-based photo search

Duplicate photo detection

Offline-first camera experience

Advanced host moderation

Custom event domains

Event analytics

Downloadable event archives

Multi-day events

Multi-album events

Contributing

Contributions, issues, and feature requests are welcome.

Before submitting a pull request:

Keep changes focused.

Do not expose credentials or secrets.

Do not route large media through the application server without a documented reason.

Preserve upload idempotency.

Test failure and retry scenarios.

Test the guest experience on mobile networks.

Security

If you discover a security vulnerability, do not open a public issue with sensitive details.

Report it privately through the project's designated security contact.

License

This project is licensed under the MIT License.

<div align="center">

Built for moments that shouldn't be lost.

Ekthau

</div>