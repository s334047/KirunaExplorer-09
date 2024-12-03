import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import DocumentCard from "./DocCard";

const TimelineDiagram = ({ documents, user, setTitle, connections }) => {
    const svgRef = useRef(null);
    const height = document.documentElement.clientHeight * 0.9;
    const width = document.documentElement.clientWidth;
    const [selectedDoc, setSelectedDoc] = useState(null);

    useEffect(() => {
        const margin = { top: 20, right: 50, bottom: 50, left: 70 };
        const maxHeight = height * 0.9; // Altezza massima disponibile (90% dell'altezza del viewport)
        const circleRadius = 10;
        const linePadding = 30; // Maggiore distanza tra le linee
        const minLineDistance = 30; // Distanza minima tra la linea e i cerchi (per evitare intersezioni)
    
        // Parsing e formattazione delle date
        documents.forEach((doc) => {
            if (dayjs(doc.date, "DD-MM-YYYY", true).isValid()) {
                doc.date = dayjs(doc.date, "DD-MM-YYYY").toDate();
            } else if (dayjs(doc.date, "MM-YYYY", true).isValid()) {
                doc.date = dayjs(doc.date, "MM-YYYY").toDate();
            } else if (dayjs(doc.date, "YYYY", true).isValid()) {
                doc.date = dayjs(doc.date, "YYYY").toDate();
            }
        });
    
        const xScale = d3
            .scaleTime()
            .domain(d3.extent(documents, (d) => d.date))
            .range([margin.left, width - margin.right]);
    
        // Assegna le righe (posizioni y)
        const assignedRows = {};
        documents.forEach((doc) => {
            let row = 0;
            while (
                Object.values(assignedRows).some(
                    (assigned) =>
                        assigned.row === row &&
                        Math.abs(xScale(assigned.date) - xScale(doc.date)) < circleRadius * 2
                )
            ) {
                row += 1;
            }
            assignedRows[doc.id] = { ...doc, row };
        });
    
        const maxRow = Math.max(...Object.values(assignedRows).map((d) => d.row));
        const rowHeight = Math.max(40, maxHeight / (maxRow + 1)); // Altezza dinamica con minimo 40px
        const adjustedHeight = margin.top + (maxRow + 1) * rowHeight + margin.bottom;
    
        const yScale = d3
            .scaleLinear()
            .domain([0, maxRow])
            .range([margin.top, adjustedHeight - margin.bottom]);
    
        const svgElement = svgRef.current;
        if (!svgElement) return;
    
        const svg = d3.select(svgElement).attr("width", width).attr("height", adjustedHeight);
        svg.selectAll("*").remove();
    
        // Aggiungi assi
        const xAxis = d3.axisBottom(xScale).ticks(10);
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${adjustedHeight - margin.bottom})`)
            .call(xAxis);
    
        const yAxis = d3.axisLeft(yScale).ticks(maxRow);
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis);
    
        // Raggruppa le connessioni per coppia sorgente-destinatario
        const groupedConnections = d3.group(
            connections,
            (d) => `${d.source}-${d.target}`
        );
    
        // Aggiungi curve Bézier per le connessioni
        svg.append("g")
            .attr("class", "connections")
            .selectAll("path")
            .data(Array.from(groupedConnections.values()).flat())
            .join("path")
            .attr("d", (d, index) => {
                const group = groupedConnections.get(`${d.source}-${d.target}`);
                const offset = (index - (group.length - 1) / 2) * linePadding; // Spazio tra linee
    
                // Calcola la distanza minima tra la curva e i cerchi
                const ySource = yScale(assignedRows[d.source].row);
                const yTarget = yScale(assignedRows[d.target].row);
    
                // Distanza tra i cerchi per evitare che le linee intersechino i pallini
                const distanceFromCircle = Math.abs(ySource - yTarget);
    
                // Assicurati che la curva non intersechi i cerchi, calcolando un offset
                const adjustedControlOffset = Math.max(minLineDistance, Math.abs(offset));
    
                // Calcola il punto di controllo per la curva, che curverà verso il basso
                return d3.line()
                    .x((d) => d[0])
                    .y((d) => d[1])
                    .curve(d3.curveBundle.beta(0.8))([
                        [xScale(assignedRows[d.source].date), ySource],
                        [
                            (xScale(assignedRows[d.source].date) +
                                xScale(assignedRows[d.target].date)) /
                            2,
                            (ySource + yTarget) / 2 + adjustedControlOffset, // Curvatura verso il basso
                        ],
                        [xScale(assignedRows[d.target].date), yTarget],
                    ]);
            })
            .attr("stroke", (d) => {
                let strokeColor;
                if (d.type === "Projection") {
                    strokeColor = "red";
                } else if (d.type === "Update") {
                    strokeColor = "blue";
                } else {
                    strokeColor = "black";
                }
                return strokeColor;
            })
            .attr("stroke-width", 2)
            .attr("fill", "none")
            .attr("stroke-dasharray", (d) => {
                // Definizione dello stile della linea in base al tipo di connessione
                if (d.type === "Projection") return "5,5"; // Linea con spazi, trattini
                if (d.type === "Update") return "10,4";
                return "0"; // Linea continua
            })
            .attr("marker-end", "url(#arrow)");
    
        // Aggiungi cerchi per i documenti
        svg.append("g")
            .attr("class", "documents")
            .selectAll("circle")
            .data(Object.values(assignedRows))
            .join("circle")
            .attr("cx", (d) => xScale(d.date))
            .attr("cy", (d) => yScale(d.row))
            .attr("r", circleRadius)
            .attr("fill", "blue")
            .on("click", (_,d) => {
                // Event handler for click on the circle
                alert(`Document clicked: ${d.title}`);
                // Here you can add further logic to handle the click, like opening a modal or navigating
            });
        const zoom = d3
            .zoom()
            .scaleExtent([1, 10]) // Zoom minimo e massimo
            .translateExtent([[0, 0], [width, adjustedHeight]]) // Limiti di traslazione
            .on("zoom", (event) => {
                const transform = event.transform;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);
                // Aggiorna gli assi
                svg.select(".x-axis").call(d3.axisBottom(newXScale));
                svg.select(".y-axis").call(d3.axisLeft(newYScale));
                // Aggiorna cerchi
                svg.selectAll(".documents circle")
                    .attr("cx", (d) => newXScale(d.date))
                    .attr("cy", (d) => newYScale(d.row));
                // Ridisegna le curve Bézier
                svg.selectAll(".connections path")
                    .attr("d", (d, index) => {
                        const group = groupedConnections.get(`${d.source}-${d.target}`);
                        const offset = (index - (group.length - 1) / 2) * linePadding;
                        const ySource = newYScale(assignedRows[d.source].row);
                        const yTarget = newYScale(assignedRows[d.target].row);
                        const adjustedControlOffset = Math.max(minLineDistance, Math.abs(offset) * 2);
                        return d3.line()
                            .x((d) => d[0])
                            .y((d) => d[1])
                            .curve(d3.curveBundle.beta(0.8))([
                                [newXScale(assignedRows[d.source].date), ySource],
                                [
                                    (newXScale(assignedRows[d.source].date) +
                                        newXScale(assignedRows[d.target].date)) /
                                    2,
                                    (ySource + yTarget) / 2 + adjustedControlOffset,
                                ],
                                [newXScale(assignedRows[d.target].date), yTarget],
                            ]);
                    });
            });
        svg.call(zoom);
    }, [width, height, documents, connections]);
    
    
    
    

    return <svg ref={svgRef} style={{ marginTop: "50px" }}></svg>;
};

TimelineDiagram.propTypes = {
    documents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
        })
    ).isRequired,
    connections: PropTypes.arrayOf(
        PropTypes.shape({
            source: PropTypes.number.isRequired,
            target: PropTypes.number.isRequired,
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default TimelineDiagram;

