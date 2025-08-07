/**
 * Get a data attribute from an element and parse it as a JSON object.
 * @param element - The element to get the data attribute from.
 * @param attr - The name of the data attribute to get.
 * @returns The data attribute as a JSON object.
 */
export function getDataAttribute<T>(element: HTMLElement, attr: string): T {
	return JSON.parse(element.dataset[attr] || "{}");
}
