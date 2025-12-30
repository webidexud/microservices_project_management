import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.20.100.31:4000', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});


// Routes for get informatio

export const getContractById = async (id) => api.get(`/getContractById/${id}`)
export const getContracts = async () => api.get('/getContracts');

export const catalogData = async () => api.get('/catalogs_tables');

// Routes for update information
export const updateContract = async (id, data) => api.post(`/UpdateContracts/${id}`, data);

// Routes for create information
export const createContract = (data) => api.post('/CreateContracts', data);
export const createAddition = async (data, id) => api.post(`/CreateAddition/${id}`, data);


// Routes for delete information
// export const deleteContract = async (id) => api.delete(`/DeleteContracts/${id}`);


// Route for generate security hash
export const signContract = async (id, status) => api.get(`/sign/${id}/${status}`);

// Route for download document
export const downloadDocument = async (id) => api.get(`/downloadWord/${id}`, { responseType: 'blob' });


// Route for change de status
export const changeStatus = async (id, status) => api.get(`/changeStatus/${id}/${status}`);



export default api;