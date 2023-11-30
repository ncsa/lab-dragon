import { useContext } from "react";
import { CreationPopupContext } from "../contexts/CreationPopupContext";



export default function CreationButtons({ entID, entType, newCommentActivator }) {

    const { setIsPopupOpen } = useContext(CreationPopupContext);
    const { setType, setName } = useContext(CreationPopupContext);

    return (
        <div className={`comment-buttons ${entType ? entType : ""}`}>
            <button onClick={() => {
                newCommentActivator(entID)}}>New Comment</button>
            <button onClick={() => {
                setName("");
                setType("Step");
                setIsPopupOpen(true)}}>New Step</button>
            <button onClick={() => {
                setName("");
                setType("Task");
                setIsPopupOpen(true)}}>New Task</button>
        </div>
    )
}