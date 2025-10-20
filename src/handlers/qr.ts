import { createFactory } from "hono/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { generateImage, getFileName } from "../utils"
import { searchByISBN } from "../lib/bse"

const factory = createFactory()

const qrValidationSchema = {
  params: z.object({
    id: z.string().startsWith("UJN-").or(z.string().startsWith("VID-")),
  }),
  query: z.object({
    format: z.enum(["png", "jpeg", "avif"]).optional().default("png"),
    detail: z.enum(["low", "medium", "high"]).optional().default("high"),
    watermark: z.enum(["true", "false"]).optional().default("true"),
    preview: z.enum(["true", "false"]).optional().default("false"),
  }),
}

export const getQRImage = factory.createHandlers(
  zValidator("param", qrValidationSchema.params),
  zValidator("query", qrValidationSchema.query),
  async (c) => {
    const id = c.req.param("id")
    const format = c.req.query("format") || "png"
    const detail = c.req.query("detail") || "high"
    const watermark = c.req.query("watermark")
    const url = `https://buku.bupin.id/?${id}`
    const preview = c.req.query("preview")

    const fileNameFromInfo = await getFileName(id as string)
    if (!fileNameFromInfo) return c.text("QR code not found.", 404)

    const isWatermarked = watermark ? (watermark === "false" ? false : true) : true
    const isPreview = preview ? (preview === "false" ? false : true) : true

    return generateImage(c, url, format, detail, fileNameFromInfo, isWatermarked, isPreview)
  }
)

const universalQrValidationSchema = {
  params: z.object({
    string: z.string(),
  }),
  query: z.object({
    format: z.enum(["png", "jpeg", "avif"]).optional().default("png"),
    detail: z.enum(["low", "medium", "high"]).optional().default("high"),
    filename: z.string().optional(),
    watermark: z.enum(["true", "false"]).optional().default("true"),
    preview: z.enum(["true", "false"]).optional().default("false"),
  }),
}

export const getUniversalQRImage = factory.createHandlers(
  zValidator("param", universalQrValidationSchema.params),
  zValidator("query", universalQrValidationSchema.query),
  async (c) => {
    const string = c.req.param("string") as string
    const format = c.req.query("format") || "png"
    const detail = c.req.query("detail") || "high"
    const name = c.req.query("filename") || String(Bun.hash(string))
    const watermark = c.req.query("watermark")
    const preview = c.req.query("preview")
    const url = String(string)

    const isWatermarked = watermark ? (watermark === "false" ? false : true) : true
    const isPreview = preview ? (preview === "false" ? false : true) : true

    return generateImage(c, url, format, detail, name, isWatermarked, isPreview)
  }
)

const bseQrValidationSchema = {
  params: z.object({
    isbn: z.string(),
  }),
  query: z.object({
    format: z.enum(["png", "jpeg", "avif"]).optional().default("png"),
    detail: z.enum(["low", "medium", "high"]).optional().default("high"),
    filename: z.string().optional(),
    watermark: z.enum(["true", "false"]).optional().default("true"),
    preview: z.enum(["true", "false"]).optional().default("false"),
  }),
}

export const getBseQRImage = factory.createHandlers(
  zValidator("param", bseQrValidationSchema.params),
  zValidator("query", bseQrValidationSchema.query),
  async (c) => {
    const isbn = c.req.param("isbn")
    const book = searchByISBN(isbn as string)

    if (!book) return c.json({ error: "Book not found" })

    const format = c.req.query("format") || "png"
    const detail = c.req.query("detail") || "high"
    const filename =
      c.req.query("filename") || `${book.title.replace(/[^a-z0-9]/gi, "_").toLowerCase()}_${isbn}`
    const watermark = c.req.query("watermark")
    const preview = c.req.query("preview")
    const url = `${c.req.header("Host")}/api/r/bse/${isbn}`

    const isWatermarked = watermark ? (watermark === "false" ? false : true) : false
    const isPreview = preview ? (preview === "false" ? false : true) : true

    return generateImage(c, url, format, detail, filename, isWatermarked, isPreview)
  }
)
