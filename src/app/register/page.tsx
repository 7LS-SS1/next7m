import RegisterForm from "./_components/RegisterForm";
import { registerAction } from "./actions";

export const metadata = {
  title: "Register",
};

export default function RegisterPage() {
  return (
    <div className="grid min-h-[calc(100vh-120px)] place-items-center p-6">
      <div className="w-full max-w-xl">
        <div className="mb-6 text-center">
          <h1 className="text-2xl font-bold">สร้างบัญชีใหม่</h1>
          <p className="text-sm text-white/70">สมัครสมาชิกใน 3 ขั้นตอนง่าย ๆ</p>
        </div>

        <RegisterForm action={registerAction} />
      </div>
    </div>
  );
}