import { Outlet } from "react-router-dom"
import Sidebar from "./Sidebar"
import Header from "./Header"

function AdminLayout() {
  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex flex-col flex-1 overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout

