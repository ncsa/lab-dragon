
export async function getEntity(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/${id}`);
    return await res.json();
}


// Function to arrange the comments and child entities in order of their creation time.
export const sortAndFilterChildren = (entity, displayChildren, onlyShowBookmarked) => {
    let combinedArray = [];
    if (entity !== null && displayChildren !== null) {
        combinedArray = [...entity.comments, ...displayChildren];
        combinedArray.sort((a, b) => {
            const timeA = a.created ? new Date(a.created) : new Date(a.start_time);
            const timeB = b.created ? new Date(b.created) : new Date(b.start_time);
            return timeA - timeB;
        });

        if (onlyShowBookmarked) {
            combinedArray = combinedArray.filter(item => item.com_type || item.bookmarked);
        }
    }
    return combinedArray
};