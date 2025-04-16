import type React from "react";
import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { adminApi } from "@/api/admin";
import { organizationsApi } from "@/api/organizations";

export default function LoginForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: true,
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

  const handleCheckboxChange = (checked: boolean) => {
    setFormData((prev) => ({ ...prev, rememberMe: checked }));
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
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) return;

    setIsLoading(true);

    try {
      const { data, error } = await fine.auth.signIn.email(
        {
          email: formData.email,
          password: formData.password,
          callbackURL: "/",
          rememberMe: formData.rememberMe,
        },
        {
          onRequest: () => {
            setIsLoading(true);
          },
          onSuccess: async (ctx) => {
            // Check if there's pending organization data from signup
            const pendingOrgId = localStorage.getItem("pendingOrgId");
            const pendingOrgCode = localStorage.getItem("pendingOrgCode");
            
            if (pendingOrgId && pendingOrgCode && ctx.data?.user?.id) {
              try {
                // Verify the organization code
                const isValid = await organizationsApi.verifyOrganizationCode(
                  parseInt(pendingOrgId),
                  pendingOrgCode
                );
                
                if (isValid) {
                  // Add user to organization
                  await adminApi.updateUserOrganization(ctx.data.user.id, parseInt(pendingOrgId));
                  
                  toast({
                    title: "Organization joined",
                    description: "You have been added to the organization. An admin will need to approve your request.",
                  });
                }
                
                // Clear the pending organization data
                localStorage.removeItem("pendingOrgId");
                localStorage.removeItem("pendingOrgCode");
              } catch (error) {
                console.error("Failed to process organization membership:", error);
              }
            }
            
            toast({
              title: "Success",
              description: "You have been signed in successfully.",
            });
            navigate("/");
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
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Invalid email or password.",
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
          <CardTitle className='text-2xl font-poppins'>Sign in</CardTitle>
          <CardDescription className='font-montserrat'>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className='space-y-5'>
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
              <div className='flex items-center justify-between'>
                <Label htmlFor='password' className='font-poppins'>Password</Label>
                <Link to='/forgot-password' className='text-sm text-blue underline-offset-4 hover:underline font-montserrat'>
                  Forgot password?
                </Link>
              </div>
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

            <div className='flex items-center space-x-2'>
              <Checkbox id='rememberMe' checked={formData.rememberMe} onCheckedChange={handleCheckboxChange} className='ios-touch-target' />
              <Label htmlFor='rememberMe' className='text-sm font-normal font-montserrat'>
                Remember me
              </Label>
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
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </IOSButton>

            <p className='text-center text-sm text-muted-foreground font-montserrat'>
              Don't have an account?{" "}
              <Link to='/signup' className='text-blue underline underline-offset-4 hover:text-blue/90'>
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}