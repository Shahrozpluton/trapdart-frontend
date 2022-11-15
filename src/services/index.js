import axios from "axios";

const createBackendServer = baseURL => {
    const api = axios.create({
        baseURL,
        headers: {'Accept': 'application/json'},
        timeout: 60 * 1000
    });

    /*==========    GET REQUESTS    ==========*/

    const getAllProposals = () => api.get('/api/proposals');

    const getTypeProposals = (type) => api.get(`/api/proposals/type/${type}`);
    
    const getAllStrokes = () => api.get(`/api/strokes`);
    
    const getSingleProposal = (id) => api.get(`/api/proposals/${id}`);

    const getWinnerProposal = (id)  =>api.get(`/api/strokes/sorted/${id}`)

    const getPicture = ()  => api.get(`/api/picture`)

    const getText = ()  => api.get(`/api/text`)

    
    
    /*==========    POST REQUESTS    ==========*/

    const createVote = (id,body) => api.post(`/api/votes/${id}`,body);

    
    

    return { getAllProposals , getTypeProposals , createVote , getAllStrokes ,  getSingleProposal , getWinnerProposal , getPicture ,getText};

};

const apis = createBackendServer(process.env.REACT_APP_BSE_API_URL);


export default apis;
