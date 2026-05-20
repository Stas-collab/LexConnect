"use client";

import { File, ListFilter, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import Link from "next/link";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from "@/firebase";
import { collection, query, where, doc, updateDoc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc } from "@/firebase/firestore/use-doc";
import { useToast } from "@/hooks/use-toast";
import { useMemo } from "react";

// A component to fetch and display client details
function ClientDetails({ clientId }: { clientId: string }) {
  const firestore = useFirestore();
  const clientDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "clients", clientId);
  }, [firestore, clientId]);

  const { data: client, isLoading } = useDoc(clientDocRef);

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  if (!client) {
    return <span>Unknown Client</span>;
  }

  return (
    <span>
      {client.firstName} {client.lastName}
    </span>
  );
}

function ConsultationTable({
  consultations,
  isLoading,
  onStatusUpdate,
}: {
  consultations: any[] | null;
  isLoading: boolean;
  onStatusUpdate: (
    id: string,
    status: "confirmed" | "completed" | "cancelled",
  ) => void;
}) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Client</TableHead>
          <TableHead>Type</TableHead>
          <TableHead className="hidden md:table-cell">Status</TableHead>
          <TableHead className="hidden md:table-cell">Date</TableHead>
          <TableHead>
            <span className="sr-only">Actions</span>
          </TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading && (
          <TableRow>
            <TableCell colSpan={5}>
              <div className="space-y-2">
                <Skeleton className="h-12 w-full" />
                <Skeleton className="h-12 w-full" />
              </div>
            </TableCell>
          </TableRow>
        )}
        {!isLoading && consultations?.length === 0 && (
          <TableRow>
            <TableCell colSpan={5} className="text-center">
              No consultations in this category.
            </TableCell>
          </TableRow>
        )}
        {!isLoading &&
          consultations?.map((consultation) => (
            <TableRow key={consultation.id}>
              <TableCell className="font-medium">
                <ClientDetails clientId={consultation.clientId} />
              </TableCell>
              <TableCell>{consultation.type}</TableCell>
              <TableCell className="hidden md:table-cell">
                <Badge variant="outline">{consultation.status}</Badge>
              </TableCell>
              <TableCell className="hidden md:table-cell">
                {new Date(consultation.dateTime).toLocaleString()}
              </TableCell>
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button aria-haspopup="true" size="icon" variant="ghost">
                      <MoreHorizontal className="h-4 w-4" />
                      <span className="sr-only">Toggle menu</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    {consultation.status === "pending" && (
                      <DropdownMenuItem
                        onClick={() =>
                          onStatusUpdate(consultation.id, "confirmed")
                        }
                      >
                        Confirm
                      </DropdownMenuItem>
                    )}
                    {consultation.status !== "completed" &&
                      consultation.status !== "cancelled" && (
                        <DropdownMenuItem
                          onClick={() =>
                            onStatusUpdate(consultation.id, "completed")
                          }
                        >
                          Mark as Completed
                        </DropdownMenuItem>
                      )}
                    <DropdownMenuItem asChild>
                      <Link
                        href={`/dashboard/consultations/${consultation.id}`}
                      >
                        Join Call
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem>View Details</DropdownMenuItem>
                    <DropdownMenuItem>Reschedule</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </TableCell>
            </TableRow>
          ))}
      </TableBody>
    </Table>
  );
}

export default function LawyerConsultationsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();
  const { toast } = useToast();

  const consultationsQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) {
      return null;
    }
    return query(
      collection(firestore, "consultations"),
      where("lawyerId", "==", user.uid),
    );
  }, [firestore, user, isUserLoading]);

  const { data: consultations, isLoading: consultationsLoading } =
    useCollection(consultationsQuery);

  const pageIsLoading = isUserLoading || consultationsLoading;

  const filteredConsultations = useMemo(() => {
    if (!consultations) return { pending: [], confirmed: [], completed: [] };
    return {
      pending: consultations.filter((c) => c.status === "pending"),
      confirmed: consultations.filter((c) => c.status === "confirmed"),
      completed: consultations.filter((c) => c.status === "completed"),
    };
  }, [consultations]);

  const handleUpdateStatus = async (
    consultationId: string,
    newStatus: "confirmed" | "completed" | "cancelled",
  ) => {
    if (!firestore) return;
    const consultationRef = doc(firestore, "consultations", consultationId);
    try {
      await updateDoc(consultationRef, { status: newStatus });
      toast({
        title: "Status Updated",
        description: `Consultation status has been updated to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        variant: "destructive",
        title: "Update Failed",
        description: "Could not update the consultation status.",
      });
    }
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Client Consultations
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm" className="h-8 gap-1">
                <ListFilter className="h-3.5 w-3.5" />
                <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
                  Filter
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Filter by</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>
                Pending
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Confirmed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-rap">
              Export
            </span>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4 mt-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="pending">Pending</TabsTrigger>
          <TabsTrigger value="confirmed">Confirmed</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Consultations</CardTitle>
              <CardDescription>
                A history of all your client consultations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationTable
                consultations={consultations}
                isLoading={pageIsLoading}
                onStatusUpdate={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pending Consultations</CardTitle>
              <CardDescription>
                New client requests that need your confirmation.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationTable
                consultations={filteredConsultations.pending}
                isLoading={pageIsLoading}
                onStatusUpdate={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="confirmed">
          <Card>
            <CardHeader>
              <CardTitle>Confirmed Consultations</CardTitle>
              <CardDescription>
                Your upcoming scheduled consultations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationTable
                consultations={filteredConsultations.confirmed}
                isLoading={pageIsLoading}
                onStatusUpdate={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
        <TabsContent value="completed">
          <Card>
            <CardHeader>
              <CardTitle>Completed Consultations</CardTitle>
              <CardDescription>
                A record of your past consultations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ConsultationTable
                consultations={filteredConsultations.completed}
                isLoading={pageIsLoading}
                onStatusUpdate={handleUpdateStatus}
              />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
