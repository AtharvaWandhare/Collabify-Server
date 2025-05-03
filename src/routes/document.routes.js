import { Router } from 'express';
import documentController from '../controllers/document.controller.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();

// Secure Routes
router.route('/')
    .get(verifyJWT, documentController.getAllDocuments)
    .post(verifyJWT, documentController.createDocument);

router.route('/:id')
    .get(verifyJWT, documentController.getDocumentById)
    .put(verifyJWT, documentController.updateDocument)
    .delete(verifyJWT, documentController.deleteDocument);

router.route('/:id/download')
    .get(verifyJWT, documentController.downloadDocumentAsDOCX);

router.route('/search')
    .get(verifyJWT, documentController.searchDocuments);

export default router;