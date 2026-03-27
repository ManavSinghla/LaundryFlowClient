import { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const CLOTHING_TYPES = ['Shirt', 'Pant', 'T-Shirt', 'Jeans', 'Saree', 'Suit', 'Blanket', 'Other'];

const NewOrder = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [customer, setCustomer] = useState({ name: '', phone: '', address: '' });
  const [items, setItems] = useState([{ itemType: 'Shirt', quantity: 1, pricePerItem: 50, totalPrice: 50 }]);
  const [paymentStatus, setPaymentStatus] = useState('Unpaid');
  const [loading, setLoading] = useState(false);

  const handleCustomerChange = (e) => {
    setCustomer({ ...customer, [e.target.name]: e.target.value });
  };

  const searchCustomer = async () => {
    if (!customer.phone) return alert('Enter phone number to search');
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers?phone=${customer.phone}`, config);
      if (data.length > 0) {
        setCustomer({ name: data[0].name, phone: data[0].phone, address: data[0].address || '' });
        alert('Customer found and details updated!');
      } else {
        alert('Customer not found. Please enter details manually.');
      }
    } catch (error) {
      console.error(error);
    }
  };

  const handleItemChange = (index, field, value) => {
    const newItems = [...items];
    newItems[index][field] = value;
    
    // Auto calculate price
    if (field === 'quantity' || field === 'pricePerItem') {
      newItems[index].totalPrice = newItems[index].quantity * newItems[index].pricePerItem;
    }
    
    setItems(newItems);
  };

  const addItem = () => {
    setItems([...items, { itemType: 'Shirt', quantity: 1, pricePerItem: 50, totalPrice: 50 }]);
  };

  const removeItem = (index) => {
    if (items.length > 1) {
      const newItems = items.filter((_, i) => i !== index);
      setItems(newItems);
    }
  };

  const totalAmount = items.reduce((sum, item) => sum + item.totalPrice, 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      
      // 1. Find or create customer
      // A full app might have a better search/select UI, this simply sends basic details.
      let customerId;
      try {
        const { data: newCustomer } = await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, customer, config);
        customerId = newCustomer._id;
      } catch (err) {
        // If exists, find them by phone
        if (err.response?.status === 400) {
           const { data: existing } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers?phone=${customer.phone}`, config);
           if (existing.length > 0) customerId = existing[0]._id;
           else throw new Error("Could not create/find customer");
        } else throw err;
      }

      // 2. Create Order
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/orders`, {
        customerId,
        items,
        paymentStatus
      }, config);

      navigate('/orders');
    } catch (error) {
      console.error('Failed to create order', error);
      alert("Failed to create order: " + (error.response?.data?.message || "Unknown error"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Order</h1>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Customer Section */}
        <div className="card">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-white border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">Customer Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input type="text" name="name" required value={customer.name} onChange={handleCustomerChange} className="input-field" placeholder="John Doe" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
              <div className="flex gap-2">
                <input type="text" name="phone" required value={customer.phone} onChange={handleCustomerChange} className="input-field mt-0" placeholder="1234567890" />
                <button type="button" onClick={searchCustomer} className="btn-primary mt-1 whitespace-nowrap">Search</button>
              </div>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Address (Optional)</label>
              <input type="text" name="address" value={customer.address} onChange={handleCustomerChange} className="input-field" placeholder="123 Street, City" />
            </div>
          </div>
        </div>

        {/* Items Section */}
        <div className="card">
          <div className="flex justify-between items-center border-b border-gray-200 dark:border-gray-700 pb-3 mb-4">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Clothing Items</h2>
            <button type="button" onClick={addItem} className="text-primary-600 hover:text-primary-700 font-medium text-sm flex items-center">
              <FiPlus className="mr-1" /> Add Item
            </button>
          </div>
          
          <div className="space-y-4">
            {items.map((item, index) => (
              <div key={index} className="flex flex-col md:flex-row gap-4 items-end bg-gray-50 dark:bg-gray-800/50 p-4 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex-1 w-full">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Item Type</label>
                  <select 
                    value={item.itemType} 
                    onChange={(e) => handleItemChange(index, 'itemType', e.target.value)}
                    className="input-field"
                  >
                    {CLOTHING_TYPES.map(type => <option key={type} value={type}>{type}</option>)}
                  </select>
                </div>
                <div className="w-full md:w-24">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Qty</label>
                  <input type="number" min="1" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', Number(e.target.value))} className="input-field" />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Rate (₹)</label>
                  <input type="number" min="0" value={item.pricePerItem} onChange={(e) => handleItemChange(index, 'pricePerItem', Number(e.target.value))} className="input-field" />
                </div>
                <div className="w-full md:w-32">
                  <label className="block text-xs font-medium text-gray-500 mb-1">Total (₹)</label>
                  <div className="input-field bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-white font-semibold cursor-not-allowed">
                    {item.totalPrice}
                  </div>
                </div>
                <button type="button" onClick={() => removeItem(index)} className="p-2.5 text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-lg transition-colors mb-[2px]">
                  <FiTrash2 className="h-5 w-5" />
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Summary Details */}
        <div className="card flex flex-col md:flex-row justify-between items-center bg-primary-50 dark:bg-primary-900/20 border-primary-100 dark:border-primary-900/50">
          <div className="space-y-4 md:space-y-0 md:flex gap-6 items-center">
             <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Payment Status</label>
              <select 
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className="input-field !py-1.5"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
              </select>
            </div>
            <div className="text-xl text-gray-800 dark:text-gray-200">
               Total Amount: <span className="font-bold text-2xl text-primary-600 dark:text-primary-400">₹{totalAmount}</span>
            </div>
          </div>
          <button type="submit" disabled={loading} className="w-full md:w-auto mt-4 md:mt-0 btn-primary py-3 px-8 text-lg shadow-md hover:shadow-lg">
             {loading ? 'Processing...' : 'Generate Bill'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default NewOrder;
