const SERVER_URL = "http://localhost:3001/api";

async function addDocument(title, stakeholder, scale, date, type, language, page, coordinate, area, description){
    return await fetch(`${SERVER_URL}/documents`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include',
        body: JSON.stringify({title, stakeholder, scale, date, type, language, page, coordinate, area, description})
    }).then(response => response.json())
};

const API = {addDocument}

export default API;