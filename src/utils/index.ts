import { prisma } from "../lib/db"
import { InfoUJN, InfoVID } from "../types"

/**
 * Fetches information from the UJN API using the provided QR code.
 *
 * @param {string} qrcode - The QR code to be used in the API request.
 * @returns {Promise<InfoUJN>} - A promise that resolves to the information fetched from the UJN API.
 * @throws {Error} - Throws an error if the data fetching fails.
 */
export async function fetchInfoUJN(qrcode: string): Promise<InfoUJN> {
  const info = await prisma.qrujian.findFirst({
    where: {
      kodeQRUjian: qrcode,
    },
    select: {
      kodeQRUjian: true,
      id_ujian: true,
      idJenjang: true,
      idKelas: true,
      idMapel: true,
      idBab: true,
      jenjang: {
        select: {
          namaJenjang: true,
        },
      },
      kelas: {
        select: {
          namaKelas: true,
        },
      },
      mapel: {
        select: {
          namaMapel: true,
        },
      },
      bab: {
        select: {
          namaBab: true,
        },
      },
    },
  })

  if (!info) {
    throw new Error("Failed to fetch data")
  }

  const data: InfoUJN = {
    kodeQRUjian: info.kodeQRUjian,
    idUjian: info.id_ujian,
    idJenjang: info.idJenjang,
    idKelas: info.idKelas,
    idMapel: info.idMapel,
    idBab: info.idBab,
    namaJenjang: info.jenjang.namaJenjang,
    namaKelas: info.kelas.namaKelas,
    namaBab: info.bab.namaBab,
    namaMapel: info.mapel.namaMapel,
  }

  return data
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
    where: {
      kodeQR: qrcode,
    },
    select: {
      kodeQR: true,
      idKelas: true,
      idMapel: true,
      idBab: true,
      idSubBab: true,
      tp: true,
      jenjang: {
        select: {
          namaJenjang: true,
        },
      },
      kelas: {
        select: {
          namaKelas: true,
        },
      },
      mapel: {
        select: {
          namaMapel: true,
        },
      },
      bab: {
        select: {
          namaBab: true,
        },
      },
      subbab: {
        select: {
          namaSubBab: true,
        },
      },
    },
  })

  if (!info) {
    throw new Error("Failed to fetch data")
  }

  const data: InfoVID = {
    kode_qr: info.kodeQR,
    nama_jenjang: info.jenjang.namaJenjang,
    nama_kelas: info.kelas.namaKelas,
    nama_mapel: info.mapel.namaMapel,
    nama_bab: info.bab.namaBab,
    nama_sub_bab: info.subbab.namaSubBab,
    id_kelas: info.idKelas,
    id_mapel: info.idMapel,
    id_bab: info.idBab,
    id_sub_bab: info.idSubBab,
    link_video: "",
    ytid: "",
    link_dmp: null,
    ytid_dmp: null,
    tp: "",
  }

  return data
}

/**
 * Extracts and returns the **JENJANG** and **KELAS** from the given input string.
 *
 * @param inputString - The input string containing the educational level and class.
 * @returns The extracted educational level and class as a string, or the original input string if no match is found.
 */
export function getJenjangKelas(inputString: string): string {
  const jenjangs = ["SD", "SMP", "SMA", "MI", "MTS", "SMK", "MA"]

  const regex = new RegExp(
    `\\b(${jenjangs.join("|")})(?:-)?\\s*(\\d+|VII|VIII|IX|X|XI|XII)\\b`,
    "i"
  )

  const match = inputString.match(regex)

  if (!match) {
    return inputString
  }

  const jenjang = match[1]
  const kelas = match[2]

  return `${jenjang} ${kelas}`
}

/**
 * Determines the **KURIKULUM** type based on the input string.
 *
 * @param inputString - The input string to be evaluated.
 * @returns The curriculum type as a string.
 */
export function getKurikulum(inputString: string): string {
  const string = inputString.toLowerCase()

  if (string.includes("merdeka")) {
    return "KURMER"
  } else if (string.includes("kma 143")) {
    return "KMA 143"
  } else if (string.includes("kma 183")) {
    return "KMA 143"
  } else if (string.includes("kma 347")) {
    return "KMA 143"
  } else if (string.includes("btq")) {
    return "BTQ"
  } else if (string.includes("2013")) {
    return "K13"
  }

  return "UNKNOWN"
}

/**
 * Extracts and formats a specific type and **BAB** number from the input string.
 *
 * @param inputString - The string to search for the keywords and number.
 * @returns A formatted string with the type and number, or the original input string if no match is found.
 */
export function getBab(inputString: string): string {
  const regex = /\b(?:bab|chapter|subtema|wulangan|unit)\s+(\d+)/i

  const match = inputString.toLowerCase().match(regex)

  if (!match) {
    return inputString
  }

  const type = inputString.toLowerCase().includes("subtema") ? "SUBTEMA" : "BAB"

  return `${type} ${match[1]}`
}

export function getSubBab(inputString: string): string {
  const regex = /[A-Z]\./

  if (inputString.includes("AKM")) {
    return "AKM"
  } else if (inputString.includes("P3")) {
    return "P3"
  }

  const match = inputString.toUpperCase().match(regex)

  if (!match) {
    return inputString
  }

  return `SUBBAB ${match[0].replace(".", "")}`
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
