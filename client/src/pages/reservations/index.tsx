import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { supabase } from "@shared/supabase";
import type { Reservation } from "@shared/schema";

export default function Reservations() {
  const { data: reservations, isLoading } = useQuery({
    queryKey: ["reservations"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("reservations")
        .select(`
          *,
          vehicles (
            brand,
            model,
            plate
          )
        `)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as (Reservation & { vehicles: { brand: string; model: string; plate: string } })[];
    },
  });

  if (isLoading) {
    return <div>Cargando reservas...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Reservas</h1>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Nueva Reserva
        </Button>
      </div>

      <div className="rounded-lg border bg-white">
        <table className="w-full">
          <thead>
            <tr className="border-b">
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Vehículo
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Fecha Inicio
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Fecha Fin
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Monto Total
              </th>
              <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                Estado
              </th>
            </tr>
          </thead>
          <tbody>
            {reservations?.map((reservation) => (
              <tr key={reservation.id} className="border-b">
                <td className="px-4 py-3 text-sm">
                  {reservation.vehicles.brand} {reservation.vehicles.model} ({reservation.vehicles.plate})
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(reservation.start_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  {new Date(reservation.end_date).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-sm">
                  ${reservation.total_amount}
                </td>
                <td className="px-4 py-3 text-sm">
                  <span
                    className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                      reservation.status === "pending"
                        ? "bg-yellow-100 text-yellow-700"
                        : reservation.status === "confirmed"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {reservation.status === "pending"
                      ? "Pendiente"
                      : reservation.status === "confirmed"
                      ? "Confirmada"
                      : "Cancelada"}
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
