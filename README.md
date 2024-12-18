# KirunaExplorer-09

## description

This repository belongs to the group number 09 (2024/2025) of the course "Software Engineering II" at [Politecnico di Torino](https://www.polito.it/), Italy.  
KirunaExplorer is a project concerning the creation of a web app interface for [Kiruna](https://it.wikipedia.org/wiki/Kiruna) city and its process of transformation.

## How to section

### How to run the web application
To run the KirunaExplorer web application locally, follow these steps:

1. **Clone the Repository**
   ```bash
   git clone https://github.com/s334047/KirunaExplorer-09.git
   cd KirunaExplorer-09
   ```

2. **Server Setup**
   - Go to the server directory:
     ```bash
     cd Server
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the server in development mode:
     ```bash
     npm run dev
     ```

3. **Client Setup**
   - Open a new terminal and go to the client directory:
     ```bash
     cd ../Client
     ```
   - Install dependencies:
     ```bash
     npm install
     ```
   - Start the development server:
     ```bash
     npm run dev
     ```

4. **Access the Application**
   - The client will run on `http://localhost:5173`
   - The server will be available at `http://localhost:3001`
### How to run all the tests of the application
To run the entire test suite, follow these steps:

1. **Navigate to the Server Directory**
   ```bash
   cd Server
   ```

2. **Run Tests**
   - Execute all tests:
     ```bash
     npm test
     ```
   - Generate test coverage:
     ```bash
     npm run coverage
     ```

3. **Watch Tests** (optional for development):
   - Run tests in watch mode:
     ```bash
     npm run all
     ```
### How to Run the Application with Docker

1. Ensure **Docker Desktop** is installed.
2. Navigate to the root directory and build the containers:
   ```bash
   docker-compose up --build
   ```
3. If Docker Compose fails:
   - Build client and server containers individually:
     ```bash
     cd client
     docker build .
     cd ../server
     docker build .
     cd ..
     docker-compose up --build
     ```

4. Access the application at `http://localhost:5173`.

## Working tree

The project's folder structure is outlined in detail[Working tree](./tree.md)

## Presentation video

Video not available now, it will be created later.
## API Documentation

Refer to the [API Documentation](./documentation.md) for details about all available endpoints.
## Database Documentation

For detailed database schema and restoration steps, see the [Database Documentation](./documentation.md).


## [Our project license](./LICENSE.md)

- [Official Creative Commons license](https://creativecommons.org/licenses/by-nc-sa/4.0/)
- [Software Licenses in Plain English](https://www.tldrlegal.com/license/creative-commons-attribution-noncommercial-sharealike-4-0-international-cc-by-nc-sa-4-0)

## Linked useful resources

- [How open source licenses work and how to add them to your projects](https://www.freecodecamp.org/news/how-open-source-licenses-work-and-how-to-add-them-to-your-projects-34310c3cf94)
- [Choose an open source license](https://choosealicense.com/)
- [Software Licenses in Plain English](https://www.tldrlegal.com/)
- [Top GitHub repositories everyone should look at!](https://github.com/sachin-source/top-github-repositories-which-everyone-should-look)
- [FullStack Project Guidelines](https://github.com/sergeyleschev/sergeyleschev/blob/main/sergeyleschev-fullstack-project-guidelines.md)
- [Creative Commons](https://creativecommons.org/)
## Contributors

- Alberto Margaglia
- Antonella Sarcuni
- Enrico Gioseffi
- Michelepio Mucci
- Seyedeh Fatemeh Moravej Hariri Paskiabi

## Contact

For issues or suggestions, please visit the [GitHub Issues Page](https://github.com/s334047/KirunaExplorer-09/issues).