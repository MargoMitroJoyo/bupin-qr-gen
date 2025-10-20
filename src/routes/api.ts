import { Hono } from "hono"
import { getBseQRImage, getQRImage, getUniversalQRImage } from "../handlers/qr"
import { searchByISBN } from "../lib/bse"

const api = new Hono()

api.get("/qr/:id", ...getQRImage)
api.get("/qr/u/:string", ...getUniversalQRImage)
api.get("/qr/bse/:isbn", ...getBseQRImage)

api.get("/r/bse/:isbn", (c) => {
  const isbn = c.req.param("isbn")
  const book = searchByISBN(isbn)
  return c.redirect(`https://buku.kemendikdasmen.go.id/katalog/${book?.slug}`, 302)
})

export default api
