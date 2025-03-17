import { useState } from 'react';
import { useLocation } from 'wouter';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from "@shared/supabase";

const registerSchema = z.object({
  organizationName: z.string().min(1, "Organization name is required"),
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type RegisterForm = z.infer<typeof registerSchema>;

export default function Register() {
  const [loading, setLoading] = useState(false);
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const form = useForm<RegisterForm>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      organizationName: "",
      name: "",
      email: "",
      password: "",
    }
  });

  const onSubmit = async (data: RegisterForm) => {
    try {
      setLoading(true);

      // 1. Create organization
      const { data: orgData, error: orgError } = await supabase
        .from('organizations')
        .insert([{ name: data.organizationName }])
        .select()
        .single();

      if (orgError) throw orgError;

      // 2. Sign up user in auth
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            organization_id: orgData.id,
            name: data.name,
          }
        }
      });

      if (authError) throw authError;

      // 3. Create user record
      const { error: userError } = await supabase
        .from('users')
        .insert([{
          email: data.email,
          name: data.name,
          organization_id: orgData.id,
          role: 'admin',
          is_owner: true
        }]);

      if (userError) throw userError;

      toast({
        title: "Registration successful",
        description: "Please check your email to verify your account",
      });

      setLocation('/login');
    } catch (error) {
      console.error('Registration error:', error);
      toast({
        variant: "destructive",
        title: "Registration failed",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-md space-y-8 p-8">
        <div>
          <h2 className="text-center text-3xl font-bold">Create your account</h2>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <Input
              {...form.register("organizationName")}
              placeholder="Organization name"
              className="w-full"
            />
            {form.formState.errors.organizationName && (
              <p className="text-sm text-red-500">{form.formState.errors.organizationName.message}</p>
            )}
          </div>

          <div>
            <Input
              {...form.register("name")}
              placeholder="Your name"
              className="w-full"
            />
            {form.formState.errors.name && (
              <p className="text-sm text-red-500">{form.formState.errors.name.message}</p>
            )}
          </div>

          <div>
            <Input
              {...form.register("email")}
              type="email"
              placeholder="Email address"
              className="w-full"
            />
            {form.formState.errors.email && (
              <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
            )}
          </div>

          <div>
            <Input
              {...form.register("password")}
              type="password"
              placeholder="Password"
              className="w-full"
            />
            {form.formState.errors.password && (
              <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
            )}
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Create account"}
          </Button>
        </form>

        <p className="text-center">
          Already have an account?{" "}
          <a href="/login" className="text-blue-600 hover:underline">
            Log in
          </a>
        </p>
      </div>
    </div>
  );
}
