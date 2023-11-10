import {
    Divider,
    ListItem,
    ListItemText,
    ListItemIcon,
    IconButton,
} from "@mui/material";
import axios from "axios";
import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { excerpt } from "src/utils/helperFunction";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import SchemaOutlinedIcon from "@mui/icons-material/SchemaOutlined";

function FillWorkflow() {
    const [groupBy, setGroupBy] = useState();
    const navigate = useNavigate();

    useEffect(() => {
        getGroupBy();
    }, []);
    const getGroupBy = async () => {
        try {
            const response = await axios.get("https://mainpcisv.pcisv.ro/group_by");
            setGroupBy(response.data);
        } catch (error) {
            console.error("Error retrieving users workflow:", error);
        }
    };

    return (
        <>
            {groupBy && groupBy?.length > 0 ? (
                groupBy?.map((item, idx) => (
                    <Fragment key={idx}>
                        <ListItem onClick={() => navigate(`./${item?.groupBy}`)}>
                            <ListItemIcon>
                                {/* <img src="your_image_url" alt="Icon" /> */}
                                <SchemaOutlinedIcon sx={{ color: "#3880ff", marginLeft: 1 }} />
                            </ListItemIcon>
                            <ListItemText
                                primary={item?.groupBy}
                                secondary={
                                    excerpt(item?.groupBy.toLowerCase(), 15) + " workflow"
                                }
                            />
                            <ListItemIcon>
                                <IconButton edge="end">
                                    <ChevronRightRoundedIcon />
                                </IconButton>
                            </ListItemIcon>
                            {/* Arrow right icon */}
                        </ListItem>
                        <Divider />
                    </Fragment>
                ))
            ) : (
                <ListItem>
                    <ListItemText primary="No Groups Created" />
                </ListItem>
            )}
        </>
    );
}

export default FillWorkflow;