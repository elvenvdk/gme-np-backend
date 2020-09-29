const axios = require('axios');
const moment = require('moment');
const Goal = require('../models/goals');

const SALES_URL = process.env.GE_S_API;
/**
 * @function createMainGoal
 * @description Creates/updates organization mainGoal amount in database
 * @param {*} query orgId
 * @param {*} req amount, ordId
 * @param {*} res confirmation msg
 */

exports.createMainGoal = async (req, res) => {
  const { goalId, orgId } = req.query;
  const { amount } = req.body;

  try {
    const d = moment().format();
    let goal = await Goal.findOne({ _id: goalId });
    if (!goal) {
      goal = await new Goal({
        'mainGoal.amount': amount,
        'mainGoal.dateAdded': d,
        org: orgId,
      });
      await goal.save();
    } else {
      goal.mainGoal.amount = amount;
      goal.mainGoal.dateAdded = d;
      goal.org = orgId;
      await goal.save();
    }
    res.send({ msg: 'Main goal was successfully created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @function createDayGoal
 * @description Creates/updates organization goalPerDay amount in database
 * @param {*} query goalId
 * @param {*} req amount, ordId
 * @param {*} res confirmation msg
 */

exports.createDayGoal = async (req, res) => {
  const { goalId, orgId } = req.query;
  const { amount } = req.body;

  try {
    let goal = await Goal.findOne({ _id: goalId });
    const d = moment().format();
    if (!goal) {
      goal = await new Goal({
        goalPerDay: [
          {
            amount,
            dateAdded: d,
          },
        ],
        org: orgId,
      });
      await goal.save();
    } else {
      // if (!goal.goalPerDay.length) goal.goalPerDay =
      goal.goalPerDay.unshift({
        amount,
        dateAdded: d,
      });
      goal.org = orgId;
      await goal.save();
    }
    res.send({ msg: 'Goal Per Day was successfully created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @function getMainGoal
 * @description Gets organization mainGoal amount
 * @param {*} query orgId
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.getMainGoal = async (req, res) => {
  const { orgId } = req.query;
  try {
    const goal = await Goal.findOne({ _id: orgId });
    if (!goal)
      return res
        .status(400)
        .json({ error: 'There was an error getting your Main Goal' });
    res.send(goal.mainGoal.amount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @function getMainGoal
 * @description Gets organization goalPerDay amount
 * @param {*} query orgId
 * @param {*} req
 * @param {*} res confirmation msg
 */

exports.getGoalPerDay = async (req, res) => {
  const { orgId } = req.query;
  const { type } = req.body;
  try {
    const goal = await Goal.findOne({ _id: orgId, type: type && 'Non-Profit' });
    if (!goal)
      return res
        .status(400)
        .json({ error: 'There was an error getting your Goal Per Day' });
    res.send(goal.goalPerDay[0].amount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * @function getMainGoalDiff
 * @description Gets the difference between Main Goal and actual Sales
 * @param {*} query orgId
 * @param {*} req type?
 * @param {*} res confirmation msg
 */

exports.getMainGoalDiff = async (req, res) => {
  const { orgId } = req.query;
  const { type } = req.body;
  try {
    const sales = await axios.get(`${SALES_URL}/sales/sales-per-day`, type);
    console.log({ sales: sales.data });
    res.send(sales.data);
  } catch (error) {
    console.log({ error });
    res.status(400).json({ error: error.message });
  }
};

/**
 * @function getMainGoal
 * @description Gets organization goalPerDay amount
 * @param {*} query orgId
 * @param {*} req
 * @param {*} res confirmation msg
 */
