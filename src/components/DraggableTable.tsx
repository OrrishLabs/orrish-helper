import { useEffect, useState } from 'react';
import { List, arrayMove } from 'react-movable';
import { Step } from '../model/step.model';

function DraggableTable(props: any) {

    const tableStyles = {
        background: '#eaebec',
        borderSpacing: 0
    };

    const thStyles = {
        borderBottom: '2px solid #ddd',
        padding: '5px',
        background: '#ededed',
        color: '#666',
        textAlign: 'center',
        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif'
    } as React.CSSProperties;

    const tdStyles = (width?: string): React.CSSProperties => ({
        borderBottom: '1px solid #ddd',
        color: '#666',
        fontFamily: 'Arial, "Helvetica Neue", Helvetica, sans-serif',
        padding: '5px',
        textAlign: 'left',
        width
    });

    const [widths, setWidths] = useState<string[]>([]);
    const [items, setItems] = useState<Step[]>(JSON.parse(props.stepsAsString));

    useEffect(() => {
        props.updateModifiedRows(items);
    }, [items]);

    return (
        <div
            style={{
                padding: '3em',
                display: 'flex',
                justifyContent: 'center'
            }}
        >
            <List
                beforeDrag={({ elements, index }) => {
                    const cells = Array.from(elements[index].children);
                    const widths = cells.map(cell => window.getComputedStyle(cell).width);
                    setWidths(widths);
                }}
                values={items}
                onChange={({ oldIndex, newIndex }) => {
                    setItems(arrayMove(items, oldIndex, newIndex));
                }}
                renderList={({ children, props, isDragged }) => (
                    <table
                        style={{
                            ...tableStyles,
                            cursor: isDragged ? 'grabbing' : undefined
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={thStyles}>Step</th>
                                <th style={thStyles}>Step Help</th>
                            </tr>
                        </thead>
                        <tbody {...props}>{children}</tbody>
                    </table>
                )}
                renderItem={({ value, props, isDragged, isSelected }) => {
                    const _widths = isDragged ? widths : [];
                    const row = (
                        <tr
                            {...props}
                            style={{
                                ...props.style,
                                cursor: isDragged ? 'grabbing' : 'grab',
                                backgroundColor: isDragged || isSelected ? '#EEE' : '#fafafa'
                            }}
                        >
                            <td style={tdStyles(_widths[0])}>{value.step}</td>
                            <td style={tdStyles(_widths[1])}>{value.help}</td>
                        </tr>
                    );
                    return isDragged ? (
                        <table style={{ ...props.style, borderSpacing: 0 }}>
                            <tbody>{row}</tbody>
                        </table>
                    ) : (
                        row
                    );
                }}
            />
        </div>
    );
};

export default DraggableTable;
