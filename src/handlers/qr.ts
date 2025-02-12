import { createFactory } from "hono/factory"
import { QRCodeErrorCorrectionLevel, toCanvas } from "qrcode"
import { zValidator } from "@hono/zod-validator"
import { z } from "zod"
import { createCanvas, registerFont } from "canvas"

registerFont("./assets/fonts/Poppins-Medium.ttf", { family: "Poppins", weight: "500" })

const factory = createFactory()

export const getQRImage = factory.createHandlers(
  zValidator("param", z.object({
    id: z.string(),
  })),
  zValidator(
    "query",
    z.object({
      format: z.enum(["png", "jpeg"]).optional().default("png"),
      detail: z.enum(["low", "medium", "high"]).optional().default("high"),
    })
  ),
  async (c) => {
    const id = c.req.param("id")
    const format = c.req.query("format") || "png"
    const detail = c.req.query("detail") || "high"
    const url = `https://buku.bupin.id/?${id}`

    try {
      const canvas = createCanvas(512, 512)
      const ctx = canvas.getContext("2d")

      await toCanvas(canvas, url, {
        margin: 1,
        width: 512,
        errorCorrectionLevel: detail as QRCodeErrorCorrectionLevel,
      })

      const rectMargin = 13
      const rectWidth = 125
      const rectHeight = 35

      ctx.clearRect(
        canvas.width - rectWidth - rectMargin,
        canvas.height - rectHeight - rectMargin,
        rectWidth,
        rectHeight
      )

      ctx.fillStyle = "black"
      ctx.font = "500 30px Poppins"
      ctx.textAlign = "center"
      ctx.textBaseline = "middle"

      const textX = canvas.width - rectWidth - rectMargin + rectWidth / 2
      const textY = canvas.height - rectHeight - rectMargin + rectHeight / 2

      ctx.fillStyle = "white"
      const shadowOffset = 2

      ctx.fillText("bupin.id", textX + shadowOffset, textY + shadowOffset)
      ctx.fillText("bupin.id", textX - shadowOffset, textY + shadowOffset)
      ctx.fillText("bupin.id", textX + shadowOffset, textY - shadowOffset)
      ctx.fillText("bupin.id", textX - shadowOffset, textY - shadowOffset)

      ctx.fillStyle = "black"
      ctx.fillText("bupin.id", textX, textY)

      let buffer
      let contentType
      let fileName

      if (format === "jpeg") {
        buffer = canvas.toBuffer("image/jpeg")
        contentType = "image/jpeg"
        fileName = `${id}.jpg`
      } else {
        buffer = canvas.toBuffer("image/png")
        contentType = "image/png"
        fileName = `${id}.png`
      }

      return c.body(buffer, {
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
