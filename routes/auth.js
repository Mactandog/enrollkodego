const express = require("express");
const router = express.Router();
const registrationController = require("../controllers/authAccount");

router.post("/register", registrationController.addAccount);
router.post("/login", registrationController.loginAccount);
router.post("/addStudent", registrationController.addStudent);
router.get(
  "/updateStudentForm/:email",
  registrationController.updateStudentForm
);
router.post("/updateStudent", registrationController.updateStudent);
router.get("/updateStudent/:email", registrationController.deleteStudent);
router.get("/logout", registrationController.logoutAccount);

module.exports = router;
