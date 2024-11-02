const SERVER_URL = "http://localhost:3001/api";

async function addDocument(title, stakeholder, scale, date, type, language, page, coordinate, area, description) {
    return await fetch(`${SERVER_URL}/documents`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include',
        body: JSON.stringify({ title, stakeholder, scale, date, type, language, page, coordinate, area, description })
    }).then(response => response.json())
};

async function SetDocumentsConnection(SourceDocument, TargetDocument, ConnectionType) { // all parameters are strings
    return await fetch(`${SERVER_URL}/connections`, {
        method: 'POST',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include',
        body: JSON.stringify({ SourceDocument, TargetDocument, ConnectionType })
    }).then(response => response.json())
}

async function GetDocumentConnections(SourceDocument) { // SourceDocument is a string
    return await fetch(`${SERVER_URL}/connections/${SourceDocument}`, {
        method: 'GET',
        headers: {
            'Content-type': 'application/json'
        },
        //credentials: 'include'
    }).then(response => response.json())
}

// NEW
const logIn = async (credentials) => {
    const response = await fetch(`${SERVER_URL}/sessions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include',
      body: JSON.stringify(credentials),
    });
    if (response.ok) {
      const user = await response.json();
      return user;
    }
    else {
      const errDetails = await response.text();
      throw errDetails;
    }
  };
  
  const getUserInfo = async () => {
    const res = await fetch(`${SERVER_URL}/sessions/current`, {
      credentials: 'include',
    });
    const user = await res.json();
    if (res.ok) {
      return user;
    } else {
      throw user;  // an object with the error coming from the server
    }
  };
  
  const logOut = async () => {
    const res = await fetch(`${SERVER_URL}/sessions/current`, {
      method: 'DELETE',
      credentials: 'include'
    });
    if (res.ok)
      return null;
  }

const API = { addDocument, SetDocumentsConnection, logIn, getUserInfo, logOut };

export default API;
