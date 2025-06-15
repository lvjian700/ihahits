import React, { useState, useRef, useEffect } from 'react';
import ReactDOM from 'react-dom';
import type { Habit } from '../types/Habit';
import { MoreHorizontal, X } from 'lucide-react';
import CalendarView from './CalendarView';
import Picker from '@emoji-mart/react';
import data from '@emoji-mart/data';
import EditableText from './EditableText';

interface HabitDetailsViewProps {
  habit: Habit;
  onToggle: (date: string) => void;
  onClose: () => void;
  onEditHabit?: (habitId: number, updates: Partial<Habit>) => void;
}

// Dropdown Menu Component
const DropdownMenu: React.FC<{
  buttonRef: React.RefObject<HTMLButtonElement>;
  isOpen: boolean;
  onClose: () => void;
  onCloseModal: () => void;
  onArchive: () => void;
}> = ({ buttonRef, isOpen, onClose, onCloseModal, onArchive }) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [isVisible, setIsVisible] = useState(false);
  
  // Calculate position when menu opens
  useEffect(() => {
    if (isOpen && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setPosition({
        top: rect.bottom + window.scrollY,
        left: rect.left + window.scrollX
      });
      // Only show menu after position is calculated
      setTimeout(() => setIsVisible(true), 0);
    } else {
      setIsVisible(false);
    }
  }, [isOpen, buttonRef]);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node) && 
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose, buttonRef]);
  
  if (!isOpen) return null;
  
  return ReactDOM.createPortal(
    <div 
      ref={menuRef}
      className="fixed py-1 w-40 bg-white rounded-md shadow-lg z-50 border border-gray-200 transition-opacity duration-150"
      style={{ 
        top: `${position.top}px`, 
        left: `${position.left}px`,
        opacity: isVisible ? 1 : 0,
        pointerEvents: isVisible ? 'auto' : 'none'
      }}
    >
      <button 
        className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
        onClick={() => {
          onClose();
          onArchive();
        }}
      >
        Archive
      </button>
      <button 
        className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
        onClick={() => {
          onClose();
          onCloseModal();
        }}
      >
        <X size={16} className="mr-2" />
        Close
      </button>
    </div>,
    document.body
  );
};

const HabitDetailsView: React.FC<HabitDetailsViewProps> = ({ habit, onToggle, onClose, onEditHabit }) => {
  const handleArchive = () => {
    if (window.confirm('Archive this habit? You can resume it later from the archived list.')) {
      if (onEditHabit) {
        onEditHabit(habit.id, { archived: true });
      }
      onClose();
    }
  };
  
  const [menuOpen, setMenuOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [editingIcon, setEditingIcon] = useState(false);
  const [habitIcon, setHabitIcon] = useState(habit.icon || '🏆');

  // Refs and state for emoji picker popover
  const emojiIconRef = useRef<HTMLDivElement>(null);
  const emojiPickerRef = useRef<HTMLDivElement>(null);
  const [emojiPickerPosition, setEmojiPickerPosition] = useState({ top: 0, left: 0 });
  const [emojiPickerVisible, setEmojiPickerVisible] = useState(false);

  // Compute completed days from logs
  const completedDays = habit.logs ? Object.values(habit.logs).filter(Boolean).length : 0;
  const emoji = habitIcon;

  const handleSelectEmoji = (emojiData: any) => {
    setHabitIcon(emojiData.native);
    setEditingIcon(false);
    if (onEditHabit) onEditHabit(habit.id, { icon: emojiData.native });
  };

  // Effect for positioning the emoji picker
  useEffect(() => {
    if (editingIcon && emojiIconRef.current) {
      const rect = emojiIconRef.current.getBoundingClientRect();
      setEmojiPickerPosition({
        top: rect.bottom + window.scrollY + 8, // 8px spacing below the icon
        left: rect.left + window.scrollX,
      });
      setTimeout(() => setEmojiPickerVisible(true), 0); // For smooth opacity transition
    } else {
      setEmojiPickerVisible(false);
    }
  }, [editingIcon]);

  // Effect for handling click outside the emoji picker
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        emojiPickerRef.current &&
        !emojiPickerRef.current.contains(event.target as Node) &&
        emojiIconRef.current &&
        !emojiIconRef.current.contains(event.target as Node)
      ) {
        setEditingIcon(false);
      }
    };

    if (editingIcon && emojiPickerVisible) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingIcon, emojiPickerVisible]);

  return (
    <div className="p-6">
      {/* Header with habit info and close button */}
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center">
          <div ref={emojiIconRef} className="text-5xl mr-4 cursor-pointer" onClick={() => setEditingIcon(prev => !prev)}>{emoji}</div>
          <div>
            <EditableText
              initialValue={habit.name}
              onSave={(newName) => {
                if (onEditHabit) {
                  onEditHabit(habit.id, { name: newName });
                }
              }}
              textElement="h2"
              textClassName="text-2xl font-bold text-gray-800 cursor-pointer"
              inputClassName="text-2xl font-bold border rounded px-2 py-1 mr-2 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              ariaLabel={`habit name ${habit.name}`}
            />
            <p className="text-gray-600">Completed {completedDays} {completedDays === 1 ? 'day' : 'days'}</p>
          </div>
        </div>
        <div>
          <button 
            ref={buttonRef}
            onClick={() => setMenuOpen(!menuOpen)}
            className="p-1.5 rounded-md hover:bg-gray-100 transition-colors"
            aria-label="Menu"
          >
            <MoreHorizontal size={20} className="text-gray-500" />
          </button>
          <DropdownMenu 
            buttonRef={buttonRef}
            isOpen={menuOpen}
            onClose={() => setMenuOpen(false)}
            onCloseModal={onClose}
            onArchive={handleArchive}
          />
        </div>
      </div>

      {/* Emoji Mart Picker Popover */}
      {editingIcon && ReactDOM.createPortal(
        <div
          ref={emojiPickerRef}
          className="fixed bg-white rounded-lg shadow-xl z-50 border border-gray-200 transition-opacity duration-150"
          style={{
            top: `${emojiPickerPosition.top}px`,
            left: `${emojiPickerPosition.left}px`,
            opacity: emojiPickerVisible ? 1 : 0,
            pointerEvents: emojiPickerVisible ? 'auto' : 'none',
          }}
        >
          <Picker 
            data={data} 
            onEmojiSelect={handleSelectEmoji} 
            theme="light"
          />
        </div>,
        document.body
      )}

      {/* Calendar Component */}
      <CalendarView 
        habit={habit}
        onToggle={onToggle}
      />
    </div>
  );
};

export default HabitDetailsView;
