"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import Link from "next/link";
import { useUser, useFirestore, useDoc, useMemoFirebase } from "@/firebase";
import { doc } from "firebase/firestore";
import { Skeleton } from "./ui/skeleton";
import { signOut } from "firebase/auth";
import { useAuth } from "@/firebase";
import { useRouter } from "next/navigation";

export function UserNav() {
  const { user, isUserLoading } = useUser();
  const firestore = useFirestore();
  const auth = useAuth();
  const router = useRouter();

  // Try fetching from clients collection
  const clientDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "clients", user.uid);
  }, [firestore, user?.uid]);
  const { data: clientProfile, isLoading: isClientLoading } =
    useDoc(clientDocRef);

  // Try fetching from lawyers collection
  const lawyerDocRef = useMemoFirebase(() => {
    if (!firestore || !user?.uid) return null;
    return doc(firestore, "lawyers", user.uid);
  }, [firestore, user?.uid]);
  const { data: lawyerProfile, isLoading: isLawyerLoading } =
    useDoc(lawyerDocRef);

  const isLoading = isUserLoading || isClientLoading || isLawyerLoading;

  const handleLogout = async () => {
    await signOut(auth);
    router.push("/login");
  };

  const getProfileData = () => {
    if (user?.email === "admin@lexconnect.com") {
      return {
        name: "Admin User",
        initials: "AD",
      };
    }
    if (lawyerProfile) {
      return {
        name: `${lawyerProfile.firstName} ${lawyerProfile.lastName}`,
        initials: `${lawyerProfile.firstName?.charAt(0)}${lawyerProfile.lastName?.charAt(0)}`,
      };
    }
    if (clientProfile) {
      return {
        name: `${clientProfile.firstName} ${clientProfile.lastName}`,
        initials: `${clientProfile.firstName?.charAt(0)}${clientProfile.lastName?.charAt(0)}`,
      };
    }
    return {
      name: "User",
      initials: "...",
    };
  };

  const profileData = getProfileData();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={`https://picsum.photos/seed/${user?.uid}/100/100`}
              alt="User avatar"
            />
            <AvatarFallback>{profileData.initials}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          {isLoading ? (
            <div className="flex flex-col space-y-2">
              <Skeleton className="h-4 w-[150px]" />
              <Skeleton className="h-3 w-[100px]" />
            </div>
          ) : (
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profileData.name}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          )}
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/dashboard/profile">Profile</Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
          <DropdownMenuItem>Settings</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
