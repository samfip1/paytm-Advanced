function Dashboard() {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-gray-500">Manage users, view transactions, and monitor donations.</p>
        </div>
  
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-blue-100 p-3">
                <i className="fas fa-users text-blue-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Total Users</h3>
                <p className="text-2xl font-bold">1,234</p>
              </div>
            </div>
          </div>
  
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-green-100 p-3">
                <i className="fas fa-credit-card text-green-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Transactions</h3>
                <p className="text-2xl font-bold">$45,678</p>
              </div>
            </div>
          </div>
  
          <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
            <div className="flex items-center">
              <div className="rounded-full bg-purple-100 p-3">
                <i className="fas fa-heart text-purple-600"></i>
              </div>
              <div className="ml-4">
                <h3 className="text-lg font-medium">Donations</h3>
                <p className="text-2xl font-bold">$12,345</p>
              </div>
            </div>
          </div>
        </div>
  
        <div className="rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-xl font-bold">Recent Activity</h2>
          <div className="space-y-4">
            <div className="flex items-center border-b border-gray-100 pb-4">
              <div className="rounded-full bg-gray-100 p-2">
                <i className="fas fa-user-plus text-gray-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New user registered</p>
                <p className="text-xs text-gray-400">2 hours ago</p>
              </div>
            </div>
            <div className="flex items-center border-b border-gray-100 pb-4">
              <div className="rounded-full bg-gray-100 p-2">
                <i className="fas fa-dollar-sign text-gray-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New transaction completed</p>
                <p className="text-xs text-gray-400">4 hours ago</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="rounded-full bg-gray-100 p-2">
                <i className="fas fa-heart text-gray-600"></i>
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">New donation received</p>
                <p className="text-xs text-gray-400">Yesterday</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
  
  export default Dashboard
    