import { useContext, useEffect } from "react"
import { AuthContext } from "../auth.context"
import { login, register, logout, getMe } from "../services/auth.api"

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) throw new Error("useAuth must be used within an AuthProvider")
    const { user, setUser, loading, setLoading, error, setError } = context

    const handleLogin = async ({ email, password }) => {
        setLoading(true); setError("")
        try { const data = await login({ email, password }); setUser(data.user); return data }
        catch (err) { setError(err.response?.data?.message || "Unable to log in. Check the API connection and try again."); return null }
        finally { setLoading(false) }
    }

    const handleRegister = async ({ username, email, password }) => {
        setLoading(true); setError("")
        try { const data = await register({ username, email, password }); setUser(data.user); return data }
        catch (err) { setError(err.response?.data?.message || "Unable to create the account. Check the API connection and try again."); return null }
        finally { setLoading(false) }
    }

    const handleLogout = async () => {
        setLoading(true); setError("")
        try { await logout(); setUser(null); return true }
        catch (err) { setError(err.response?.data?.message || "Unable to sign out cleanly."); return false }
        finally { setLoading(false) }
    }

    useEffect(() => {
        let alive = true
        const getAndSetUser = async () => {
            try { const data = await getMe(); if (alive) setUser(data.user) }
            catch { if (alive) setUser(null) }
            finally { if (alive) setLoading(false) }
        }
        getAndSetUser()
        return () => { alive = false }
    }, [])

    return { user, loading, error, handleRegister, handleLogin, handleLogout }
}
