const axios = require('axios');
const moment = require('moment');

const API_URL = process.env.GE_S_API;

exports.getSales = async (req, res) => {
  const { org, startDate, endDate } = req.query;
  console.log({ org, startDate, endDate });
  try {
    const sales = await axios.get(
      `${API_URL}/sales?org=${org}&startDate=${startDate}&endDate=${endDate}`,
      {
        startDate,
        endDate,
      },
    );
    res.send(sales.data);
  } catch (error) {
    return res.status(400).json({ error: error.message });
  }
};
