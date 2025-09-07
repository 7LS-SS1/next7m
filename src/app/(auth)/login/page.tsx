"use client";

import { useFormState } from "react-dom";
import { loginAction } from "./actions";
import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

import Logo from "@/assets/logo/logo.png";
import Icon from "@/assets/icons/UFABET7M-MINI.png";

export const runtime = "nodejs";

import LoginForm from "./LoginForm";

export default function LoginPage() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="w-full max-w-3xl rounded-2xl bg-[rgb(var(--card))] shadow-xl ring-1 ring-white/10 overflow-hidden">
        <div className="grid grid-cols-1 md:grid-cols-2">
          {/* panel ซ้าย */}
          <div className="hidden md:flex flex-col items-center justify-center bg-gradient-to-br from-white/10 to-white/0 p-6 text-center">
            <div className="size-24 w-full p-4 rounded-md bg-white/10 grid place-items-center text-5xl">
              <Image src={Logo} alt="BC.GAME" className="w-full" />
            </div>
            <h2 className="mt-4 text-2xl font-bold">อยู่ อย่าง ไม่ เสี่ยง</h2>
            <p className="mt-2 text-white/70 text-sm">
              รับโบนัสต้อนรับสูงสุด{" "}
              <span className="text-yellow-500 font-semibold">$20,000</span>
            </p>
          </div>

          {/* ฟอร์ม */}
          <div className="p-6 md:p-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 font-semibold">
                <div className="size-8 grid place-items-center rounded-lg bg-white/10">
                  <Image src={Icon} alt="icon" className="w-5" />
                </div>
                เข้าสู่ระบบ
              </div>
              <Link
                href="/"
                className="rounded-lg px-2 py-1 text-white/60 hover:bg-white/10"
              >
                ✕
              </Link>
            </div>

            <LoginForm />
          </div>
        </div>
      </div>
    </div>
  );
}