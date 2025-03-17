import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@shared/supabase";
import { useToast } from "@/hooks/use-toast";
import { Trash } from "lucide-react";

const RECORD_TYPES = [
  { id: "vehicles", label: "Vehículos" },
  { id: "drivers", label: "Conductores" },
  { id: "activities", label: "Actividades" },
  { id: "revenues", label: "Ingresos" },
  { id: "expenses", label: "Gastos" },
];

type CustomField = {
  name: string;
  type: "text" | "number" | "date" | "boolean";
  required: boolean;
};

export default function Settings() {
  const { toast } = useToast();
  const [selectedType, setSelectedType] = useState(RECORD_TYPES[0].id);
  const [newField, setNewField] = useState<CustomField>({
    name: "",
    type: "text",
    required: false,
  });

  const { data: customFields, isLoading } = useQuery({
    queryKey: ["custom-fields", selectedType],
    queryFn: async () => {
      const { data, error } = await supabase
        .from(selectedType)
        .select("custom_fields")
        .limit(1);

      if (error) throw error;
      return (data?.[0]?.custom_fields as CustomField[]) || [];
    },
  });

  const queryClient = useQueryClient();

  const { mutate: saveCustomField } = useMutation({
    mutationFn: async (field: CustomField) => {
      // Add the new custom field to the schema
      const { error } = await supabase.rpc("add_custom_field", {
        table_name: selectedType,
        field_name: field.name,
        field_type: field.type,
      });

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["custom-fields", selectedType] });
      toast({
        title: "Campo personalizado agregado",
        description: "El campo se ha agregado exitosamente",
      });
      setNewField({ name: "", type: "text", required: false });
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo agregar el campo personalizado",
      });
    },
  });

  if (isLoading) {
    return <div>Cargando configuración...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Configuración</h1>

      <Card>
        <CardHeader>
          <CardTitle>Campos Personalizados</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedType} onValueChange={setSelectedType}>
            <TabsList className="grid grid-cols-5">
              {RECORD_TYPES.map((type) => (
                <TabsTrigger key={type.id} value={type.id}>
                  {type.label}
                </TabsTrigger>
              ))}
            </TabsList>

            {RECORD_TYPES.map((type) => (
              <TabsContent key={type.id} value={type.id}>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <Input
                      placeholder="Nombre del campo"
                      value={newField.name}
                      onChange={(e) =>
                        setNewField({ ...newField, name: e.target.value })
                      }
                    />
                    <Select
                      value={newField.type}
                      onValueChange={(value: "text" | "number" | "date" | "boolean") =>
                        setNewField({ ...newField, type: value })
                      }
                    >
                      <SelectTrigger className="w-[200px]">
                        <SelectValue placeholder="Tipo de dato" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Texto</SelectItem>
                        <SelectItem value="number">Número</SelectItem>
                        <SelectItem value="date">Fecha</SelectItem>
                        <SelectItem value="boolean">Si/No</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button
                      onClick={() => saveCustomField(newField)}
                      disabled={!newField.name || !newField.type}
                    >
                      Agregar Campo
                    </Button>
                  </div>

                  <div className="rounded-lg border">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Nombre
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Tipo
                          </th>
                          <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {customFields?.map((field, index) => (
                          <tr key={index} className="border-b">
                            <td className="px-4 py-3 text-sm">{field.name}</td>
                            <td className="px-4 py-3 text-sm">{field.type}</td>
                            <td className="px-4 py-3 text-sm">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                              >
                                <Trash className="h-4 w-4" />
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
