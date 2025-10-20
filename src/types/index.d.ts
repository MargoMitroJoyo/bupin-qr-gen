export interface InfoUJN {
  kodeQRUjian: string
  idUjian: number
  namaJenjang: string
  namaKelas: string
  namaBab: string
  namaMapel: string
}

export interface InfoVID {
  kode_qr: string
  nama_jenjang: string
  nama_kelas: string
  nama_mapel: string
  nama_bab: string
  nama_sub_bab: string
}

export interface Book {
  id: number;
  title: string;
  slug: string;
  image: string | null;
  attachment: string | null;
  description: string | null;
  published_year: string | null;
  class: string | null;
  level: string | null;
  writer: string | null;
  reviewer: string | null;
  translator: string | null;
  adapter: string | null;
  designer: string | null;
  cover_designer: string | null;
  ilustrator: string | null;
  editor: string | null;
  aligner: string | null;
  publisher: string | null;
  contributor: string | null;
  language: string | null;
  context: string | null;
  subject: string | null;
  format: string | null;
  isbn: string | null;
  curriculum: string | null;
  collation: string | null;
  type: string | null;
  edition: string | null;
  unit: string | null;
  status: string | null;
  category: string | null;
  book_type: string | null;
  version: string | null;
  price_zone_1: number | null;
  price_zone_2: number | null;
  price_zone_3: number | null;
  price_zone_4: number | null;
  price_zone_5A: number | null;
  price_zone_5B: number | null;
  created_at: string | null;
  updated_at: string | null;
  deleted_at: string | null;
}