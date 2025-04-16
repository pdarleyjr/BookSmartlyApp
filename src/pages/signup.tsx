import type React from "react";

import { useState, useEffect } from "react";
import { useNavigate, Link, Navigate } from "react-router-dom";
import { fine } from "@/lib/fine";
import { IOSButton } from "@/components/ui/ios-button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { adminApi } from "@/api/admin";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SignupForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [accountType, setAccountType] = useState<"individual" | "organization" | "orgUser">("individual");
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    organizationId: "",
    organizationName: "",
    organizationCode: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [verifyingCode, setVerifyingCode] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch organizations for org user signup
  useEffect(() => {
    const fetchOrganizations = async () => {
      try {
        const orgs = await adminApi.getAllOrganizations();
        setOrganizations(orgs);
      } catch (error) {
        console.error("Failed to fetch organizations:", error);
      }
    };

    if (accountType === "orgUser") {
      fetchOrganizations();
    }
  }, [accountType]);

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

  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
    
    // Clear error when user selects
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = async () => {
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

    if (accountType === "organization" && !formData.organizationName) {
      newErrors.organizationName = "Organization name is required";
    }

    if (accountType === "orgUser" && !formData.organizationId) {
      newErrors.organizationId = "Please select an organization";
    }

    if (accountType === "orgUser" && !formData.organizationCode) {
      newErrors.organizationCode = "Organization code is required";
    }

    // Verify organization code if joining an org
    if (accountType === "orgUser" && formData.organizationId && formData.organizationCode) {
      setVerifyingCode(true);
      try {
        const isValid = await adminApi.verifyOrganizationCode(
          parseInt(formData.organizationId),
          formData.organizationCode
        );
        
        if (!isValid) {
          newErrors.organizationCode = "Invalid organization code";
        }
      } catch (error) {
        newErrors.organizationCode = "Failed to verify organization code";
      } finally {
        setVerifyingCode(false);
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const isValid = await validateForm();
    if (!isValid) return;

    setIsLoading(true);

    try {
      // Sign up the user
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
          onSuccess: async (data) => {
            // Handle organization-specific logic
            if (accountType === "organization") {
              try {
                // Create the organization
                const newOrg = await adminApi.createOrganization(formData.organizationName);
                
                if (newOrg && newOrg.id && data.user?.id) {
                  // Set the user as org admin
                  await adminApi.updateUserOrganization(data.user.id, newOrg.id);
                  await adminApi.updateUserRole(data.user.id, "org_admin");
                }
              } catch (orgError) {
                console.error("Failed to create organization:", orgError);
              }
            } else if (accountType === "orgUser" && formData.organizationId) {
              try {
                if (data.user?.id) {
                  // Link user to organization
                  await adminApi.updateUserOrganization(data.user.id, parseInt(formData.organizationId));
                  await adminApi.updateUserRole(data.user.id, "user");
                }
              } catch (orgError) {
                console.error("Failed to link user to organization:", orgError);
              }
            }
            
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
            setIsLoading(false);
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
        
        <Tabs defaultValue="individual" onValueChange={(value) => setAccountType(value as any)}>
          <TabsList className="grid w-full grid-cols-3 mb-4">
            <TabsTrigger value="individual" className="text-xs sm:text-sm">Individual</TabsTrigger>
            <TabsTrigger value="organization" className="text-xs sm:text-sm">Organization</TabsTrigger>
            <TabsTrigger value="orgUser" className="text-xs sm:text-sm">Org User</TabsTrigger>
          </TabsList>
          
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
              
              {/* Organization specific fields */}
              <TabsContent value="organization">
                <div className='space-y-2'>
                  <Label htmlFor='organizationName' className='font-poppins'>Organization Name</Label>
                  <Input
                    id='organizationName'
                    name='organizationName'
                    placeholder='Acme Inc.'
                    value={formData.organizationName}
                    onChange={handleChange}
                    disabled={isLoading}
                    aria-invalid={!!errors.organizationName}
                    className='ios-input ios-touch-target'
                  />
                  {errors.organizationName && <p className='text-sm text-destructive font-montserrat'>{errors.organizationName}</p>}
                </div>
              </TabsContent>
              
              {/* Organization User specific fields */}
              <TabsContent value="orgUser">
                <div className='space-y-2'>
                  <Label htmlFor='organizationId' className='font-poppins'>Organization</Label>
                  <Select 
                    value={formData.organizationId} 
                    onValueChange={(value) => handleSelectChange('organizationId', value)}
                    disabled={isLoading}
                  >
                    <SelectTrigger id="organizationId" className="ios-touch-target">
                      <SelectValue placeholder="Select organization" />
                    </SelectTrigger>
                    <SelectContent>
                      {organizations.map(org => (
                        <SelectItem key={org.id} value={org.id.toString()}>
                          {org.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.organizationId && <p className='text-sm text-destructive font-montserrat'>{errors.organizationId}</p>}
                </div>
                
                <div className='space-y-2'>
                  <Label htmlFor='organizationCode' className='font-poppins'>Organization Code</Label>
                  <Input
                    id='organizationCode'
                    name='organizationCode'
                    placeholder='Enter code provided by your organization'
                    value={formData.organizationCode}
                    onChange={handleChange}
                    disabled={isLoading || verifyingCode}
                    aria-invalid={!!errors.organizationCode}
                    className='ios-input ios-touch-target'
                  />
                  {errors.organizationCode && <p className='text-sm text-destructive font-montserrat'>{errors.organizationCode}</p>}
                  <p className="text-xs text-muted-foreground">Contact your organization admin for the code</p>
                </div>
              </TabsContent>
            </CardContent>

            <CardFooter className='flex flex-col space-y-4 pb-6'>
              <IOSButton 
                type='submit' 
                className='w-full bg-coral text-white ios-touch-target font-montserrat' 
                disabled={isLoading || verifyingCode}
              >
                {isLoading || verifyingCode ? (
                  <>
                    <Loader2 className='mr-2 h-5 w-5 animate-spin' />
                    {verifyingCode ? "Verifying..." : "Creating account..."}
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
        </Tabs>
      </Card>
    </div>
  );
}