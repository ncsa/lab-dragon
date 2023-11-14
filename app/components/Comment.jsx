
export const BASE_API = "http://localhost:8000/api/"

export default function Comment({comment, entID}) {
    const content = comment.content
    const type = comment.com_type
    const comID = comment.ID
    
    if (type[0] == 4 || type[0] == 5) {
        return (
            <div className="comment">
                <img src={BASE_API+"entities/"+entID+"/"+comID} alt="Image is loading" />
            </div>
        )
    } else if (type[0] == 6) {
        const tableData = content[0];
        const columnNames = Object.keys(tableData);
        const numberOfRows = tableData[columnNames[0]].length;

        return (
            <div className="comment">
                <table>
                    <thead>
                        <tr>
                            {columnNames.map((columnName, index) => (
                                <th key={index}>{columnName}</th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {Array.from({ length: numberOfRows }).map((_, rowIndex) => (
                            <tr key={rowIndex}>
                                {columnNames.map((columnName, columnIndex) => (
                                    <td key={columnIndex}>{tableData[columnName][rowIndex]}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        ) 
    } else {
        return <div className="comment" dangerouslySetInnerHTML={{ __html: content[0] }}></div> // The  span is there to have an element in which to place the argument.
    }
}