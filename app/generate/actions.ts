"use server";
import { db } from "@/db";
import { getKindeServerSession } from "@kinde-oss/kinde-auth-nextjs/server";
import axios from "axios";
import { DOMParser } from "xmldom";
import { z } from "zod";
import { GoogleGenerativeAI } from "@google/generative-ai";
import pptxgen from "pptxgenjs";
import { randomUUID } from "crypto";
import path from "path";
import type { UploadFileResult } from "uploadthing/types";
import { UTApi } from "uploadthing/server";
import fs from "fs";
import os from 'os';

const CURRENT_MODEL = "gemini-1.5-pro";
const DEFAULT_SLIDE_COUNT = 10;

const utapi = new UTApi({
        token: process.env.UPLOADTHING_TOKEN!,
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

type SlideContent = {
        title: string;
        content: string[];
};

type VideoMetaData = {
        length: number | null;
        subtitlesURL: string | null;
        title: string | null;
};

type SubtitleItem = {
        text: string;
};

const TitleAndDescriptionSchema = z.object({
        title: z.string(),
        description: z.string(),
});

const arrayOfObjectsSchema = z.object({
        arrayOfObjects: z.array(
                z.object({
                        title: z.string(),
                        content: z.array(z.string()),
                })
        ),
});

type TitleDescription = z.infer<typeof TitleAndDescriptionSchema>;

export async function CreatePowerpoint(videoId: string) {
        try {
                const { getUser } = getKindeServerSession();
                const user = await getUser();
                if (!user || !user.id) {
                        return {
                                success: false,
                                error: "User not authenticated"
                        };
                }
                const dbUser = await db.user.findFirst({
                        where: {
                                id: user.id,
                        },
                });

                if (!dbUser) {
                        return {
                                success: false,
                                error: "User not found in database"
                        };
                }

                const { length, subtitlesURL, title } = await GetVideoLengthAndSubtitles(videoId);
                console.log("Video metadata:", length, subtitlesURL, title);

                if (length && length > 600) {
                        return {
                                success: false,
                                error: "Video needs to be less than 10 minutes"
                        };
                }

                let fullText;
                let titleAndDescription;
                let slideObjects;

                if (!subtitlesURL) {
                        // Create a fallback presentation when no subtitles are available
                        console.log("No subtitles found, creating fallback presentation");

                        titleAndDescription = {
                                title: title || `Presentation for YouTube Video: ${videoId}`,
                                description: "This video doesn't have subtitles. Limited content available."
                        };

                        slideObjects = [
                                {
                                        title: "About This Video",
                                        content: [
                                                "This presentation was created with limited information because the video doesn't have subtitles.",
                                                "To get better results, try using videos with closed captions enabled.",
                                                "You can add captions to your YouTube videos in YouTube Studio.",
                                                "The presentation includes basic information about the video."
                                        ]
                                },
                                {
                                        title: "Video Information",
                                        content: [
                                                `Video ID: ${videoId}`,
                                                `Video Title: ${title || "Not available"}`,
                                                `Video Length: ${length ? Math.floor(length / 60) + " minutes, " + (length % 60) + " seconds" : "Unknown"}`,
                                                "This presentation was generated automatically."
                                        ]
                                },
                                {
                                        title: "Next Steps",
                                        content: [
                                                "You can edit this presentation to add your own content.",
                                                "Consider using videos with subtitles for better results.",
                                                "You can download this presentation and modify it in PowerPoint.",
                                                "Thank you for using our service!"
                                        ]
                                }
                        ];
                } else {
                        // Normal flow when subtitles are available
                        const parsedSubtitles = await parseXMLContent(subtitlesURL);
                        if (!parsedSubtitles || parsedSubtitles.length === 0) {
                                return {
                                        success: false,
                                        error: "Failed to parse subtitles"
                                };
                        }

                        fullText = parsedSubtitles.map((item) => item.text).join(" ");

                        [titleAndDescription, slideObjects] = await Promise.all([
                                CreateTitleAndDescription(fullText),
                                ConvertToObjects(fullText),
                        ]);

                        if (!slideObjects || slideObjects.length === 0) {
                                return {
                                        success: false,
                                        error: "Failed to generate slide content"
                                };
                        }
                }

                const { fileName, filePath } = await CreatePowerpointFromArrayOfObjects(
                        titleAndDescription,
                        slideObjects,
                        user.id
                );

                const fileBuffer = await fs.promises.readFile(filePath);
                const UploadResult = await UploadPowerpointToUploadThing(
                        fileBuffer,
                        fileName
                );

                if (!UploadResult[0].data?.url) {
                        return {
                                success: false,
                                error: "Upload failed - No URL returned"
                        };
                }

                await db.generatedPowerPoints.create({
                        data: {
                                link: UploadResult[0].data?.url,
                                ownerId: user.id,
                                title: titleAndDescription.title,
                                description: titleAndDescription.description,
                        },
                });

                await fs.promises.unlink(filePath);

                return {
                        success: true,
                        url: UploadResult[0].data.url
                };
        } catch (error) {
                console.error("PowerPoint creation error:", error);
                return {
                        success: false,
                        error: error instanceof Error ? error.message : "Failed to create powerpoint"
                };
        }
}

export async function GetVideoLengthAndSubtitles(
        videoId: string
): Promise<VideoMetaData> {
        try {
                const options = {
                        method: "GET",
                        url: "https://yt-api.p.rapidapi.com/video/info",
                        params: {
                                id: videoId,
                                lang: "en"
                        },
                        headers: {
                                "x-rapidapi-key": process.env.RAPID_API_KEY,
                                "x-rapidapi-host": "yt-api.p.rapidapi.com",
                        },
                        timeout: 5000
                } as const;

                const response = await axios.request(options);

                const subtitles = response.data?.subtitles?.subtitles || [];

                const subtitleUrl = subtitles.find((sub: any) =>
                        sub.languageCode === "en"
                )?.url || subtitles[0]?.url || null;

                return {
                        length: response.data?.lengthSeconds || null,
                        subtitlesURL: subtitleUrl,
                        title: response.data?.title || null
                };
        } catch (error) {
                console.error("Video metadata fetch error:", error instanceof Error ? error.message : error);
                return {
                        length: null,
                        subtitlesURL: null,
                        title: null
                };
        }
}

async function parseXMLContent(url: string): Promise<SubtitleItem[] | null> {
        try {
                const response = await axios.get(url, {
                        // Add timeout and better error handling
                        timeout: 5000,
                        validateStatus: function (status) {
                                // Resolve only if status code is less than 500
                                return status < 500;
                        }
                });

                // Check if we got a valid response
                if (response.status === 404) {
                        console.log("Subtitles URL returned 404 - subtitles not found");
                        return null;
                }

                if (response.status !== 200) {
                        console.log(`Unexpected status code when fetching subtitles: ${response.status}`);
                        return null;
                }

                // Check if the response contains valid XML data
                if (!response.data || typeof response.data !== 'string') {
                        console.log("Invalid subtitle data received");
                        return null;
                }

                const parser = new DOMParser();
                const doc = parser.parseFromString(response.data, "application/xml");

                // Check for parser errors
                if (doc.getElementsByTagName("parsererror").length > 0) {
                        console.log("Failed to parse XML content");
                        return null;
                }

                const textElements = doc.getElementsByTagName("text");
                const subtitles: SubtitleItem[] = [];

                // Convert NodeList to array of SubtitleItem
                for (let i = 0; i < textElements.length; i++) {
                        const element = textElements[i];
                        const text = element.textContent || '';
                        subtitles.push({ text });
                }

                return subtitles.length > 0 ? subtitles : null;
        } catch (error) {
                console.error("XML parsing failed:", error instanceof Error ? error.message : error);
                return null;
        }
}


export async function CreateTitleAndDescription(
        transcript: string
): Promise<TitleDescription> {
        const promptTemplate = `Generate a title and description for this Powerpoint presentation based on the following transcript. 
    Requirements: 
    - Title should be fewer than 20 words 
    - description should be fewer than 35 words 
    - Focus on content rather than speaker 
    - make sure the output is in English 
    - Your response should be in JSON format with keys "title" and "description"

    Transcript: ${transcript}
    `;

        try {
                const model = genAI.getGenerativeModel({ model: CURRENT_MODEL });

                const result = await model.generateContent(promptTemplate);
                const response = await result.response;
                const text = response.text();

                // Parse JSON from the response text
                const jsonMatch = text.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                        throw new Error("Failed to extract JSON from Gemini response");
                }

                const parsedResult = JSON.parse(jsonMatch[0]);

                // Validate against our schema
                const validatedResult = TitleAndDescriptionSchema.parse(parsedResult);

                return validatedResult;
        } catch (error) {
                console.error("Title generation error:", error);
                // Provide a fallback if AI generation fails
                return {
                        title: "Presentation from YouTube Video",
                        description: "Automatically generated presentation based on video content."
                };
        }
}

export async function ConvertToObjects(
        text: string,
        slideCount = DEFAULT_SLIDE_COUNT
): Promise<SlideContent[] | null> {
        const promptTemplate = `Condense and tidy up the following text to make it suitable for a Powerpoint presentation. Transform it 
        into an array of objects. I have provided the schema for the output. Make sure that the content array has between 3 and 4 items, 
        and each content string should be between 160 and 170 characters. You can add to the content based on the transcript. 
        The length of the array should be ${slideCount}.
        
        The output must be a valid JSON object with a single key "arrayOfObjects" containing an array of objects. 
        Each object must have a "title" string and a "content" array of strings.
        
        The text to process is as follows: ${text}
    `;

        try {
                const model = genAI.getGenerativeModel({ model: CURRENT_MODEL });

                const result = await model.generateContent(promptTemplate);
                const response = await result.response;
                const responseText = response.text();

                // Extract JSON from the response text
                const jsonMatch = responseText.match(/\{[\s\S]*\}/);
                if (!jsonMatch) {
                        throw new Error("Failed to extract JSON from Gemini response");
                }

                const parsedResult = JSON.parse(jsonMatch[0]);

                // Validate against our schema
                const validatedResult = arrayOfObjectsSchema.parse(parsedResult);

                return validatedResult.arrayOfObjects;
        } catch (error) {
                console.error("Slide content generation error:", error);
                return null;
        }
}

export async function CreatePowerpointFromArrayOfObjects(
        titleAndDescription: TitleDescription,
        slides: SlideContent[],
        userId: string
) {
        const pptx = new pptxgen();

        // Create title slide
        const titleSlide = pptx.addSlide();
        titleSlide.background = { color: "#FFFFFF" };

        titleSlide.addText(titleAndDescription.title, {
                x: 0,
                y: "40%",
                w: "100%",
                h: 1,
                fontSize: 33,
                bold: true,
                color: "003366",
                align: "center",
                fontFace: "Helvetica",
        });

        titleSlide.addText(titleAndDescription.description, {
                x: 0,
                y: "58%",
                w: "100%",
                h: 0.75,
                fontSize: 18,
                color: "888888",
                align: "center",
                fontFace: "Helvetica",
        });

        // Add content slides
        slides.forEach(({ title, content }) => {
                const slide = pptx.addSlide();
                slide.addText(title, {
                        x: 0.5,
                        y: 0.5,
                        w: 8.5,
                        h: 1,
                        fontSize: 32,
                        bold: true,
                        color: "003366",
                        align: "center",
                        fontFace: "Arial",
                });

                content.forEach((bullet, index) => {
                        slide.addText(bullet, {
                                x: 1,
                                y: 1.8 + index * 1,
                                w: 8,
                                h: 0.75,
                                fontSize: 15,
                                color: "333333",
                                align: "left",
                                fontFace: "Arial",
                                bullet: true,
                        });
                });
        });

        try {
                const tempDir = path.join(os.tmpdir(), 'ppt-generator');

                if (!fs.existsSync(tempDir)) {
                        fs.mkdirSync(tempDir, { recursive: true });
                }

                const fileName = `presentation-${randomUUID()}-userId=${userId}.pptx`;
                const filePath = path.join(tempDir, fileName);

                await pptx.writeFile({ fileName: filePath });

                return {
                        fileName,
                        filePath,
                };
        } catch (error) {
                console.error("PowerPoint file creation error:", error);
                throw new Error(`Failed to create PowerPoint file: ${error instanceof Error ? error.message : String(error)}`);
        }
}
export async function UploadPowerpointToUploadThing(
        fileBuffer: Buffer,
        fileName: string
): Promise<UploadFileResult[]> {
        try {
                const file = new File([fileBuffer], fileName, {
                        type: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
                });

                const response = await utapi.uploadFiles([file]);

                if (!response?.[0].data?.url) {
                        throw new Error("Upload failed - No URL returned");
                }

                return response;
        } catch (error) {
                console.error("Upload error:", error);
                throw new Error("Failed to upload PowerPoint to UploadThing");
        }
}