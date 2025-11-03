import React, { useState } from 'react';
import { format, startOfMonth, getDay } from 'date-fns';
import { Edit3, Calendar } from 'lucide-react';

interface CalendarGridProps {
  currentDate: Date;
  daysInMonth: number;
  getDayData: (day: number) => any;
  updateMoment: (day: number, value: string) => void;
  viewMode?: 'month' | 'week';
  currentWeekStart?: Date;
}

const CalendarGrid: React.FC<CalendarGridProps> = ({
  currentDate,
  daysInMonth,
  getDayData,
  updateMoment,
  viewMode = 'month',
  currentWeekStart
}) => {
  const [selectedDay, setSelectedDay] = useState<number | null>(null);
  const [editingMoment, setEditingMoment] = useState('');

  const firstDayOfMonth = startOfMonth(currentDate);
  const startingDayOfWeek = getDay(firstDayOfMonth);

  const weekDayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const today = new Date();
  const isCurrentMonth = today.getMonth() === currentDate.getMonth() &&
                         today.getFullYear() === currentDate.getFullYear();
  const todayDate = isCurrentMonth ? today.getDate() : null;

  // Calculate days to display based on view mode
  const getDaysToDisplay = () => {
    if (viewMode === 'week' && currentWeekStart) {
      const days = [];
      for (let i = 0; i < 7; i++) {
        const date = new Date(currentWeekStart);
        date.setDate(currentWeekStart.getDate() + i);
        days.push({
          date,
          day: date.getDate(),
          month: date.getMonth(),
          year: date.getFullYear()
        });
      }
      return days;
    }
    return null; // Use normal month rendering
  };

  const weekDays = getDaysToDisplay();

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
    <section className="bg-secondary-bg dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-6" aria-labelledby="calendar-heading">
      <div className="flex items-center gap-2 mb-6">
        <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
        <h2 id="calendar-heading" className="text-xl font-semibold text-slate-800 dark:text-slate-200">Memorable Moments</h2>
      </div>

      {/* Calendar Header */}
      <div className="grid grid-cols-7 gap-2 mb-4" role="row">
        {weekDayLabels.map(day => (
          <div key={day} className="text-center text-sm font-medium text-slate-500 dark:text-slate-400 py-2" role="columnheader">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 mb-6" role="grid" aria-label="Calendar days for memorable moments">
        {viewMode === 'month' ? (
          <>
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
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : hasMoment
                        ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'
                    }
                  `}
                  aria-label={`${isToday ? 'Today, ' : ''}Day ${day}${hasMoment ? ', has memorable moment' : ', no memorable moment'}`}
                  aria-describedby={hasMoment ? `moment-${day}` : undefined}
                >
                  <span className="text-sm">{day}</span>
                  {hasMoment && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                      <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                    </div>
                  )}
                  <Edit3 className="w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity" />
                </button>
              );
            })}
          </>
        ) : (
          /* Week view - show only 7 days */
          weekDays?.map((dayInfo) => {
            const day = dayInfo.day;
            const dayData = getDayData(day);
            const hasMoment = dayData.moment && dayData.moment.trim().length > 0;
            const isToday = dayInfo.date.toDateString() === today.toDateString();
            const isCurrentMonthDay = dayInfo.month === currentDate.getMonth();

            return (
              <button
                key={dayInfo.date.toISOString()}
                role="gridcell"
                onClick={() => handleDayClick(day)}
                className={`
                  h-12 rounded-lg border-2 transition-all duration-200 relative group
                  ${!isCurrentMonthDay
                    ? 'opacity-40 border-slate-100 dark:border-slate-800 text-slate-400 dark:text-slate-600'
                    : isToday
                      ? 'border-indigo-500 dark:border-indigo-400 bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 font-semibold'
                      : hasMoment
                        ? 'border-emerald-200 dark:border-emerald-700 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 hover:border-emerald-300 dark:hover:border-emerald-600'
                        : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-800 dark:text-slate-300'
                  }
                `}
                aria-label={`${isToday ? 'Today, ' : ''}${format(dayInfo.date, 'EEE')} ${day}${hasMoment ? ', has memorable moment' : ', no memorable moment'}`}
                aria-describedby={hasMoment ? `moment-${day}` : undefined}
              >
                <span className="text-sm">{day}</span>
                {hasMoment && isCurrentMonthDay && (
                  <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2">
                    <div className="w-1.5 h-1.5 bg-emerald-500 dark:bg-emerald-400 rounded-full"></div>
                  </div>
                )}
                <Edit3 className="w-3 h-3 absolute top-1 right-1 opacity-0 group-hover:opacity-50 transition-opacity" />
              </button>
            );
          })
        )}
      </div>

      {/* Recent Moments */}
      <section className="space-y-2" aria-labelledby="recent-moments-heading">
        <h3 id="recent-moments-heading" className="text-sm font-medium text-slate-600 dark:text-slate-400 mb-3">Recent Moments</h3>
        <div className="max-h-32 overflow-y-auto space-y-2" role="log" aria-live="polite" aria-label="Recent memorable moments">
          {(() => {
            let daysToShow: number[] = [];

            if (viewMode === 'week' && weekDays) {
              // In week view, show moments from the current week only
              daysToShow = weekDays
                .filter(dayInfo => dayInfo.month === currentDate.getMonth())
                .map(dayInfo => dayInfo.day)
                .reverse();
            } else {
              // In month view, show all days of the month
              daysToShow = Array.from({ length: daysInMonth }, (_, i) => i + 1).reverse();
            }

            return daysToShow
              .filter(day => getDayData(day).moment)
              .slice(0, 5)
              .map(day => (
                <div key={day} className="flex items-start gap-3 p-2 bg-slate-50 dark:bg-slate-800 rounded-lg">
                  <span className="text-xs font-medium text-slate-500 dark:text-slate-400 mt-0.5 min-w-[20px]">
                    {day}
                  </span>
                  <p id={`moment-${day}`} className="text-sm text-slate-700 dark:text-slate-300 flex-1 leading-relaxed">
                    {getDayData(day).moment}
                  </p>
                </div>
              ));
          })()}
        </div>
      </section>

      {/* Edit Modal */}
      {selectedDay && (
        <div className="fixed inset-0 bg-black bg-opacity-50 dark:bg-opacity-70 flex items-center justify-center z-50 p-4" role="dialog" aria-modal="true" aria-labelledby="edit-moment-title">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-xl max-w-md w-full p-6">
            <h3 id="edit-moment-title" className="text-lg font-semibold text-slate-800 dark:text-slate-200 mb-4">
              {format(new Date(currentDate.getFullYear(), currentDate.getMonth(), selectedDay), 'EEEE, MMMM d')}
            </h3>
            <textarea
              value={editingMoment}
              onChange={(e) => setEditingMoment(e.target.value)}
              placeholder="What made this day memorable?"
              className="w-full h-32 p-3 border border-slate-300 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-500 rounded-lg resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
              maxLength={200}
              aria-label="Memorable moment for selected day"
              aria-describedby="character-count"
            />
            <div className="flex justify-between items-center mt-4">
              <span id="character-count" className="text-xs text-slate-500 dark:text-slate-400" aria-live="polite">
                {editingMoment.length}/200 characters
              </span>
              <div className="flex gap-2">
                <button
                  onClick={handleCancelEdit}
                  className="px-4 py-2 text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveMoment}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
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