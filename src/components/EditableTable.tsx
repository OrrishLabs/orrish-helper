import { useCallback, useMemo, useRef, useState } from 'react';
import { AgGridReact } from 'ag-grid-react';
import 'ag-grid-community/dist/styles/ag-grid.css';
import 'ag-grid-community/dist/styles/ag-theme-alpine.css';
import { CellEvent, CellValueChangedEvent, RowDragCallbackParams, RowDragEndEvent } from 'ag-grid-community';
import { Add, Delete } from '@mui/icons-material';
import { IconButton } from '@mui/material';
import { Step } from '../model/step.model';

const EditableTable = (props: any) => {

    const gridRef = useRef();
    const containerStyle = useMemo(() => ({ width: '100%', height: '100%' }), []);
    const gridStyle = useMemo(() => ({ height: 500, width: 1000 }), []);
    const [rowData] = useState(JSON.parse(props.stepsAsString));

    const onRowDragCallback = (params: RowDragCallbackParams): boolean => {
        return (params.colDef.field.includes('step'));
    }

    const onRowDragEnd = (event: RowDragEndEvent) => {
        let data = event.node.parent.allLeafChildren.map(e => { return { ...e.data, 'id': e.childIndex + 1 } });
        event.api.setRowData(data);
        props.updateSuggestions(data);
    }

    let updateSuggestions = props.updateSuggestions

    const onCellValueChanged = useCallback((event: CellValueChangedEvent) => {
        let items = event.node.parent.allLeafChildren.map(e => { return { ...e.data } });
        updateSuggestions(items);
    }, [updateSuggestions]);

    const onDelete = (event: CellEvent) => {
        let items: Step[] = event.node.parent.allLeafChildren.map(e => { return { ...e.data } });
        items.splice(event.rowIndex, 1);
        let count = 1;
        items = items.map(e => { return { ...e, 'id': count++ } });
        event.api.setRowData(items);
        props.updateSuggestions(items);
    }

    const onAddRow = (event: CellEvent) => {
        let items: Step[] = event.node.parent.allLeafChildren.map(e => { return { ...e.data } });
        items.splice(event.rowIndex + 1, 0, { id: items.length, step: '', help: '' });
        let count = 1;
        items = items.map(e => { return { ...e, 'id': count++ } });
        event.api.setRowData(items);
        props.updateSuggestions(items);
    }

    const [columnDefs] = useState([
        { field: 'step' },
        { field: 'help' },
        {
            field: '', flex: 0.15, cellStyle: { padding: '0' }, editable: false, cellRenderer: function (e: CellEvent) {
                return <IconButton size="small" color='warning' onClick={() => onDelete(e)}>
                    <Delete />
                </IconButton>
            }
        },
        {
            field: '', flex: 0.15, cellStyle: { padding: '0' }, editable: false, cellRenderer: function (e: CellEvent) {
                return <IconButton size="small" color='success' onClick={() => onAddRow(e)}>
                    <Add />
                </IconButton>
            }
        }
    ]);

    const defaultColDef = useMemo(() => {
        return {
            flex: 1,
            editable: true,
            rowDrag: onRowDragCallback,
            onCellValueChanged: onCellValueChanged,
        };
    }, [onCellValueChanged]);

    const getRowId = useCallback(function (params) {
        return params.data.id;
    }, []);

    return (
        <div style={containerStyle}>
            <div className="example-wrapper">
                <div style={gridStyle} className="ag-theme-alpine">
                    <AgGridReact
                        ref={gridRef}
                        rowData={rowData}
                        columnDefs={columnDefs}
                        defaultColDef={defaultColDef}
                        animateRows={true}
                        getRowId={getRowId}
                        rowDragEntireRow={true}
                        rowDragManaged={true}
                        onRowDragEnd={onRowDragEnd}
                    ></AgGridReact>
                </div>
            </div>
        </div>
    );
};

export default EditableTable;
