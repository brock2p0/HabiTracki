import React, { useState, useEffect } from 'react';
import { Calendar, Target, Moon, CheckSquare, Settings } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import HabitGrid from './HabitGrid';
import MonthlyGoals from './MonthlyGoals';
import SleepTracker from './SleepTracker';
import HabitSettings from './HabitSettings';
import { useHabitData } from '../hooks/useHabitData';
import type { Habit } from '../types';

const HabitTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('habits');
  const [showSettings, setShowSettings] = useState(false);
  const { data, habits, updateData, updateHabits } = useHabitData();

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthKey = `${currentYear}-${currentMonth}`;
  const daysInMonth = getDaysInMonth(currentDate);

  const tabs = [
    { id: 'habits', label: 'Daily Habits', icon: CheckSquare },
    { id: 'moments', label: 'Memorable Moments', icon: Calendar },
    { id: 'goals', label: 'Monthly Goals', icon: Target },
    { id: 'sleep', label: 'Sleep Tracking', icon: Moon }
  ];
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

  const renderActiveContent = () => {
    switch (activeTab) {
      case 'habits':
        return (
          <HabitGrid
            habits={habits}
           currentDate={currentDate}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateHabit={updateHabit}
          />
        );
      case 'moments':
        return (
          <CalendarGrid
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateMoment={updateMoment}
          />
        );
      case 'goals':
        return (
          <MonthlyGoals
            goals={getGoals()}
            onUpdateGoals={updateGoals}
          />
        );
      case 'sleep':
        return (
          <SleepTracker
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateSleep={updateSleep}
          />
        );
      default:
        return null;
    }
  };
  return (
    <div className="min-h-screen bg-primary-bg" role="application" aria-label="Habit Tracker Application">
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <header className="bg-secondary-bg rounded-2xl shadow-sm border border-slate-200 p-6 mb-6" role="banner">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Calendar className="w-8 h-8 text-indigo-600" />
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
                    ? 'bg-active-tab-highlight-light text-active-tab-highlight' 
                    : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                }`}
               aria-label={showSettings ? "Close habit settings" : "Open habit settings"}
               aria-expanded={showSettings}
              >
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5" />
                  <span className="text-sm font-medium">Settings</span>
                </div>
              </button>
            </nav>
          </div>
        </header>

        {/* Tab Navigation */}
        <nav className="bg-secondary-bg rounded-2xl shadow-sm border border-slate-200 p-2 mb-6" role="navigation" aria-label="Dashboard sections">
          <div className="flex gap-1">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center gap-2 px-4 py-3 rounded-xl transition-all duration-200 flex-1 justify-center
                    ${isActive 
                      ? 'bg-active-tab-highlight text-white shadow-md' 
                      : 'text-slate-600 hover:text-slate-800 hover:bg-slate-100'
                    }
                  `}
                  aria-pressed={isActive}
                  aria-label={`Switch to ${tab.label} section`}
                >
                  <Icon className="w-4 h-4" />
                  <span className="font-medium">{tab.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
        {/* Settings Panel */}
        {showSettings && (
          <HabitSettings
            habits={habits}
            onUpdateHabits={updateHabits}
            data={data}
            onUpdateData={updateData}
            onClose={() => setShowSettings(false)}
          />
        )}

        {/* Main Content */}
        <main role="main" aria-label={`${tabs.find(tab => tab.id === activeTab)?.label} section`}>
          <div className="w-full">
            {renderActiveContent()}
          </div>
        </main>
      </div>
    </div>
  );
};

export default HabitTracker;