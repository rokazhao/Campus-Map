import express, { Express } from "express";
import bodyParser from 'body-parser';
import { readFileSync } from 'fs';
import { parseEdges } from "./campus";
import { 
  getUserData, setUserData, getShortestPath, getBuildings
} from './routes';


// Parse the information about the walkways on campus.
const content: string = readFileSync("data/campus_edges.csv", {encoding: 'utf-8'});
parseEdges(content.split("\n"));


// Configure and start the HTTP server.
const port: number = 8088;
const app: Express = express();
app.use(bodyParser.json());
app.get("/api/buildings", getBuildings);
app.get("/api/getData", getUserData);
app.post("/api/setData", setUserData);
app.get("/api/shortestPath", getShortestPath);
app.listen(port, () => console.log(`Server listening on ${port}`));
