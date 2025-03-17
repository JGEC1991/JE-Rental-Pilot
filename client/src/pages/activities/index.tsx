import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { useLocation } from "wouter";
import { supabase } from "@shared/supabase";
import type { Activity } from "@shared/schema";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"; //Import Dialog components
import { ActivityForm } from "@/components/forms/ActivityForm"; //Import ActivityForm


export default function Activities() {
  const [_, setLocation] = useLocation();
  const [filter, setFilter] = useState("all");
  const [isOpen, setIsOpen] = useState(false); // Add state for dialog

  const { data: activities, isLoading } = useQuery({
    queryKey: ["activities"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("activities")
        .select(`
          *,
          vehicles (
            brand,
            model,
            plate
          ),
          drivers (
            name
          )
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as (Activity & {
        vehicles: { brand: string; model: string; plate: string };
        drivers: { name: string };
      })[];
    },
  });

  const filteredActivities = activities?.filter(activity =>
    filter === "all" ? true : activity.type === filter
  );

  if (isLoading) {
    return <div>Cargando actividades...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Actividades</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}> {/* Dialog component */}
          <DialogTrigger asChild>
            <Button> {/* Existing button inside DialogTrigger */}
              <Plus className="mr-2 h-4 w-4" />
              Nueva Actividad
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Actividad</DialogTitle>
            </DialogHeader>
            <ActivityForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex items-center space-x-4">
        <Select value={filter} onValueChange={setFilter}>
          <SelectTrigger className="w-[200px]">
            <SelectValue placeholder="Filtrar por tipo" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Todos</SelectItem>
            <SelectItem value="payment">Pagos</SelectItem>
            <SelectItem value="maintenance">Mantenimiento</SelectItem>
            <SelectItem value="incident">Incidentes</SelectItem>
            <SelectItem value="repair">Reparaciones</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Fecha
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Tipo
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Vehículo
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Conductor
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Descripción
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Monto
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Recurrente
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredActivities?.map((activity) => (
              <tr
                key={activity.id}
                className="border-b hover:bg-gray-50 cursor-pointer"
                onClick={() => setLocation(`/activities/${activity.id}`)}
              >
                <td className="px-4 py-3 text-sm">
                  {new Date(activity.date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    activity.type === "payment"
                      ? "bg-green-100 text-green-700"
                      : activity.type === "maintenance"
                      ? "bg-blue-100 text-blue-700"
                      : activity.type === "incident"
                      ? "bg-red-100 text-red-700"
                      : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {activity.type === "payment" ? "Pago" :
                      activity.type === "maintenance" ? "Mantenimiento" :
                        activity.type === "incident" ? "Incidente" : "Reparación"}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">
                  {activity.vehicles.brand} {activity.vehicles.model} ({activity.vehicles.plate})
                </td>
                <td className="px-4 py-3 text-sm">
                  {activity.drivers.name}
                </td>
                <td className="px-4 py-3 text-sm">
                  {activity.description}
                </td>
                <td className="px-4 py-3 text-sm">
                  ${activity.amount}
                </td>
                <td className="px-4 py-3 text-sm">
                  {activity.recurring ? "Sí" : "No"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
