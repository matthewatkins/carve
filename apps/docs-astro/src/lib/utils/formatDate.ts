/**
 * Format a date to a human-readable string
 * @param date - The date to format
 * @returns A human-readable string representing the date
 */
export const formatDate = (date: Date) => {
	const isoDate = date.toISOString();
	const displayDate = isoDate.split("T")[0];
	return `<time datetime="${isoDate}">${displayDate}</time>`;
};
