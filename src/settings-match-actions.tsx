import React from "react";
import { IconButton } from "@fluentui/react";

export function Actions(props){
  const { item, onDel } = props;
  return <>
     <DelAction item={item} onDel={onDel}/>   
  </>
}

export function DelAction(props){
  const { onDel } = props;
  return <IconButton iconProps={{
    iconName: 'Delete',
    styles: {
      root: {
        color: 'red',
      }
    }
  }} onClick={onDel} />
}