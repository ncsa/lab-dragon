
export const BASE_API = "http://localhost:8000/api/"


export async function getSidebarItems() {
    const response = await fetch(BASE_API+"entities" , {
        next: {
            revalidate: 0
        }
    })

    return response.json()
}


export async function getEntity(id, only_name = false) {
    console.log("about to search for: " + id + " only_name: " + only_name)

    let response = await fetch(BASE_API+"entities/" + id, {
        next: {
            revalidate: 60 // How often nextjs is re caching the data
        }
    })


    return response.json()


}

export async function getEntityName(id) {
    let response = await fetch(BASE_API+"entities/" + id + "?name_only=true", {
        next: {
            revalidate: 60 // How often nextjs is re caching the data
        }
    })

    return response.json()
}




