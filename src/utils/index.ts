import { QRCodeErrorCorrectionLevel, toCanvas } from "qrcode"
import { prisma } from "../lib/db"
import { InfoUJN, InfoVID } from "../types"
import { Canvas, createCanvas, GlobalFonts } from "@napi-rs/canvas"
import { Context } from "hono"

/**
 * Fetches information from the UJN API using the provided QR code.
 *
 * @param {string} qrcode - The QR code to be used in the API request.
 * @returns {Promise<InfoUJN>} - A promise that resolves to the information fetched from the UJN API.
 * @throws {Error} - Throws an error if the data fetching fails.
 */
export async function fetchInfoUJN(qrcode: string): Promise<InfoUJN> {
  const info = await prisma.qrujian.findFirst({
    where: { kodeQRUjian: qrcode },
    select: {
      kodeQRUjian: true,
      id_ujian: true,
      jenjang: { select: { namaJenjang: true } },
      kelas: { select: { namaKelas: true } },
      mapel: { select: { namaMapel: true } },
      bab: { select: { namaBab: true } },
    },
  })

  if (!info) throw new Error("Failed to fetch data")

  return {
    kodeQRUjian: info.kodeQRUjian,
    idUjian: info.id_ujian,
    namaJenjang: info.jenjang.namaJenjang,
    namaKelas: info.kelas.namaKelas,
    namaMapel: info.mapel.namaMapel,
    namaBab: info.bab.namaBab,
  }
}

/**
 * Fetches information based on the provided QR code.
 *
 * @param {string} qrcode - The QR code to fetch information for.
 * @returns {Promise<InfoVID>} A promise that resolves to the fetched information.
 * @throws {Error} If the fetch operation fails.
 */
export async function fetchInfoVID(qrcode: string): Promise<InfoVID> {
  const info = await prisma.qrvap.findFirst({
    where: { kodeQR: qrcode },
    select: {
      kodeQR: true,
      jenjang: { select: { namaJenjang: true } },
      kelas: { select: { namaKelas: true } },
      mapel: { select: { namaMapel: true } },
      bab: { select: { namaBab: true } },
      subbab: { select: { namaSubBab: true } },
    },
  })

  if (!info) throw new Error("Failed to fetch data")

  return {
    kode_qr: info.kodeQR,
    nama_jenjang: info.jenjang.namaJenjang,
    nama_kelas: info.kelas.namaKelas,
    nama_mapel: info.mapel.namaMapel,
    nama_bab: info.bab.namaBab,
    nama_sub_bab: info.subbab.namaSubBab,
  }
}

/**
 * Extracts and returns the **JENJANG** and **KELAS** from the given input string.
 *
 * @param inputString - The input string containing the educational level and class.
 * @returns The extracted educational level and class as a string, or the original input string if no match is found.
 */
export function getJenjangKelas(inputString: string): string {
  const regex = /\b(SD|SMP|SMA|MI|MTS|SMK|MA)[-\s]*(\d+|VII|VIII|IX|X|XI|XII)\b/i
  const match = inputString.match(regex)
  return match ? `${match[1]} ${match[2]}` : inputString
}

/**
 * Determines the **KURIKULUM** type based on the input string.
 *
 * @param inputString - The input string to be evaluated.
 * @returns The curriculum type as a string.
 */
export function getKurikulum(inputString: string): string {
  const lower = inputString.toLowerCase()
  const kmaMatch = lower.match(/kma\s*(\d+)/)
  
  if (lower.includes("merdeka")) return "KURMER"
  if (kmaMatch) return `KMA-${kmaMatch[1]}`
  if (lower.includes("btq")) return "BTQ"
  if (lower.includes("2013")) return "K13"
  return "UNKNOWN"
}

/**
 * Extracts and formats a specific type and **BAB** number from the input string.
 *
 * @param inputString - The string to search for the keywords and number.
 * @returns A formatted string with the type and number, or the original input string if no match is found.
 */
export function getBab(inputString: string): string {
  const match = inputString.toLowerCase().match(/\b(bab|chapter|subtema|wulangan|unit)\s+(\d+)/i)
  return match ? `BAB ${match[2]}` : inputString
}

export function getSubBab(inputString: string): string {
  if (/AKM|P3/.test(inputString)) return inputString
  const match = inputString.toUpperCase().match(/[A-Z]\./)
  return match ? `SUBBAB ${match[0].replace(".", "")}` : inputString
}

/**
 * Retrieves the file name based on the provided QR code.
 *
 * constructs a file name using the extracted information (**JENJANG**, **KELAS**, **KURIKULUM**, **BAB**).
 *
 * @param {string} qrcode - The code string used to fetch the information.
 * @returns {Promise<string>} A promise that resolves to the constructed file name.
 *
 * @throws Will log an error to the console and return the original QR code if fetching information fails.
 */
export async function getFileName(qrcode: string): Promise<string> {
  const type = qrcode.split("-")[0]

  try {
    if (type === "UJN") {
      const info = await fetchInfoUJN(qrcode)

      const kelas = getJenjangKelas(info.namaKelas)
      const kurikulum = getKurikulum(info.namaJenjang)
      const mapel = info.namaMapel
      const bab = getBab(info.namaBab)

      return `${kelas} - ${kurikulum} - ${mapel} - ${bab} - ${qrcode}`
    } else {
      const info = await fetchInfoVID(qrcode)

      const kelas = getJenjangKelas(info.nama_kelas)
      const kurikulum = getKurikulum(info.nama_jenjang)
      const mapel = info.nama_mapel
      const bab = getBab(info.nama_bab).replace("â€™", "'")
      const subbab = getSubBab(info.nama_sub_bab).replace("â€™", "'")

      return `${kelas} - ${kurikulum} - ${mapel} - ${bab} - ${subbab} - ${qrcode}`
    }
  } catch (error) {
    console.error(error)
    return qrcode
  }
}

/**
 * Generates a QR code for the given URL and returns it as a Canvas object.
 *
 * @param url - The URL to encode in the QR code.
 * @param detail - The error correction level for the QR code.
 * @returns A promise that resolves to a Canvas object containing the generated QR code.
 */
export async function generateQRCode(
  url: string,
  detail: QRCodeErrorCorrectionLevel
): Promise<Canvas> {
  const canvas = createCanvas(512, 512)
  await toCanvas(canvas, url, { margin: 1, width: 512, errorCorrectionLevel: detail })
  return canvas
}

/**
 * Adds a text overlay to the given canvas element.
 *
 * @param canvas - The canvas element to which the text overlay will be added.
 */
export function addTextOverlay(canvas: Canvas) {
  GlobalFonts.registerFromPath("./assets/fonts/Poppins-SemiBold.ttf", "Poppins")

  const ctx = canvas.getContext("2d")
  const rectMargin = 13
  const rectWidth = 145
  const rectHeight = 39
  const x = canvas.width - rectWidth - rectMargin
  const y = canvas.height - rectHeight - rectMargin
  ctx.clearRect(x, y, rectWidth, rectHeight)
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
}

/**
 * Compresses an image from a canvas element and converts it to the specified format.
 *
 * @returns A promise that resolves to a Buffer containing the compressed image data.
 */
export async function compressImage(canvas: Canvas, format: string): Promise<Buffer> {
  if (format === "jpeg" || format === "jpg") {
    return canvas.encode("jpeg", 80);
  }

  return canvas.encode("png");
}

/**
 * Generates an image of a QR code with optional watermark and compression.
 *
 * @param c - The context object.
 * @param url - The URL to encode in the QR code.
 * @param format - The image format, either "jpeg" or "png".
 * @param detail - The error correction level for the QR code.
 * @param name - The name of the generated image file.
 * @param watermark - Optional boolean to add a watermark to the image. Defaults to true.
 * @returns A promise that resolves with the generated image as a response body.
 * @throws Will throw an error if QR code generation or image compression fails.
 */
export async function generateImage(
  c: Context,
  url: string,
  format: string,
  detail: string,
  name: string,
  watermark = true,
  preview = false
) {
  try {
    const canvas = await generateQRCode(url, detail as QRCodeErrorCorrectionLevel)
    if (watermark) addTextOverlay(canvas)
    const compressedBuffer = await compressImage(canvas, format)
    const contentType = format === "jpeg" ? "image/jpeg" : "image/png"
    const sanitizedName = encodeURIComponent(name.trim())
    const fileName = `${sanitizedName}.${format === "jpeg" ? "jpg" : "png"}`

    // @ts-ignore
    return c.body(compressedBuffer, {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `${preview ? 'inline' : 'attachment'}; filename="${fileName}"`,
      },
    })
  } catch (error: any) {
    console.error("Error generating QR code:", error)
    return c.json({
      message: "Failed to generate QR code",
      error: error.message,
    }, 500)
  }
}
