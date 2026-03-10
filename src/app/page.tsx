import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Scale,
  Users,
  Gavel,
  Landmark,
  Briefcase,
  HomeIcon,
  Handshake,
  Star,
} from "lucide-react";
import { Logo } from "@/components/logo";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { legalSpecialties, howItWorksSteps } from "@/lib/data";

// Dummy data for top lawyers, as the original is now fetched from Firestore on the find-lawyer page
const topLawyers = [
  {
    id: "1",
    name: "John Doe",
    avatar: "https://picsum.photos/seed/lawyer1/200/200",
    specialty: "Corporate Law",
  },
  {
    id: "2",
    name: "Jane Smith",
    avatar: "https://picsum.photos/seed/lawyer2/200/200",
    specialty: "Family Law",
  },
  {
    id: "3",
    name: "Samuel Green",
    avatar: "https://picsum.photos/seed/lawyer3/200/200",
    specialty: "Criminal Law",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="sticky top-0 z-50 w-full bg-background/80 backdrop-blur-sm">
        <div className="container mx-auto flex h-16 items-center justify-between px-4 md:px-6">
          <Link href="/" className="flex items-center gap-2">
            <Logo className="h-8 w-8 text-primary" />
            <span className="font-headline text-2xl font-bold text-primary">
              LexConnect
            </span>
          </Link>
          <nav className="hidden items-center gap-6 md:flex">
            <Link
              href="#specialties"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              Specialties
            </Link>
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              How It Works
            </Link>
            <Link
              href="#lawyers"
              className="text-sm font-medium text-foreground/70 transition-colors hover:text-foreground"
            >
              For Lawyers
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Log In</Link>
            </Button>
            <Button
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/register">Get Started</Link>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1">
        <section className="container mx-auto grid grid-cols-1 items-center gap-8 px-4 py-20 text-center md:grid-cols-2 md:py-32 md:text-left">
          <div className="space-y-6">
            <h1 className="font-headline text-4xl font-bold tracking-tighter text-primary md:text-6xl lg:text-7xl">
              Expert Legal Advice, Instantly.
            </h1>
            <p className="max-w-[600px] text-lg text-foreground/80 md:text-xl">
              Connect with verified lawyers through secure video calls and chat.
              Your legal peace of mind is just a click away.
            </p>
            <Button
              size="lg"
              asChild
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Link href="/dashboard/find-lawyer">
                Find Your Lawyer <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
          <div className="relative h-64 w-full md:h-full">
            <Image
              src="https://picsum.photos/seed/lexconnect-hero/1200/800"
              alt="Professional lawyer consulting with a client"
              fill
              className="rounded-lg object-cover shadow-2xl"
              priority
            />
          </div>
        </section>

        <section id="specialties" className="w-full bg-white/50 py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
                Comprehensive Legal Fields
              </h2>
              <p className="mx-auto max-w-[700px] text-foreground/80 md:text-lg">
                Find an expert in any area of law you need.
              </p>
            </div>
            <div className="mx-auto mt-12 grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4">
              {legalSpecialties.map((specialty, index) => (
                <Card
                  key={index}
                  className="flex flex-col items-center justify-center p-6 text-center transition-transform hover:scale-105 hover:shadow-lg"
                >
                  <div className="mb-4 rounded-full bg-accent/10 p-4">
                    <specialty.icon className="h-8 w-8 text-accent" />
                  </div>
                  <CardTitle className="font-headline text-lg">
                    {specialty.name}
                  </CardTitle>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section id="how-it-works" className="w-full py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
                Get Help in 3 Simple Steps
              </h2>
              <p className="mx-auto max-w-[700px] text-foreground/80 md:text-lg">
                A streamlined process designed for your convenience and
                security.
              </p>
            </div>
            <div className="relative mt-12 grid gap-10 md:grid-cols-3">
              <div className="absolute left-0 top-1/2 hidden h-0.5 w-full -translate-y-1/2 bg-border md:block"></div>
              {howItWorksSteps.map((step, index) => (
                <div
                  key={index}
                  className="relative flex flex-col items-center text-center"
                >
                  <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border-2 border-accent bg-background text-2xl font-bold text-accent">
                    {step.step}
                  </div>
                  <h3 className="font-headline text-xl font-bold">
                    {step.title}
                  </h3>
                  <p className="mt-2 text-foreground/70">{step.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="lawyers" className="w-full bg-white/50 py-20 md:py-24">
          <div className="container mx-auto px-4 md:px-6">
            <div className="space-y-4 text-center">
              <h2 className="font-headline text-3xl font-bold tracking-tighter text-primary sm:text-4xl">
                Meet Our Top Lawyers
              </h2>
              <p className="mx-auto max-w-[700px] text-foreground/80 md:text-lg">
                Experienced professionals ready to assist you.
              </p>
            </div>
            <div className="mt-12">
              <Carousel
                opts={{ align: "start", loop: true }}
                className="w-full"
              >
                <CarouselContent>
                  {topLawyers.map((lawyer, index) => (
                    <CarouselItem
                      key={index}
                      className="md:basis-1/2 lg:basis-1/3"
                    >
                      <div className="p-1">
                        <Card className="h-full overflow-hidden">
                          <CardHeader className="flex flex-row items-center gap-4">
                            <Avatar className="h-16 w-16">
                              <AvatarImage
                                src={lawyer.avatar}
                                alt={lawyer.name}
                              />
                              <AvatarFallback>
                                {lawyer.name.charAt(0)}
                              </AvatarFallback>
                            </Avatar>
                            <div>
                              <CardTitle className="font-headline text-xl">
                                {lawyer.name}
                              </CardTitle>
                              <p className="text-sm text-accent font-semibold">
                                {lawyer.specialty}
                              </p>
                            </div>
                          </CardHeader>
                          <CardContent>
                            <p className="mt-4 text-sm text-foreground/80 line-clamp-3">
                              A highly-rated legal professional specializing in{" "}
                              {lawyer.specialty}.
                            </p>
                          </CardContent>
                          <CardFooter className="bg-background/50">
                            <Button
                              variant="outline"
                              asChild
                              className="w-full"
                            >
                              <Link href="/dashboard/find-lawyer">
                                View Profile
                              </Link>
                            </Button>
                          </CardFooter>
                        </Card>
                      </div>
                    </CarouselItem>
                  ))}
                </CarouselContent>
                <CarouselPrevious className="absolute left-[-50px] top-1/2 -translate-y-1/2 fill-black" />
                <CarouselNext className="absolute right-[-50px] top-1/2 -translate-y-1/2 fill-black" />
              </Carousel>
            </div>
          </div>
        </section>
      </main>

      <footer className="w-full border-t border-border/50 bg-white/50">
        <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-6 sm:flex-row md:px-6">
          <div className="flex items-center gap-2">
            <Logo className="h-6 w-6 text-primary" />
            <span className="font-headline text-lg font-bold text-primary">
              LexConnect
            </span>
          </div>
          <p className="text-sm text-foreground/60">
            © {new Date().getFullYear()} LexConnect. All rights reserved.
          </p>
          <div className="flex items-center gap-4">
            <Link
              href="#"
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              Privacy Policy
            </Link>
            <Link
              href="#"
              className="text-sm text-foreground/60 hover:text-foreground"
            >
              Terms of Service
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
