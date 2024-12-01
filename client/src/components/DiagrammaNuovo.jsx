import { useEffect, useRef } from "react";
import * as d3 from "d3";

const TimelineDiagram = () => {
    const svgRef = useRef(null);
    const height = document.documentElement.clientHeight * 0.9;
    const width = document.documentElement.clientWidth;

    useEffect(() => {
        const margin = { top: 20, right: 50, bottom: 20, left: 50 };
        const rowHeight = 70;

        const documents = [
            // January
            { id: 1, title: "Report A1", date: new Date("2024-01-01") },
            { id: 2, title: "Analysis B1", date: new Date("2024-01-01") },
            { id: 3, title: "Document C1", date: new Date("2024-01-01") },
            { id: 4, title: "Study D1", date: new Date("2024-01-01") },
            { id: 5, title: "Report E1", date: new Date("2024-01-01") },
            { id: 6, title: "Analysis F1", date: new Date("2024-01-01") },
            { id: 7, title: "Document G1", date: new Date("2024-01-01") },
            { id: 8, title: "Research H1", date: new Date("2024-01-01") },
            { id: 9, title: "Paper I1", date: new Date("2024-01-15") },
            { id: 10, title: "Study J1", date: new Date("2024-01-15") },
            { id: 11, title: "Analysis K1", date: new Date("2024-01-15") },
            { id: 12, title: "Report L1", date: new Date("2024-01-15") },
            // February
            { id: 13, title: "Document M1", date: new Date("2024-02-01") },
            { id: 14, title: "Study N1", date: new Date("2024-02-01") },
            { id: 15, title: "Research O1", date: new Date("2024-02-01") },
            { id: 16, title: "Paper P1", date: new Date("2024-02-01") },
            { id: 17, title: "Analysis Q1", date: new Date("2024-02-01") },
            { id: 18, title: "Report R1", date: new Date("2024-02-01") },
            { id: 19, title: "Document S1", date: new Date("2024-02-01") },
            { id: 20, title: "Study T1", date: new Date("2024-02-01") },
            { id: 21, title: "Research U1", date: new Date("2024-02-15") },
            { id: 22, title: "Paper V1", date: new Date("2024-02-15") },
            { id: 23, title: "Analysis W1", date: new Date("2024-02-15") },
            { id: 24, title: "Report X1", date: new Date("2024-02-15") },
            // March
            { id: 25, title: "Document Y1", date: new Date("2024-03-01") },
            { id: 26, title: "Study Z1", date: new Date("2024-03-01") },
            { id: 27, title: "Research A2", date: new Date("2024-03-01") },
            { id: 28, title: "Paper B2", date: new Date("2024-03-01") },
            { id: 29, title: "Analysis C2", date: new Date("2024-03-01") },
            { id: 30, title: "Report D2", date: new Date("2024-03-01") },
            { id: 31, title: "Document E2", date: new Date("2024-03-01") },
            { id: 32, title: "Study F2", date: new Date("2024-03-01") },
            { id: 33, title: "Research G2", date: new Date("2024-03-15") },
            { id: 34, title: "Paper H2", date: new Date("2024-03-15") },
            { id: 35, title: "Analysis I2", date: new Date("2024-03-15") },
            { id: 36, title: "Report J2", date: new Date("2024-03-15") },
            // April
            { id: 37, title: "Document K2", date: new Date("2024-04-01") },
            { id: 38, title: "Study L2", date: new Date("2024-04-01") },
            { id: 39, title: "Research M2", date: new Date("2024-04-01") },
            { id: 40, title: "Paper N2", date: new Date("2024-04-01") },
            { id: 41, title: "Analysis O2", date: new Date("2024-04-01") },
            { id: 42, title: "Report P2", date: new Date("2024-04-01") },
            { id: 43, title: "Document Q2", date: new Date("2024-04-01") },
            { id: 44, title: "Study R2", date: new Date("2024-04-01") },
            { id: 45, title: "Research S2", date: new Date("2024-04-01") },
            { id: 46, title: "Paper T2", date: new Date("2024-04-01") },
            { id: 47, title: "Analysis U2", date: new Date("2024-04-15") },
            { id: 48, title: "Report V2", date: new Date("2024-04-15") },
            { id: 49, title: "Document W2", date: new Date("2024-04-15") },
            { id: 50, title: "Study X2", date: new Date("2024-04-15") }
        ];

        const connections = [
            { source: 1, target: 2 }, { source: 1, target: 3 }, { source: 1, target: 4 },
            { source: 2, target: 5 }, { source: 2, target: 6 }, { source: 2, target: 7 },
            { source: 3, target: 8 }, { source: 3, target: 9 }, { source: 3, target: 10 },
            { source: 4, target: 11 }, { source: 4, target: 12 }, { source: 5, target: 13 },
            { source: 1, target: 25 }, { source: 2, target: 26 }, { source: 3, target: 27 },
            { source: 4, target: 28 }, { source: 5, target: 29 }, { source: 6, target: 30 },
            { source: 7, target: 31 }, { source: 8, target: 32 }, { source: 9, target: 33 },
            { source: 20, target: 21 }, { source: 21, target: 22 }, { source: 22, target: 23 },
            { source: 23, target: 24 }, { source: 24, target: 25 }, { source: 25, target: 26 },
            { source: 26, target: 27 }, { source: 27, target: 28 }, { source: 28, target: 29 },
            { source: 1, target: 50 }, { source: 2, target: 49 }, { source: 3, target: 48 },
            { source: 4, target: 47 }, { source: 5, target: 46 }, { source: 6, target: 45 },
            { source: 10, target: 11 }, { source: 11, target: 12 }, { source: 12, target: 13 },
            { source: 13, target: 14 }, { source: 14, target: 15 }, { source: 15, target: 16 },
            { source: 16, target: 17 }, { source: 17, target: 18 }, { source: 18, target: 19 },
            { source: 30, target: 31 }, { source: 31, target: 32 }, { source: 32, target: 33 },
            { source: 33, target: 34 }, { source: 34, target: 35 }, { source: 35, target: 36 },
            { source: 36, target: 37 }, { source: 37, target: 38 }, { source: 38, target: 39 },
            { source: 1, target: 40 }, { source: 2, target: 41 }, { source: 3, target: 42 },
            { source: 4, target: 43 }, { source: 5, target: 44 }, { source: 6, target: 45 },
            { source: 50, target: 25 }, { source: 49, target: 24 }, { source: 48, target: 23 },
            { source: 47, target: 22 }, { source: 46, target: 21 }, { source: 45, target: 20 },
            { source: 40, target: 41 }, { source: 41, target: 42 }, { source: 42, target: 43 },
            { source: 43, target: 44 }, { source: 44, target: 45 }, { source: 45, target: 46 },
            { source: 46, target: 47 }, { source: 47, target: 48 }, { source: 48, target: 49 },
            { source: 1, target: 10 }, { source: 10, target: 20 }, { source: 20, target: 30 },
            { source: 30, target: 40 }, { source: 40, target: 50 }, { source: 5, target: 15 },
            { source: 15, target: 25 }, { source: 25, target: 35 }, { source: 35, target: 45 },
            { source: 7, target: 14 }, { source: 14, target: 21 }, { source: 21, target: 28 },
            { source: 28, target: 35 }, { source: 35, target: 42 }, { source: 42, target: 49 },
            { source: 1, target: 5 }, { source: 5, target: 10 }, { source: 10, target: 15 },
            { source: 15, target: 20 }, { source: 20, target: 25 }, { source: 25, target: 30 },
            { source: 30, target: 35 }, { source: 35, target: 40 }, { source: 40, target: 45 },
            { source: 45, target: 50 }
        ];

        const xScale = d3
            .scaleTime()
            .domain(d3.extent(documents, (d) => d.date))
            .range([margin.left, width - margin.right]);

        // Calcolo della riga (y)
        const assignedRows = {};
        documents.forEach((doc) => {
            let row = 0;
            while (
                Object.values(assignedRows).some(
                    (assigned) =>
                        assigned.row === row &&
                        Math.abs(xScale(assigned.date) - xScale(doc.date)) < 50
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

        // Definizione dello zoom bidimensionale
        const zoom = d3
            .zoom()
            .scaleExtent([1, 10]) // Zoom minimo e massimo
            .translateExtent([ [0, 0], [width, adjustedHeight] ]) // Limiti di traslazione
            .on("zoom", (event) => {
                const transform = event.transform;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);

                // Aggiorna gli assi
                svg.select(".x-axis").call(d3.axisBottom(newXScale));
                svg.select(".y-axis").call(d3.axisLeft(newYScale));

                // Aggiorna cerchi e linee
                svg.selectAll(".documents circle")
                    .attr("cx", (d) => newXScale(assignedRows[d.id].date))
                    .attr("cy", (d) => newYScale(assignedRows[d.id].row));

                svg.selectAll(".connections line")
                    .attr("x1", (d) => newXScale(assignedRows[d.source].date))
                    .attr("x2", (d) => newXScale(assignedRows[d.target].date))
                    .attr("y1", (d) => newYScale(assignedRows[d.source].row))
                    .attr("y2", (d) => newYScale(assignedRows[d.target].row));

                // Aggiorna i titoli
                svg.selectAll(".titles text")
                    .attr("x", (d) => newXScale(d.date))
                    .attr("y", (d) => newYScale(d.row) - 10);
            });

        svg.call(zoom);

        // Aggiungi asse X
        svg.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0, ${adjustedHeight - margin.bottom})`)
            .call(d3.axisBottom(xScale));

        // Aggiungi asse Y (secondario per i documenti)
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(d3.axisLeft(yScale).ticks(maxRow));

        // Aggiungi connessioni
        svg.append("g")
            .attr("class", "connections")
            .selectAll("line")
            .data(connections)
            .join("line")
            .attr("x1", (d) => xScale(assignedRows[d.source].date))
            .attr("x2", (d) => xScale(assignedRows[d.target].date))
            .attr("y1", (d) => yScale(assignedRows[d.source].row))
            .attr("y2", (d) => yScale(assignedRows[d.target].row))
            .attr("stroke", "black")
            .attr("marker-end", "url(#arrow)");

        // Aggiungi cerchi per i documenti
        svg.append("g")
            .attr("class", "documents")
            .selectAll("circle")
            .data(Object.values(assignedRows))
            .join("circle")
            .attr("cx", (d) => xScale(d.date))
            .attr("cy", (d) => yScale(d.row))
            .attr("r", 5)
            .attr("fill", "blue");

        // Aggiungi titoli
        svg.append("g")
            .attr("class", "titles")
            .selectAll("text")
            .data(Object.values(assignedRows))
            .join("text")
            .attr("x", (d) => xScale(d.date))
            .attr("y", (d) => yScale(d.row) - 10)
            .text((d) => d.title)
            .attr("text-anchor", "middle")
            .attr("font-size", 10);
    }, [width, height]);

    return <svg ref={svgRef}></svg>;
};

export default TimelineDiagram;
