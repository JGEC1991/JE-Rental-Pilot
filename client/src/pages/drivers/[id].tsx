import { useParams } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@shared/supabase";
import type { Driver } from "@shared/schema";
import { FileUp } from "lucide-react";

const DOCUMENT_TYPES = [
  { id: "license", label: "Licencia de Conducir" },
  { id: "police_record", label: "Record Policial" },
  { id: "criminal_record", label: "Record Criminal" },
  { id: "contract", label: "Contrato" },
];

export default function DriverDetail() {
  const { id } = useParams();
  const { toast } = useToast();

  const { data: driver, isLoading } = useQuery({
    queryKey: ["driver", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("drivers")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Driver;
    },
  });

  const handleDocumentUpload = async (
    event: React.ChangeEvent<HTMLInputElement>,
    documentType: string
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const path = `${id}/${documentType}/${Date.now()}_${file.name}`;
      await supabase.storage
        .from("jerentcars-storage")
        .upload(`drivers/${path}`, file);

      // Update driver's documents in the database
      const { data: currentDriver } = await supabase
        .from("drivers")
        .select("documents")
        .eq("id", id)
        .single();

      const updatedDocuments = {
        ...(currentDriver?.documents || {}),
        [documentType]: path,
      };

      await supabase
        .from("drivers")
        .update({ documents: updatedDocuments })
        .eq("id", id);

      toast({
        title: "Documento subido",
        description: "El documento se ha subido exitosamente",
      });
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo subir el documento",
      });
    }
  };

  if (isLoading) {
    return <div>Cargando detalles del conductor...</div>;
  }

  if (!driver) {
    return <div>Conductor no encontrado</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">
        {driver.name}
      </h1>

      <Tabs defaultValue="info" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="info">Información</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="info">
          <Card>
            <CardContent className="pt-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Nombre</label>
                  <p className="mt-1">{driver.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Licencia</label>
                  <p className="mt-1">{driver.license_number}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Teléfono</label>
                  <p className="mt-1">{driver.phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium">Estado</label>
                  <p className="mt-1">
                    <span
                      className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                        driver.status === "active"
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {driver.status === "active" ? "Activo" : "Inactivo"}
                    </span>
                  </p>
                </div>
              </div>

              {driver.custom_fields && (
                <div>
                  <label className="text-sm font-medium">Campos Personalizados</label>
                  <div className="mt-1 space-y-2">
                    {Object.entries(driver.custom_fields).map(([key, value]) => (
                      <div key={key}>
                        <span className="font-medium">{key}:</span> {value}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents">
          <Card>
            <CardContent className="pt-6">
              <div className="grid grid-cols-2 gap-4">
                {DOCUMENT_TYPES.map((docType) => (
                  <div
                    key={docType.id}
                    className="border-2 border-dashed rounded-lg p-6 text-center"
                  >
                    <input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => handleDocumentUpload(e, docType.id)}
                      className="hidden"
                      id={`document-${docType.id}`}
                    />
                    <label
                      htmlFor={`document-${docType.id}`}
                      className="cursor-pointer flex flex-col items-center"
                    >
                      <FileUp className="h-12 w-12 text-gray-400" />
                      <span className="mt-2 text-sm text-gray-500">
                        {docType.label}
                      </span>
                    </label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
