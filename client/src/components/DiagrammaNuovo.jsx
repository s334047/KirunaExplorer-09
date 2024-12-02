import { useEffect, useRef } from "react";
import * as d3 from "d3";
import PropTypes from 'prop-types';

const TimelineDiagram = ({ documents, connections }) => {
    const svgRef = useRef(null);
    const height = document.documentElement.clientHeight * 0.9;
    const width = document.documentElement.clientWidth;

    useEffect(() => {
        const margin = { top: 20, right: 50, bottom: 20, left: 50 };
        const rowHeight = 70;

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
            .translateExtent([[0, 0], [width, adjustedHeight]]) // Limiti di traslazione
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
    }, [width, height, documents, connections]);

    return <svg ref={svgRef}></svg>;
};

TimelineDiagram.propTypes = {
    documents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            date: PropTypes.instanceOf(Date).isRequired,
        })
    ).isRequired,
    connections: PropTypes.arrayOf(
        PropTypes.shape({
            source: PropTypes.number.isRequired,
            target: PropTypes.number.isRequired,
        })
    ).isRequired,
};

export default TimelineDiagram;