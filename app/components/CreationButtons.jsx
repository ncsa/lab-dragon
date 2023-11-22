






export default function CreationButtons({ entID, entType, newCommentActivator }) {
    return (
        <div className={`comment-buttons ${entType ? entType : ""}`}>
            <button onClick={() => {
                newCommentActivator(entID)}}>New Comment</button>
            <button>New Step</button>
            <button>New Task</button>
        </div>
    )
}