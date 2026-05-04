// Dans DeleteSpaceButton.tsx
import React from 'react';

const DeleteSpaceButton = ({ spaceId, onDelete }) => {
  const handleDelete = () => {
    onDelete(spaceId);
  };

  return (
    <button onClick={handleDelete}>
      Supprimer
    </button>
  );
};

export default DeleteSpaceButton;