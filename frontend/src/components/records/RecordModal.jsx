import { useState, useEffect } from "react";
import Modal from "../ui/Modal";
import Input from "../ui/Input";
import Button from "../ui/Button";
import { createRecord, updateRecord } from "../../api/records.api";
import toast from "react-hot-toast";
import { formatDateInput } from "../../utils/formatters";

const EMPTY = { amount: "", type: "INCOME", category: "", date: "", notes: "" };

const RecordModal = ({ open, onClose, record, onSaved }) => {
  const isEdit = Boolean(record);
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (record) {
      setForm({
        amount: record.amount,
        type: record.type,
        category: record.category,
        date: formatDateInput(record.date),
        notes: record.notes || "",
      });
    } else {
      setForm(EMPTY);
    }
    setErrors({});
  }, [record, open]);

  const validate = () => {
    const e = {};
    if (!form.amount || isNaN(form.amount) || Number(form.amount) <= 0)
      e.amount = "Valid amount required";
    if (!form.category.trim()) e.category = "Category required";
    if (!form.date) e.date = "Date required";
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      const payload = { ...form, amount: Number(form.amount) };
      let response;
      if (isEdit) response = await updateRecord(record._id, payload);
      else response = await createRecord(payload);

      // Read actual message from backend — catches the future date warning
      const message =
        response.data?.message ||
        (isEdit ? "Record updated" : "Record created");

      // Check if it is a warning (future date) or normal success
      const isFutureDate = new Date(form.date) > new Date();
      if (isFutureDate) {
        toast(message, {
          icon: "⚠️",
          style: {
            background: "#FAEEDA",
            color: "#633806",
            border: "1px solid #854F0B",
          },
          duration: 5000,
        });
      } else {
        toast.success(message);
      }

      onSaved();
      onClose();
    } catch (err) {
      const msg = err.response?.data?.message || "Something went wrong";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  const f = (field) => ({
    value: form[field],
    onChange: (e) => setForm({ ...form, [field]: e.target.value }),
    error: errors[field],
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={isEdit ? "Edit Record" : "New Record"}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input
            label="Amount (₹)"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            {...f("amount")}
          />

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Type
            </label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value })}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
            >
              <option value="INCOME">Income</option>
              <option value="EXPENSE">Expense</option>
            </select>
          </div>
        </div>

        <Input
          label="Category"
          placeholder="e.g. salary, rent, food"
          {...f("category")}
        />
        <Input label="Transaction Date" type="date" {...f("date")} />

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Notes (optional)
          </label>
          <textarea
            rows={3}
            value={form.notes}
            onChange={(e) => setForm({ ...form, notes: e.target.value })}
            placeholder="Any additional details..."
            className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg resize-none focus:outline-none focus:border-primary-500 focus:ring-1 focus:ring-primary-500"
          />
        </div>

        <div className="flex gap-3 pt-2">
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={loading} className="flex-1">
            {isEdit ? "Save changes" : "Create record"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default RecordModal;
