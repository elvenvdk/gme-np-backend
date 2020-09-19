const formidable = require('formidable');
const fs = require('fs');

const Org = require('../models/org');

/**
 * @function addOrg
 * @description Adds organization to database
 * @param {*} req name, addressLine1, addressLine2, city, state, zipCode, photo
 * @param {*} res confirmation msg
 */

exports.addOrg = async (req, res) => {
  try {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(404);

      let org = await Org.findOne({ name: fields.name });
      if (org)
        return res
          .status(404)
          .json({ error: 'This organization name already exists' });

      org = await new Org(fields);
      if (files.photo) {
        org.photo.data = fs.readFileSync(files.photo.path);
        org.photo.contentType = files.photo.type;
      }

      await org.save();

      res.send({ msg: `${org.name} was successfully saved` });
    });
  } catch (error) {
    res
      .status(404)
      .json({ error: 'There was problem adding this organization' });
  }
};

/**
 * @function updateOrg
 * @description Updates organization in database
 * @param {*} query orgId
 * @param {*} req name, addressLine1, addressLine2, city, state, zipCode, photo
 * @param {*} res confirmation msg
 */

exports.updateOrg = async (req, res) => {
  const { orgId } = req.query;
  const {
    name,
    addressLine1,
    addressLine2,
    city,
    state,
    zipCode,
    photo,
    active,
  } = req.body;

  try {
    const org = await Org.findOne({ _id: orgId });
    if (!org) return res.status(400).json({ error: 'Organization not found' });

    if (name) org.name = name;
    if (addressLine1) org.addressLine1 = addressLine1;
    if (addressLine2) org.addressLine2 = addressLine2;
    if (city) org.city = city;
    if (state) org.state = state;
    if (zipCode) org.zipCode = zipCode;
    if (photo) org.photo = photo;
    if (active) org.active = active;

    await org.save();
    res.send({ msg: `${org.name} has been successfully updated` });
  } catch (error) {
    res
      .status(400)
      .json({ error: 'There was a problem updating this organization' });
  }
};

/**
 * @function getOrgs
 * @description List all organizations in database
 * @param {*} res List of all orgs
 */

exports.getOrgs = async (req, res) => {
  try {
    const orgs = await Org.find({});
    if (!orgs)
      return res
        .status(400)
        .json({ error: "There's an error with getting the organizations" });

    res.send(orgs);
  } catch (error) {
    res.status(400).json({ error: "There's a problem getting organizations" });
  }
};
