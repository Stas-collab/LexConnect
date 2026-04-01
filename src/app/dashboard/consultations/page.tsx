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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import Link from "next/link";
import {
  useCollection,
  useFirestore,
  useUser,
  useMemoFirebase,
} from "@/firebase";
import { collection, query, where, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { useDoc } from "@/firebase/firestore/use-doc";

// A component to fetch and display lawyer details
function LawyerDetails({ lawyerId }: { lawyerId: string }) {
  const firestore = useFirestore();
  const lawyerDocRef = useMemoFirebase(() => {
    if (!firestore) return null;
    return doc(firestore, "lawyers", lawyerId);
  }, [firestore, lawyerId]);

  const { data: lawyer, isLoading } = useDoc(lawyerDocRef);

  if (isLoading) {
    return <Skeleton className="h-5 w-24" />;
  }

  if (!lawyer) {
    return <span>Unknown Lawyer</span>;
  }

  return (
    <span>
      {lawyer.firstName} {lawyer.lastName}
    </span>
  );
}

export default function ConsultationsPage() {
  const firestore = useFirestore();
  const { user, isUserLoading } = useUser();

  const consultationsQuery = useMemoFirebase(() => {
    if (!firestore || isUserLoading || !user) {
      return null;
    }
    return query(
      collection(firestore, "consultations"),
      where("clientId", "==", user.uid),
    );
  }, [firestore, user, isUserLoading]);

  const { data: consultations, isLoading: consultationsLoading } =
    useCollection(consultationsQuery);

  const pageIsLoading = isUserLoading || consultationsLoading;

  return (
    <div className="flex flex-col">
      <div className="flex items-center">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          My Consultations
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
                Upcoming
              </DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Completed</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem>Cancelled</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
          <Button size="sm" variant="outline" className="h-8 gap-1">
            <File className="h-3.5 w-3.5" />
            <span className="sr-only sm:not-sr-only sm:whitespace-nowrap">
              Export
            </span>
          </Button>
          <Button
            asChild
            size="sm"
            className="h-8 gap-1 bg-accent hover:bg-accent/90 text-accent-foreground"
          >
            <Link href="/dashboard/find-lawyer">Book New</Link>
          </Button>
        </div>
      </div>
      <Tabs defaultValue="all">
        <TabsList className="grid w-full grid-cols-4 mt-4">
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="upcoming">Upcoming</TabsTrigger>
          <TabsTrigger value="completed">Completed</TabsTrigger>
          <TabsTrigger value="cancelled">Cancelled</TabsTrigger>
        </TabsList>
        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>All Consultations</CardTitle>
              <CardDescription>
                A history of all your consultations.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="hidden w-[100px] sm:table-cell">
                      <span className="sr-only">Image</span>
                    </TableHead>
                    <TableHead>Lawyer</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead className="hidden md:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden md:table-cell">Date</TableHead>
                    <TableHead>
                      <span className="sr-only">Actions</span>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pageIsLoading && (
                    <TableRow>
                      <TableCell colSpan={6}>
                        <div className="space-y-2">
                          <Skeleton className="h-12 w-full" />
                          <Skeleton className="h-12 w-full" />
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                  {!pageIsLoading && consultations?.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center">
                        You have no consultations.
                      </TableCell>
                    </TableRow>
                  )}
                  {!pageIsLoading &&
                    consultations?.map((consultation) => (
                      <TableRow key={consultation.id}>
                        <TableCell className="hidden sm:table-cell">
                          <Avatar className="h-10 w-10">
                            <AvatarImage
                              src={`https://picsum.photos/seed/${consultation.lawyerId}/100/100`}
                              alt="Lawyer Avatar"
                            />
                            <AvatarFallback>L</AvatarFallback>
                          </Avatar>
                        </TableCell>
                        <TableCell className="font-medium">
                          <LawyerDetails lawyerId={consultation.lawyerId} />
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
                              <Button
                                aria-haspopup="true"
                                size="icon"
                                variant="ghost"
                              >
                                <MoreHorizontal className="h-4 w-4" />
                                <span className="sr-only">Toggle menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuLabel>Actions</DropdownMenuLabel>
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
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
