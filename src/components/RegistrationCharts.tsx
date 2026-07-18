import React, { useState, useMemo } from "react";
import { 
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, 
  CartesianGrid, AreaChart, Area, PieChart, Pie, Cell, Legend
} from "recharts";
import { Registration } from "../types";
import { BarChart3, TrendingUp, MapPin, Award, CheckCircle } from "lucide-react";

interface RegistrationChartsProps {
  registrations: Registration[];
}

export const RegistrationCharts: React.FC<RegistrationChartsProps> = ({ registrations }) => {
  const [activeChartTab, setActiveChartTab] = useState<"cabang" | "tren" | "desa">("cabang");

  // Process data for Cabang Lomba
  const cabangData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    registrations.forEach((r) => {
      const name = r.cabangLomba || "Lainnya";
      counts[name] = (counts[name] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        name: name.replace("Lagu Tradisional - ", "").replace("Paduan Suara - ", "Paduan Suara ").replace("Vocal Solo - ", "Solo "),
        Jumlah: count,
      }))
      .sort((a, b) => b.Jumlah - a.Jumlah);
  }, [registrations]);

  // Process data for Tren Pendaftaran
  const trenData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    registrations.forEach((r) => {
      if (!r.tanggalDaftar) return;
      try {
        const d = new Date(r.tanggalDaftar);
        const key = d.toLocaleDateString("id-ID", { day: "numeric", month: "short" });
        counts[key] = (counts[key] || 0) + 1;
      } catch (e) {
        // ignore invalid date
      }
    });

    const entries = Object.entries(counts).map(([date, count]) => ({
      Tanggal: date,
      Pendaftar: count,
    }));

    // If empty, put mock or placeholder representing empty system state elegantly
    if (entries.length === 0) {
      return [
        { Tanggal: "Belum Ada", Pendaftar: 0 }
      ];
    }
    return entries;
  }, [registrations]);

  // Process data for Desa asal peserta
  const desaData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    registrations.forEach((r) => {
      const village = r.dataPeserta?.desa || "Kandui";
      counts[village] = (counts[village] || 0) + 1;
    });

    return Object.entries(counts)
      .map(([name, count]) => ({
        Desa: name,
        Pendaftar: count,
      }))
      .sort((a, b) => b.Pendaftar - a.Pendaftar)
      .slice(0, 8); // top 8 villages for visual cleanliness
  }, [registrations]);

  // Colors for charts
  const RED_GRADIENT = ["#ef4444", "#dc2626", "#b91c1c", "#991b1b"];
  const AMBER_GRADIENT = ["#f59e0b", "#d97706", "#b45309", "#78350f"];

  return (
    <div className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-xs space-y-6 text-left">
      {/* Chart Card Header with switcher */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 pb-5">
        <div className="space-y-1">
          <h3 className="text-lg font-black text-slate-900 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-red-600" /> Grafik Statistik Pendaftaran Peserta
          </h3>
          <p className="text-xs text-slate-500 font-medium">
            Visualisasi data real-time pendaftar lomba tingkat Kecamatan Gunung Timang.
          </p>
        </div>

        {/* Tab switch buttons */}
        <div className="flex flex-wrap gap-1.5 bg-slate-50 p-1 border border-slate-200 rounded-2xl">
          <button
            onClick={() => setActiveChartTab("cabang")}
            className={`px-3 py-2 text-xxs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === "cabang"
                ? "bg-white text-red-600 shadow-xxs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <Award className="w-3.5 h-3.5" /> Cabang Lomba
          </button>
          <button
            onClick={() => setActiveChartTab("tren")}
            className={`px-3 py-2 text-xxs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === "tren"
                ? "bg-white text-red-600 shadow-xxs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" /> Tren Harian
          </button>
          <button
            onClick={() => setActiveChartTab("desa")}
            className={`px-3 py-2 text-xxs font-extrabold uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center gap-1.5 ${
              activeChartTab === "desa"
                ? "bg-white text-red-600 shadow-xxs border border-slate-200"
                : "text-slate-500 hover:text-slate-800"
            }`}
          >
            <MapPin className="w-3.5 h-3.5" /> Top 8 Desa
          </button>
        </div>
      </div>

      {/* Main Chart viewport */}
      <div className="h-72 w-full pt-2">
        {registrations.length === 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center space-y-2 text-slate-400 bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 p-8">
            <BarChart3 className="w-10 h-10 text-slate-300 animate-pulse" />
            <p className="text-xs font-semibold">Belum ada data pendaftar untuk divisualisasikan.</p>
            <p className="text-[10px] text-slate-400">Statistik otomatis terisi setelah pendaftar pertama mendaftar.</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            {activeChartTab === "cabang" ? (
              <BarChart data={cabangData} margin={{ top: 10, right: 10, left: -25, bottom: 10 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ef4444" stopOpacity={0.9}/>
                    <stop offset="100%" stopColor="#b91c1c" stopOpacity={0.9}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="name" 
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(148, 163, 184, 0.08)", radius: 8 }}
                  contentStyle={{ 
                    backgroundColor: "#1e293b", 
                    borderRadius: "16px", 
                    border: "none", 
                    boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
                    color: "#fff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                  itemStyle={{ color: "#ef4444" }}
                />
                <Bar 
                  dataKey="Jumlah" 
                  fill="url(#barGradient)" 
                  radius={[6, 6, 0, 0]} 
                  maxBarSize={45}
                />
              </BarChart>
            ) : activeChartTab === "tren" ? (
              <AreaChart data={trenData} margin={{ top: 10, right: 15, left: -25, bottom: 10 }}>
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="Tanggal" 
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: "#1e293b", 
                    borderRadius: "16px", 
                    border: "none", 
                    color: "#fff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                  itemStyle={{ color: "#ef4444" }}
                />
                <Area 
                  type="monotone" 
                  dataKey="Pendaftar" 
                  stroke="#dc2626" 
                  strokeWidth={2.5}
                  fillOpacity={1} 
                  fill="url(#areaGradient)" 
                />
              </AreaChart>
            ) : (
              <BarChart data={desaData} layout="vertical" margin={{ top: 5, right: 15, left: -10, bottom: 5 }}>
                <defs>
                  <linearGradient id="barDesaGradient" x1="0" y1="0" x2="1" y2="0">
                    <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.95}/>
                    <stop offset="100%" stopColor="#d97706" stopOpacity={0.95}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
                <XAxis 
                  type="number"
                  allowDecimals={false}
                  tick={{ fill: "#64748b", fontSize: 10, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis 
                  type="category" 
                  dataKey="Desa" 
                  tick={{ fill: "#64748b", fontSize: 9, fontWeight: 700 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip 
                  cursor={{ fill: "rgba(148, 163, 184, 0.05)" }}
                  contentStyle={{ 
                    backgroundColor: "#1e293b", 
                    borderRadius: "16px", 
                    border: "none", 
                    color: "#fff",
                    fontFamily: "Inter, sans-serif",
                    fontSize: "11px",
                    fontWeight: "bold"
                  }}
                  itemStyle={{ color: "#f59e0b" }}
                />
                <Bar 
                  dataKey="Pendaftar" 
                  fill="url(#barDesaGradient)" 
                  radius={[0, 4, 4, 0]} 
                  maxBarSize={18}
                />
              </BarChart>
            )}
          </ResponsiveContainer>
        )}
      </div>

      {/* Dynamic Summary Cards under Chart */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 border-t border-slate-100 pt-5">
        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
          <div className="p-2 bg-red-100 text-red-600 rounded-xl shrink-0">
            <CheckCircle className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Terverifikasi</p>
            <p className="text-sm font-extrabold text-slate-800">
              {registrations.filter(r => r.status === "Terverifikasi").length} Peserta
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-xl shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Menunggu</p>
            <p className="text-sm font-extrabold text-slate-800">
              {registrations.filter(r => r.status === "Menunggu Verifikasi").length} Berkas
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-150 rounded-2xl">
          <div className="p-2 bg-slate-200 text-slate-600 rounded-xl shrink-0">
            <Award className="w-4 h-4" />
          </div>
          <div className="text-left">
            <p className="text-[10px] text-slate-400 font-extrabold uppercase">Total Cabang</p>
            <p className="text-sm font-extrabold text-slate-800">
              {new Set(registrations.map(r => r.cabangLomba)).size} Kategori
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
