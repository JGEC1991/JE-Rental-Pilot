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
import type { InsertDriver } from "@shared/schema";
import { insertDriverSchema } from "@shared/schema";

interface DriverFormProps {
  onSuccess?: () => void;
}

const DOCUMENT_TYPES = [
  { id: "license", label: "Licencia de Conducir" },
  { id: "police_record", label: "Record Policial" },
  { id: "criminal_record", label: "Record Criminal" },
  { id: "contract", label: "Contrato" },
];

export function DriverForm({ onSuccess }: DriverFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertDriver>({
    resolver: zodResolver(insertDriverSchema),
    defaultValues: {
      name: "",
      license_number: "",
      phone: "",
      status: "active",
      documents: {},
    },
  });

  const handleDocumentUpload = async (file: File, documentType: string) => {
    const path = `${Date.now()}_${documentType}_${file.name}`;
    const { error, data } = await supabase.storage
      .from("driver-documents")
      .upload(path, file);

    if (error) throw error;
    
    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from("driver-documents")
      .getPublicUrl(path);
      
    return publicUrl;
  };

  const { mutate: createDriver } = useMutation({
    mutationFn: async (data: InsertDriver & { documentFiles?: { [key: string]: File } }) => {
      const { documentFiles, ...driverData } = data;
      const documents: { [key: string]: string } = {};

      if (documentFiles) {
        for (const [type, file] of Object.entries(documentFiles)) {
          const path = await handleDocumentUpload(file, type);
          documents[type] = path;
        }
      }

      // Create auth user for the driver
      const { data: { user: currentUser } } = await supabase.auth.getUser();
      if (!currentUser) throw new Error("Not authenticated");

      // Create driver record
      const { error: dbError } = await supabase
        .from("drivers")
        .insert([{ 
          ...driverData, 
          documents,
          organization_id: currentUser.user_metadata.organization_id,
        }]);

      if (dbError) throw dbError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["drivers"] });
      toast({
        title: "Conductor creado",
        description: "El conductor se ha creado exitosamente",
      });
      if (onSuccess) onSuccess();
      form.reset();
    },
    onError: () => {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo crear el conductor",
      });
    },
  });

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit((data) => createDriver(data))} className="space-y-4">
        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="basic">Información Básica</TabsTrigger>
            <TabsTrigger value="account">Cuenta</TabsTrigger>
            <TabsTrigger value="documents">Documentos</TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="license_number"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Número de Licencia</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

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
                        <SelectItem value="active">Activo</SelectItem>
                        <SelectItem value="inactive">Inactivo</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="account">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </TabsContent>

          <TabsContent value="documents">
            <div className="space-y-4">
              <label className="text-sm font-medium">Documentos</label>
              {DOCUMENT_TYPES.map((docType) => (
                <FormItem key={docType.id}>
                  <FormLabel>{docType.label}</FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept=".pdf,.jpg,.jpeg,.png"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          form.setValue(`documentFiles.${docType.id}`, file);
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
          Crear Conductor
        </Button>
      </form>
    </Form>
  );
}
