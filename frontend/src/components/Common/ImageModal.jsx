import React from 'react';
import { X, Trash2 } from 'lucide-react';

const ImageModal = ({ imageUrl, onClose, onDelete }) => {
  if (!imageUrl) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md">
      <div className="relative max-w-lg w-full max-h-[85vh] flex flex-col items-center">
        <div className="absolute -top-12 right-0 flex items-center space-x-3">
          {onDelete && (
            <button
              onClick={() => {
                onDelete(imageUrl);
                onClose();
              }}
              className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg text-red-400 hover:text-red-300 transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-2 bg-[#18181b] border border-[#27272a] rounded-lg text-[#a1a1aa] hover:text-[#f4f4f5] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <img
          src={imageUrl}
          alt="Journal Attachment"
          className="max-w-full max-h-[75vh] object-contain rounded-lg border border-[#27272a]"
        />
      </div>
    </div>
  );
};

export default ImageModal;
