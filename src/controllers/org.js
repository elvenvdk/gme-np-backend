const formidable = require('formidable');
const fs = require('fs');
const jwt = require('jsonwebtoken');

const { tokenTypes, hashPassword, userRoles } = require('./helpers');

const Org = require('../models/org');
const OrgSession = require('../models/orgSession');
const user = require('../models/user');

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
      console.log({ fields });
      if (err) return res.status(404);

      // Check if org exists
      let org = await Org.findOne({ name: fields.name });
      if (org)
        return res
          .status(404)
          .json({ error: 'This organization name already exists' });

      // Add fields and photo?
      org = await new Org(fields);
      if (files.photo) {
        org.photo.data = fs.readFileSync(files.photo.path);
        org.photo.contentType = files.photo.type;
      }

      await org.save();

      // Create org session token payload
      const payload = {
        id: org._id,
        name: org.name,
      };

      // Create org session token
      jwt.sign(
        payload,
        process.env.JWT_SECRET,
        {
          expiresIn: '2w',
        },
        async (err, token) => {
          if (err) return res.status(400).json({ error: err.message });

          // Put session token, orgID and ownderID in org sessions
          const orgSession = await new OrgSession({
            org: org._id,
            owner: user._id,
            token,
          });

          await orgSession.save();

          res.send({
            msg: `${org.name} was successfully saved`,
            orgId: org._id,
            orgToken: orgSession.token,
          });
        },
      );
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

  try {
    let form = new formidable.IncomingForm();
    form.keepExtensions = true;
    form.parse(req, async (err, fields, files) => {
      if (err) return res.status(400).json({ error: err.message });

      const {
        name,
        addressLine1,
        addressLine2,
        city,
        state,
        zipCode,
        photo,
        active,
      } = fields;

      const org = await Org.findOne({ _id: orgId });
      if (!org)
        return res.status(400).json({ error: 'Organization not found' });

      if (name) org.name = name;
      if (addressLine1) org.addressLine1 = addressLine1;
      if (addressLine2) org.addressLine2 = addressLine2;
      if (city) org.city = city;
      if (state) org.state = state;
      if (zipCode) org.zipCode = zipCode;
      if (photo) org.photo = photo;
      if (active) org.active = active;

      if (files.photo) {
        org.photo.data = fs.readFileSync(photo.path);
        org.photo.contentType = photo.type;
      }

      await org.save();
      res.send({ msg: `${org.name} has been successfully updated` });
    });
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

/**
 * @function getOrg
 * @description Get's single organization from db
 * @param {*} req orgId
 * @param {*} res Organization
 */

exports.getOrg = async (req, res) => {
  const { orgId } = req.query;
  try {
    const org = await Org.findOne({ _id: orgId });
    if (!org)
      return res
        .status(400)
        .json({ error: 'There was a problem finding this organization' });
    res.send(org);
  } catch (error) {
    return res
      .status(400)
      .json({ error: 'There was a problem getting this organization' });
  }
};
