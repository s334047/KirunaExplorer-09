# Docker Documentation for KirunaExplorer

## Prerequisites

- Docker Desktop installed on your machine

## Building the Docker container

To start your application (aka the entire container) easily with Docker, you first need to open docker desktop on you machine. Then open a terminal or a shell in the root of the project and run the following command:

```sh
docker-compose up --build
```

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
