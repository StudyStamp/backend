const router = require('express').Router();
const UserController = require('../controllers/user.controller');
const { authenticateJWT, refreshJWT } = require('../utils/jwtAuth');

router.route('/all').get(authenticateJWT, refreshJWT, UserController.get);

router.route('/login').post(UserController.login);
router.route('/register').post(UserController.register);
router.route('/forgot_password').post(authenticateJWT, refreshJWT, UserController.forgot_password);
router.route('/low').post(authenticateJWT, refreshJWT, UserController.fetchLowAttdSubjects);

router.route('/update/:id').put(authenticateJWT, refreshJWT, UserController.update);
router.route('/reset_password/:token').put(authenticateJWT, refreshJWT, UserController.reset_password);

module.exports = router;