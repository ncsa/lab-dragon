
export async function getSidebarItems() {
    const response = await fetch("http://localhost:8000/api/entities" , {
        next: {
            revalidate: 0
        }
    })

    return response.json()
}


export async function getEntity(id, only_name = false) {
    console.log("about to search for: " + id + " only_name: " + only_name)

    let response = await fetch("http://localhost:8000/api/entities/" + id, {
        next: {
            revalidate: 60 // How often nextjs is re caching the data
        }
    })


    return response.json()


}

export async function getEntityName(id) {
    let response = await fetch("http://localhost:8000/api/entities/" + id + "?name_only=true", {
        next: {
            revalidate: 60 // How often nextjs is re caching the data
        }
    })

    return response.json()
}




