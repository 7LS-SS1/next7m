// src/app/register/RegisterForm.tsx
"use client";
type Props = {};
export default function RegisterForm(_: Props) {
  return (
    <>
      <input name="email" type="email" placeholder="อีเมล" required className="input" />
      <input name="phone" type="tel" placeholder="เบอร์โทร (ไม่บังคับ)" className="input" />
      <input name="password" type="password" placeholder="รหัสผ่าน (6+ ตัวอักษร)" required className="input" />
      <button type="submit" className="btn-primary">สมัครสมาชิก</button>
    </>
  );
}