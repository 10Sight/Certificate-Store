import { Router } from 'express';
import { createTemplate, getTemplatesByCategory, getAllTemplates, getTemplateById, updateTemplate } from '../controllers/template.controller.js';
import verifyJWT from '../middlewares/auth.middleware.js';

const router = Router();

router.use(verifyJWT);

router.route('/')
    .post(createTemplate)
    .get(getAllTemplates);

router.route('/category').get(getTemplatesByCategory);
router.route('/:id')
    .get(getTemplateById)
    .put(updateTemplate);

export default router;
