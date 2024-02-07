
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
    return combinedArray.map((item, index) => {
        return { index: index, obj: item };
    });
};

// Function to get the entity details from the API.
export async function getEntity(id, only_name = false) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id, {
        cache: 'no-store'
    })
    const rawEnt = await response.json()
    const parsedEnt = JSON.parse(rawEnt)
    parsedEnt.comments = parsedEnt.comments.map(comment => JSON.parse(comment))
    return parsedEnt
}

// Function to get all the comments from an entity.
export async function getComments(id) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/` + id, {
        cache: 'no-store'
    })
    if (!response.ok) {
        throw new Error(response.statusText)
    }

    const ent = await response.json()
    const parsedEnt = JSON.parse(ent)
    const parsedComments = parsedEnt.comments.map(comment => JSON.parse(comment))

    return parsedComments
}