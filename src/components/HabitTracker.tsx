import React, { useState } from 'react';
import { Calendar, Settings } from 'lucide-react';
import { format, getDaysInMonth } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import HabitGrid from './HabitGrid';
import MonthlyGoals from './MonthlyGoals';
import SleepTracker from './SleepTracker';
import HabitSettings from './HabitSettings';
import { useHabitData } from '../hooks/useHabitData';

const HabitTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [showSettings, setShowSettings] = useState(false);
  const { data, habits, updateData, updateHabits } = useHabitData();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthKey = `${currentYear}-${currentMonth}`;
  const daysInMonth = getDaysInMonth(currentDate);

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentYear, currentMonth + (direction === 'next' ? 1 : -1));
    setCurrentDate(newDate);
  };

  const updateMoment = (day: number, value: string) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].moment = value;
    updateData(newData);
  };

  const updateHabit = (day: number, habitIndex: number, value: boolean | number) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    if (!newData[monthKey][day].habits) newData[monthKey][day].habits = {};
    newData[monthKey][day].habits[habitIndex] = value;
    updateData(newData);
  };

  const updateSleep = (day: number, value: number) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].sleep = value;
    updateData(newData);
  };

  const updateGoals = (goals: string[]) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    newData[monthKey].goals = goals;
    updateData(newData);
  };

  const getDayData = (day: number) => {
    return data[monthKey]?.[day] || {};
  };

  const getGoals = () => {
    return data[monthKey]?.goals || ['', '', ''];
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50" role="application" aria-label="Habit Tracker Application">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6 mb-6" role="banner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" aria-hidden="true" />
              <div>
                <h1 className="text-3xl font-bold text-slate-800">
                  {format(currentDate, 'MMMM yyyy')}
                </h1>
                <p className="text-slate-500">Track your daily habits and moments</p>
              </div>
            </div>
            
            <nav className="flex items-center gap-3" role="navigation" aria-label="Month navigation and settings">
              <button
                onClick={() => navigateMonth('prev')}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Go to previous month"
              >
                ← Previous
              </button>
              <button
                onClick={() => navigateMonth('next')}
                className="px-4 py-2 text-slate-600 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors"
                aria-label="Go to next month"
              >
                Next →
              </button>
              <button
                onClick={() => setShowSettings(!showSettings)}
                className={`p-2 rounded-lg transition-colors ${
                  showSettings 
                    ? 'bg-indigo-100 text-indigo-700' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
                aria-label={showSettings ? "Close habit settings" : "Open habit settings"}
                aria-expanded={showSettings}
              >
                <Settings className="w-5 h-5" />
              </button>
            </nav>
          </div>
        </header>

        {/* Settings Panel */}
        {showSettings && (
          <HabitSettings
            habits={habits}
            onUpdateHabits={updateHabits}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Main Content Grid */}
        <main className="grid lg:grid-cols-2 gap-6 mb-6" role="main">
          {/* Left Panel - Memorable Moments */}
          <CalendarGrid
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateMoment={updateMoment}
          />

          {/* Right Panel - Habit Tracking */}
          <HabitGrid
            habits={habits}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateHabit={updateHabit}
          />
        </main>

        {/* Bottom Section */}
        <aside className="grid lg:grid-cols-2 gap-6" role="complementary" aria-label="Goals and sleep tracking">
          {/* Monthly Goals */}
          <MonthlyGoals
            goals={getGoals()}
            onUpdateGoals={updateGoals}
          />

          {/* Sleep Tracker */}
          <SleepTracker
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateSleep={updateSleep}
          />
        </aside>
      </div>
    </div>
  );
};

export default HabitTracker;