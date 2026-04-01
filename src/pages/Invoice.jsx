import { useState, useEffect } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';
import { FiPrinter, FiArrowLeft } from 'react-icons/fi';

const Invoice = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders/${id}`, config);
        setOrder(data);
      } catch (error) {
        console.error('Failed to fetch order details', error);
        alert('Could not load invoice.');
        navigate('/orders');
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [id, user, navigate]);

  if (loading) return <div className="p-8 text-center text-gray-500">Loading Invoice...</div>;
  if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>;

  return (
    <div className="bg-white min-h-screen p-4 sm:p-8 text-gray-900 print:bg-white print:p-0">
      {/* Non-printable action bar */}
      <div className="flex justify-between items-center mb-8 print:hidden">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-900 transition-colors">
          <FiArrowLeft className="mr-2" /> Back to Orders
        </button>
        <button onClick={() => window.print()} className="btn-primary flex items-center shadow-lg hover:shadow-xl">
          <FiPrinter className="mr-2" /> Print Bill/PDF
        </button>
      </div>

      {/* Invoice Document Body */}
      <div className="max-w-3xl mx-auto border border-gray-200 shadow-sm sm:p-10 p-6 rounded-lg print:border-none print:shadow-none print:max-w-none print:p-0">
        
        {/* Header */}
        <div className="flex justify-between items-start border-b pb-6 mb-6">
          <div>
            <h1 className="text-4xl font-extrabold text-primary-600 tracking-tight">Supreme Dry Cleaners</h1>
            <p className="text-gray-500 mt-1">Premium Dry Cleaning & Laundry Services</p>
            <p className="text-gray-500 text-sm mt-1">{user.shopName}</p>
          </div>
          <div className="text-right">
            <h2 className="text-2xl font-bold text-gray-800 uppercase tracking-widest">INVOICE</h2>
            <p className="text-sm text-gray-500 mt-2">Order ID: <span className="font-semibold text-gray-800">{order.orderId}</span></p>
            <p className="text-sm text-gray-500">Date: <span className="font-semibold text-gray-800">{format(new Date(order.createdAt), 'MMM dd, yyyy')}</span></p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="mb-8">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Billed To:</p>
          <div className="text-gray-800">
            <p className="font-bold text-lg">{order.customer?.name}</p>
            <p>{order.customer?.phone}</p>
            {order.customer?.address && <p className="text-sm mt-1">{order.customer?.address}</p>}
          </div>
        </div>

        {/* Items Table */}
        <div className="mb-8">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 text-gray-600 text-sm uppercase">
                <th className="py-3 px-4 rounded-tl-lg">Description</th>
                <th className="py-3 px-4 text-center">Qty</th>
                <th className="py-3 px-4 text-right">Rate</th>
                <th className="py-3 px-4 text-right rounded-tr-lg">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {order.items.map((item, index) => (
                <tr key={index} className="text-gray-800">
                  <td className="py-4 px-4 font-medium">{item.itemType}</td>
                  <td className="py-4 px-4 text-center">{item.quantity}</td>
                  <td className="py-4 px-4 text-right">₹{item.pricePerItem}</td>
                  <td className="py-4 px-4 text-right font-medium">₹{item.totalPrice}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totals Section */}
        <div className="flex justify-end mb-8 border-t pt-6">
          <div className="w-full sm:w-1/2 md:w-1/3">
            <div className="flex justify-between items-center text-gray-600 mb-2">
              <span>Subtotal</span>
              <span>₹{order.totalAmount}</span>
            </div>
            <div className="flex justify-between items-center text-gray-600 mb-2">
              <span>Tax (0%)</span>
              <span>₹0.00</span>
            </div>
            <div className="flex justify-between items-center border-t border-gray-200 mt-4 pt-4">
              <span className="text-lg font-bold text-gray-800">Total Due</span>
              <span className="text-2xl font-extrabold text-primary-600">₹{order.totalAmount}</span>
            </div>
            <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center text-sm">
                <span className="text-gray-500">Payment Status</span>
                <span className={`font-bold ${order.paymentStatus === 'Paid' ? 'text-green-500' : 'text-red-500'}`}>
                  {order.paymentStatus}
                </span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-8 mt-12 text-center text-gray-500 text-sm italic">
          <p>Thank you for choosing Supreme Dry Cleaners! We hope to see you again soon.</p>
          <p className="mt-1">For questions concerning this invoice, please contact the store owner.</p>
        </div>
      </div>
    </div>
  );
};

export default Invoice;
