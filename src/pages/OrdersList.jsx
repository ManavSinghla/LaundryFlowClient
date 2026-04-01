import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FiPrinter, FiMessageCircle } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const OrdersList = () => {
  const { user } = useAuth();
  const [orders, setOrders] = useState([]);
  const [displayedOrders, setDisplayedOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('All'); // All, Pending, Delivered
  const [searchQuery, setSearchQuery] = useState('');
  const [dateFilter, setDateFilter] = useState('');

  const fetchOrders = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      let url = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`;
      if (filter === 'Pending') url += '?status=Received&status=Washing&status=Ready'; // Simple simulation, exact filtering would need distinct calls or backend support for arrays
      
      const { data } = await axios.get(url, config);
      setOrders(data);
    } catch (error) {
      console.error('Failed to fetch orders', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [filter, user]);

  useEffect(() => {
    let result = orders;

    // 1. Client-side Search Filter
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(o => 
        o.orderId.toLowerCase().includes(lowerQuery) ||
        o.customer?.name.toLowerCase().includes(lowerQuery) ||
        o.customer?.phone.includes(lowerQuery)
      );
    }

    // 2. Client-side Date Filter
    if (dateFilter) {
      result = result.filter(o => {
        const orderDate = new Date(o.createdAt).toISOString().split('T')[0];
        return orderDate === dateFilter;
      });
    }

    setDisplayedOrders(result);
  }, [orders, searchQuery, dateFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}/status`, { status: newStatus }, config);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update status', error);
    }
  };

  const handlePaymentChange = async (id, newPaymentStatus) => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.put(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}/payment`, { paymentStatus: newPaymentStatus }, config);
      fetchOrders();
    } catch (error) {
      console.error('Failed to update payment status', error);
    }
  };

  const sendWhatsApp = (order) => {
    if (!order.customer?.phone) return alert("Customer phone number is missing.");
    const text = `Hello ${order.customer.name}!%0A%0AYour laundry order (${order.orderId}) is currently *${order.status}*.%0A%0ATotal Amount: ₹${order.totalAmount}%0A%0AThank you for choosing LaundryFlow!`;
    const url = `https://wa.me/${order.customer.phone}?text=${text}`;
    window.open(url, '_blank');
  };

  if (loading) return <div>Loading orders...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Orders Data</h1>
        
        <div className="flex flex-col sm:flex-row gap-3 w-full xl:w-auto">
          {/* Search Bar */}
          <input 
            type="text" 
            placeholder="Search ID, Name or Phone..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="input-field mt-0 py-1.5 w-full sm:w-64"
          />

          {/* Date Filter */}
          <input 
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="input-field mt-0 py-1.5 w-full sm:w-40 text-gray-600 dark:text-gray-300"
          />

          {/* Status Filter */}
          <div className="flex bg-gray-100 dark:bg-gray-800 p-1 rounded-lg border border-gray-200 dark:border-gray-700 w-full sm:w-auto">
            {['All', 'Pending', 'Delivered'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${filter === f ? 'bg-white dark:bg-gray-700 shadow flex-1 text-primary-600' : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 flex-1 whitespace-nowrap'}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Order Info</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Customer</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Amount</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Status</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Payment</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {displayedOrders.length === 0 ? (
                <tr><td colSpan="5" className="py-8 text-center text-gray-500">No orders found.</td></tr>
              ) : (
                displayedOrders.map((order) => (
                  <tr key={order._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6">
                      <div className="font-medium text-primary-600 dark:text-primary-400">{order.orderId}</div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</div>
                    </td>
                    <td className="py-4 px-6">
                      <div className="font-medium text-gray-900 dark:text-white">{order.customer?.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{order.customer?.phone}</div>
                    </td>
                    <td className="py-4 px-6 text-gray-900 dark:text-white font-medium">₹{order.totalAmount}</td>
                    <td className="py-4 px-6">
                      <select 
                        className="bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white text-sm rounded-lg focus:ring-primary-500 focus:border-primary-500 block w-full p-2.5 outline-none"
                        value={order.status}
                        onChange={(e) => handleStatusChange(order._id, e.target.value)}
                      >
                        <option value="Received">Received</option>
                        <option value="Washing">Washing</option>
                        <option value="Ready">Ready</option>
                        <option value="Delivered">Delivered</option>
                      </select>
                    </td>
                    <td className="py-4 px-6">
                      <button 
                        onClick={() => handlePaymentChange(order._id, order.paymentStatus === 'Paid' ? 'Unpaid' : 'Paid')}
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full shadow-sm cursor-pointer transition-colors ${
                          order.paymentStatus === 'Paid' 
                            ? 'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300 hover:bg-green-200' 
                            : 'bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300 hover:bg-red-200'
                        }`}
                      >
                        {order.paymentStatus}
                      </button>
                    </td>
                    <td className="py-4 px-6 text-right">
                      <div className="flex items-center justify-end space-x-3">
                        <button 
                          onClick={() => sendWhatsApp(order)}
                          className="text-green-500 hover:text-green-600 transition-colors p-2 rounded-full hover:bg-green-50 dark:hover:bg-green-900/30"
                          title="Notify via WhatsApp"
                        >
                          <FiMessageCircle className="w-5 h-5" />
                        </button>
                        <Link 
                          to={`/orders/${order._id}/invoice`}
                          className="text-primary-500 hover:text-primary-600 transition-colors p-2 rounded-full hover:bg-primary-50 dark:hover:bg-primary-900/30"
                          title="Print / PDF Receipt"
                        >
                          <FiPrinter className="w-5 h-5" />
                        </Link>
                      </div>
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

export default OrdersList;
