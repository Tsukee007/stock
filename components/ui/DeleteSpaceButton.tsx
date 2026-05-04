import React from 'react';

type DeleteSpaceButtonProps = {
  spaceId: string;
  onDelete: (spaceId: string) => void;
};

const DeleteSpaceButton = ({
  spaceId,
  onDelete,
}: DeleteSpaceButtonProps) => {
  const handleDelete = () => {
    onDelete(spaceId);
  };

  return (
    <button onClick={handleDelete}>
      Delete
    </button>
  );
};

export default DeleteSpaceButton;