"use client";

import { useState } from "react";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "./ui/sheet";
import { Button, buttonVariants } from "./ui/button";
import { MenuIcon, Presentation } from "lucide-react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { ScrollArea } from "./ui/scroll-area";
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";


interface MobileLinkProps {
    href: string;
    onOpenChange?: (open: boolean) => void;
    children: React.ReactNode;
    className?: string;
}

const MobileLink = ({ href, onOpenChange, className, children }: MobileLinkProps) => {
    return (
        <Link
            href={href}
            onClick={() => onOpenChange?.(false)}
            className={cn(
                "text-lg font-semibold text-gray-900 hover:text-gray-700 transition duration-200 text-center py-2",
                className
            )}
        >
            {children}
        </Link>
    );
};

const NavbarMobile = ({ user }: { user: KindeUser<object> | null }) => {
    const [open, setOpen] = useState<boolean>(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
                <Button variant="ghost" className="p-2">
                    <MenuIcon className="h-6 w-6 text-gray-900" />
                    <span className="sr-only">Toggle Menu</span>
                </Button>
            </SheetTrigger>

            <SheetContent side="left" className="pr-0 w-64 bg-gradient-to-b from-gray-50 to-gray-200 shadow-lg">
                <div className="flex items-center justify-center space-x-2 mt-6">
                    <Presentation className="h-7 w-7 text-gray-800" />
                    <SheetTitle className="text-2xl font-bold text-gray-900">SnapSlide</SheetTitle>
                </div>

                <ScrollArea className="my-6 h-[calc(100vh-10rem)] pb-10 pr-6">
                    <div className="flex flex-col items-center space-y-6">
                        <MobileLink href="/generate" onOpenChange={setOpen}>
                            Generate
                        </MobileLink>
                        <MobileLink href="/guidelines" onOpenChange={setOpen}>
                            Guidelines
                        </MobileLink>

                        {user ? (
                            <div className="flex flex-col space-y-3 w-full">
                                <MobileLink href="/dashboard">Dashboard</MobileLink>
                                <LogoutLink className={buttonVariants({ className: "w-full text-center" })}>
                                    Log out
                                </LogoutLink>
                            </div>
                        ) : (
                            <div className="flex flex-col space-y-3 w-full">
                                <LoginLink

                                    className={buttonVariants({
                                        variant: "outline",
                                        className: "w-11/12 mx-auto text-center border-gray-400 hover:border-gray-600",
                                    })}
                                >
                                    Login
                                </LoginLink>
                                <RegisterLink
                                    className={buttonVariants({
                                        className: "w-11/12 mx-auto text-center bg-black  text-white hover:bg-gray-800",
                                    })}
                                >
                                    Create Account
                                </RegisterLink>
                            </div>
                        )}
                    </div>
                </ScrollArea>
            </SheetContent>
        </Sheet>
    );
};

export default NavbarMobile;
