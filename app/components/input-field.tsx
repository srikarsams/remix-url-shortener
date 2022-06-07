type InputFieldProps = {
  name: string;
  type: string;
  placeholder: string;
  value?: string;
  error?: string;
};

export default function InputField({
  name,
  type = 'text',
  placeholder,
  value = '',
  error = '',
}: InputFieldProps) {
  return (
    <div className="mb-5 w-full">
      <input
        className={`py-1 px-2 rounded-md text-lg w-full border-2 border-gray-400 ${
          error ? 'border-red-500' : ''
        }`}
        type={type}
        name={name}
        defaultValue={value}
        placeholder={placeholder}
        aria-invalid={Boolean(error) || undefined}
      />
      {error ? (
        <p className="text-xs text-red-500" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
