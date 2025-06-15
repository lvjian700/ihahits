import React, { useState, useEffect } from 'react';
import type { Habit } from './types/Habit';
import { getLocalDateString } from './utils/date';
import HabitsDndGrid from './components/HabitsDndGrid';
import useLocalStorage from './hooks/useLocalStorage';
import SetupModal from './components/SetupModal';
import HabitDetailsView from './components/HabitDetailsView';
import Modal from './components/Modal';
import DevMenu from './components/DevMenu';
import { useVisibilityRefresh } from './hooks/useDateRefresh';

// Predefined habit suggestions for onboarding (single-emoji icons)
const SUGGESTIONS = [
  { name: 'Fitness', icon: '🏋️' },
  { name: 'Running', icon: '🏃' },
  { name: 'Meditation', icon: '🧘' },
  { name: 'Writing', icon: '✍️' },
  { name: 'Wind Down for Sleep', icon: '🌙' },
  { name: 'Reading', icon: '📖' },
  { name: 'No Sugar', icon: '🍭' },
  { name: 'No Smoking', icon: '🚭' }
];

const App: React.FC = () => {
  const [habits, setHabits] = useLocalStorage<Habit[]>('habitTrackerData', []);
  // Split habits into active and archived
  const activeHabits = habits.filter(h => !h.archived);
  const archivedHabits = habits.filter(h => h.archived);
  const [selectedHabitId, setSelectedHabitId] = useState<number | null>(null);
  
  // Use the visibility refresh hook to handle date changes when tab becomes active
  useVisibilityRefresh();

  const saveHabits = (newHabits: Omit<Habit, 'logs'>[]) => {
    const formatted = newHabits.map(h => ({ ...h, logs: {} }));
    setHabits(formatted);
  };

  const updateHabit = (habitId: number, updates: Partial<Habit>) => {
    setHabits(prevHabits =>
      prevHabits.map(habit =>
        habit.id === habitId ? { ...habit, ...updates } : habit
      )
    );
  };

  const toggleLog = (habitId: number, dateStr: string) => {
    setHabits(prev =>
      prev.map(h => {
        if (h.id === habitId) {
          if (h.archived) return h; // prevent toggling archived habits
          const updatedLogs = { ...h.logs, [dateStr]: !h.logs[dateStr] };
          return { ...h, logs: updatedLogs };
        }
        return h;
      })
    );
  };
  


  return (
    <>
      <div className="min-h-screen p-4">
      <h1 className="text-title-lg mb-6 text-color-title text-center">2-Minute Habits</h1>
      {habits.length === 0 && (
        <SetupModal
          suggestions={SUGGESTIONS}
          maxSelectable={5}
          defaultRandomCount={3}
          onSave={saveHabits}
        />
      )}
      {habits.length > 0 && (
        <div className="relative max-w-4xl mx-auto">
          {/* Grid view of habits */}
          <HabitsDndGrid
            habits={activeHabits}
            onReorder={newActive => {
              // Maintain order only within active habits
              const newOrderIds = newActive.map(h => h.id);
              const reordered = [...habits].sort((a,b)=>{
                const ai = newOrderIds.indexOf(a.id);
                const bi = newOrderIds.indexOf(b.id);
                if(ai===-1) return 1; // archived stay at bottom
                if(bi===-1) return -1;
                return ai - bi;
              });
              setHabits(reordered);
            }}
            onToggle={(habitId) =>
              toggleLog(
                habitId,
                getLocalDateString()
              )
            }
            onSelect={setSelectedHabitId}
          />
          
          {/* Modal with habit details */}
          <Modal 
            isOpen={selectedHabitId !== null} 
            onClose={() => setSelectedHabitId(null)}
            aria-label="Habit details"
          >
            {selectedHabitId !== null && (
              <HabitDetailsView
                habit={habits.find(h => h.id === selectedHabitId)!}
                onToggle={date =>
                  toggleLog(selectedHabitId, date)
                }
                onClose={() => setSelectedHabitId(null)}
                onEditHabit={updateHabit}
              />
            )}
          </Modal>
        </div>
      )}
      {archivedHabits.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-4">Archived Habits</h2>
          <div className="space-y-3">
            {archivedHabits.map(h => {
              const completedDays = h.logs ? Object.values(h.logs).filter(Boolean).length : 0;
              return (
                <div key={h.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-4">
                    <span className="text-3xl">{h.icon}</span>
                    <div>
                      <p className="font-medium text-gray-800">{h.name}</p>
                      <p className="text-sm text-gray-600">Completed Days: {completedDays}</p>
                    </div>
                  </div>
                  <button className="px-3 py-1.5 rounded-md bg-gray-100 text-gray-500 cursor-not-allowed" disabled>
                    Resume
                  </button>
                </div>
              );
            })}
          </div>
        </div>
      )}
      </div>
      {/* Developer menu */}
      <DevMenu 
        habits={habits} 
        setHabits={setHabits} 
        setSelectedHabitId={setSelectedHabitId} 
      />
    </>
  );
};

export default App;