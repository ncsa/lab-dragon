import React, { useState } from 'react';
import { getEntityTypeIcon } from './utils';

export default function NewEntityButtons({ newCommentFunc, newStepFunc, newTaskFunc, newProjectFunc}) {
  const [isHovered, setIsHovered] = useState(false);

  return (
    <div 
      className={`new-entity-buttons ${isHovered ? 'hovered' : ''}`}
      onMouseEnter={() => setIsHovered(true)} 
      onMouseLeave={() => setIsHovered(false)}
    >
      <button className="placeholder-button" title="Hover for addition options"> 
        <i className="bi-plus-circle placeholder"/>
      </button>
      {isHovered && (
        <div className={`extra-buttons ${isHovered ? 'hovered' : ''}`}>
          <button className="btn" title="Add a new Project to this entity">
            <span className="icon-with-plus">
              <i className={getEntityTypeIcon("Project")}/>
              <i className="bi bi-plus small-plus"/>
            </span>
          </button>
          <button className="btn" title="Add a new Task to this entity">
            <span className="icon-with-plus">
              <i className={getEntityTypeIcon("Task")}/>
              <i className="bi bi-plus small-plus"/>
            </span>
          </button>
          <button className="btn" title="Add a new Step to this entity">
            <span className="icon-with-plus">
              <i className={getEntityTypeIcon("Step")}/>
              <i className="bi bi-plus small-plus"/>
            </span>
          </button>
          <button className="btn" title="Add a new Comment to this entity" onClick={() => {newCommentFunc()}}>
            <span className="icon-with-plus">
              <i className="bi bi-chat-left-text"/>
              <i className="bi bi-plus small-plus"/>
            </span>
          </button>
        </div>
      )}
    </div>
  );
};