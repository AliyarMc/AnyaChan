/**
 * ╔══════════════════════════════════════════════════════════════════╗
 * ║                                                                  ║
 * ║   ░█▀▀░█▀█░█▀▄░█▀▀░█░█   ░█▀▄░█▀▀░█░█░█▀▀                     ║
 * ║   ░█░░░█░█░█░█░█▀▀░▄▀▄   ░█░█░█▀▀░▀▄▀░▀▀█                     ║
 * ║   ░▀▀▀░▀▀▀░▀▀░░▀▀▀░▀░▀   ░▀▀░░▀▀▀░░▀░░▀▀▀                     ║
 * ║                                                                  ║
 * ║           © 2026 ZAPTRO — All Rights Reserved               ║
 * ║                                                                  ║
 * ║   discord  ──  https://discord.gg/zaptro                      ║
 * ║   youtube  ──  https://youtube.com/@ZAPTRO                   ║
 * ║   github   ──  https://github.com/ZAPTRO                        ║
 * ║                                                                  ║
 * ╚══════════════════════════════════════════════════════════════════╝
 */

import React from "react";
import Image from "next/image";
import Link from "next/link";
import { Users, Hash, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ServerCardProps {
  id: string | number;
  name: string;
  iconUrl?: string | null;
  memberCount: number;
  isActive?: boolean;
  className?: string;
}

export const ServerCard = ({
  id,
  name,
  iconUrl,
  memberCount,
  isActive = true,
  className
}: ServerCardProps) => {
  return (
    <div className={cn(
      "bg-white/[0.03] hover:bg-white/[0.05] rounded-2xl group transition-all duration-300 overflow-hidden shadow-xl h-full flex flex-col border border-white/10 hover:border-white/20",
      className
    )}>
      <div className="p-8 flex-grow">
        <div className="flex items-start justify-between mb-8">
          <div className="relative">
            {iconUrl ? (
              <Image
                src={iconUrl}
                alt={name}
                width={80}
                height={80}
                className="rounded-2xl shadow-xl group-hover:scale-105 transition-transform duration-300"
              />
            ) : (
              <div className="h-20 w-20 bg-white/10 rounded-2xl flex items-center justify-center text-white font-black text-3xl shadow-xl group-hover:scale-105 transition-transform duration-300">
                {name.charAt(0)}
              </div>
            )}
            {isActive && (
              <div className="absolute -bottom-1 -right-1 h-4 w-4 rounded-full bg-emerald-500 border-2 border-[#323339] shadow-lg" title="Online" />
            )}
          </div>

          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] uppercase font-black text-slate-500 tracking-[0.2em] mb-1 opacity-50">ID Reference</span>
            <span className="text-[11px] font-mono font-bold text-slate-400 bg-black/20 px-3 py-1.5 rounded-xl border border-white/5 truncate max-w-[140px]">
              {id}
            </span>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-black text-white truncate group-hover:text-primary transition-colors tracking-tight">
            {name}
          </h3>
          <div className="flex items-center gap-4 mt-6">
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
              <Users className="h-4 w-4 text-white" />
              <span className="text-xs font-bold text-slate-200 tabular-nums">
                {memberCount.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-2xl">
              <Hash className="h-4 w-4 text-slate-500" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Managed
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="px-8 py-6 bg-white/[0.02]">
        <Link href={`/dashboard/guild/${id}`} className="block">
          <Button className="w-full justify-between group/btn py-6 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold uppercase tracking-tighter text-xs" variant="secondary">
            <span>Access Dashboard</span>
            <ChevronRight className="h-4 w-4 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </div>
  );
};
