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

"use client";

import React from "react";
import { RotateCcw } from "lucide-react";

interface FloatingSaveBarProps {
  show?: boolean;
  saving?: boolean;
  onReset: () => void;
  onSave: () => void;
  message?: string;
  saveText?: string;
}

export function FloatingSaveBar({
  show = true,
  saving = false,
  onReset,
  onSave,
  message = "Careful — you have unsaved changes!",
  saveText = "Save Changes",
}: FloatingSaveBarProps) {
  if (!show) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 sm:left-auto sm:right-8 z-50 transition-all duration-200">
      <div className="shadow-2xl rounded-2xl py-3 px-5 select-none bg-[#2b2c32] max-w-xl mx-auto sm:mx-0">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="font-medium text-sm text-gray-200">{message}</div>

          <div className="flex items-center gap-2.5 w-full sm:w-auto">
            <button
              type="button"
              onClick={onReset}
              disabled={saving}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/5 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-1 sm:flex-none"
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onSave}
              disabled={saving}
              className="px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-1.5 flex-1 sm:flex-none disabled:opacity-50 cursor-pointer"
            >
              {saving ? <RotateCcw className="w-3.5 h-3.5 animate-spin" /> : null}
              <span>{saveText}</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
