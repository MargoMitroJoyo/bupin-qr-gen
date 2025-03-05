import { Hono } from "hono"
import { getQRImage, getUniversalQRImage } from "../handlers/qr"

const api = new Hono()

api.get("/qr/:id", ...getQRImage)
api.get("/qr/u/:string", ...getUniversalQRImage)

export default api
