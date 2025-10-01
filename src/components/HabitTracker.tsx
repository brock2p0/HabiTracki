import React, { useState, useEffect } from 'react';
import { Calendar, Target, Moon, CheckSquare, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
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
  const [isMobile, setIsMobile] = useState(false);
  const { data, habits, updateData, updateHabits } = useHabitData();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

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

  const updateHabit = (day: number, habitId: string, value: boolean | number) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    if (!newData[monthKey][day].habits) newData[monthKey][day].habits = {};
    newData[monthKey][day].habits[habitId] = value;
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

  const updateGoalsCompletion = (goals: string[], completion: boolean[]) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    newData[monthKey].goals = goals;
    newData[monthKey].goalsCompletion = completion;
    updateData(newData);
  };

  const getDayData = (day: number) => {
    return data[monthKey]?.[day] || {};
  };

  const getGoals = () => {
    return {
      goals: data[monthKey]?.goals || ['', '', ''],
      completion: data[monthKey]?.goalsCompletion || [false, false, false]
    };
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
            isMobile={isMobile}
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
        const goalsData = getGoals();
        return (
          <MonthlyGoals
            goals={goalsData.goals}
            completedGoals={goalsData.completion}
            onUpdateGoals={updateGoalsCompletion}
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
    <div className={`min-h-screen bg-primary-bg flex flex-col ${isMobile ? '' : 'p-6'}`} role="application" aria-label="Habit Tracker Application">
      <div className={`${isMobile ? 'flex-1 flex flex-col' : 'max-w-7xl mx-auto'}`}>
        {/* Header */}
        <header className={`bg-secondary-bg shadow-sm border-b border-slate-200 ${isMobile ? 'sticky top-0 z-20 h-15 px-4' : 'rounded-2xl p-6 mb-6'}`} role="banner">
          {isMobile ? (
            <div className="flex items-center justify-between h-[60px]">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                aria-label="Go to previous month"
              >
                <ChevronLeft className="w-5 h-5 text-slate-700" />
              </button>
              
              <div className="text-center">
                <h1 className="text-xl font-bold text-slate-800">
                  {format(currentDate, 'MMMM yyyy')}
                </h1>
              </div>
              
              <button
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 bg-slate-100 hover:bg-slate-200 rounded-full flex items-center justify-center transition-colors"
                aria-label="Go to next month"
              >
                <ChevronRight className="w-5 h-5 text-slate-700" />
              </button>
            </div>
          ) : (
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
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                  aria-label="Go to previous month"
                >
                  ← Last Month
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg shadow-md hover:bg-indigo-700 transition-colors"
                  aria-label="Go to next month"
                >
                  Next Month →
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
          )}
        </header>

        {/* Tab Navigation */}
        {!isMobile && (
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
        )}

        {/* Settings Panel */}
        {showSettings && (
          <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white' : ''}`}>
            <HabitSettings
              habits={habits}
              onUpdateHabits={updateHabits}
              data={data}
              onUpdateData={updateData}
              onClose={() => setShowSettings(false)}
              isMobile={isMobile}
            />
          </div>
        )}

        {/* Main Content */}
        <main className={`${isMobile ? 'flex-1 overflow-y-auto pb-16' : ''}`} role="main" aria-label={`${tabs.find(tab => tab.id === activeTab)?.label} section`}>
          <div className={`w-full ${isMobile ? 'px-2' : ''}`}>
            {renderActiveContent()}
          </div>
        </main>

        {/* Bottom Navigation (Mobile Only) */}
        {isMobile && (
          <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 z-30 h-16 safe-area-pb" role="navigation" aria-label="Bottom navigation">
            <div className="flex h-full">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 flex flex-col items-center justify-center gap-1 transition-colors ${
                      isActive 
                        ? 'text-active-tab-highlight' 
                        : 'text-slate-500 hover:text-slate-700'
                    }`}
                    aria-pressed={isActive}
                    aria-label={`Switch to ${tab.label} section`}
                  >
                    <Icon className="w-5 h-5" />
                    <span className="text-xs font-medium">{tab.label.split(' ')[0]}</span>
                  </button>
                );
              })}
              <button
                onClick={() => setShowSettings(true)}
                className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 hover:text-slate-700 transition-colors"
                aria-label="Open settings"
              >
                <Settings className="w-5 h-5" />
                <span className="text-xs font-medium">Settings</span>
              </button>
            </div>
          </nav>
        )}
      </div>
    </div>
  );
};

export default HabitTracker;