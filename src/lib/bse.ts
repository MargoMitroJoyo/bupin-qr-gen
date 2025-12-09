import { Database } from "bun:sqlite"
import { readFileSync } from "fs"
import { Book } from "../types"
import { parse } from "papaparse"

export let bse: Database

function detectType(value: string): string {
  if (!value || value.trim() === "") return "TEXT"
  if (!isNaN(Number(value))) return "REAL"
  if (/^\d{4}-\d{2}-\d{2}/.test(value)) return "TEXT"
  return "TEXT"
}

function loadCSVIntoMemoryDB(csvPath: string): Database {
  const csv = readFileSync(csvPath, "utf8")
  const parsed = parse(csv, { header: true, skipEmptyLines: true })

  const database = new Database(":memory:")
  const firstRow = parsed.data[0] as Record<string, string>
  const columns = Object.keys(firstRow)

  const createSQL = `
    CREATE TABLE books (
      ${columns.map((col) => `"${col}" ${detectType(firstRow[col])}`).join(", ")}
    );
  `
  database.run(createSQL)

  const insertSQL = `
    INSERT INTO books (${columns.map((c) => `"${c}"`).join(", ")})
    VALUES (${columns.map(() => "?").join(", ")});
  `
  const stmt = database.prepare(insertSQL)

  for (const row of parsed.data as Record<string, string>[]) {
    const values = Object.values(row).map((v) => (v === "" ? null : v))
    stmt.run(...values)
  }

  return database
}

export function getBookDB(): Database {
  if (!bse) {
    console.log("📚 Loading BSE Kurmer CSV into memory...")
    bse = loadCSVIntoMemoryDB("./data/bse_kurmer.csv")
    console.log("✅ Book database loaded successfully.")
  }
  return bse
}

export function searchByISBN(isbn: string) {
  const db = getBookDB()
  const result = db
    .query("SELECT * FROM books WHERE isbn LIKE ? LIMIT 1")
    .get(`%${isbn}%`)
  return result ? (result as unknown as Book) : null
}
