# HabiTracki - Personal Habit Tracking Application

HabiTracki is a comprehensive personal habit tracking application built with React and TypeScript. The core feature is an innovative **Habit Grid** - a powerful two-dimensional tracking matrix that displays all habits across all days of the month in a single, comprehensive view.

## Features

*   **Habit Grid:** A two-dimensional matrix that revolutionizes how users visualize and interact with their daily habits.
*   **Memorable Moments Calendar:** A monthly calendar to jot down memorable moments.
*   **Monthly Goals:** Set and track up to three monthly goals.
*   **Sleep Tracking:** Log and visualize your sleep patterns.
*   **Customizable Habits:** Add, edit, delete, and reorder your habits.
*   **Data Import/Export:** Backup and restore your data using JSON.

## Technology Stack

*   **React 18.3.1** with TypeScript
*   **Vite** as the build tool and development server
*   **Tailwind CSS 3.4.1** for utility-first styling
*   **date-fns 4.1.0** for date manipulation and formatting
*   **lucide-react 0.344.0** for icons

## Getting Started

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/your-username/habitracki.git
    ```
2.  **Install dependencies:**
    ```bash
    cd habitracki
    npm install
    ```
3.  **Run the development server:**
    ```bash
    npm run dev
    ```
4.  **Open your browser** and navigate to `http://localhost:5173` (or the address shown in your terminal).

## Core Architecture

The application is built around the `HabitTracker` component, which orchestrates the following feature components:

*   `HabitGrid.tsx`
*   `CalendarGrid.tsx`
*   `MonthlyGoals.tsx`
*   `SleepTracker.tsx`
*   `HabitSettings.tsx`

State management is handled by the `useHabitData.ts` custom hook, which persists data to the browser's local storage.
