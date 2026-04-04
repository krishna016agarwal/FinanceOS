const asyncHandler = require('../../utils/asyncHandler');
const sendResponse = require('../../utils/sendResponse');
const recordService = require('./record.service');

const createRecord = asyncHandler(async (req, res) => {
  const { record, warning } = await recordService.createRecord(
    req.body,
    req.user._id
  );

  sendResponse(res, {
    statusCode: 201,
    message:    warning || 'Record created successfully',
    data:       { record },
  });
});

const getRecords = asyncHandler(async (req, res) => {
  const { records, meta } = await recordService.getRecords(req.query);
  sendResponse(res, { message: 'Records fetched', data: { records }, meta });
});

const getRecordById = asyncHandler(async (req, res) => {
  const record = await recordService.getRecordById(req.params.id);
  sendResponse(res, { message: 'Record fetched', data: { record } });
});

const updateRecord = asyncHandler(async (req, res) => {
  const record = await recordService.updateRecord(req.params.id, req.body);
  sendResponse(res, { message: 'Record updated', data: { record } });
});

const deleteRecord = asyncHandler(async (req, res) => {
  await recordService.deleteRecord(req.params.id, req.user._id);
  sendResponse(res, { message: 'Record deleted successfully', data: null });
});

module.exports = { createRecord, getRecords, getRecordById, updateRecord, deleteRecord };