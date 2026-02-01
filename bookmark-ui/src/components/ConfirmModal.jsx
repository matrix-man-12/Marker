import './ConfirmModal.css';

export function ConfirmModal({ isOpen, title, message, confirmText, cancelText, onConfirm, onCancel, variant }) {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal-content" onClick={e => e.stopPropagation()}>
                <h3 className="modal-title">{title}</h3>
                <p className="modal-message">{message}</p>
                <div className="modal-actions">
                    <button className="modal-btn modal-btn-cancel" onClick={onCancel}>
                        {cancelText || 'Cancel'}
                    </button>
                    <button
                        className={`modal-btn modal-btn-confirm ${variant === 'danger' ? 'danger' : ''}`}
                        onClick={onConfirm}
                    >
                        {confirmText || 'Confirm'}
                    </button>
                </div>
            </div>
        </div>
    );
}
