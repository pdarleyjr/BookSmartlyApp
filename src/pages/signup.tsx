import type React from "react";

import { useState } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Clear error when user types
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Please enter a valid email address";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (!formData.name) {
      newErrors.name = "Name is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await fine.auth.signUp.email(
        {
          email: formData.email,
          password: formData.password,
          name: formData.name,
          callbackURL: "/",
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: () => {
            toast({
              title: "Account created",
              description: "Please check your email to verify your account.",
            });
            navigate("/login");
          },
          onError: (ctx) => {
            toast({
              title: "Error",
              description: ctx.error.message,
              variant: "destructive",
            });
          },
        }
      );

      if (error) {
        throw error;
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Something went wrong. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!fine) return <Navigate to='/' />;
  const { isPending, data } = fine.auth.useSession();
  if (!isPending && data) return <Navigate to='/' />;

  return (
    <div className='container mx-auto flex h-screen items-center justify-center py-10 px-4'>
      <Card className='mx-auto w-full max-w-md ios-card border-none shadow-md'>
        <CardHeader>
          <CardTitle className='text-2xl font-poppins'>Create an account</CardTitle>
          <CardDescription className='font-montserrat'>Enter your details below to create your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-5'>
            <div className='space-y-2'>
              <Label htmlFor='name' className='font-poppins'>Name</Label>
              <Input
                id='name'
                name='name'
                placeholder='John Doe'
                value={formData.name}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.name}
                className='ios-input ios-touch-target'
              />
              {errors.name && <p className='text-sm text-destructive font-montserrat'>{errors.name}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email' className='font-poppins'>Email</Label>
              <Input
                id='email'
                name='email'
                type='email'
                placeholder='john@example.com'
                value={formData.email}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.email}
                className='ios-input ios-touch-target'
              />
              {errors.email && <p className='text-sm text-destructive font-montserrat'>{errors.email}</p>}
            </div>

            <div className='space-y-2'>
              <Label htmlFor='password' className='font-poppins'>Password</Label>
              <Input
                id='password'
                name='password'
                type='password'
                value={formData.password}
                onChange={handleChange}
                disabled={isLoading}
                aria-invalid={!!errors.password}
                className='ios-input ios-touch-target'
              />
              {errors.password && <p className='text-sm text-destructive font-montserrat'>{errors.password}</p>}
            </div>
          </CardContent>

          <CardFooter className='flex flex-col space-y-4 pb-6'>
            <IOSButton 
              type='submit' 
              className='w-full bg-coral text-white ios-touch-target font-montserrat' 
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                  Creating account...
                </>
              ) : (
                "Sign up"
              )}
            </IOSButton>

            <p className='text-center text-sm text-muted-foreground font-montserrat'>
              Already have an account?{" "}
              <Link to='/login' className='text-blue underline underline-offset-4 hover:text-blue/90'>
                Sign in
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}