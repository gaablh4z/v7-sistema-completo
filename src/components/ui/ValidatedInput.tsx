import React, { useState, useEffect } from 'react';
import { Input } from './input';
import { Label } from './label';
import { cn } from '@/lib/utils';
import { Eye, EyeOff, CheckCircle, XCircle, AlertCircle } from 'lucide-react';

interface ValidatedInputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'onChange'> {
  label: string;
  error?: string;
  success?: boolean;
  validator?: (value: string) => { isValid: boolean; errors: string[] };
  onChange: (value: string) => void;
  showPasswordToggle?: boolean;
  strengthMeter?: boolean;
  helperText?: string;
}

export function ValidatedInput({
  label,
  error,
  success,
  validator,
  onChange,
  showPasswordToggle = false,
  strengthMeter = false,
  helperText,
  type = 'text',
  className,
  ...props
}: ValidatedInputProps) {
  const [value, setValue] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [validation, setValidation] = useState<{ isValid: boolean; errors: string[] }>({ isValid: true, errors: [] });
  const [passwordStrength, setPasswordStrength] = useState<{ score: number; label: string; color: string } | null>(null);
  const [touched, setTouched] = useState(false);

  const inputType = showPasswordToggle ? (showPassword ? 'text' : 'password') : type;

  useEffect(() => {
    if (validator && touched) {
      const result = validator(value);
      setValidation(result);
    }

    // Calcular força da senha se necessário
    if (strengthMeter && type === 'password') {
      import('@/lib/authUtils').then(({ PasswordValidator }) => {
        setPasswordStrength(PasswordValidator.getStrength(value));
      });
    }
  }, [value, validator, touched, strengthMeter, type]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setValue(newValue);
    onChange(newValue);
  };

  const handleBlur = () => {
    setTouched(true);
  };

  const hasError = touched && (!validation.isValid || error);
  const hasSuccess = touched && validation.isValid && !error && success;

  return (
    <div className="space-y-2">
      <Label htmlFor={props.id} className="text-sm font-medium">
        {label}
      </Label>
      
      <div className="relative">
        <Input
          {...props}
          type={inputType}
          value={value}
          onChange={handleChange}
          onBlur={handleBlur}
          className={cn(
            "pr-10",
            hasError && "border-red-500 focus:border-red-500 focus:ring-red-500",
            hasSuccess && "border-green-500 focus:border-green-500 focus:ring-green-500",
            className
          )}
        />
        
        {/* Ícones de status */}
        <div className="absolute inset-y-0 right-0 flex items-center pr-3">
          {showPasswordToggle && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="p-1 hover:bg-gray-100 rounded mr-1"
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4 text-gray-400" />
              ) : (
                <Eye className="h-4 w-4 text-gray-400" />
              )}
            </button>
          )}
          
          {touched && !showPasswordToggle && (
            <>
              {hasError && <XCircle className="h-4 w-4 text-red-500" />}
              {hasSuccess && <CheckCircle className="h-4 w-4 text-green-500" />}
              {!hasError && !hasSuccess && validation.errors.length > 0 && (
                <AlertCircle className="h-4 w-4 text-yellow-500" />
              )}
            </>
          )}
        </div>
      </div>

      {/* Medidor de força da senha */}
      {strengthMeter && passwordStrength && value && (
        <div className="space-y-1">
          <div className="flex justify-between text-xs">
            <span>Força da senha:</span>
            <span style={{ color: passwordStrength.color }} className="font-medium">
              {passwordStrength.label}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="h-2 rounded-full transition-all duration-300"
              style={{
                width: `${(passwordStrength.score / 4) * 100}%`,
                backgroundColor: passwordStrength.color
              }}
            />
          </div>
        </div>
      )}

      {/* Mensagens de erro/ajuda */}
      {touched && validation.errors.length > 0 && (
        <div className="space-y-1">
          {validation.errors.map((errorMsg, index) => (
            <p key={index} className="text-xs text-red-600 flex items-center gap-1">
              <XCircle className="h-3 w-3" />
              {errorMsg}
            </p>
          ))}
        </div>
      )}

      {error && (
        <p className="text-xs text-red-600 flex items-center gap-1">
          <XCircle className="h-3 w-3" />
          {error}
        </p>
      )}

      {helperText && !hasError && (
        <p className="text-xs text-gray-500">{helperText}</p>
      )}

      {hasSuccess && (
        <p className="text-xs text-green-600 flex items-center gap-1">
          <CheckCircle className="h-3 w-3" />
          Válido!
        </p>
      )}
    </div>
  );
}
