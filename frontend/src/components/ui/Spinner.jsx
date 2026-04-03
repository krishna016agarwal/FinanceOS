const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-10 h-10' };

const Spinner = ({ size = 'md' }) => (
  <div className={`${sizes[size]} border-2 border-gray-200 border-t-primary-600 rounded-full animate-spin`} />
);

export default Spinner;