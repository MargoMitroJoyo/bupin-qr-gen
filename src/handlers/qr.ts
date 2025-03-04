import { createFactory } from "hono/factory"
import { QRCodeErrorCorrectionLevel } from "qrcode"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { addTextOverlay, compressImage, generateQRCode, getFileName } from "../utils"

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

    try {
      const canvas = await generateQRCode(url, detail as QRCodeErrorCorrectionLevel)
      addTextOverlay(canvas)
      const compressedBuffer = await compressImage(canvas, format)
      const contentType = format === "jpeg" ? "image/jpeg" : "image/png"
      const fileName = `${fileNameFromInfo}.${format === "jpeg" ? "jpg" : "png"}`

      return c.body(compressedBuffer, {
        headers: {
          "Content-Type": contentType,
          "Content-Disposition": `inline; filename="${fileName}"`,
        },
      })
    } catch (error) {
      console.error("Error generating QR code:", error)
      return c.text("Failed to generate QR code.", 500)
    }
  }
)
