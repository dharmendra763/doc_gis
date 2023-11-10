import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Button,
    IconButton,
    Divider,
} from "@mui/material";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";
import AdjustRoundedIcon from "@mui/icons-material/AdjustRounded";
import { useTranslation } from "react-i18next";

export default function WorkflowDetails() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { groupBy: activeGroup } = useParams();
    const [userData, setUserData] = useState();
    const [workflow, setWorkflow] = useState();
    const [selectedWorkflow, setSelectedWorkflow] = useState("");
    const [selectedForm, setSelectedForm] = useState("");
    const [formData, setFormData] = useState();
    const [activeItem, setActiveItem] = useState("Home");
    let parsedD = {};
    useEffect(() => {
        if (activeGroup) {
            userworkFlow();
        }
    }, [activeGroup]);
    const userworkFlow = async () => {
        let userD = localStorage.getItem("adminInfo");
        if (userD !== null) {
            let parsedD = JSON.parse(userD);
            setUserData(parsedD);
            const workflow = await getUsersWorkflow(activeGroup, parsedD.role, parsedD.id);
            setWorkflow(workflow);
            // setWorkflow(workflow?.filter((wf) => wf.initiator_users.includes(parsedD.full_name)));
        }
    };

    const getUsersWorkflow = async (group_by, initiator_role, userId) => {
        let userD = localStorage.getItem("adminInfo");

        if (userD !== null) {
            parsedD = JSON.parse(userD);
            setUserData(parsedD);
        }
        const url = "https://mainpcisv.pcisv.ro/workflow";
        try {
            const params = {
                group_by: group_by,
                initiator_role: initiator_role,
                userId: userId,
            };
            const response = await axios.get(url, { params });
            const data = response.data;
            const initiator_users = data.filter((item) => {
                return item?.initiator_users.includes(parsedD?.full_name);
            });
            return initiator_users;
            // return data;
        } catch (error) {
            console.log(error);
            // console.error("Error retrieving workflow data:", error);
        }
    };

    return workflow && workflow?.length > 0 ? (
        <List>
            {workflow.map((item, index) => (
                // <div>{item.workflow_prefix}</div>
                <>
                    <ListItem
                        key={index}
                        onClick={async () => {
                            await localStorage.setItem("selectedWf", JSON.stringify(item));
                            navigate(`./${item?.workflow_prefix}`);
                        }}
                        style={{ cursor: "pointer" }}
                    >
                        <ListItemIcon>
                            {/* <img src="your_image_url" alt="Icon" /> */}
                            <AdjustRoundedIcon sx={{ color: "#3880ff", marginLeft: 1 }} />
                        </ListItemIcon>
                        <ListItemText>{item?.workflow_prefix}</ListItemText>
                        <ListItemIcon>
                            <IconButton edge="end">
                                <ChevronRightRoundedIcon />
                            </IconButton>
                        </ListItemIcon>
                    </ListItem>
                    <Divider />
                </>
            ))}
        </List>
    ) : (
        // :
        // <>
        //     <ListItem>
        //         <ListItemText primary="No Workflow Created" />
        //     </ListItem>
        //     <Button variant="contained" color="error" onClick={() => navigate(-1)}>Cancel</Button>
        // </>

        <>
            <ListItem>
                <ListItemText primary={t("No Workflow Created")} />
            </ListItem>
        </>
    );
}