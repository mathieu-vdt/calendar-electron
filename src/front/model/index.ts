import { IEvent } from '../../interfaces/event';
const initSqlJs   = require('sql.js');
const fs          = require('fs');
const path        = require('path');

// ── Paths ─────────────────────────────────────────────────────────────────────

// process.cwd() is the project root when running with `electron ./dist/main.js`
// __dirname is undefined in ES module renderer scripts, so we use process.cwd()
const DB_PATH   = path.join(process.cwd(), 'calendar.db');
// Locate the sql.js WASM file bundled with the npm package
const WASM_PATH = path.dirname(require.resolve('sql.js'));

// ── Singleton DB handle ───────────────────────────────────────────────────────

let _db: any = null;

async function getDb(): Promise<any> {
  if (_db) return _db;

  const SQL = await initSqlJs({
    locateFile: (file: string) => path.join(WASM_PATH, file),
  });

  if (fs.existsSync(DB_PATH)) {
    const buf = fs.readFileSync(DB_PATH);
    _db = new SQL.Database(buf);
  } else {
    _db = new SQL.Database();
  }

  // Bootstrap schema
  _db.run(`
    CREATE TABLE IF NOT EXISTS event (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      titre       TEXT    NOT NULL,
      date_deb    TEXT    NOT NULL,
      date_fin    TEXT    NOT NULL,
      description TEXT    DEFAULT '',
      location    TEXT    DEFAULT '',
      statut      TEXT    DEFAULT '',
      categorie   TEXT    DEFAULT '',
      transparence TEXT   DEFAULT '',
      nbMaj       INTEGER DEFAULT 0
    )
  `);

  persist();
  return _db;
}

/** Write the in-memory DB to disk. Called after every mutation. */
function persist(): void {
  if (!_db) return;
  const data: Uint8Array = _db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

/** Convert a sql.js result set into a plain array of objects. */
function toRows<T>(results: any[]): T[] {
  if (!results.length) return [];
  const { columns, values } = results[0];
  return values.map((row: any[]) => {
    const obj: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => { obj[col] = row[i]; });
    return obj as T;
  });
}

// ── Public API ────────────────────────────────────────────────────────────────

export async function getAll(): Promise<IEvent[]> {
  // Reset the singleton so we always reload from disk.
  // Each renderer window has its own module instance, so mutations made in
  // another window (e.g. the add-event form) are only visible after re-reading
  // the persisted file.
  _db = null;
  const db = await getDb();
  const res = db.exec('SELECT * FROM event ORDER BY date_deb ASC');
  return toRows<IEvent>(res);
}

export async function getById(id: number): Promise<IEvent | undefined> {
  const db = await getDb();
  const res = db.exec('SELECT * FROM event WHERE id = ?', [id]);
  return toRows<IEvent>(res)[0];
}

export async function addEvent(event: IEvent): Promise<void> {
  const db = await getDb();
  db.run(
    `INSERT INTO event (titre, date_deb, date_fin, description, location, statut, categorie, transparence, nbMaj)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      event.titre,
      event.date_deb instanceof Date ? event.date_deb.toISOString() : event.date_deb,
      event.date_fin instanceof Date ? event.date_fin.toISOString() : event.date_fin,
      event.description ?? '',
      event.location    ?? '',
      event.statut      ?? '',
      event.categorie   ?? '',
      event.transparence ?? '',
      event.nbMaj       ?? 0,
    ],
  );
  persist();
}

export async function updEvent(event: IEvent): Promise<void> {
  const db = await getDb();
  db.run(
    `UPDATE event
     SET titre = ?, date_deb = ?, date_fin = ?, description = ?,
         location = ?, statut = ?, categorie = ?, transparence = ?, nbMaj = ?
     WHERE id = ?`,
    [
      event.titre,
      event.date_deb instanceof Date ? event.date_deb.toISOString() : event.date_deb,
      event.date_fin instanceof Date ? event.date_fin.toISOString() : event.date_fin,
      event.description  ?? '',
      event.location     ?? '',
      event.statut       ?? '',
      event.categorie    ?? '',
      event.transparence ?? '',
      event.nbMaj        ?? 0,
      event.id,
    ],
  );
  persist();
}

export async function delEvent(id: number): Promise<void> {
  const db = await getDb();
  db.run('DELETE FROM event WHERE id = ?', [id]);
  persist();
}

