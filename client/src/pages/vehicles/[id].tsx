import { useState } from "react";
import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@shared/supabase";
import type { Vehicle } from "@shared/schema";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Camera } from "lucide-react";

const PHOTO_CATEGORIES = [
  { id: "front", label: "Frontal" },
  { id: "rear", label: "Trasera" },
  { id: "left", label: "Lateral Izquierdo" },
  { id: "right", label: "Lateral Derecho" },
  { id: "dashboard", label: "Tablero" },
];

export default function VehicleDetail() {
  const { id } = useParams();
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState("front");

  const { data: vehicle, isLoading } = useQuery({
    queryKey: ["vehicle", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("vehicles")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Vehicle;
    },
  });

  const handlePhotoUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const path = `${id}/${selectedCategory}/${Date.now()}_${file.name}`;
      await supabase.storage
        .from("jerentcars-storage")
        .upload(`vehicles/${path}`, file);

      toast({
        title: "Foto subida",
        description: "La foto se ha subido exitosamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir la foto",
      });
    }
  };

  if (isLoading) {
    return <div>Cargando detalles del vehículo...</div>;
  }

  if (!vehicle) {
    return <div>Vehículo no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">
          {vehicle.brand} {vehicle.model} ({vehicle.year})
        </h1>
      </div>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="photos">Fotos</TabsTrigger>
          <TabsTrigger value="maintenance">Mantenimiento</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Marca</label>
                  <p className="mt-1">{vehicle.brand}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Modelo</label>
                  <p className="mt-1">{vehicle.model}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Año</label>
                  <p className="mt-1">{vehicle.year}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Placa</label>
                  <p className="mt-1">{vehicle.plate}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        vehicle.status === "available"
                          ? "bg-green-100 text-green-700"
                          : "bg-yellow-100 text-yellow-700"
                      }`}
                    >
                      {vehicle.status === "available" ? "Disponible" : "Rentado"}
                    </span>
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="photos">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div className="flex space-x-2">
                  {PHOTO_CATEGORIES.map((category) => (
                    <Button
                      key={category.id}
                      variant={selectedCategory === category.id ? "default" : "outline"}
                      onClick={() => setSelectedCategory(category.id)}
                    >
                      {category.label}
                    </Button>
                  ))}
                </div>

                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handlePhotoUpload}
                    className="hidden"
                    id="photo-upload"
                  />
                  <label
                    htmlFor="photo-upload"
                    className="cursor-pointer flex flex-col items-center"
                  >
                    <Camera className="h-12 w-12 text-gray-400" />
                    <span className="mt-2 text-sm text-gray-500">
                      Haga clic para subir una foto {
                        PHOTO_CATEGORIES.find(c => c.id === selectedCategory)?.label
                      }
                    </span>
                  </label>
                </div>

                {/* Photo grid will go here */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  {/* We'll implement photo display in the next iteration */}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance">
          <Card>
            <CardContent className="pt-6">
              {/* We'll implement maintenance history in the next iteration */}
              <p className="text-center text-gray-500">
                Historial de mantenimiento próximamente
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
