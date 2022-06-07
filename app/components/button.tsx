type ButtonProps = {
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
};

export default function Button({
  children,
  onClick = () => {},
  type = 'button',
}: ButtonProps) {
  return (
    <button
      className="mt-4 py-2 px-3 rounded-md bg-black text-white text-xl font-semibold"
      onClick={onClick}
      type={type}
    >
      {children}
    </button>
  );
}
