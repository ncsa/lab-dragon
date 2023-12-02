import { useContext } from "react";
import { CreationPopupContext } from "../contexts/CreationPopupContext";



export default function CreationButtons({ entID, entType, newCommentActivator, onlyComment = false }) {

    const { setIsPopupOpen } = useContext(CreationPopupContext);
    const { setType, setName, setParent } = useContext(CreationPopupContext);

    return (
        <div className={`comment-buttons ${entType ? entType : ""}`}>
            <button onClick={() => {
                newCommentActivator(entID)}}>New Comment</button>
            
            {!onlyComment && entType !== "Step" && (
                <>
                    <button onClick={() => {
                        setName("");
                        setType("Step");
                        setParent(entID);
                        setIsPopupOpen(true)}}>New Step</button>
                    <button onClick={() => {
                        setName("");
                        setType("Task");
                        setParent(entID);
                        setIsPopupOpen(true)}}>New Task</button>
                </>
            )}
        </div>
    )
}