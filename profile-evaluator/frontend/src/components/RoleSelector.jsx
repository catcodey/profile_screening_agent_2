export default function RoleSelector({ role, setRole, roles, disabled }) {
  return (
    <div className="field-block">
      <label className="field-label" htmlFor="role-input">
        01 — Target role
      </label>
      <input
        id="role-input"
        className="role-input"
        list="role-options"
        placeholder="Select from the list or type a custom role…"
        value={role}
        disabled={disabled}
        onChange={(e) => setRole(e.target.value)}
        autoComplete="off"
      />
      <datalist id="role-options">
        {roles.map((r) => (
          <option key={r} value={r} />
        ))}
      </datalist>
      <p className="field-hint">Start typing to search, or pick one of {roles.length} common roles.</p>
    </div>
  )
}
