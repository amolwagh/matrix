import { useEffect, useRef, useState } from 'react'
import { Lock, AlertCircle } from 'lucide-react'

const CORRECT_PIN = '2609'
const MAX_ATTEMPTS = 3
const LOCKOUT_SECONDS = 30
const AUTH_KEY = 'em_auth'

export default function PinGate({ children }: { children: React.ReactNode }) {
  const [granted, setGranted] = useState(false)
  const [pin, setPin] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [shake, setShake] = useState(false)
  const [attempts, setAttempts] = useState(0)
  const [lockedUntil, setLockedUntil] = useState<number | null>(null)
  const [countdown, setCountdown] = useState(0)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (sessionStorage.getItem(AUTH_KEY) === 'granted') {
      setGranted(true)
    }
  }, [])

  useEffect(() => {
    if (!lockedUntil) return
    const interval = setInterval(() => {
      const remaining = Math.ceil((lockedUntil - Date.now()) / 1000)
      if (remaining <= 0) {
        setLockedUntil(null)
        setCountdown(0)
        setAttempts(0)
        setPin('')
        setError(null)
        clearInterval(interval)
      } else {
        setCountdown(remaining)
      }
    }, 1000)
    return () => clearInterval(interval)
  }, [lockedUntil])

  useEffect(() => {
    if (shake) {
      const timer = setTimeout(() => setShake(false), 500)
      return () => clearTimeout(timer)
    }
  }, [shake])

  const handleSubmit = () => {
    if (lockedUntil) return
    if (pin.length !== 4) return

    if (pin === CORRECT_PIN) {
      sessionStorage.setItem(AUTH_KEY, 'granted')
      setGranted(true)
      setError(null)
    } else {
      const nextAttempts = attempts + 1
      setAttempts(nextAttempts)
      setShake(true)
      setPin('')
      setError('Incorrect PIN')

      if (nextAttempts >= MAX_ATTEMPTS) {
        setLockedUntil(Date.now() + LOCKOUT_SECONDS * 1000)
        setCountdown(LOCKOUT_SECONDS)
        setError(null)
      }
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit()
    }
  }

  if (granted) return <>{children}</>

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
      <style>{`
        @keyframes shake-pin {
          0%, 100% { transform: translateX(0); }
          10%, 30%, 50%, 70%, 90% { transform: translateX(-6px); }
          20%, 40%, 60%, 80% { transform: translateX(6px); }
        }
        .shake-pin {
          animation: shake-pin 0.5s ease-in-out;
        }
      `}</style>
      <div
        className={`w-full max-w-sm rounded-xl border border-gray-200 bg-white p-8 shadow-lg dark:border-gray-700 dark:bg-gray-900 ${shake ? 'shake-pin' : ''}`}
      >
        <div className="mb-6 flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800">
            <Lock size={24} className="text-gray-600 dark:text-gray-400" />
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            Eisenhower Matrix
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">Enter PIN to access</p>
        </div>

        {lockedUntil ? (
          <div className="text-center">
            <div className="mb-2 flex items-center justify-center gap-2 text-amber-600 dark:text-amber-400">
              <AlertCircle size={18} />
              <span className="text-sm font-medium">Too many attempts</span>
            </div>
            <p className="text-2xl font-bold tabular-nums text-gray-900 dark:text-gray-100">
              {countdown}s
            </p>
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Please wait before trying again
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-4">
            <input
              ref={inputRef}
              type="password"
              inputMode="numeric"
              pattern="[0-9]*"
              maxLength={4}
              autoFocus
              value={pin}
              onChange={(e) => {
                const val = e.target.value.replace(/\D/g, '').slice(0, 4)
                setPin(val)
                if (error) setError(null)
              }}
              onKeyDown={handleKeyDown}
              placeholder="••••"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-center text-2xl tracking-[0.5em] text-gray-900 placeholder:text-gray-300 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-600"
            />

            {error && (
              <p className="text-center text-sm text-red-600 dark:text-red-400">{error}</p>
            )}

            <button
              type="button"
              onClick={handleSubmit}
              disabled={pin.length !== 4}
              className="w-full rounded-lg bg-gray-900 px-4 py-3 text-sm font-semibold text-white transition-colors hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-40 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-200"
            >
              Submit
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
