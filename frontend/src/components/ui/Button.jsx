import Spinner from './Spinner';

const variants = {
  primary:   'bg-primary-600 text-white hover:bg-primary-700 disabled:bg-primary-300',
  secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50',
  danger:    'bg-red-600 text-white hover:bg-red-700',
  ghost:     'text-gray-600 hover:bg-gray-100',
};

const sizes = {
  sm: 'px-3 py-1.5 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-5 py-2.5 text-base',
};

const Button = ({
  children, variant = 'primary', size = 'md',
  loading, className = '', ...props
}) => (
  <button
    className={`inline-flex items-center justify-center gap-2 font-medium rounded-lg
      transition-colors disabled:cursor-not-allowed
      ${variants[variant]} ${sizes[size]} ${className}`}
    disabled={loading || props.disabled}
    {...props}
  >
    {loading && <Spinner size="sm" />}
    {children}
  </button>
);

export default Button;