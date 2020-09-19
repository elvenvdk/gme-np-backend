const Goal = require('../models/goals');

exports.createGoal = async (req, res) => {
  const { amount, org } = req.body;

  try {
    const goal = await new Goal({ [mainGoal.amount]: amount, org });
    await goal.save();
    res.send({ msg: 'Main goal successfully created' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

exports.createDayGoal = async (req, res) => {
  const { amount, org } = req.body;

  try {
    const goal = await new Goal({ [goalPerDay.amount]: amount, org });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
