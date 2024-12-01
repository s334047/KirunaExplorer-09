import { useEffect, useRef } from "react";
import * as d3 from "d3";

const TimelineDiagram = () => {
    const svgRef = useRef(null);
    const height = document.documentElement.clientHeight * 0.9;
    const width = document.documentElement.clientWidth;

    useEffect(() => {
        const margin = { top: 20, right: 20, bottom: 40, left: 20 };
        const innerWidth = width - margin.left - margin.right;
        const innerHeight = height - margin.top - margin.bottom;

        const svg = d3.select(svgRef.current)
            .attr("width", width)
            .attr("height", height);

        const g = svg.append("g")
            .attr("transform", `translate(${margin.left},${margin.top})`);

        // Define scales and axes
        const xScale = d3.scaleTime()
            .domain([new Date("2024-01-01"), new Date("2024-05-01")])
            .range([0, innerWidth]);

        const yScale = d3.scaleLinear()
            .domain([0, 50]) // Supponendo 50 righe/documenti
            .range([innerHeight, 0]);

        const xAxis = g.append("g")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(xScale));

        const yAxis = g.append("g")
            .call(d3.axisLeft(yScale));

        // Dummy data for documents
        const documents = [
            { id: 1, title: "Doc 1", date: new Date("2024-01-15") },
            { id: 2, title: "Doc 2", date: new Date("2024-02-01") },
            { id: 3, title: "Doc 3", date: new Date("2024-03-01") },
        ];

        // Draw circles for documents
        const nodes = g.selectAll("circle")
            .data(documents)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.date))
            .attr("cy", d => yScale(d.id))
            .attr("r", 5)
            .style("fill", "blue");

        // Add zoom behavior
        const zoom = d3.zoom()
            .scaleExtent([1, 10]) // Zoom minimo e massimo
            .translateExtent([[0, 0], [innerWidth, innerHeight]]) // Limiti di traslazione
            .on("zoom", (event) => {
                const transform = event.transform;

                // Aggiorna le scale
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);

                // Aggiorna gli assi
                xAxis.call(d3.axisBottom(newXScale));
                yAxis.call(d3.axisLeft(newYScale));

                // Aggiorna le posizioni dei nodi
                nodes.attr("cx", d => newXScale(d.date))
                    .attr("cy", d => newYScale(d.id));
            });

        // Rect invisibile per catturare eventi di zoom
        svg.append("rect")
            .attr("width", innerWidth)
            .attr("height", innerHeight)
            .attr("fill", "none")
            .attr("pointer-events", "all")
            .attr("transform", `translate(${margin.left},${margin.top})`)
            .call(zoom);
    }, [height, width]);

    return <svg ref={svgRef}></svg>;
};

export default TimelineDiagram;
