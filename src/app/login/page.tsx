'use client';
import { useState } from "react";
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation";
import { useAuth, useFirestore, useMemoFirebase } from "@/firebase";
import { useToast } from "@/hooks/use-toast";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();
  
  const [clientEmail, setClientEmail] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [lawyerEmail, setLawyerEmail] = useState('');
  const [lawyerPassword, setLawyerPassword] = useState('');
  const [adminEmail, setAdminEmail] = useState('admin@lexconnect.com');
  const [adminPassword, setAdminPassword] = useState('adminpassword');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async (e: React.FormEvent, role: 'client' | 'lawyer' | 'admin') => {
    e.preventDefault();
    setIsSubmitting(true);
    
    let email, password, redirectPath;

    if (!auth || !firestore) {
        toast({ variant: "destructive", title: "Error", description: "Authentication service is not available." });
        setIsSubmitting(false);
        return;
    }

    switch (role) {
        case 'client':
            email = clientEmail;
            password = clientPassword;
            redirectPath = '/dashboard';
            break;
        case 'lawyer':
            email = lawyerEmail;
            password = lawyerPassword;
            redirectPath = '/dashboard/lawyer/consultations';
            break;
        case 'admin':
            email = adminEmail;
            password = adminPassword;
            redirectPath = '/dashboard/admin/lawyers';
            break;
    }


    try {
        await signInWithEmailAndPassword(auth, email, password);
        router.push(redirectPath);
    } catch (error: any) {
        console.error("Login Error:", error);

        // Special recovery mechanism for lawyers and admin accounts that might not exist in Auth yet.
        if ((role === 'lawyer' || role === 'admin') && (error.code === 'auth/user-not-found' || error.code === 'auth/invalid-credential')) {
            try {
                // This will only succeed if the user truly doesn't exist.
                // If it fails, it means the password was actually wrong for an existing user.
                await createUserWithEmailAndPassword(auth, email, password);
                toast({
                    title: "Account Finalized",
                    description: `This ${role} account is now active. Please try logging in again.`,
                    duration: 8000,
                });

            } catch (creationError: any) {
                 if (creationError.code === 'auth/email-already-in-use') {
                    // This is the expected path if the user exists but the initial password was wrong.
                    toast({
                        variant: "destructive",
                        title: "Login Failed",
                        description: "Invalid credentials. Please check your email and password.",
                    });
                } else {
                    // Other errors during creation (e.g., weak password, network issue)
                     toast({
                        variant: "destructive",
                        title: "Registration Failed",
                        description: creationError.message || "Could not finalize account.",
                    });
                }
            }
        } else {
            // Handle other errors for clients or other general login issues
            toast({
                variant: "destructive",
                title: "An Error Occurred",
                description: "Something went wrong during login. Please try again.",
            });
        }
    } finally {
        setIsSubmitting(false);
    }
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="mx-auto w-full max-w-md border-2 border-primary/10 shadow-xl">
        <CardHeader className="text-center">
            <div className="flex justify-center items-center gap-2 mb-4">
                 <Logo className="h-10 w-10 text-primary" />
                 <span className="font-headline text-3xl font-bold text-primary">LexConnect</span>
            </div>
          <CardTitle className="font-headline text-2xl">Welcome Back</CardTitle>
          <CardDescription>
            Please select your role to continue.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="client" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="client">Client</TabsTrigger>
              <TabsTrigger value="lawyer">Lawyer</TabsTrigger>
              <TabsTrigger value="admin">Admin</TabsTrigger>
            </TabsList>
            <TabsContent value="client" className="pt-6">
              <form onSubmit={(e) => handleLogin(e, 'client')}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="client-email">Email</Label>
                    <Input
                      id="client-email"
                      type="email"
                      placeholder="m@example.com"
                      required
                      value={clientEmail}
                      onChange={(e) => setClientEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="client-password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input id="client-password" type="password" required value={clientPassword} onChange={(e) => setClientPassword(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                    {isSubmitting ? 'Logging in...' : 'Login as Client'}
                  </Button>
                   <div className="mt-2 text-center text-sm">
                    Don&apos;t have an account?{" "}
                    <Link href="/register" className="underline">
                      Sign up
                    </Link>
                  </div>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="lawyer" className="pt-6">
              <form onSubmit={(e) => handleLogin(e, 'lawyer')}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="lawyer-email">Email</Label>
                    <Input
                      id="lawyer-email"
                      type="email"
                      placeholder="lawyer@example.com"
                      required
                      value={lawyerEmail}
                      onChange={(e) => setLawyerEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center">
                      <Label htmlFor="lawyer-password">Password</Label>
                      <Link
                        href="#"
                        className="ml-auto inline-block text-sm underline"
                      >
                        Forgot your password?
                      </Link>
                    </div>
                    <Input id="lawyer-password" type="password" required placeholder="password123" value={lawyerPassword} onChange={(e) => setLawyerPassword(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full" disabled={isSubmitting}>
                     {isSubmitting ? 'Logging in...' : 'Login as Lawyer'}
                  </Button>
                </div>
              </form>
            </TabsContent>
            <TabsContent value="admin" className="pt-6">
              <form onSubmit={(e) => handleLogin(e, 'admin')}>
                <div className="grid gap-4">
                  <div className="grid gap-2">
                    <Label htmlFor="admin-email">Admin Email</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="admin@example.com"
                      required
                      value={adminEmail}
                      onChange={(e) => setAdminEmail(e.target.value)}
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid gap-2">
                    <Label htmlFor="admin-password">Admin Password</Label>
                    <Input id="admin-password" type="password" required value={adminPassword} onChange={(e) => setAdminPassword(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full bg-primary/90" disabled={isSubmitting}>
                     {isSubmitting ? 'Logging in...' : 'Login as Admin'}
                  </Button>
                </div>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}
