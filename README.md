# Day 4: Task Management App

A simple **React Task Management App** built using modern React hooks and Material UI.

## Features
- Add tasks with **title, description, and priority**.
- **Mark tasks as complete/incomplete**.
- Delete tasks from the list.
- **Filter tasks**: All, Completed, Incomplete.
- **Light/Dark theme toggle**.
- **Persistent tasks** using `localStorage`.

## React Hooks Used
- `useState` – manage input fields and component state.
- `useReducer` – structured task list management (add, remove, toggle, update).
- `useEffect` – persist tasks in `localStorage`.
- `useContext` – global theme (light/dark mode) management.
- `useMemo` – optimize task filtering performance.
- `useCallback` – memoize add/delete/toggle functions for better performance.

## Installation
```bash
git clone https://github.com/Shrish9999/internship-day4-task-app.git
cd internship-day4-task-app
npm install
npm start
