import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import DocumentCard from "./DocCard";
import { Container, Row, Col, Button, Collapse } from "react-bootstrap";

const TimelineDiagram = ({ documents, user, setTitle, connections }) => {
    const svgRef = useRef(null);
    const height = document.documentElement.clientHeight * 0.9;
    const width = document.documentElement.clientWidth;
    const [selectedDoc, setSelectedDoc] = useState(null);
    const [legendVisible, setLegendVisible] = useState(false); // State to show/hide the legend
    useEffect(() => {
        const margin = { top: 30, right: 50, bottom: 50, left: 50 };
        const maxHeight = height * 0.9; // Maximum height available (90% of the viewport height)
        const circleRadius = 10;
        const linePadding = 30; // Greater line spacing
        const minLineDistance = 30; // Minimum distance between the line and the circles (to avoid intersections)
        // Parsing and formatting dates
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
        // Assign rows (y positions)
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
        const rowHeight = Math.max(40, maxHeight / (maxRow + 1)); // Dynamic height with a minimum of 40px
        const adjustedHeight = margin.top + (maxRow + 1) * rowHeight + margin.bottom;
        const yScale = d3
            .scaleLinear()
            .domain([0, maxRow])
            .range([margin.top, adjustedHeight - margin.bottom]);

        const svgElement = svgRef.current;
        if (!svgElement) return;
        const svg = d3.select(svgElement).attr("width", width).attr("height", adjustedHeight);
        svg.selectAll("*").remove();
        // Add axes
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
        // Group connections by source-destination pair
        const groupedConnections = d3.group(
            connections,
            (d) => `${d.source}-${d.target}`
        );
        // Add Bézier curves for the connections
        svg.append("g")
            .attr("class", "connections")
            .selectAll("path")
            .data(Array.from(groupedConnections.values()).flat())
            .join("path")
            .attr("d", (d, index) => {
                const group = groupedConnections.get(`${d.source}-${d.target}`);
                const offset = (index - (group.length - 1) / 2) * linePadding; // Space between lines
                // Calculate the minimum distance between the curve and the circles
                const ySource = yScale(assignedRows[d.source].row);
                const yTarget = yScale(assignedRows[d.target].row);
                // Ensure the curve does not intersect the circles by calculating an offset
                const adjustedControlOffset = Math.max(minLineDistance, Math.abs(offset) * 2);
                // Calculate the control point for the curve, which will curve downward
                return d3.line()
                    .x((d) => d[0])
                    .y((d) => d[1])
                    .curve(d3.curveBundle.beta(0.8))([
                        [xScale(assignedRows[d.source].date), ySource],
                        [
                            (xScale(assignedRows[d.source].date) +
                                xScale(assignedRows[d.target].date)) /
                            2,
                            (ySource + yTarget) / 2 + adjustedControlOffset, // Downward curvature
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
                // Define the line style based on the type of connection
                if (d.type === "Projection") return "5,5"; // Dashed line
                if (d.type === "Update") return "10,4";
                return "0"; // Solid line
            })
            .attr("marker-end", "url(#arrow)");
        // Add circles for the documents
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
                // Event handler for click on the circle
                setSelectedDoc(d);
                // Here you can add further logic to handle the click, like opening a modal or navigating
            });
        // Add vertical gridlines
        const makeXGridlines = () => d3.axisBottom(xScale);
        svg.append("g")
            .attr("class", "grid grid-x")
            .attr("transform", `translate(0, ${adjustedHeight - margin.bottom})`)
            .call(
                makeXGridlines()
                    .tickSize(-adjustedHeight + margin.top + margin.bottom) // Full height of the graph
                    .tickFormat("") // No labels
            )
            .selectAll("line")
            .attr("stroke", "#5e5e5e")
            .attr("stroke-dasharray", "3,3");
        const zoom = d3
            .zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width, adjustedHeight]])
            .on("zoom", (event) => {
                const transform = event.transform;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);

                // Aggiorna assi
                svg.select(".x-axis").call(d3.axisBottom(newXScale));
                svg.select(".y-axis").call(d3.axisLeft(newYScale));

                // Aggiorna griglia
                svg.select(".grid-x")
                    .call(
                        d3.axisBottom(newXScale)
                            .tickSize(-adjustedHeight + margin.top + margin.bottom)
                            .tickFormat("")
                    )
                    .selectAll("line")
                    .attr("stroke", "#5e5e5e")
                    .attr("stroke-dasharray", "3,3"); // Mantieni tratteggio

                // Aggiorna cerchi
                svg.selectAll(".documents circle")
                    .attr("cx", (d) => newXScale(d.date))
                    .attr("cy", (d) => newYScale(d.row));

                // Aggiorna curve di Bézier
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
                                        newXScale(assignedRows[d.target].date)) / 2,
                                    (ySource + yTarget) / 2 + adjustedControlOffset,
                                ],
                                [newXScale(assignedRows[d.target].date), yTarget],
                            ]);
                    });
            });
        svg.call(zoom);
    }, [width, height, documents, connections]);

    return (<Container style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        {selectedDoc && <DocumentCard selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} user={user} excludeTitle={setTitle} />}
        <div style={{ marginTop: "20px" }}>
            <Row className="align-items-center">
                <Col xs="auto">
                    <Button
                        variant="primary"
                        onClick={() => setLegendVisible((prev) => !prev)}
                        style={{ marginLeft: "20px" }}
                    >
                        {legendVisible ? "Nascondi Legenda" : "Mostra Legenda"}
                    </Button>
                </Col>
                <Col>
                    <Collapse in={legendVisible}>
                        <div>
                            <Row className="align-items-center text-center">
                                <Col xs="4">
                                    <span style={{ color: "red" }}><b>Projection</b></span>  (Dashed line)
                                </Col>
                                <Col xs="4">
                                    <span style={{ color: "blue" }}><b>Update </b></span> (long dashed line)
                                </Col>
                                <Col xs="4">
                                    <span style={{ color: "black" }}><b>Other </b></span> (solid line)
                                </Col>
                            </Row>
                        </div>
                    </Collapse>
                </Col>
            </Row>
            <Row>
                <Col>
                    <svg ref={svgRef} style={{ marginTop: "5px" }}></svg>
                </Col>
            </Row>
        </div>
    </Container>);
};

TimelineDiagram.propTypes = {
    documents: PropTypes.arrayOf(
        PropTypes.shape({
            id: PropTypes.number.isRequired,
            title: PropTypes.string.isRequired,
            date: PropTypes.string.isRequired,
        })
    ).isRequired,
    user: PropTypes.object.isRequired,
    setTitle: PropTypes.func.isRequired,
    connections: PropTypes.arrayOf(
        PropTypes.shape({
            source: PropTypes.number.isRequired,
            target: PropTypes.number.isRequired,
            type: PropTypes.string.isRequired,
        })
    ).isRequired,
};

export default TimelineDiagram;

