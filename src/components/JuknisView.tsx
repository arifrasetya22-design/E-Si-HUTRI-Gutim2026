/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { Search, Music, Award, Users, BookOpen, Layers } from "lucide-react";
import { JuknisItem } from "../types";

export const JuknisView: React.FC = () => {
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("Semua");

  const juknisData: JuknisItem[] = [
    {
      kategori: "Lagu Tradisional",
      cabang: ["Dongkoi Putra", "Dongkoi Putri", "Karungut Putra", "Karungut Putri", "Japen Putra", "Japen Putri", "Tari Daerah"],
      ketentuan: [
        "Lirik dibuat sendiri oleh masing-masing peserta.",
        "Diserahkan kepada panitia dalam bentuk naskah cetak sebanyak 3 lembar.",
        "Panjang lagu maksimal 5 bait.",
        "Iringan musik disiapkan secara mandiri oleh peserta.",
        "Pemenang akan dinilai untuk memperebutkan Juara I, II, dan III."
      ]
    },
    {
      kategori: "Paduan Suara",
      cabang: ["Tingkat SMP/SMA/SMK", "Tingkat SD/MI"],
      ketentuan: [
        "Jumlah peserta berkisar antara 10 hingga 15 orang per kelompok.",
        "Mengumpulkan partitur atau teks lagu sebanyak 3 lembar saat registrasi.",
        "Iringan instrumen/karaoke disiapkan oleh masing-masing peserta.",
        "Pemenang akan memperebutkan Juara I, II, dan III."
      ],
      laguWajib: "Hari Merdeka (17 Agustus) [Tingkat SMP/SMA/SMK] atau Dari Sabang Sampai Merauke [Tingkat SD/MI]",
      laguPilihan: [
        "Syukur (Tingkat SMP/SMA/SMK)",
        "Kulihat Ibu Pertiwi (Tingkat SMP/SMA/SMK)",
        "Berkibarlah Benderaku (Tingkat SD/MI)",
        "Maju Tak Gentar (Tingkat SD/MI)"
      ],
      jumlahPeserta: "10-15 Orang"
    },
    {
      kategori: "Vocal Solo",
      cabang: ["Vocal Solo SD/MI", "Vocal Solo SMP/SMA/SMK"],
      ketentuan: [
        "Terbuka untuk perwakilan Putra atau Putri dari sekolah masing-masing.",
        "Partitur atau naskah teks lagu wajib diserahkan kepada panitia sebanyak 3 lembar.",
        "Audio karaoke disiapkan secara mandiri oleh masing-masing peserta.",
        "Pemenang ditentukan untuk mendapatkan Juara I, II, dan III."
      ],
      laguWajib: "Indonesia Pusaka [Tingkat SMP/SMA/SMK] atau Bendera Merah Putih [Tingkat SD/MI]",
      laguPilihan: [
        "Gebyar Gebyar (Tingkat SMP/SMA/SMK)",
        "Tanah Airku (Tingkat SMP/SMA/SMK)",
        "Sorak Sorai Bergembira (Tingkat SD/MI)",
        "Desaku (Tingkat SD/MI)"
      ],
      jumlahPeserta: "1 Orang (Putra/Putri)"
    }
  ];

  const categories = ["Semua", "Lagu Tradisional", "Paduan Suara", "Vocal Solo"];

  const filteredJuknis = juknisData.filter((item) => {
    const matchesCategory = selectedCategory === "Semua" || item.kategori === selectedCategory;
    const matchesSearch =
      item.kategori.toLowerCase().includes(search.toLowerCase()) ||
      item.cabang.some((cb) => cb.toLowerCase().includes(search.toLowerCase())) ||
      (item.laguWajib && item.laguWajib.toLowerCase().includes(search.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Search and Categories Header */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between p-4 bg-white border border-slate-200 rounded-3xl shadow-xs">
        {/* Categories Selector */}
        <div className="flex flex-wrap gap-2 w-full md:w-auto">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-1.8 text-xs font-semibold rounded-xl transition-all duration-200 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-red-600 text-white shadow-sm shadow-red-600/10"
                  : "bg-slate-100 text-slate-600 hover:text-slate-800 hover:bg-slate-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search input */}
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Cari juknis, lagu, ketentuan..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-slate-50 border border-slate-200 focus:border-red-600/30 focus:outline-hidden text-xs rounded-xl pl-10 pr-4 py-2.5 text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Juknis Cards Grid */}
      <div className="grid grid-cols-1 gap-6">
        {filteredJuknis.map((item, idx) => (
          <div
            key={idx}
            className="bg-white border border-slate-200 rounded-3xl overflow-hidden relative group hover:shadow-md transition-all duration-300 text-left"
          >
            {/* Top Red-White Decorative Accent */}
            <div className="h-1 bg-gradient-to-r from-red-600 to-amber-500 rounded-t-3xl" />
            
            <div className="p-6">
              {/* Header */}
              <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-red-50 text-red-600 rounded-xl">
                    <Music className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.kategori}</h3>
                    <p className="text-xs text-slate-500">Petunjuk Pelaksanaan & Ketentuan Teknis</p>
                  </div>
                </div>
                {item.jumlahPeserta && (
                  <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 border border-slate-200 rounded-lg text-xxs font-mono text-slate-700">
                    <Users className="w-3.5 h-3.5 text-amber-600" />
                    Kuota: {item.jumlahPeserta}
                  </div>
                )}
              </div>

              {/* Grid content */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Branches Left Side */}
                <div className="lg:col-span-4 space-y-4">
                  <div className="p-4 bg-slate-50 border border-slate-200/50 rounded-2xl">
                    <h4 className="text-xs font-bold text-amber-700 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                      <Layers className="w-3.5 h-3.5" /> Cabang Lomba
                    </h4>
                    <div className="space-y-1.5">
                      {item.cabang.map((cb, cIdx) => (
                        <div key={cIdx} className="flex items-center gap-2 text-xs text-slate-700">
                          <span className="w-1.5 h-1.5 bg-red-600 rounded-full" />
                          <span>{cb}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Song Repertoire if present */}
                  {item.laguWajib && (
                    <div className="p-4 bg-gradient-to-br from-red-50/50 to-amber-50/20 border border-red-100/40 rounded-2xl space-y-3">
                      <div>
                        <span className="text-xxs font-bold text-red-600 uppercase tracking-wider">Lagu Wajib</span>
                        <p className="text-xs text-slate-900 font-medium mt-0.5">{item.laguWajib}</p>
                      </div>
                      {item.laguPilihan && item.laguPilihan.length > 0 && (
                        <div>
                          <span className="text-xxs font-bold text-amber-700 uppercase tracking-wider">Lagu Pilihan (Pilih salah satu)</span>
                          <ul className="list-disc list-inside mt-1 space-y-1 text-xs text-slate-700">
                            {item.laguPilihan.map((lp, lpIdx) => (
                              <li key={lpIdx}>{lp}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Rules Right Side */}
                <div className="lg:col-span-8 space-y-3">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5 mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-red-600" /> Ketentuan Umum & Persyaratan
                  </h4>
                  <div className="space-y-2.5">
                    {item.ketentuan.map((rule, rIdx) => (
                      <div key={rIdx} className="flex gap-2.5 items-start bg-slate-50 p-3 border border-slate-200/50 rounded-2xl hover:bg-slate-100/50 transition-colors">
                        <div className="w-5 h-5 rounded-full bg-red-100 text-red-600 font-bold font-mono text-xxs flex items-center justify-center shrink-0 mt-0.5 border border-red-200">
                          {rIdx + 1}
                        </div>
                        <p className="text-xs text-slate-700 leading-relaxed">{rule}</p>
                      </div>
                    ))}
                  </div>

                  {/* Rewards Footer Info */}
                  <div className="mt-4 p-3 bg-amber-50 border border-amber-200 rounded-xl flex items-center gap-2 text-amber-800">
                    <Award className="w-4 h-4 text-amber-600 shrink-0 animate-pulse" />
                    <span className="text-xxs font-medium">Penghargaan: Piala bergilir, sertifikat prestasi, dan uang pembinaan untuk Juara I, II, dan III.</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}

        {filteredJuknis.length === 0 && (
          <div className="text-center py-10 bg-white border border-slate-200 rounded-3xl text-slate-500 shadow-xs">
            <p className="text-sm">Tidak ada ketentuan teknis yang sesuai dengan pencarian Anda.</p>
          </div>
        )}
      </div>
    </div>
  );
};
