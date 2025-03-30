import React from "react";
import MaxWidthWrapper from "../common/MaxWidthWrapper";
import { Button } from "../ui/button";
import Image from "next/image";
import { LoginLink, RegisterLink } from "@kinde-oss/kinde-auth-nextjs/components";

const Hero = () => {
    return (
        <section className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-200 to-indigo-200 py-12 px-6">
            <MaxWidthWrapper>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center text-center lg:text-left">
                    <div>
                        <h1 className="mb-6 text-4xl font-extrabold leading-tight text-gray-900 sm:text-5xl md:text-6xl">
                            Transform{" "}
                            <span className="text-purple-600">YouTube Videos</span> into
                            Engaging Presentations.
                        </h1>
                        <p className="mb-8 text-lg text-gray-800 max-w-lg mx-auto lg:mx-0">
                            Convert educational content into beautifully crafted PowerPoint
                            slides effortlessly. Save time and enhance your teaching
                            experience.
                        </p>

                        <div className="flex flex-col sm:flex-row justify-center lg:justify-start space-y-4 sm:space-y-0 sm:space-x-4">
                            <RegisterLink href={"/generate"}>
                                <Button
                                    variant={"default"}
                                    className="w-full sm:w-auto bg-purple-800 hover:bg-purple-700 cursor-pointer px-6 py-3 text-md"
                                >
                                    Get Started
                                </Button>
                            </RegisterLink>
                            <LoginLink href={"/generate"}>
                                <Button
                                    variant={"outline"}
                                    className="w-full cursor-pointer sm:w-auto px-6 py-3 text-md"
                                >
                                    Generate PowerPoint
                                </Button>
                            </LoginLink>
                        </div>
                    </div>
                    <div className="w-full">
                        <Image
                            src="/lecture-1.jpg"
                            className="w-full h-auto object-cover rounded-2xl"
                            alt="Hero Image"
                            width={600}
                            height={600}
                            priority
                        />
                    </div>


                </div>
            </MaxWidthWrapper>
        </section>
    );
};

export default Hero;
