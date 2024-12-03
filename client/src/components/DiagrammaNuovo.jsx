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
        const rowHeight = 120; // Distanza tra le righe
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
            .attr("d", (d, index, nodes) => {
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
            .attr("stroke", (d) => (d.type === "A" ? "red" : d.type === "B" ? "blue" : "black"))
            .attr("stroke-width", 2)
            .attr("fill", "none")
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
            .on("click", (_, d) => {
                setSelectedDoc(d);
            });
    }, [width, height, documents, connections]);

    return (
        <div>
            <svg ref={svgRef} style={{ marginTop: "50px" }}></svg>
            {selectedDoc && (
                <DocumentCard
                    selectedDoc={selectedDoc}
                    setSelectedDoc={setSelectedDoc}
                    user={user}
                    excludeTitle={setTitle}
                    mode="map"
                />
            )}
        </div>
    );
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

