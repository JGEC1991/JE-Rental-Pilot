import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Car,
  Users,
  Activity,
  DollarSign,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
} from "lucide-react";
import { supabase } from "@shared/supabase";
import { useToast } from "@/hooks/use-toast";
import type { User } from "@shared/schema";

interface DashboardLayoutProps {
  children: React.ReactNode;
}

const adminNavigation = [
  { name: "Vehículos", href: "/vehicles", icon: Car },
  { name: "Conductores", href: "/drivers", icon: Users },
  { name: "Actividades", href: "/activities", icon: Activity },
  { name: "Finanzas", href: "/finances", icon: DollarSign },
  { name: "Usuarios", href: "/admin/users", icon: Shield },
  { name: "Configuración", href: "/settings", icon: Settings },
];

const driverNavigation = [
  { name: "Mi Vehículo", href: "/my-vehicle", icon: Car },
  { name: "Mis Actividades", href: "/my-activities", icon: Activity },
];

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const [location] = useLocation();
  const { toast } = useToast();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const getUser = async () => {
      const { data: { user: authUser } } = await supabase.auth.getUser();
      if (authUser) {
        const { data } = await supabase
          .from("users")
          .select("*")
          .eq("email", authUser.email)
          .single();
        setUser(data);
      }
    };
    getUser();
  }, []);

  const navigation = user?.role === "driver" ? driverNavigation : adminNavigation;

  const handleLogout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      toast({
        title: "Sesión cerrada",
        description: "Has cerrado sesión exitosamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cerrar la sesión",
      });
    }
  };

  return (
    <div className="flex h-screen bg-gray-100">
      <div
        className={`fixed inset-y-0 left-0 z-50 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between px-4 py-6">
            <h1 className="text-xl font-bold">JeRent Cars</h1>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setSidebarOpen(false)}
              className="md:hidden"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          {user && (
            <div className="px-4 py-2 border-b">
              <p className="text-sm font-medium">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>
          )}

          <ScrollArea className="flex-1 px-3">
            <nav className="space-y-1">
              {navigation.map((item) => {
                const isActive = location === item.href;
                return (
                  <Link key={item.name} href={item.href}>
                    <a
                      className={`flex items-center rounded-lg px-3 py-2 text-sm font-medium ${
                        isActive
                          ? "bg-gray-100 text-gray-900"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }`}
                    >
                      <item.icon
                        className={`mr-3 h-6 w-6 flex-shrink-0 ${
                          isActive ? "text-gray-900" : "text-gray-400"
                        }`}
                      />
                      {item.name}
                    </a>
                  </Link>
                );
              })}
            </nav>
          </ScrollArea>
          <div className="border-t p-4">
            <Button
              variant="outline"
              className="w-full justify-start"
              onClick={handleLogout}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between border-b bg-white px-4 md:px-6">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
            className="md:hidden"
          >
            <Menu className="h-6 w-6" />
          </Button>
        </div>
        <main className="flex-1 overflow-auto bg-gray-100 p-4 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
