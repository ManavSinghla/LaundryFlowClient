import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { format } from 'date-fns';

const CustomersList = () => {
  const { user } = useAuth();
  const [customers, setCustomers] = useState([]);
  const [filteredCustomers, setFilteredCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        const config = { headers: { Authorization: `Bearer ${user.token}` } };
        const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/customers`, config);
        setCustomers(data);
        setFilteredCustomers(data);
      } catch (error) {
        console.error('Failed to fetch customers', error);
      } finally {
        setLoading(false);
      }
    };
    fetchCustomers();
  }, [user]);

  useEffect(() => {
    const lowerQuery = searchQuery.toLowerCase();
    const result = customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      c.phone.includes(lowerQuery)
    );
    setFilteredCustomers(result);
  }, [searchQuery, customers]);

  if (loading) return <div>Loading customers...</div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Customer Directory</h1>
        <div className="w-full sm:w-64">
           <input 
             type="text" 
             placeholder="Search name or phone..." 
             className="input-field mt-0 py-1.5"
             value={searchQuery}
             onChange={(e) => setSearchQuery(e.target.value)}
           />
        </div>
      </div>

      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Phone</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Orders</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined On</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {filteredCustomers.length === 0 ? (
                <tr><td colSpan="4" className="py-8 text-center text-gray-500">No customers found.</td></tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{customer.name}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">{customer.phone}</td>
                    <td className="py-4 px-6 text-gray-600 dark:text-gray-300">
                      <span className="bg-primary-100 text-primary-800 dark:bg-primary-900/40 dark:text-primary-300 py-1 px-3 rounded-full text-xs font-bold">
                        {customer.totalOrders}
                      </span>
                    </td>
                    <td className="py-4 px-6 text-gray-500 dark:text-gray-400 text-sm">
                      {format(new Date(customer.createdAt), 'MMM dd, yyyy')}
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

export default CustomersList;
