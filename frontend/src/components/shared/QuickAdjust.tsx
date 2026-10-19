import './ReadOnlyFields.css'
export function QuickAdjust({ unit, onMinus, onPlus, minusDisabled, plusDisabled }: { unit: string; onMinus: () => void; onPlus: () => void; minusDisabled?: boolean; plusDisabled?: boolean }) {
  return <div className="quick-adjust"><button type="button" onClick={onMinus} disabled={minusDisabled}>−{unit}</button><button type="button" onClick={onPlus} disabled={plusDisabled}>+{unit}</button></div>
}
