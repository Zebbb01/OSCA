// app/api/seniors/services/senior.service.ts
import { createSenior, updateSeniorDocuments } from './create.service';
import { getSeniors, getArchivedSeniors } from './get.service';
import { updateSenior, softDeleteSenior, permanentDeleteSenior, restoreSenior } from './update.service';

export const seniorService = {
  createSenior,
  updateSeniorDocuments,
  getSeniors,
  getArchivedSeniors,
  updateSenior,
  softDeleteSenior,
  permanentDeleteSenior,
  restoreSenior,
};