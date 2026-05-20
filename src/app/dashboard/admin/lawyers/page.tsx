"use client";

import { useState, useMemo } from "react";
import { Search, MoreHorizontal, Trash2 } from "lucide-react";

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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  useCollection,
  useFirestore,
  useMemoFirebase,
  deleteDocumentNonBlocking,
} from "@/firebase";
import { collection, doc } from "firebase/firestore";
import { Skeleton } from "@/components/ui/skeleton";
import { AddLawyerForm } from "@/components/admin/add-lawyer-form";
import { useToast } from "@/hooks/use-toast";

export default function AdminLawyersPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const lawyersQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "lawyers");
  }, [firestore]);

  const { data: lawyers, isLoading } = useCollection(lawyersQuery);

  const filteredLawyers = useMemo(() => {
    if (!lawyers) return [];
    const searchStr = searchTerm.toLowerCase().trim();
    if (!searchStr) return lawyers;

    return lawyers.filter((lawyer) => {
      const firstName = (lawyer.firstName || "").toLowerCase();
      const lastName = (lawyer.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const email = (lawyer.email || "").toLowerCase();
      const specialty = (lawyer.specializations?.[0] || "").toLowerCase();

      return (
        firstName.includes(searchStr) ||
        lastName.includes(searchStr) ||
        fullName.includes(searchStr) ||
        email.includes(searchStr) ||
        specialty.includes(searchStr)
      );
    });
  }, [lawyers, searchTerm]);

  const handleDeleteLawyer = (lawyerId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "lawyers", lawyerId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Юриста видалено",
      description: "Запис було успішно видалено з бази даних.",
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Керування юристами
        </h1>
        <div className="ml-auto flex items-center gap-2">
          <AddLawyerForm />
        </div>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Довідник юристів</CardTitle>
          <CardDescription>
            Переглядайте профілі юристів та їх статус у системі.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за ім'ям, email або спеціалізацією..."
              className="pl-8"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Юрист</TableHead>
                <TableHead>Спеціалізація</TableHead>
                <TableHead className="hidden md:table-cell">Статус</TableHead>
                <TableHead className="hidden md:table-cell">Email</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={5}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                filteredLawyers.map((lawyer) => (
                  <TableRow key={lawyer.id}>
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://picsum.photos/seed/${lawyer.id}/100/100`}
                            alt={lawyer.firstName}
                          />
                          <AvatarFallback>
                            {lawyer.firstName?.charAt(0)}
                            {lawyer.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <span className="font-medium">
                            {lawyer.firstName} {lawyer.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {lawyer.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      {lawyer.specializations?.[0] || "N/A"}
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge
                        variant={lawyer.verified ? "secondary" : "outline"}
                      >
                        {lawyer.verified ? "Верефікований" : "Очікує"}
                      </Badge>
                    </TableCell>
                    <TableCell className="hidden md:table-cell">
                      {lawyer.email}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Відкрити меню</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Дії</DropdownMenuLabel>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            className="text-destructive focus:text-destructive"
                            onClick={() => handleDeleteLawyer(lawyer.id)}
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Видалити акаунт
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && filteredLawyers.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={5}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Юристів не знайдено за вашим запитом.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
