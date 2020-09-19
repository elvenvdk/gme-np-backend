const express = require('express');

const {
  createMainGoal,
  createDayGoal,
  getMainGoal,
  getGoalPerDay,
} = require('../controllers/goals');

const router = express.Router();

/**
 * @route post api/goals/create/main-goal
 * @access private
 * @description route for creating main goal
 */

router.post('/create/main-goal', createMainGoal);

/**
 * @route post api/goals/create/day-goal
 * @access private
 * @description route for creating goal per day
 */

router.post('/create/day-goal', createDayGoal);

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

module.exports = router;
