export async function getEntity(id) {
    const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/entities/${id}`);
    return await res.json();
}