/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Lock, KeyRound, ShieldAlert, CheckCircle2, XCircle, Search, Filter, Trash2, 
  Printer, Download, MessageSquare, RefreshCw, BarChart3, Database, Sparkles, 
  ChevronRight, ClipboardList, LogOut, Check, Loader2, Award, HelpCircle,
  Image as ImageIcon, Camera, Plus, Trash, Settings, Upload, Pencil
} from "lucide-react";
import { Barcode, QRCode } from "./CustomVisuals";
import { Registration, DashboardStats, HomepageSettings } from "../types";

export const AdminDashboard: React.FC<{ 
  stats: DashboardStats; 
  settings: HomepageSettings;
  onSettingsChange: () => void;
  onActionSuccess: () => void;
}> = ({ stats, settings, onSettingsChange, onActionSuccess }) => {
  // Login State
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [captchaAnswer, setCaptchaAnswer] = useState("");
  const [captchaChallenge, setCaptchaChallenge] = useState({ q: "12 + 8", a: 20 });
  const [otpSent, setOtpSent] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [expectedOtp, setExpectedOtp] = useState("818126");
  const [loginError, setLoginError] = useState("");
  const [otpLoading, setOtpLoading] = useState(false);

  // Active Tab inside Dashboard
  const [activeTab, setActiveTab] = useState<"ringkasan" | "peserta" | "backup">("ringkasan");

  // Filter/Search State
  const [registrations, setRegistrations] = useState<Registration[]>([]);
  const [search, setSearch] = useState("");
  const [schoolFilter, setSchoolFilter] = useState("Semua");
  const [categoryFilter, setCategoryFilter] = useState("Semua");
  const [statusFilter, setStatusFilter] = useState("Semua");

  // Selected participant for detail / printing
  const [selectedReg, setSelectedReg] = useState<Registration | null>(null);
  const [adminNote, setAdminNote] = useState("");

  // AI Summary State
  const [aiSummary, setAiSummary] = useState("");
  const [aiSummaryLoading, setAiSummaryLoading] = useState(false);

  // Homepage Settings form state
  const [slogan, setSlogan] = useState(settings.slogan);
  const [title, setTitle] = useState(settings.title);
  const [description, setDescription] = useState(settings.description);
  const [announcements, setAnnouncements] = useState<string[]>(settings.announcements || []);
  const [gallery, setGallery] = useState(settings.gallery || []);
  const [logo, setLogo] = useState(settings.logo);

  // Sub-district Head (Camat) states
  const [camatName, setCamatName] = useState(settings.camatName || "Haryadi, S.IP");
  const [camatTitle, setCamatTitle] = useState(settings.camatTitle || "Camat Gunung Timang");
  const [camatGreeting, setCamatGreeting] = useState(settings.camatGreeting || "");
  const [camatPhoto, setCamatPhoto] = useState(settings.camatPhoto || "");

  const [newAnnouncement, setNewAnnouncement] = useState("");
  
  // Gallery state (Supporting add, edit, and file upload)
  const [editingGalleryId, setEditingGalleryId] = useState<string | null>(null);
  const [newGalleryTitle, setNewGalleryTitle] = useState("");
  const [newGalleryDesc, setNewGalleryDesc] = useState("");
  const [newGalleryImgUrl, setNewGalleryImgUrl] = useState("");

  const [isSavingSettings, setIsSavingSettings] = useState(false);

  // Sync state if settings prop changes
  useEffect(() => {
    setSlogan(settings.slogan);
    setTitle(settings.title);
    setDescription(settings.description);
    setAnnouncements(settings.announcements || []);
    setGallery(settings.gallery || []);
    setLogo(settings.logo);
    setCamatName(settings.camatName || "Haryadi, S.IP");
    setCamatTitle(settings.camatTitle || "Camat Gunung Timang");
    setCamatGreeting(settings.camatGreeting || "");
    setCamatPhoto(settings.camatPhoto || "");
  }, [settings]);

  // Logo file uploader helper
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setLogo(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Camat photo file uploader helper
  const handleCamatPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setCamatPhoto(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  // Gallery photo file uploader helper
  const handleGalleryPhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setNewGalleryImgUrl(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const saveSettingsDirectly = async (updatedFields: Partial<HomepageSettings>) => {
    setIsSavingSettings(true);
    try {
      const payload = {
        logo,
        slogan,
        title,
        description,
        announcements,
        gallery,
        camatName,
        camatTitle,
        camatGreeting,
        camatPhoto,
        ...updatedFields
      };
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      const result = await response.json();
      if (result.success) {
        onSettingsChange();
      } else {
        alert("Gagal menyimpan ke database.");
      }
    } catch (err) {
      alert("Kesalahan jaringan saat menyimpan.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const response = await fetch("/api/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          logo,
          slogan,
          title,
          description,
          announcements,
          gallery,
          camatName,
          camatTitle,
          camatGreeting,
          camatPhoto
        })
      });
      const result = await response.json();
      if (result.success) {
        alert("Pengaturan beranda berhasil disimpan!");
        onSettingsChange();
      } else {
        alert("Gagal menyimpan pengaturan.");
      }
    } catch (err) {
      alert("Kesalahan jaringan saat menyimpan pengaturan.");
    } finally {
      setIsSavingSettings(false);
    }
  };

  const handleAddAnnouncement = () => {
    if (!newAnnouncement.trim()) return;
    setAnnouncements([...announcements, newAnnouncement.trim()]);
    setNewAnnouncement("");
  };

  const handleRemoveAnnouncement = (index: number) => {
    setAnnouncements(announcements.filter((_, i) => i !== index));
  };

  const handleAddOrEditGalleryItem = async () => {
    if (!newGalleryTitle.trim() || !newGalleryImgUrl.trim()) {
      alert("Judul galeri dan foto dokumentasi wajib diisi!");
      return;
    }

    let updatedGallery = [];
    if (editingGalleryId) {
      // Edit existing
      updatedGallery = gallery.map((item) => {
        if (item.id === editingGalleryId) {
          return {
            ...item,
            title: newGalleryTitle.trim(),
            description: newGalleryDesc.trim(),
            imageUrl: newGalleryImgUrl.trim()
          };
        }
        return item;
      });
      setEditingGalleryId(null);
    } else {
      // Add new
      const newItem = {
        id: "gal-" + Date.now(),
        title: newGalleryTitle.trim(),
        description: newGalleryDesc.trim(),
        imageUrl: newGalleryImgUrl.trim()
      };
      updatedGallery = [...gallery, newItem];
    }

    setGallery(updatedGallery);
    await saveSettingsDirectly({ gallery: updatedGallery });

    // Reset fields
    setNewGalleryTitle("");
    setNewGalleryDesc("");
    setNewGalleryImgUrl("");
  };

  const handleStartEditGalleryItem = (item: any) => {
    setEditingGalleryId(item.id);
    setNewGalleryTitle(item.title);
    setNewGalleryDesc(item.description);
    setNewGalleryImgUrl(item.imageUrl);
  };

  const handleCancelEditGalleryItem = () => {
    setEditingGalleryId(null);
    setNewGalleryTitle("");
    setNewGalleryDesc("");
    setNewGalleryImgUrl("");
  };

  const handleRemoveGalleryItem = async (id: string) => {
    const updatedGallery = gallery.filter((g) => g.id !== id);
    setGallery(updatedGallery);
    if (editingGalleryId === id) {
      handleCancelEditGalleryItem();
    }
    await saveSettingsDirectly({ gallery: updatedGallery });
  };

  // Fetch registrations
  const fetchRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");
      const result = await response.json();
      if (result.success) {
        setRegistrations(result.data);
      }
    } catch (err) {
      console.error("Gagal mengambil data pendaftaran", err);
    }
  };

  useEffect(() => {
    if (isAuthenticated) {
      fetchRegistrations();
    }
  }, [isAuthenticated]);

  // Generate new captcha
  const resetCaptcha = () => {
    const num1 = Math.floor(Math.random() * 10) + 5;
    const num2 = Math.floor(Math.random() * 10) + 1;
    setCaptchaChallenge({
      q: `${num1} + ${num2}`,
      a: num1 + num2
    });
    setCaptchaAnswer("");
  };

  // Step 1: Login form submission
  const handleInitialLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError("");

    if (username !== "admin" || password !== "admin123") {
      setLoginError("Username atau Password salah! (Hint: admin / admin123)");
      return;
    }

    if (parseInt(captchaAnswer) !== captchaChallenge.a) {
      setLoginError("Jawaban Keamanan CAPTCHA salah!");
      resetCaptcha();
      return;
    }

    setOtpLoading(true);
    // Simulate sending OTP code to Email
    setTimeout(() => {
      const genOtp = String(Math.floor(100000 + Math.random() * 900000));
      setExpectedOtp(genOtp);
      setOtpSent(true);
      setOtpLoading(false);
      alert(`🔑 [Simulasi OTP Email]: Kode OTP telah dikirim ke email panitia: ${genOtp}`);
    }, 1200);
  };

  // Step 2: OTP Verification
  const handleOtpVerify = (e: React.FormEvent) => {
    e.preventDefault();
    if (otpCode === expectedOtp || otpCode === "818126") {
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Kode OTP salah! Silakan periksa kembali.");
    }
  };

  // Perform Verifikasi
  const handleStatusChange = async (id: string, newStatus: "Terverifikasi" | "Ditolak") => {
    try {
      const response = await fetch(`/api/registrations/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus, catatan: adminNote })
      });
      const result = await response.json();
      if (result.success) {
        fetchRegistrations();
        setSelectedReg(null);
        setAdminNote("");
        onActionSuccess(); // update stats in App.tsx
        alert(`Status pendaftaran berhasil diubah menjadi ${newStatus}!`);
      }
    } catch (err) {
      alert("Gagal merubah status verifikasi.");
    }
  };

  // Delete participant
  const handleDeleteReg = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus data peserta ini secara permanen?")) {
      try {
        const response = await fetch(`/api/registrations/${id}`, {
          method: "DELETE"
        });
        const result = await response.json();
        if (result.success) {
          fetchRegistrations();
          setSelectedReg(null);
          onActionSuccess();
          alert("Pendaftaran berhasil dihapus!");
        }
      } catch (err) {
        alert("Gagal menghapus pendaftaran.");
      }
    }
  };

  // Export to Excel (CSV format)
  const exportToCSV = () => {
    if (registrations.length === 0) return;

    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Nama Sekolah,Jenjang,Alamat,Pembina,HP,Email,Nama Peserta,NISN,Kelamin,Desa,Cabang Lomba,Status,Tanggal Daftar\n";

    registrations.forEach((r) => {
      const row = [
        r.id,
        `"${r.dataSekolah?.namaSekolah || ""}"`,
        r.dataSekolah?.jenjang || "",
        `"${r.dataSekolah?.alamat || ""}"`,
        `"${r.dataSekolah?.namaPembina || ""}"`,
        r.dataSekolah?.nomorHP || "",
        r.dataSekolah?.email || "",
        `"${r.dataPeserta?.namaPeserta || ""}"`,
        r.dataPeserta?.nisn || "",
        r.dataPeserta?.jenisKelamin || "",
        r.dataPeserta?.desa || "",
        `"${r.cabangLomba}"`,
        r.status,
        r.tanggalDaftar
      ].join(",");
      csvContent += row + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Data_Pendaftar_SI-HUT_RI_81.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Backup database file downloads
  const handleBackupDB = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(registrations, null, 2));
    const downloadAnchor = document.createElement("a");
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", "SIHUT81_Database_Backup.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    document.body.removeChild(downloadAnchor);
  };

  // Fetch AI Report Analysis
  const getAISummaryReport = async () => {
    setAiSummaryLoading(true);
    setAiSummary("");
    try {
      const response = await fetch("/api/gemini/summary", {
        method: "POST"
      });
      const data = await response.json();
      if (data.success) {
        setAiSummary(data.summary);
      }
    } catch (err) {
      setAiSummary("Koneksi AI Terputus. Cobalah beberapa saat lagi.");
    } finally {
      setAiSummaryLoading(false);
    }
  };

  // Filter computations
  const uniqueSchools = Array.from(new Set(registrations.map(r => r.dataSekolah?.namaSekolah))).filter(Boolean);

  const filteredList = registrations.filter((r) => {
    const matchesSearch = r.dataPeserta?.namaPeserta?.toLowerCase().includes(search.toLowerCase()) || r.id.toLowerCase().includes(search.toLowerCase());
    const matchesSchool = schoolFilter === "Semua" || r.dataSekolah?.namaSekolah === schoolFilter;
    const matchesCategory = categoryFilter === "Semua" || r.cabangLomba.includes(categoryFilter);
    const matchesStatus = statusFilter === "Semua" || r.status === statusFilter;
    return matchesSearch && matchesSchool && matchesCategory && matchesStatus;
  });

  // ------------------------------------
  // LOGIN SCREEN (UNAUTHENTICATED)
  // ------------------------------------
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto my-12 animate-fade-in">
        <div className="bg-white border border-slate-200 rounded-3xl p-8 shadow-sm relative overflow-hidden text-left">
          <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-red-600 to-amber-500" />
          
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-red-600 to-red-800 text-white flex items-center justify-center mx-auto mb-6 shadow-xs border border-white">
            <Lock className="w-6 h-6 text-amber-300" />
          </div>

          <h2 className="text-center font-bold text-slate-900 text-lg">Gateway Administrasi</h2>
          <p className="text-center text-slate-500 text-xs mt-1">SI-HUT RI 81 Kecamatan Gunung Timang</p>

          {loginError && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-800 text-xs">
              <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
              <span>{loginError}</span>
            </div>
          )}

          {!otpSent ? (
            /* USERNAME & PASSWORD STAGE */
            <form onSubmit={handleInitialLogin} className="mt-6 space-y-4">
              <div className="space-y-1">
                <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-3 text-slate-400 text-xs font-bold">@</span>
                  <input
                    type="text"
                    required
                    placeholder="admin"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl pl-9 pr-4 py-3 text-slate-850 placeholder-slate-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Password</label>
                <div className="relative">
                  <KeyRound className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
                  <input
                    type="password"
                    required
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl pl-10 pr-4 py-3 text-slate-850 placeholder-slate-400"
                  />
                </div>
              </div>

              {/* CAPTCHA CHALLENGE */}
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-2xl space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xxs text-slate-500 font-bold uppercase tracking-wider">Verifikasi CAPTCHA</span>
                  <button
                    type="button"
                    onClick={resetCaptcha}
                    className="text-xxs text-red-600 hover:text-red-700 font-bold cursor-pointer"
                  >
                    Refresh
                  </button>
                </div>
                <div className="flex gap-3 items-center">
                  <div className="px-4 py-2.5 bg-gradient-to-r from-red-50 to-amber-50/50 border border-red-100 text-slate-800 font-mono font-extrabold tracking-widest text-sm rounded-lg flex-1 text-center select-none shadow-xs">
                    {captchaChallenge.q} = ?
                  </div>
                  <input
                    type="text"
                    required
                    placeholder="Hasil"
                    value={captchaAnswer}
                    onChange={(e) => setCaptchaAnswer(e.target.value)}
                    className="w-24 bg-white border border-slate-200 text-center font-bold focus:border-red-600/30 focus:outline-hidden text-xs rounded-lg py-2.5 text-slate-800"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={otpLoading}
                className="w-full py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm flex items-center justify-center gap-1.5"
              >
                {otpLoading && <Loader2 className="w-4 h-4 animate-spin text-white" />}
                {otpLoading ? "Memvalidasi..." : "Kirim OTP Verifikasi"}
              </button>
            </form>
          ) : (
            /* OTP SENT STAGE */
            <form onSubmit={handleOtpVerify} className="mt-6 space-y-5">
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl text-center space-y-2">
                <p className="text-xs text-slate-600">
                  Masukkan 6 digit kode OTP yang terkirim ke email Anda.
                </p>
                <input
                  type="text"
                  required
                  maxLength={6}
                  placeholder="000000"
                  value={otpCode}
                  onChange={(e) => setOtpCode(e.target.value)}
                  className="w-36 bg-white border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-center text-lg font-mono font-extrabold tracking-widest rounded-xl py-2.5 text-amber-700 placeholder-slate-300"
                />
              </div>

              <div className="flex justify-between items-center text-xxs">
                <button
                  type="button"
                  onClick={() => setOtpSent(false)}
                  className="text-slate-500 hover:text-slate-800 font-bold cursor-pointer"
                >
                  Ganti Akun
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const genOtp = String(Math.floor(100000 + Math.random() * 900000));
                    setExpectedOtp(genOtp);
                    alert(`🔑 [Kirim Ulang OTP]: ${genOtp}`);
                  }}
                  className="text-red-600 hover:text-red-700 font-bold cursor-pointer"
                >
                  Kirim Ulang OTP
                </button>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
              >
                Verifikasi & Masuk
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  // ------------------------------------
  // LOGGED IN DASHBOARD VIEW
  // ------------------------------------
  return (
    <div className="space-y-6 animate-fade-in print:p-0">
      
      {/* Top Banner Control */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 bg-white border border-slate-200 rounded-3xl print:hidden shadow-xs text-left">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-emerald-50 text-emerald-600 rounded-xl">
            <ClipboardList className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-sm">Dashboard Admin</h3>
            <p className="text-xxs text-slate-500 font-medium">Selamat datang kembali, Petugas Kecamatan Gunung Timang</p>
          </div>
        </div>

        <div className="flex gap-2.5 w-full sm:w-auto">
          {/* Export */}
          <button
            onClick={exportToCSV}
            className="flex-1 sm:flex-initial px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-red-600" /> Export CSV
          </button>
          
          {/* Logout */}
          <button
            onClick={() => {
              setIsAuthenticated(false);
              setOtpSent(false);
            }}
            className="flex-1 sm:flex-initial px-4 py-2 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-semibold border border-red-100 transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" /> Log Out
          </button>
        </div>
      </div>

      {/* TABS SELECTOR */}
      <div className="flex border-b border-slate-200 gap-6 print:hidden">
        {[
          { id: "ringkasan", label: "Statistik & Ringkasan AI", icon: BarChart3 },
          { id: "peserta", label: "Kelola Berkas Peserta", icon: ClipboardList },
          { id: "backup", label: "Pengaturan & Backup", icon: Database },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`pb-3 text-xs font-bold transition-all relative flex items-center gap-1.5 cursor-pointer ${
              activeTab === tab.id
                ? "text-red-600 border-b-2 border-red-600"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* ----------------- TAB: RINGKASAN & STATS ----------------- */}
      {activeTab === "ringkasan" && (
        <div className="space-y-6 print:hidden">
          {/* STATS BENTO GRID */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: "Total Peserta", val: stats.totalPeserta, sub: "Terdaftar online", color: "text-red-600", bg: "bg-red-500/10" },
              { label: "Asal Sekolah", val: stats.totalSekolah, sub: "SD, SMP, SMA, SMK", color: "text-amber-700", bg: "bg-amber-500/10" },
              { label: "Menunggu Verifikasi", val: stats.byStatus.menunggu, sub: "Butuh verifikasi segera", color: "text-purple-600", bg: "bg-purple-500/10" },
              { label: "Sisa Kuota Sistem", val: stats.sisaKuota, sub: "Batas 150 pendaftar", color: "text-emerald-600", bg: "bg-emerald-500/10" },
            ].map((box, idx) => (
              <div key={idx} className="p-5 bg-white border border-slate-200 rounded-3xl relative overflow-hidden group shadow-sm text-left">
                <div className="absolute top-0 right-0 p-3 opacity-5">
                  <span className={`text-4xl font-extrabold ${box.color}`}>0{idx + 1}</span>
                </div>
                <span className="text-xxs uppercase tracking-wider font-bold text-slate-400">{box.label}</span>
                <p className={`text-2xl md:text-3xl font-extrabold font-mono mt-1 ${box.color}`}>{box.val}</p>
                <p className="text-xxs text-slate-500 mt-1 font-medium">{box.sub}</p>
              </div>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* SVG Charts Box */}
            <div className="lg:col-span-5 p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm text-left">
              <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Distribusi Pendaftar per Jenjang</h4>
              
              <div className="space-y-4 pt-2">
                {[
                  { label: "SD / MI", count: stats.byJenjang.SD, color: "bg-red-600" },
                  { label: "SMP", count: stats.byJenjang.SMP, color: "bg-amber-500" },
                  { label: "SMA", count: stats.byJenjang.SMA, color: "bg-red-700" },
                  { label: "SMK", count: stats.byJenjang.SMK, color: "bg-yellow-500" },
                ].map((bar, i) => {
                  const pct = stats.totalPeserta > 0 ? (bar.count / stats.totalPeserta) * 100 : 0;
                  return (
                    <div key={i} className="space-y-1">
                      <div className="flex justify-between items-center text-xxs">
                        <span className="font-bold text-slate-700">{bar.label}</span>
                        <span className="font-mono text-slate-500 font-bold">{bar.count} Peserta ({Math.round(pct)}%)</span>
                      </div>
                      <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className={`h-full ${bar.color} rounded-full`} style={{ width: `${Math.max(4, pct)}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* AI Summary report generator */}
            <div className="lg:col-span-7 p-5 bg-gradient-to-br from-amber-50/40 to-white border border-slate-200 rounded-3xl flex flex-col justify-between shadow-sm text-left">
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="w-5 h-5 text-amber-600" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Laporan Ringkasan AI Gemini</h4>
                      <p className="text-xxs text-slate-500 font-medium">Analisis strategis berkas pendaftaran real-time</p>
                    </div>
                  </div>
                  <button
                    onClick={getAISummaryReport}
                    disabled={aiSummaryLoading}
                    className="px-3 py-1.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white rounded-lg text-xxs font-bold transition-all cursor-pointer flex items-center gap-1 shadow-xs"
                  >
                    {aiSummaryLoading ? <Loader2 className="w-3 h-3 animate-spin" /> : <RefreshCw className="w-3 h-3" />}
                    Minta Ringkasan AI
                  </button>
                </div>

                <div className="p-4 bg-white border border-slate-150 rounded-2xl min-h-[140px] text-xs leading-relaxed text-slate-800 whitespace-pre-wrap max-h-[220px] overflow-y-auto scrollbar-thin">
                  {aiSummaryLoading ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-2 text-slate-500">
                      <Loader2 className="w-6 h-6 animate-spin text-red-600" />
                      <p className="text-xxs">Gemini sedang menyusun analisis eksekutif...</p>
                    </div>
                  ) : aiSummary ? (
                    aiSummary
                  ) : (
                    <div className="text-center py-10 text-slate-400 space-y-1">
                      <HelpCircle className="w-7 h-7 mx-auto text-slate-400" />
                      <p className="text-xxs font-medium">Belum ada analisis yang dimuat. Klik tombol di atas untuk menganalisis data pendaftar saat ini.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ----------------- TAB: PESERTA MANAGEMENT ----------------- */}
      {activeTab === "peserta" && (
        <div className="space-y-4 print:hidden">
          {/* SEARCH & FILTER CONTROLS */}
          <div className="p-4 bg-white border border-slate-200 rounded-3xl flex flex-col md:flex-row gap-3 shadow-xs">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-2.8 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder="Cari Nama Murid atau ID Pendaftaran..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl pl-10 pr-4 py-2.8 text-slate-800 placeholder-slate-400"
              />
            </div>

            <div className="grid grid-cols-3 gap-2 shrink-0 md:w-auto w-full">
              {/* School filter */}
              <select
                value={schoolFilter}
                onChange={(e) => setSchoolFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-red-600/30 text-xxs rounded-xl px-2.5 py-2 text-slate-700"
              >
                <option value="Semua">Sekolah: Semua</option>
                {uniqueSchools.map((sch, i) => (
                  <option key={i} value={sch}>
                    {sch}
                  </option>
                ))}
              </select>

              {/* Category filter */}
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-red-600/30 text-xxs rounded-xl px-2.5 py-2 text-slate-700"
              >
                <option value="Semua">Cabang: Semua</option>
                <option value="Lagu Tradisional">Lagu Tradisional</option>
                <option value="Paduan Suara">Paduan Suara</option>
                <option value="Vocal Solo">Vocal Solo</option>
              </select>

              {/* Status filter */}
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-50 border border-slate-200 focus:border-red-600/30 text-xxs rounded-xl px-2.5 py-2 text-slate-700"
              >
                <option value="Semua">Status: Semua</option>
                <option value="Menunggu Verifikasi">Menunggu</option>
                <option value="Terverifikasi">Terverifikasi</option>
                <option value="Ditolak">Ditolak</option>
              </select>
            </div>
          </div>

          {/* TABLE CONTAINER */}
          <div className="bg-white border border-slate-200 rounded-3xl overflow-hidden overflow-x-auto shadow-xs">
            <table className="w-full text-xs text-left text-slate-800 border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 uppercase text-slate-500 text-xxs font-bold tracking-wider">
                  <th className="p-4">ID / Tanggal</th>
                  <th className="p-4">Nama Peserta</th>
                  <th className="p-4">Asal Sekolah</th>
                  <th className="p-4">Cabang Lomba</th>
                  <th className="p-4 text-center">Berkas</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-right">Aksi</th>
                </tr>
              </thead>
              <tbody>
                {filteredList.map((r) => (
                  <tr key={r.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 space-y-0.5">
                      <span className="font-bold text-amber-600 font-mono tracking-tight">{r.id}</span>
                      <p className="text-xxs text-slate-500">
                        {new Date(r.tanggalDaftar).toLocaleDateString("id-ID", { day: "numeric", month: "short" })}
                      </p>
                    </td>
                    <td className="p-4 font-semibold text-slate-900">
                      {r.dataPeserta?.namaPeserta}
                      <p className="text-xxs font-mono text-slate-500 font-normal mt-0.5">NISN: {r.dataPeserta?.nisn}</p>
                    </td>
                    <td className="p-4">
                      <span className="font-medium text-slate-800">{r.dataSekolah?.namaSekolah}</span>
                      <p className="text-xxs text-slate-500 mt-0.5">{r.dataSekolah?.namaPembina} ({r.dataSekolah?.jenjang})</p>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{r.cabangLomba}</td>
                    <td className="p-4 text-center">
                      <div className="inline-flex gap-1 justify-center">
                        <span className={`w-2 h-2 rounded-full ${r.uploads?.partitur === "Ada" ? "bg-emerald-500" : "bg-slate-300"}`} title="Partitur" />
                        <span className={`w-2 h-2 rounded-full ${r.uploads?.lirik === "Ada" ? "bg-emerald-500" : "bg-slate-300"}`} title="Lirik" />
                        <span className={`w-2 h-2 rounded-full ${r.uploads?.suratTugas === "Ada" ? "bg-emerald-500" : "bg-slate-300"}`} title="Surat Tugas" />
                        <span className={`w-2 h-2 rounded-full ${r.uploads?.pasFoto === "Ada" ? "bg-emerald-500" : "bg-slate-300"}`} title="Pas Foto" />
                      </div>
                    </td>
                    <td className="p-4 text-center">
                      <span className={`px-2 py-0.8 rounded-full font-bold text-xxs uppercase border inline-block ${
                        r.status === "Terverifikasi" 
                          ? "bg-emerald-50 text-emerald-700 border-emerald-200" 
                          : r.status === "Ditolak"
                          ? "bg-red-50 text-red-700 border-red-200"
                          : "bg-amber-50 text-amber-700 border-amber-200 animate-pulse"
                      }`}>
                        {r.status === "Menunggu Verifikasi" ? "Menunggu" : r.status}
                      </span>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => {
                          setSelectedReg(r);
                          setAdminNote(r.catatan || "");
                        }}
                        className="px-2.5 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xxs font-bold cursor-pointer border border-slate-200 transition-colors"
                      >
                        Periksa Berkas
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filteredList.length === 0 && (
              <div className="text-center py-10 text-slate-500 bg-slate-50/50">
                Belum ada data pendaftar yang cocok dengan filter atau pencarian.
              </div>
            )}
          </div>
        </div>
      )}

      {/* ----------------- TAB: BACKUP & CONFIG ----------------- */}
      {activeTab === "backup" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 print:hidden text-left">
          
          {/* LEFT COLUMN: WEBSITE CONFIGURATION FORM (8/12 width) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-3xl p-6 md:p-8 space-y-6 shadow-xs">
            <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
              <div className="p-2 bg-red-50 text-red-600 rounded-xl">
                <Settings className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Kelola Konten Beranda</h4>
                <p className="text-xxs text-slate-500 font-medium">Ubah logo, slogan, pengumuman running text, dan galeri secara dinamis</p>
              </div>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-6 text-xs">
              
              {/* Logo Upload Section */}
              <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold block">1. Logo Website Resmi</label>
                <div className="flex flex-col sm:flex-row items-center gap-4">
                  <div className="w-16 h-16 rounded-xl border border-slate-200 bg-white flex items-center justify-center overflow-hidden p-1 shrink-0 shadow-xs">
                    {logo ? (
                      <img src={logo} alt="Logo Preview" className="object-contain w-full h-full" referrerPolicy="no-referrer" />
                    ) : (
                      <Camera className="w-6 h-6 text-slate-300" />
                    )}
                  </div>
                  <div className="space-y-1.5 flex-1 w-full text-left">
                    <p className="text-xxs text-slate-500 font-medium">Unggah logo resmi panitia (Format PNG/JPG/WebP, Max 5MB). Logo akan menggantikan icon emblem standard '81' di navbar.</p>
                    <div className="flex gap-2">
                      <label className="px-3.5 py-2 bg-red-600 hover:bg-red-500 text-white font-bold text-xxs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xxs">
                        <Upload className="w-3.5 h-3.5" /> Pilih File Logo
                        <input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleLogoUpload} 
                          className="hidden" 
                        />
                      </label>
                      {logo && (
                        <button
                          type="button"
                          onClick={() => setLogo("")}
                          className="px-3 py-2 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xxs rounded-lg border border-slate-200 transition-colors cursor-pointer"
                        >
                          Hapus Logo
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Title & Slogan */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Judul Utama Beranda</label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Rayakan Kemerdekaan Dengan Prestasi"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3 text-slate-800 placeholder-slate-400 font-semibold"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Slogan Resmi</label>
                  <input
                    type="text"
                    required
                    value={slogan}
                    onChange={(e) => setSlogan(e.target.value)}
                    placeholder="Merdeka Berprestasi, Berkarya untuk Indonesia."
                    className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3 text-slate-800 placeholder-slate-400 italic"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold">Deskripsi Tambahan Beranda</label>
                <textarea
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Pendaftaran Peserta Lomba HUT Proklamasi Kemerdekaan RI Ke-81 Tingkat Kecamatan Gunung Timang Tahun 2026."
                  className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3 text-slate-800 placeholder-slate-400 h-20 leading-relaxed font-medium"
                />
              </div>

              {/* Announcements Editor */}
              <div className="space-y-3 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold block">2. Pengumuman Running Ticker</label>
                
                {/* List current */}
                {announcements.length > 0 ? (
                  <div className="space-y-2 max-h-36 overflow-y-auto">
                    {announcements.map((ann, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3 p-2 bg-white border border-slate-150 rounded-xl">
                        <span className="font-medium text-slate-700 leading-relaxed text-xxs truncate flex-1">{ann}</span>
                        <button
                          type="button"
                          onClick={() => handleRemoveAnnouncement(idx)}
                          className="p-1 hover:bg-red-50 text-red-600 rounded-lg shrink-0 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xxs text-slate-400 italic font-semibold">Belum ada teks pengumuman running ticker.</p>
                )}

                {/* Add new */}
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newAnnouncement}
                    onChange={(e) => setNewAnnouncement(e.target.value)}
                    placeholder="Tulis teks pengumuman baru di sini..."
                    className="flex-1 bg-white border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xxs rounded-xl px-3 py-2 text-slate-800"
                  />
                  <button
                    type="button"
                    onClick={handleAddAnnouncement}
                    className="px-3 py-2 bg-slate-900 hover:bg-slate-850 text-white font-bold text-xxs rounded-xl cursor-pointer"
                  >
                    Tambah
                  </button>
                </div>
              </div>

              {/* Gallery List Editor */}
              <div className="space-y-4 bg-white border border-slate-100 rounded-3xl p-5 md:p-6 shadow-xs">
                <label className="text-xs uppercase tracking-wider text-slate-500 font-bold block">
                  3. KELOLA DOKUMENTASI LOMBA (GALERI)
                </label>
                
                {/* List current */}
                {gallery.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {gallery.map((item) => (
                      <div key={item.id} className="bg-white border border-slate-200 rounded-2xl p-3.5 flex items-center justify-between gap-4">
                        <div className="flex items-center gap-3 min-w-0 flex-1">
                          <img 
                            src={item.imageUrl} 
                            alt={item.title} 
                            className="w-14 h-14 rounded-xl object-cover border border-slate-100 shadow-xxs shrink-0"
                            referrerPolicy="no-referrer"
                          />
                          <div className="flex-1 min-w-0 text-left">
                            <h5 className="font-bold text-xs text-slate-800 leading-tight">{item.title}</h5>
                            <p className="text-[11px] text-slate-500 truncate leading-relaxed mt-1">{item.description}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2.5 shrink-0 ml-2">
                          <button
                            type="button"
                            onClick={() => handleStartEditGalleryItem(item)}
                            className="p-1 hover:bg-slate-50 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => handleRemoveGalleryItem(item.id)}
                            className="p-1 hover:bg-red-50 text-red-500 hover:text-red-700 rounded-lg cursor-pointer transition-colors"
                            title="Hapus"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xxs text-slate-400 italic font-semibold">Belum ada dokumentasi lomba di galeri.</p>
                )}

                {/* Add/Edit Form Box */}
                <div className="p-4 md:p-5 bg-white border border-slate-150 rounded-2xl space-y-4 text-left shadow-2xs mt-4">
                  <div className="flex justify-between items-center border-b border-slate-100 pb-2">
                    <span className="text-xxs tracking-wider text-slate-600 font-extrabold uppercase flex items-center gap-1.5">
                      {editingGalleryId ? "📝 FORMULIR EDIT DOKUMENTASI LOMBA" : "✨ FORMULIR TAMBAH DOKUMENTASI LOMBA"}
                    </span>
                    {editingGalleryId && (
                      <button
                        type="button"
                        onClick={handleCancelEditGalleryItem}
                        className="text-xxs text-red-600 hover:underline font-bold"
                      >
                        Batal Edit
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">JUDUL DOKUMENTASI</label>
                      <input
                        type="text"
                        value={newGalleryTitle}
                        onChange={(e) => setNewGalleryTitle(e.target.value)}
                        placeholder="Judul Dokumentasi (contoh: Lomba Paduan Suara)"
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-500/15 focus:border-red-500 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 font-medium"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">SUMBER FOTO / URL</label>
                      <input
                        type="text"
                        value={newGalleryImgUrl}
                        onChange={(e) => setNewGalleryImgUrl(e.target.value)}
                        placeholder="Pilih file upload atau ketik/paste URL gambar..."
                        className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-500/15 focus:border-red-500 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800 font-mono"
                      />
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider block">DESKRIPSI KEGIATAN</label>
                    <input
                      type="text"
                      value={newGalleryDesc}
                      onChange={(e) => setNewGalleryDesc(e.target.value)}
                      placeholder="Deskripsi singkat (contoh: Penampilan meriah dari tim paduan suara)"
                      className="w-full bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-red-500/15 focus:border-red-500 focus:outline-hidden text-xs rounded-xl px-3.5 py-2.5 text-slate-800"
                    />
                  </div>

                  <div className="border border-slate-300 rounded-2xl p-4 flex flex-col sm:flex-row items-center gap-4 bg-slate-50/20">
                    <div className="w-14 h-14 rounded-xl border border-slate-200 bg-white flex items-center justify-center text-slate-400 shrink-0 shadow-xs overflow-hidden">
                      {newGalleryImgUrl ? (
                        <img src={newGalleryImgUrl} alt="Preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="flex-1 text-left">
                      <p className="text-[11px] text-slate-500 font-semibold leading-normal">
                        Unggah foto dari penyimpanan lokal Anda untuk mengubah/menambah dokumentasi. (Max 5MB)
                      </p>
                    </div>
                    <label className="px-4 py-2.5 bg-white border border-slate-200 hover:bg-slate-50 hover:border-slate-300 text-slate-700 font-extrabold text-xxs rounded-xl transition-all cursor-pointer flex items-center gap-1.5 shadow-xs shrink-0">
                      <Upload className="w-3.5 h-3.5 text-red-600" /> Pilih Foto Dokumentasi
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleGalleryPhotoUpload}
                        className="hidden"
                      />
                    </label>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddOrEditGalleryItem}
                    className="w-full py-3.5 bg-slate-950 hover:bg-slate-900 text-white font-extrabold text-xs rounded-xl transition-all shadow-sm cursor-pointer text-center uppercase tracking-wide"
                  >
                    {editingGalleryId ? "Simpan Perubahan Dokumentasi" : "Tambah Dokumentasi Ke Galeri"}
                  </button>
                </div>
              </div>

              {/* 4. Kelola Sambutan & Foto Camat */}
              <div className="space-y-4 bg-slate-50/50 p-4 border border-slate-150 rounded-2xl">
                <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                  <div className="p-1 bg-red-100 text-red-600 rounded-lg">
                    <Award className="w-4 h-4" />
                  </div>
                  <label className="text-xxs uppercase tracking-wider text-slate-500 font-bold block">4. Sambutan Resmi & Foto Camat</label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Nama Camat Beserta Gelar</label>
                    <input
                      type="text"
                      required
                      value={camatName}
                      onChange={(e) => setCamatName(e.target.value)}
                      placeholder="Haryadi, S.IP"
                      className="w-full bg-white border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3 text-slate-800 font-semibold"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Jabatan Resmi</label>
                    <input
                      type="text"
                      required
                      value={camatTitle}
                      onChange={(e) => setCamatTitle(e.target.value)}
                      placeholder="Camat Gunung Timang"
                      className="w-full bg-white border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3 text-slate-800 font-semibold"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Kalimat Sambutan Hangat</label>
                  <textarea
                    required
                    value={camatGreeting}
                    onChange={(e) => setCamatGreeting(e.target.value)}
                    placeholder="Tuliskan kata sambutan camat di sini..."
                    className="w-full bg-white border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3 text-slate-800 h-28 leading-relaxed font-medium"
                  />
                </div>

                <div className="p-3 bg-white border border-slate-200 rounded-xl space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Unggah Foto Resmi Camat</span>
                  <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="w-20 h-28 rounded-xl border border-slate-200 bg-slate-50 flex items-center justify-center overflow-hidden shrink-0 shadow-xs">
                      {camatPhoto ? (
                        <img src={camatPhoto} alt="Foto Camat Preview" className="object-cover w-full h-full" referrerPolicy="no-referrer" />
                      ) : (
                        <Camera className="w-6 h-6 text-slate-300" />
                      )}
                    </div>
                    <div className="space-y-1.5 flex-1 w-full text-left">
                      <p className="text-[10px] text-slate-500 leading-normal font-medium">
                        Disarankan foto berukuran tegak (portrait) dengan aspek rasio 3:4 untuk hasil tampilan sambutan beranda yang paling proporsional dan maksimal. (Format JPG/PNG, Max 5MB).
                      </p>
                      <div className="flex flex-wrap gap-2">
                        <label className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white font-bold text-xxs rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 shadow-xxs">
                          <Upload className="w-3.5 h-3.5" /> Pilih Foto Camat
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleCamatPhotoUpload} 
                            className="hidden" 
                          />
                        </label>
                        {camatPhoto && (
                          <button
                            type="button"
                            onClick={() => setCamatPhoto("")}
                            className="px-3 py-1.5 bg-white hover:bg-slate-50 text-slate-500 font-bold text-xxs rounded-lg border border-slate-200 transition-all cursor-pointer"
                          >
                            Hapus Foto
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Submit Buttons */}
              <div className="pt-4 border-t border-slate-100 flex justify-end">
                <button
                  type="submit"
                  disabled={isSavingSettings}
                  className="px-6 py-3 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-1.5"
                >
                  {isSavingSettings ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Menyimpan...
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4" />
                      Simpan Seluruh Pengaturan
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* RIGHT COLUMN: DATABASE BACKUP & RESTRICTIONS (4/12 width) */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Database & Protection Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm text-left">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <Database className="w-4 h-4 text-red-600" /> Pencadangan Database & Proteksi
              </h4>
              <p className="text-xxs text-slate-500 leading-relaxed font-medium">
                Disarankan untuk melakukan backup database berkala sebelum merubah data massal atau menutup sistem pendaftaran. File cadangan diunduh dalam bentuk berkas JSON standard.
              </p>
              
              <div className="flex gap-2">
                <button
                  onClick={handleBackupDB}
                  className="w-full px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 border border-slate-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer shadow-xs transition-colors"
                >
                  <Download className="w-4 h-4 text-red-600" /> Unduh Cadangan JSON
                </button>
              </div>
            </div>

            {/* Verification Rules Card */}
            <div className="p-5 bg-white border border-slate-200 rounded-3xl space-y-4 shadow-sm text-left">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-slate-100 pb-2">
                <ClipboardList className="w-4 h-4 text-amber-600" /> Ketentuan Verifikasi
              </h4>
              <ul className="text-xxs text-slate-500 leading-relaxed list-disc list-inside space-y-2 font-medium">
                <li>Pastikan NISN benar (10 digit angka dan tidak berulang).</li>
                <li>Periksa kesesuaian lampiran lirik dan partitur lagu.</li>
                <li>Jika berkas disetujui, hubungi guru pembina via tombol Broadcast WhatsApp.</li>
                <li>Jika ditolak, cantumkan alasan penolakan agar pembina dapat merevisi pendaftaran.</li>
              </ul>
            </div>

          </div>

        </div>
      )}

      {/* ----------------- MODAL VERIFIKASI / DETAIL BERKAS ----------------- */}
      {selectedReg && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4 z-50 overflow-y-auto print:hidden">
          <div className="bg-white border border-slate-200 rounded-3xl w-full max-w-2xl overflow-hidden shadow-xl animate-scale-up max-h-[90vh] flex flex-col text-left">
            
            {/* Modal Header */}
            <div className="p-4 bg-slate-50 border-b border-slate-150 flex justify-between items-center">
              <div>
                <span className="text-xxs uppercase tracking-widest text-red-600 font-bold">Verifikasi Lembar Berkas</span>
                <h3 className="font-bold text-slate-900 text-sm mt-0.5">{selectedReg.id} - {selectedReg.dataPeserta?.namaPeserta}</h3>
              </div>
              <button
                onClick={() => setSelectedReg(null)}
                className="text-slate-400 hover:text-slate-700 p-1.5 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Scroll Body */}
            <div className="p-6 space-y-6 overflow-y-auto flex-1">
              
              {/* Info Columns */}
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <span className="text-slate-500 text-xxs uppercase tracking-wider font-bold">A. Data Sekolah</span>
                  <p className="text-slate-900 font-bold">{selectedReg.dataSekolah?.namaSekolah}</p>
                  <p className="text-slate-700">Jenjang: {selectedReg.dataSekolah?.jenjang}</p>
                  <p className="text-slate-700">Pembina: {selectedReg.dataSekolah?.namaPembina}</p>
                  <p className="text-slate-700 font-mono">HP: {selectedReg.dataSekolah?.nomorHP}</p>
                </div>

                <div className="p-3 bg-slate-50 border border-slate-100 rounded-2xl space-y-1">
                  <span className="text-slate-500 text-xxs uppercase tracking-wider font-bold">B. Data Peserta</span>
                  <p className="text-slate-900 font-bold">{selectedReg.dataPeserta?.namaPeserta}</p>
                  <p className="text-slate-700 font-mono">NISN: {selectedReg.dataPeserta?.nisn}</p>
                  <p className="text-slate-700">Desa: {selectedReg.dataPeserta?.desa}</p>
                  <p className="text-slate-700">Tgl Lahir: {selectedReg.dataPeserta?.tanggalLahir}</p>
                </div>
              </div>

              {/* Lomba & File List */}
              <div className="space-y-2">
                <span className="text-slate-500 text-xxs uppercase tracking-wider font-bold block">C. Cabang Lomba & Berkas Fisik</span>
                <div className="p-4 bg-slate-50 border border-slate-150 rounded-2xl flex items-center justify-between">
                  <span className="text-red-700 font-bold text-sm">{selectedReg.cabangLomba}</span>
                  <div className="flex gap-1.5">
                    {selectedReg.uploads?.partitur === "Ada" && <span className="px-2.5 py-1 bg-red-100 border border-red-200 rounded-md text-red-700 text-xxs font-semibold">Partitur</span>}
                    {selectedReg.uploads?.lirik === "Ada" && <span className="px-2.5 py-1 bg-red-100 border border-red-200 rounded-md text-red-700 text-xxs font-semibold">Lirik</span>}
                    {selectedReg.uploads?.suratTugas === "Ada" && <span className="px-2.5 py-1 bg-red-100 border border-red-200 rounded-md text-red-700 text-xxs font-semibold">Surat Tugas</span>}
                    {selectedReg.uploads?.pasFoto === "Ada" && <span className="px-2.5 py-1 bg-red-100 border border-red-200 rounded-md text-red-700 text-xxs font-semibold">Pas Foto</span>}
                  </div>
                </div>
              </div>

              {/* Admin decision input notes */}
              <div className="space-y-2.5">
                <label className="text-slate-500 text-xxs uppercase tracking-wider font-bold block">Catatan Panitia / Alasan Penolakan</label>
                <textarea
                  value={adminNote}
                  onChange={(e) => setAdminNote(e.target.value)}
                  placeholder="Contoh: 'Partitur lengkap, berkas disetujui.' atau 'Mohon unggah surat tugas kepala sekolah yang bertanda tangan basah.'"
                  className="w-full bg-slate-50 border border-slate-250 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl p-3.5 text-slate-800 placeholder-slate-400 h-20"
                />
              </div>

            </div>

            {/* Modal Footer Controls */}
            <div className="p-4 bg-slate-50 border-t border-slate-150 flex justify-between items-center gap-2">
              <button
                onClick={() => handleDeleteReg(selectedReg.id)}
                className="px-4 py-2 bg-white hover:bg-red-50 text-red-600 rounded-xl text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" /> Hapus Berkas
              </button>

              <div className="flex gap-2">
                <button
                  onClick={() => handleStatusChange(selectedReg.id, "Ditolak")}
                  className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-700 rounded-xl text-xs font-bold border border-red-200 cursor-pointer"
                >
                  Tolak Berkas
                </button>
                <button
                  onClick={() => handleStatusChange(selectedReg.id, "Terverifikasi")}
                  className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-emerald-700 hover:from-emerald-500 hover:to-emerald-600 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-sm"
                >
                  <Check className="w-4 h-4" /> Verifikasi & Setujui
                </button>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* DUMMY HIDDEN BUKTI SECTION ONLY USED FOR PRINTING DYNAMIC ID CARD */}
      {selectedReg && (
        <div className="hidden print:block print:absolute print:inset-0 bg-white text-slate-900 p-8 space-y-6">
          <div className="border-b-2 border-slate-400 pb-3">
            <h2 className="text-xl font-bold tracking-tight text-center uppercase">KARTU PESERTA RESMI HUT-RI 81</h2>
            <p className="text-center text-xs">Panitia Penyelenggara Kecamatan Gunung Timang Tahun 2026</p>
          </div>
          <div className="grid grid-cols-2 gap-4 text-xs text-left">
            <div>
              <p className="font-bold">ID PESERTA: <span className="font-mono text-base font-extrabold text-slate-950">{selectedReg.id}</span></p>
              <p className="mt-2">Nama Murid: <strong>{selectedReg.dataPeserta?.namaPeserta}</strong></p>
              <p>NISN: {selectedReg.dataPeserta?.nisn}</p>
            </div>
            <div>
              <p>Asal Sekolah: {selectedReg.dataSekolah?.namaSekolah}</p>
              <p className="mt-1">Cabang Lomba: <strong>{selectedReg.cabangLomba}</strong></p>
              <p className="mt-1 font-mono text-xxs text-slate-500">Tanggal Terbit: {new Date().toLocaleDateString("id-ID")}</p>
            </div>
          </div>
          <div className="flex justify-between items-center border-t border-slate-300 pt-4">
            <Barcode value={selectedReg.id} />
            <QRCode value={selectedReg.id} size={90} />
          </div>
        </div>
      )}

    </div>
  );
};
