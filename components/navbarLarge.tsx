import Link from "next/link";
import MaxWidthWrapper from "./common/MaxWidthWrapper";
import { LayoutDashboard, Presentation } from "lucide-react";
import NavbarMobile from "./navbarMobile";
import { Button } from "./ui/button";
import { RegisterLink, LoginLink, LogoutLink } from "@kinde-oss/kinde-auth-nextjs/components";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import { KindeUser } from "@kinde-oss/kinde-auth-nextjs/types";

const NavbarLarge = async () => {
    const { getUser } = getKindeServerSession();
    const user: KindeUser<object> | null = await getUser();

    return (
        <nav className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
            <MaxWidthWrapper className="flex items-center justify-between px-6 md:px-12 py-4 w-full">
                <div className="flex items-center space-x-4 group">
                    <Presentation className="w-9 h-9 text-gray-900 transition-transform duration-300 group-hover:rotate-12" />
                    <Link href="/" className="text-3xl font-extrabold text-gray-900 hover:text-gray-700 transition">
                        SnapSlide
                    </Link>
                </div>

                <div className="hidden md:flex space-x-8 text-lg font-medium">
                    <Link href="/generate" className="hover:text-gray-700 transition">Generate</Link>
                    <Link href="/guidelines" className="hover:text-gray-700 transition">Guidelines</Link>
                </div>

                <div className="flex items-center space-x-4 md:space-x-6">
                    <div className="md:hidden">
                        <NavbarMobile user={user} />
                    </div>

                    <div className="hidden md:flex items-center space-x-3">
                        {user ? (
                            <>
                                <Link
                                    href="/dashboard"
                                    className="flex items-center space-x-2 bg-purple-800 hover:bg-purple-700 text-md  text-white px-4 py-2 rounded-lg shadow-md transition cursor-pointer"
                                >
                                    <span className="text-md">Dashboard</span>
                                    <LayoutDashboard className="h-5 w-5" />
                                </Link>
                                <LogoutLink>
                                    <Button variant="outline" className="px-4 py-2 text-gray-900 border-gray-400 hover:border-gray-900 transition cursor-pointer">
                                        Logout
                                    </Button>
                                </LogoutLink>
                            </>
                        ) : (
                            <>
                                <LoginLink>
                                    <Button variant="outline" className="px-4 py-2 text-gray-900 border-gray-400 hover:border-gray-900 transition cursor-pointer">
                                        Login
                                    </Button>
                                </LoginLink>
                                <RegisterLink>
                                    <Button variant="default" className="px-4 py-2 bg-purple-600 text-white hover:bg-purple-700 transition cursor-pointer">
                                        Create Account
                                    </Button>
                                </RegisterLink>
                            </>
                        )}
                    </div>
                </div>
            </MaxWidthWrapper>
        </nav>
    );
};

export default NavbarLarge;
