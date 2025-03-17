import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LoginForm } from "@/components/auth/LoginForm";
import { Link } from "wouter";

export default function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">
            JeRent Cars
          </CardTitle>
          <p className="text-center text-gray-500">
            Inicia sesión en tu cuenta
          </p>
        </CardHeader>
        <CardContent>
          <LoginForm />
          <div className="mt-4 text-center text-sm">
            ¿No tienes una cuenta?{" "}
            <Link href="/register">
              <a className="text-blue-600 hover:underline">Regístrate</a>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
