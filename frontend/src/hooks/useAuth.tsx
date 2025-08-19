import React, { createContext, useContext, useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useMutation, useQuery } from '@apollo/client'
import { gql } from '@apollo/client'
import { useToast } from '@/components/ui/use-toast'

const ME_QUERY = gql`
  query Me {
    me {
      id
      email
      name
    }
  }
`

const LOGIN_MUTATION = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      success
      user {
        id
        email
        name
      }
    }
  }
`

const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout
  }
`

const REGISTER_MUTATION = gql`
  mutation Register($email: String!, $password: String!, $name: String!) {
    register(email: $email, password: $password, name: $name) {
      success
      user {
        id
        email
        name
      }
    }
  }
`

interface User {
  id: string
  email: string
  name: string
}

interface AuthContextType {
  user: User | null
  loading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  register: (email: string, password: string, name: string) => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const navigate = useNavigate()
  const { toast } = useToast()

  // Check if user is logged in
  const { loading: meLoading } = useQuery(ME_QUERY, {
    onCompleted: (data) => {
      if (data.me) {
        setUser(data.me)
      }
    },
    onError: () => {
      // User not logged in, that's ok
      setUser(null)
    },
    fetchPolicy: 'network-only'
  })

  const [loginMutation] = useMutation(LOGIN_MUTATION)
  const [logoutMutation] = useMutation(LOGOUT_MUTATION)
  const [registerMutation] = useMutation(REGISTER_MUTATION)

  const loading = meLoading

  const login = async (email: string, password: string) => {
    try {
      const { data } = await loginMutation({
        variables: { email, password }
      })
      
      if (data.login.success) {
        setUser(data.login.user)
        toast({
          title: 'Success',
          description: 'Logged in successfully',
        })
        navigate('/projects')
      } else {
        throw new Error('Invalid credentials')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to login',
        variant: 'destructive',
      })
      throw error
    }
  }

  const logout = async () => {
    try {
      await logoutMutation()
      setUser(null)
      toast({
        title: 'Success',
        description: 'Logged out successfully',
      })
      navigate('/')
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to logout',
        variant: 'destructive',
      })
    }
  }

  const register = async (email: string, password: string, name: string) => {
    try {
      const { data } = await registerMutation({
        variables: { email, password, name }
      })
      
      if (data.register.success) {
        setUser(data.register.user)
        toast({
          title: 'Success',
          description: 'Account created successfully',
        })
        navigate('/projects')
      } else {
        throw new Error('Registration failed')
      }
    } catch (error: any) {
      toast({
        title: 'Error',
        description: error.message || 'Failed to register',
        variant: 'destructive',
      })
      throw error
    }
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, register }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}