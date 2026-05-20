'use client';
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import {
    Form,
    FormControl,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { PlusCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";

const formSchema = z.object({
  firstName: z.string().min(2, { message: "First name must be at least 2 characters." }),
  lastName: z.string().min(2, { message: "Last name must be at least 2 characters." }),
  email: z.string().email({ message: "Please enter a valid email address." }),
  specialization: z.string().min(2, { message: "Specialization is required." }),
  experienceYears: z.coerce.number().min(0, { message: "Experience must be a positive number." }),
});

export function AddLawyerForm() {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { toast } = useToast();
    const auth = useAuth();
    const firestore = useFirestore();

    const form = useForm<z.infer<typeof formSchema>>({
        resolver: zodResolver(formSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            email: "",
            specialization: "",
            experienceYears: 0,
        },
    });

    async function onSubmit(values: z.infer<typeof formSchema>) {
        if (!auth || !firestore) {
            toast({ variant: "destructive", title: "Firebase not initialized" });
            return;
        }
        setIsSubmitting(true);

        try {
            const defaultPassword = "password123";
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, defaultPassword);
            const user = userCredential.user;

            const lawyerProfile = {
                id: user.uid,
                firstName: values.firstName,
                lastName: values.lastName,
                email: values.email,
                specializations: [values.specialization],
                experienceYears: values.experienceYears,
                verified: true, 
            };

            const lawyerDocRef = doc(firestore, "lawyers", user.uid);
            await setDoc(lawyerDocRef, lawyerProfile, { merge: true });

            toast({
                title: "Lawyer Created Successfully",
                description: `An account for ${values.firstName} ${values.lastName} has been created. The temporary password is "password123".`,
                duration: 10000,
            });
            form.reset();
            setOpen(false);

        } catch (error: any) {
            console.error("Error creating lawyer:", error);
            let description = "An unexpected error occurred. Please try again.";
            if (error.code === 'auth/email-already-in-use') {
                description = "This email address is already in use by another account.";
            }
            toast({
                variant: "destructive",
                title: "Failed to Create Lawyer",
                description,
            });
        } finally {
            setIsSubmitting(false);
        }
    }


  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button size="sm" className="h-8 gap-1 bg-accent hover:bg-accent/90 text-accent-foreground">
          <PlusCircle className="h-3.5 w-3.5" />
          <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
            Add Lawyer
          </span>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Lawyer</DialogTitle>
          <DialogDescription>
            Fill in the details below to create a new lawyer profile. The temporary password will be "password123".
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="firstName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>First Name</FormLabel>
                            <FormControl>
                                <Input placeholder="John" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="lastName"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Last Name</FormLabel>
                            <FormControl>
                                <Input placeholder="Doe" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                    />
                </div>
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Email</FormLabel>
                        <FormControl>
                            <Input type="email" placeholder="lawyer@example.com" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="specialization"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Specialization</FormLabel>
                        <FormControl>
                            <Input placeholder="e.g., Family Law" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <FormField
                    control={form.control}
                    name="experienceYears"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Years of Experience</FormLabel>
                        <FormControl>
                            <Input type="number" placeholder="5" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                <DialogFooter>
                    <Button type="submit" disabled={isSubmitting}>
                        {isSubmitting ? "Creating..." : "Create Lawyer"}
                    </Button>
                </DialogFooter>
            </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
