import React from 'react';

import { cn } from '@/lib/utils';

type ButtonProps = {
  onClick?: (e: React.MouseEvent) => void;
  type?: 'submit' | 'button';
  children: React.ReactNode;
  className?: string;
  disabled?: boolean;
};

const Button = ({
  onClick,
  type,
  children,
  className = '',
  disabled = false,
  ...rest
}: ButtonProps) => {
  return (
    <button
      type={type === 'submit' ? 'submit' : 'button'} // if type is submit, then type is submit, else type is button
      disabled={disabled}
      onClick={onClick}
      className={cn(
        `bg-customPrimary text-sm text-white rounded-md px-5 py-2 border-[0.5px] font-bold transition-all ease-linear duration-250 hover:bg-white hover:border-customPrimary hover:text-customPrimary md:text-lg disabled:opacity-50 disabled:cursor-not-allowed`,
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button;
