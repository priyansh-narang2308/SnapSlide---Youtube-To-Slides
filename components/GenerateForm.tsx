"use client";

import { VideoIcon, Loader2 } from "lucide-react";
import { useState } from "react";
import { Input } from "./ui/input";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { CreatePowerpoint } from "@/app/generate/actions";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const GenerateForm = () => {
    const router = useRouter();
    const [url, setUrl] = useState<string>("");
    const [isValid, setIsValid] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const validateYouTubeUrl = (url: string) => {
        const pattern =
            /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
        return pattern.test(url);
    };

    const getVideoId = (url: string) => {
        const match = url.match(
            /(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/
        );
        return match ? match[1] : null;
    };

    const handleUrlChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newUrl = e.target.value.trim();
        setUrl(newUrl);

        if (!newUrl) {
            setError(null);
            setIsValid(false);
            return;
        }

        const videoId = getVideoId(newUrl);
        if (validateYouTubeUrl(newUrl) && videoId) {
            setError(null);
            setIsValid(true);
        } else {
            setError("Invalid YouTube URL");
            setIsValid(false);
        }
    };

    const handleGenerate = async () => {
        if (!url) {
            setError("Please enter a valid URL");
            toast.error("Please enter a valid YouTube URL.");
            return;
        }

        if (!isValid) {
            setError("Invalid URL");
            toast.error("Invalid YouTube URL.");
            return;
        }

        setError(null);
        const videoId = getVideoId(url);
        if (!videoId) {
            setError("Invalid Video ID!");
            toast.error("Invalid Video ID!");
            return;
        }

        setIsLoading(true);

        try {
            const result = await CreatePowerpoint(videoId);
            setIsLoading(false);

            if (!result.success) {
                toast.error("Something went wrong. Please try again later.");
                return;
            }

            toast.success("PowerPoint generated successfully!");
            router.push(`/dashboard`);
        } catch (error) {
            setIsLoading(false);
            toast.error("Something went wrong. Try again later.");
            console.error(error);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-indigo-100 via-white to-purple-100 py-12">
            <div className="max-w-4xl mx-auto px-6">
                <h1 className="text-5xl font-extrabold text-center mb-8 text-gray-800 leading-tight">
                    Create Stunning Presentations
                    <span className="block text-lg font-medium text-gray-600 mt-2">
                        Convert any YouTube video into a professional PowerPoint
                    </span>
                </h1>
                <Card className="p-8 shadow-2xl bg-white/80 backdrop-blur-2xl border-0">
                    <div className="mb-8 rounded-xl overflow-hidden shadow-lg bg-white p-6">
                        {isValid ? (
                            <div className="aspect-video rounded-lg overflow-hidden shadow-xl">
                                <iframe
                                    className="w-full h-full rounded-lg"
                                    src={`https://www.youtube.com/embed/${getVideoId(url)}`}
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                    allowFullScreen
                                    title="YouTube video player"
                                ></iframe>
                            </div>
                        ) : (
                            <div className="aspect-video bg-gradient-to-br from-gray-200 to-gray-100 rounded-lg flex flex-col items-center justify-center text-gray-500 shadow-inner border border-gray-300">
                                <motion.div
                                    animate={{ scale: [1, 1.2, 1] }}
                                    transition={{ repeat: Infinity, duration: 1.5 }}
                                >
                                    <VideoIcon className="w-20 h-20 mb-4 text-gray-400" />
                                </motion.div>
                                <p className="text-lg font-medium">Enter a YouTube URL to get started</p>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-col sm:flex-row gap-4 items-center">
                        <Input
                            type="url"
                            placeholder="Paste YouTube URL here"
                            value={url}
                            onChange={handleUrlChange}
                            className="flex-1 h-14 px-4 text-lg rounded-lg border-gray-300 focus:border-purple-400 focus:ring-purple-300 shadow-sm"
                            disabled={isLoading}
                            aria-label="YouTube URL"
                        />
                        <motion.div
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            <motion.button
                                className="h-14 px-6 bg-purple-600 text-white text-lg font-semibold rounded-lg shadow-md hover:bg-purple-700 transition-all flex items-center justify-center cursor-pointer"
                                disabled={isLoading || !isValid}
                                animate={{ y: [0, -5, 3] }}
                                transition={{ repeat: Infinity, duration: 1.5 }}
                                onClick={handleGenerate}
                            >
                                {isLoading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Generate"}
                            </motion.button>
                        </motion.div>
                    </div>
                    <p className="text-sm text-center text-red-600 mt-4 font-semibold bg-red-100 border border-red-400 p-2 rounded-md">
                        ⚠ Supported Format: YouTube video URLs (e.g., https://youtube.com/watch?v=...)
                    </p>
                </Card>
            </div>
        </div>
    );
};

export default GenerateForm;
