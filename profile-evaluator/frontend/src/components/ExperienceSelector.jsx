export default function ExperienceSelector({ experienceRange, setExperienceRange, ranges, disabled }) {
  return (
    <div className="field-block">
      <label className="field-label" htmlFor="experience-select">
        02 — Years of experience (for question generation)
      </label>
      <select
        id="experience-select"
        className="role-input"
        value={experienceRange}
        disabled={disabled}
        onChange={(e) => setExperienceRange(e.target.value)}
      >
        <option value="" disabled>
          Select an experience range…
        </option>
        {ranges.map((r) => (
          <option key={r} value={r}>
            {r}
          </option>
        ))}
      </select>
      <p className="field-hint">Used only for the standalone question generator below — lower ranges get easier questions, higher ranges get harder ones.</p>
    </div>
  )
}
