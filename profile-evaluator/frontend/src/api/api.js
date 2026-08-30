import axios from 'axios'

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: API_BASE,
  timeout: 45000,
})

export async function fetchRoles() {
  const { data } = await client.get('/api/roles')
  return data.roles
}

export async function fetchExperienceRanges() {
  const { data } = await client.get('/api/experience-ranges')
  return data.experience_ranges
}

export async function generateQuestions(role, experienceRange, skills) {
  const form = new FormData()
  form.append('role', role)
  form.append('experience_range', experienceRange)
  form.append('skills', skills || '')

  try {
    const { data } = await client.post('/api/generate-questions', form)
    return data
  } catch (err) {
    const detail =
      err.response?.data?.detail ||
      (err.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : 'Something went wrong while generating questions.')
    throw new Error(detail)
  }
}

export async function evaluateProfile(role, file, skills, onUploadProgress) {
  const form = new FormData()
  form.append('role', role)
  form.append('file', file)
  form.append('skills', skills || '')

  try {
    const { data } = await client.post('/api/evaluate', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
      onUploadProgress,
    })
    return data
  } catch (err) {
    const detail =
      err.response?.data?.detail ||
      (err.code === 'ECONNABORTED'
        ? 'The request timed out. Please try again.'
        : 'Something went wrong while evaluating this profile.')
    throw new Error(detail)
  }
}

export async function fetchDashboardStats() {
  const { data } = await client.get('/api/dashboard/stats')
  return data
}

export async function fetchDashboardEvaluations(limit = 200) {
  const { data } = await client.get('/api/dashboard/evaluations', { params: { limit } })
  return data.evaluations
}

export async function fetchRoleDistribution() {
  const { data } = await client.get('/api/dashboard/role-distribution')
  return data.role_distribution
}