const express = require('express');

const {
  createMainGoal,
  createDayGoal,
  getMainGoal,
  getGoalPerDay,
  getMainGoalDiff,
  updateMainGoal,
} = require('../controllers/goals');

const router = express.Router();

/**
 * @route post api/goals/create/main-goal
 * @access private
 * @description route for creating main goal
 */

router.post('/create/main-goal', createMainGoal);

/**
 * @route put api/goals/update/main-goal
 * @access private
 * @description route for creating main goal
 */

router.put('/update/main-goal', updateMainGoal);

/**
 * @route post api/goals/create/day-goal
 * @access private
 * @description route for creating goal per day
 */

/**
 * @route get api/goals/main
 * @access private
 * @description route getting main goal amount
 */

router.get('/main', getMainGoal);

/**
 * @route get api/goals/day-goal
 * @access private
 * @description route getting goal-per-day amount
 */

router.get('/day', getGoalPerDay);

/**
 * @route get api/goals/main-goal-diff
 * @access private
 * @description route getting difference of main goal and sales (day)
 */

router.get('/main-goal-diff', getMainGoalDiff);

module.exports = router;
