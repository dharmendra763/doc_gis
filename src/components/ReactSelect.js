import React, { useRef } from "react";
import ReactSelect from "react-select";


const customStyles = {
    control: (base, state) => ({
        ...base,
        background: "#FFF",
        // match with the menu
        borderRadius: state.isFocused ? "3px 3px 0 0" : 3,

        // Removes weird border around container
        boxShadow: state.isFocused ? null : null,
    }),
    menu: base => ({
        ...base,
        // override border radius to match the box
        borderRadius: 0,
        // kill the gap
        marginTop: 0,
        background: "#FFF",
    }),
    menuList: base => ({
        ...base,
        // kill the white space on first and last option
        padding: 0,
        background: "#FFF",
    })
};
export const MultiSelect = props => {
    // isOptionSelected sees previous props.value after onChange
    const valueRef = useRef(props.value);
    valueRef.current = props.value;
    const selectAllOption = {
        value: "<SELECT_ALL>",
        label: "All Users"
    };
    const isSelectAllSelected = () =>
        valueRef.current?.length === props.options?.length;
    const isOptionSelected = option =>
        valueRef?.current?.some(({ value }) => value === option?.value) ||
        isSelectAllSelected();
    const getOptions = () => [selectAllOption, ...props?.options];
    const getValue = () =>
        isSelectAllSelected() ? [selectAllOption] : props?.value;
    const onChange = (newValue, actionMeta) => {
        const { action, option, removedValue } = actionMeta;
        if (action === "select-option" && option?.value === selectAllOption?.value) {
            props.onChange(props.options, actionMeta);
        } else if (
            (action === "deselect-option" &&
                option?.value === selectAllOption?.value) ||
            (action === "remove-value" &&
                removedValue?.value === selectAllOption?.value)
        ) {
            props?.onChange([], actionMeta);
        } else if (
            actionMeta?.action === "deselect-option" &&
            isSelectAllSelected()
        ) {
            props?.onChange(
                props?.options?.filter(({ value }) => value !== option?.value),
                actionMeta
            );
        } else {
            props?.onChange(newValue || [], actionMeta);
        }
    };
    return (
        <ReactSelect
            isOptionSelected={isOptionSelected}
            options={getOptions()}
            value={getValue()}
            onChange={onChange}
            hideSelectedOptions={false}
            closeMenuOnSelect={false}
            isMulti
            styles={customStyles}
        />
    );
};