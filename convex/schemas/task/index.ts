import executableTable from './executable';
import taskExecutionTable from './execution';
import executableHistoryTable from './history';
import taskLogTable from './log';
import taskTable from './task';

export const taskSchema = {
  tasks: taskTable,
  executables: executableTable,
  taskLogs: taskLogTable,
  executableHistory: executableHistoryTable,
  taskExecutions: taskExecutionTable,
};
