import React, { Fragment, useEffect } from "react";
import { useTranslation } from "react-i18next";
import {
    TextField,
    Button,
    Select,
    MenuItem,
    RadioGroup,
    Radio,
    FormControlLabel,
    FormControl,
    FormLabel,
    Grid,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    FormHelperText,
} from "@mui/material";
import { useState } from "react";
import axios from "axios";
import { excerpt } from "src/utils/helperFunction";
import { useNavigate } from "react-router-dom";
import GeolocationButton from "src/components/Geolocationbutton/GeoLocationButton";
import { generateSignsHTMLForFillWorkflow, handleGeneratePDFForFillWorkflow } from "./Utils/generatePdf";

export default function WorkflowForm() {
    const [wfDetails, setWfDetails] = useState();
    const [finalStat, setFinalStat] = useState("");
    const [userStat, setUserStat] = useState("");
    const [userData, setUserData] = useState({});
    const [fetchedData, setFetchedData] = useState({});
    const [formSection, setFormSection] = useState(true);
    const [formData, setFormData] = useState({});
    const [formValues, setFormValues] = useState({});
    const [image, setImage] = useState();
    const [details, setDetails] = useState(false);
    const [btn, setBtn] = useState(true);
    const [initiateBtn, setInitiateBtn] = useState(false);
    const [formInputs, setFormInputs] = useState({});
    const [loading, setLoading] = useState(false);

    const { t } = useTranslation();
    let udparse = {};
    const navigate = useNavigate();
    const getform = async ({ form_name }) => {
        // Define the endpoint URL
        const url = `https://mainpcisv.pcisv.ro/formdetails?name=${form_name}`;
        // Create a function to fetch data based on group_by, initiator_role, or reviewer
        try {
            const response = await axios.get(url);
            // Access the data from the response
            const data = response.data;
            // Process the retrieved data as needed
            console.log(data);
            let formData = {
                name: data.formDetails?.name,
                inputs: JSON.parse(data.formDetails?.inputs),
                selectedOptions: JSON.parse(data.formDetails?.select_vlaues),
            };
            setFormData(formData);
            // console.log("Retrieved form data:", formData);
            // Additional processing logic...
            return data;
        } catch (error) {
            // console.error("Error retrieving form data:", error);
            // Handle error scenario...
        }
    };
    const getFormData = async (wfparse, udparse) => {
        try {
            const response = await axios.get(
                `https://mainpcisv.pcisv.ro/fetch-data/${wfparse.form_name}/${wfparse.id}/${udparse.id}`
            );

            let num = response.data.length;
            if (num > 0) {
                // console.log(response.data[num-1])
                setFetchedData(response.data);
                setFormSection(true);
            } else {
                getform({ form_name: wfparse?.form_name });
                setFormSection(false);
            }
            // Do something with the response data here
        } catch (error) {
            // console.error("Error fetching data:", error);
            // Handle the error here if needed
        }
    };

    const foo = async () => {
        const wf = localStorage.getItem("selectedWf");
        const ud = localStorage.getItem("adminInfo");
        if (ud !== null) {
            udparse = JSON.parse(ud);
            setUserData(udparse);
        }

        if (wf !== null) {
            let wfparse = JSON.parse(wf);
            // console.log("wf", JSON.parse(wfparse.initiator_status));
            await setWfDetails(wfparse);
            let initiatorStatus = await JSON.parse(wfparse.initiator_status);
            {
                initiatorStatus?.map(async (item) => {
                    const splitD = item.name.split("-");
                    // console.log("splitD", splitD[0]);

                    await setFinalStat(item.finalStatus);
                    await setUserStat(item.userStatus);

                    // console.log("item.finalStatus", item.finalStatus);
                    // console.log("item.userStatus", item.userStatus);
                });
            }
            await getFormData(wfparse, udparse);
            // console.log("udparse", udparse.u_id);
        }
    };


    const getFormDetails = async () => {
        if (wfDetails?.form_name) {
            try {
                const responseWF = await axios.get(`https://mainpcisv.pcisv.ro/formdetails?name=${wfDetails?.form_name}`);
                const response = responseWF?.data?.formDetails;
                setFormInputs({
                    id: response?.id,
                    name: response?.name,
                    inputs: JSON.parse(response?.inputs),
                    select_values: JSON.parse(response.select_vlaues)
                });
            } catch (error) {
                console.log(error);
            }
        }
    }


    useEffect(() => {
        foo();
    }, []);

    useEffect(() => {
        getFormDetails()
    }, [wfDetails])
    const handleChange = (e, filedName) => {
        const { name, value, files } = e.target;

        if (name === filedName) {
            const formDatavaluw = new FormData();
            formDatavaluw.append("files", files ? files[0] : value);
            axios
                .post(`https://uploadpcisv.pcisv.ro/upload`, formDatavaluw, {
                    headers: {
                        "Content-Type": "multipart/form-data",
                    },
                })
                .then((response) => {
                    setFormValues((prevValues) => ({
                        ...prevValues,
                        [name]: response?.data?.downloadLinks[0],
                    }));
                    setImage(response?.data?.downloadLinks[0]);
                })
                .catch((error) => {
                    // console.error("Error inserting rows:", error);
                });
        } else {
            setFormValues((prevValues) => ({
                ...prevValues,
                [name]: files ? files[0] : value,
            }));
        }
    };
    const handleSubmit = (e) => {
        e.preventDefault();
        // Perform form submission logic here
        // @ts-ignore
        let userDetails = JSON.parse(localStorage.getItem("adminInfo"));
        let finalFormValues = {
            ...formValues,
            workflow: `${wfDetails?.id}`,
            userid: `${userDetails?.id}`,
        };

        const keys = Object.keys(finalFormValues);
        const values = Object.values(finalFormValues);
        const finalData = {
            columns: keys,
            values: values,
        };

        axios
            .post(
                `https://mainpcisv.pcisv.ro/form/${wfDetails?.form_name}`,
                finalData
            )
            .then((response) => {
                alert(response.data.message);
                updateWorkflow();
                window.location.reload();
            })
            .catch((error) => {
                // console.error("Error inserting rows:", error);
            });
    };
    const updateWorkflow = () => {
        //@ts-ignore
        let userDetails = JSON.parse(localStorage.getItem("adminInfo"));
        const url = "https://mainpcisv.pcisv.ro/workflow-update";
        const data = {
            userId: userDetails.id,
            workflowId: wfDetails?.id,
            userstatus: "True",
        };

        axios
            .post(url, data)
            .then((response) => {
                setFormSection(true);

                // Handle the response data
                // console.log(response.data);
            })
            .catch((error) => {
                // Handle any errors
                // console.error(error);
            });
    };

    const handleDownloadPDF = async (id, rowData) => {

        const wf = localStorage.getItem("selectedWf");
        let wfD = JSON.parse(wf);
        let fieldsToIncludeInFinalDocument = {};
        formInputs?.inputs.forEach(input => {
            if (input?.includeInFinal && input?.name) {
                fieldsToIncludeInFinalDocument[input?.name] = rowData[input?.name]
            }
        })
        let identifier = `${wfD.id}-${wfD.workflow_prefix}`
        setLoading(true);
        const uid = JSON.parse(localStorage.getItem("adminInfo")).id;

        generateSignsHTMLForFillWorkflow(wfD, id)
            .then((combinedHTML) => {
                handleGeneratePDFForFillWorkflow(uid, wfD, combinedHTML, fieldsToIncludeInFinalDocument, identifier);
            })
            .catch((error) => {
                console.error(`Error generating HTML content: ${error.message}`);
            })
            .finally(() => {
                setLoading(false);
            });
    }


    return (
        <>
            <div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{t("Workflow ID")}</span>
                    <span>{wfDetails?.id}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{t("Group")}</span>
                    <span>{wfDetails?.group_by}</span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{t("Status")}</span>
                    <span>
                        {userStat === "False" && finalStat === "False" ? (
                            <span style={{ color: "#916f20", fontWeight: "bold" }}>
                                {t("PENDING")}
                            </span>
                        ) : userStat === "True" && finalStat === "False" ? (
                            <span style={{ color: "#2c6916", fontWeight: "bold" }}>
                                {t("SUBMITTED")}
                            </span>
                        ) : userStat === "True" && finalStat === "True" ? (
                            <span style={{ color: "green", fontWeight: "bold" }}>
                                {t("APPROVED")}
                            </span>
                        ) : userStat === "Rejected" ? (
                            <span style={{ color: "red", fontWeight: "bold" }}>
                                {t("REJECTED")}
                            </span>
                        ) : (
                            <span>-</span>
                        )}
                    </span>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                    <span>{t("Workflow Name")}</span>
                    <span>{wfDetails?.workflow_name}</span>
                </div>
                <Grid
                    container
                    direction="row"
                    justifyContent="space-between"
                    alignItems="center"
                >
                    <Button
                        onClick={() => {
                            setDetails(false);
                            navigate("/dashboard/fillworkflow");
                            setDetails(false);
                            setBtn(true);
                            setInitiateBtn(false);
                        }}
                        size="large"
                        variant="outlined"
                        color="error"
                        style={{ margin: "4vh" }}
                    >
                        {t("Close")}
                    </Button>
                    {formSection && btn ? (
                        <Button
                            size="large"
                            variant="contained"
                            color="success"
                            onClick={() => {
                                setDetails(true);
                                setBtn(false);
                                setInitiateBtn(true);
                            }}
                            style={{ margin: "2vh" }}
                        >
                            {t("View Details")}
                        </Button>
                    ) : (
                        initiateBtn && (
                            <Button
                                onClick={() => {
                                    console.log(wfDetails?.form_name);
                                    getform({ form_name: wfDetails?.form_name });
                                    setFormSection(false);
                                    setDetails(false);
                                    setInitiateBtn(false);
                                }}
                                size="large"
                                variant="contained"
                                color="error"
                                style={{ margin: "2vh" }}
                            >
                                {t("INITIATE")}
                            </Button>
                        )
                    )}
                </Grid>
                {formSection ? (
                    <>
                        {details && (
                            <>
                                <div>
                                    <span
                                        style={{
                                            fontWeight: "400",
                                            fontSize: "2vh",
                                            textAlign: "center",
                                            paddingTop: "2vh",
                                            margin: "0 4vh 2vh 4vh",
                                        }}
                                    >
                                        {t("SUBMITTED DATA")}
                                    </span>
                                </div>

                                {fetchedData.map((item, index) => {
                                    const keys = Object.keys(item);

                                    return (
                                        <div
                                            key={index}
                                            style={{
                                                borderBottom: "1px solid black",
                                                margin: "0vh 2vh 5vh 2vh",
                                                paddingBottom: "3vh",
                                            }}
                                        >
                                            {keys.map((key, idx) =>
                                                <span
                                                    key={idx}
                                                    style={{
                                                        display: "block",
                                                        margin: "2vh 4vh 2vh 4vh",
                                                    }}
                                                >
                                                    {key} : {item[key]}
                                                </span>
                                            )}
                                            {item?.finalApproval === "Approved" && (
                                                <Grid
                                                    container
                                                    direction="row"
                                                    justifyContent="left"
                                                    alignItems="end"
                                                >
                                                    <Button
                                                        color="primary"
                                                        size="large"
                                                        variant="contained"
                                                        style={{ margin: "2vh 0vh 2vh 4vh" }}
                                                        onClick={() => handleDownloadPDF(item.id, item)}
                                                    >
                                                        {t("Dowload Pdf")}
                                                    </Button>
                                                </Grid>
                                            )}
                                        </div>
                                    );
                                })}
                            </>
                        )}
                    </>
                ) : (
                    <>
                        <div style={{ textAlign: "center" }}>
                            <span
                                style={{
                                    fontSize: "20px",
                                    marginTop: "4vh",
                                }}
                            >
                                {t("Workflow Form")}
                            </span>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <Grid
                                container
                                spacing={3}
                                padding={3}
                                style={{ boxSizing: "border-box" }}
                            >
                                {formData?.inputs?.map((item, idx) => {
                                    if (item.type === "INPUT_TEXT") {
                                        return (
                                            <Grid item xs={12} key={idx}>
                                                <TextField
                                                    name={item.name}
                                                    label={excerpt(
                                                        item?.name.charAt(0).toUpperCase() +
                                                        item?.name.slice(1),
                                                        12
                                                    )}
                                                    value={formValues[item.name]}
                                                    onChange={handleChange}
                                                    required={item.isRequired}
                                                    fullWidth
                                                    error={item.isRequired}
                                                />
                                            </Grid>
                                        );
                                    } else if (item.type === "INPUT_NUMBER") {
                                        return (
                                            <Grid item xs={12} key={idx}>
                                                <TextField
                                                    name={item.name}
                                                    label={excerpt(
                                                        item?.name.charAt(0).toUpperCase() +
                                                        item?.name.slice(1),
                                                        12
                                                    )}
                                                    type="number"
                                                    value={formValues[item.name]}
                                                    onChange={handleChange}
                                                    required={item.isRequired}
                                                    fullWidth
                                                    error={item.isRequired}
                                                    id="outlined-number"
                                                />
                                            </Grid>
                                        );
                                    } else if (item.type === "SELECT_IMAGE") {
                                        return (

                                            <Grid item xs={12} key={idx}>
                                                {image && (
                                                    <div style={{ textAlign: "center" }}>
                                                        <img
                                                            src={image}
                                                            alt="Uploaded Image"
                                                            height="50%"
                                                            width="300px"
                                                        />
                                                    </div>
                                                )}
                                                <label
                                                    htmlFor="upload-image"
                                                    style={{ display: "block" }}
                                                >
                                                    <Button
                                                        style={{
                                                            width: "100%",
                                                            background: "orange",
                                                            marginRight: "20px",
                                                        }}
                                                        variant="contained"
                                                        component="span"
                                                    >
                                                        Upload Image
                                                    </Button>

                                                    <input
                                                        id="upload-image"
                                                        hidden
                                                        name={item?.name}
                                                        accept="image/*"
                                                        type="file"
                                                        onChange={(e) => {
                                                            handleChange(e, item?.name);
                                                        }}
                                                        required={item.isRequired}
                                                    />
                                                </label>
                                            </Grid>

                                        );
                                    } else if (item.type === "SELECT_LIST") {
                                        return (
                                            <Grid item xs={12} key={idx}>
                                                <FormControl fullWidth required={item.isRequired}>
                                                    <FormLabel>
                                                        {excerpt(
                                                            item?.name.charAt(0).toUpperCase() +
                                                            item?.name.slice(1),
                                                            12
                                                        )}
                                                    </FormLabel>
                                                    <Select
                                                        name={item.name}
                                                        value={formValues[item.name]}
                                                        onChange={(e) => handleChange(e)}
                                                    >
                                                        {formData?.selectedOptions
                                                            ?.filter((_item) => _item.name == item.name)[0]
                                                            .options?.map((opt, idx) => {
                                                                return <MenuItem key={idx} value={opt}>{opt}</MenuItem>;
                                                            })}
                                                    </Select>
                                                </FormControl>
                                            </Grid>
                                        );
                                    } else if (item.type === "RADIO_BUTTON") {
                                        return (
                                            <Grid item xs={12} key={idx}>
                                                <FormControl
                                                    component="fieldset"
                                                    error={item.isRequired}
                                                >
                                                    <FormLabel>
                                                        {excerpt(
                                                            item?.name.charAt(0).toUpperCase() +
                                                            item?.name.slice(1),
                                                            12
                                                        )}
                                                    </FormLabel>
                                                    <RadioGroup
                                                        name={item.name}
                                                        value={formValues[item.name]}
                                                        onChange={handleChange}
                                                    >
                                                        {formData?.selectedOptions
                                                            ?.filter((_item) => _item.name == item.name)[0]
                                                            .options?.map((opt, idx) =>
                                                                <FormControlLabel key={idx} value={opt} control={<Radio />} label={opt} />
                                                            )
                                                        }
                                                    </RadioGroup>
                                                </FormControl>
                                            </Grid>
                                        );
                                    } else if (item.type === "INPUT_DATE") {
                                        return (
                                            <Grid item xs={12} key={idx}>
                                                <TextField
                                                    name={item.name}
                                                    label={excerpt(
                                                        item?.name.charAt(0).toUpperCase() +
                                                        item?.name.slice(1),
                                                        12
                                                    )}
                                                    type="date"
                                                    value={formValues[item.name]}
                                                    onChange={handleChange}
                                                    required={item.isRequired}
                                                    fullWidth
                                                    InputLabelProps={{ shrink: true }}
                                                />
                                            </Grid>
                                        );
                                    } else if (item.type === "LOCATION") {
                                        return (
                                            <Fragment key={idx}>
                                                <Grid item xs={9}>
                                                    <TextField
                                                        name={item.name}
                                                        label={excerpt(
                                                            item?.name.charAt(0).toUpperCase() +
                                                            item?.name.slice(1),
                                                            12
                                                        )}
                                                        error={item.isRequired}
                                                        onChange={handleChange}
                                                        value={formValues[item.name]}
                                                        required={item.isRequired}
                                                        fullWidth
                                                        InputLabelProps={{ shrink: true }}
                                                    />
                                                </Grid>
                                                <Grid
                                                    container
                                                    xs={1}
                                                    direction="row"
                                                    justifyContent="space-between"
                                                    alignItems="center"
                                                >
                                                    <GeolocationButton
                                                        formValues={formValues}
                                                        setFormValues={setFormValues}
                                                        fieldName={item.name}
                                                    />
                                                </Grid>
                                            </Fragment>
                                        );
                                    }
                                })}

                                <Grid item xs={12}>
                                    <Button
                                        style={{ marginRight: "2vh", marginTop: "20px" }}
                                        type="submit"
                                        size="large"
                                        variant="contained"
                                        color="primary"
                                    >
                                        {t("Submit")}
                                    </Button>
                                </Grid>
                            </Grid>
                        </form>
                    </>
                )}
            </div>
        </>
    );
}