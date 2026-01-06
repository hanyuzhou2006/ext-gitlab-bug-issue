import React from "react";
//import { IconButton } from "@fluentui/react";
import {Button} from "@fluentui/react-components";
import { DeleteRegular } from "@fluentui/react-icons";

export function Actions(props){
  const { item, onDel } = props;
  return <>
     <DelAction item={item} onDel={onDel}/>   
  </>
}

export function DelAction(props){
  const { onDel } = props;
  return <Button 
  icon={<DeleteRegular />}
  appearance="subtle"
  onClick={onDel} 
  style={{ color: 'red' }}
  aria-label="删除"
  />
}