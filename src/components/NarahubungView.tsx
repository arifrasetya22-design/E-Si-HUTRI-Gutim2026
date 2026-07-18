/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Phone, MessageSquare, ShieldCheck, UserCheck } from "lucide-react";

interface Contact {
  nama: string;
  phone: string;
  seksi: string;
  avatarInitials: string;
}

export const NarahubungView: React.FC = () => {
  const seksiTari: Contact[] = [
    {
      nama: "Martan Sitaboyan",
      phone: "0813-4633-6706",
      seksi: "Seksi Tari dan Karaoke",
      avatarInitials: "MS",
    },
    {
      nama: "Amaludin",
      phone: "0852-5287-8332",
      seksi: "Seksi Tari dan Karaoke",
      avatarInitials: "AM",
    },
    {
      nama: "Tamara Dewi",
      phone: "0812-5090-5768",
      seksi: "Seksi Tari dan Karaoke",
      avatarInitials: "TD",
    },
  ];

  const seksiPaduanSuara: Contact[] = [
    {
      nama: "Irma Iriani",
      phone: "0813-8438-6468",
      seksi: "Seksi Paduan Suara dan Vocal Solo",
      avatarInitials: "II",
    },
  ];

  const renderContactCard = (c: Contact, idx: number) => {
    const cleanPhone = c.phone.replace(/[^0-9]/g, "");
    const waLink = `https://wa.me/62${cleanPhone.substring(1)}`; // convert 08xx to 628xx format
    const telLink = `tel:${c.phone}`;

    return (
      <div
        key={idx}
        className="bg-white border border-slate-200 rounded-3xl p-5 hover:shadow-md transition-all duration-300 relative overflow-hidden group text-left shadow-xs"
      >
        {/* Hover background pulse */}
        <div className="absolute inset-0 bg-gradient-to-tr from-red-600/3 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />

        <div className="flex gap-4 items-center mb-4">
          {/* Avatar sphere */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-red-600 to-amber-500 flex items-center justify-center font-bold text-white text-sm border-2 border-white shadow-sm">
            {c.avatarInitials}
          </div>
          <div>
            <h4 className="font-bold text-slate-900 text-sm leading-tight">{c.nama}</h4>
            <p className="text-xxs text-slate-500 mt-1 uppercase tracking-wider font-semibold text-amber-700 flex items-center gap-1">
              <UserCheck className="w-3 h-3 text-red-600" /> {c.seksi}
            </p>
          </div>
        </div>

        {/* Info detail */}
        <div className="p-3 bg-slate-50 border border-slate-200/50 rounded-2xl mb-4 font-mono text-xs text-slate-800 flex items-center justify-between">
          <span className="text-slate-400 uppercase tracking-widest text-xxs">Nomor HP:</span>
          <span className="font-semibold">{c.phone}</span>
        </div>

        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
          {/* WhatsApp */}
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            WhatsApp
          </a>
          {/* Telepon */}
          <a
            href={telLink}
            className="flex items-center justify-center gap-2 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-semibold border border-slate-200 transition-colors cursor-pointer"
          >
            <Phone className="w-3.5 h-3.5 text-red-600" />
            Telepon
          </a>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-8">
      {/* Seksi Tari */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          <h3 className="font-bold text-slate-900 text-base">Seksi Tari dan Karaoke</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {seksiTari.map((c, i) => renderContactCard(c, i))}
        </div>
      </div>

      {/* Seksi Paduan Suara */}
      <div className="space-y-4">
        <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
          <div className="w-1 h-6 bg-red-600 rounded-full" />
          <h3 className="font-bold text-slate-900 text-base">Seksi Paduan Suara dan Vocal Solo</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {seksiPaduanSuara.map((c, i) => renderContactCard(c, i))}
        </div>
      </div>

      {/* Info notice */}
      <div className="p-4 bg-slate-50 border border-slate-200 rounded-3xl flex gap-3.5 items-start text-left shadow-xs">
        <div className="p-2 bg-red-50 text-red-600 rounded-xl shrink-0">
          <ShieldCheck className="w-5 h-5" />
        </div>
        <div>
          <h4 className="font-semibold text-slate-800 text-xs">Aturan Komunikasi</h4>
          <p className="text-xxs text-slate-500 leading-relaxed mt-1">
            Harap hubungi panitia pada jam kerja (08.00 - 17.00 WIB). Pastikan Anda menyebutkan nama pengirim, asal sekolah, dan maksud pesan dengan jelas sebelum bertanya.
          </p>
        </div>
      </div>
    </div>
  );
};
