const Input = ({ label, error, className = '', ...props }) => (
  <div className="space-y-1">
    {label && <label className="block text-sm font-medium text-gray-700">{label}</label>}
    <input
      className={`w-full px-3 py-2 text-sm border rounded-lg outline-none transition-colors
        ${error
          ? 'border-red-300 focus:border-red-500 focus:ring-1 focus:ring-red-500'
          : 'border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500'}
        disabled:bg-gray-50 disabled:text-gray-500 ${className}`}
      {...props}
    />
    {error && <p className="text-xs text-red-600">{error}</p>}
  </div>
);

export default Input;