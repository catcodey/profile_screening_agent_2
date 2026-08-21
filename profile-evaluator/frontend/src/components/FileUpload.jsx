import { useRef, useState } from 'react'

const ALLOWED_EXT = ['pdf', 'docx', 'txt']
const MAX_MB = 5

export default function FileUpload({ file, setFile, disabled, error, setError }) {
  const inputRef = useRef(null)
  const [dragActive, setDragActive] = useState(false)

  function validate(f) {
    const ext = f.name.split('.').pop().toLowerCase()
    if (!ALLOWED_EXT.includes(ext)) {
      return `Unsupported file type ".${ext}". Please upload a PDF, DOCX, or TXT file.`
    }
    if (f.size > MAX_MB * 1024 * 1024) {
      return `File is too large (${(f.size / (1024 * 1024)).toFixed(1)}MB). Max size is ${MAX_MB}MB.`
    }
    return null
  }

  function handleFiles(fileList) {
    const f = fileList?.[0]
    if (!f) return
    const err = validate(f)
    if (err) {
      setError(err)
      setFile(null)
      return
    }
    setError(null)
    setFile(f)
  }

  return (
    <div className="field-block">
      <label className="field-label">03 — Candidate profile</label>
      <div
        className={`dropzone ${dragActive ? 'dropzone-active' : ''} ${file ? 'dropzone-filled' : ''}`}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setDragActive(true)
        }}
        onDragLeave={() => setDragActive(false)}
        onDrop={(e) => {
          e.preventDefault()
          setDragActive(false)
          if (!disabled) handleFiles(e.dataTransfer.files)
        }}
        onClick={() => !disabled && inputRef.current?.click()}
      >
        <input
          ref={inputRef}
          type="file"
          hidden
          accept=".pdf,.docx,.txt"
          disabled={disabled}
          onChange={(e) => handleFiles(e.target.files)}
        />
        {file ? (
          <div className="dropzone-file">
            <span className="dropzone-file-icon">✓</span>
            <div>
              <p className="dropzone-file-name">{file.name}</p>
              <p className="dropzone-file-meta">{(file.size / 1024).toFixed(0)} KB</p>
            </div>
            <button
              type="button"
              className="dropzone-clear"
              disabled={disabled}
              onClick={(e) => {
                e.stopPropagation()
                setFile(null)
                if (inputRef.current) inputRef.current.value = ''
              }}
            >
              Remove
            </button>
          </div>
        ) : (
          <>
            <p className="dropzone-title">Drag & drop the profile here</p>
            <p className="dropzone-sub">or click to browse — PDF, DOCX, TXT · max {MAX_MB}MB</p>
          </>
        )}
      </div>
      {error && <p className="field-error">{error}</p>}
    </div>
  )
}
