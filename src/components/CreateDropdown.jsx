import React from 'react';

import { FaTrello, FaRegCalendarAlt } from 'react-icons/fa';

export default function CreateDropdown({onCreateBoard, onStartTemplate}){
    return(
        <div className="create-dropdown">
            <div className="create-item" onClick={onCreateBoard}>
                <FaTrello className ="icon" />
                <div>
                    <div className="title">Create board</div>
                    <div className="desc">
                        A board is made up of cards ordered on lists. Use it to manage projects, track information, or organize anything.                    
                    </div>
                </div>
            </div>
            <div className="create-item" onClick={onStartTemplate}>
                <FaRegCalendarAlt className="icon" />
                <div>
                    <div className="title">Start with a template</div>
                    <div className="desc"> Get started faster with a board template</div>
                </div>
            </div>
        </div>
    )
}