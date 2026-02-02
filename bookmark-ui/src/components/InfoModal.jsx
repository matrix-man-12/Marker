import './ConfirmModal.css';

/**
 * InfoModal - For displaying information/results (single button)
 */
export function InfoModal({ isOpen, title, message, buttonText, onClose, variant }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions modal-actions-single">
                    <button
                        className={`modal-btn modal-btn-confirm ${variant === 'danger' ? 'danger' : variant === 'success' ? 'success' : ''}`}
                        onClick={onClose}
                    >
                        {buttonText || 'OK'}
                    </button>
                </div>
            </div>
        </div>
    );
}
