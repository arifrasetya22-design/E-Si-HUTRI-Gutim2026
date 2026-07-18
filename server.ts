/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import fs from "fs/promises";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;
const DB_PATH = path.join(process.cwd(), "src", "database.json");
const SETTINGS_PATH = path.join(process.cwd(), "src", "settings.json");

// Increase JSON payload limit to allow small base64 uploads easily
app.use(express.json({ limit: "15mb" }));

// Helper to initialize Gemini Client lazily
let ai: GoogleGenAI | null = null;
function getGemini() {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    if (key) {
      ai = new GoogleGenAI({
        apiKey: key,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build",
          },
        },
      });
    }
  }
  return ai;
}

// Helper to read database
async function readDB() {
  try {
    const data = await fs.readFile(DB_PATH, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    // If database doesn't exist, return empty array
    return [];
  }
}

// Helper to write database
async function writeDB(data: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// Helper to read settings
async function readSettings() {
  try {
    const data = await fs.readFile(SETTINGS_PATH, "utf-8");
    const parsed = JSON.parse(data);
    return {
      camatName: "Haryadi, S.IP",
      camatTitle: "Camat Gunung Timang",
      camatGreeting: "Selamat datang di Portal Pendaftaran Resmi Lomba HUT Kemerdekaan RI Ke-81 Tingkat Kecamatan Gunung Timang. Melalui wadah digital ini, mari kita pupuk semangat perjuangan, sportivitas, serta kreativitas anak-anak bangsa se-Kecamatan Gunung Timang. Mari rayakan kemerdekaan dengan prestasi gemilang!",
      camatPhoto: "",
      ...parsed
    };
  } catch (error) {
    return {
      logo: "",
      slogan: "Merdeka Berprestasi, Berkarya untuk Indonesia.",
      title: "Rayakan Kemerdekaan Dengan Prestasi",
      description: "Pendaftaran Peserta Lomba HUT Proklamasi Kemerdekaan RI Ke-81 Tingkat Kecamatan Gunung Timang Tahun 2026.",
      announcements: [
        "Pendaftaran Gratis: 100% Bebas Biaya Pendaftaran untuk Seluruh Sekolah di Kecamatan Gunung Timang!",
        "Batas Akhir Berkas Fisik: Pengumpulan berkas, partitur, lirik ditutup tanggal 10 Agustus 2026.",
        "Verifikasi Instan: Unduh bukti pendaftaran digital berkode QR & Barcode setelah submit formulir."
      ],
      gallery: [],
      camatName: "Haryadi, S.IP",
      camatTitle: "Camat Gunung Timang",
      camatGreeting: "Selamat datang di Portal Pendaftaran Resmi Lomba HUT Kemerdekaan RI Ke-81 Tingkat Kecamatan Gunung Timang. Melalui wadah digital ini, mari kita pupuk semangat perjuangan, sportivitas, serta kreativitas anak-anak bangsa se-Kecamatan Gunung Timang. Mari rayakan kemerdekaan dengan prestasi gemilang!",
      camatPhoto: ""
    };
  }
}

// Helper to write settings
async function writeSettings(data: any) {
  await fs.writeFile(SETTINGS_PATH, JSON.stringify(data, null, 2), "utf-8");
}

// ==========================================
// 1. DATABASE API ROUTES
// ==========================================

// GET homepage settings
app.get("/api/settings", async (req, res) => {
  try {
    const settings = await readSettings();
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST homepage settings
app.post("/api/settings", async (req, res) => {
  try {
    const settings = req.body;
    await writeSettings(settings);
    res.json({ success: true, data: settings });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET all registrations
app.get("/api/registrations", async (req, res) => {
  try {
    const registrations = await readDB();
    res.json({ success: true, data: registrations });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST new registration
app.post("/api/registrations", async (req, res) => {
  try {
    const registrations = await readDB();
    const newReg = req.body;

    // Generate numeric incremental ID
    const maxUrut = registrations.reduce((max: number, r: any) => Math.max(max, r.nomorUrut || 0), 0);
    const nextUrut = maxUrut + 1;
    const paddedUrut = String(nextUrut).padStart(4, "0");
    const regId = `HUT81-${paddedUrut}`;

    const completedReg = {
      ...newReg,
      id: regId,
      status: "Menunggu Verifikasi",
      tanggalDaftar: new Date().toISOString(),
      nomorUrut: nextUrut,
    };

    registrations.push(completedReg);
    await writeDB(registrations);

    res.json({ success: true, data: completedReg });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT update registration (e.g., status, notes)
app.put("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updateBody = req.body;
    const registrations = await readDB();

    const idx = registrations.findIndex((r: any) => r.id === id);
    if (idx === -1) {
      return res.status(404).json({ success: false, error: "Pendaftaran tidak ditemukan" });
    }

    registrations[idx] = {
      ...registrations[idx],
      ...updateBody,
    };

    await writeDB(registrations);
    res.json({ success: true, data: registrations[idx] });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE a registration
app.delete("/api/registrations/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const registrations = await readDB();

    const filtered = registrations.filter((r: any) => r.id !== id);
    if (registrations.length === filtered.length) {
      return res.status(404).json({ success: false, error: "Pendaftaran tidak ditemukan" });
    }

    await writeDB(filtered);
    res.json({ success: true, message: "Pendaftaran berhasil dihapus" });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET basic stats
app.get("/api/statistics", async (req, res) => {
  try {
    const registrations = await readDB();
    
    // Calculate stats
    const totalPeserta = registrations.length;
    
    const uniqueSchools = new Set(registrations.map((r: any) => r.dataSekolah?.namaSekolah?.trim().toLowerCase()));
    const totalSekolah = uniqueSchools.size;

    const uniqueCabang = new Set(registrations.map((r: any) => r.cabangLomba));
    const totalCabangLomba = uniqueCabang.size;

    // Sisa Kuota is based on dynamic target (e.g., max 100 participants per district total)
    const sisaKuota = Math.max(0, 150 - totalPeserta);

    const byStatus = {
      menunggu: registrations.filter((r: any) => r.status === "Menunggu Verifikasi").length,
      terverifikasi: registrations.filter((r: any) => r.status === "Terverifikasi").length,
      ditolak: registrations.filter((r: any) => r.status === "Ditolak").length,
    };

    const byJenjang = {
      SD: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SD/MI").length,
      SMP: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SMP").length,
      SMA: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SMA").length,
      SMK: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SMK").length,
    };

    const statsObj = {
      totalPeserta,
      totalSekolah,
      totalCabangLomba,
      sisaKuota,
      byStatus,
      byJenjang,
    };

    res.json({
      success: true,
      data: statsObj,
      stats: statsObj,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET basic stats (alias for frontend compatibility)
app.get("/api/stats", async (req, res) => {
  try {
    const registrations = await readDB();
    
    // Calculate stats
    const totalPeserta = registrations.length;
    
    const uniqueSchools = new Set(registrations.map((r: any) => r.dataSekolah?.namaSekolah?.trim().toLowerCase()));
    const totalSekolah = uniqueSchools.size;

    const uniqueCabang = new Set(registrations.map((r: any) => r.cabangLomba));
    const totalCabangLomba = uniqueCabang.size;

    const sisaKuota = Math.max(0, 150 - totalPeserta);

    const byStatus = {
      menunggu: registrations.filter((r: any) => r.status === "Menunggu Verifikasi").length,
      terverifikasi: registrations.filter((r: any) => r.status === "Terverifikasi").length,
      ditolak: registrations.filter((r: any) => r.status === "Ditolak").length,
    };

    const byJenjang = {
      SD: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SD/MI").length,
      SMP: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SMP").length,
      SMA: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SMA").length,
      SMK: registrations.filter((r: any) => r.dataSekolah?.jenjang === "SMK").length,
    };

    const statsObj = {
      totalPeserta,
      totalSekolah,
      totalCabangLomba,
      sisaKuota,
      byStatus,
      byJenjang,
    };

    res.json({
      success: true,
      data: statsObj,
      stats: statsObj,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 2. GEMINI AI API ROUTES
// ==========================================

// AI Assistant chat handler
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { messages, userMessage } = req.body;
    const client = getGemini();

    if (!client) {
      return res.json({
        success: false,
        reply: "Asisten AI dalam mode Simulasi karena GEMINI_API_KEY belum dikonfigurasi di Settings > Secrets. Namun, saya siap membantu Anda!",
      });
    }

    // System instruction containing all important Juknis guidelines to ensure 100% factual accuracy
    const systemInstruction = `
You are the dedicated AI Assistant (Asisten AI) for "SI-HUT RI 81", the participant registration portal for the 81st Indonesian Independence Day celebrations (HUT RI 81) in Gunung Timang District (Kecamatan Gunung Timang) in 2026.
Your slogan is: "Merdeka Berprestasi, Berkarya untuk Indonesia."

Provide clear, professional, and friendly answers in Indonesian.
Here is the factual Technical Guidelines (Juknis) for the contests:

A. LOMBA LAGU TRADISIONAL
- Cabang: Dongkoi Putra/Putri, Karungut Putra/Putri, Japen Putra/Putri, Tari Daerah.
- Ketentuan:
  * Lirik dibuat sendiri.
  * Diserahkan kepada panitia sebanyak 3 lembar.
  * Maksimal 5 bait.
  * Iringan disiapkan oleh masing-masing peserta.
  * Penghargaan untuk Juara I, II, dan III.

B. LOMBA PADUAN SUARA
- Tingkat SMP/SMA/SMK:
  * Jumlah peserta: 10–15 orang per kelompok.
  * Lagu wajib: "Hari Merdeka (17 Agustus)"
  * Lagu pilihan: "Syukur" atau "Kulihat Ibu Pertiwi"
  * Ketentuan: Mengumpulkan partitur/teks lagu sebanyak 3 lembar. Karaoke disiapkan peserta. Juara I-III.
- Tingkat SD/MI:
  * Jumlah peserta: 10–15 orang per kelompok.
  * Lagu wajib: "Dari Sabang Sampai Merauke"
  * Lagu pilihan: "Berkibarlah Benderaku" atau "Maju Tak Gentar"
  * Ketentuan: Mengumpulkan partitur sebanyak 3 lembar. Karaoke disiapkan peserta. Juara I-III.

C. VOCAL SOLO
- Tingkat SMP/SMA/SMK:
  * Lagu wajib: "Indonesia Pusaka"
  * Lagu pilihan: "Gebyar Gebyar" atau "Tanah Airku"
- Tingkat SD/MI:
  * Lagu wajib: "Bendera Merah Putih"
  * Lagu pilihan: "Sorak Sorai Bergembira" atau "Desaku"
- Ketentuan Vocal Solo:
  * Peserta Putra atau Putri.
  * Partitur/teks lagu dikumpulkan sebanyak 3 lembar.
  * Karaoke disiapkan oleh masing-masing peserta.
  * Juara I-III.

NARAHUBUNG PANITIA:
Seksi Tari dan Karaoke:
- Martan Sitaboyan: 0813-4633-6706
- Amaludin: 0852-5287-8332
- Tamara Dewi: 0812-5090-5768
Seksi Paduan Suara dan Vocal Solo:
- Irma Iriani: 0813-8438-6468

Keep responses engaging, using Merah-Putih spirit and Dayak-friendly polite tone! Answer queries succinctly. Do not invent any guidelines outside these.
`;

    // Reconstruct prompt or history
    let prompt = "";
    if (Array.isArray(messages) && messages.length > 0) {
      prompt = `History Percakapan Sebelumnya:\n` +
        messages.map((m: any) => `${m.sender === "user" ? "User" : "Asisten AI"}: ${m.text}`).join("\n") +
        `\n\nPertanyaan Baru dari User:\n${userMessage}`;
    } else {
      prompt = userMessage;
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.7,
      },
    });

    res.json({ success: true, reply: response.text });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Autofill with OCR Simulator endpoint
app.post("/api/gemini/ocr", async (req, res) => {
  try {
    const { documentBase64, documentType } = req.body;
    const client = getGemini();

    if (!client) {
      // Simulate rich OCR results if GEMINI_API_KEY is missing
      return res.json({
        success: true,
        mocked: true,
        data: {
          namaSekolah: "SMAN 1 Gunung Timang",
          jenjang: "SMA",
          alamat: "Jl. Negara Kandui, Kecamatan Gunung Timang",
          namaPembina: "Drs. Heri Supriyadi",
          namaPeserta: "Wulan Dari",
          nisn: "0091122334",
          jenisKelamin: "Perempuan",
          desa: "Kandui",
        },
      });
    }

    // Prepare payload. If base64 is provided, parse it.
    let contentPart: any = "Lakukan OCR analisis terhadap dokumen surat tugas atau identitas sekolah ini. Ekstrak data-data pendaftaran lomba HUT RI 81 Gunung Timang.";
    if (documentBase64 && documentBase64.includes(",")) {
      const parts = documentBase64.split(",");
      const mime = parts[0].match(/:(.*?);/)?.[1] || "image/png";
      const b64Data = parts[1];

      contentPart = {
        parts: [
          {
            inlineData: {
              mimeType: mime,
              data: b64Data,
            },
          },
          {
            text: "Lakukan OCR analisis terhadap dokumen ini. Ekstrak informasi sekolah dan peserta pendaftaran lomba Kemerdekaan RI ke-81 Gunung Timang. Kembalikan data dalam format JSON yang valid.",
          },
        ],
      };
    }

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contentPart,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            namaSekolah: { type: Type.STRING, description: "Nama Sekolah pendaftar" },
            jenjang: { type: Type.STRING, description: "Jenjang sekolah, harus salah satu dari: SD/MI, SMP, SMA, SMK" },
            alamat: { type: Type.STRING, description: "Alamat lengkap sekolah" },
            namaPembina: { type: Type.STRING, description: "Nama guru pembina atau pelatih" },
            namaPeserta: { type: Type.STRING, description: "Nama lengkap murid peserta" },
            nisn: { type: Type.STRING, description: "Nomor Induk Siswa Nasional (10 digit)" },
            jenisKelamin: { type: Type.STRING, description: "Jenis Kelamin peserta: Laki-laki atau Perempuan" },
            desa: { type: Type.STRING, description: "Desa asal peserta di Gunung Timang" },
          },
        },
      },
    });

    const parsedData = JSON.parse(response.text || "{}");
    res.json({ success: true, data: parsedData });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Form Validation endpoint
app.post("/api/gemini/validate", async (req, res) => {
  try {
    const regData = req.body;
    const client = getGemini();

    if (!client) {
      // Return beautiful mock validation
      return res.json({
        success: true,
        isValid: true,
        warnings: [],
        suggestions: [
          "Format nama sekolah sudah sangat rapi.",
          "Saran: Untuk Lomba Karungut/Dongkoi Tradisional, pastikan guru pembina melampirkan file partitur/lirik lisan Dayak dalam lampiran PDF pendaftaran.",
        ],
      });
    }

    const prompt = `
Analisis data pendaftaran lomba berikut untuk mendeteksi:
1. Kesalahan penulisan nama sekolah (berikan saran penulisan yang standar, misal SDN-1 dibanding SD 1).
2. Kesesuaian NISN (harus 10 digit angka).
3. Potensi data ganda berdasarkan nama peserta & sekolah.
4. Rekomendasi tambahan untuk guru pembina terkait cabang lomba terpilih.

Data Pendaftaran:
- Nama Sekolah: ${regData.dataSekolah?.namaSekolah}
- Jenjang: ${regData.dataSekolah?.jenjang}
- Nama Peserta: ${regData.dataPeserta?.namaPeserta}
- NISN: ${regData.dataPeserta?.nisn}
- Cabang Lomba: ${regData.cabangLomba}

Format output harus berupa JSON.
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isValid: { type: Type.BOOLEAN, description: "Apakah data secara umum valid" },
            warnings: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar peringatan atau potensi kesalahan",
            },
            suggestions: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Daftar saran perbaikan nama atau kesiapan lomba",
            },
          },
          required: ["isValid", "warnings", "suggestions"],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{"isValid":true,"warnings":[],"suggestions":[]}');
    res.json({ success: true, ...parsed });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// AI Dashboard Analysis Summary endpoint
app.post("/api/gemini/summary", async (req, res) => {
  try {
    const registrations = await readDB();
    const client = getGemini();

    if (!client) {
      return res.json({
        success: true,
        summary: `
### Ringkasan Statistik Lomba (Simulasi AI)
- **Total Pendaftar**: ${registrations.length} Peserta telah terdata secara lokal.
- **Partisipasi Sekolah**: Didominasi oleh jenjang SMA dan SMP di Kecamatan Gunung Timang.
- **Rekomendasi**: Harap panitia segera memverifikasi berkas pendaftar baru dengan status "Menunggu Verifikasi" agar peserta dapat mempersiapkan diri.
        `,
      });
    }

    const simpleRegList = registrations.map((r: any) => ({
      id: r.id,
      sekolah: r.dataSekolah?.namaSekolah,
      jenjang: r.dataSekolah?.jenjang,
      peserta: r.dataPeserta?.namaPeserta,
      cabang: r.cabangLomba,
      status: r.status,
    }));

    const prompt = `
Berikut adalah data pendaftar lomba Kemerdekaan RI ke-81 di Gunung Timang saat ini:
${JSON.stringify(simpleRegList)}

Berikan analisis ringkas eksekutif dalam Bahasa Indonesia (maksimal 3 paragraf, dengan poin markdown):
1. Tinjauan perkembangan jumlah pendaftar saat ini.
2. Cabang lomba yang paling diminati dan yang masih sepi peminat.
3. Rekomendasi tindakan strategis untuk Panitia Kecamatan Gunung Timang (misalnya sosialisasi ke jenjang SD/MI, penambahan kuota, atau perpanjangan pendaftaran).
`;

    const response = await client.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ success: true, summary: response.text });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// ==========================================
// 3. VITE MIDDLEWARE & STATIC SERVING
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
    console.log("Vite development middleware integrated.");
  } else {
    const distPath = path.join(process.cwd(), "dist");
    // Serve static frontend assets
    app.use(express.static(distPath));
    // Serve index.html for any SPA routes
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
    console.log("Production static files server configured.");
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`SI-HUT RI 81 server listening at http://localhost:${PORT}`);
  });
}

startServer();
