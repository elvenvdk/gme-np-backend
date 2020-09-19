const e = require('express');
const Goal = require('../models/goals');

/**
 * @function createMainGoal
 * @description Creates/updates organization mainGoal amount in database
 * @param {*} query orgId
 * @param {*} req amount, ordId
 * @param {*} res confirmation msg
 */

exports.createMainGoal = async (req, res) => {
  const { goalId } = req.query;
  const { amount, orgId } = req.body;

  try {
    let goal = await Goal.findOne({ _id: goalId });
    if (!goal) {
      goal = await new Goal({ 'mainGoal.amount': amount, org: orgId });
      await goal.save();
    } else {
      goal.mainGoal.amount = amount;
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
  const { goalId } = req.query;
  const { amount, orgId } = req.body;

  try {
    let goal = await Goal.findOne({ _id: goalId });
    const d = new Date(Date.now());
    if (!goal) {
      goal = await new Goal({ 'goalPerDay.amount': amount, org: orgId });
      await goal.save();
    } else {
      goal.goalPerDay.push({ dayAmount: amount, amountDate: d });
      goal.org = orgId;
      await goal.save();
    }
    res.send({ msg: 'Goal Per Day was successfully created' });

    goal = await new Goal({ [goalPerDay.amount]: amount, org, amountDate: d });
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
  try {
    const goal = await Goal.findOne({ _id: orgId });
    if (!goal)
      return res
        .status(400)
        .json({ error: 'There was an error getting your Goal Per Day' });
    res.send(goal.goalPerDay[0].amount);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
