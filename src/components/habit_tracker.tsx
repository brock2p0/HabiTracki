import React, { useState, useEffect } from 'react';

const HabitTracker = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [data, setData] = useState({});
  const [habits, setHabits] = useState([
    { name: 'WEIGHT', type: 'number', color: 'black' },
    { name: 'COLD SHOWER', type: 'check', color: 'blue' },
    { name: 'EXERCISE', type: 'check', color: 'blue' },
    { name: 'JOURNAL', type: 'check', color: 'blue' },
    { name: 'ALONE TIME', type: 'check', color: 'blue' },
    { name: 'SOC MEDIA WAKE', type: 'check', color: 'red' },
    { name: 'SAUNA', type: 'check', color: 'blue' }
  ]);
  const [showSettings, setShowSettings] = useState(false);

  const currentMonth = currentDate.getMonth();
  const currentYear = currentDate.getFullYear();
  const monthName = currentDate.toLocaleString('default', { month: 'long' }).toUpperCase();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const monthKey = `${currentYear}-${currentMonth}`;

  useEffect(() => {
    const saved = localStorage.getItem('habitData');
    const savedHabits = localStorage.getItem('habits');
    if (saved) {
      setData(JSON.parse(saved));
    }
    if (savedHabits) {
      setHabits(JSON.parse(savedHabits));
    }
  }, []);

  const saveData = (newData) => {
    setData(newData);
    localStorage.setItem('habitData', JSON.stringify(newData));
  };

  const saveHabits = (newHabits) => {
    setHabits(newHabits);
    localStorage.setItem('habits', JSON.stringify(newHabits));
  };

  const addHabit = () => {
    const newHabits = [...habits, { name: 'NEW HABIT', type: 'check', color: 'blue' }];
    saveHabits(newHabits);
  };

  const updateHabitSettings = (index, field, value) => {
    const newHabits = [...habits];
    newHabits[index][field] = value;
    saveHabits(newHabits);
  };

  const deleteHabit = (index) => {
    const newHabits = habits.filter((_, i) => i !== index);
    saveHabits(newHabits);
  };

  const updateMoment = (day, value) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].moment = value;
    saveData(newData);
  };

  const updateHabit = (day, habitIndex, value) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    if (!newData[monthKey][day].habits) newData[monthKey][day].habits = {};
    newData[monthKey][day].habits[habitIndex] = value;
    saveData(newData);
  };

  const updateSleep = (day, value) => {
    const newData = { ...data };
    if (!newData[monthKey]) newData[monthKey] = {};
    if (!newData[monthKey][day]) newData[monthKey][day] = {};
    newData[monthKey][day].sleep = parseFloat(value);
    saveData(newData);
  };

  const getDayData = (day) => {
    return data[monthKey]?.[day] || {};
  };

  const getSleepPoints = () => {
    const points = [];
    for (let day = 1; day <= daysInMonth; day++) {
      const sleep = getDayData(day).sleep;
      if (sleep) {
        points.push({ day, sleep });
      }
    }
    return points;
  };

  const createSleepPath = () => {
    const points = getSleepPoints();
    if (points.length < 2) return '';
    
    const width = 280;
    const height = 120;
    const maxSleep = 10;
    const minSleep = 4;
    
    const pathData = points.map((point, index) => {
      const x = (point.day / daysInMonth) * width;
      const y = height - ((point.sleep - minSleep) / (maxSleep - minSleep)) * height;
      return `${index === 0 ? 'M' : 'L'} ${x} ${y}`;
    }).join(' ');
    
    return pathData;
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen">
      <div className="max-w-6xl mx-auto bg-white p-6" style={{ fontFamily: 'monospace' }}>
        {/* Header */}
        <div className="text-center mb-6 relative">
          <h1 className="text-2xl font-bold">{monthName} {currentYear}</h1>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="absolute right-0 top-0 px-3 py-1 bg-gray-200 hover:bg-gray-300 text-sm"
          >
            ⚙️ HABITS
          </button>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="mb-6 p-4 border bg-gray-100">
            <h3 className="font-bold mb-3">CUSTOMIZE HABITS</h3>
            {habits.map((habit, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <input
                  type="text"
                  value={habit.name}
                  onChange={(e) => updateHabitSettings(index, 'name', e.target.value.toUpperCase())}
                  className="flex-1 px-2 py-1 text-xs border"
                />
                <select
                  value={habit.type}
                  onChange={(e) => updateHabitSettings(index, 'type', e.target.value)}
                  className="px-2 py-1 text-xs border"
                >
                  <option value="check">Check</option>
                  <option value="number">Number</option>
                </select>
                <select
                  value={habit.color}
                  onChange={(e) => updateHabitSettings(index, 'color', e.target.value)}
                  className="px-2 py-1 text-xs border"
                >
                  <option value="black">Black (Critical)</option>
                  <option value="blue">Blue (Goal)</option>
                  <option value="red">Red (Avoid)</option>
                </select>
                <button
                  onClick={() => deleteHabit(index)}
                  className="px-2 py-1 bg-red-200 hover:bg-red-300 text-xs"
                >
                  DEL
                </button>
              </div>
            ))}
            <button
              onClick={addHabit}
              className="px-3 py-1 bg-green-200 hover:bg-green-300 text-xs"
            >
              + ADD HABIT
            </button>
          </div>
        )}

        <div className="grid grid-cols-2 gap-8">
          {/* Left Side - Memorable Moments */}
          <div>
            <h2 className="font-bold mb-4">MEMORABLE MOMENTS</h2>
            <div className="space-y-1">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className="flex items-center text-sm">
                  <span className="w-6 text-right mr-2">{day}</span>
                  <input
                    type="text"
                    value={getDayData(day).moment || ''}
                    onChange={(e) => updateMoment(day, e.target.value)}
                    className="flex-1 border-none outline-none bg-transparent text-xs"
                    placeholder="memorable moment..."
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Right Side - Habits and Sleep */}
          <div>
            {/* Habits Header */}
            <div className="grid grid-cols-8 gap-1 mb-2 text-xs font-bold">
              <div></div>
              {habits.map((habit, i) => (
                <div key={i} className="text-center transform -rotate-90 origin-center h-16 flex items-center justify-center">
                  <span style={{ color: habit.color }}>{habit.name}</span>
                </div>
              ))}
            </div>

            {/* Habits Grid */}
            <div className="space-y-1">
              {Array.from({ length: daysInMonth }, (_, i) => i + 1).map(day => (
                <div key={day} className="grid grid-cols-8 gap-1 items-center text-xs">
                  <div className="text-right font-bold">{day}</div>
                  {habits.map((habit, habitIndex) => (
                    <div key={habitIndex} className="text-center">
                      {habit.type === 'number' ? (
                        <input
                          type="number"
                          step="0.1"
                          value={getDayData(day).habits?.[habitIndex] || ''}
                          onChange={(e) => updateHabit(day, habitIndex, e.target.value)}
                          className="w-12 text-xs text-center border-none outline-none bg-transparent"
                        />
                      ) : (
                        <button
                          onClick={() => {
                            const current = getDayData(day).habits?.[habitIndex];
                            updateHabit(day, habitIndex, current ? '' : 'X');
                          }}
                          className="w-6 h-6 text-center hover:bg-gray-100"
                          style={{ color: habit.color }}
                        >
                          {getDayData(day).habits?.[habitIndex] || ''}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>

            {/* Sleep Graph */}
            <div className="mt-8">
              <h3 className="font-bold mb-2">SLEEP HOURS</h3>
              <div className="relative">
                <svg width="300" height="140" className="border">
                  {/* Grid lines */}
                  {[4, 5, 6, 7, 8, 9, 10].map(hour => (
                    <g key={hour}>
                      <line 
                        x1="0" 
                        y1={140 - ((hour - 4) / 6) * 120} 
                        x2="280" 
                        y2={140 - ((hour - 4) / 6) * 120} 
                        stroke="#e5e5e5" 
                        strokeWidth="1"
                      />
                      <text 
                        x="-5" 
                        y={145 - ((hour - 4) / 6) * 120} 
                        fontSize="10" 
                        textAnchor="end"
                      >
                        {hour}
                      </text>
                    </g>
                  ))}
                  
                  {/* Sleep line */}
                  {getSleepPoints().length > 1 && (
                    <path
                      d={createSleepPath()}
                      fill="none"
                      stroke="blue"
                      strokeWidth="2"
                    />
                  )}
                  
                  {/* Sleep points */}
                  {getSleepPoints().map(point => (
                    <circle
                      key={point.day}
                      cx={(point.day / daysInMonth) * 280}
                      cy={140 - ((point.sleep - 4) / 6) * 120}
                      r="3"
                      fill="blue"
                    />
                  ))}
                </svg>
                
                {/* Sleep input row */}
                <div className="mt-4 grid gap-1" style={{ gridTemplateColumns: `repeat(${Math.min(daysInMonth, 15)}, 1fr)` }}>
                  {Array.from({ length: Math.min(daysInMonth, 15) }, (_, i) => i + 1).map(day => (
                    <input
                      key={day}
                      type="number"
                      step="0.5"
                      min="4"
                      max="10"
                      value={getDayData(day).sleep || ''}
                      onChange={(e) => updateSleep(day, e.target.value)}
                      className="w-full text-xs text-center border border-gray-300 p-1"
                      placeholder={day.toString()}
                    />
                  ))}
                </div>
                
                {daysInMonth > 15 && (
                  <div className="mt-2 grid gap-1" style={{ gridTemplateColumns: `repeat(${daysInMonth - 15}, 1fr)` }}>
                    {Array.from({ length: daysInMonth - 15 }, (_, i) => i + 16).map(day => (
                      <input
                        key={day}
                        type="number"
                        step="0.5"
                        min="4"
                        max="10"
                        value={getDayData(day).sleep || ''}
                        onChange={(e) => updateSleep(day, e.target.value)}
                        className="w-full text-xs text-center border border-gray-300 p-1"
                        placeholder={day.toString()}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-8">
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth - 1))}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
          >
            Previous Month
          </button>
          <button
            onClick={() => setCurrentDate(new Date(currentYear, currentMonth + 1))}
            className="px-4 py-2 bg-gray-200 hover:bg-gray-300"
          >
            Next Month
          </button>
        </div>
      </div>
    </div>
  );
};

export default HabitTracker;