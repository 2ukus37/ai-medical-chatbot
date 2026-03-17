import React from 'react'

export const Button = ({ 
  title = 'Button', 
  onClick, 
  variant = 'primary',
  icon,
  className = '',
  disabled = false,
  type = 'button'
}) => {
  const baseStyles = 'inline-flex items-center justify-center gap-2 px-6 py-2.5 rounded-lg font-bold transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed'
  
  const variants = {
    primary: 'bg-primary text-white hover:bg-primary/90 shadow-lg shadow-primary/20',
    secondary: 'bg-primary/10 text-primary hover:bg-primary/20',
    outline: 'border-2 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800',
    ghost: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
  }

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`${baseStyles} ${variants[variant]} ${className}`}
    >
      {icon && <span className="material-symbols-outlined text-lg">{icon}</span>}
      {title}
    </button>
  )
}

export default Button
