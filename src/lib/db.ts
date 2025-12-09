import { PrismaMariaDb } from "@prisma/adapter-mariadb"
import { PrismaClient } from "../generated/prisma/client"

const dbDetails = parseDatabaseUrl(process.env.DATABASE_URL!)

const adapter = new PrismaMariaDb({
  host: dbDetails.host,
  port: dbDetails.port,
  user: dbDetails.user,
  password: dbDetails.password,
  database: dbDetails.database,
})

export const prisma = new PrismaClient({ adapter })

// UTILITIES TO PARSE DATABASE URLS
function parseDatabaseUrl(connectionString: string) {
  const url = new URL(connectionString)

  return {
    host: url.hostname,
    port: Number(url.port),
    user: url.username,
    password: url.password,
    database: url.pathname.slice(1),
  }
}
