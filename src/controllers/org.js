const formidable = require('formidable');
const fs = require('fs');

const Org = require('../models/org');

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
      .json({ error: 'Threre was problem adding this organization' });
  }
};

// exports.addOrg = async (req, res) => {
//   try {
//     let form = new formidable.IncomingForm();
//     form.keepExtensions = true;
//     form.parse(req, async (err, fields, files) => {
//       if (err)
//         return res.status(404).json({ error: 'Image could not be uploaded' });

//       const foundProduct = await Product.find({ name: fields.name });
//       if (foundProduct.length) {
//         return res.status(400).json({ error: 'Product already in database' });
//       }
//       let product = new Product(fields);
//       if (files.photo) {
//         product.photo.data = fs.readFileSync(files.photo.path);
//         product.photo.contentType = files.photo.type;
//       }

//       await product.save();
//       res.send({ msg: `Product successfully added.` });
//     });
//   } catch (err) {
//     res.status(400).json({
//       error: 'There was a problem adding this product',
//       msg: err.message,
//     });
//   }
// };
