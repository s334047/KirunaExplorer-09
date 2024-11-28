const SERVER_URL = "http://localhost:3001/api";

/** API Documents */
async function addDocument(title, stakeholder, scale, date, type, language, page, coordinate, area, description) {
  return await fetch(`${SERVER_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ title, stakeholder, scale, date, type, language, page, coordinate, area, description })
  }).then(response => response.json())
};

async function getAllDocs() {                  //get all the docs in the db
  return await fetch(`${SERVER_URL}/documents`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
  }).then(response => response.json())
}

async function getAreasDoc(name) {                  //get docs of an area
  return await fetch(`${SERVER_URL}/documents/areas/${encodeURIComponent(name)}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
  }).then(response => response.json())
}

/** API Connections */
async function SetDocumentsConnection(SourceDocument, TargetDocument, ConnectionType) { // all parameters are strings
  console.log(SourceDocument, TargetDocument, ConnectionType);
  return await fetch(`${SERVER_URL}/connections`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ SourceDocument, TargetDocument, ConnectionType })
  }).then(response => response.json())
};

async function GetDocumentConnections(SourceDocument) { // SourceDocument is a string
  return await fetch(`${SERVER_URL}/connections/${encodeURIComponent(SourceDocument)}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
  }).then(response => response.json())
}

async function GetDocumentInfoConnections(SourceDocumentId) { // SourceDocument is a string
  return await fetch(`${SERVER_URL}/connections/info/${encodeURIComponent(SourceDocumentId)}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
  }).then(response => response.json())
}

/** API Areas */
async function addAreaToDoc(title, area) {   //add an area to a document
  return await fetch(`${SERVER_URL}/documents/area`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ title, area })
  }).then(response => response.json())
};

async function getAllAreas() {                  //get all the areas in the db
  return await fetch(`${SERVER_URL}/areas`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
  }).then(response => response.json())
}

async function addArea(name, vertex) {           //add a new area in the db
  return await fetch(`${SERVER_URL}/areas`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ name, vertex })
  }).then(response => response.json())
};

async function modifyGeoreference(name, coord, oldCoord, area, oldArea) {  //modify the georeference of a document
  return await fetch(`${SERVER_URL}/modifyGeoreference`, {
    method: 'PUT',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
    body: JSON.stringify({ name, coord, oldCoord, area, oldArea })
  }).then(response => response.json())
}

/** API Original Resources  */
async function addOriginalResource(file, docId) {
  const formData = new FormData();
  formData.append('file', file);  // Aggiungi il file
  formData.append('docId', docId);
  return await fetch(`${SERVER_URL}/originalResources`, {
    method: 'POST',
    credentials: 'include',
    body: formData
  }).then(response => response.json())
};

async function getOriginalResources(docId) {
  return await fetch(`${SERVER_URL}/originalResources/${docId}`, {
    method: 'GET',
    headers: {
      'Content-type': 'application/json'
    },
    credentials: 'include',
  }).then(response => response.json())
}

async function downloadResource(id) {
  try {
    const response = await fetch(`${SERVER_URL}/originalResources/download/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/octet-stream',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Error: ${response.statusText}`);
    }

    // Convert response to Blob
    const blob = await response.blob();

    // Estrai il nome del file dall'intestazione Content-Disposition
    const contentDisposition = response.headers.get('Content-Disposition');
    let filename = 'download'; // Default nome del file

    if (contentDisposition) {
      // Estrai il nome del file dalla stringa Content-Disposition
      const match = contentDisposition.match(/filename="([^"]+)"/);
      if (match && match[1]) {
        filename = match[1];
      }
    }

    // Crea un link temporaneo per il download
    const link = document.createElement('a');
    const url = window.URL.createObjectURL(blob);
    link.href = url;
    link.download = filename; // Usa il nome del file originale
    document.body.appendChild(link);

    // Avvia il download
    link.click();

    // Cleanup
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  } catch (err) {
    console.error('Error downloading resource:', err);
  }
}


/** API Authentication */
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


const API = { addDocument, SetDocumentsConnection, GetDocumentConnections, GetDocumentInfoConnections, addAreaToDoc, getAllAreas, addArea, getAllDocs, getAreasDoc, modifyGeoreference, addOriginalResource, getOriginalResources, downloadResource, logIn, getUserInfo, logOut };

export default API;
