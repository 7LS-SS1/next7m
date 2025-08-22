"use client";

import { useFormState } from "react-dom";
import { registerAction } from "./actions";

export default function RegisterForm() {
  const [state, formAction] = useFormState(registerAction, { ok: false, message: "" });

  return (
    <main className="p-6 max-w-sm mx-auto">
      <h1 className="text-xl font-semibold">Register</h1>
      <form action={formAction} className="mt-4 space-y-3">
        <input
          name="email"
          type="email"
          required
          placeholder="Email"
          autoComplete="email"
          className="w-full border rounded p-2"
        />
        <input
          name="password"
          type="password"
          required
          placeholder="Password (min 8)"
          autoComplete="new-password"
          minLength={8}
          className="w-full border rounded p-2"
        />
        <button className="w-full rounded bg-black text-white py-2">Create account</button>
      </form>

      {state.message ? (
        <p className={`mt-3 text-sm ${state.ok ? "text-green-600" : "text-red-600"}`}>
          {state.message}
        </p>
      ) : null}
    </main>
  );
}