import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"

export default function ProfilePage() {
  return (
    <div className="w-full max-w-4xl mx-auto">
        <div className="mb-6">
            <h1 className="font-headline text-2xl font-semibold md:text-3xl">Profile Settings</h1>
            <p className="text-muted-foreground">Manage your account settings and preferences.</p>
        </div>
        
        <Card>
            <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>Update your personal details here.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                        <Label htmlFor="first-name">First Name</Label>
                        <Input id="first-name" defaultValue="Client" />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="last-name">Last Name</Label>
                        <Input id="last-name" defaultValue="Name" />
                    </div>
                </div>
                <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" defaultValue="client@example.com" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" type="tel" defaultValue="+1 234 567 890" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Changes</Button>
            </CardFooter>
        </Card>

        <Separator className="my-8" />

        <Card>
            <CardHeader>
            <CardTitle>Change Password</CardTitle>
            <CardDescription>For your security, we recommend using a strong password.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input id="current-password" type="password" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input id="new-password" type="password" />
                </div>
                 <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input id="confirm-password" type="password" />
                </div>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Update Password</Button>
            </CardFooter>
        </Card>
        
        <Separator className="my-8" />

        <Card>
            <CardHeader>
            <CardTitle>Notification Settings</CardTitle>
            <CardDescription>How would you like to be notified?</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                    <Checkbox id="email-notifications" defaultChecked />
                    <Label htmlFor="email-notifications">Email Notifications</Label>
                </div>
                 <p className="text-sm text-muted-foreground pl-6">Receive updates about your consultations and account activity.</p>

                 <div className="flex items-center space-x-2">
                    <Checkbox id="sms-notifications" />
                    <Label htmlFor="sms-notifications">SMS Notifications</Label>
                </div>
                 <p className="text-sm text-muted-foreground pl-6">Get urgent alerts and reminders via text message.</p>
                 
                 <div className="flex items-center space-x-2">
                    <Checkbox id="promotional-emails" defaultChecked/>
                    <Label htmlFor="promotional-emails">Promotional Emails</Label>
                </div>
                 <p className="text-sm text-muted-foreground pl-6">Receive news, special offers, and tips from LexConnect.</p>
            </CardContent>
            <CardFooter className="border-t px-6 py-4">
            <Button className="bg-accent text-accent-foreground hover:bg-accent/90">Save Preferences</Button>
            </CardFooter>
        </Card>
    </div>
  )
}
