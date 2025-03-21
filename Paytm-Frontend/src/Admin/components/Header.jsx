"use client"

import { useState } from "react"
import { useNavigate } from "react-router-dom"

function Header() {
  const [isProfileOpen, setIsProfileOpen] = useState(false)
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      await logout()
      navigate("/login")
    } catch (error) {
      console.error("Logout failed:", error)
    }
  }

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-white px-4">
      <button
        className="inline-flex items-center justify-center rounded-md p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-600 md:hidden"
        onClick={() => document.querySelector("aside").classList.toggle("-translate-x-full")}
      >
        <i className="fas fa-bars h-6 w-6"></i>
        <span className="sr-only">Toggle menu</span>
      </button>
      <div className="flex flex-1 items-center justify-end gap-4">
        <div className="relative">
          <button
            className="flex items-center gap-2 rounded-full p-1 text-sm font-medium text-gray-700 hover:bg-gray-100 hover:text-gray-900"
            onClick={() => setIsProfileOpen(!isProfileOpen)}
          >
            <span className="sr-only">Open user menu</span>
            <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
              <i className="fas fa-user"></i>
            </div>
          </button>
          {isProfileOpen && (
            <div className="absolute right-0 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5">
              <a href="/admin/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                Your Profile
              </a>
              <button
                onClick={handleLogout}
                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
              >
                Sign out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

export default Header

