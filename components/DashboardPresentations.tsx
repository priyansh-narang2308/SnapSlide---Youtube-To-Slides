'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
    Card,
    CardHeader,
    CardTitle,
    CardDescription,
    CardContent,
} from '@/components/ui/card';
import { formatDistanceToNow } from 'date-fns';
import Link from 'next/link';
import { ExternalLink, Presentation } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GeneratedPowerPoints } from '@prisma/client';

const DashboardPresentations = ({ presentations }: { presentations: GeneratedPowerPoints[] }) => {
    if (!presentations || presentations.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-[80vh] bg-gradient-to-br from-blue-500 to-purple-600 p-6 rounded-xl shadow-lg">
                <Card className="bg-white/90 backdrop-blur-sm p-8 flex flex-col items-center justify-center shadow-xl rounded-2xl">
                    <Presentation className="h-16 w-16 text-gray-500 mb-4" />
                    <p className="text-xl font-semibold text-gray-900">No presentations yet</p>
                    <p className="text-md text-gray-500 mt-2">Generate your first presentation to get started</p>
                    <Link href="/generate">
                        <Button className="mt-6 px-6 py-2 text-lg">Create Presentation</Button>
                    </Link>
                </Card>
            </div>
        );
    }

    return (
        <div className="min-h-screen pt-1">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
            >
                {presentations.map((presentation) => (
                    <motion.div
                        key={presentation.id}
                        whileHover={{ scale: 1.05 }}
                        transition={{ type: 'spring', stiffness: 200 }}
                    >
                        <Card className="bg-white/90 backdrop-blur-lg p-6 rounded-2xl shadow-2xl hover:shadow-xl transition-shadow">
                            <CardHeader>
                                <CardTitle className="line-clamp-1 text-lg font-semibold">
                                    {presentation.title || 'Untitled Presentation'}
                                </CardTitle>
                                <CardDescription className="text-sm text-gray-500">
                                    Created {formatDistanceToNow(new Date(presentation.createdAt), { addSuffix: true })}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 text-sm mb-4 line-clamp-2">
                                    {presentation.description || 'No description available'}
                                </p>
                                <div className="flex justify-between items-center">
                                    <Link
                                        href={presentation.link}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="flex items-center text-sm text-blue-600 hover:text-blue-800 font-medium"
                                    >
                                        <ExternalLink className="h-4 w-4 mr-1" />
                                        View Presentation
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default DashboardPresentations;