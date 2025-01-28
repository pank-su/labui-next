import { Autocomplete, Avatar } from "@primer/react";


export default function Header(){
    return <div style={{
        width: "100%",
        height: "100%",
        paddingLeft: 30,
        paddingRight: 30,
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center"
    }}>
        <Avatar src=""></Avatar>
       <Autocomplete ></Autocomplete>
        <Avatar src=""></Avatar>

         </div>
}