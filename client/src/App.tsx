import { useEffect, useState } from "react";
import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "./lib/queryClient";
import { supabase } from "@shared/supabase";
import { DashboardLayout } from "@/components/layouts/DashboardLayout";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/login";
import Register from "@/pages/auth/register";
import Dashboard from "@/pages/dashboard";
import Vehicles from "@/pages/vehicles";
import VehicleDetail from "@/pages/vehicles/[id]";
import Drivers from "@/pages/drivers";
import DriverDetail from "@/pages/drivers/[id]";
import Activities from "@/pages/activities";
import ActivityDetail from "@/pages/activities/[id]";
import Finances from "@/pages/finances";
import Settings from "@/pages/settings";

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [_, setLocation] = useLocation();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (!session) {
        setLocation("/login");
      }
    });

    return () => subscription.unsubscribe();
  }, [setLocation]);

  if (loading) {
    return <div>Cargando...</div>;
  }

  if (!session) {
    setLocation("/login");
    return null;
  }

  return <DashboardLayout>{children}</DashboardLayout>;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/register" component={Register} />
      <Route path="/">
        <PrivateRoute>
          <Dashboard />
        </PrivateRoute>
      </Route>
      <Route path="/vehicles">
        <PrivateRoute>
          <Vehicles />
        </PrivateRoute>
      </Route>
      <Route path="/vehicles/:id">
        <PrivateRoute>
          <VehicleDetail />
        </PrivateRoute>
      </Route>
      <Route path="/drivers">
        <PrivateRoute>
          <Drivers />
        </PrivateRoute>
      </Route>
      <Route path="/drivers/:id">
        <PrivateRoute>
          <DriverDetail />
        </PrivateRoute>
      </Route>
      <Route path="/activities">
        <PrivateRoute>
          <Activities />
        </PrivateRoute>
      </Route>
      <Route path="/activities/:id">
        <PrivateRoute>
          <ActivityDetail />
        </PrivateRoute>
      </Route>
      <Route path="/finances">
        <PrivateRoute>
          <Finances />
        </PrivateRoute>
      </Route>
      <Route path="/settings">
        <PrivateRoute>
          <Settings />
        </PrivateRoute>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
