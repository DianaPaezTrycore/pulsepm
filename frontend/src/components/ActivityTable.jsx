const numFmt = (value) => {
  if (value === null || value === undefined) return '—'
  return Number(value).toLocaleString('es-CO', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  })
}


const ratioFmt = (value) => {
  if (value === null || value === undefined) return '—'
  return Number(value).toFixed(3)
}


const COLUMNS = [
  { key: 'name', label: 'Nombre', align: 'left' },
  { key: 'bac', label: 'BAC', align: 'right' },
  { key: 'planned_progress', label: '%Plan', align: 'right' },
  { key: 'actual_progress', label: '%Real', align: 'right' },
  { key: 'actual_cost', label: 'AC', align: 'right' },
  { key: 'pv', label: 'PV', align: 'right' },
  { key: 'ev', label: 'EV', align: 'right' },
  { key: 'cv', label: 'CV', align: 'right' },
  { key: 'sv', label: 'SV', align: 'right' },
  { key: 'cpi', label: 'CPI', align: 'right' },
  { key: 'spi', label: 'SPI', align: 'right' },
]


export default function ActivityTable({ activities, totals }) {
  return (
    <div className="overflow-x-auto bg-white rounded-lg border border-ink-200 shadow-sm">
      <table className="w-full text-sm">
        <thead className="bg-ink-100 text-ink-700">
          <tr>
            {COLUMNS.map((col) => (
              <th
                key={col.key}
                className={`px-3 py-2 ${col.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {activities.length === 0 ? (
            <tr>
              <td
                colSpan={COLUMNS.length}
                className="px-3 py-8 text-center text-ink-500 italic"
              >
                Sin actividades. Agrega la primera para empezar a calcular EVM.
              </td>
            </tr>
          ) : (
            activities.map((activity) => (
              <tr key={activity.id} className="border-t border-ink-100 hover:bg-ink-50">
                <td className="px-3 py-2">{activity.name}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.bac)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.planned_progress)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.actual_progress)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.actual_cost)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.indicators.pv)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.indicators.ev)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.indicators.cv)}</td>
                <td className="px-3 py-2 text-right">{numFmt(activity.indicators.sv)}</td>
                <td className="px-3 py-2 text-right">{ratioFmt(activity.indicators.cpi)}</td>
                <td className="px-3 py-2 text-right">{ratioFmt(activity.indicators.spi)}</td>
              </tr>
            ))
          )}
        </tbody>
        {activities.length > 0 && (
          <tfoot className="bg-ink-100 font-semibold text-ink-900 border-t-2 border-ink-300">
            <tr>
              <td className="px-3 py-2">Totales</td>
              <td className="px-3 py-2 text-right">—</td>
              <td className="px-3 py-2 text-right">—</td>
              <td className="px-3 py-2 text-right">—</td>
              <td className="px-3 py-2 text-right">—</td>
              <td className="px-3 py-2 text-right">{numFmt(totals.pv)}</td>
              <td className="px-3 py-2 text-right">{numFmt(totals.ev)}</td>
              <td className="px-3 py-2 text-right">{numFmt(totals.cv)}</td>
              <td className="px-3 py-2 text-right">{numFmt(totals.sv)}</td>
              <td className="px-3 py-2 text-right">{ratioFmt(totals.cpi)}</td>
              <td className="px-3 py-2 text-right">{ratioFmt(totals.spi)}</td>
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  )
}
