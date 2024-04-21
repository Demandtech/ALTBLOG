const calculateReadingTime = async (text) => {
	if (!text) return;

	const wordCount = text.trim().split(/\s+/).length;

	const wordsPerMinute = 180;

	const readingTimePerMinutes = Math.ceil(wordCount / wordsPerMinute);

	let reading_time;

	if (readingTimePerMinutes < 1) {
		const readingTimePerSeconds = Math.ceil(readingTimePerMinutes * 60);
		reading_time = `${readingTimePerSeconds} seconds`;
	} else if (readingTimePerMinutes >= 1 && readingTimePerMinutes < 60) {
		reading_time = `${Math.ceil(readingTimePerMinutes)} minutes`;
	} else {
		const readingTimePerHours = Math.floor(readingTimePerMinutes / 60);
		const remainingMinutes = Math.ceil(readingTimePerMinutes % 60);
		reading_time = `${readingTimePerHours} hours ${remainingMinutes} minutes`;
	}

	return reading_time;
};

export default calculateReadingTime;
