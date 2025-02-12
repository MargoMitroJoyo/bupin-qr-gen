import { Hono } from "hono"
import { getQRImage } from "../handlers/qr"

const api = new Hono()

api.get("/qr/:id", ...getQRImage)

export default api
