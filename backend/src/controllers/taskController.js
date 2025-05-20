import tasks from '../data/task.js';

export const getTasks = (req, res) => {
  res.json(tasks);
};

export const addTask = (req, res) => {
  const { columnId, task } = req.body;
  if (!tasks[columnId]) {
    tasks[columnId] = [];
  }
  const newTask = { ...task, id: Date.now().toString() };
  tasks[columnId].push(newTask);
  res.json({ success: true, task: newTask });
};

export const deleteTask = (req, res) => {
  const { columnId, taskId } = req.params;
  tasks[columnId] = tasks[columnId].filter((item) => item.id !== taskId);
  res.json({ success: true });
};

export const moveTask = (req, res) => {
  const { from, to, task } = req.body;
  tasks[from] = tasks[from].filter((item) => item.id !== task.id);
  tasks[to].push(task);
  res.json({ success: true });
};
