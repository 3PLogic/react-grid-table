import React, { useRef, useEffect, useState } from 'react';
import {SortableElement, SortableHandle} from 'react-sortable-hoc';
import useResizeEvents from '../hooks/useResizeEvents';

const SortableItem = SortableElement(({children, index, columnId, className}) => <div className={className} data-column-id={columnId} key={index}>{children}</div>);
const DragHandle = SortableHandle(({children, index}) => <React.Fragment>{children}</React.Fragment>);

const HeaderCell = (props) => {

    let {
        index, 
        column,
        tableManager,
    } = props;

    let {
        params: {
            sort,
            isHeaderSticky,
            disableColumnsReorder
        },
        components: {
            dragHandleComponent
        },
        handlers: {
            handleSort,
            toggleSelectAll,
            handleResizeEnd,
            handleResize,
            getIsRowSelectable
        },
        icons: {
            sortAscending: sortAscendingIcon,
            sortDescending: sortDescendingIcon,
        },
        columnsData: {
            visibleColumns
        },
        rowsData: {
            selectedRows,
            pageItems,
            rowIdField
        },
        additionalProps: {
            headerCell: additionalProps
        }
    } = tableManager;
    
    let resizeHandleRef = useRef(null);
    let selectAllRef = useRef(null);

    const [target, setTarget] = useState(resizeHandleRef?.current || null);

    useResizeEvents(target, column, handleResize, handleResizeEnd);

    useEffect(() => {
        setTarget(resizeHandleRef.current);
    }, [column])

    let isPinnedRight = column.pinned && index === visibleColumns.length - 1;
    let isPinnedLeft = column.pinned && index === 0;
    let classes = column.id === 'virtual' ? `rgt-cell-header rgt-cell-header-virtual-col${isHeaderSticky ? ' rgt-cell-header-sticky' : ''}`.trim() : `rgt-cell-header rgt-cell-header-${column.id === 'checkbox' ? 'checkbox' : column.field}${(column.sortable !== false && column.id !== 'checkbox' && column.id !== 'virtual') ? ' rgt-clickable' : ''}${column.sortable !== false && column.id !== 'checkbox' ? ' rgt-cell-header-sortable' : ' rgt-cell-header-not-sortable'}${isHeaderSticky ? ' rgt-cell-header-sticky' : ''}${column.resizable !== false ? ' rgt-cell-header-resizable' : ' rgt-cell-header-not-resizable'}${column.searchable !== false && column.id !== 'checkbox' ? ' rgt-cell-header-searchable' : ' rgt-cell-header-not-searchable'}${isPinnedLeft ? ' rgt-cell-header-pinned rgt-cell-header-pinned-left' : ''}${isPinnedRight ? ' rgt-cell-header-pinned rgt-cell-header-pinned-right' : ''} ${column.className}`.trim() 

    let sortingProps = (column.sortable !== false && column.id !== 'checkbox' && column.id !== 'virtual') ? { onClick: e => handleSort(column.id) } : {};
    
    const renderCheckboxHeaderCell = () => {

        let selectableItemsIds = pageItems.filter(it => getIsRowSelectable(it)).map(item => item[rowIdField]);
        let selectAllIsChecked = selectableItemsIds.length && selectableItemsIds.every(si => selectedRows.find(id => si === id));
        let selectAllIsDisabled = !selectableItemsIds.length;
        let isSelectAllIndeterminate = !!(selectedRows.length && !selectAllIsChecked && selectableItemsIds.some(si => selectedRows.find(id => si === id)));

        const onChange = () => {
            toggleSelectAll(selectableItemsIds, selectAllIsChecked, isSelectAllIndeterminate)
        }

        useEffect(() => {
            if (!selectAllRef.current) return;

            if (isSelectAllIndeterminate) selectAllRef.current.indeterminate = true;
            else selectAllRef.current.indeterminate = false;
        }, [isSelectAllIndeterminate])

        return (
            <div className="rgt-header-checkbox-cell">
                {
                    column.headerCellRenderer ?
                        column.headerCellRenderer({ isChecked: selectAllIsChecked, isIndeterminate: isSelectAllIndeterminate, callback: onChange, disabled: selectAllIsDisabled })
                        :
                        <input
                            ref={selectAllRef}
                            className={selectAllIsDisabled ? 'rgt-disabled' : 'rgt-clickable'}
                            disabled={selectAllIsDisabled}
                            type="checkbox"
                            onChange={onChange}
                            checked={selectAllIsChecked}
                        />
                }
            </div>
        )
    }

    return (
        <div 
            data-column-id={(column.id).toString()}
            id={`rgt-column-${column.id === 'virtual' ? 'virtual' : column.id === 'checkbox' ? 'checkbox' : column.field.toLowerCase()}`}
            style={{minWidth: column.minWidth, maxWidth: column.maxWidth}}
            className={classes}
            {...sortingProps}
            { ...additionalProps }
        >
            {
                (column.id !== 'virtual') ?
                    <React.Fragment>
                        <SortableItem 
                            className={`rgt-cell-header-inner${column.id === 'checkbox' ? ' rgt-cell-header-inner-checkbox-column' : ''}${!isPinnedRight ? ' rgt-cell-header-inner-not-pinned-right' : '' }`}
                            index={index} 
                            disabled={disableColumnsReorder || isPinnedLeft || isPinnedRight}
                            columnId={(column.id).toString()}
                            collection={isPinnedLeft || isPinnedRight ? 0 : 1}
                        >
                            {
                                dragHandleComponent ?
                                    <DragHandle index={index}>{dragHandleComponent()}</DragHandle>
                                    :
                                    null
                            }
                            {
                                (column.id === 'checkbox') ? 
                                    renderCheckboxHeaderCell()
                                    :
                                    column.headerCellRenderer ? 
                                        column.headerCellRenderer({label: (typeof column.label === 'string' ? column.label : column.field), column: column})
                                        :
                                        <span className='rgt-text-truncate' data-column-id={(column.id).toString()}>
                                            {typeof column.label === 'string' ? column.label : column.field}
                                        </span>
                            }
                            {
                                (sort.colId === column.id) ? 
                                    sort.isAsc ? 
                                        <span className='rgt-sort-icon rgt-sort-icon-ascending'>{sortAscendingIcon}</span> 
                                        :
                                        sort.isAsc === false ?
                                            <span className='rgt-sort-icon rgt-sort-icon-descending'>{sortDescendingIcon}</span> 
                                            : 
                                            null
                                    : 
                                    null
                            }
                        </SortableItem>
                        {
                            column.resizable !== false ?
                                <span 
                                    ref={resizeHandleRef} 
                                    className='rgt-resize-handle'
                                    onClick={e => {e.preventDefault(); e.stopPropagation();}}
                                >
                                </span>
                                : null
                        }
                    </React.Fragment>
                :
                null
            }
        </div>
    )
}

export default HeaderCell;