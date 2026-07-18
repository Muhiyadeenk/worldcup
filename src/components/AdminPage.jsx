import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { loadPredictions, calculateStatistics } from '../lib/supabase'

function AdminPage() {
  const navigate = useNavigate()
  const [predictions, setPredictions] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [resultFilter, setResultFilter] = useState('All')
  const [argScoreFilter, setArgScoreFilter] = useState('')
  const [espScoreFilter, setEspScoreFilter] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  // Load predictions from Supabase on mount
  useEffect(() => {
    const fetchPredictions = async () => {
      try {
        setLoading(true)
        setError('')
        const data = await loadPredictions()
        setPredictions(data || [])
      } catch (err) {
        console.error('Failed to load predictions:', err)
        setError('Failed to connect to Supabase. Please check your network.')
      } finally {
        setLoading(false)
      }
    }
    fetchPredictions()
  }, [])

  // Calculate statistics
  const stats = calculateStatistics(predictions)
  const totalPredictions = stats.total
  const argentinaWins = stats.argentinaWins
  const spainWins = stats.spainWins
  const draws = stats.draws

  // Filter predictions based on search term and result type
  const filteredPredictions = predictions.filter((p) => {
    // Parse display name and instagram id
    const nameMatchIG = (p.participant_name || '').match(/(.+?)\s*\(IG:\s*@(.+?)\)/i);
    const displayName = nameMatchIG ? nameMatchIG[1] : (p.participant_name || '');
    const displayInstagram = nameMatchIG ? `@${nameMatchIG[2]}` : '-';

    const nameMatch = displayName.toLowerCase().includes(searchTerm.toLowerCase())
    const numberMatch = (p.participant_number || '').toString().includes(searchTerm)
    const instagramMatch = displayInstagram.toLowerCase().includes(searchTerm.toLowerCase())
    
    // Result type filter
    const arg = Number(p.argentina_score)
    const esp = Number(p.spain_score)
    let matchesResult = true
    if (resultFilter === 'Argentina') {
      matchesResult = arg > esp
    } else if (resultFilter === 'Spain') {
      matchesResult = esp > arg
    } else if (resultFilter === 'Draw') {
      matchesResult = arg === esp
    }
    
    // Score filter — only apply if at least one score is entered
    const hasScoreFilter = argScoreFilter !== '' || espScoreFilter !== ''
    let matchesScore = true
    if (hasScoreFilter) {
      if (argScoreFilter !== '' && espScoreFilter !== '') {
        matchesScore = arg === Number(argScoreFilter) && esp === Number(espScoreFilter)
      } else if (argScoreFilter !== '') {
        matchesScore = arg === Number(argScoreFilter)
      } else {
        matchesScore = esp === Number(espScoreFilter)
      }
    }

    return (nameMatch || numberMatch || instagramMatch) && matchesResult && matchesScore
  })

  // Helper to determine game result text
  const getResult = (argScore, espScore) => {
    const arg = Number(argScore)
    const esp = Number(espScore)
    if (arg > esp) return 'Argentina'
    if (esp > arg) return 'Spain'
    return 'Draw'
  }

  // Handle Logout
  const handleLogout = () => {
    navigate('/')
  }

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!isConfigured) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center text-white p-6 font-sans bg-[#05070F] select-none">
        <div className="bg-[#161B22] border border-red-500/20 max-w-md w-full p-8 rounded-[20px] shadow-2xl text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold text-red-400 mb-4">Database Connection Missing</h2>
          <p className="text-sm text-[#9CA3AF] mb-6 leading-relaxed">
            The Admin Dashboard requires Supabase credentials to function.
          </p>
          <div className="text-left bg-[#05070F] p-5 rounded-xl border border-white/[0.08] text-xs font-mono space-y-2 mb-6 select-text">
            <div className="text-[#00B4FF] mb-1 font-semibold"># Setup Environment Variables in Vercel:</div>
            <div>VITE_SUPABASE_URL = <span className="text-[#9CA3AF]">https://tlneridakprvnbihmjsc.supabase.co</span></div>
            <div>VITE_SUPABASE_ANON_KEY = <span className="text-[#9CA3AF]">YOUR_PUBLISHABLE_KEY</span></div>
          </div>
          <button
            onClick={() => navigate('/')}
            className="py-2.5 px-5 bg-[#21262D] border border-white/[0.08] hover:border-[#00B4FF] hover:text-[#00B4FF] text-white rounded-xl font-semibold text-sm cursor-pointer transition-all duration-300"
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-between items-center text-white p-4 sm:p-6 md:p-8 select-none font-sans relative">
      
      {/* Top Header & Logout */}
      <div className="w-full max-w-[1000px] flex items-center justify-between mt-4 mb-8">
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wide text-white">
          Prediction Dashboard
        </h1>
        <button
          onClick={handleLogout}
          className="py-2.5 px-5 bg-[#21262D] border border-white/[0.08] hover:border-[#00B4FF] hover:text-[#00B4FF] text-white rounded-xl font-semibold text-sm cursor-pointer transition-all duration-300 active:scale-[0.99]"
        >
          Logout
        </button>
      </div>

      {/* Main Content Area */}
      <div className="w-full max-w-[1000px] flex-grow space-y-8 mb-12">
        
        {/* Dashboard Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {/* Card 1: Total Predictions */}
          <div className="bg-[#161B22] border border-white/[0.08] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-[#00B4FF]"></div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1">
              Total Predictions
            </span>
            <span className="text-3xl font-black text-white">{totalPredictions}</span>
          </div>

          {/* Card 2: Argentina Wins */}
          <div className="bg-[#161B22] border border-white/[0.08] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-sky-400"></div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1">
              Argentina Wins
            </span>
            <span className="text-3xl font-black text-white">{argentinaWins}</span>
          </div>

          {/* Card 3: Spain Wins */}
          <div className="bg-[#161B22] border border-white/[0.08] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1">
              Spain Wins
            </span>
            <span className="text-3xl font-black text-white">{spainWins}</span>
          </div>

          {/* Card 4: Draws */}
          <div className="bg-[#161B22] border border-white/[0.08] rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-400"></div>
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider block mb-1">
              Draws
            </span>
            <span className="text-3xl font-black text-white">{draws}</span>
          </div>
        </div>

        {/* Prediction Table Section */}
        <div className="bg-[#161B22] border border-white/[0.08] shadow-2xl rounded-2xl p-6 space-y-6">
          
          {/* Search bar and title */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-white/[0.04] pb-5">
            <h2 className="text-lg font-bold tracking-wide text-white">
              Submitted Submissions
            </h2>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto animate-fade-in">
              {/* Result Filter */}
              <div className="relative min-w-[150px]">
                <select
                  value={resultFilter}
                  onChange={(e) => setResultFilter(e.target.value)}
                  className="w-full h-11 px-3 bg-[#05070F] border border-white/[0.08] rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] text-sm transition-all duration-200 cursor-pointer appearance-none pr-8"
                >
                  <option value="All">All Results</option>
                  <option value="Argentina">Argentina Wins</option>
                  <option value="Spain">Spain Wins</option>
                  <option value="Draw">Draws</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[#9CA3AF]">
                  <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                    <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z"/>
                  </svg>
                </div>
              </div>
              
              {/* Search Box */}
              <div className="relative w-full sm:w-[220px]">
                <input
                  type="text"
                  placeholder="Search Participant"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full h-11 px-4 bg-[#05070F] border border-white/[0.08] rounded-xl text-white placeholder-[#9CA3AF]/40 focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] text-sm transition-all duration-200"
                />
              </div>
            </div>
          </div>

          {/* Score Filter Row */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1">
            <span className="text-xs font-semibold text-[#9CA3AF] uppercase tracking-wider whitespace-nowrap self-center">Filter by Score:</span>
            {/* Argentina Score */}
            <div className="flex items-center gap-2">
              <img src="https://flagcdn.com/ar.svg" alt="ARG" className="w-6 h-4 rounded-sm object-cover border border-white/10 shrink-0" />
              <input
                id="argScoreFilter"
                type="number"
                min="0"
                placeholder="ARG"
                value={argScoreFilter}
                onChange={(e) => setArgScoreFilter(e.target.value)}
                className="w-[70px] h-10 px-3 text-center bg-[#05070F] border border-white/[0.08] rounded-xl text-white placeholder-[#9CA3AF]/40 focus:outline-none focus:ring-2 focus:ring-sky-400 focus:border-sky-400 text-sm transition-all duration-200"
              />
            </div>
            <span className="text-[#9CA3AF]/40 font-bold text-xs self-center">VS</span>
            {/* Spain Score */}
            <div className="flex items-center gap-2">
              <img src="https://flagcdn.com/es.svg" alt="ESP" className="w-6 h-4 rounded-sm object-cover border border-white/10 shrink-0" />
              <input
                id="espScoreFilter"
                type="number"
                min="0"
                placeholder="ESP"
                value={espScoreFilter}
                onChange={(e) => setEspScoreFilter(e.target.value)}
                className="w-[70px] h-10 px-3 text-center bg-[#05070F] border border-white/[0.08] rounded-xl text-white placeholder-[#9CA3AF]/40 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-amber-400 text-sm transition-all duration-200"
              />
            </div>
            {/* Clear score filter button */}
            {(argScoreFilter !== '' || espScoreFilter !== '') && (
              <button
                onClick={() => { setArgScoreFilter(''); setEspScoreFilter('') }}
                className="h-10 px-3 bg-[#21262D] border border-white/[0.08] hover:border-red-400/50 hover:text-red-400 text-[#9CA3AF] rounded-xl text-xs font-semibold cursor-pointer transition-all duration-200 whitespace-nowrap"
              >
                Clear ✕
              </button>
            )}
          </div>

          {/* Prediction Table */}
          <div className="overflow-x-auto">
            {loading ? (
              <div className="text-center py-12 text-[#9CA3AF] text-sm animate-pulse">
                Connecting to Supabase and loading predictions...
              </div>
            ) : error ? (
              <div className="text-center py-12 text-red-400 text-sm font-semibold">
                ⚠️ {error}
              </div>
            ) : filteredPredictions.length > 0 ? (
              <table className="w-full text-left border-collapse min-w-[600px]">
                <thead>
                  <tr className="border-b border-white/[0.06] text-[#9CA3AF] text-xs font-semibold uppercase tracking-wider">
                    <th className="py-4 px-4">Participant Name</th>
                    <th className="py-4 px-4">Mobile Number</th>
                    <th className="py-4 px-4">Instagram ID</th>
                    <th className="py-4 px-4 text-center">Argentina Score</th>
                    <th className="py-4 px-4 text-center">Spain Score</th>
                    <th className="py-4 px-4 text-right">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/[0.04] text-sm">
                  {filteredPredictions.map((p, idx) => {
                    const result = getResult(p.argentina_score, p.spain_score)
                    let resultBadgeClass = 'text-white'
                    if (result === 'Argentina') resultBadgeClass = 'text-sky-300 font-bold'
                    if (result === 'Spain') resultBadgeClass = 'text-amber-300 font-bold'
                    if (result === 'Draw') resultBadgeClass = 'text-emerald-300 font-medium'

                    // Parse display name and instagram id
                    const nameMatchIG = (p.participant_name || '').match(/(.+?)\s*\(IG:\s*@(.+?)\)/i);
                    const displayName = nameMatchIG ? nameMatchIG[1] : (p.participant_name || '');
                    const displayInstagram = nameMatchIG ? `@${nameMatchIG[2]}` : '-';

                    return (
                      <tr key={p.id || idx} className="hover:bg-white/[0.02] transition-colors">
                        <td className="py-4 px-4 font-medium text-white">{displayName}</td>
                        <td className="py-4 px-4 text-[#9CA3AF]">{p.participant_number}</td>
                        <td className="py-4 px-4 text-[#9CA3AF]">{displayInstagram}</td>
                        <td className="py-4 px-4 text-center font-extrabold text-[#00B4FF]">{p.argentina_score}</td>
                        <td className="py-4 px-4 text-center font-extrabold text-[#00B4FF]">{p.spain_score}</td>
                        <td className="py-4 px-4 text-right">
                          <span className={resultBadgeClass}>{result}</span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            ) : (
              <div className="text-center py-12 text-[#9CA3AF] text-sm">
                No matching predictions found.
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Footer */}
      <footer className="text-center text-xs text-[#9CA3AF]/40 tracking-wider pb-4">
        Prediction Dashboard • Admin Session
      </footer>

    </div>
  )
}

export default AdminPage
