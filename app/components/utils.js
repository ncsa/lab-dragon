
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

// Accepts a list of children, goes through it and fetches the details of each grandchild.
// Returns a list where the key are the children and the values are a list of all of the grandchildren.
export async function fetchChildrenOfChildren(children) {
    let childrenDict = {};
    for (let child of children) { // Iterate through the passed children argument
        if (!child.children || child.children.length === 0) {
            childrenDict[child.ID] = null;
            continue;
        }
        
        let grandChildren = [];
        for (let grandChild of child.children) {
            const grandChildDetails = await getEntity(grandChild);
            grandChildren.push(grandChildDetails);
        }
        childrenDict[child.ID] = grandChildren;
    }
    return childrenDict;
}