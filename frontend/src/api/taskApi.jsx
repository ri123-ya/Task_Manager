// src/api/taskApi.js
import axios from "axios";

const API_URL = "https://task-deployed.onrender.com/tasks";

export const getAllTasks = async () => {
  const res = await axios.get(API_URL);
  return res.data;
};

export const createTask = async (columnId, task) => {
  const res = await axios.post(API_URL, { columnId, task });
  return res.data.task;
};

export const deleteTask = async (columnId, taskId) => {
  await axios.delete(`${API_URL}/${columnId}/${taskId}`);
};

export const moveTask = async (from, to, task) => {
  await axios.post(`${API_URL}/move`, { from, to, task });
};
