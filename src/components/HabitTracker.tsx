import React, { useState, useEffect, useMemo } from 'react';
import { Calendar, Target, Moon, CheckSquare, Settings, ChevronLeft, ChevronRight, Smile } from 'lucide-react';
import { format, getDaysInMonth, startOfMonth, getDay, startOfWeek, addDays } from 'date-fns';
import CalendarGrid from './CalendarGrid';
import HabitGrid from './HabitGrid';
import MonthlyGoals from './MonthlyGoals';
import SleepMoodTracker from './SleepMoodTracker';
import HabitSettings from './HabitSettings';
import { useHabitData } from '../hooks/useHabitData';
import type { Habit } from '../types';

type ViewMode = 'month' | 'week';

const HabitTracker: React.FC = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<ViewMode>('month');
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(() => {
    const today = new Date();
    return startOfWeek(today, { weekStartsOn: 0 });
  });
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

  const displayDates = useMemo(() => {
    if (viewMode === 'month') {
      return Array.from({ length: daysInMonth }, (_, i) => {
        return new Date(currentYear, currentMonth, i + 1);
      });
    } else {
      return Array.from({ length: 7 }, (_, i) => {
        return addDays(currentWeekStart, i);
      });
    }
  }, [viewMode, currentDate, currentWeekStart, daysInMonth, currentYear, currentMonth]);

  const tabs = [
    { id: 'habits', label: 'Daily Habits', icon: CheckSquare },
    { id: 'moments', label: 'Memorable Moments', icon: Calendar },
    { id: 'goals', label: 'Monthly Goals', icon: Target },
    { id: 'sleepmood', label: 'Sleep & Mood', icon: Moon }
  ];

  const navigateMonth = (direction: 'prev' | 'next') => {
    const increment = direction === 'next' ? 1 : -1;

    if (viewMode === 'month') {
      const newDate = new Date(currentYear, currentMonth + increment);
      setCurrentDate(newDate);
    } else {
      const newWeekStart = new Date(currentWeekStart);
      newWeekStart.setDate(currentWeekStart.getDate() + (increment * 7));
      setCurrentWeekStart(newWeekStart);
    }
  };

  const updateMoment = (day: number, value: string) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].moment = value;
    updateData(newData);
  };

  const updateHabit = (day: number, habitId: string, value: boolean | number, date?: Date) => {
    const newData = { ...data };
    let targetMonthKey = monthKey;

    if (date) {
      const year = date.getFullYear();
      const month = date.getMonth();
      targetMonthKey = `${year}-${month}`;
    }

    if (!newData[targetMonthKey]) newData[targetMonthKey] = {};
    if (!newData[targetMonthKey][day]) newData[targetMonthKey][day] = {};
    if (!newData[targetMonthKey][day].habits) newData[targetMonthKey][day].habits = {};
    newData[targetMonthKey][day].habits[habitId] = value;
    updateData(newData);
  };

  const updateSleepQuality = (day: number, quality: number, hours?: number) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].sleepQuality = quality;
    if (hours !== undefined) {
      newData[monthKey][day].sleepHours = hours;
    }
    updateData(newData);
  };

  const updateMood = (day: number, value: number) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].mood = value;
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
            displayDates={displayDates}
            data={data}
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
      case 'sleepmood':
        return (
          <SleepMoodTracker
            currentDate={currentDate}
            daysInMonth={daysInMonth}
            getDayData={getDayData}
            updateSleepQuality={updateSleepQuality}
            updateMood={updateMood}
            viewMode={viewMode}
            currentWeekStart={currentWeekStart}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className={`min-h-screen bg-primary-bg dark:bg-slate-950 flex flex-col ${isMobile ? '' : 'p-6'}`} role="application" aria-label="Habit Tracker Application">
      <div className={`${isMobile ? 'flex-1 flex flex-col' : 'max-w-7xl mx-auto'}`}>
        {/* Header */}
        <header className={`bg-secondary-bg dark:bg-slate-900 shadow-sm border-b border-slate-200 dark:border-slate-800 ${isMobile ? 'sticky top-0 z-20 h-15 px-4' : 'rounded-2xl p-6 mb-6'}`} role="banner">
          {isMobile ? (
            <div className="flex items-center justify-between h-[60px]">
              <button
                onClick={() => navigateMonth('prev')}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                aria-label={`Go to previous ${viewMode}`}
              >
                <ChevronLeft className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>

              <div className="text-center flex-1">
                <h1 className="text-xl font-bold text-slate-800 dark:text-slate-200">
                  {viewMode === 'month'
                    ? format(currentDate, 'MMMM yyyy')
                    : `${format(currentWeekStart, 'MMM d')} - ${format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}`
                  }
                </h1>
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1 mt-1 inline-flex">
                  <button
                    onClick={() => {
                      setViewMode('month');
                      const midWeek = addDays(currentWeekStart, 3);
                      setCurrentDate(midWeek);
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => {
                      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
                      setCurrentWeekStart(weekStart);
                      setViewMode('week');
                    }}
                    className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                      viewMode === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Week
                  </button>
                </div>
              </div>

              <button
                onClick={() => navigateMonth('next')}
                className="w-10 h-10 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full flex items-center justify-center transition-colors"
                aria-label={`Go to next ${viewMode}`}
              >
                <ChevronRight className="w-5 h-5 text-slate-700 dark:text-slate-300" />
              </button>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Calendar className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
                <div>
                  <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200">
                    {viewMode === 'month'
                      ? format(currentDate, 'MMMM yyyy')
                      : `${format(currentWeekStart, 'MMM d')} - ${format(addDays(currentWeekStart, 6), 'MMM d, yyyy')}`
                    }
                  </h1>
                  <p className="text-slate-500 dark:text-slate-400">Track your daily habits and moments</p>
                </div>
              </div>

              <nav className="flex items-center gap-3" role="navigation" aria-label="Month navigation and settings">
                <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 rounded-lg p-1">
                  <button
                    onClick={() => {
                      setViewMode('month');
                      const midWeek = addDays(currentWeekStart, 3);
                      setCurrentDate(midWeek);
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'month' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Month
                  </button>
                  <button
                    onClick={() => {
                      const weekStart = startOfWeek(currentDate, { weekStartsOn: 0 });
                      setCurrentWeekStart(weekStart);
                      setViewMode('week');
                    }}
                    className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                      viewMode === 'week' ? 'bg-white dark:bg-slate-700 shadow-sm text-slate-800 dark:text-slate-200' : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    Week
                  </button>
                </div>
                <button
                  onClick={() => navigateMonth('prev')}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  aria-label={`Go to previous ${viewMode}`}
                >
                  ← {viewMode === 'month' ? 'Last Month' : 'Last Week'}
                </button>
                <button
                  onClick={() => navigateMonth('next')}
                  className="px-4 py-2 bg-indigo-600 dark:bg-indigo-500 text-white rounded-lg shadow-md hover:bg-indigo-700 dark:hover:bg-indigo-600 transition-colors"
                  aria-label={`Go to next ${viewMode}`}
                >
                  {viewMode === 'month' ? 'Next Month' : 'Next Week'} →
                </button>
                <button
                  onClick={() => setShowSettings(!showSettings)}
                  className={`p-2 rounded-lg transition-colors ${
                    showSettings
                      ? 'bg-active-tab-highlight-light dark:bg-emerald-900/30 text-active-tab-highlight dark:text-emerald-400'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <nav className="bg-secondary-bg dark:bg-slate-900 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-800 p-2 mb-6" role="navigation" aria-label="Dashboard sections">
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
                        ? 'bg-[#10d46e] text-white shadow-md'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
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
          <div className={`${isMobile ? 'fixed inset-0 z-50 bg-white dark:bg-slate-950' : ''}`}>
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
          <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 z-30 h-16 safe-area-pb" role="navigation" aria-label="Bottom navigation">
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
                        ? 'text-[#10d46e]'
                        : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'
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
                className="flex-1 flex flex-col items-center justify-center gap-1 text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
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