"use client";

import { useState, useMemo } from "react";
import { Search, Trash2 } from "lucide-react";

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
import { useToast } from "@/hooks/use-toast";

export default function AdminClientsPage() {
  const firestore = useFirestore();
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");

  const clientsQuery = useMemoFirebase(() => {
    if (!firestore) return null;
    return collection(firestore, "clients");
  }, [firestore]);

  const { data: clients, isLoading } = useCollection(clientsQuery);

  const filteredClients = useMemo(() => {
    if (!clients) return [];
    const searchStr = searchTerm.toLowerCase().trim();
    if (!searchStr) return clients;

    return clients.filter((client) => {
      const firstName = (client.firstName || "").toLowerCase();
      const lastName = (client.lastName || "").toLowerCase();
      const fullName = `${firstName} ${lastName}`;
      const email = (client.email || "").toLowerCase();

      return (
        firstName.includes(searchStr) ||
        lastName.includes(searchStr) ||
        fullName.includes(searchStr) ||
        email.includes(searchStr)
      );
    });
  }, [clients, searchTerm]);

  const handleDeleteClient = (clientId: string) => {
    if (!firestore) return;
    const docRef = doc(firestore, "clients", clientId);
    deleteDocumentNonBlocking(docRef);
    toast({
      title: "Клієнта видалено",
      description: "Запис було успішно видалено з бази даних.",
    });
  };

  return (
    <div className="flex flex-col">
      <div className="flex items-center gap-4">
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          Керування клієнтами
        </h1>
      </div>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Список клієнтів</CardTitle>
          <CardDescription>
            Переглядайте зареєстрованих клієнтів платформи LexConnect.
          </CardDescription>
          <div className="relative pt-2">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Пошук за ім'ям або email..."
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
                <TableHead>Клієнт</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="hidden md:table-cell">Статус</TableHead>
                <TableHead className="text-right">Дії</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading &&
                Array.from({ length: 3 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell colSpan={4}>
                      <Skeleton className="h-12 w-full" />
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading &&
                filteredClients.map((client) => (
                  <TableRow key={client.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarImage
                            src={`https://picsum.photos/seed/${client.id}/100/100`}
                            alt={client.firstName}
                          />
                          <AvatarFallback>
                            {client.firstName?.charAt(0)}
                            {client.lastName?.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                        <div className="grid gap-0.5">
                          <span className="font-medium">
                            {client.firstName} {client.lastName}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            ID: {client.id}
                          </span>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{client.email}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      <Badge variant="secondary">Активний</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={() => handleDeleteClient(client.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              {!isLoading && filteredClients.length === 0 && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    className="text-center py-8 text-muted-foreground"
                  >
                    Клієнтів не знайдено за вашим запитом.
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
