import { useState } from 'react'
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom'
import AdminPage from './components/AdminPage'
import fifaLogo from './assets/fifa.png'
import goldenWingsLogo from './assets/Golden_Wings_Logo_Vecter_File-removebg-preview.png'
import { savePrediction } from './lib/supabase'

function PredictionPage() {
  const navigate = useNavigate()
  const [participantName, setParticipantName] = useState('')
  const [participantNumber, setParticipantNumber] = useState('')
  const [instagramId, setInstagramId] = useState('')
  const [argentinaScore, setArgentinaScore] = useState('')
  const [spainScore, setSpainScore] = useState('')
  
  // Track which fields have been touched by the user to display validation messages
  const [touched, setTouched] = useState({
    participantName: false,
    participantNumber: false,
    instagramId: false,
    argentinaScore: false,
    spainScore: false,
  })

  const [errors, setErrors] = useState({})
  const [successMessage, setSuccessMessage] = useState('')

  // Login Modal State
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false)
  const [loginUsername, setLoginUsername] = useState('')
  const [loginPassword, setLoginPassword] = useState('')
  const [loginError, setLoginError] = useState('')

  // Submit Loading and Error States
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  // Validation function
  const validateField = (name, value) => {
    let error = ''
    switch (name) {
      case 'participantName':
        if (!value || value.trim() === '') {
          error = 'Participant name cannot be empty.'
        }
        break
      case 'participantNumber':
        if (value === undefined || value === null || value.toString().trim() === '') {
          error = 'Mobile number is required.'
        } else {
          const num = Number(value)
          if (isNaN(num)) {
            error = 'Mobile number must be a valid number.'
          } else if (!Number.isInteger(num)) {
            error = 'Mobile number must be an integer.'
          }
        }
        break
      case 'instagramId':
        if (!value || value.trim() === '') {
          error = 'Instagram ID is required.'
        }
        break
      case 'argentinaScore':
      case 'spainScore':
        const teamLabel = name === 'argentinaScore' ? 'Argentina' : 'Spain'
        if (value === undefined || value === null || value.toString().trim() === '') {
          error = `${teamLabel} score is required.`
        } else {
          const scoreNum = Number(value)
          if (isNaN(scoreNum)) {
            error = 'Score must be a number.'
          } else if (!Number.isInteger(scoreNum)) {
            error = 'Scores must be integers.'
          } else if (scoreNum < 0) {
            error = 'Scores cannot be negative.'
          }
        }
        break
      default:
        break
    }
    return error
  }

  // Validate the whole form and return if it is valid
  const checkFormValidity = (updatedTouched = touched) => {
    const newErrors = {
      participantName: validateField('participantName', participantName),
      participantNumber: validateField('participantNumber', participantNumber),
      instagramId: validateField('instagramId', instagramId),
      argentinaScore: validateField('argentinaScore', argentinaScore),
      spainScore: validateField('spainScore', spainScore),
    }

    setErrors(newErrors)

    // Form is valid if all error messages are empty strings
    return Object.values(newErrors).every((err) => err === '')
  }

  // Handle Input Changes
  const handleInputChange = (field, value) => {
    // Clear success/error messages when user edits the form
    if (successMessage) {
      setSuccessMessage('')
    }
    if (submitError) {
      setSubmitError('')
    }

    if (field === 'participantName') setParticipantName(value)
    if (field === 'participantNumber') setParticipantNumber(value)
    if (field === 'instagramId') setInstagramId(value)
    if (field === 'argentinaScore') setArgentinaScore(value)
    if (field === 'spainScore') setSpainScore(value)

    // Mark as touched on change
    setTouched((prev) => ({ ...prev, [field]: true }))

    // Update individual error
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  // Handle Input Blur
  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }))
    const value = 
      field === 'participantName' ? participantName :
      field === 'participantNumber' ? participantNumber :
      field === 'instagramId' ? instagramId :
      field === 'argentinaScore' ? argentinaScore : spainScore;
    
    const error = validateField(field, value)
    setErrors((prev) => ({ ...prev, [field]: error }))
  }

  // Submit Handler
  const handleSubmit = async (e) => {
    e.preventDefault()
    setSubmitError('')
    setSuccessMessage('')

    // Mark all fields as touched on submit attempt
    const allTouched = {
      participantName: true,
      participantNumber: true,
      instagramId: true,
      argentinaScore: true,
      spainScore: true,
    }
    setTouched(allTouched)

    const isValid = checkFormValidity(allTouched)

    if (isValid) {
      setIsSubmitting(true)
      try {
        await savePrediction(
          participantName,
          participantNumber,
          instagramId,
          argentinaScore,
          spainScore
        )

        // Print to the browser console as requested
        console.log({
          participantName: participantName.trim(),
          participantNumber: Number(participantNumber),
          instagramId: instagramId.trim(),
          argentinaScore: Number(argentinaScore),
          spainScore: Number(spainScore),
        })

        // Set success message
        setSuccessMessage('✓ Prediction Submitted Successfully')
      } catch (err) {
        console.error('Failed to save prediction:', err)
        setSubmitError('Unable to save prediction.\nPlease try again.')
      } finally {
        setIsSubmitting(false)
      }
    }
  }

  // Reset Handler
  const handleReset = () => {
    setParticipantName('')
    setParticipantNumber('')
    setInstagramId('')
    setArgentinaScore('')
    setSpainScore('')
    setErrors({})
    setSubmitError('')
    setIsSubmitting(false)
    setTouched({
      participantName: false,
      participantNumber: false,
      instagramId: false,
      argentinaScore: false,
      spainScore: false,
    })
    setSuccessMessage('')
  }

  // Handle Login Submit
  const handleLoginSubmit = (e) => {
    e.preventDefault()
    // Hardcoded credentials verification as requested
    if (loginUsername === 'GW@admin' && loginPassword === '9847947772') {
      setIsLoginModalOpen(false)
      setLoginUsername('')
      setLoginPassword('')
      setLoginError('')
      navigate('/admin')
    } else {
      setLoginError('Invalid username or password.')
    }
  }

  // Handle Login Cancel
  const handleLoginCancel = () => {
    setIsLoginModalOpen(false)
    setLoginUsername('')
    setLoginPassword('')
    setLoginError('')
  }

  // Determine if there are currently any errors shown on touched fields
  const hasErrors = Object.keys(errors).some((key) => touched[key] && errors[key])

  const isConfigured = !!import.meta.env.VITE_SUPABASE_URL && !!import.meta.env.VITE_SUPABASE_ANON_KEY

  if (!isConfigured) {
    return (
      <div className="min-h-screen w-full flex flex-col justify-center items-center text-white p-6 font-sans bg-[#05070F] select-none">
        <div className="bg-[#161B22] border border-red-500/20 max-w-md w-full p-8 rounded-[20px] shadow-2xl text-center">
          <span className="text-5xl mb-4 block">⚠️</span>
          <h2 className="text-xl font-bold text-red-400 mb-4">Database Connection Missing</h2>
          <p className="text-sm text-[#9CA3AF] mb-6 leading-relaxed">
            This project is connected to Supabase, but the environment variables are not configured in your hosting dashboard.
          </p>
          <div className="text-left bg-[#05070F] p-5 rounded-xl border border-white/[0.08] text-xs font-mono space-y-2 mb-6 select-text">
            <div className="text-[#00B4FF] mb-1 font-semibold"># Setup Environment Variables in Vercel:</div>
            <div>VITE_SUPABASE_URL = <span className="text-[#9CA3AF]">https://tlneridakprvnbihmjsc.supabase.co</span></div>
            <div>VITE_SUPABASE_ANON_KEY = <span className="text-[#9CA3AF]">YOUR_PUBLISHABLE_KEY</span></div>
          </div>
          <p className="text-xs text-[#9CA3AF]/60 leading-normal">
            Once these variables are added in your Vercel Dashboard, redeploy the site to activate the prediction form.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen w-full flex flex-col justify-start items-center text-white p-4 sm:p-6 md:p-8 select-none font-sans relative">
      
      {/* Brand Logo centered at the top of the page */}
      <div className="mt-8 mb-6 flex justify-center z-20">
        <img 
          src={goldenWingsLogo} 
          alt="Golden Wings Logo" 
          className="h-20 sm:h-28 w-auto object-contain filter drop-shadow-md transform transition-transform duration-300 hover:scale-105" 
        />
      </div>

      {/* Spacer to assist vertical centering */}
      <div className="flex items-center justify-center w-full py-6">
        
        {/* Main Glassmorphic Card Container */}
        <div className="animate-fade-in-up bg-[#161B22] backdrop-blur-md border border-white/[0.08] shadow-2xl shadow-black/55 rounded-[20px] p-6 sm:p-10 max-w-[700px] w-full mx-auto relative transition-all duration-500 mb-12">

          {/* Header Section */}
          <div className="flex flex-col items-center text-center mb-10 mt-2">
            {/* Company Logo with hover transition */}
            <div className="group mb-6 relative cursor-pointer">
              <div className="w-[140px] h-[140px] rounded-full overflow-hidden bg-white flex items-center justify-center border-2 border-white/[0.12] shadow-2xl transform transition-transform duration-300 group-hover:scale-105">
                <img 
                  src={fifaLogo} 
                  alt="Company Logo" 
                  className="w-full h-full object-contain p-2" 
                />
              </div>
            </div>
            
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-wide mb-3">
              World Cup Final Prediction
            </h1>
            <p className="text-sm sm:text-base text-[#9CA3AF] font-medium">
              Predict the final score between Argentina and Spain.
            </p>
          </div>

          {/* Prediction Form */}
          <form onSubmit={handleSubmit} className="space-y-8 sm:space-y-10" noValidate>
            
            {/* Participant Information Section */}
            <div>
              <div className="flex items-center mb-6 border-l-[3.5px] border-[#00B4FF] pl-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#00B4FF]">
                  Participant Information
                </h2>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {/* Participant Name */}
                <div className="flex flex-col">
                  <label htmlFor="participantName" className="text-xs sm:text-sm font-semibold text-[#9CA3AF] mb-2.5">
                    Participant Name
                  </label>
                  <input
                    id="participantName"
                    type="text"
                    placeholder="Enter your full name"
                    value={participantName}
                    onChange={(e) => handleInputChange('participantName', e.target.value)}
                    onBlur={() => handleBlur('participantName')}
                    className={`w-full h-[52px] px-4 bg-[#05070F] border ${
                      touched.participantName && errors.participantName ? 'border-red-400/80' : 'border-white/[0.08]'
                    } rounded-xl text-white placeholder-[#9CA3AF]/40 focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all duration-200`}
                    required
                  />
                  {touched.participantName && errors.participantName && (
                    <span className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-pulse">
                      ⚠️ {errors.participantName}
                    </span>
                  )}
                </div>

                {/* Mobile Number */}
                <div className="flex flex-col">
                  <label htmlFor="participantNumber" className="text-xs sm:text-sm font-semibold text-[#9CA3AF] mb-2.5">
                    Mobile Number
                  </label>
                  <input
                    id="participantNumber"
                    type="number"
                    placeholder="Enter your mobile number"
                    value={participantNumber}
                    onChange={(e) => handleInputChange('participantNumber', e.target.value)}
                    onBlur={() => handleBlur('participantNumber')}
                    className={`w-full h-[52px] px-4 bg-[#05070F] border ${
                      touched.participantNumber && errors.participantNumber ? 'border-red-400/80' : 'border-white/[0.08]'
                    } rounded-xl text-white placeholder-[#9CA3AF]/40 focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all duration-200`}
                    required
                  />
                  {touched.participantNumber && errors.participantNumber && (
                    <span className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-pulse">
                      ⚠️ {errors.participantNumber}
                    </span>
                  )}
                </div>

                {/* Instagram ID */}
                <div className="flex flex-col col-span-1 sm:col-span-2">
                  <label htmlFor="instagramId" className="text-xs sm:text-sm font-semibold text-[#9CA3AF] mb-2.5">
                    Instagram ID
                  </label>
                  <input
                    id="instagramId"
                    type="text"
                    placeholder="Enter your Instagram ID"
                    value={instagramId}
                    onChange={(e) => handleInputChange('instagramId', e.target.value)}
                    onBlur={() => handleBlur('instagramId')}
                    className={`w-full h-[52px] px-4 bg-[#05070F] border ${
                      touched.instagramId && errors.instagramId ? 'border-red-400/80' : 'border-white/[0.08]'
                    } rounded-xl text-white placeholder-[#9CA3AF]/40 focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all duration-200`}
                    required
                  />
                  {touched.instagramId && errors.instagramId && (
                    <span className="text-red-400 text-xs mt-1.5 font-medium flex items-center gap-1 animate-pulse">
                      ⚠️ {errors.instagramId}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Match Prediction Section */}
            <div>
              <div className="flex items-center mb-6 border-l-[3.5px] border-[#00B4FF] pl-3">
                <h2 className="text-sm font-bold uppercase tracking-wider text-[#00B4FF]">
                  Predict the Final Score
                </h2>
              </div>

              {/* Dedicated Inset Dark Card for Match Prediction Area */}
              <div className="bg-[#05070F] border border-white/[0.08] p-5 sm:p-8 rounded-xl flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4">
                
                {/* Argentina Team Section */}
                <div className="flex flex-col items-center flex-1 w-full text-center bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl md:bg-transparent md:border-none md:p-0">
                  <img 
                    src="https://flagcdn.com/ar.svg" 
                    alt="Argentina Flag" 
                    className="w-[110px] h-[73px] md:w-[90px] md:h-[60px] object-cover rounded-lg border border-white/10 shadow-md mb-2 md:mb-4 transform transition-transform duration-300 hover:scale-105" 
                  />
                  <span className="font-extrabold text-white text-base tracking-widest uppercase mb-0.5">
                    ARG
                  </span>
                  <span className="font-medium text-sm text-[#9CA3AF] mb-3 md:mb-4">
                    Argentina
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={argentinaScore}
                    aria-label="Argentina Score"
                    onChange={(e) => handleInputChange('argentinaScore', e.target.value)}
                    onBlur={() => handleBlur('argentinaScore')}
                    className={`w-[75px] h-[75px] md:w-[70px] md:h-[70px] text-center text-2xl font-extrabold bg-[#161B22] border-2 ${
                      touched.argentinaScore && errors.argentinaScore ? 'border-red-400/80' : 'border-[#00B4FF]/60'
                    } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all duration-200`}
                  />
                  {touched.argentinaScore && errors.argentinaScore && (
                    <span className="text-red-400 text-xs mt-2 font-medium animate-pulse">
                      {errors.argentinaScore}
                    </span>
                  )}
                </div>

                {/* VS Indicator */}
                <div className="flex flex-col items-center justify-center px-4 self-center py-2 md:py-0">
                  <span className="text-4xl md:text-5xl text-[#00B4FF]/40 font-black tracking-widest select-none">
                    VS
                  </span>
                </div>

                {/* Spain Team Section */}
                <div className="flex flex-col items-center flex-1 w-full text-center bg-white/[0.02] border border-white/[0.04] p-4 rounded-xl md:bg-transparent md:border-none md:p-0">
                  <img 
                    src="https://flagcdn.com/es.svg" 
                    alt="Spain Flag" 
                    className="w-[110px] h-[73px] md:w-[90px] md:h-[60px] object-cover rounded-lg border border-white/10 shadow-md mb-2 md:mb-4 transform transition-transform duration-300 hover:scale-105" 
                  />
                  <span className="font-extrabold text-white text-base tracking-widest uppercase mb-0.5">
                    ESP
                  </span>
                  <span className="font-medium text-sm text-[#9CA3AF] mb-3 md:mb-4">
                    Spain
                  </span>
                  <input
                    type="number"
                    min="0"
                    placeholder="0"
                    value={spainScore}
                    aria-label="Spain Score"
                    onChange={(e) => handleInputChange('spainScore', e.target.value)}
                    onBlur={() => handleBlur('spainScore')}
                    className={`w-[75px] h-[75px] md:w-[70px] md:h-[70px] text-center text-2xl font-extrabold bg-[#161B22] border-2 ${
                      touched.spainScore && errors.spainScore ? 'border-red-400/80' : 'border-[#00B4FF]/60'
                    } rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all duration-200`}
                  />
                  {touched.spainScore && errors.spainScore && (
                    <span className="text-red-400 text-xs mt-2 font-medium animate-pulse">
                      {errors.spainScore}
                    </span>
                  )}
                </div>

              </div>
            </div>

            {/* Buttons Section */}
            <div className="flex flex-col sm:flex-row gap-4 pt-2">
              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className={`flex-1 py-4 px-6 rounded-xl font-bold tracking-wide shadow-lg transform transition-all duration-300 cursor-pointer ${
                  hasErrors || isSubmitting
                    ? 'bg-gradient-to-r from-blue-700/50 to-[#00B4FF]/50 cursor-not-allowed text-white/50 border border-white/5' 
                    : 'bg-gradient-to-r from-[#0088FF] to-[#00B4FF] hover:from-[#00B4FF] hover:to-[#00D0FF] text-white active:scale-[0.99] hover:-translate-y-0.5 hover:shadow-[#00B4FF]/30 hover:shadow-xl'
                }`}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Prediction'}
              </button>

              {/* Reset Button */}
              <button
                type="button"
                onClick={handleReset}
                className="py-4 px-8 bg-[#21262D] border border-white/[0.08] hover:border-[#00B4FF] hover:text-[#00B4FF] text-white rounded-xl font-semibold tracking-wide text-sm transform transition-all duration-300 cursor-pointer active:scale-[0.99]"
              >
                Reset Form
              </button>
            </div>

            {/* Submit Error Card */}
            {submitError && (
              <div className="p-4 bg-[#05070F] border border-red-500/20 text-red-400 rounded-xl animate-fade-in text-sm font-semibold flex items-center gap-2 whitespace-pre-line text-left">
                <span>⚠️</span>
                <span>{submitError}</span>
              </div>
            )}

            {/* Success Confirmation Card */}
            {successMessage && (
              <div className="p-6 bg-[#05070F] border border-[#10B981]/20 rounded-xl animate-fade-in text-left">
                <div className="flex items-center gap-2.5 text-[#10B981] font-bold text-base mb-4 pb-3 border-b border-white/[0.04]">
                  <span className="flex items-center justify-center w-5 h-5 rounded-full bg-[#10B981]/15 text-xs">✓</span>
                  <span>Prediction Submitted Successfully</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-y-4 gap-x-4 text-sm">
                  <div>
                    <span className="text-[#9CA3AF] text-xs block mb-0.5 font-medium uppercase tracking-wider">Participant</span>
                    <span className="font-semibold text-white">{participantName}</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-xs block mb-0.5 font-medium uppercase tracking-wider">Mobile Number</span>
                    <span className="font-semibold text-white">{participantNumber}</span>
                  </div>
                  <div>
                    <span className="text-[#9CA3AF] text-xs block mb-0.5 font-medium uppercase tracking-wider">Instagram ID</span>
                    <span className="font-semibold text-white">{instagramId}</span>
                  </div>
                  <div className="col-span-1 sm:col-span-3 pt-2.5 border-t border-white/[0.04] mt-1">
                    <span className="text-[#9CA3AF] text-xs block mb-2.5 font-medium uppercase tracking-wider">Prediction</span>
                    <div className="flex items-center gap-3 bg-[#161B22] px-4 py-2.5 rounded-lg border border-white/[0.04] w-fit">
                      <img src="https://flagcdn.com/ar.svg" alt="Argentina" className="w-6 h-4 object-cover rounded-sm border border-white/10" />
                      <span className="font-semibold text-white text-sm">ARG</span>
                      <span className="font-black text-[#00B4FF] text-base px-1">{argentinaScore}</span>
                      <span className="text-[#9CA3AF]/40 font-bold text-xs">VS</span>
                      <span className="font-black text-[#00B4FF] text-base px-1">{spainScore}</span>
                      <span className="font-semibold text-white text-sm">ESP</span>
                      <img src="https://flagcdn.com/es.svg" alt="Spain" className="w-6 h-4 object-cover rounded-sm border border-white/10" />
                    </div>
                  </div>
                </div>
              </div>
            )}

          </form>

        </div>
      </div>

      {/* Footer Section */}
      <footer className="text-center text-xs sm:text-sm text-[#9CA3AF]/50 tracking-wider pb-4 font-medium">
        Good luck and enjoy the match!
      </footer>

      {/* Floating Login Button (Always visible bottom-right) */}
      <button
        type="button"
        onClick={() => setIsLoginModalOpen(true)}
        className="fixed bottom-6 right-6 w-12 h-12 rounded-full bg-[#161B22] border border-[#00B4FF]/40 text-white font-bold text-lg flex items-center justify-center cursor-pointer shadow-lg shadow-black/50 hover:border-[#00B4FF] hover:shadow-[#00B4FF]/20 hover:shadow-md hover:scale-105 transition-all duration-300 z-50"
        aria-label="Admin Login"
      >
        L
      </button>

      {/* Login Modal */}
      {isLoginModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 animate-fade-in p-4">
          <div className="bg-[#161B22] border border-white/[0.08] rounded-[20px] p-8 max-w-[400px] w-full shadow-2xl shadow-black/80">
            <h3 className="text-xl font-bold text-white mb-6 tracking-wide">
              Administrator Login
            </h3>
            <form onSubmit={handleLoginSubmit} className="space-y-4" noValidate>
              <div className="flex flex-col">
                <label htmlFor="loginUsername" className="text-xs font-semibold text-[#9CA3AF] mb-2">
                  Username
                </label>
                <input
                  id="loginUsername"
                  type="text"
                  value={loginUsername}
                  onChange={(e) => {
                    setLoginUsername(e.target.value)
                    if (loginError) setLoginError('')
                  }}
                  className="w-full h-11 px-4 bg-[#05070F] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all"
                  required
                />
              </div>
              <div className="flex flex-col">
                <label htmlFor="loginPassword" className="text-xs font-semibold text-[#9CA3AF] mb-2">
                  Password
                </label>
                <input
                  id="loginPassword"
                  type="password"
                  value={loginPassword}
                  onChange={(e) => {
                    setLoginPassword(e.target.value)
                    if (loginError) setLoginError('')
                  }}
                  className="w-full h-11 px-4 bg-[#05070F] border border-white/[0.08] rounded-xl text-white placeholder-white/20 focus:outline-none focus:ring-2 focus:ring-[#00B4FF] focus:border-[#00B4FF] transition-all"
                  required
                />
                {loginError && (
                  <span className="text-red-400 text-xs mt-2 font-medium">
                    {loginError}
                  </span>
                )}
              </div>
              <div className="flex gap-3 pt-3">
                <button
                  type="submit"
                  className="flex-1 py-2.5 bg-gradient-to-r from-[#0088FF] to-[#00B4FF] hover:from-[#00B4FF] hover:to-[#00D0FF] text-white font-bold rounded-xl cursor-pointer hover:shadow-lg hover:shadow-[#00B4FF]/20 active:scale-[0.99] transition-all"
                >
                  Login
                </button>
                <button
                  type="button"
                  onClick={handleLoginCancel}
                  className="py-2.5 px-5 bg-[#21262D] border border-white/[0.08] hover:border-red-400/50 hover:text-red-400 text-white rounded-xl font-semibold text-sm cursor-pointer transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  )
}

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<PredictionPage />} />
        <Route path="/admin" element={<AdminPage />} />
      </Routes>
    </Router>
  )
}
