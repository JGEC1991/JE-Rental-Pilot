import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { VehicleForm } from "@/components/forms/VehicleForm";

export default function Vehicles() {
  const [isOpen, setIsOpen] = useState(false);
  const [vehicles, setVehicles] = useState([]); // Initialize with an empty array

  // Simulate fetching data - replace with actual data fetching logic if needed.
  // This is a placeholder and should be replaced with your actual data fetching method.
  // For example, fetching from an API or using a different state management library.
  useState(() => {
    // Fetch vehicles here, then setVehicles(fetchedVehicles);
    // Example (replace with your actual data fetching):
    const fetchData = async () => {
      try {
        const response = await fetch('/api/vehicles'); // Replace with your API endpoint
        const data = await response.json();
        setVehicles(data);
      } catch (error) {
        console.error("Error fetching vehicles:", error);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">Vehículos</h1>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Vehículo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Crear Vehículo</DialogTitle>
            </DialogHeader>
            <VehicleForm onSuccess={() => setIsOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <table className="w-full">
          <thead>
            <tr className="border-b bg-muted/50">
              <th className="p-4 text-left">Marca</th>
              <th className="p-4 text-left">Modelo</th>
              <th className="p-4 text-left">Año</th>
              <th className="p-4 text-left">Placa</th>
              <th className="p-4 text-left">Estado</th>
            </tr>
          </thead>
          <tbody>
            {vehicles.map((vehicle) => (
              <tr key={vehicle.id} className="border-b">
                <td className="p-4">{vehicle.brand}</td>
                <td className="p-4">{vehicle.model}</td>
                <td className="p-4">{vehicle.year}</td>
                <td className="p-4">{vehicle.plate}</td>
                <td className="p-4">
                  <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${
                    vehicle.status === "available" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"
                  }`}>
                    {vehicle.status === "available" ? "Disponible" : "Rentado"}
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
