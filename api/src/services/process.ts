import { processesRepo } from "../repositories";
import { ProcessName, ProcessStatus, ProcessResult } from "../types";

export const processService = {
  create: async function (newTask: {
    name: ProcessName;
    status: ProcessStatus;
  }) {
    return await processesRepo.create(newTask);
  },

  read: async function (name: ProcessName) {
    return await processesRepo.read(name);
  },

  update: async function (updatedTask: {
    name: ProcessName;
    status?: ProcessStatus | undefined;
    result?: ProcessResult | undefined;
  }) {
    return await processesRepo.update(updatedTask);
  },

  destroy: async function (name: ProcessName) {
    await processesRepo.destroy(name);
  },
};
