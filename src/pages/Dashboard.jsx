import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiDollarSign, FiShoppingBag, FiClock, FiCheckCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const StatCard = ({ title, value, icon: Icon, colorClass }) => (
  <div className="card flex items-center p-6">
    <div className={`p-3 rounded-full ${colorClass} mr-4`}>
      <Icon className="h-6 w-6 text-white" />
    </div>
    <div>
      <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    dailyRevenue: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/dashboard/stats`, config);
        setStats(data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, [user]);

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard Overview</h1>
        <Link to="/orders/new" className="btn-primary flex items-center">
          + New Order
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Today's Revenue" 
          value={`₹${stats.dailyRevenue}`} 
          icon={FiDollarSign} 
          colorClass="bg-green-500" 
        />
        <StatCard 
          title="Total Orders" 
          value={stats.totalOrders} 
          icon={FiShoppingBag} 
          colorClass="bg-blue-500" 
        />
        <StatCard 
          title="Pending Orders" 
          value={stats.pendingOrders} 
          icon={FiClock} 
          colorClass="bg-yellow-500" 
        />
        <StatCard 
          title="Completed Orders" 
          value={stats.completedOrders} 
          icon={FiCheckCircle} 
          colorClass="bg-primary-500" 
        />
      </div>

      <div className="card mt-8">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Recent Orders</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b dark:border-gray-700">
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Order ID</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Customer</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Amount</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Status</th>
                <th className="py-3 px-4 font-semibold text-sm text-gray-600 dark:text-gray-300">Payment</th>
              </tr>
            </thead>
            <tbody>
              {stats.recentOrders.length === 0 ? (
                <tr><td colSpan="5" className="py-4 text-center text-gray-500">No recent orders found.</td></tr>
              ) : (
                stats.recentOrders.map((order) => (
                  <tr key={order._id} className="border-b dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-3 px-4 text-primary-600 font-medium">{order.orderId}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">{order.customer?.name}</td>
                    <td className="py-3 px-4 text-gray-800 dark:text-gray-200">₹{order.totalAmount}</td>
                    <td className="py-3 px-4">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Delivered' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {order.status}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {order.paymentStatus === 'Paid' ? (
                        <span className="text-green-600 font-medium">Paid</span>
                      ) : (
                        <span className="text-red-500 font-medium">Unpaid</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
