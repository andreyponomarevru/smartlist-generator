import { processesRepo } from "../repositories";
import {
  OSProcessName,
  OSProcessStatus,
  ValidationResult,
  SSEMessage,
} from "../types";

export const processService = {
  create: async function (newTask: {
    name: OSProcessName;
    status: OSProcessStatus;
  }): Promise<SSEMessage> {
    return await processesRepo.create(newTask);
  },

  read: async function (name: OSProcessName): Promise<SSEMessage | null> {
    return await processesRepo.read(name);
  },

  update: async function (updatedTask: {
    name: OSProcessName;
    status?: OSProcessStatus;
    result?: ValidationResult;
  }): Promise<SSEMessage | null> {
    return await processesRepo.update(updatedTask);
  },

  destroy: async function (name: OSProcessName): Promise<void> {
    await processesRepo.destroy(name);
  },
};
