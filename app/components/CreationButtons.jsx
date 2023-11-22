






export default function CreationButtons({ entType }) {

    console.log("entType", entType);

    return (
        <div className={`comment-buttons ${entType ? entType : ""}`}>
            <button>New Comment</button>
            <button>New Step</button>
            <button>New Task</button>
        </div>
    )
}