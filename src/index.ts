import { Hono } from "hono"
import api from "./routes/api"

const port = process.env.PORT || 3000

const app = new Hono()

app.route("/api", api)

console.log(`Server running on port ${port}`)

export default {
  port: port,
  fetch: app.fetch,
}
