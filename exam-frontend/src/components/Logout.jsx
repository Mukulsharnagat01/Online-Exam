import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import Loader from './Loader'

const Logout = () => {
  const { logout } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const doLogout = async () => {
      try {
        await logout()
      } catch (err) {
        // ignore
      }
      navigate('/login', { replace: true })
    }
    doLogout()
  }, [logout, navigate])

  return <Loader />
}

export default Logout
