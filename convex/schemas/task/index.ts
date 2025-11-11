import executableTable from './executable';
import taskLogTable from './log';
import taskTable from './task';

export const taskSchema = {
  tasks: taskTable,
  executables: executableTable,
  taskLogs: taskLogTable,
};
