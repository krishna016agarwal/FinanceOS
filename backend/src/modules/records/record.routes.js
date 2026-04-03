const express = require('express');
const router = express.Router();
const recordController = require('./record.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { createRecordSchema, updateRecordSchema, getRecordsSchema } = require('./record.validation');

router.use(authenticate);

router.post('/', authorize('ADMIN'), validate(createRecordSchema), recordController.createRecord);
router.get('/', authorize('ADMIN', 'ANALYST'), validate(getRecordsSchema), recordController.getRecords);
router.get('/:id', authorize('ADMIN', 'ANALYST'), recordController.getRecordById);
router.patch('/:id', authorize('ADMIN'), validate(updateRecordSchema), recordController.updateRecord);
router.delete('/:id', authorize('ADMIN'), recordController.deleteRecord);

module.exports = router;