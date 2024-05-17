const calculateReadingTime = async (text) => {
	if (!text) return 0;

	const wordCount = text.trim().split(/\s+/).length;

	const wordsPerMinute = 180;

	const readingTimePerMinutes = wordCount / wordsPerMinute;

	// console.log(readingTimePerMinutes, wordCount / wordsPerMinute)

	const readingTimeSeconds = Math.ceil(readingTimePerMinutes * 60);

	return readingTimeSeconds;
};

export default calculateReadingTime;
