"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { ShieldCheck } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from "@/firebase";
import { collection, addDoc, doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useRouter } from "next/navigation";
import { Skeleton } from "@/components/ui/skeleton";

export default function FindLawyerPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();
  const router = useRouter();

  const lawyersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "lawyers");
  }, [firestore]);

  const { data: lawyers, isLoading: lawyersLoading } =
    useCollection(lawyersQuery);

  const handleBookNow = async (lawyerId: string) => {
    if (!user || !firestore) {
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "You must be logged in to book a consultation.",
      });
      return;
    }

    try {
      const consultationData = {
        clientId: user.uid,
        lawyerId: lawyerId,
        dateTime: new Date().toISOString(),
        type: "Video Call",
        status: "pending",
        id: "",
      };

      const consultationRef = await addDoc(
        collection(firestore, "consultations"),
        consultationData,
      );

      // Now update the document with its own ID
      await setDoc(
        doc(firestore, "consultations", consultationRef.id),
        { id: consultationRef.id },
        { merge: true },
      );

      toast({
        title: "Consultation Booked!",
        description: "Your request has been sent to the lawyer.",
      });

      router.push("/dashboard/consultations");
    } catch (error) {
      console.error("Error booking consultation:", error);
      toast({
        variant: "destructive",
        title: "Booking Failed",
        description: "Could not book the consultation. Please try again.",
      });
    }
  };

  const pageIsLoading = isUserLoading || lawyersLoading;

  return (
    <div className="flex flex-col">
      <header className="flex h-14 items-center gap-4 border-b bg-white/50 px-6">
        <h1 className="flex-1 font-headline text-lg font-semibold">
          Find a Lawyer
        </h1>
      </header>
      <main className="flex-1 bg-background p-4 md:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 xl:grid-cols-3">
          {pageIsLoading &&
            Array.from({ length: 3 }).map((_, index) => (
              <Card key={index} className="flex flex-col overflow-hidden">
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  <Skeleton className="h-20 w-20 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 pt-0 space-y-2">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-2/3" />
                </CardContent>
                <CardFooter className="bg-white/30 p-4">
                  <Skeleton className="h-10 w-full" />
                </CardFooter>
              </Card>
            ))}
          {!pageIsLoading &&
            lawyers?.map((lawyer) => (
              <Card
                key={lawyer.id}
                className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
              >
                <CardHeader className="flex flex-row items-start gap-4 p-4">
                  <Avatar className="h-20 w-20 border">
                    <AvatarImage
                      src={`https://picsum.photos/seed/${lawyer.id}/200/200`}
                      alt={`${lawyer.firstName} ${lawyer.lastName}`}
                    />
                    <AvatarFallback>
                      {lawyer.firstName?.charAt(0)}
                      {lawyer.lastName?.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <CardTitle className="font-headline text-xl">
                        {lawyer.firstName} {lawyer.lastName}
                      </CardTitle>
                      {lawyer.verified && (
                        <ShieldCheck className="h-5 w-5 text-accent" />
                      )}
                    </div>
                    <CardDescription className="font-semibold text-primary/80">
                      {lawyer.specializations?.[0] || "Legal Expert"}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 p-4 pt-0">
                  <p className="text-sm text-muted-foreground line-clamp-3">
                    A dedicated legal professional with {lawyer.experienceYears}{" "}
                    years of experience in{" "}
                    {lawyer.specializations?.[0] || "the legal field"}. Ready to
                    assist you.
                  </p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {lawyer.experienceYears && (
                      <Badge variant="secondary">
                        {lawyer.experienceYears} yrs experience
                      </Badge>
                    )}
                    <Badge variant="secondary">Available Now</Badge>
                  </div>
                </CardContent>
                <CardFooter className="bg-white/30 p-4">
                  <Button
                    onClick={() => handleBookNow(lawyer.id)}
                    className="w-full bg-accent text-accent-foreground hover:bg-accent/90"
                    disabled={!user}
                  >
                    Book Now
                  </Button>
                </CardFooter>
              </Card>
            ))}
          {!pageIsLoading && lawyers?.length === 0 && (
            <div className="col-span-full text-center text-muted-foreground p-8">
              <p className="font-semibold">No lawyers found.</p>
              <p className="text-sm">
                An administrator needs to add lawyers to the platform.
              </p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
