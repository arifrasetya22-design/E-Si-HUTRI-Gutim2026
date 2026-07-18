/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import { 
  Home, FileText, BookOpen, PhoneCall, ShieldCheck, Sparkles, 
  MapPin, Calendar, Award, CheckCircle2, ChevronRight, Menu, X, Users, Building2, Ticket,
  Search, Filter, Image as ImageIcon, Camera, Trophy, CheckSquare, CalendarDays
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { BackgroundBendera } from "./components/BackgroundBendera";
import { Countdown } from "./components/Countdown";
import { AIAssistant } from "./components/AIAssistant";
import { JuknisView } from "./components/JuknisView";
import { NarahubungView } from "./components/NarahubungView";
import { FormulirPendaftaran } from "./components/FormulirPendaftaran";
import { AdminDashboard } from "./components/AdminDashboard";
import { DashboardStats, HomepageSettings, Registration } from "./types";

export default function App() {
  const [activeTab, setActiveTab] = useState<"beranda" | "formulir" | "juknis" | "narahubung" | "admin">("beranda");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalPeserta: 0,
    totalSekolah: 0,
    sisaKuota: 150,
    byStatus: { menunggu: 0, terverifikasi: 0, ditolak: 0 },
    byJenjang: { SD: 0, SMP: 0, SMA: 0, SMK: 0 }
  });

  const [settings, setSettings] = useState<HomepageSettings>({
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
  });

  const [publicRegistrations, setPublicRegistrations] = useState<Registration[]>([]);
  const [publicSearch, setPublicSearch] = useState("");
  const [publicSchoolFilter, setPublicSchoolFilter] = useState("Semua");
  const [publicCabangFilter, setPublicCabangFilter] = useState("Semua");

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/stats");
      const result = await response.json();
      if (result.success) {
        setStats(result.stats);
      }
    } catch (err) {
      console.error("Gagal memperbarui data statistik", err);
    }
  };

  const fetchSettings = async () => {
    try {
      const response = await fetch("/api/settings");
      const result = await response.json();
      if (result.success && result.data) {
        setSettings(result.data);
      }
    } catch (err) {
      console.error("Gagal memperbarui data pengaturan", err);
    }
  };

  const fetchPublicRegistrations = async () => {
    try {
      const response = await fetch("/api/registrations");
      const result = await response.json();
      if (result.success && result.data) {
        setPublicRegistrations(result.data);
      }
    } catch (err) {
      console.error("Gagal memperbarui data pendaftaran publik", err);
    }
  };

  const handleRefreshAll = () => {
    fetchStats();
    fetchSettings();
    fetchPublicRegistrations();
  };

  useEffect(() => {
    fetchStats();
    fetchSettings();
    fetchPublicRegistrations();
    // Refresh stats and registrations every 30 seconds
    const interval = setInterval(() => {
      fetchStats();
      fetchPublicRegistrations();
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  const menuItems = [
    { id: "beranda", label: "Beranda", icon: Home },
    { id: "formulir", label: "Formulir", icon: FileText },
    { id: "juknis", label: "Juknis Lomba", icon: BookOpen },
    { id: "narahubung", label: "Narahubung", icon: PhoneCall },
    { id: "admin", label: "Admin Gateway", icon: ShieldCheck },
  ];

  return (
    <div className="min-h-screen text-slate-900 font-sans selection:bg-red-600/30 selection:text-white flex flex-col relative">
      
      {/* Dynamic Animated Bendera & Particle Field Layer */}
      <BackgroundBendera />

      {/* ----------------- NAVBAR MENU ----------------- */}
      <nav className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 print:hidden shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            
            {/* Logo Emblem */}
            <div className="flex items-center gap-3">
              {settings.logo ? (
                <img 
                  src={settings.logo} 
                  alt="Logo Website" 
                  className="w-12 h-12 object-contain rounded-xl border border-slate-200 p-0.5 bg-white shadow-xs"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="relative flex items-center justify-center w-10 h-12 rounded-sm bg-red-600 shadow-sm border border-red-700/10">
                  <span className="font-extrabold text-lg text-white tracking-tighter">81</span>
                </div>
              )}
              <div>
                <h1 className="text-slate-900 font-extrabold text-lg tracking-tight block leading-none">SI-HUT RI 81</h1>
                <p className="text-slate-500 text-[10px] uppercase tracking-widest mt-1 block leading-none font-semibold">Kecamatan Gunung Timang</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              {menuItems.map((item) => {
                const isActive = activeTab === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => setActiveTab(item.id as any)}
                    className={`pb-1 transition-all duration-300 cursor-pointer font-bold text-xs uppercase tracking-wider ${
                      isActive 
                        ? "text-red-600 border-b-2 border-red-600" 
                        : "text-slate-600 hover:text-red-600"
                    }`}
                  >
                    {item.label}
                  </button>
                );
              })}
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden flex items-center">
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="p-2 rounded-xl text-slate-600 hover:text-slate-900 bg-slate-50 border border-slate-200"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>

          </div>
        </div>

        {/* Mobile Navigation Dropdown */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="md:hidden bg-white border-b border-slate-200 overflow-hidden"
            >
              <div className="px-4 pt-2 pb-4 space-y-1">
                {menuItems.map((item) => {
                  const Icon = item.icon;
                  const isActive = activeTab === item.id;
                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id as any);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`flex items-center gap-2.5 w-full px-4 py-3 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                        isActive 
                          ? "bg-red-600 text-white" 
                          : "text-slate-600 hover:text-red-600 hover:bg-slate-50"
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                      {item.label}
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>

      {/* ----------------- SUB-HEADER RUNNING TICKER ----------------- */}
      <div className="bg-white border-b border-slate-200 py-2.5 overflow-hidden print:hidden">
        <div className="whitespace-nowrap flex items-center gap-10 animate-marquee text-slate-600 font-medium tracking-wide">
          {settings.announcements && settings.announcements.length > 0 ? (
            settings.announcements.map((ann, index) => (
              <span key={index} className="flex items-center gap-2 text-xxs font-mono uppercase">
                <span className={`w-1.5 h-1.5 rounded-full ${index % 2 === 0 ? 'bg-red-600 animate-ping' : 'bg-amber-500'}`} />
                {ann}
              </span>
            ))
          ) : (
            <span className="flex items-center gap-2 text-xxs font-mono uppercase">
              <span className="w-1.5 h-1.5 bg-red-600 rounded-full animate-ping" />
              Pendaftaran Gratis: 100% Bebas Biaya Pendaftaran untuk Seluruh Sekolah di Kecamatan Gunung Timang!
            </span>
          )}
        </div>
      </div>

      {/* ----------------- MAIN VIEW STAGE ----------------- */}
      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full z-10">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -15 }}
            transition={{ duration: 0.25 }}
          >
            {/* 1. BERANDA TAB */}
            {activeTab === "beranda" && (
              <div className="space-y-8 max-w-5xl mx-auto">
                
                {/* Hero Banner Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center bg-gradient-to-br from-red-600 to-red-800 rounded-3xl p-6 md:p-10 text-white relative overflow-hidden shadow-xl">
                  {/* Abstract flag-like waves */}
                  <div className="absolute -right-20 -top-20 w-80 h-80 bg-white/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-black/10 rounded-full blur-3xl pointer-events-none" />

                  <div className="lg:col-span-7 space-y-6 text-left relative z-10">
                    <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-white/20 backdrop-blur-md rounded-full text-xxs font-bold text-white uppercase tracking-widest">
                      <Sparkles className="w-3.5 h-3.5 text-yellow-300 animate-spin-slow" /> Dirgahayu Republik Indonesia Ke-81
                    </div>

                    <h2 className="text-3xl md:text-5xl font-black tracking-tight text-white leading-tight">
                      {settings.title || "Rayakan Kemerdekaan Dengan Prestasi"}
                    </h2>

                    <p className="text-sm md:text-base text-red-100 max-w-lg leading-relaxed opacity-95 font-medium">
                      {settings.description || "Pendaftaran Peserta Lomba HUT Proklamasi Kemerdekaan RI Ke-81 Tingkat Kecamatan Gunung Timang Tahun 2026."}
                    </p>

                    {/* Slogan */}
                    <div className="p-4 bg-black/20 backdrop-blur-xs border border-white/10 rounded-2xl">
                      <span className="text-xxs text-red-200 uppercase tracking-widest font-bold">Slogan Resmi</span>
                      <blockquote className="text-sm font-serif italic text-white mt-1">
                        "{settings.slogan || "Merdeka Berprestasi, Berkarya untuk Indonesia."}"
                      </blockquote>
                    </div>

                    <div className="flex flex-wrap gap-3 pt-2">
                      <button
                        onClick={() => setActiveTab("formulir")}
                        className="px-6 py-3.5 bg-white hover:scale-105 transition-transform text-red-700 font-extrabold text-xs rounded-xl cursor-pointer shadow-lg flex items-center gap-1.5"
                      >
                        DAFTAR SEKARANG <ChevronRight className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => setActiveTab("juknis")}
                        className="px-6 py-3.5 bg-red-500/30 backdrop-blur-md border border-white/20 hover:bg-white/10 text-white font-extrabold text-xs rounded-xl transition-all cursor-pointer"
                      >
                        Download Juknis PDF
                      </button>
                    </div>
                  </div>

                  {/* Countdown + Stat overview column */}
                  <div className="lg:col-span-5 space-y-5 relative z-10">
                    <Countdown />
                  </div>
                </div>

                {/* FAST STATISTICS DISPLAY */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
                  {/* Card 1: Total Peserta */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-40">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Total Peserta</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">{stats.totalPeserta}</span>
                      <span className="text-xs font-bold text-emerald-500">+12%</span>
                    </div>
                    <div className="w-full bg-slate-100 h-1.5 rounded-full">
                      <div className="bg-red-600 h-full w-[80%] rounded-full"></div>
                    </div>
                  </div>

                  {/* Card 2: Instansi Sekolah */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-40">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Instansi Sekolah</p>
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-black text-slate-900">{stats.totalSekolah}</span>
                      <span className="text-xs font-bold text-slate-500">SD/SMP/SMA</span>
                    </div>
                    <div className="flex -space-x-2">
                      <div className="w-6 h-6 rounded-full bg-blue-500 border-2 border-white"></div>
                      <div className="w-6 h-6 rounded-full bg-red-500 border-2 border-white"></div>
                      <div className="w-6 h-6 rounded-full bg-amber-500 border-2 border-white"></div>
                      <div className="w-6 h-6 rounded-full bg-slate-200 border-2 border-white flex items-center justify-center text-[8px] font-bold">+39</div>
                    </div>
                  </div>

                  {/* Card 3: Cabang Lomba */}
                  <div className="bg-white rounded-3xl border border-slate-200 p-6 shadow-xs flex flex-col justify-between h-40">
                    <p className="text-[10px] uppercase font-bold text-slate-400 tracking-widest">Cabang Lomba</p>
                    <span className="text-4xl font-black text-slate-900">12</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-medium text-slate-600 uppercase">Seni</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-medium text-slate-600 uppercase">Budaya</span>
                      <span className="px-2 py-0.5 bg-slate-100 rounded text-[9px] font-medium text-slate-600 uppercase">Musik</span>
                    </div>
                  </div>

                  {/* Card 4: Sisa Kuota (Amber style) */}
                  <div className="bg-amber-50/70 rounded-3xl border border-amber-200 p-6 shadow-xs flex flex-col justify-between h-40 overflow-hidden relative">
                    <div className="absolute -right-2 -bottom-4 opacity-10 text-amber-600">
                      <Award className="w-24 h-24" />
                    </div>
                    <p className="text-[10px] uppercase font-bold text-amber-600 tracking-widest">Sisa Kuota Pendaftaran</p>
                    <span className="text-4xl font-black text-amber-800">{stats.sisaKuota}</span>
                    <div className="text-xs text-amber-700 font-bold">
                      Segera Amankan Slot!
                    </div>
                  </div>
                </div>

                {/* Quick Info Cards (Lokasi & Tanggal) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3 text-left">
                    <h4 className="text-xs font-bold text-red-600 uppercase tracking-widest flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-red-600" /> Lokasi Pelaksanaan Kegiatan
                    </h4>
                    <p className="text-xs text-slate-600 leading-relaxed font-medium">
                      Seluruh rangkaian perlombaan kesenian dan pameran kesenian rakyat akan dipusatkan di <strong className="text-slate-900 font-bold">Gedung Pertemuan Umum (GPU) Kandui</strong>, Kecamatan Gunung Timang.
                    </p>
                  </div>
                  <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-xs space-y-3 text-left">
                    <h4 className="text-xs font-bold text-amber-600 uppercase tracking-widest flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-amber-600" /> Jadwal Penting Acara
                    </h4>
                    <ul className="text-xs text-slate-600 space-y-1 font-medium">
                      <li>• <strong className="text-slate-900 font-bold">Pendaftaran Online</strong>: s.d. 10 Agustus 2026</li>
                      <li>• <strong className="text-slate-900 font-bold">Technical Meeting</strong>: 12 Agustus 2026 (09:00 WIB)</li>
                      <li>• <strong className="text-slate-900 font-bold">Pelaksanaan Lomba</strong>: 14 - 16 Agustus 2026</li>
                    </ul>
                  </div>
                </div>

                {/* SAMBUTAN CAMAT */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs text-left">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-center">
                    <div className="md:col-span-3 flex flex-col items-center text-center space-y-3">
                      <div className="relative w-36 h-48 rounded-2xl overflow-hidden bg-slate-100 border-2 border-red-600/20 shadow-xs shrink-0">
                        <img 
                          src={settings.camatPhoto || "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=300&h=400"} 
                          alt={settings.camatName || "Camat Gunung Timang"} 
                          className="object-cover w-full h-full"
                          referrerPolicy="no-referrer"
                        />
                        <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-950/70 to-transparent p-2 pt-6">
                          <span className="text-[9px] text-white font-bold tracking-widest uppercase">Kecamatan</span>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-extrabold text-sm text-slate-900 leading-tight">{settings.camatName || "Haryadi, S.IP"}</h4>
                        <p className="text-xxs text-red-600 font-bold uppercase tracking-wider mt-0.5">{settings.camatTitle || "Camat Gunung Timang"}</p>
                      </div>
                    </div>
                    <div className="md:col-span-9 space-y-4">
                      <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-red-50 text-red-700 text-xxs font-bold rounded-full border border-red-100">
                        <Award className="w-3.5 h-3.5 animate-pulse" /> Sambutan Hangat Camat Gunung Timang
                      </div>
                      <blockquote className="text-sm text-slate-600 italic font-medium leading-relaxed">
                        "{settings.camatGreeting || "Selamat datang di Portal Pendaftaran Resmi Lomba HUT Kemerdekaan RI Ke-81 Tingkat Kecamatan Gunung Timang. Melalui wadah digital ini, mari kita pupuk semangat perjuangan, sportivitas, serta kreativitas anak-anak bangsa se-Kecamatan Gunung Timang. Mari rayakan kemerdekaan dengan prestasi gemilang!"}"
                      </blockquote>
                      <div className="flex items-center gap-2 text-xxs text-slate-400 font-mono">
                        <span>Pemerintah Kabupaten Barito Utara</span>
                        <span>•</span>
                        <span>Kecamatan Gunung Timang</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* GALLERY & DOKUMENTASI LOMBA */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="text-left">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <ImageIcon className="w-5 h-5 text-red-600" /> Galeri & Dokumentasi Kegiatan
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Potret keseruan, kemeriahan, dan antusiasme perlombaan HUT RI Ke-81 Gunung Timang.</p>
                    </div>
                  </div>

                  {settings.gallery && settings.gallery.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {settings.gallery.map((item) => (
                        <div key={item.id} className="group relative bg-slate-50 border border-slate-100 rounded-2xl overflow-hidden shadow-xs transition-all hover:shadow-md hover:-translate-y-1">
                          <div className="relative aspect-video w-full overflow-hidden bg-slate-200">
                            <img 
                              src={item.imageUrl} 
                              alt={item.title} 
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                              referrerPolicy="no-referrer"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 via-slate-900/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                              <span className="text-[10px] text-white font-mono uppercase bg-red-600 px-2.5 py-0.5 rounded-full">
                                HUT RI 81
                              </span>
                            </div>
                          </div>
                          <div className="p-4 text-left space-y-1">
                            <h4 className="font-bold text-sm text-slate-900 group-hover:text-red-600 transition-colors">{item.title}</h4>
                            <p className="text-xxs text-slate-500 leading-relaxed line-clamp-2">{item.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-10 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <ImageIcon className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-semibold">Galeri dokumentasi belum diunggah.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Admin dapat menambahkan dokumentasi foto melalui Admin Gateway.</p>
                    </div>
                  )}
                </div>

                {/* PUBLIC PARTICIPANTS DIRECTORY */}
                <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                    <div className="text-left">
                      <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                        <Users className="w-5 h-5 text-red-600" /> Peserta yang Sudah Mendaftar
                      </h3>
                      <p className="text-xs text-slate-500 mt-1">Daftar pendaftar resmi se-Kecamatan Gunung Timang yang masuk ke dalam sistem.</p>
                    </div>
                    <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-50 text-red-700 text-xs font-bold rounded-full border border-red-100">
                      <Trophy className="w-4 h-4" /> {publicRegistrations.length} Peserta Terdaftar
                    </div>
                  </div>

                  {/* Search and Filters Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                    <div className="md:col-span-6 relative">
                      <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        type="text"
                        placeholder="Cari nama peserta, sekolah, atau ID pendaftaran..."
                        value={publicSearch}
                        onChange={(e) => setPublicSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden text-slate-800 font-medium"
                      />
                    </div>
                    <div className="md:col-span-3 relative">
                      <select
                        value={publicSchoolFilter}
                        onChange={(e) => setPublicSchoolFilter(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden text-slate-700 font-bold cursor-pointer"
                      >
                        <option value="Semua">🏫 Semua Sekolah</option>
                        {Array.from(new Set(publicRegistrations.map((r) => r.dataSekolah?.namaSekolah).filter(Boolean))).map((sch) => (
                          <option key={sch} value={sch}>{sch}</option>
                        ))}
                      </select>
                    </div>
                    <div className="md:col-span-3 relative">
                      <select
                        value={publicCabangFilter}
                        onChange={(e) => setPublicCabangFilter(e.target.value)}
                        className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-red-500/20 focus:border-red-500 focus:outline-hidden text-slate-700 font-bold cursor-pointer"
                      >
                        <option value="Semua">🎵 Semua Lomba</option>
                        {Array.from(new Set(publicRegistrations.map((r) => r.cabangLomba).filter(Boolean))).map((cab) => (
                          <option key={cab} value={cab}>{cab}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Table List */}
                  {publicRegistrations.filter((reg) => {
                    const namaMatch = reg.dataPeserta?.namaPeserta?.toLowerCase().includes(publicSearch.toLowerCase());
                    const sekolahMatch = reg.dataSekolah?.namaSekolah?.toLowerCase().includes(publicSearch.toLowerCase());
                    const idMatch = reg.id?.toLowerCase().includes(publicSearch.toLowerCase());
                    const searchMatch = namaMatch || sekolahMatch || idMatch;

                    const schoolMatch = publicSchoolFilter === "Semua" || reg.dataSekolah?.namaSekolah === publicSchoolFilter;
                    const cabangMatch = publicCabangFilter === "Semua" || reg.cabangLomba === publicCabangFilter;

                    return searchMatch && schoolMatch && cabangMatch;
                  }).length > 0 ? (
                    <div className="overflow-x-auto border border-slate-100 rounded-2xl">
                      <table className="w-full border-collapse text-left text-xs text-slate-600">
                        <thead>
                          <tr className="bg-slate-50 border-b border-slate-100 font-bold text-slate-500 text-xxs uppercase tracking-wider">
                            <th className="p-4 w-12 text-center">No</th>
                            <th className="p-4">ID</th>
                            <th className="p-4">Nama Peserta</th>
                            <th className="p-4">Sekolah</th>
                            <th className="p-4">Cabang Lomba</th>
                            <th className="p-4">Tanggal Daftar</th>
                            <th className="p-4 text-center">Status</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {publicRegistrations.filter((reg) => {
                            const namaMatch = reg.dataPeserta?.namaPeserta?.toLowerCase().includes(publicSearch.toLowerCase());
                            const sekolahMatch = reg.dataSekolah?.namaSekolah?.toLowerCase().includes(publicSearch.toLowerCase());
                            const idMatch = reg.id?.toLowerCase().includes(publicSearch.toLowerCase());
                            const searchMatch = namaMatch || sekolahMatch || idMatch;

                            const schoolMatch = publicSchoolFilter === "Semua" || reg.dataSekolah?.namaSekolah === publicSchoolFilter;
                            const cabangMatch = publicCabangFilter === "Semua" || reg.cabangLomba === publicCabangFilter;

                            return searchMatch && schoolMatch && cabangMatch;
                          }).map((reg, index) => (
                            <tr key={reg.id} className="hover:bg-slate-50/50 transition-colors">
                              <td className="p-4 text-center font-mono text-slate-400 font-medium">{index + 1}</td>
                              <td className="p-4 font-mono font-bold text-red-600">{reg.id}</td>
                              <td className="p-4 font-bold text-slate-900">{reg.dataPeserta?.namaPeserta}</td>
                              <td className="p-4 font-medium text-slate-700">{reg.dataSekolah?.namaSekolah}</td>
                              <td className="p-4">
                                <span className="px-2 py-1 bg-slate-100 rounded-md text-[10px] font-semibold text-slate-600">
                                  {reg.cabangLomba}
                                </span>
                              </td>
                              <td className="p-4 text-slate-400 font-mono text-xxs">
                                {new Date(reg.tanggalDaftar).toLocaleDateString("id-ID", {
                                  day: "numeric",
                                  month: "short",
                                  year: "numeric"
                                })}
                              </td>
                              <td className="p-4 text-center">
                                <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                  reg.status === "Terverifikasi"
                                    ? "bg-emerald-50 text-emerald-700 border border-emerald-100"
                                    : reg.status === "Ditolak"
                                    ? "bg-red-50 text-red-700 border border-red-100"
                                    : "bg-amber-50 text-amber-700 border border-amber-100 animate-pulse"
                                }`}>
                                  {reg.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-2xl">
                      <Users className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                      <p className="text-xs text-slate-500 font-semibold">Tidak ada peserta yang cocok dengan filter atau pencarian Anda.</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Silakan sesuaikan kata kunci pencarian atau coba filter lainnya.</p>
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* 2. FORMULIR TAB */}
            {activeTab === "formulir" && (
              <FormulirPendaftaran onRegistrationSuccess={handleRefreshAll} />
            )}

            {/* 3. JUKNIS TAB */}
            {activeTab === "juknis" && (
              <JuknisView />
            )}

            {/* 4. CONTACTS TAB */}
            {activeTab === "narahubung" && (
              <NarahubungView />
            )}

            {/* 5. ADMIN TAB */}
            {activeTab === "admin" && (
              <AdminDashboard 
                stats={stats} 
                settings={settings}
                onSettingsChange={fetchSettings}
                onActionSuccess={handleRefreshAll} 
              />
            )}

          </motion.div>
        </AnimatePresence>
      </main>

      {/* ----------------- DYNAMIC FLOATING CHAT ASSISTANT ----------------- */}
      <AIAssistant />

      {/* Footer Status Bar */}
      <footer className="py-6 bg-white border-t border-slate-200 px-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4 z-10 text-slate-500 text-xxs mt-12 print:hidden shadow-xs">
        <div className="flex flex-wrap items-center justify-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
            <span className="text-xs text-slate-500 font-medium">Online 24 Jam</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-400 font-medium">Pendaftaran:</span>
            <span className="text-xs text-slate-700 font-bold uppercase tracking-tight">Gratis / Rp 0</span>
          </div>
        </div>
        <div className="text-slate-400 text-center text-[10px] font-medium uppercase tracking-[0.2em]">
          Panitia HUT RI Ke-81 • Gunung Timang 2026
        </div>
        <div className="text-slate-400 text-[10px] font-mono uppercase tracking-wider text-center">
          © 2026 Panitia HUT RI 81. Hak Cipta Dilindungi.
        </div>
      </footer>

    </div>
  );
}
