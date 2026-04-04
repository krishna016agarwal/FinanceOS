const express = require("express");
const router = express.Router();
const userController = require("./user.controller");
const authenticate = require("../../middlewares/authenticate");
const authorize = require("../../middlewares/authorize");
const validate = require("../../middlewares/validate");
const {
  updateRoleSchema,
  updateStatusSchema,
  getUsersSchema,
  userIdSchema,
} = require("./user.validation");

router.use(authenticate);
router.use(authorize("ADMIN")); // all user routes — ADMIN only

router.get("/", validate(getUsersSchema), userController.getAllUsers);

// router.post("/", validate(createUserSchema), userController.createUser);

router.get("/:id", validate(userIdSchema), userController.getUserById);

router.patch(
  "/:id/role",
  validate(updateRoleSchema),
  userController.updateRole,
);

router.patch(
  "/:id/status",
  validate(updateStatusSchema),
  userController.updateStatus,
);

router.delete("/:id", validate(userIdSchema), userController.deleteUser);

module.exports = router;
