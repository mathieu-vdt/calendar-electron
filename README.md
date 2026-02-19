# Calendar — Electron

A desktop calendar application built with **Electron** and **TypeScript**, backed by a local **SQL.js** database.

---

## Features

- Monthly calendar view with Monday-first grid layout
- Events displayed on their respective days, spanning multi-day ranges
- Double-click any day to open the "Add Event" form with the date pre-filled
- Event details window showing all event metadata
- Add, view, and delete events
- Calendar automatically refreshes after any change

## Tech Stack

| Layer | Technology |
|---|---|
| Runtime | [Electron](https://www.electronjs.org/) |
| Language | TypeScript |
| Database | [sql.js](https://sql.js.org/) (SQLite compiled to WebAssembly) |
| Linting | ESLint + @typescript-eslint |

## Project Structure

```
src/
├── back/
│   └── main.ts          # Electron main process (window management, IPC handlers)
├── front/
│   ├── model/
│   │   └── index.ts     # Database access layer (sql.js queries)
│   ├── preload/
│   │   └── preload.ts   # Electron preload script
│   └── renderer/
│       ├── renderer.ts      # Main calendar renderer
│       ├── AddForm.ts       # Add/edit event form logic
│       └── eventDetails.ts  # Event details window logic
├── interfaces/
│   └── event.ts         # IEvent TypeScript interface
pages/
├── index.html           # Main calendar page
├── form.html            # Add event form page
├── event.html           # Event details page
└── css/
    └── styles.css
```

## Event Model

Each event contains the following fields:

| Field | Type | Description |
|---|---|---|
| `id` | number | Auto-generated identifier |
| `titre` | string | Event title |
| `date_deb` | Date | Start date |
| `date_fin` | Date | End date |
| `location` | string | Location |
| `categorie` | string | Category |
| `statut` | string | Status |
| `description` | string | Description |
| `transparence` | string | Transparency (free / busy) |
| `nbMaj` | number | Number of updates |

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or later recommended)
- npm

### Installation

```bash
npm install
```

### Running the App

```bash
npm start
```

This command compiles both the back-end and front-end TypeScript sources and then launches the Electron application.

### Building Only

```bash
# Build everything
npm run build

# Build back-end only
npm run build:back

# Build front-end only
npm run build:front
```

### Watch Mode (development)

Open two terminals and run each command in one:

```bash
npm run watch:back
npm run watch:front
```

### Linting

```bash
npm run lint
```

## Windows

The application uses three separate Electron windows:

| Window | Size | Description |
|---|---|---|
| Main | 1100 × 700 | Monthly calendar grid |
| Event Details | 680 × 520 | Read-only view of a single event |
| Add / Edit Event | 560 × 480 | Form to create or update an event |

All windows are frameless and share a common preload script for IPC communication.

## License

[CC0 1.0 Universal](LICENSE.md)

