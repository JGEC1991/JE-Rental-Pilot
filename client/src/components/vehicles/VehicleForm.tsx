import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface VehicleFormProps {
  onSuccess: () => void;
}

export function VehicleForm({ onSuccess }: VehicleFormProps) {
  const [formData, setFormData] = useState({
    brand: "",
    model: "",
    year: "",
    plate: "",
    status: "available"
  });

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // Simple form submission logic here.  This would need to be replaced with actual API call if needed.
    onSuccess();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label>Marca</label>
        <Input 
          value={formData.brand}
          onChange={e => setFormData({...formData, brand: e.target.value})}
        />
      </div>
      <div>
        <label>Modelo</label>
        <Input 
          value={formData.model}
          onChange={e => setFormData({...formData, model: e.target.value})}
        />
      </div>
      <div>
        <label>Año</label>
        <Input 
          value={formData.year}
          onChange={e => setFormData({...formData, year: e.target.value})}
        />
      </div>
      <div>
        <label>Placa</label>
        <Input 
          value={formData.plate}
          onChange={e => setFormData({...formData, plate: e.target.value})}
        />
      </div>
      <div>
        <label>Estado</label>
        <Select value={formData.status} onValueChange={value => setFormData({...formData, status: value})}>
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="available">Disponible</SelectItem>
            <SelectItem value="rented">Rentado</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <Button type="submit">Guardar</Button>
    </form>
  );
}
