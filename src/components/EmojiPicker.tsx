import React from 'react';
import data from '@emoji-mart/data';
import Picker from '@emoji-mart/react';
import styles from '../styles/Admin.module.css';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
  onClose?: () => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onSelect, onClose }) => {
  const handleSelect = (emoji: any) => {
    onSelect(emoji.native);
    if (onClose) {
      onClose();
    }
  };

  return (
    <div className={styles.emojiPickerContainer}>
      <Picker
        data={data}
        onEmojiSelect={handleSelect}
        theme="dark"
        previewPosition="none"
        skinTonePosition="none"
      />
    </div>
  );
};

export default EmojiPicker; 