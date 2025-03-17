import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@shared/supabase";
import type { InsertVehicle } from "@shared/schema";
import { insertVehicleSchema } from "@shared/schema";

interface VehicleFormProps {
  onSuccess?: () => void;
}

export function VehicleForm({ onSuccess }: VehicleFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertVehicle>({
    resolver: zodResolver(insertVehicleSchema),
    defaultValues: {
      brand: "",
      model: "",
      year: new Date().getFullYear(),
      plate: "",
      status: "available",
      photos: [],
    },
  });

  const handlePhotoUpload = async (file: File, perspective: string) => {
    const path = `vehicles/${Date.now()}_${perspective}_${file.name}`;
    const { error } = await supabase.storage
      .from("vehicle-photos")
      .upload(path, file);

    if (error) throw error;
    return path;
  };

  const { mutate: createVehicle } = useMutation({
    mutationFn: async (data: InsertVehicle & { photoFiles?: { [key: string]: File } }) => {
      const { photoFiles, ...vehicleData } = data;
      const photos: string[] = [];

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("User not authenticated");

      if (photoFiles) {
        for (const [perspective, file] of Object.entries(photoFiles)) {
          const path = await handlePhotoUpload(file, perspective);
          photos.push(path);
        }
      }

      const { error } = await supabase
        .from("vehicles")
        .insert([{ ...vehicleData, photos, organization_id: user.user_metadata.organization_id }]);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["vehicles"] });
      toast({
        title: "Vehículo creado",
        description: "El vehículo se ha creado exitosamente",
      });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el vehículo",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createVehicle(data))} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="details">Detalles</TabsTrigger>
            <TabsTrigger value="photos">Fotos</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="brand"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="model"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Modelo</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="year"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Año</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="plate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="details">
            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar estado" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="available">Disponible</SelectItem>
                      <SelectItem value="rented">Rentado</SelectItem>
                      <SelectItem value="maintenance">En Mantenimiento</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>

          <TabsContent value="photos">
            <div className="space-y-4">
              <label className="text-sm font-medium">Fotos del Vehículo</label>
              {["front", "rear", "left", "right", "dashboard"].map((perspective) => (
                <FormItem key={perspective}>
                  <FormLabel className="capitalize">{perspective}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue(`photoFiles.${perspective}`, file);
                        }
                      }}
                    />
                  </FormControl>
                </FormItem>
              ))}
            </div>
          </TabsContent>
        </Tabs>

        <Button type="submit" className="w-full">
          Crear Vehículo
        </Button>
      </form>
    </Form>
  );
}
