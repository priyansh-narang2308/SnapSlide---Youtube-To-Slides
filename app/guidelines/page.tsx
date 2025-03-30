
const Guidelines = () => {
    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-200 text-black p-6">
            <div className="max-w-3xl mx-auto mt-16 p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-lg">
                <h1 className="text-6xl font-bold text-center mb-6">Guidelines</h1>
                <ul className="list-disc pl-6 space-y-3 text-lg">
                    <li>Ensure the YouTube video has clear audio for accurate conversion.</li>
                    <li>Videos should be public or unlisted for processing.</li>
                    <li>Each slide will contain a summary of key points from the video.</li>
                    <li>Longer videos may take more time to process.</li>
                    <li>Check the generated slides for accuracy and make necessary edits.</li>
                    <li>Copyrighted content should be used responsibly and legally.</li>
                </ul>
            </div>
        </div>
    );
};

export default Guidelines;
