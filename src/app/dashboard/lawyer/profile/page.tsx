"use client";

import { useState, useEffect } from "react";
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
import { Label } from "@/components/ui/label";
import {
  useDoc,
  useFirestore,
  useUser,
  useMemoFirebase,
  useAuth,
} from "@/firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { updatePassword } from "firebase/auth";

export default function LawyerProfilePage() {
  const { user, isUserLoading } = useUser();
  const auth = useAuth();
  const firestore = useFirestore();
  const { toast } = useToast();

  const userDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "lawyers", user.uid);
  }, [firestore, user?.uid]);

  const { data: userProfile, isLoading: isProfileLoading } = useDoc(userDocRef);

  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [specializations, setSpecializations] = useState<string[]>([]);
  const [experience, setExperience] = useState(0);
  const [newPassword, setNewPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  useEffect(() => {
    if (userProfile) {
      setFirstName(userProfile.firstName || "");
      setLastName(userProfile.lastName || "");
      setSpecializations(userProfile.specializations || []);
      setExperience(userProfile.experienceYears || 0);
    }
  }, [userProfile]);

  const handleSaveChanges = async () => {
    if (!userDocRef) return;

    try {
      await updateDoc(userDocRef, {
        firstName,
        lastName,
        specializations,
        experienceYears: Number(experience),
      });
      toast({
        title: "Профіль оновлено",
        description: "Професійна інформація успішно збережена.",
      });
    } catch (error) {
      console.error("Error updating profile:", error);
      toast({
        variant: "destructive",
        title: "Помилка оновлення",
        description: "Не вдалося зберегти зміни. Спробуйте ще раз.",
      });
    }
  };

  const handleUpdatePassword = async () => {
    if (!auth.currentUser || !newPassword) return;

    setIsUpdatingPassword(true);
    try {
      await updatePassword(auth.currentUser, newPassword);
      toast({
        title: "Пароль змінено",
        description: "Ваш пароль було успішно оновлено.",
      });
      setNewPassword("");
    } catch (error: any) {
      console.error("Error updating password:", error);
      let message = "Не вдалося оновити пароль.";
      if (error.code === "auth/requires-recent-login") {
        message =
          "Ця дія вимагає нещодавнього входу. Будь ласка, перезайдіть в систему.";
      } else if (error.code === "auth/weak-password") {
        message = "Пароль занадто слабкий.";
      }
      toast({
        variant: "destructive",
        title: "Помилка",
        description: message,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const isLoading = isUserLoading || isProfileLoading;

  if (isLoading) {
    return (
      <div className="w-full max-w-4xl mx-auto space-y-8">
        <div className="mb-6 space-y-2">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-4 w-96" />
        </div>
        <Card>
          <CardHeader>
            <Skeleton className="h-6 w-48" />
            <Skeleton className="h-4 w-80" />
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Skeleton className="h-12 w-full" />
              <Skeleton className="h-12 w-full" />
            </div>
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Skeleton className="h-10 w-24" />
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto space-y-6">
      <div className="mb-6">
        <h1 className="font-headline text-2xl font-semibold md:text-3xl">
          Профіль юриста
        </h1>
        <p className="text-muted-foreground">
          Керуйте своєю професійною інформацією та безпекою.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Особиста інформація</CardTitle>
          <CardDescription>
            Оновіть свої персональні та професійні дані тут.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="first-name">Ім'я</Label>
              <Input
                id="first-name"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="last-name">Прізвище</Label>
              <Input
                id="last-name"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" type="email" value={user?.email || ""} disabled />
          </div>
          <div className="space-y-2">
            <Label htmlFor="specializations">Спеціалізації (через кому)</Label>
            <Input
              id="specializations"
              value={specializations.join(", ")}
              onChange={(e) =>
                setSpecializations(
                  e.target.value.split(",").map((s) => s.trim()),
                )
              }
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="experience">Років досвіду</Label>
            <Input
              id="experience"
              type="number"
              value={experience}
              onChange={(e) => setExperience(parseInt(e.target.value, 10))}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button
            onClick={handleSaveChanges}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            Зберегти зміни
          </Button>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Безпека</CardTitle>
          <CardDescription>
            Змініть свій пароль для доступу до акаунту юриста.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="new-password">Новий пароль</Label>
            <Input
              id="new-password"
              type="password"
              placeholder="Введіть новий пароль"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
          </div>
        </CardContent>
        <CardFooter className="border-t px-6 py-4">
          <Button
            onClick={handleUpdatePassword}
            disabled={isUpdatingPassword || !newPassword}
            variant="outline"
          >
            {isUpdatingPassword ? "Оновлення..." : "Оновити пароль"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
