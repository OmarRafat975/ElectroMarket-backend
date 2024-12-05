exports.createData = (Model) => async (req, res, next) => {
  const data = await Model.create(req.body);
  if (!data)
    return res.status(404).json({
      status: 'fail',
      message: 'the Data Cannot be Created!',
    });
  res.status(201).json({
    status: 'success',
    data,
  });
};

exports.getAll =
  (Model, filter = {}) =>
  async (req, res, next) => {
    const data = await Model.find(filter);
    res.status(201).json({
      status: 'success',
      data,
    });
  };

exports.getById = (Model) => async (req, res, next) => {
  const data = await Model.findById(req.params.id);
  res.status(201).json({
    status: 'success',
    data,
  });
};

exports.updateData = (Model) => async (req, res, next) => {
  const data = await Model.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
  });
  if (!data)
    return res.status(404).json({
      status: 'fail',
      message: 'the Data Cannot be Updated!',
    });
  res.status(201).json({
    status: 'success',
    data,
  });
};

exports.deleteData = (Model) => async (req, res, next) => {
  await Model.findByIdAndDelete(req.params.id);
  res.status(201).json({
    status: 'success',
    message: 'Data Deleted Successfully',
  });
};
