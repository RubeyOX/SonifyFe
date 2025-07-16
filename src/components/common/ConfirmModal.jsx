import React from 'react'
import './ConfirmModal.css'
export default function ConfirmModal({ isOpen, message, select }) {
    if (!isOpen) {
        return null
    }
    return (
        <div className="confirm-modal-layout">
            <div className='confirm-modal-container'>
                <p>{message}</p>
                <div className="select-section">
                    <button onClick={() => select('yes')}>Yes</button><button onClick={() => select('no')}>No</button>
                </div>
            </div>
        </div>
    )
}
