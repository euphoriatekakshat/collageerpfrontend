import React from 'react';
import { Loader2, X, AlertTriangle, CheckCircle, Info, XCircle } from 'lucide-react';

/* ─────────────── BUTTON ─────────────── */
export function Button({
  children, onClick, type = 'button', variant = 'primary',
  size = 'md', loading = false, disabled = false, className = '', icon: Icon
}) {
  const base = 'inline-flex items-center justify-center gap-2 font-semibold rounded-lg transition-all focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700 focus:ring-blue-500 shadow-sm',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-300',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700 focus:ring-emerald-500',
    ghost: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-200',
    warning: 'bg-amber-500 text-white hover:bg-amber-600 focus:ring-amber-400',
  };
  const sizes = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-5 py-2.5 text-base',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled || loading}
      className={`${base} ${variants[variant]} ${sizes[size]} ${className}`}>
      {loading ? <Loader2 size={14} className="animate-spin" /> : Icon ? <Icon size={14} /> : null}
      {children}
    </button>
  );
}

/* ─────────────── INPUT ─────────────── */
export function Input({
  label, error, hint, type = 'text', required = false,
  prefix, suffix, className = '', ...props
}) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <div className="relative flex items-center">
        {prefix && <span className="absolute left-3 text-gray-400 text-sm">{prefix}</span>}
        <input
          type={type}
          className={`w-full border rounded-lg bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400
            focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
            disabled:bg-gray-50 disabled:cursor-not-allowed
            ${error ? 'border-red-400 focus:ring-red-400' : 'border-gray-300'}
            ${prefix ? 'pl-8' : ''} ${suffix ? 'pr-8' : ''}`}
          {...props}
        />
        {suffix && <span className="absolute right-3 text-gray-400 text-sm">{suffix}</span>}
      </div>
      {error && <p className="text-xs text-red-500 flex items-center gap-1"><XCircle size={11} />{error}</p>}
      {hint && !error && <p className="text-xs text-gray-400">{hint}</p>}
    </div>
  );
}

/* ─────────────── SELECT ─────────────── */
export function Select({ label, error, required = false, className = '', children, ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <select
        className={`w-full border rounded-lg bg-white px-3 py-2 text-sm text-gray-900
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition
          disabled:bg-gray-50 disabled:cursor-not-allowed
          ${error ? 'border-red-400' : 'border-gray-300'}`}
        {...props}
      >
        {children}
      </select>
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─────────────── TEXTAREA ─────────────── */
export function Textarea({ label, error, required = false, rows = 3, className = '', ...props }) {
  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
      )}
      <textarea
        rows={rows}
        className={`w-full border rounded-lg bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition resize-none
          ${error ? 'border-red-400' : 'border-gray-300'}`}
        {...props}
      />
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  );
}

/* ─────────────── BADGE ─────────────── */
export function Badge({ children, variant = 'default', size = 'sm' }) {
  const variants = {
    default: 'bg-gray-100 text-gray-700',
    primary: 'bg-blue-100 text-blue-800',
    success: 'bg-emerald-100 text-emerald-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    purple: 'bg-purple-100 text-purple-800',
    teal: 'bg-teal-100 text-teal-800',
    orange: 'bg-orange-100 text-orange-800',
    pink: 'bg-pink-100 text-pink-800',
  };
  const sizes = { xs: 'px-1.5 py-0.5 text-xs', sm: 'px-2 py-0.5 text-xs', md: 'px-2.5 py-1 text-sm' };
  return (
    <span className={`inline-flex items-center rounded-full font-medium ${variants[variant]} ${sizes[size]}`}>
      {children}
    </span>
  );
}

/* ─────────────── CARD ─────────────── */
export function Card({ children, className = '', padding = true }) {
  return (
    <div className={`bg-white rounded-xl border border-gray-200 shadow-sm ${padding ? 'p-6' : ''} ${className}`}>
      {children}
    </div>
  );
}

/* ─────────────── STAT CARD ─────────────── */
export function StatCard({ title, value, subtitle, icon: Icon, color = 'blue', trend, loading }) {
  const colors = {
    blue: { bg: 'bg-blue-50', icon: 'bg-blue-600', text: 'text-blue-700' },
    green: { bg: 'bg-emerald-50', icon: 'bg-emerald-600', text: 'text-emerald-700' },
    orange: { bg: 'bg-orange-50', icon: 'bg-orange-600', text: 'text-orange-700' },
    purple: { bg: 'bg-purple-50', icon: 'bg-purple-600', text: 'text-purple-700' },
    red: { bg: 'bg-red-50', icon: 'bg-red-600', text: 'text-red-700' },
    teal: { bg: 'bg-teal-50', icon: 'bg-teal-600', text: 'text-teal-700' },
  };
  const c = colors[color];
  return (
    <Card className={c.bg + ' border-0'}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500 mb-1">{title}</p>
          {loading
            ? <div className="h-8 w-20 bg-gray-200 animate-pulse rounded" />
            : <p className={`text-3xl font-extrabold ${c.text} leading-none`}>{value}</p>}
          {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
          {trend && (
            <p className={`text-xs mt-1 font-medium ${trend.up ? 'text-emerald-600' : 'text-red-500'}`}>
              {trend.up ? '↑' : '↓'} {trend.value}
            </p>
          )}
        </div>
        {Icon && (
          <div className={`w-12 h-12 rounded-xl ${c.icon} flex items-center justify-center flex-shrink-0`}>
            <Icon size={24} className="text-white" />
          </div>
        )}
      </div>
    </Card>
  );
}

/* ─────────────── SPINNER ─────────────── */
export function Spinner({ size = 'md', className = '' }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
  return (
    <div className={`${sizes[size]} border-2 border-blue-200 border-t-blue-600 rounded-full animate-spin ${className}`} />
  );
}

export function PageLoader() {
  return (
    <div className="flex items-center justify-center h-64">
      <div className="text-center space-y-3">
        <Spinner size="lg" className="mx-auto" />
        <p className="text-sm text-gray-400">Loading...</p>
      </div>
    </div>
  );
}

/* ─────────────── TABLE ─────────────── */
export function Table({ columns, data, loading, emptyText = 'No data found' }) {
  if (loading) return <PageLoader />;
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50">
            {columns.map((col, i) => (
              <th key={i} className={`px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider ${col.className || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {data?.length === 0 ? (
            <tr>
              <td colSpan={columns.length} className="px-4 py-12 text-center text-gray-400">
                <div className="flex flex-col items-center gap-2">
                  <Info size={32} className="text-gray-300" />
                  <span>{emptyText}</span>
                </div>
              </td>
            </tr>
          ) : (
            data?.map((row, i) => (
              <tr key={row._id || i} className="hover:bg-gray-50 transition-colors">
                {columns.map((col, j) => (
                  <td key={j} className={`px-4 py-3 text-gray-700 ${col.cellClass || ''}`}>
                    {col.render ? col.render(row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}

/* ─────────────── MODAL ─────────────── */
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null;
  const sizes = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-4xl' };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative bg-white rounded-2xl shadow-2xl w-full ${sizes[size]} max-h-[90vh] overflow-hidden flex flex-col`}>
        {title && (
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
            <h3 className="text-base font-bold text-gray-900">{title}</h3>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
              <X size={20} />
            </button>
          </div>
        )}
        <div className="overflow-y-auto flex-1">{children}</div>
      </div>
    </div>
  );
}

/* ─────────────── CONFIRM DIALOG ─────────────── */
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  return (
    <Modal open={open} onClose={onClose} title={title} size="sm">
      <div className="p-6 space-y-4">
        <div className="flex items-start gap-3">
          <AlertTriangle size={20} className="text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-gray-600">{message}</p>
        </div>
        <div className="flex justify-end gap-3">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>Confirm</Button>
        </div>
      </div>
    </Modal>
  );
}

/* ─────────────── PAGE HEADER ─────────────── */
export function PageHeader({ title, subtitle, actions, breadcrumb }) {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4">
      {breadcrumb && <p className="text-xs text-gray-400 mb-1">{breadcrumb}</p>}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900 leading-tight">{title}</h1>
          {subtitle && <p className="text-sm text-gray-500 mt-0.5">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-3 flex-shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

/* ─────────────── SEARCH BAR ─────────────── */
export function SearchBar({ value, onChange, placeholder = 'Search...', className = '' }) {
  return (
    <div className={`relative ${className}`}>
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
        <svg width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
          <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
        </svg>
      </span>
      <input
        type="text" value={value} onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-9 pr-4 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />
    </div>
  );
}

/* ─────────────── AVATAR ─────────────── */
export function Avatar({ name = '', size = 'md', color = 'blue' }) {
  const initials = name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const sizes = { xs: 'w-6 h-6 text-xs', sm: 'w-8 h-8 text-xs', md: 'w-10 h-10 text-sm', lg: 'w-12 h-12 text-base' };
  const colors = {
    blue: 'bg-blue-600', green: 'bg-emerald-600', purple: 'bg-purple-600',
    orange: 'bg-orange-500', teal: 'bg-teal-600', pink: 'bg-pink-600',
  };
  return (
    <div className={`${sizes[size]} ${colors[color]} rounded-full flex items-center justify-center text-white font-bold flex-shrink-0`}>
      {initials}
    </div>
  );
}

/* ─────────────── ALERT ─────────────── */
export function Alert({ type = 'info', title, message, onClose }) {
  const config = {
    info: { bg: 'bg-blue-50 border-blue-200', icon: Info, text: 'text-blue-800', iconColor: 'text-blue-500' },
    success: { bg: 'bg-emerald-50 border-emerald-200', icon: CheckCircle, text: 'text-emerald-800', iconColor: 'text-emerald-500' },
    warning: { bg: 'bg-amber-50 border-amber-200', icon: AlertTriangle, text: 'text-amber-800', iconColor: 'text-amber-500' },
    error: { bg: 'bg-red-50 border-red-200', icon: XCircle, text: 'text-red-800', iconColor: 'text-red-500' },
  };
  const c = config[type];
  return (
    <div className={`flex items-start gap-3 p-4 rounded-lg border ${c.bg}`}>
      <c.icon size={16} className={`${c.iconColor} flex-shrink-0 mt-0.5`} />
      <div className="flex-1 min-w-0">
        {title && <p className={`text-sm font-semibold ${c.text}`}>{title}</p>}
        {message && <p className={`text-sm ${c.text} ${title ? 'mt-0.5' : ''}`}>{message}</p>}
      </div>
      {onClose && <button onClick={onClose} className={`${c.iconColor} hover:opacity-70`}><X size={14} /></button>}
    </div>
  );
}

/* ─────────────── PAGINATION ─────────────── */
export function Pagination({ page, totalPages, onPageChange }) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 border-t border-gray-200">
      <p className="text-sm text-gray-500">Page {page} of {totalPages}</p>
      <div className="flex gap-2">
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page - 1)} disabled={page === 1}>← Prev</Button>
        <Button variant="secondary" size="sm" onClick={() => onPageChange(page + 1)} disabled={page === totalPages}>Next →</Button>
      </div>
    </div>
  );
}

/* ─────────────── PROGRESS BAR ─────────────── */
export function ProgressBar({ value, max = 100, color = 'blue', showLabel = true }) {
  const pct = Math.min(Math.round((value / max) * 100), 100);
  const colors = {
    blue: 'bg-blue-500', green: 'bg-emerald-500',
    red: 'bg-red-500', yellow: 'bg-amber-400', purple: 'bg-purple-500',
  };
  const auto = pct >= 85 ? 'green' : pct >= 75 ? 'yellow' : 'red';
  const c = colors[color === 'auto' ? auto : color];
  return (
    <div className="space-y-1">
      <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
        <div className={`h-full rounded-full transition-all ${c}`} style={{ width: `${pct}%` }} />
      </div>
      {showLabel && <p className="text-xs text-gray-500">{pct}%</p>}
    </div>
  );
}

/* ─────────────── STATUS DOT ─────────────── */
export function StatusDot({ active = true }) {
  return (
    <span className={`inline-block w-2 h-2 rounded-full ${active ? 'bg-emerald-500' : 'bg-gray-300'}`} />
  );
}

/* ─────────────── EMPTY STATE ─────────────── */
export function EmptyState({ icon: Icon, title, subtitle, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {Icon && <Icon size={48} className="text-gray-300 mb-4" strokeWidth={1} />}
      <h3 className="text-base font-semibold text-gray-700 mb-1">{title}</h3>
      {subtitle && <p className="text-sm text-gray-400 mb-4">{subtitle}</p>}
      {action}
    </div>
  );
}