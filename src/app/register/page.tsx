import { registerAction } from "./actions";
import RegisterForm from "./RegisterForm";

export default function RegisterPage() {
  return (
    <div className="grid gap-4 max-w-md">
      <h1 className="text-xl font-bold">สมัครสมาชิก</h1>
      <form action={registerAction} className="card grid gap-3 p-4">
        <RegisterForm />
      </form>
    </div>
  );
}
