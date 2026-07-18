/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from "react";
import { 
  Building2, User, Upload, ArrowRight, RotateCcw, Eye, Sparkles, CheckSquare, 
  FileText, ShieldCheck, Printer, Download, MessageSquare, AlertCircle, Loader2, HelpCircle 
} from "lucide-react";
import { Barcode, QRCode } from "./CustomVisuals";
import { SchoolData, ParticipantData, UploadedDocs, Registration } from "../types";

const VILLAGES = [
  "Baliti", "Batu Raya I", "Batu Raya II", "Jaman", "Kandui", "Ketapang", 
  "Majangkan", "Malungai", "Payang Ara", "Pelari", "Rarawa", "Sangkorang", 
  "Siwau", "Tapen Raya", "Tongka", "Walur"
];

const CABANG_LOMBA = [
  "Lagu Tradisional - Dongkoi Putra",
  "Lagu Tradisional - Dongkoi Putri",
  "Lagu Tradisional - Karungut Putra",
  "Lagu Tradisional - Karungut Putri",
  "Lagu Tradisional - Japen Putra",
  "Lagu Tradisional - Japen Putri",
  "Lagu Tradisional - Tari Daerah",
  "Paduan Suara - SD/MI",
  "Paduan Suara - SMP/SMA/SMK",
  "Vocal Solo - SD/MI",
  "Vocal Solo - SMP/SMA/SMK"
];

export const FormulirPendaftaran: React.FC<{ 
  onRegistrationSuccess: () => void;
  showToast: (message: string, type?: "success" | "error" | "info" | "warning") => void;
}> = ({ onRegistrationSuccess, showToast }) => {
  // Form State
  const [school, setSchool] = useState<SchoolData>({
    namaSekolah: "",
    jenjang: "SD/MI",
    alamat: "",
    namaPembina: "",
    nomorHP: "",
    email: ""
  });

  const [participant, setParticipant] = useState<ParticipantData>({
    namaPeserta: "",
    nisn: "",
    jenisKelamin: "Laki-laki",
    tanggalLahir: "",
    kecamatan: "Gunung Timang",
    desa: VILLAGES[0],
    pasFoto: ""
  });

  const [cabang, setCabang] = useState(CABANG_LOMBA[0]);
  
  // File uploads tracking
  const [uploads, setUploads] = useState<UploadedDocs>({});
  const [uploadNames, setUploadNames] = useState({
    partitur: "",
    lirik: "",
    suratTugas: "",
    pasFoto: ""
  });

  const [declarations, setDeclarations] = useState({
    dataCorrect: false,
    rulesAgreed: false
  });

  // UI Flow State
  const [isPreview, setIsPreview] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [successData, setSuccessData] = useState<Registration | null>(null);

  // AI Helpers State
  const [ocrLoading, setOcrLoading] = useState(false);
  const [aiValidating, setAiValidating] = useState(false);
  const [aiReport, setAiReport] = useState<{ isValid: boolean; warnings: string[]; suggestions: string[] } | null>(null);

  const fileInputRefs = {
    partitur: useRef<HTMLInputElement>(null),
    lirik: useRef<HTMLInputElement>(null),
    suratTugas: useRef<HTMLInputElement>(null),
    pasFoto: useRef<HTMLInputElement>(null),
    ocrDoc: useRef<HTMLInputElement>(null)
  };

  // Handle Input Changes
  const handleSchoolChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setSchool({ ...school, [e.target.name]: e.target.value });
  };

  const handleParticipantChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setParticipant({ ...participant, [e.target.name]: e.target.value });
  };

  // Convert uploaded file to base64
  const handleFileUpload = (field: keyof UploadedDocs, file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      setUploads(prev => ({ ...prev, [field]: reader.result as string }));
      setUploadNames(prev => ({ ...prev, [field]: file.name }));
    };
    reader.readAsDataURL(file);
  };

  // Drag-and-drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (field: keyof UploadedDocs, e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(field, e.dataTransfer.files[0]);
    }
  };

  // AI OCR Scan Simulation
  const triggerOcrScan = async (file: File) => {
    setOcrLoading(true);
    try {
      // Read file as base64
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = reader.result as string;
        const response = await fetch("/api/gemini/ocr", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ documentBase64: base64, documentType: file.type })
        });
        const result = await response.json();
        
        if (result.success && result.data) {
          const d = result.data;
          // Autofill extracted fields with smooth animation trigger
          if (d.namaSekolah) setSchool(prev => ({ ...prev, namaSekolah: d.namaSekolah }));
          if (d.jenjang) setSchool(prev => ({ ...prev, jenjang: d.jenjang }));
          if (d.alamat) setSchool(prev => ({ ...prev, alamat: d.alamat }));
          if (d.namaPembina) setSchool(prev => ({ ...prev, namaPembina: d.namaPembina }));
          if (d.namaPeserta) setParticipant(prev => ({ ...prev, namaPeserta: d.namaPeserta }));
          if (d.nisn) setParticipant(prev => ({ ...prev, nisn: d.nisn }));
          if (d.jenisKelamin) setParticipant(prev => ({ ...prev, jenisKelamin: d.jenisKelamin }));
          if (d.desa) setParticipant(prev => ({ ...prev, desa: d.desa }));
          
          showToast("✨ AI Sukses Mengekstrak Data! Formulir telah terisi secara otomatis.", "success");
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      showToast("Gagal melakukan pemindaian AI OCR.", "error");
    } finally {
      setOcrLoading(false);
    }
  };

  // AI Live Validation Analyzer
  const analyzeWithAI = async () => {
    if (!school.namaSekolah || !participant.namaPeserta || !participant.nisn) {
      showToast("Mohon lengkapi Nama Sekolah, Nama Peserta, dan NISN terlebih dahulu untuk dianalisis oleh AI.", "warning");
      return;
    }

    setAiValidating(true);
    setAiReport(null);
    try {
      const response = await fetch("/api/gemini/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataSekolah: school,
          dataPeserta: participant,
          cabangLomba: cabang
        })
      });
      const data = await response.json();
      if (data.success) {
        setAiReport({
          isValid: data.isValid,
          warnings: data.warnings,
          suggestions: data.suggestions
        });
        showToast("Validasi AI Selesai! Silakan lihat rekomendasi di bawah.", "info");
      }
    } catch (err) {
      showToast("Asisten AI sedang sibuk. Silakan ajukan validasi kembali.", "warning");
    } finally {
      setAiValidating(false);
    }
  };

  // Form Reset
  const handleReset = () => {
    if (confirm("Apakah Anda yakin ingin mengosongkan seluruh formulir?")) {
      setSchool({ namaSekolah: "", jenjang: "SD/MI", alamat: "", namaPembina: "", nomorHP: "", email: "" });
      setParticipant({ namaPeserta: "", nisn: "", jenisKelamin: "Laki-laki", tanggalLahir: "", kecamatan: "Gunung Timang", desa: VILLAGES[0], pasFoto: "" });
      setCabang(CABANG_LOMBA[0]);
      setUploads({});
      setUploadNames({ partitur: "", lirik: "", suratTugas: "", pasFoto: "" });
      setDeclarations({ dataCorrect: false, rulesAgreed: false });
      setAiReport(null);
    }
  };

  // Submit Handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declarations.dataCorrect || !declarations.rulesAgreed) {
      showToast("Harap centang lembar pernyataan keabsahan data dan kesediaan mengikuti aturan.", "warning");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/registrations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          dataSekolah: school,
          dataPeserta: participant,
          cabangLomba: cabang,
          uploads: {
            partitur: uploads.partitur ? "Ada" : "Tidak Ada",
            lirik: uploads.lirik ? "Ada" : "Tidak Ada",
            suratTugas: uploads.suratTugas ? "Ada" : "Tidak Ada",
            pasFoto: uploads.pasFoto ? "Ada" : "Tidak Ada"
          }
        })
      });
      const result = await response.json();
      if (result.success) {
        setSuccessData(result.data);
        onRegistrationSuccess(); // trigger stats reload
        showToast("Pendaftaran Anda berhasil dikirim!", "success");
      } else {
        showToast("Pendaftaran gagal: " + result.error, "error");
      }
    } catch (err) {
      showToast("Terjadi kesalahan sistem saat mengirim data.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  // Trigger browser print for Bukti PDF
  const handlePrint = () => {
    window.print();
  };

  // Form success screen
  if (successData) {
    const waPhone = "081346336706"; // Martan Sitaboyan
    const waText = encodeURIComponent(`Halo Panitia HUT RI 81 Gunung Timang, saya telah mendaftar online.\n\nNomor Peserta: ${successData.id}\nNama: ${successData.dataPeserta?.namaPeserta}\nAsal: ${successData.dataSekolah?.namaSekolah}\nCabang: ${successData.cabangLomba}\nStatus: Menunggu Verifikasi.\n\nMohon bantuannya untuk divalidasi. Terima kasih!`);
    const waLink = `https://wa.me/62${waPhone.substring(1)}?text=${waText}`;

    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in print:p-0">
        <div className="bg-white border border-slate-200 rounded-3xl p-6 relative overflow-hidden text-center shadow-sm print:border-none print:bg-white print:text-slate-900">
          {/* Confetti element */}
          <div className="absolute inset-0 bg-radial-gradient from-red-600/5 to-transparent pointer-events-none" />

          <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-4 border border-emerald-200 print:hidden">
            <ShieldCheck className="w-8 h-8" />
          </div>

          <h2 className="text-xl font-bold text-slate-900 mb-1 print:text-slate-900">Pendaftaran Berhasil Dikirim!</h2>
          <p className="text-xs text-slate-500 mb-6 print:text-slate-500">
            Berikut adalah bukti pendaftaran digital Anda. Harap simpan atau cetak berkas ini untuk verifikasi fisik.
          </p>

          {/* PRINTABLE BUKTI LAYOUT */}
          <div className="p-6 bg-slate-50 border border-slate-200 rounded-2xl text-left space-y-6 relative print:bg-white print:border-slate-300 print:text-slate-900">
            <div className="flex justify-between items-start border-b border-slate-200 pb-4 print:border-slate-300">
              <div>
                <span className="text-xxs uppercase tracking-wider text-red-600 font-bold">BUKTI PENDAFTARAN RESMI</span>
                <h3 className="text-lg font-bold text-slate-950 mt-0.5 print:text-slate-900">SI-HUT RI 81</h3>
                <p className="text-xxs text-slate-500 print:text-slate-500">Kecamatan Gunung Timang, Tahun 2026</p>
              </div>
              <div className="text-right">
                <span className="text-xxs text-slate-400 uppercase font-mono">Status Berkas</span>
                <div className="mt-1 px-3 py-1 bg-amber-500/10 text-amber-700 rounded-full border border-amber-500/20 font-bold text-xxs inline-block uppercase">
                  Menunggu Verifikasi
                </div>
              </div>
            </div>

            {/* Main credentials */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-3">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Nomor Peserta</label>
                  <p className="text-base font-bold text-amber-600 font-mono mt-0.5">{successData.id}</p>
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Nama Peserta</label>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 print:text-slate-900">{successData.dataPeserta?.namaPeserta}</p>
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">NISN</label>
                  <p className="text-xs text-slate-700 font-mono mt-0.5 print:text-slate-800">{successData.dataPeserta?.nisn}</p>
                </div>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Cabang Lomba</label>
                  <p className="text-sm font-semibold text-slate-900 mt-0.5 print:text-slate-900">{successData.cabangLomba}</p>
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Asal Sekolah</label>
                  <p className="text-xs text-slate-700 mt-0.5 print:text-slate-800">{successData.dataSekolah?.namaSekolah} ({successData.dataSekolah?.jenjang})</p>
                </div>
                <div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Tanggal Daftar</label>
                  <p className="text-xs text-slate-500 mt-0.5 print:text-slate-500">
                    {new Date(successData.tanggalDaftar).toLocaleString("id-ID", { dateStyle: "long", timeStyle: "short" })} WIB
                  </p>
                </div>
              </div>
            </div>

            {/* Visual Codes */}
            <div className="flex flex-col md:flex-row gap-4 justify-between items-center border-t border-slate-200 pt-6 print:border-slate-300">
              <div className="w-full md:w-auto">
                <Barcode value={successData.id} className="w-full" />
              </div>
              <div className="shrink-0">
                <QRCode value={successData.id} size={110} />
              </div>
            </div>
          </div>

          {/* Action Tools */}
          <div className="flex flex-wrap gap-3.5 justify-center mt-8 print:hidden">
            <button
              onClick={handlePrint}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-red-600/10 cursor-pointer"
            >
              <Printer className="w-4 h-4" /> Cetak Bukti
            </button>
            <button
              onClick={handlePrint} // Windows print directly supports saving as PDF
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold flex items-center gap-2 border border-slate-200 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Simpan PDF
            </button>
            <a
              href={waLink}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/10 cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" /> Kirim WhatsApp
            </a>
          </div>

          <div className="mt-6 print:hidden">
            <button
              onClick={() => setSuccessData(null)}
              className="text-xs text-slate-500 hover:text-slate-800 transition-colors font-semibold flex items-center gap-1 mx-auto cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" /> Daftarkan Murid Lain
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Active Preview Mode Card Toggle
  if (isPreview) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-fade-in">
        <div className="p-6 bg-white border border-slate-200 rounded-3xl relative shadow-sm text-left">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-4 border-b border-slate-100 pb-3">
            <Eye className="w-5 h-5 text-red-500" /> Pratinjau Lembar Pendaftaran
          </h2>

          <div className="space-y-6">
            {/* Sekolah */}
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3">
              <h4 className="text-xxs uppercase tracking-wider font-bold text-red-600">A. IDENTITAS SEKOLAH</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Nama Sekolah:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{school.namaSekolah || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Jenjang:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{school.jenjang}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-slate-500 font-medium">Alamat Sekolah:</span>
                  <p className="text-slate-800 mt-0.5">{school.alamat || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Nama Guru Pembina:</span>
                  <p className="text-slate-900 mt-0.5">{school.namaPembina || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Kontak Pembina (HP / Email):</span>
                  <p className="text-slate-900 mt-0.5">{school.nomorHP || "-"} / {school.email || "-"}</p>
                </div>
              </div>
            </div>

            {/* Peserta */}
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3">
              <h4 className="text-xxs uppercase tracking-wider font-bold text-red-600">B. BIODATA PESERTA</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Nama Lengkap Murid:</span>
                  <p className="text-slate-900 font-semibold mt-0.5">{participant.namaPeserta || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">NISN:</span>
                  <p className="text-slate-900 font-mono mt-0.5">{participant.nisn || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Jenis Kelamin:</span>
                  <p className="text-slate-900 mt-0.5">{participant.jenisKelamin}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Tanggal Lahir:</span>
                  <p className="text-slate-900 mt-0.5">{participant.tanggalLahir || "-"}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Wilayah Asal (Kecamatan / Desa):</span>
                  <p className="text-slate-900 mt-0.5">{participant.kecamatan} / {participant.desa}</p>
                </div>
              </div>
            </div>

            {/* Cabang */}
            <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl space-y-3">
              <h4 className="text-xxs uppercase tracking-wider font-bold text-red-600">C. CABANG LOMBA & DOKUMEN</h4>
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 font-medium">Cabang yang Diikuti:</span>
                  <p className="text-red-700 font-bold mt-0.5">{cabang}</p>
                </div>
                <div>
                  <span className="text-slate-500 font-medium">Lampiran Dokumen:</span>
                  <div className="flex flex-wrap gap-1.5 mt-1.5">
                    {uploadNames.partitur && <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 text-xxs rounded-md font-mono">Partitur</span>}
                    {uploadNames.lirik && <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 text-xxs rounded-md font-mono">Lirik</span>}
                    {uploadNames.suratTugas && <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 text-xxs rounded-md font-mono">Surat Tugas</span>}
                    {uploadNames.pasFoto && <span className="px-2.5 py-1 bg-red-100 border border-red-200 text-red-700 text-xxs rounded-md font-mono">Pas Foto</span>}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 mt-8">
            <button
              onClick={() => setIsPreview(false)}
              className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold cursor-pointer border border-slate-200 transition-colors"
            >
              Kembali Edit
            </button>
            <button
              onClick={(e) => {
                setIsPreview(false);
                handleSubmit(e);
              }}
              disabled={submitting}
              className="px-5 py-2.5 bg-red-600 hover:bg-red-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 cursor-pointer transition-colors shadow-sm"
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kirim Pendaftaran"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="max-w-3xl mx-auto space-y-6 animate-fade-in">
      
      {/* OCR scanner float-panel */}
      <div className="p-4 bg-gradient-to-r from-red-50 via-amber-50 to-white border border-red-100 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-amber-100 text-amber-700 rounded-2xl animate-pulse">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="text-left">
            <h4 className="font-bold text-slate-800 text-xs">Pendaftaran Cepat bertenaga AI</h4>
            <p className="text-xxs text-slate-500">Unggah foto Surat Tugas / Kartu Siswa untuk mengisi formulir otomatis dengan OCR Gemini.</p>
          </div>
        </div>
        <div className="relative shrink-0 w-full sm:w-auto">
          <input
            type="file"
            accept="image/*,application/pdf"
            ref={fileInputRefs.ocrDoc}
            onChange={(e) => e.target.files?.[0] && triggerOcrScan(e.target.files[0])}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => fileInputRefs.ocrDoc.current?.click()}
            disabled={ocrLoading}
            className="w-full px-4 py-2 bg-white hover:bg-slate-50 border border-slate-200 text-xs font-bold text-amber-700 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-1.5"
          >
            {ocrLoading ? <Loader2 className="w-4 h-4 animate-spin text-amber-500" /> : <Upload className="w-4 h-4" />}
            {ocrLoading ? "Memindai Dokumen..." : "Unggah Berkas AI OCR"}
          </button>
        </div>
      </div>

      {/* SECTION 1: DATA SEKOLAH */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-sm text-left">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-t-3xl" />
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-5">
          <Building2 className="w-4 h-4 text-red-600" /> 1. Data Sekolah Pendaftar
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Nama Sekolah</label>
            <input
              type="text"
              name="namaSekolah"
              required
              placeholder="Contoh: SMAN 1 Gunung Timang"
              value={school.namaSekolah}
              onChange={handleSchoolChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Jenjang Sekolah</label>
            <select
              name="jenjang"
              value={school.jenjang}
              onChange={handleSchoolChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800"
            >
              <option value="SD/MI">SD / MI</option>
              <option value="SMP">SMP</option>
              <option value="SMA">SMA</option>
              <option value="SMK">SMK</option>
            </select>
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Alamat Lengkap Sekolah</label>
            <input
              type="text"
              name="alamat"
              required
              placeholder="Tuliskan nama jalan, RT, atau desa"
              value={school.alamat}
              onChange={handleSchoolChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Nama Guru Pembina / Pelatih</label>
            <input
              type="text"
              name="namaPembina"
              required
              placeholder="Nama lengkap beserta gelar akademis"
              value={school.namaPembina}
              onChange={handleSchoolChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Nomor HP / WhatsApp Pembina</label>
            <input
              type="tel"
              name="nomorHP"
              required
              placeholder="Contoh: 0812-3456-7890"
              value={school.nomorHP}
              onChange={handleSchoolChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="md:col-span-2 space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Email Sekolah / Guru Pembina</label>
            <input
              type="email"
              name="email"
              required
              placeholder="Contoh: sdn1batuah@gmail.com"
              value={school.email}
              onChange={handleSchoolChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* SECTION 2: DATA PESERTA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-sm text-left">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-t-3xl" />
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-5">
          <User className="w-4 h-4 text-red-600" /> 2. Data Murid Peserta
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Nama Lengkap Murid</label>
            <input
              type="text"
              name="namaPeserta"
              required
              placeholder="Tulis nama sesuai akta lahir"
              value={participant.namaPeserta}
              onChange={handleParticipantChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">NISN (10 Digit)</label>
            <input
              type="text"
              name="nisn"
              required
              maxLength={10}
              placeholder="Contoh: 0098765432"
              value={participant.nisn}
              onChange={handleParticipantChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 placeholder-slate-400 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Jenis Kelamin</label>
            <div className="flex gap-4 p-2">
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="Laki-laki"
                  checked={participant.jenisKelamin === "Laki-laki"}
                  onChange={handleParticipantChange}
                  className="accent-red-600"
                />
                Laki-laki
              </label>
              <label className="flex items-center gap-1.5 text-xs text-slate-700 cursor-pointer">
                <input
                  type="radio"
                  name="jenisKelamin"
                  value="Perempuan"
                  checked={participant.jenisKelamin === "Perempuan"}
                  onChange={handleParticipantChange}
                  className="accent-red-600"
                />
                Perempuan
              </label>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Tanggal Lahir</label>
            <input
              type="date"
              name="tanggalLahir"
              required
              value={participant.tanggalLahir}
              onChange={handleParticipantChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Kecamatan Asal</label>
            <input
              type="text"
              name="kecamatan"
              disabled
              value={participant.kecamatan}
              className="w-full bg-slate-100 border border-slate-200 text-xs rounded-xl px-3.5 py-2.5 text-slate-500"
            />
          </div>

          <div className="space-y-1">
            <label className="text-xxs font-medium text-slate-500 uppercase tracking-wider">Desa Asal (Gunung Timang)</label>
            <select
              name="desa"
              value={participant.desa}
              onChange={handleParticipantChange}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800"
            >
              {VILLAGES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* SECTION 3: CABANG LOMBA */}
      <div className="bg-white border border-slate-200 rounded-3xl p-6 relative shadow-sm text-left">
        <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-t-3xl" />
        <h3 className="font-bold text-slate-800 text-sm flex items-center gap-2 mb-5">
          <FileText className="w-4 h-4 text-red-600" /> 3. Pemilihan Cabang Lomba
        </h3>

        <div className="space-y-4">
          <div className="space-y-1">
            <label className="text-xxs font-semibold text-slate-500 uppercase tracking-wider font-semibold text-amber-600">Kategori Cabang Lomba</label>
            <select
              value={cabang}
              onChange={(e) => setCabang(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-sm rounded-xl px-3.5 py-3 text-slate-800 font-semibold"
            >
              {CABANG_LOMBA.map((item) => (
                <option key={item} value={item}>
                  {item}
                </option>
              ))}
            </select>
          </div>

          {/* DRAG AND DROP FILE UPLOADS */}
          <div className="border-t border-slate-100 pt-4 mt-2">
            <label className="text-xxs font-semibold text-slate-500 uppercase tracking-wider block mb-3">Unggah Lampiran Pendukung (PDF/PNG/JPG)</label>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              {/* Partitur */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop("partitur", e)}
                className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:border-red-500/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-xl text-red-600 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800">Partitur / Not Angka</p>
                    <p className="text-xxs text-slate-500 max-w-[150px] truncate">{uploadNames.partitur || "Format: PDF/Gambar"}</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  ref={fileInputRefs.partitur}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("partitur", e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.partitur.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xxs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  Pilih
                </button>
              </div>

              {/* Lirik */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop("lirik", e)}
                className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:border-red-500/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-xl text-red-600 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800">Lirik Lagu (PDF/Doc)</p>
                    <p className="text-xxs text-slate-500 max-w-[150px] truncate">{uploadNames.lirik || "Maksimal 5 bait"}</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*,.doc,.docx"
                  ref={fileInputRefs.lirik}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("lirik", e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.lirik.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xxs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  Pilih
                </button>
              </div>

              {/* Surat Tugas */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop("suratTugas", e)}
                className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:border-red-500/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-xl text-red-600 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800">Surat Tugas Kepala Sekolah</p>
                    <p className="text-xxs text-slate-500 max-w-[150px] truncate">{uploadNames.suratTugas || "Tanda tangan basah & stempel"}</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept=".pdf,image/*"
                  ref={fileInputRefs.suratTugas}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("suratTugas", e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.suratTugas.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xxs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  Pilih
                </button>
              </div>

              {/* Pas Foto */}
              <div 
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop("pasFoto", e)}
                className="p-4 bg-slate-50 border border-dashed border-slate-200 rounded-2xl hover:border-red-500/40 transition-colors flex items-center justify-between gap-3"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-slate-200 rounded-xl text-red-600 shrink-0">
                    <Upload className="w-4 h-4" />
                  </div>
                  <div className="text-left">
                    <p className="text-xs font-semibold text-slate-800">Pas Foto Murid</p>
                    <p className="text-xxs text-slate-500 max-w-[150px] truncate">{uploadNames.pasFoto || "Latar belakang Merah"}</p>
                  </div>
                </div>
                <input
                  type="file"
                  accept="image/*"
                  ref={fileInputRefs.pasFoto}
                  onChange={(e) => e.target.files?.[0] && handleFileUpload("pasFoto", e.target.files[0])}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRefs.pasFoto.current?.click()}
                  className="px-3 py-1.5 bg-white hover:bg-slate-100 text-slate-700 rounded-lg text-xxs font-semibold border border-slate-200 transition-colors cursor-pointer"
                >
                  Pilih
                </button>
              </div>

            </div>
          </div>
        </div>
      </div>

      {/* AI ANALYSIS OUTPUT IF GENERATED */}
      {aiReport && (
        <div className={`p-5 rounded-2xl border text-left ${aiReport.isValid ? "bg-emerald-50 border-emerald-200" : "bg-amber-50 border-amber-200"} space-y-3`}>
          <div className="flex items-center gap-2">
            <Sparkles className={`w-4 h-4 ${aiReport.isValid ? "text-emerald-700" : "text-amber-700 animate-pulse"}`} />
            <h4 className={`text-xs font-bold uppercase tracking-wider ${aiReport.isValid ? "text-emerald-700" : "text-amber-700"}`}>
              Hasil Analisis Validasi AI Gemini
            </h4>
          </div>
          {aiReport.warnings.length > 0 && (
            <div className="space-y-1">
              <span className="text-xxs font-bold text-slate-600 uppercase">Peringatan:</span>
              <ul className="list-disc list-inside text-xs text-amber-800 space-y-0.5">
                {aiReport.warnings.map((w, idx) => (
                  <li key={idx}>{w}</li>
                ))}
              </ul>
            </div>
          )}
          <div className="space-y-1">
            <span className="text-xxs font-bold text-slate-600 uppercase">Saran AI:</span>
            <ul className="list-disc list-inside text-xs text-slate-700 space-y-0.5">
              {aiReport.suggestions.map((s, idx) => (
                <li key={idx}>{s}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      {/* STATEMENTS CHECKLIST */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl space-y-2.5 text-left shadow-xs">
        <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={declarations.dataCorrect}
            onChange={(e) => setDeclarations({ ...declarations, dataCorrect: e.target.checked })}
            className="mt-0.5 rounded-sm accent-red-600 cursor-pointer"
          />
          <span>Saya menyatakan dengan sesungguhnya bahwa seluruh data yang diisikan di atas adalah benar dan dapat dipertanggungjawabkan.</span>
        </label>
        <label className="flex items-start gap-3 text-xs text-slate-700 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={declarations.rulesAgreed}
            onChange={(e) => setDeclarations({ ...declarations, rulesAgreed: e.target.checked })}
            className="mt-0.5 rounded-sm accent-red-600 cursor-pointer"
          />
          <span>Saya bersedia mematuhi segala peraturan dan ketentuan teknis (Juknis) lomba yang telah ditetapkan panitia Kecamatan Gunung Timang.</span>
        </label>
      </div>

      {/* FOOTER BUTTONS */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-3 bg-white p-4 border border-slate-200 rounded-3xl shadow-sm">
        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={handleReset}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-700 rounded-xl text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" /> Reset Form
          </button>
          
          <button
            type="button"
            onClick={analyzeWithAI}
            disabled={aiValidating}
            className="w-full sm:w-auto px-5 py-2.5 bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-800 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
          >
            {aiValidating ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
            {aiValidating ? "Menganalisis..." : "Validasi AI"}
          </button>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => {
              if (!school.namaSekolah || !participant.namaPeserta) {
                showToast("Harap lengkapi formulir terlebih dahulu untuk menampilkan Pratinjau.", "warning");
                return;
              }
              setIsPreview(true);
            }}
            className="w-full sm:w-auto px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 rounded-xl text-xs font-semibold border border-slate-200 flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
          >
            <Eye className="w-3.5 h-3.5 text-red-600" /> Pratinjau
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="w-full sm:w-auto px-6 py-2.5 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-red-600/10 cursor-pointer transition-colors"
          >
            {submitting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <ArrowRight className="w-3.5 h-3.5" />}
            Daftar Sekarang
          </button>
        </div>
      </div>

    </form>
  );
};
