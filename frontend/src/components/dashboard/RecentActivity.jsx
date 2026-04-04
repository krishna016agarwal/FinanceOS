import { formatCurrency, formatDate, capitalize } from "../../utils/formatters";
import Badge from "../ui/Badge";
import Spinner from "../ui/Spinner";

const RecentActivity = ({ data, loading }) => (
  <div className="card">
    <div className="px-5 py-4 border-b border-gray-100 flex items-center justify-between">
      <h3 className="text-sm font-semibold text-gray-900">
        Recent Transactions
      </h3>
      <span className="text-xs text-gray-400">sorted by transaction date</span>
    </div>

    {loading ? (
      <div className="h-48 flex items-center justify-center">
        <Spinner />
      </div>
    ) : (
      <ul className="divide-y divide-gray-100">
        {(data || []).map((rec) => (
          <li
            key={rec._id}
            className="flex items-center justify-between px-5 py-3
              hover:bg-gray-50 transition-colors"
          >
            <div className="flex items-center gap-3 min-w-0">
              <div
                className={`w-8 h-8 rounded-lg flex items-center
                justify-center flex-shrink-0 text-xs font-semibold
                ${
                  rec.type === "INCOME"
                    ? "bg-green-100 text-green-700"
                    : "bg-red-100 text-red-600"
                }`}
              >
                {rec.type === "INCOME" ? "+" : "−"}
              </div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {capitalize(rec.category)}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <p className="text-xs text-gray-400">
                    {formatDate(rec.date)}
                  </p>
                  {/* Show if entered recently — within last 24 hours */}
                  {new Date() - new Date(rec.createdAt) < 86400000 && (
                    <span
                      className="text-xs px-1.5 py-0.5 rounded-full
                      bg-green-100 text-green-700 font-medium"
                    >
                      New
                    </span>
                  )}
                </div>
              </div>
            </div>
            <div className="flex items-center gap-3 ml-4 flex-shrink-0">
              <Badge label={rec.type} />
              <span
                className={`text-sm font-semibold
                ${rec.type === "INCOME" ? "text-green-600" : "text-red-600"}`}
              >
                {rec.type === "INCOME" ? "+" : "−"}
                {formatCurrency(rec.amount)}
              </span>
            </div>
          </li>
        ))}

        {!data?.length && (
          <li className="px-5 py-8 text-center text-sm text-gray-400">
            No recent activity
          </li>
        )}
      </ul>
    )}
  </div>
);

export default RecentActivity;
