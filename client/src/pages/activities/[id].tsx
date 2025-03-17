import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@shared/supabase";
import type { Activity } from "@shared/schema";

export default function ActivityDetail() {
  const { id } = useParams();
  
  const { data: activity, isLoading } = useQuery({
    queryKey: ["activity", id],
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
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Activity & {
        vehicles: { brand: string; model: string; plate: string };
        drivers: { name: string };
      };
    },
  });

  if (isLoading) {
    return <div>Cargando detalles de la actividad...</div>;
  }

  if (!activity) {
    return <div>Actividad no encontrada</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        Detalles de Actividad
      </h1>

      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <p className="mt-1">
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
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Vehículo</label>
              <p className="mt-1">
                {activity.vehicles.brand} {activity.vehicles.model} ({activity.vehicles.plate})
              </p>
            </div>
            <div>
              <label className="text-sm font-medium">Conductor</label>
              <p className="mt-1">{activity.drivers.name}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Fecha</label>
              <p className="mt-1">{new Date(activity.date).toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Monto</label>
              <p className="mt-1">${activity.amount}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Recurrente</label>
              <p className="mt-1">
                {activity.recurring ? (
                  <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-purple-100 text-purple-700">
                    {activity.recurring_frequency === "daily"
                      ? "Diario"
                      : activity.recurring_frequency === "weekly"
                      ? "Semanal"
                      : "Mensual"}
                  </span>
                ) : (
                  "No"
                )}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium">Descripción</label>
            <p className="mt-1">{activity.description}</p>
          </div>

          {activity.custom_fields && (
            <div>
              <label className="text-sm font-medium">Campos Personalizados</label>
              <div className="mt-1 space-y-2">
                {Object.entries(activity.custom_fields).map(([key, value]) => (
                  <div key={key}>
                    <span className="font-medium">{key}:</span> {value}
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
