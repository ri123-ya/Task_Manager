import './App.css';
import { useEffect, useState } from 'react';
import {
  getAllTasks,
  createTask,
  deleteTask,
  moveTask,
} from './api/taskApi';

function App() {
  const [columns, setColumns] = useState({
    todo: { name: "To Do", items: [] },
    inProgress: { name: "In Progress", items: [] },
    done: { name: "Done", items: [] },
  });

  const [newTask, setNewTask] = useState({ title: "", description: "" });
  const [activeColumn, setActiveColumn] = useState("todo");
  const [draggedItem, setDraggedItem] = useState(null);

  const columnStyles = {
    todo: {
      border: "border-t-rose-700",
      header: "bg-rose-700"
    },
    inProgress: {
      border: "border-t-amber-700",
      header: "bg-amber-700"
    },
    done: {
      border: "border-t-emerald-700",
      header: "bg-emerald-700"
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      const data = await getAllTasks();
      setColumns({
        todo: { name: "To Do", items: data.todo || [] },
        inProgress: { name: "In Progress", items: data.inProgress || [] },
        done: { name: "Done", items: data.done || [] },
      });
    } catch (error) {
      console.error("Error fetching tasks:", error);
    }
  };

  const addNewTask = async () => {
    if (newTask.title.trim() === "") return;
    try {
      const addedTask = await createTask(activeColumn, newTask);
      setColumns((prev) => ({
        ...prev,
        [activeColumn]: {
          ...prev[activeColumn],
          items: [...prev[activeColumn].items, addedTask],
        },
      }));
      setNewTask({ title: "", description: "" });
    } catch (error) {
      console.error("Error adding task:", error);
    }
  };

  const removeTask = async (columnId, taskId) => {
    try {
      await deleteTask(columnId, taskId);
      setColumns((prev) => ({
        ...prev,
        [columnId]: {
          ...prev[columnId],
          items: prev[columnId].items.filter((item) => item.id !== taskId),
        },
      }));
    } catch (error) {
      console.error("Error deleting task:", error);
    }
  };

  const handleDrop = async (e, toColumnId) => {
    e.preventDefault();
    if (!draggedItem) return;

    const { columnId: fromColumnId, item } = draggedItem;
    if (fromColumnId === toColumnId) return;

    try {
      await moveTask(fromColumnId, toColumnId, item);
      setColumns((prev) => {
        const updatedFrom = prev[fromColumnId].items.filter((i) => i.id !== item.id);
        const updatedTo = [...prev[toColumnId].items, item];
        return {
          ...prev,
          [fromColumnId]: {
            ...prev[fromColumnId],
            items: updatedFrom,
          },
          [toColumnId]: {
            ...prev[toColumnId],
            items: updatedTo,
          },
        };
      });
      setDraggedItem(null);
    } catch (error) {
      console.error("Error moving task:", error);
    }
  };

  const handleDragStart = (columnId, item) => {
    setDraggedItem({ columnId, item });
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  return (
    <div className="p-6 w-full min-h-screen bg-gradient-to-b from-zinc-900 to-zinc-800 flex items-center justify-center">
      <div className="flex items-center justify-center flex-col gap-4 w-full max-w-6xl">
        <h1 className="text-4xl font-bold mb-8 text-gray-300">Task Manager</h1>

        <div className="mb-8 flex flex-col w-full max-w-lg shadow-lg rounded-lg overflow-hidden">
          <div className="flex">
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({ ...newTask, title: e.target.value })}
              placeholder="Task title*"
              className="flex-grow p-3 bg-zinc-700 text-white"
              onKeyDown={(e) => e.key === "Enter" && addNewTask()}
            />
            <select
              value={activeColumn}
              onChange={(e) => setActiveColumn(e.target.value)}
              className="p-3 bg-zinc-800 text-white border-0 border-l border-zinc-600"
            >
              {Object.keys(columns).map((columnId) => (
                <option value={columnId} key={columnId}>
                  {columns[columnId].name}
                </option>
              ))}
            </select>
          </div>
          <textarea
            value={newTask.description}
            onChange={(e) => setNewTask({ ...newTask, description: e.target.value })}
            placeholder="Task description (optional)"
            className="p-3 bg-zinc-700 text-white border-t border-zinc-600 min-h-20"
          />
          <button
            onClick={addNewTask}
            className="px-6 py-3 bg-gradient-to-r from-amber-700 to-amber-600 text-white font-medium hover:from-amber-600 hover:to-amber-500 transition-all duration-200 cursor-pointer"
          >
            Add Task
          </button>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-6 w-full">
          {Object.keys(columns).map((columnId) => (
            <div
              key={columnId}
              className={`flex-shrink-0 w-80 bg-zinc-800 rounded-lg shadow-xl border-t-4 ${columnStyles[columnId].border}`}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, columnId)}
            >
              <div className={`p-4 text-white font-bold text-xl rounded-t-md ${columnStyles[columnId].header}`}>
                {columns[columnId].name}
                <span className="ml-2 px-2 py-1 bg-zinc-800 bg-opacity-30 rounded-full text-sm">
                  {columns[columnId].items.length}
                </span>
              </div>

              <div className="p-3 min-h-64">
                {columns[columnId].items.length === 0 ? (
                  <div className="text-center py-10 text-zinc-500 italic text-sm">Drop tasks here</div>
                ) : (
                  columns[columnId].items.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 mb-3 bg-zinc-700 text-white rounded-lg shadow-md cursor-move flex items-center justify-between transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
                      draggable
                      onDragStart={() => handleDragStart(columnId, item)}
                    >
                      <div>
                        <div className="font-medium">{item.title}</div>
                        {item.description && (
                          <div className="text-sm text-zinc-300 mt-1">{item.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => removeTask(columnId, item.id)}
                        className="text-zinc-400 hover:text-rose-400 transition-colors duration-200 w-6 h-6 flex items-center justify-center rounded-full hover:bg-zinc-600"
                      >
                        <span className="text-lg cursor-pointer">×</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default App;
