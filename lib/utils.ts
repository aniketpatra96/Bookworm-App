// this function will convert the createdAt to this format: "May 2023"
export function formatMemberSince(dateString: string): string {
    const date: Date = new Date(dateString);
    const month: string = date.toLocaleString("default", { month: "short" });
    const year: number = date.getFullYear();
    return `${month} ${year}`;
}

// this function will convert the createdAt to this format: "May 15, 2023"
export function formatPublishDate(dateString: string): string {
    const date: Date = new Date(dateString);
    const month: string = date.toLocaleString("default", { month: "long" });
    const day: number = date.getDate();
    const year: number = date.getFullYear();
    return `${month} ${day}, ${year}`;
}