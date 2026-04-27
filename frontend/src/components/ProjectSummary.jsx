import StatusBadge from './StatusBadge.jsx'


function SummaryCard({ title, subtitle, value, interpretation, kind }) {
  const display = value === null || value === undefined ? '—' : value.toFixed(3)

  return (
    <div className="bg-white rounded-lg border border-ink-200 p-5 shadow-sm">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="text-sm uppercase tracking-wider text-ink-500">{title}</h3>
          <p className="text-xs text-ink-500 mt-0.5">{subtitle}</p>
        </div>
        <StatusBadge value={value} kind={kind} />
      </div>
      <p className="text-3xl font-bold text-ink-900 mb-2">{display}</p>
      <p className="text-sm text-ink-700">{interpretation}</p>
    </div>
  )
}


export default function ProjectSummary({ indicators }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SummaryCard
        title="CPI"
        subtitle="Cost Performance Index"
        value={indicators.cpi}
        interpretation={indicators.cpi_interpretation}
        kind="cpi"
      />
      <SummaryCard
        title="SPI"
        subtitle="Schedule Performance Index"
        value={indicators.spi}
        interpretation={indicators.spi_interpretation}
        kind="spi"
      />
    </div>
  )
}
