# Docker Documentation for KirunaExplorer

## Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) installed on your machine

## Building the Docker container

To start your application (aka the entire container) with Docker, you first need to open your docker desktop on you machine. If you haven't installed it yet you can download it from [here](https://www.docker.com/products/docker-desktop/). Then open a terminal (or a shell) in the root of the project and run the following command:

```sh
docker-compose up --build
```

Sometimes the "docker-compose" command may not be recognized. If this happens, run the command without the hyphen (which is referred to, as the dash):

```sh
docker compose up --build
```

At this point, if you can see correctly in you termilal window some information related client and server correctly listening at their own port like the following:  
`client-1  |   ➜  Local:   http://localhost:5173/`  
`server-1  | Server listening at http://localhost:3001`  
 you can directly jump to continue in the [final section](#final-section)

## **Recommended method if Docker Compose runs without success**

If Docker Compose runs without success, you need to build each Docker images (client and server) individually.
To do so, you need to go inside both directory (client and server) and type the following commands:
(we suggest you to epen two terminal from the root: one for the client and one for the server)

for the client:

```sh
cd client
docker build .
```

and for the server:

```sh
cd server
docker build .
```

then return back in the root directory and type again

```sh
docker-compose up --build
```

or type the command without the hyphen (or dash)

```sh
docker compose up --build
```

## Final section

If you are here the docker container is running the two images correctly. In the terminal you can see a similar output:

```sh
 ✔ Network kirunaexplorer-09_kirunaexplorer-network  Created             0.0s
 ✔ Container kirunaexplorer-09-client-1              Created             0.1s
 ✔ Container kirunaexplorer-09-server-1              Created             0.1s
Attaching to client-1, server-1
client-1  |
client-1  | > client@0.0.0 dev
client-1  | > vite
client-1  |
server-1  |
server-1  | > server@0.0.0 start
server-1  | > node --loader ts-node/esm index.ts
server-1  |
client-1  |
client-1  |   VITE v5.4.11  ready in 151 ms
client-1  |
client-1  |   ➜  Local:   http://localhost:5173/
client-1  |   ➜  Network: http://172.18.0.2:5173/
server-1  | (node:19) ExperimentalWarning: `--experimental-loader` may be removed in the future; instead use `register()`:
server-1  | --import 'data:text/javascript,import { register } from "node:module"; import { pathToFileURL } from "node:url"; register("ts-node/esm", pathToFileURL("./"));'
server-1  | (Use `node --trace-warnings ...` to show where the warning was created)
server-1  | (node:19) [DEP0180] DeprecationWarning: fs.Stats constructor is deprecated.
server-1  | (Use `node --trace-deprecation ...` to show where the warning was created)
server-1  | Server listening at http://localhost:3001
```

from here you can follow the client link in the terminal, or do it manually: open a browser tab and type `http://localhost:5173/`.  
Now you are able to run the dockerized app in your browser.
