

export default function EntityViewer(entity) {

    console.log(entity)

    const ent = JSON.parse(entity.entity)
    console.log("here comes ent")
    console.log(typeof ent)

    console.log("Here comes ent.name: " + ent.name)

    const name = ent.name
    const specifiedEntries = ["parent", "children", ""]


    return (
        <div>
            <h1>{name}</h1>
            {/*<h2>{JSON.stringify(entity)}</h2>*/}
        </div>
    )

}






