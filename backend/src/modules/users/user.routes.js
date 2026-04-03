const express = require('express');
const router = express.Router();
const userController = require('./user.controller');
const authenticate = require('../../middlewares/authenticate');
const authorize = require('../../middlewares/authorize');
const validate = require('../../middlewares/validate');
const { updateRoleSchema, updateStatusSchema, getUsersSchema } = require('./user.validation');

router.use(authenticate); // all user routes require auth

router.get('/', authorize('ADMIN'), validate(getUsersSchema), userController.getAllUsers);
router.get('/:id', authorize('ADMIN'), userController.getUserById);
router.patch('/:id/role', authorize('ADMIN'), validate(updateRoleSchema), userController.updateRole);
router.patch('/:id/status', authorize('ADMIN'), validate(updateStatusSchema), userController.updateStatus);

module.exports = router;