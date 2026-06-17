import * as React from 'react';

type ButtonVariant = 'default' | 'hero' | 'heroSecondary';
type ButtonSize = 'default' | 'sm';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
};

const variantClasses: Record<ButtonVariant, string> = {
  default: 'bg-primary text-primary-foreground rounded-xl px-4 py-2 font-medium hover:opacity-90',
  hero: 'bg-primary text-primary-foreground rounded-full px-6 py-3 text-base font-medium hover:bg-primary/90',
  heroSecondary: 'liquid-glass text-foreground rounded-full px-6 py-3 text-base font-normal hover:bg-white/5'
};

const sizeClasses: Record<ButtonSize, string> = {
  default: '',
  sm: 'px-4 py-2 text-sm'
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = '', variant = 'default', size = 'default', type = 'button', ...props }, ref) => (
    <button
      ref={ref}
      type={type}
      className={`${variantClasses[variant]} ${sizeClasses[size]} transition-all duration-300 ${className}`.trim()}
      {...props}
    />
  )
);

Button.displayName = 'Button';
