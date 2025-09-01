import React, { useState } from 'react';
import { format, startOfMonth, getDay } from 'date-fns';
import { Edit3, Calendar } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateMoment: (day: number, value: string) => void;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  daysInMonth,
  getDayData,
  updateMoment
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingMoment, setEditingMoment] = useState('');

  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = getDay(firstDayOfMonth);
  
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() && 
                         today.getFullYear() === currentDate.getFullYear();
  const todayDate = isCurrentMonth ? today.getDate() : null;

  const handleDayClick = (day: number) => {
    setSelectedDay(day);
    setEditingMoment(getDayData(day).moment || '');
  };

  const handleSaveMoment = () => {
    if (selectedDay) {
      updateMoment(selectedDay, editingMoment);
      setSelectedDay(null);
      setEditingMoment('');
    }
  };

  const handleCancelEdit = () => {
    setSelectedDay(null);
    setEditingMoment('');
  };

  return (
    <section className="bg-secondary-bg rounded-2xl shadow-sm border border-slate-200 p-6" aria-labelledby="calendar-heading">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-600" />
        <h2 id="calendar-heading" className="text-xl font-semibold text-slate-800">Memorable Moments</h2>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-2 mb-4" role="row">
        {weekDays.map(day => (
          <div key={day} className="text-center text-sm font-medium text-slate-500 py-2" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6" role="grid" aria-label="Calendar days for memorable moments">
        {/* Empty cells for days before month starts */}
        {Array.from({ length: startingDayOfWeek }, (_, i) => (
          <div key={`empty-${i}`} className="h-12" role="gridcell" aria-hidden="true"></div>
        ))}
        
        {/* Days of the month */}
        {Array.from({ length: daysInMonth }, (_, i) => {
          const day = i + 1;
          const dayData = getDayData(day);
          const hasMoment = dayData.moment && dayData.moment.trim().length > 0;
          const isToday = day === todayDate;
          
          return (
            <button
              key={day}
              role="gridcell"
              onClick={() => handleDayClick(day)}
              className={`
                h-12 rounded-lg border-2 transition-all duration-200 relative group
                ${isToday 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700 font-semibold' 
                  : hasMoment
                    ? 'border-emerald-200 bg-emerald-50 text-emerald-700 hover:border-emerald-300'
                    : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }
              `}
              aria-label={`${isToday ? 'Today, ' : ''}Day ${day}${hasMoment ? ', has memorable moment' : ', no memorable moment'}`}
              aria-describedby={hasMoment ? `moment-${day}` : undefined}
            >
              <span className="text-sm">{day}</span>
              {hasMoment && (
                <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                  <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                </div>
              )}
              <Edit3 className="w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity" />
            </button>
          );
        })}
      </div>

      {/* Recent Moments */}
      <section className="space-y-2" aria-labelledby="recent-moments-heading">
        <h3 id="recent-moments-heading" className="text-sm font-medium text-slate-600 mb-3">Recent Moments</h3>
        <div className="max-h-32 overflow-y-auto space-y-2" role="log" aria-live="polite" aria-label="Recent memorable moments">
          {Array.from({ length: daysInMonth }, (_, i) => i + 1)
            .reverse()
            .filter(day => getDayData(day).moment)
            .slice(0, 5)
            .map(day => (
              <div key={day} className="flex items-start gap-3 p-2 bg-slate-50 rounded-lg">
                <span className="text-xs font-medium text-slate-500 mt-0.5 min-w-[20px]">
                  {day}
                </span>
                <p id={`moment-${day}`} className="text-sm text-slate-700 flex-1 leading-relaxed">
                  {getDayData(day).moment}
                </p>
              </div>
            ))}
        </div>
      </section>

      {/* Edit Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-moment-title">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 id="edit-moment-title" className="text-lg font-semibold text-slate-800 mb-4">
              {format(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay), 'EEEE, MMMM d')}
            </h3>
            <textarea
              value={editingMoment}
              onChange={(e) => setEditingMoment(e.target.value)}
              placeholder="What made this day memorable?"
              className="w-full h-32 p-3 border border-slate-300 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={200}
              aria-label="Memorable moment for selected day"
              aria-describedby="character-count"
            />
            <div className="flex justify-between items-center mt-4">
              <span id="character-count" className="text-xs text-slate-500" aria-live="polite">
                {editingMoment.length}/200 characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-slate-600 hover:text-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMoment}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
                >
                  Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};

export default CalendarGrid;