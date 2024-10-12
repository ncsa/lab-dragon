
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


export async function getEntity(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/${id}`);
    // const res = await fetch(`/api/entities/${id}`);
    return await res.json();
}


export async function submitContentBlockEdition(entID, user, contentBlock, newContent) {

    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "/" + contentBlock.ID + "?HTML=True&username=" + user, {
    // let response = await fetch(`/api/entities/` + entID + "/" + contentBlock.ID + "?HTML=True&username=" + user, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function submitNewContentBlock(entID, user, newContent) {
    let response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/` + entID + "?HTML=True" + "&username=" + user, {
    // let response = await fetch(`/api/entities/` + entID + "?HTML=True" + "&username=" + user, {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(newContent),
    });

    return response.status === 201;
}

export async function createEntity(name, user, type, parent) {
    const newEntity = {
        name, user, type, parent
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities`, {
    // const response = await fetch(`/api/entities`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newEntity)
    });

    return response.status === 201;
}


export async function createLibrary(name, user) {
    const newLibrary = {
        name, user
    }

    const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || ""}/api/entities/add_library`, {
    // const response = await fetch(`/api/entities/add_library`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(newLibrary)
    });

    return response.status === 201;
}












