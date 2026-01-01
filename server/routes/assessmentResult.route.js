import { Router } from 'express';
import { createAssessmentResult, getLastAssessmentResult, getAssessmentByTemplateAndUser, updateAssessmentResult, getAllAssessmentResultsByUser } from '../controllers/assessmentResult.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js'; // Assuming auth middleware exists

const router = Router();

// Protect all routes
// router.use(verifyJWT); // Uncomment if auth required

router.route('/create').post(createAssessmentResult);
router.route('/latest/:userId').get(getLastAssessmentResult);
router.route('/user/:userId').get(getAllAssessmentResultsByUser);
router.route('/template/:templateId/user/:userId').get(getAssessmentByTemplateAndUser);
router.route('/update/:id').patch(updateAssessmentResult);

export default router;
