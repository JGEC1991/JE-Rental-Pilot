import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { DriverForm } from "@/components/forms/DriverForm";
import { supabase } from "@shared/supabase";
import type { Driver } from "@shared/schema";

export default function Drivers() {
  const [_, setLocation] = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const { data: drivers, isLoading } = useQuery({
    queryKey: ["drivers"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as Driver[];
    },
  });

  if (isLoading) {
    return <div>Cargando conductores...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Conductores</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Conductor
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Conductor</DialogTitle>
            </DialogHeader>
            <DriverForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Nombre
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Licencia
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Teléfono
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {drivers?.map((driver) => (
              <tr 
                key={driver.id} 
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setLocation(`/drivers/${driver.id}`)}
              >
                <td className="px-4 py-3 text-sm">{driver.name}</td>
                <td className="px-4 py-3 text-sm">{driver.license_number}</td>
                <td className="px-4 py-3 text-sm">{driver.phone}</td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      driver.status === "active"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {driver.status === "active" ? "Activo" : "Inactivo"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
