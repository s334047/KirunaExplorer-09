import React from 'react';
import { Card, ListGroup, Button } from 'react-bootstrap';

const LegendCard = ({ maxHeight, setLegendVisible }) => {
    const icons = [
        { icon: 'Informative Document.png', label: 'Informative document' },
        { icon: 'Prescriptive Document.png', label: 'Prescriptive document' },
        { icon: 'Design Document.png', label: 'Design document' },
        { icon: 'Technical Document.png', label: 'Technical document' },
        { icon: 'Material Effect.png', label: 'Material effect' },
        { icon: 'Consultation.png', label: 'Consultation' },
        { icon: 'Conflict.png', label: 'Conflict' },
        { icon: 'Agreement.png', label: 'Agreement' },
    ];

    const connectionStyles = [
        { color: 'red', label: 'Projection (Dashed line)' },
        { color: 'blue', label: 'Update (Mixed line)' },
        { color: 'green', label: 'Collateral Consequence (Spaced line)' },
        { color: 'black', label: 'Direct Consequence (Dotted line)' },
    ];

    const handleClose = () => {
        setLegendVisible(false);
    };

    return (
        <Card style={{ height: maxHeight }}>
            <Card.Body>
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <div style={{ flex: 1 }} />
                    <button
                        className="btn btn-close"
                        onClick={() => {
                            setLegendVisible(false);
                        }}
                        aria-label="Close"
                    />
                </div>
                <Card.Subtitle className="mb-3">Icons:</Card.Subtitle>
                <ListGroup variant="flush">
                    {icons.map((icon, index) => (
                        <ListGroup.Item key={index} style={{ display: 'flex', alignItems: 'center' }}>
                            <img src={icon.icon} alt={icon.label} style={{ width: 20, height: 20, marginRight: 10 }} />
                            <span>{icon.label}</span>
                        </ListGroup.Item>
                    ))}
                </ListGroup>

                <Card.Subtitle className="mt-4 mb-3">Connections:</Card.Subtitle>
                <ListGroup variant="flush">
                    {connectionStyles.map((style, index) => (
                        <ListGroup.Item key={index} style={{ color: style.color }}>
                            <b>{style.label}</b>
                        </ListGroup.Item>
                    ))}
                </ListGroup>
            </Card.Body>
        </Card>
    );
};

export default LegendCard;