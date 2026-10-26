import React, { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router'
import { useInterview } from '../hooks/useInterview.js'
import { useAuth } from '../../auth/hooks/useAuth.js'
import { getInterviewReportById, getPreparationProgress, updatePreparationProgress } from '../services/interview.api.js'
import '../style/home.scss'

const QUESTION_BANK = [
  { category: 'Technical', difficulty: 'Easy', skill: 'JavaScript', question: 'Explain the difference between let, const, and var.', followUp: 'When might a closure be useful in a real application?' },
  { category: 'Technical', difficulty: 'Medium', skill: 'JavaScript', question: 'What is a closure, and how can it affect memory usage?', followUp: 'How would you avoid retaining unnecessary references?' },
  { category: 'Technical', difficulty: 'Medium', skill: 'React', question: 'How do React state updates and re-renders work?', followUp: 'How would you investigate an avoidable re-render?' },
  { category: 'Technical', difficulty: 'Hard', skill: 'React', question: 'Design a strategy for caching API data in a large React application.', followUp: 'How would you handle invalidation and stale data?' },
  { category: 'Technical', difficulty: 'Easy', skill: 'Node.js', question: 'What is the role of the event loop in Node.js?', followUp: 'What work should not run synchronously on the event loop?' },
  { category: 'Technical', difficulty: 'Medium', skill: 'APIs', question: 'How would you design a secure REST endpoint for user-owned resources?', followUp: 'Where should ownership checks happen?' },
  { category: 'Technical', difficulty: 'Hard', skill: 'System design', question: 'Design an interview-practice platform that supports thousands of concurrent users.', followUp: 'Where would you add queues, caching, and rate limits?' },
  { category: 'Technical', difficulty: 'Medium', skill: 'Databases', question: 'When would you choose an index, and what trade-offs does it introduce?', followUp: 'How would you confirm an index improves a slow query?' },
  { category: 'Behavioral', difficulty: 'Easy', skill: 'Communication', question: 'Tell me about a technical concept you had to explain to a non-technical person.', followUp: 'How did you check that they understood?' },
  { category: 'Behavioral', difficulty: 'Medium', skill: 'Problem solving', question: 'Describe a difficult bug you investigated and how you narrowed down its cause.', followUp: 'What would you do differently next time?' },
  { category: 'Behavioral', difficulty: 'Medium', skill: 'Teamwork', question: 'Tell me about a disagreement with a teammate and how you resolved it.', followUp: 'What did you learn about collaboration?' },
  { category: 'Behavioral', difficulty: 'Hard', skill: 'Ownership', question: 'Describe a time you had to deliver with incomplete information and a tight deadline.', followUp: 'How did you manage risk and communicate trade-offs?' },
  { category: 'Technical', difficulty: 'Medium', skill: 'Security', question: 'Explain authentication versus authorization with an example.', followUp: 'How would you prevent one user from accessing another user’s report?' },
  { category: 'Technical', difficulty: 'Easy', skill: 'Data structures', question: 'When would you use a hash map instead of an array?', followUp: 'What are the average and worst-case lookup complexities?' },
]

const NAV = [
  { id: 'overview', label: 'Overview', icon: '◫' },
  { id: 'questions', label: 'Question bank', icon: '⌘' },
  { id: 'tracker', label: 'Preparation tracker', icon: '✓' },
]
const initialForm = { role: '', company: '', jobDescription: '', selfDescription: '', duration: '7' }

function getSkillKeywords(report) {
  const text = `${report?.title || ''} ${(report?.skillGaps || []).map(item => item.skill).join(' ')} ${report?.jobDescription || ''}`.toLowerCase()
  const aliases = {
    React: ['react', 'frontend', 'front-end', 'ui'], JavaScript: ['javascript', 'typescript', 'frontend', 'front-end'],
    'Node.js': ['node', 'backend', 'back-end', 'express'], APIs: ['api', 'backend', 'rest'],
    Databases: ['database', 'sql', 'mongodb', 'postgres', 'data'], Security: ['security', 'auth', 'cyber'],
    'System design': ['system design', 'scalability', 'architecture'], 'Data structures': ['algorithm', 'dsa', 'data structure', 'coding'],
  }
  return Object.entries(aliases).filter(([, terms]) => terms.some(term => text.includes(term))).map(([skill]) => skill)
}

const Home = () => {
  const { loading, generateReport, reports } = useInterview()
  const { handleLogout } = useAuth()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('overview')
  const [form, setForm] = useState(initialForm)
  const [resumeFile, setResumeFile] = useState(null)
  const [formError, setFormError] = useState('')
  const [selectedReportId, setSelectedReportId] = useState('')
  const [selectedReport, setSelectedReport] = useState(null)
  const [completed, setCompleted] = useState([])
  const [progressLoading, setProgressLoading] = useState(false)
  const [difficulty, setDifficulty] = useState('All')
  const [category, setCategory] = useState('All')
  const [questionSearch, setQuestionSearch] = useState('')

  useEffect(() => {
    if (!selectedReportId) { setSelectedReport(null); setCompleted([]); return }
    let alive = true
    setProgressLoading(true)
    Promise.all([getInterviewReportById(selectedReportId), getPreparationProgress(selectedReportId)])
      .then(([reportResponse, progressResponse]) => {
        if (!alive) return
        setSelectedReport(reportResponse.interviewReport)
        setCompleted(progressResponse.completedTasks || [])
      })
      .catch(() => { if (alive) setFormError('Could not load this preparation plan. Please try again.') })
      .finally(() => { if (alive) setProgressLoading(false) })
    return () => { alive = false }
  }, [selectedReportId])

  const updateField = (event) => setForm(current => ({ ...current, [event.target.name]: event.target.value }))
  const handleGenerate = async (event) => {
    event.preventDefault()
    setFormError('')
    if (!form.jobDescription.trim()) return setFormError('Add the job description so the plan can target the role.')
    if (!resumeFile && !form.selfDescription.trim()) return setFormError('Upload a PDF resume or add a short profile description.')
    if (resumeFile && (resumeFile.type !== 'application/pdf' || resumeFile.size > 3 * 1024 * 1024)) return setFormError('Choose a PDF resume smaller than 3 MB.')
    try {
      const data = await generateReport({ jobDescription: `${form.role ? `Target role: ${form.role}\n` : ''}${form.company ? `Company: ${form.company}\n` : ''}${form.jobDescription}`, selfDescription: form.selfDescription, preparationDays: Number(form.duration), resumeFile })
      if (data?._id) navigate(`/interview/${data._id}`)
    } catch (error) { setFormError(error.response?.data?.message || 'Could not create your plan. Check the backend and try again.') }
  }

  const questionSource = useMemo(() => {
    if (!selectedReport || selectedReport._id !== selectedReportId) return QUESTION_BANK
    const aiQuestions = [
      ...(selectedReport.technicalQuestions || []).map(item => ({ ...item, category: 'Technical', difficulty: 'Medium', skill: (selectedReport.skillGaps || [])[0]?.skill || 'Role-specific', followUp: item.intention || 'Explain your reasoning and give a concrete example.', source: 'AI plan' })),
      ...(selectedReport.behavioralQuestions || []).map(item => ({ ...item, category: 'Behavioral', difficulty: 'Medium', skill: 'Role-specific', followUp: item.intention || 'Use a specific situation, action, and result.', source: 'AI plan' }))
    ]
    return [...aiQuestions, ...QUESTION_BANK]
  }, [selectedReport, selectedReportId])

  const filteredQuestions = useMemo(() => questionSource.filter(question => {
    const matchesDifficulty = difficulty === 'All' || question.difficulty === difficulty
    const matchesCategory = category === 'All' || question.category === category
    const query = questionSearch.trim().toLowerCase()
    const matchesSearch = !query || `${question.question} ${question.skill} ${question.category}`.toLowerCase().includes(query)
    return matchesDifficulty && matchesCategory && matchesSearch
  }), [questionSource, difficulty, category, questionSearch])

  const reportForQuestions = selectedReport?._id === selectedReportId ? selectedReport : reports.find(report => report._id === selectedReportId)
  const suggestedSkills = getSkillKeywords(reportForQuestions)
  const recommendedQuestions = filteredQuestions.filter(question => question.source === 'AI plan' || suggestedSkills.length === 0 || suggestedSkills.some(skill => `${question.skill} ${question.question}`.toLowerCase().includes(skill.toLowerCase())))
  const planTasks = (selectedReport?.preparationPlan || []).flatMap(day => (day.tasks || []).map((task, index) => ({ key: `${day.day}:${index}`, day: day.day, focus: day.focus, task })))
  const completedCount = planTasks.filter(task => completed.includes(task.key)).length
  const completionPercent = planTasks.length ? Math.round(completedCount / planTasks.length * 100) : 0

  const toggleTask = async (key, checked) => {
    const next = checked ? [...new Set([...completed, key])] : completed.filter(item => item !== key)
    setCompleted(next)
    try { await updatePreparationProgress(selectedReportId, key, checked) }
    catch { setCompleted(completed); setFormError('Progress could not be saved. Please check your connection and try again.') }
  }

  return <div className="workspace">
    <aside className="workspace-sidebar">
      <a className="brand" href="/" onClick={event => { event.preventDefault(); setActiveTab('overview') }}><span className="brand-mark">P</span><span>PrepPilot<small>INTERVIEW STUDIO</small></span></a>
      <p className="sidebar-label">WORKSPACE</p>
      <nav className="side-nav" aria-label="Main navigation">
        {NAV.map(item => <button key={item.id} className={activeTab === item.id ? 'side-nav-item active' : 'side-nav-item'} onClick={() => setActiveTab(item.id)}><span>{item.icon}</span>{item.label}</button>)}
      </nav>
      <div className="sidebar-bottom"><div className="sidebar-tip"><span className="tip-icon">✦</span><strong>Small steps add up.</strong><p>Practice one question each day and reflect on what you learned.</p></div><button className="sidebar-link" onClick={async () => { await handleLogout(); navigate('/login') }}>Sign out</button></div>
    </aside>

    <main className="workspace-main">
      <header className="workspace-topbar"><div><span className="eyebrow">YOUR CAREER WORKSPACE</span><h1>{activeTab === 'overview' ? 'Prepare with purpose.' : activeTab === 'questions' ? 'Practice question bank' : 'Your preparation tracker'}</h1></div><div className="topbar-actions"><span className="status-dot"/> Your private workspace</div></header>

      {formError && <div className="notice" role="alert"><span>{formError}</span><button onClick={() => setFormError('')} aria-label="Dismiss message">×</button></div>}

      {activeTab === 'overview' && <>
        <section className="welcome-panel"><div className="welcome-copy"><span className="pill">✦ PERSONALIZED PREPARATION</span><h2>Turn your next interview into a plan.</h2><p>Bring a role description and your experience. Get focused questions, skill-gap signals, and a practical roadmap to work through.</p><button className="button-primary" onClick={() => document.getElementById('create-plan')?.scrollIntoView({ behavior: 'smooth' })}>Create an interview plan <span>↗</span></button></div><div className="welcome-art" aria-hidden="true"><div className="art-orbit orbit-one"/><div className="art-orbit orbit-two"/><div className="art-card"><span className="art-card-icon">✦</span><strong>Interview readiness</strong><div className="art-progress"><span/></div><small>Build it one session at a time</small></div><span className="art-star star-one">✳</span><span className="art-star star-two">✦</span></div></section>

        <section className="metric-grid" aria-label="Your preparation at a glance"><article className="metric-card"><span className="metric-icon lavender">▤</span><div><p>Plans created</p><strong>{reports.length}</strong><small>Saved interview plans</small></div></article><article className="metric-card"><span className="metric-icon mint">◎</span><div><p>Average match score</p><strong>{reports.length ? `${Math.round(reports.reduce((sum, report) => sum + (report.matchScore || 0), 0) / reports.length)}%` : '—'}</strong><small>Across generated plans</small></div></article><article className="metric-card"><span className="metric-icon peach">✎</span><div><p>Practice questions</p><strong>{QUESTION_BANK.length}</strong><small>Across multiple difficulty levels</small></div></article></section>

        <section className="content-grid"><div className="surface-card create-card" id="create-plan"><div className="section-heading"><div><span className="eyebrow">START HERE</span><h2>Create a focused plan</h2><p>Tell us what you’re preparing for.</p></div><span className="step-chip">01 / PLAN</span></div>
          <form className="plan-form" onSubmit={handleGenerate}>
            <div className="form-row"><label>Target role<input name="role" value={form.role} onChange={updateField} placeholder="e.g. Software Engineer" maxLength={120}/></label><label>Company <span className="optional">OPTIONAL</span><input name="company" value={form.company} onChange={updateField} placeholder="e.g. Acme Labs" maxLength={120}/></label></div>
            <label>Job description <span className="required">REQUIRED</span><textarea name="jobDescription" value={form.jobDescription} onChange={updateField} placeholder="Paste the responsibilities, required skills, and qualifications…" rows={5} maxLength={5000}/><small className="field-hint">{form.jobDescription.length}/5000 characters</small></label>
            <label>About your experience <span className="optional">OPTIONAL IF RESUME UPLOADED</span><textarea name="selfDescription" value={form.selfDescription} onChange={updateField} placeholder="Your strongest skills, projects, experience, or what you want to improve…" rows={3} maxLength={5000}/></label>
            <div className="form-row"><label>Preparation timeline<select name="duration" value={form.duration} onChange={updateField}><option value="3">3-day sprint</option><option value="7">7-day plan</option><option value="14">14-day plan</option></select></label><label className="upload-field">Resume PDF <span className="optional">MAX 3 MB</span><input type="file" accept="application/pdf,.pdf" onChange={event => setResumeFile(event.target.files?.[0] || null)}/>{resumeFile && <small className="file-selected">✓ {resumeFile.name}</small>}</label></div>
            <div className="form-note"><span>ⓘ</span><p>Use a resume PDF or describe your experience above. Avoid including sensitive personal information you don't need for interview practice.</p></div>
            <button className="button-primary submit-plan" type="submit" disabled={loading}>{loading ? 'Building your plan…' : 'Generate my interview plan'} <span>→</span></button>
          </form>
        </div>
        <div className="right-column"><section className="surface-card recent-card"><div className="section-heading compact"><div><span className="eyebrow">YOUR WORK</span><h2>Recent plans</h2></div><button className="text-button" onClick={() => setActiveTab('tracker')}>Track progress →</button></div>
          {reports.length ? <div className="recent-list">{reports.slice(0, 5).map(report => <button className="recent-item" key={report._id} onClick={() => navigate(`/interview/${report._id}`)}><span className="recent-avatar">{(report.title || 'I').slice(0,1).toUpperCase()}</span><span className="recent-info"><strong>{report.title || 'Interview plan'}</strong><small>{new Date(report.createdAt).toLocaleDateString()}</small></span><span className="recent-score">{report.matchScore ?? '—'}<small>% match</small></span><span className="recent-arrow">↗</span></button>)}</div> : <div className="empty-state"><span>▤</span><strong>Your plans will show up here</strong><p>Create your first plan to keep your preparation organized.</p></div>}
        </section><section className="surface-card focus-card"><span className="focus-symbol">✦</span><span className="eyebrow">A GOOD PRACTICE HABIT</span><h3>Answer out loud.</h3><p>Use a timer, structure your answer, and finish with the impact you made. Reviewing your reasoning matters as much as memorizing a model answer.</p><button className="text-button" onClick={() => setActiveTab('questions')}>Explore practice questions →</button></section></div></section>
      </>}

      {activeTab === 'questions' && <section className="surface-card full-card"><div className="section-heading"><div><span className="eyebrow">PRACTICE WITH INTENTION</span><h2>Question bank</h2><p>Use the filters to create a short practice session. Questions tagged to your saved role appear first when relevant skills can be identified.</p></div><span className="step-chip">{recommendedQuestions.length} QUESTIONS</span></div>
        <div className="question-filters"><label>Search<input value={questionSearch} onChange={event => setQuestionSearch(event.target.value)} placeholder="Search skill or question…"/></label><label>Category<select value={category} onChange={event => setCategory(event.target.value)}><option>All</option><option>Technical</option><option>Behavioral</option></select></label><label>Difficulty<select value={difficulty} onChange={event => setDifficulty(event.target.value)}><option>All</option><option>Easy</option><option>Medium</option><option>Hard</option></select></label><label>Role context<select value={selectedReportId} onChange={event => setSelectedReportId(event.target.value)}><option value="">General practice</option>{reports.map(report => <option key={report._id} value={report._id}>{report.title || 'Saved role'}</option>)}</select></label></div>
        <div className="question-list">{recommendedQuestions.length ? recommendedQuestions.map((question, index) => <QuestionItem key={question.question} question={question} index={index}/>) : <div className="empty-state"><strong>No questions match these filters</strong><p>Try a different search term or switch back to all difficulty levels.</p></div>}</div>
        <p className="disclaimer">These are practice prompts, not predictions of a specific employer’s interview. Adapt them to the role and your actual experience.</p>
      </section>}

      {activeTab === 'tracker' && <section className="surface-card full-card"><div className="section-heading"><div><span className="eyebrow">MAKE PROGRESS VISIBLE</span><h2>Preparation tracker</h2><p>Choose a saved plan and check off tasks as you complete them. Progress is saved to your account.</p></div></div>
        <div className="tracker-select"><label>Select an interview plan<select value={selectedReportId} onChange={event => setSelectedReportId(event.target.value)}><option value="">Choose a plan…</option>{reports.map(report => <option key={report._id} value={report._id}>{report.title || 'Interview plan'} · {new Date(report.createdAt).toLocaleDateString()}</option>)}</select></label></div>
        {progressLoading ? <div className="empty-state"><span className="spinner"/>Loading your tracker…</div> : selectedReport ? <><div className="tracker-summary"><div><span className="eyebrow">OVERALL COMPLETION</span><strong>{completionPercent}%</strong><p>{completedCount} of {planTasks.length} tasks complete</p></div><div className="tracker-progress"><span style={{ width: `${completionPercent}%` }}/></div></div><div className="tracker-days">{(selectedReport.preparationPlan || []).map(day => { const tasks = (day.tasks || []).map((task, index) => ({ task, key: `${day.day}:${index}` })); const dayDone = tasks.filter(task => completed.includes(task.key)).length; return <article className="tracker-day" key={day.day}><div className="tracker-day-head"><span className="day-badge">DAY {day.day}</span><div><h3>{day.focus}</h3><small>{dayDone}/{tasks.length} completed</small></div></div><div className="tracker-task-list">{tasks.map(task => <label className={`tracker-task ${completed.includes(task.key) ? 'task-done' : ''}`} key={task.key}><input type="checkbox" checked={completed.includes(task.key)} onChange={event => toggleTask(task.key, event.target.checked)}/><span className="custom-check">✓</span><span>{task.task}</span></label>)}</div></article> })}</div><button className="text-button reset-progress" onClick={async () => { const old = completed; setCompleted([]); try { await Promise.all(old.map(key => updatePreparationProgress(selectedReportId, key, false))) } catch { setCompleted(old); setFormError('Could not reset progress. Please try again.') } }}>Reset this plan’s progress</button></> : <div className="empty-state"><span>✓</span><strong>Choose a plan to start tracking</strong><p>Generate an interview plan first, then track each preparation task here.</p><button className="button-primary" onClick={() => setActiveTab('overview')}>Create a plan</button></div>}
      </section>}
      <footer className="workspace-footer"><span>PrepPilot · Interview preparation workspace</span><span>Practice honestly. Learn continuously.</span></footer>
    </main>
  </div>
}

function QuestionItem({ question, index }) {
  const [expanded, setExpanded] = useState(false)
  return <article className={`bank-question ${expanded ? 'expanded' : ''}`}><button className="bank-question-top" onClick={() => setExpanded(value => !value)} aria-expanded={expanded}><span className="question-number">{String(index + 1).padStart(2, '0')}</span><span className="bank-question-copy"><span className="question-tags"><span>{question.category}</span><span className={`difficulty difficulty-${question.difficulty.toLowerCase()}`}>{question.difficulty}</span><span>{question.skill}</span></span><strong>{question.question}</strong></span><span className="expand-icon">{expanded ? '−' : '+'}</span></button>{expanded && <div className="question-followup"><strong>Follow-up to consider</strong><p>{question.followUp}</p><label>My notes<textarea rows={3} placeholder="Outline your answer, example, and result…" onChange={event => { try { sessionStorage.setItem(`preppilot-note-${question.question}`, event.target.value) } catch { /* Session storage may be disabled. */ } }} defaultValue={(() => { try { return sessionStorage.getItem(`preppilot-note-${question.question}`) || '' } catch { return '' } })()}/></label></div>}</article>
}

export default Home
