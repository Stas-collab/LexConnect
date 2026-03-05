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
import { Logo } from "@/components/logo"
import { useRouter } from "next/navigation";
import { useAuth, useFirestore } from "@/firebase";
import { setDoc, doc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { createUserWithEmailAndPassword } from "firebase/auth";

export default function RegisterPage() {
  const router = useRouter();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!firestore || !auth) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Firebase is not initialized. Please try again later.",
      });
      return;
    }
    setIsSubmitting(true);
    
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const profileData = {
        id: user.uid,
        firstName,
        lastName,
        email: user.email,
      };

      const userDocRef = doc(firestore, 'clients', user.uid);
      await setDoc(userDocRef, profileData, { merge: true });

      router.push('/dashboard/find-lawyer');

    } catch (error: any) {
      console.error("Registration error:", error);
      let description = "An unexpected error occurred. Please try again.";
      if (error.code === 'auth/email-already-in-use') {
          description = "This email address is already in use by another account.";
      } else if (error.code === 'auth/weak-password') {
          description = "The password is too weak. Please choose a stronger password.";
      }
      toast({
        variant: "destructive",
        title: "Registration Failed",
        description,
      });
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
          <CardTitle className="font-headline text-2xl">Create a Client Account</CardTitle>
          <CardDescription>
            Join our network to connect with legal professionals.
          </CardDescription>
        </CardHeader>
        <CardContent>
            <form onSubmit={handleRegister} className="pt-6">
                 <div className="grid gap-4">
                  <div className="grid grid-cols-2 gap-4">
                      <div className="grid gap-2">
                      <Label htmlFor="first-name">First name</Label>
                      <Input id="first-name" placeholder="Max" required value={firstName} onChange={(e) => setFirstName(e.target.value)} disabled={isSubmitting} />
                      </div>
                      <div className="grid gap-2">
                      <Label htmlFor="last-name">Last name</Label>
                      <Input id="last-name" placeholder="Robinson" required value={lastName} onChange={(e) => setLastName(e.target.value)} disabled={isSubmitting} />
                      </div>
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input
                        id="email"
                        type="email"
                        placeholder="m@example.com"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isSubmitting}
                      />
                  </div>
                  <div className="grid gap-2">
                      <Label htmlFor="password">Password</Label>
                      <Input id="password" type="password" required value={password} onChange={(e) => setPassword(e.target.value)} disabled={isSubmitting} />
                  </div>
                  <Button type="submit" className="w-full bg-accent text-accent-foreground hover:bg-accent/90" disabled={isSubmitting}>
                      {isSubmitting ? 'Creating Account...' : 'Create Account'}
                  </Button>
                  </div>
                  <div className="mt-4 text-center text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="underline">
                      Sign in
                  </Link>
                  </div>
              </form>
        </CardContent>
      </Card>
    </div>
  )
}
