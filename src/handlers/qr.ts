import { createFactory } from "hono/factory"
import { QRCodeErrorCorrectionLevel, toCanvas } from "qrcode"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { createCanvas, registerFont } from "canvas"
import { getFileName } from "../utils"
import sharp from "sharp"

registerFont("./assets/fonts/Poppins-SemiBold.ttf", { family: "Poppins", weight: "600" })

const factory = createFactory()

export const getQRImage = factory.createHandlers(
  zValidator(
    "param",
    z.object({
      id: z.string().startsWith("UJN-").or(z.string().startsWith("VID-")),
    })
  ),
  zValidator(
    "query",
    z.object({
      format: z.enum(["png", "jpeg", "avif"]).optional().default("png"),
      detail: z.enum(["low", "medium", "high"]).optional().default("high"),
    })
  ),
  async (c) => {
    const id = c.req.param("id")
    const format = c.req.query("format") || "png"
    const detail = c.req.query("detail") || "high"
    const url = `https://buku.bupin.id/?${id}`

    const fileNameFromInfo = await getFileName(id as string)

    if (!fileNameFromInfo) {
      return c.text("QR code not found.", 404)
    }

    try {
      const canvas = createCanvas(512, 512)
      const ctx = canvas.getContext("2d")

      await toCanvas(canvas, url, {
        margin: 1,
        width: 512,
        errorCorrectionLevel: detail as QRCodeErrorCorrectionLevel,
      })

      const rectMargin = 13
      const rectWidth = 145
      const rectHeight = 39

      ctx.clearRect(
        canvas.width - rectWidth - rectMargin,
        canvas.height - rectHeight - rectMargin,
        rectWidth,
        rectHeight
      )

      ctx.fillStyle = "black"
      ctx.font = "600 35px Poppins"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const textX = canvas.width - rectWidth - rectMargin + rectWidth / 2
      const textY = canvas.height - rectHeight - rectMargin + rectHeight / 2 - 3

      ctx.lineWidth = 3

      ctx.strokeStyle = "white"
      ctx.strokeText("bupin.id", textX, textY)

      ctx.fillStyle = "black"
      ctx.fillText("bupin.id", textX, textY)

      const buffer = canvas.toBuffer("image/png")

      const compressedBuffer = await sharp(buffer)
        .toFormat(format as keyof sharp.FormatEnum, { quality: 80 })
        .toBuffer()

      const contentType = `image/${format}`
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
