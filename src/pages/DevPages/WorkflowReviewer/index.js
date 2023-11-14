import React, { Fragment, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Helmet } from "react-helmet-async";
import {
  Card,
  Container,
  Stack,
  Typography,
  Button,
  Modal,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import AccountTreeOutlinedIcon from "@mui/icons-material/AccountTreeOutlined";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";
import { useTranslation } from "react-i18next";
import axios from "axios";

const adminDetail = localStorage.getItem("adminInfo");

const WorkflowReviewer = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [wfSection, setWfSection] = useState(false);
  const [allData, setAllData] = useState([]);
  const [workFlowD, setWorkFlowD] = useState({});
  const [allUsers, setAllUsers] = useState([]);
  const [statusCheck, setStatusCheck] = useState([]);
  const [adminLocal, setAdminLocal] = useState("");
  const [currentWorkflowId, setCurrentWorkflowId] = useState("");
  const [formData, setFormData] = useState("");
  const [currentWorkflowPrefix, setCurrentWorkflowPrefix] = useState("");

  const apiUrl = process.env.REACT_APP_BASE_URL;

  useEffect(() => {
    fetchReviewerData();
  }, []);

  const fetchReviewerData = async () => {
    let adminData = localStorage.getItem("adminInfo");
    let adminUserName = JSON.parse(adminData);
    setAdminLocal(adminUserName?.username);
    try {
      const response = await axios.get(
        `${apiUrl}/workflow-reviewers?reviewer=${adminUserName.username}`
      );
      console.log("response.data", response.data);
      setAllData(response.data);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

  const selectWf = async (item) => {
    setCurrentWorkflowId(item.id);
    setCurrentWorkflowPrefix(item.workflow_prefix);
    console.log("item", item);
    await setWorkFlowD(item);
    let allUD = parseData(item.initiator_users);
    // console.log("allUD", allUD);
    await setAllUsers(allUD);

    let statusD = StatusParseData(item?.initiator_status);
    // setStatusCheck(statusD);
    let ds = statusD.map((status) =>
      getData(item.form_name, item.id, status.id)
    );

    Promise.all(ds).then((a) => {
      setFormData(
        a.map((a) => {
          return a.data;
        })
      );
      setStatusCheck(statusD);
    });
    // console.log("item.initiator_status",item?.initiator_status);
    // console.log("statusD", statusD);
    setWfSection(true);
  };

  console.log(formData);

  const getData = async (formName, workflowId, userId) => {
    try {
      return axios.get(
        `${apiUrl}/fetch-data/${formName}/${workflowId}/${userId}`
      );
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };
  const parseData = (data) => {
    // Split the data string by comma and iterate over the resulting array
    const items = data.split(",");
    const formattedData = [];

    items.forEach((item) => {
      // Split each item by the dash (-) to separate ID and name
      const [id, name] = item.trim().split(" - ");
      formattedData.push({ id, name });
    });

    return formattedData;
  };

  const StatusParseData = (responseData) => {
    const parsedData = JSON.parse(responseData);
    // console.log("parsedData", responseData);

    const formattedData = parsedData.map((item) => {
      const idNameParts = item.name.split(" - ");
      const id = idNameParts[0];
      const name = idNameParts[1];
      const userStatus = item.userStatus;
      const reviewers = item.reviewer.map((reviewer) => {
        const { sn, name, status } = reviewer;
        return { sn, name, status };
      });

      const finalStatus = item.finalStatus;

      return { id, name, reviewers, finalStatus, userStatus };
    });
    return formattedData;
  };

  const handleReject = async (id) => {
    const username = adminDetail.full_name;
    const approvalStatus = "rejected";
    const data = { username, approvalStatus };

    try {
      await callARApi(id, data);
      await getData();
      // await workflowUpdate("rejected")
    } catch (error) {
      console.error("Error Rejecting:", error);
    }
  };

  const handleApprove = async (id) => {
    const username = adminDetail.full_name;
    const approvalStatus = "approved";
    const data = { username, approvalStatus };

    try {
      await callARApi(id, data);
      await reviewStatus(id);
      // await workflowUpdate("approve")
      await getData();
    } catch (error) {
      console.error("Error Approving:", error);
    }
  };

  const reviewStatus = async (id) => {
    const username = adminDetail.full_name;
    const data = {
      userid: id,
      reviewerName: username,
    };
    try {
      const url = `${apiUrl}/reviewer-status?workflowId=${workFlowD.id}`;
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const callARApi = async (id, data) => {
    try {
      const url = `${apiUrl}/reviewer-approval/${workFlowD.form_name}/${id}`;
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  console.log(workFlowD);

  return (
    <>
      <Helmet>
        <title>{t("Reviewer Panel")}</title>
      </Helmet>
      <Container>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          mb={5}
        >
          <Typography variant="h4" gutterBottom>
            {t("Reviewer Panel")}
          </Typography>
          {wfSection && (
            <Button
              onClick={() => setWfSection(false)}
              style={{ background: "red", width: "12vh" }}
              variant="contained"
            >
              {t("Close")}
            </Button>
          )}
        </Stack>
        <Card>
          {wfSection ? (
            <div>
              <TableContainer component={Paper}>
                <h3 style={{ textAlign: "center" }}>{t("Workflow Details")}</h3>
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                  {/* <caption>Workflow Details</caption> */}
                  <TableHead>
                    <TableRow>
                      <TableCell>Group By</TableCell>
                      <TableCell align="left">{t("Workflow Name")}</TableCell>
                      <TableCell align="left">{t("Workflow Prefix")}</TableCell>
                      {/* <TableCell align="left">Form Chosen</TableCell> */}
                      <TableCell align="left">{t("All Reviewers")}</TableCell>
                      <TableCell align="left">{t("Final Approval")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    <TableRow>
                      <TableCell component="th" scope="row">
                        {workFlowD?.group_by}
                      </TableCell>
                      <TableCell align="left">
                        {workFlowD?.workflow_name}
                      </TableCell>
                      <TableCell align="left">
                        {workFlowD?.workflow_prefix}
                      </TableCell>
                      {/* <TableCell align="left">{workFlowD?.form_name}</TableCell> */}
                      <TableCell align="left">{workFlowD?.reviewer}</TableCell>
                      <TableCell align="left">
                        {workFlowD?.final_approval}
                      </TableCell>
                    </TableRow>
                  </TableBody>
                </Table>
                <h3 style={{ textAlign: "center", padding: "2vh" }}>
                  {t("Initiators Lists")}
                </h3>
                <Table sx={{ minWidth: 650 }} aria-label="caption table">
                  <TableHead>
                    <TableRow>
                      <TableCell align="center">{t("Workflow ID")}</TableCell>
                      <TableCell align="center">
                        {t("User Full Name")}
                      </TableCell>
                      <TableCell align="center">{t("Status")}</TableCell>
                      <TableCell align="center">{t("Review")}</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {allUsers?.map((item, index) => {
                      return (
                        <TableRow key={index}>
                          <TableCell align="center">{`${currentWorkflowPrefix}_${currentWorkflowId}`}</TableCell>
                          <TableCell align="center">{item?.name}</TableCell>

                          <TableCell align="center">
                            {statusCheck?.map((statt) => {
                              if (
                                statt.id === item.id &&
                                statt.name === item.name
                              ) {
                                return statt.reviewers.map((rev, revIndex) => {
                                  if (
                                    rev.name === adminLocal &&
                                    rev.status === "False" &&
                                    statt.userStatus === "False"
                                  ) {
                                    return (
                                      <Button
                                        key={revIndex}
                                        variant="contained"
                                        color="info"
                                      >
                                        {"Waiting"}
                                      </Button>
                                    );
                                  } else if (
                                    rev.name === adminLocal &&
                                    rev.status === "False" &&
                                    statt.userStatus === "True"
                                  ) {
                                    return (
                                      <Button
                                        key={revIndex}
                                        variant="contained"
                                        color="warning"
                                      >
                                        {t("Pending")}
                                      </Button>
                                    );
                                  } else if (
                                    rev.name === adminLocal &&
                                    rev.status === "False" &&
                                    statt.userStatus === "Rejected"
                                  ) {
                                    return (
                                      <Button
                                        key={revIndex}
                                        variant="contained"
                                        color="error"
                                      >
                                        {t("Rejected")}
                                      </Button>
                                    );
                                  } else if (
                                    rev.name === adminLocal &&
                                    rev.status === "True" &&
                                    statt.userStatus === "True"
                                  ) {
                                    return (
                                      <Button
                                        key={revIndex}
                                        variant="contained"
                                        color="success"
                                      >
                                        {t("Reviewed")}
                                      </Button>
                                    );
                                  }
                                  return null;
                                });
                              }
                              return null;
                            })}
                          </TableCell>

                          <TableCell align="center">
                            <Button
                              variant="outlined"
                              onClick={() => {
                                localStorage.setItem(
                                  "wftobereview",
                                  JSON.stringify(workFlowD)
                                );
                                navigate(
                                  `/userWf/${workFlowD?.id}&${workFlowD?.form_name}&${item?.id}`
                                );
                              }}
                            >
                              {t("View")}
                            </Button>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            </div>
          ) : (
            <>
              <TableContainer>
                <Table style={{ overflow: "scroll" }}>
                  <TableHead>
                    {allData.length > 0 &&
                      allData?.map((item, index) => {
                        return (
                          <>
                            <TableRow onClick={() => selectWf(item)}>
                              <TableCell>{index + 1}.</TableCell>
                              <TableCell>
                                <AccountTreeOutlinedIcon />
                              </TableCell>
                              <TableCell style={{ fontWeight: "bold" }}>
                                {item?.id} |{" "}
                                {item?.workflow_prefix?.toUpperCase()}
                              </TableCell>
                              <TableCell style={{ fontWeight: "bold" }}>
                                {item?.workflow_name?.toUpperCase()}
                              </TableCell>
                              <TableCell style={{ fontWeight: "bold" }}>
                                {item?.workflow_prefix.toUpperCase()}
                              </TableCell>
                              {/* <TableCell>
                                {moment(item?.timestamp).format(
                                  "MMMM Do YYYY | h:mm A"
                                )}
                              </TableCell> */}
                              <TableCell>
                                {item?.wfStatus.toUpperCase()}
                              </TableCell>
                            </TableRow>
                            <Divider style={{ margin: "2px" }} />
                          </>
                        );
                      })}
                  </TableHead>
                </Table>
              </TableContainer>
            </>
          )}
        </Card>
      </Container>
    </>
  );
};

export default WorkflowReviewer;
