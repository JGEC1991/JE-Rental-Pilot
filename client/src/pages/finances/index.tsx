import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { supabase } from "@shared/supabase";
import type { Revenue, Expense } from "@shared/schema";
import { TrendingUp, TrendingDown, DollarSign } from "lucide-react";

export default function Finances() {
  const { data: revenues, isLoading: loadingRevenues } = useQuery({
    queryKey: ["revenues"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("revenues")
        .select(`
          *,
          activities (
            type,
            description,
            vehicle_id,
            driver_id
          )
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as (Revenue & { 
        activities: { 
          type: string; 
          description: string;
          vehicle_id: number;
          driver_id: number;
        } 
      })[];
    },
  });

  const { data: expenses, isLoading: loadingExpenses } = useQuery({
    queryKey: ["expenses"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("expenses")
        .select(`
          *,
          activities (
            type,
            description,
            vehicle_id,
            driver_id
          )
        `)
        .order("date", { ascending: false });

      if (error) throw error;
      return data as (Expense & { 
        activities: { 
          type: string; 
          description: string;
          vehicle_id: number;
          driver_id: number;
        } 
      })[];
    },
  });

  const totalRevenue = revenues?.reduce((sum, rev) => sum + rev.amount, 0) || 0;
  const totalExpenses = expenses?.reduce((sum, exp) => sum + exp.amount, 0) || 0;
  const netIncome = totalRevenue - totalExpenses;

  if (loadingRevenues || loadingExpenses) {
    return <div>Cargando datos financieros...</div>;
  }

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold">Finanzas</h1>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ingresos Totales
            </CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Gastos Totales
            </CardTitle>
            <TrendingDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${totalExpenses.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Ingreso Neto
            </CardTitle>
            <DollarSign className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netIncome >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netIncome.toLocaleString()}
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="revenues" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="revenues">Ingresos</TabsTrigger>
          <TabsTrigger value="expenses">Gastos</TabsTrigger>
        </TabsList>

        <TabsContent value="revenues">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {revenues?.map((revenue) => (
                      <tr key={revenue.id} className="border-b">
                        <td className="px-4 py-3 text-sm">
                          {new Date(revenue.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{revenue.description}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-green-100 text-green-700">
                            {revenue.activities?.type || "Ingreso"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">${revenue.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="expenses">
          <Card>
            <CardContent className="pt-6">
              <div className="rounded-lg border">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Fecha</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Descripción</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Tipo</th>
                      <th className="px-4 py-3 text-left text-sm font-medium text-gray-500">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses?.map((expense) => (
                      <tr key={expense.id} className="border-b">
                        <td className="px-4 py-3 text-sm">
                          {new Date(expense.date).toLocaleDateString()}
                        </td>
                        <td className="px-4 py-3 text-sm">{expense.description}</td>
                        <td className="px-4 py-3 text-sm">
                          <span className="inline-flex items-center rounded-full px-2 py-1 text-xs font-medium bg-red-100 text-red-700">
                            {expense.activities?.type || "Gasto"}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">${expense.amount}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
