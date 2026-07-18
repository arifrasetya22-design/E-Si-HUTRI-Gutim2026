/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface SchoolData {
  namaSekolah: string;
  jenjang: "SD/MI" | "SMP" | "SMA" | "SMK";
  alamat: string;
  namaPembina: string;
  nomorHP: string;
  email: string;
}

export interface ParticipantData {
  namaPeserta: string;
  nisn: string;
  jenisKelamin: "Laki-laki" | "Perempuan";
  tanggalLahir: string;
  kecamatan: string;
  desa: string;
  pasFoto?: string; // base64 representation
}

export interface UploadedDocs {
  partitur?: string;    // base64 or status
  lirik?: string;       // base64 or status
  suratTugas?: string;  // base64 or status
  pasFoto?: string;     // base64 or status
}

export interface Registration {
  id: string; // Format: HUT81-XXXX
  dataSekolah: SchoolData;
  dataPeserta: ParticipantData;
  cabangLomba: string;
  uploads: UploadedDocs;
  status: "Menunggu Verifikasi" | "Terverifikasi" | "Ditolak";
  tanggalDaftar: string;
  nomorUrut: number;
  catatan?: string;
}

export interface JuknisItem {
  kategori: string;
  cabang: string[];
  ketentuan: string[];
  laguWajib?: string;
  laguPilihan?: string[];
  jumlahPeserta?: string;
}

export interface ContactItem {
  seksi: string;
  nama: string;
  phone: string;
}

export interface DashboardStats {
  totalPeserta: number;
  totalSekolah: number;
  totalCabangLomba: number;
  sisaKuota: number;
  byStatus: {
    menunggu: number;
    terverifikasi: number;
    ditolak: number;
  };
  byJenjang: {
    SD: number;
    SMP: number;
    SMA: number;
    SMK: number;
  };
}

export interface GalleryItem {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
}

export interface HomepageSettings {
  logo: string;
  slogan: string;
  title: string;
  description: string;
  announcements: string[];
  gallery: GalleryItem[];
  camatName?: string;
  camatTitle?: string;
  camatGreeting?: string;
  camatPhoto?: string;
}
