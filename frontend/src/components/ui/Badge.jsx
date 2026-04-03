const variants = {
  INCOME:   'bg-green-100 text-green-700',
  EXPENSE:  'bg-red-100 text-red-700',
  ADMIN:    'bg-purple-100 text-purple-700',
  ANALYST:  'bg-blue-100 text-blue-700',
  VIEWER:   'bg-gray-100 text-gray-600',
  ACTIVE:   'bg-green-100 text-green-700',
  INACTIVE: 'bg-red-100 text-red-600',
};

const Badge = ({ label }) => (
  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${variants[label] || 'bg-gray-100 text-gray-600'}`}>
    {label}
  </span>
);

export default Badge;