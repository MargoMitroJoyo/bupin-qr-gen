import { createFactory } from "hono/factory"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { generateImage, getFileName } from "../utils"

const factory = createFactory()

const qrValidationSchema = {
  params: z.object({
    id: z.string().startsWith("UJN-").or(z.string().startsWith("VID-")),
  }),
  query: z.object({
    format: z.enum(["png", "jpeg", "avif"]).optional().default("png"),
    detail: z.enum(["low", "medium", "high"]).optional().default("high"),
  }),
}

export const getQRImage = factory.createHandlers(
  zValidator("param", qrValidationSchema.params),
  zValidator("query", qrValidationSchema.query),
  async (c) => {
    const id = c.req.param("id")
    const format = c.req.query("format") || "png"
    const detail = c.req.query("detail") || "high"
    const url = `https://buku.bupin.id/?${id}`

    const fileNameFromInfo = await getFileName(id as string)
    if (!fileNameFromInfo) return c.text("QR code not found.", 404)

    return generateImage(c, url, format, detail, fileNameFromInfo)
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
    const url = String(string)

    const isWatermarked = watermark ? (watermark === "false" ? false : true) : true

    return generateImage(c, url, format, detail, name, isWatermarked)
  }
)
