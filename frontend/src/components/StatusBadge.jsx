const LABELS = {
  cpi: { ahead: '✓ Eficiente', behind: '✗ Ineficiente' },
  spi: { ahead: '✓ Adelantado', behind: '✗ Atrasado' },
}

const ON_TARGET = '= En objetivo'
const NO_DATA = '— Sin datos'


export default function StatusBadge({ value, kind }) {
  const baseClasses = 'px-2 py-1 rounded text-xs font-medium whitespace-nowrap'

  if (value === null || value === undefined) {
    return <span className={`${baseClasses} bg-ink-200 text-ink-700`}>{NO_DATA}</span>
  }

  if (value > 1) {
    return (
      <span className={`${baseClasses} bg-green-100 text-green-800`}>
        {LABELS[kind].ahead}
      </span>
    )
  }

  if (value === 1) {
    return (
      <span className={`${baseClasses} bg-pulse-100 text-pulse-800`}>
        {ON_TARGET}
      </span>
    )
  }

  return (
    <span className={`${baseClasses} bg-red-100 text-red-800`}>
      {LABELS[kind].behind}
    </span>
  )
}
