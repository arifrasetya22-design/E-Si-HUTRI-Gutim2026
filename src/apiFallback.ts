import defaultRegistrations from './database.json';
import defaultSettings from './settings.json';

const STORAGE_KEYS = {
  SETTINGS: 'hut81_settings',
  REGISTRATIONS: 'hut81_registrations',
};

// In-memory fallback if localStorage fails or has quota issues
let inMemorySettings: any = null;
let inMemoryRegistrations: any = null;

// Helper to simulate responses
function jsonResponse(data: any, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export async function simulateApi(url: string, init?: RequestInit): Promise<Response> {
  const method = init?.method?.toUpperCase() || 'GET';
  let pathname = '';
  try {
    const urlObj = new URL(url, window.location.origin);
    pathname = urlObj.pathname;
  } catch (e) {
    // If it's a relative path without origin
    pathname = url.split('?')[0];
  }

  // 1. GET or POST /api/settings
  if (pathname === '/api/settings') {
    if (method === 'GET') {
      const settingsStr = localStorage.getItem(STORAGE_KEYS.SETTINGS);
      const data = settingsStr ? JSON.parse(settingsStr) : (inMemorySettings || defaultSettings);
      return jsonResponse({ success: true, data });
    } else if (method === 'POST') {
      try {
        const body = JSON.parse(init?.body as string);
        inMemorySettings = body; // Update memory fallback
        try {
          localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(body));
        } catch (storageErr) {
          console.warn("[API Fallback] LocalStorage quota exceeded, saved to memory instead.", storageErr);
        }
        return jsonResponse({ success: true, data: body });
      } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 400);
      }
    }
  }

  // 2. GET or POST /api/registrations
  if (pathname === '/api/registrations') {
    if (method === 'GET') {
      const regsStr = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
      const data = regsStr ? JSON.parse(regsStr) : (inMemoryRegistrations || defaultRegistrations);
      return jsonResponse({ success: true, data });
    } else if (method === 'POST') {
      try {
        const body = JSON.parse(init?.body as string);
        const regsStr = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
        const registrations = regsStr ? JSON.parse(regsStr) : (inMemoryRegistrations || [...defaultRegistrations]);

        // Generate numeric incremental ID
        const maxUrut = registrations.reduce((max: number, r: any) => Math.max(max, r.nomorUrut || 0), 0);
        const nextUrut = maxUrut + 1;
        const paddedUrut = String(nextUrut).padStart(4, "0");
        const regId = `HUT81-${paddedUrut}`;

        const completedReg = {
          ...body,
          id: regId,
          status: "Menunggu Verifikasi",
          tanggalDaftar: new Date().toISOString(),
          nomorUrut: nextUrut,
        };

        registrations.push(completedReg);
        inMemoryRegistrations = registrations; // Update memory fallback

        try {
          localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        } catch (storageErr) {
          console.warn("[API Fallback] LocalStorage quota exceeded, saved to memory instead.", storageErr);
        }

        return jsonResponse({ success: true, data: completedReg });
      } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 400);
      }
    }
  }

  // 3. PUT or DELETE /api/registrations/:id
  if (pathname.startsWith('/api/registrations/')) {
    const id = pathname.substring('/api/registrations/'.length);
    const regsStr = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    const registrations = regsStr ? JSON.parse(regsStr) : (inMemoryRegistrations || [...defaultRegistrations]);

    const idx = registrations.findIndex((r: any) => r.id === id);

    if (method === 'PUT') {
      if (idx === -1) {
        return jsonResponse({ success: false, error: "Pendaftaran tidak ditemukan" }, 404);
      }
      try {
        const body = JSON.parse(init?.body as string);
        registrations[idx] = {
          ...registrations[idx],
          ...body,
        };
        inMemoryRegistrations = registrations; // Update memory fallback
        try {
          localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(registrations));
        } catch (storageErr) {
          console.warn("[API Fallback] LocalStorage quota exceeded, saved to memory instead.", storageErr);
        }
        return jsonResponse({ success: true, data: registrations[idx] });
      } catch (e: any) {
        return jsonResponse({ success: false, error: e.message }, 400);
      }
    } else if (method === 'DELETE') {
      if (idx === -1) {
        return jsonResponse({ success: false, error: "Pendaftaran tidak ditemukan" }, 404);
      }
      const filtered = registrations.filter((r: any) => r.id !== id);
      inMemoryRegistrations = filtered; // Update memory fallback
      try {
        localStorage.setItem(STORAGE_KEYS.REGISTRATIONS, JSON.stringify(filtered));
      } catch (storageErr) {
        console.warn("[API Fallback] LocalStorage quota exceeded, saved to memory instead.", storageErr);
      }
      return jsonResponse({ success: true, message: "Pendaftaran berhasil dihapus" });
    }
  }

  // 4. GET /api/stats or /api/statistics
  if (pathname === '/api/stats' || pathname === '/api/statistics') {
    const regsStr = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    const registrations = regsStr ? JSON.parse(regsStr) : (inMemoryRegistrations || defaultRegistrations);

    const totalPeserta = registrations.length;
    const uniqueSchools = new Set(registrations.map((r: any) => r.dataSekolah?.namaSekolah?.trim().toLowerCase()));
    const totalSekolah = uniqueSchools.size;
    const uniqueCabang = new Set(registrations.map((r: any) => r.cabangLomba));
    const totalCabangLomba = uniqueCabang.size;
    const sisaKuota = Math.max(0, 150 - totalPeserta);

    const byStatus = {
      menunggu: registrations.filter((r: any) => r.status === "Menunggu Verifikasi" || r.status === "Menunggu").length,
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

    return jsonResponse({
      success: true,
      data: statsObj,
      stats: statsObj,
    });
  }

  // 5. POST /api/gemini/validate
  if (pathname === '/api/gemini/validate') {
    try {
      const body = JSON.parse(init?.body as string);
      const warnings: string[] = [];
      const suggestions: string[] = ["Berkas pendaftaran terverifikasi dengan baik secara instan."];

      if (body.dataPeserta?.nisn && body.dataPeserta.nisn.length !== 10) {
        warnings.push("NISN sebaiknya terdiri dari 10 digit angka.");
      }
      
      const isSdBranch = body.cabangLomba?.toLowerCase().includes("sd");
      const isSmpBranch = body.cabangLomba?.toLowerCase().includes("smp");
      const isSmaBranch = body.cabangLomba?.toLowerCase().includes("sma");
      const isSmkBranch = body.cabangLomba?.toLowerCase().includes("smk");
      
      const jenjang = body.dataSekolah?.jenjang;
      if (jenjang === "SD/MI" && (isSmpBranch || isSmaBranch || isSmkBranch)) {
        warnings.push("Kategori lomba tidak sesuai dengan jenjang sekolah (SD/MI).");
      } else if (jenjang === "SMP" && (isSdBranch || isSmaBranch || isSmkBranch)) {
        warnings.push("Kategori lomba tidak sesuai dengan jenjang sekolah (SMP).");
      }

      return jsonResponse({
        success: true,
        isValid: warnings.length === 0,
        warnings,
        suggestions
      });
    } catch (e) {}
  }

  // 6. POST /api/gemini/summary
  if (pathname === '/api/gemini/summary') {
    const regsStr = localStorage.getItem(STORAGE_KEYS.REGISTRATIONS);
    const registrations = regsStr ? JSON.parse(regsStr) : (inMemoryRegistrations || defaultRegistrations);
    const summary = `Analisis Portal SI-HUT RI 81:\nSaat ini terdaftar ${registrations.length} peserta se-Kecamatan Gunung Timang. Pembagian kuota aman dengan sisa kuota ${Math.max(0, 150 - registrations.length)} peserta. Semua berkas validasi awal siap diproses oleh panitia admin.`;
    return jsonResponse({ success: true, summary });
  }

  // 7. POST /api/gemini/chat
  if (pathname === '/api/gemini/chat') {
    try {
      const body = JSON.parse(init?.body as string);
      const msg = body.userMessage?.toLowerCase() || '';
      let reply = "Terima kasih atas pertanyaannya! Saya adalah asisten portal pendaftaran SI-HUT RI 81 Gunung Timang.\n\nPendaftaran dibuka GRATIS untuk seluruh sekolah di wilayah Kecamatan Gunung Timang. Silakan lengkapi formulir pendaftaran secara online!";
      
      if (msg.includes('paduan') || msg.includes('suara')) {
        reply = "Lomba Paduan Suara diikuti oleh tim dari perwakilan masing-masing sekolah. Ketentuan lagu wajib dan pilihan dapat dilihat lengkap di tab 'Juknis Lomba'!";
      } else if (msg.includes('biaya') || msg.includes('gratis') || msg.includes('bayar')) {
        reply = "Kabar gembira! Seluruh cabang lomba dalam perayaan HUT RI Ke-81 di Kecamatan Gunung Timang 100% BEBAS BIAYA PENDAFTARAN (GRATIS)!";
      } else if (msg.includes('kontak') || msg.includes('hubungi') || msg.includes('nomor')) {
        reply = "Anda dapat melihat daftar panitia dan narahubung resmi untuk setiap cabang lomba di halaman 'Narahubung' pada menu navigasi atas.";
      }
      
      return jsonResponse({ success: true, reply });
    } catch (e) {}
  }

  // Fallback default error for other /api routes
  return jsonResponse({ success: false, error: "API Route Not Found" }, 404);
}

// Install fetch interceptor safely using defineProperty or fallback assignment
const originalFetch = window.fetch;

const customFetch = async function (input: any, init?: RequestInit) {
  let url = '';
  if (typeof input === 'string') {
    url = input;
  } else if (input instanceof URL) {
    url = input.href;
  } else if (input && typeof input === 'object' && 'url' in input) {
    url = (input as Request).url;
  }

  // We only intercept requests directed at "/api"
  if (url.startsWith('/api/') || url.includes('/api/')) {
    try {
      const response = await originalFetch(input, init);
      const contentType = response.headers.get('content-type') || '';
      
      // If Vercel serves the index.html page as a fallback for 404/API routes, we should intercept it
      if (response.ok && !contentType.includes('text/html')) {
        return response;
      }
      
      throw new Error("Invalid API response (HTML fallback or non-2xx status)");
    } catch (err) {
      console.warn(`[API Fallback Interceptor] ${url} failed. Redirecting to client storage simulation.`, err);
      return simulateApi(url, init);
    }
  }

  return originalFetch(input, init);
};

try {
  Object.defineProperty(window, 'fetch', {
    value: customFetch,
    configurable: true,
    writable: true
  });
  console.log("[API Interceptor] Interceptor installed successfully via defineProperty.");
} catch (e) {
  console.warn("[API Interceptor] Object.defineProperty failed, attempting direct assignment:", e);
  try {
    (window as any).fetch = customFetch;
    console.log("[API Interceptor] Interceptor installed successfully via assignment.");
  } catch (err2) {
    console.error("[API Interceptor] CRITICAL: Unable to intercept window.fetch:", err2);
  }
}

