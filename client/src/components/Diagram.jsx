import { useState, useEffect } from "react";
import * as d3 from "d3";

const Diagram = () => {
    // const width = 928;
    // const height = 600;
    const height = document.documentElement.clientHeight * 0.9;
    const width = document.documentElement.clientWidth;

    const [nodes, setNodes] = useState([]);
    const [links, setLinks] = useState([]);

    useEffect(() => {
        // Clear the SVG content before appending new elements
        // Cannot put it inside of the use effect
        d3.select("#Diagram").selectAll("*").remove();
        // Carica i dati dal file CSV
        d3.csv("/suits.csv").then((data) => {
            const types = Array.from(new Set(data.map((d) => d.type)));
            const nodes = Array.from(
                new Set(data.flatMap((d) => [d.source, d.target])),
                (id) => ({ id })
            );
            const links = data.map((d) => ({ ...d }));

            setNodes(nodes);
            setLinks(links);

            const color = d3.scaleOrdinal(types, d3.schemeCategory10);

            const simulation = d3.forceSimulation(nodes)
                .force("link", d3.forceLink(links).id((d) => d.id))
                .force("charge", d3.forceManyBody().strength(-400))
                .force("x", d3.forceX())
                .force("y", d3.forceY());

            const svg = d3.select("#Diagram")
                .attr("viewBox", [-width / 2, -height / 2, width, height])
                .attr("style", "max-width: 100%; height: auto; font: 12px sans-serif;");

            svg.append("defs").selectAll("marker")
                .data(types)
                .join("marker")
                .attr("id", (d) => `arrow-${d}`)
                .attr("viewBox", "0 -5 10 10")
                .attr("refX", 15)
                .attr("refY", -0.5)
                .attr("markerWidth", 6)
                .attr("markerHeight", 6)
                .attr("orient", "auto")
                .append("path")
                .attr("fill", color)
                .attr("d", "M0,-5L10,0L0,5");

            const link = svg.append("g")
                .attr("fill", "none")
                .attr("stroke-width", 1.5)
                .selectAll("path")
                .data(links)
                .join("path")
                .attr("stroke", (d) => color(d.type))
                .attr("marker-end", (d) => `url(#arrow-${d.type})`);

            const node = svg.append("g")
                .attr("fill", "currentColor")
                .attr("stroke-linecap", "round")
                .attr("stroke-linejoin", "round")
                .selectAll("g")
                .data(nodes)
                .join("g")
                .call(
                    d3.drag()
                        .on("start", (event, d) => dragStarted(event, d, simulation))
                        .on("drag", dragged)
                        .on("end", (event, d) => dragEnded(event, d, simulation))
                );

            node.append("circle")
                .attr("stroke", "white")
                .attr("stroke-width", 1.5)
                .attr("r", 4);

            node.append("text")
                .attr("x", 8)
                .attr("y", "0.31em")
                .text((d) => d.id)
                .clone(true).lower()
                .attr("fill", "none")
                .attr("stroke", "white")
                .attr("stroke-width", 3);

            simulation.on("tick", () => {
                link.attr("d", linkArc);
                node.attr("transform", (d) => `translate(${d.x},${d.y})`);
            });
        });
        // set invalidation
    }, [height, width]);

    const dragStarted = (event, d, simulation) => {
        if (!event.active) simulation.alphaTarget(0.3).restart();
        d.fx = d.x;
        d.fy = d.y;
    };

    const dragged = (event, d) => {
        d.fx = event.x;
        d.fy = event.y;
    };

    const dragEnded = (event, d, simulation) => {
        if (!event.active) simulation.alphaTarget(0);
        d.fx = null;
        d.fy = null;
    };

    const linkArc = (d) => {
        const r = Math.hypot(d.target.x - d.source.x, d.target.y - d.source.y);
        return `
      M${d.source.x},${d.source.y}
      A${r},${r} 0 0,1 ${d.target.x},${d.target.y}
    `;
    };

    return <svg width={width} height={height} id="Diagram" />;
};

export default Diagram;
