const http = require('http');
const { parse } = require('url');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

let users = [];
const getRequestBody = (req) => {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', (chunk) => {
      body += chunk.toString();
    });
    req.on('end', () => {
      try {
        resolve(JSON.parse(body));
      } catch (error) {
        reject(error);
      }
    });
  });
};


const server = http.createServer(async (req, res) => {
  const { pathname, query } = parse(req.url, true);


  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');


  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }


  if (pathname === '/users' && req.method === 'GET') {

    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(users));
  } else if (pathname === '/users' && req.method === 'POST') {

    try {
      const user = await getRequestBody(req);
      const newUser = { id: uuidv4(), ...user };
      users.push(newUser);
      res.writeHead(201, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(newUser));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON input' }));
    }
  } else if (pathname.startsWith('/users/') && req.method === 'PUT') {

    try {
      const id = pathname.split('/')[2];
      const userIndex = users.findIndex((u) => u.id === id);
      if (userIndex === -1) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ error: 'User not found' }));
        return;
      }

      const updatedData = await getRequestBody(req);
      users[userIndex] = { ...users[userIndex], ...updatedData };
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(users[userIndex]));
    } catch (error) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Invalid JSON input' }));
    }
  } else if (pathname.startsWith('/users/') && req.method === 'DELETE') {
    const id = pathname.split('/')[2];
    const initialLength = users.length;
    users = users.filter((u) => u.id !== id);
    if (users.length === initialLength) {
      res.writeHead(404, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'User not found' }));
    } else {
      res.writeHead(204);
      res.end();
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Route not found' }));
  }
});

const PORT = 5000;
server.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
