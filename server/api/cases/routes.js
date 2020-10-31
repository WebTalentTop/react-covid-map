import express from 'express';
import controller from './controller';

const router = express.Router();

router.post('/', controller.addRecord);
router.get('/', controller.getRecords);
router.put('/:id', controller.updateRecord);
router.delete('/:id', controller.deleteRecord);

export default router;
