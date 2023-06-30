const mongoose = require("mongoose");

const userWithdrawalStatusSchema = new mongoose.Schema(
  {
    withdrawal_id: { type: String, required: true },
    userID: { type: String, required: true },
    amount: { type: Number, required: true },
    beneficiary_branch_code: { type: String, required: true },
    expected_date: { type: Date, required: true },
    request_date:{type: Date, require:true},
    status_date:{type: Date, require:true},
    status: {
      type: String,
      enum: [
        "Placed",
        "Undergoing Checks",
        "Under Processing",
        "Placed With Bank",
        "Withdrawal Successful",
        "Withdrawal Rejected",
      ],
      default: "Placed", // Set the default value to "Placed"
    },
  },
 
);

const UserWithdrawalStatus = mongoose.model(
  "UserWithdrawalStatus",
  userWithdrawalStatusSchema
);

module.exports = UserWithdrawalStatus;
