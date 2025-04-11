//setup the dependencies
const express = require("express");
const router = express.Router();
const {verify,verifyAdmin} = require("../auth");
const userController = require("../controllers/userController");

router.post("/register",  userController.registerUser)

router.post("/login", userController.loginUser)

router.get("/details", verify, userController.getProfile)

router.patch("/:id/set-as-admin", verify, verifyAdmin,  userController.setAsAdmin)

router.patch("/update-password", verify, userController.updatePassword)

module.exports = router;