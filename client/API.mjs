const SERVER_URL = "http://localhost:3001/api";

async function addDocument(title, stakeholder, scale, date, type, language, page, coordinate, area, description) {
  return await fetch(`${SERVER_URL}/documents`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ title, stakeholder, scale, date, type, language, page, coordinate, area, description }),
  }).then(response => response.json());
};

async function login(username, password) {
  const response = await fetch(`${SERVER_URL}/auth/login`, {
    method: 'POST',
    headers: {
      'Content-type': 'application/json',
    },
    body: JSON.stringify({ username, password }),
  });

  if (!response.ok) {
    throw new Error('Invalid username or password');
  }

  return await response.json();
}

const API = { addDocument, login };

export default API;
