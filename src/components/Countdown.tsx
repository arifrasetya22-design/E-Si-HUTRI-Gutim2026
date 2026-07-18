/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from "react";
import { Timer, Calendar, ShieldAlert } from "lucide-react";

export const Countdown: React.FC = () => {
  const targetDate = new Date("2026-08-10T23:59:59").getTime();
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const difference = targetDate - now;

      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true });
        return;
      }

      setTimeLeft({
        days: Math.floor(difference / (1000 * 60 * 60 * 24)),
        hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
        minutes: Math.floor((difference / 1000 / 60) % 60),
        seconds: Math.floor((difference / 1000) % 60),
        isExpired: false,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (timeLeft.isExpired) {
    return (
      <div className="flex items-center gap-3 p-4 bg-red-950/40 border border-red-500/30 rounded-xl text-red-200">
        <ShieldAlert className="w-5 h-5 text-red-500 animate-pulse shrink-0" />
        <div>
          <h4 className="font-semibold text-sm">Pendaftaran Ditutup</h4>
          <p className="text-xs text-red-300">Batas akhir pendaftaran (10 Agustus 2026) telah terlewati.</p>
        </div>
      </div>
    );
  }

  const items = [
    { label: "Hari", value: timeLeft.days, color: "text-red-500" },
    { label: "Jam", value: timeLeft.hours, color: "text-amber-500" },
    { label: "Menit", value: timeLeft.minutes, color: "text-amber-400" },
    { label: "Detik", value: timeLeft.seconds, color: "text-red-400" },
  ];

  return (
    <div className="p-6 bg-white border border-slate-200 rounded-3xl shadow-sm relative overflow-hidden">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-red-50 rounded-lg text-red-600">
            <Timer className="w-4 h-4 animate-spin-slow" />
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm">Sisa Waktu Pendaftaran</h4>
            <p className="text-xxs text-slate-400 uppercase tracking-widest font-semibold">Sistem Ditutup 10 Agustus 2026</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-2">
        {items.map((it, idx) => (
          <div key={idx} className="flex flex-col items-center justify-center p-3 bg-slate-50 border border-slate-100 rounded-2xl relative overflow-hidden group">
            <span className="text-2xl md:text-3xl font-black font-mono tracking-tight text-slate-800">
              {String(it.value).padStart(2, "0")}
            </span>
            <span className="text-[9px] uppercase tracking-widest text-slate-400 mt-1 font-bold">
              {it.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
