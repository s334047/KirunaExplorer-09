import { useEffect, useRef, useState } from "react";
import * as d3 from "d3";
import PropTypes from "prop-types";
import dayjs from "dayjs";
import { useLocation } from 'react-router-dom';
import { DocumentModal } from "./DocumentShowInfo";
import LegendCard from "./Legend";

import { Container, Row, Col, Button } from "react-bootstrap";

const TimelineDiagram = ({ documents, connections }) => {
    const svgRef = useRef(null);
    const height = document.documentElement.clientHeight * 0.80;
    const [width, setWidth] = useState(document.documentElement.clientWidth);
    const location = useLocation();
    const docFromMap = location.state?.docFromMap;
    const [selectedDoc, setSelectedDoc] = useState(
        docFromMap || null
    );
    const [legendVisible, setLegendVisible] = useState(false);
    const [tooltip, setTooltip] = useState({ visible: false, x: 0, y: 0, name: "" });

    const icons = {
        'Informative document': 'Informative Document.png',
        'Design document': 'Design Document.png',
        'Prescriptive document': 'Prescriptive Document.png',
        'Technical document': 'Technical Document.png',
        'Material effect': 'Material Effect.png',
        'Consultation': 'Consultation.png',
        'Conflict': 'Conflict.png',
        'Agreement': 'Agreement.png',
    };

    // Handle resizing when the card is visible
    useEffect(() => {
        const handleResize = () => {
            const containerWidth = document.documentElement.clientWidth * (selectedDoc || legendVisible ? 0.65 : 0.96); // Adjust width
            setWidth(containerWidth);
        };

        handleResize();
    }, [selectedDoc, legendVisible]);

    useEffect(() => {
        const margin = { top: 30, right: 20, bottom: 50, left: 150 };
        const maxHeight = height * 0.9; // Maximum height available (90% of the viewport height)
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
        const dateExtent = d3.extent(documents, (d) => d.date);
        const extendedDomain = [
            dayjs(dateExtent[0]).subtract(1, "year").toDate(),
            dayjs(dateExtent[1]).add(1, "year").toDate()
        ];

        const xScale = d3
            .scaleTime()
            .domain(extendedDomain)
            .range([margin.left, width - margin.right]);
        // Create a map of scales to assign unique row numbers
        const scaleMap = {};
        let currentRow = 0;
        documents.forEach((doc) => {
            if (!scaleMap[doc.scale]) {
                scaleMap[doc.scale] = currentRow++;
            }
        });

        // Assign rows (y positions) based on the scale of the document
        const assignedRows = {};
        documents.forEach((doc) => {
            assignedRows[doc.id] = { ...doc, row: scaleMap[doc.scale] };
        });

        const maxRow = Math.max(...Object.values(assignedRows).map((d) => d.row));
        const rowHeight = Math.max(40, maxHeight / (maxRow + 1)); // Dynamic height with a minimum of 40px
        const adjustedHeight = margin.top + (maxRow + 1) * rowHeight + margin.bottom;
        const yScale = d3
            .scaleLinear()
            .domain([0, maxRow + 1])
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
            .call(xAxis)
            .selectAll("text") // Seleziona tutti i testi dell"asse x
            .style("font-size", "16px"); // Imposta la dimensione del font
        const yAxis = d3.axisLeft(yScale).ticks(maxRow).tickFormat((d) => {
            const scale = Object.keys(scaleMap).find(key => scaleMap[key] === d);
            return scale || "";
        });
        svg.append("g")
            .attr("class", "y-axis")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(yAxis)
            .selectAll("text") // Seleziona tutti i testi dell"asse x
            .style("font-size", "16px"); // Imposta la dimensione del font;
        // Group connections by source-destination pair
        const groupedConnections = d3.group(
            connections,
            (d) => `${d.source}-${d.target}`
        );
        svg.append("defs")
        .append("clipPath")
        .attr("id", "clip-diagram")
        .append("rect")
        .attr("x", margin.left)
        .attr("y", margin.top)
        .attr("width", width - margin.left - margin.right)
        .attr("height", adjustedHeight - margin.top - margin.bottom);
        // Add Bézier curves for the connections
        svg.append("g")
            .attr("class", "connections")
            .selectAll("path")
            .data(Array.from(groupedConnections.values()).flat())
            .join("path")
            .attr("d", (d, index) => {
                const group = groupedConnections.get(`${d.source}-${d.target}`);
                const offset = (index - (group.length - 1) / 2) * linePadding;

                const xSource = xScale(assignedRows[d.source].date);
                const xTarget = xScale(assignedRows[d.target].date);
                const ySource = yScale(assignedRows[d.source].row);
                const yTarget = yScale(assignedRows[d.target].row);

                // Distanza orizzontale tra source e target
                const horizontalDistance = Math.abs(xTarget - xSource);

                const maxCurvature = horizontalDistance / 4; // Curvatura massima proporzionale alla distanza
                const adjustedControlOffset = Math.min(Math.max(minLineDistance, Math.abs(offset) * 2), maxCurvature);

                // Generazione della linea con curvatura limitata
                return d3.line()
                    .x((d) => d[0])
                    .y((d) => d[1])
                    .curve(d3.curveBundle.beta(0.8))([
                        [xSource, ySource],
                        [
                            (xSource + xTarget) / 2, // Punto medio orizzontale
                            (ySource + yTarget) / 2 + adjustedControlOffset, // Curvatura limitata
                        ],
                        [xTarget, yTarget],
                    ]);
            })
            .attr("stroke", (d) => {
                if (d.type === "Projection") return "red";
                if (d.type === "Update") return "blue";
                if (d.type === "Collateral Consequence") return "green";
                if (d.type === "Direct Consequence") return "black";
                return "black";
            })
            .attr("stroke-width", 4)
            .attr("fill", "none")
            .attr("stroke-dasharray", (d) => {
                if (d.type === "Projection") return "5,5";
                if (d.type === "Update") return "4,10,4";
                if (d.type === "Direct Consequence") return "2,2";
                if (d.type === "Collateral Consequence") return "4,10";
                return "0"; // Solid line
            })
            .attr("marker-end", "url(#arrow)")
            .on("mouseover", (event, d) => {
                setTooltip({ visible: true, x: event.pageX, y: event.pageY, name: d.type });
            })
            .on("mouseout", () => {
                setTooltip({ visible: false, x: 0, y: 0, name: "" });
            });

        // Add images for the documents
        svg.append("g")
            .attr("class", "documents")
            .raise()
            .selectAll("circle")
            .data(Object.values(assignedRows))
            .join("image")
            .attr("xlink:href", (d) => icons[d.type])
            .attr("x", (d) => xScale(d.date) - 17.5)
            .attr("y", (d) => yScale(d.row) - 17.5)
            .attr("width", (d) => {
                if (selectedDoc) {
                    if (selectedDoc.title == d.title) {
                        return 50
                    }
                    else {
                        return 35
                    }
                }
                else {
                    return 35
                }
            }) // Condizione per la larghezza
            .attr("height", (d) => {
                if (selectedDoc) {
                    if (selectedDoc.title == d.title) {
                        return 50
                    }
                    else {
                        return 35
                    }
                }
                else {
                    return 35
                }
            })
            .style("z-index", "10")
            .on("click", (_, d) => {
                // Event handler for click on the circle
                setSelectedDoc(d);
                setLegendVisible(false);
                // Here you can add further logic to handle the click, like opening a modal or navigating
            }).on("mouseover", (event, d) => {
                setTooltip({ visible: true, x: event.pageX, y: event.pageY, name: d.title });
            })
            .on("mouseout", () => {
                setTooltip({ visible: false, x: 0, y: 0, name: "" });
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
        // Funzione per generare le linee della griglia sull'asse y
        const yTickValues = Object.values(scaleMap);
        const makeYGridlines = () => d3.axisLeft(yScale).tickValues(yTickValues);
        // Aggiungi griglia y
        svg.append("g")
            .attr("class", "grid grid-y")
            .attr("transform", `translate(${margin.left}, 0)`)
            .call(
                makeYGridlines()
                    .tickSize(-width + margin.left + margin.right) // Full width of the graph
                    .tickFormat("") // No labels
            )
            .selectAll("line")
            .attr("stroke", "#5e5e5e")
            .attr("stroke-dasharray", "3,3");
        svg.select(".connections").attr("clip-path", "url(#clip-diagram)");
        svg.select(".documents").attr("clip-path", "url(#clip-diagram)");
        const zoom = d3
            .zoom()
            .scaleExtent([1, 10])
            .translateExtent([[0, 0], [width, adjustedHeight]])
            .on("zoom", (event) => {
                const transform = event.transform;
                const newXScale = transform.rescaleX(xScale);
                const newYScale = transform.rescaleY(yScale);


                // Aggiorna assi
                svg.select(".x-axis").call(d3.axisBottom(newXScale)).selectAll("text").style("font-size", "16px");
                svg.select(".y-axis").call(d3.axisLeft(newYScale).tickValues(yTickValues).tickFormat((d) => {
                    const scale = Object.keys(scaleMap).find(key => scaleMap[key] === d);
                    return scale || "";
                })).selectAll("text").style("font-size", "16px");

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

                // Aggiorna griglia y
                svg.select(".grid-y")
                    .call(
                        d3.axisLeft(newYScale).tickValues(yTickValues)
                            .tickSize(-width + margin.left + margin.right)
                            .tickFormat("")
                    )
                    .selectAll("line")
                    .attr("stroke", "#5e5e5e")
                    .attr("stroke-dasharray", "3,3"); // Mantieni tratteggio

                // Aggiorna cerchi
                svg.selectAll(".documents image")
                    .attr("x", (d) => newXScale(d.date) - 17.5)
                    .attr("y", (d) => newYScale(d.row) - 17.5);

                // Aggiorna curve di Bézier
                svg.selectAll(".connections path")
                    .attr("d", (d, index) => {
                        const group = groupedConnections.get(`${d.source}-${d.target}`);
                        const offset = (index - (group.length - 1) / 2) * linePadding;

                        // Nuove coordinate con le scale aggiornate (post zoom)
                        const xSource = newXScale(assignedRows[d.source].date);
                        const xTarget = newXScale(assignedRows[d.target].date);
                        const ySource = newYScale(assignedRows[d.source].row);
                        const yTarget = newYScale(assignedRows[d.target].row);

                        // Calcolo della distanza orizzontale tra source e target
                        const horizontalDistance = Math.abs(xTarget - xSource);

                        // Limita la curvatura in base alla distanza orizzontale
                        const maxCurvature = horizontalDistance / 4; // Curvatura massima proporzionale alla distanza
                        const adjustedControlOffset = Math.min(Math.max(minLineDistance, Math.abs(offset) * 2), maxCurvature);

                        // Generazione della linea con curvatura limitata
                        return d3.line()
                            .x((d) => d[0])
                            .y((d) => d[1])
                            .curve(d3.curveBundle.beta(0.8))([
                                [xSource, ySource],
                                [
                                    (xSource + xTarget) / 2, // Punto medio orizzontale
                                    (ySource + yTarget) / 2 + adjustedControlOffset, // Curvatura limitata
                                ],
                                [xTarget, yTarget],
                            ]);
                    });

            });
        svg.call(zoom);
    }, [width, height, documents, connections, selectedDoc]);

    return (
        <Container fluid center >
            <Row className="align-left">
                <Col xs="2">

                    <Button
                        variant="link"
                        onClick={() => {
                            setLegendVisible(!legendVisible);
                            setSelectedDoc(null);
                        }
                        }
                        style={{
                            backgroundColor: "transparent",
                        }}
                        disabled={legendVisible}
                    >
                        <i className="bi bi-info-circle" style={{ fontSize: "1.5rem", color: "#154109" }}></i>
                    </Button>
                </Col>
            </Row>
            <Row>
                {legendVisible && (
                    <Col xs={3} style={{ padding: "20px" }}>
                        <LegendCard maxHeight={height - 50} setLegendVisible={setLegendVisible} />
                    </Col>
                )}
                <Col
                    xs={selectedDoc || legendVisible ? 8 : 12}
                    style={{
                        transition: "all 0.3s ease-in-out",
                        overflow: "hidden",
                    }}
                >
                    <svg ref={svgRef}></svg>
                    {tooltip.visible && (
                        <div
                            style={{
                                position: "absolute",
                                left: tooltip.x + 10,
                                top: tooltip.y + 10,
                                backgroundColor: "white",
                                border: "1px solid black",
                                padding: "5px",
                                pointerEvents: "none",
                                zIndex: 1000,
                            }}
                        >
                            {tooltip.name}
                        </div>
                    )}
                </Col>
                {selectedDoc && (
                    <Col xs={4} style={{ padding: "20px" }}>
                        <DocumentModal documents={documents} selectedDoc={selectedDoc} setSelectedDoc={setSelectedDoc} maxHeight={height - 50} />
                    </Col>
                )}
            </Row>
        </Container>
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
