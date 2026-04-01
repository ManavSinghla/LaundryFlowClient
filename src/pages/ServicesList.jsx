import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import { FiTrash2, FiPlus } from 'react-icons/fi';

const ServicesList = () => {
  const { user } = useAuth();
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newService, setNewService] = useState({ name: '', price: '' });

  const fetchServices = async () => {
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      const { data } = await axios.get(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/services`, config);
      setServices(data);
    } catch (error) {
      console.error('Failed to fetch services', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, [user]);

  const addService = async (e) => {
    e.preventDefault();
    if (!newService.name || !newService.price) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.post(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/services`, {
        name: newService.name,
        price: Number(newService.price)
      }, config);
      setNewService({ name: '', price: '' });
      fetchServices();
    } catch (error) {
       alert(error.response?.data?.message || 'Failed to add service');
    }
  };

  const deleteService = async (id) => {
    if (!window.confirm("Delete this service?")) return;
    try {
      const config = { headers: { Authorization: `Bearer ${user.token}` } };
      await axios.delete(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/services/${id}`, config);
      fetchServices();
    } catch (error) {
      console.error('Failed to delete', error);
    }
  };

  if (loading) return <div>Loading Services...</div>;

  return (
    <div className="max-w-4xl space-y-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Service Price Catalogue</h1>
      
      {/* Add Form */}
      <div className="card w-full md:w-2/3">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Add New Service</h2>
        <form onSubmit={addService} className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 w-full">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Service Name (e.g. Shirt - Wash)</label>
            <input 
              type="text" 
              value={newService.name}
              onChange={(e) => setNewService({ ...newService, name: e.target.value })}
              className="input-field mt-0" 
              placeholder="Blanket - Dry Clean"
              required 
            />
          </div>
          <div className="w-full sm:w-32">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Price (₹)</label>
            <input 
              type="number" 
              min="0"
              value={newService.price}
              onChange={(e) => setNewService({ ...newService, price: e.target.value })}
              className="input-field mt-0" 
              placeholder="150"
              required 
            />
          </div>
          <button type="submit" className="btn-primary flex items-center h-[42px] whitespace-nowrap w-full sm:w-auto mt-2 sm:mt-0">
             <FiPlus className="mr-2" /> Add
          </button>
        </form>
      </div>

      {/* Services List Table */}
      <div className="card overflow-hidden !p-0">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-gray-50 dark:bg-gray-800/50">
              <tr className="border-b border-gray-200 dark:border-gray-700">
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400">Service Name</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400">Fixed Rate</th>
                <th className="py-4 px-6 font-semibold text-sm text-gray-500 dark:text-gray-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {services.length === 0 ? (
                <tr><td colSpan="3" className="py-8 text-center text-gray-500">No services configured.</td></tr>
              ) : (
                services.map((svc) => (
                  <tr key={svc._id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                    <td className="py-4 px-6 font-medium text-gray-900 dark:text-white">{svc.name}</td>
                    <td className="py-4 px-6 text-primary-600 dark:text-primary-400 font-bold">₹{svc.price}</td>
                    <td className="py-4 px-6 text-right">
                      <button 
                        onClick={() => deleteService(svc._id)}
                        className="text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 p-2 rounded-full transition-colors"
                        title="Delete Service"
                      >
                        <FiTrash2 className="w-5 h-5"/>
                      </button>
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

export default ServicesList;
