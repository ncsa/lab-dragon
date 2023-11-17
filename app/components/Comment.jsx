
import CommentCreator from "./CommentCreator"


export const BASE_API = "http://localhost:8000/api/"

/*

A comment can be selected. This will just add a blue box around it. This will probably make it easier to add usability later on.

A comment can also be activated. This means that the comment has an active editor on it and can be edited. This will probably be done by clicking on the comment.

a comment gets selected with a single click. A comment can be activated with a double click

*/

export default function Comment({comment, entID, onClickHandler, isSelected, onDoubleClickHandler, isActivated}) {
    const content = comment.content
    const type = comment.com_type
    const comID = comment.ID
    
    const innerClickHandler = (event) => {
        onClickHandler(comID)
    }

    const innerDoubleClickHandler = (event) => {
        onDoubleClickHandler(comID)
    }

    if (type[0] == 4 || type[0] == 5) {
        return (
            <div className={`comment ${isSelected ? 'selected': ''}`}
                onClick={innerClickHandler}>
                <img src={BASE_API+"entities/"+entID+"/"+comID} alt="Image is loading" />
            </div>
        )
    } else if (type[0] == 6) {
        const tableData = content[0];
        const columnNames = Object.keys(tableData);
        const numberOfRows = tableData[columnNames[0]].length;

        return (
            <div className={`comment ${isSelected ? 'selected': ''}`}
                onClick={innerClickHandler}>
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

        if (isActivated) {
           return <CommentCreator entID={entID} initialContent={content[0]} />
        }

        return <div className={`comment ${isSelected ? 'selected': ''}`}
            onClick={innerClickHandler}
            onDoubleClick={innerDoubleClickHandler} 
            dangerouslySetInnerHTML={{ __html: content[0] }}></div> // The  span is there to have an element in which to place the argument.
    }
}