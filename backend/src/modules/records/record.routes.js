const express = require('express');
const router = express.Router();
const recordController = require('./record.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createRecordSchema, updateRecordSchema, getRecordsSchema } = require('./record.validation');

router.use(authenticate);

router.post('/', authorize('ADMIN', 'SUPER_ADMIN'), validate(createRecordSchema), recordController.createRecord);
router.get('/', authorize('ADMIN', 'ANALYST', 'SUPER_ADMIN'), validate(getRecordsSchema), recordController.getRecords);
router.get('/:id', authorize('ADMIN', 'ANALYST', 'SUPER_ADMIN'), recordController.getRecordById);
router.patch('/:id', authorize('ADMIN', 'SUPER_ADMIN'), validate(updateRecordSchema), recordController.updateRecord);
router.delete('/:id', authorize('ADMIN','SUPER_ADMIN'), recordController.deleteRecord);

module.exports = router;