const router = require('express').Router();
const SubjectController = require('../controllers/subject.controller');
const { authenticateJWT, refreshJWT } = require('../utils/jwtAuth');

// router.route('/all').get(authenticateJWT, refreshJWT, SubjectController.get);


router.route('/get_subjects').post(authenticateJWT, refreshJWT, SubjectController.getSubjectsByUserId);
router.route('/create').post(authenticateJWT, refreshJWT, SubjectController.create);
router.route('/update').put(authenticateJWT, refreshJWT, SubjectController.update);
router.route('/delete').delete(authenticateJWT, refreshJWT, SubjectController.delete);

module.exports = router;