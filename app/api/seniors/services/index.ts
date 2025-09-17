// app/api/seniors/services/index.ts

export { createSenior, updateSeniorDocuments } from './create.service';
export { getSeniors, getArchivedSeniors } from './get.service';
export { updateSenior, softDeleteSenior, permanentDeleteSenior, restoreSenior } from './update.service';
export { seniorService } from './senior.service'; // This is the final combined export