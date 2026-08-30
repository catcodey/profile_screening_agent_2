import React from 'react'

export default function RequiredSkillsInput({ skills, setSkills, disabled }) {
  return (
    <div className="field-block">
      <label className="field-label" htmlFor="skills-input">
        03 — Required / Target skills <span className="optional-tag">(Optional)</span>
      </label>
      <input
        id="skills-input"
        type="text"
        className="role-input"
        placeholder="e.g. Python, React, PyTorch, AWS, Docker"
        value={skills}
        onChange={(e) => setSkills(e.target.value)}
        disabled={disabled}
      />
      <p className="field-hint">
        Custom skills to specifically weight during profile scoring or focus on during question generation.
      </p>
    </div>
  )
}