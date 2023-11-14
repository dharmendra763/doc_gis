import React, { useEffect, useState } from "react";
import { Helmet } from "react-helmet-async";
import { Card, Container, Stack, Typography } from "@mui/material";
import { useNavigate } from "react-router-dom";
import {
  Table,
  TableContainer,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
} from "@material-ui/core";
import { Button } from "@mui/material";
import { useParams } from "react-router-dom";
import axios from "axios";
import ImageViewComponent from "./ImageView";
import { useTranslation } from "react-i18next";

const UserWorkFlow = () => {
  const navigate = useNavigate();
  const { uid } = useParams();
  const [workflowId, formName] = uid.split("&");

  const [fData, setFData] = useState([]);
  const [wfD, setWfD] = useState({});
  const [btnEnable, setEnable] = useState(false);
  const { t } = useTranslation();
  let adminD = localStorage.getItem("adminInfo");
  let finalAdminD = JSON.parse(adminD);
  const var_myName = finalAdminD?.full_name;
  const var_myUname = finalAdminD?.username;
  const var_mySign = finalAdminD?.sign;
  const username = finalAdminD?.username;

  const apiUrl = process.env.REACT_APP_BASE_URL;
  const apiUploadUrl = process.env.REACT_APP_UPLOAD_URL;

  useEffect(() => {
    getData();
    // isSignAvailable(var_myUname);
  }, []);

  const isSignAvailable = async (username) => {
    try {
      const url = `${apiUploadUrl}/ateeb/sign-check/${username}`;
      const response = await axios.get(url);
      if (response) {
        console.log(response);
      }
    } catch (error) { }
  };

  const callARApi = async (id, data) => {
    try {
      const url = `${apiUrl}/reviewer-approval/${wfD.form_name}/${id}`;
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const reviewStatus = async (id) => {
    const data = {
      userid: id,
      reviewerName: var_myUname,
    };
    try {
      const url = `${apiUrl}/reviewer-status?workflowId=${wfD.id}`;
      const response = await axios.put(url, data);
      return response.data;
    } catch (error) {
      console.error("API Error:", error);
      throw error;
    }
  };

  const handleApprove = async (id) => {
    if (!var_mySign) {
      alert("Please upload signature before approving application");
      return;
    }
    const username = var_myUname;
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

  const workflowUpdate = async (status) => {
    const selectedWf = JSON.parse(localStorage.getItem("selectedWf"));

    const workflowId1 = workflowId;
    let intiatorStatus = JSON.parse(selectedWf.initiator_status);
    const reviewer_status = selectedWf.reviewer_status;


    for (let i = 0; i < intiatorStatus[0].reviewer.length; i++) {

      if (intiatorStatus[0].reviewer[i].name === username) {
        intiatorStatus[0].reviewer[i].status = status
      }
    }
    console.log(JSON.stringify(intiatorStatus))



    const responseWF = await axios.put(`${apiUrl}/workflow-update-reviewer`, {
      intiatorStatus,
      workflowId: workflowId1,
      intiatorStatus: JSON.stringify(reviewer_status)
    });



  }

  const handleReject = async (id) => {
    const username = var_myUname;
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

  const getData = async () => {
    console.log("HERE : I WANT :: ", finalAdminD);
    const id = finalAdminD?.id;
    const str = `${uid}`;
    const [item1, item2, item3] = str.split("&");
    const responseWF = await axios.get(`${apiUrl}/workflow/${item1}`);
    let wfAllD = responseWF.data;
    setWfD(wfAllD);
    const jsonData = {
      item1,
      item2,
      item3,
    };

    let response;
    try {
      response = await axios.get(
        `${apiUrl}/fetch-data/${jsonData?.item2}/${jsonData?.item1}/${jsonData?.item3}`
      );
      setFData(response?.data);
      setWfD(wfAllD);
    } catch (error) {
      console.error("Error fetching data:", error);
    }
  };

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
            {t("Reviewer Panel")}-{`${wfD?.workflow_prefix}`}
          </Typography>
        </Stack>
        <Button
          style={{ margin: "2vh", width: "12vh" }}
          onClick={() => navigate("/dashboard/workflowReviewer")}
          variant="contained"
          size="large"
          color="warning"
        >
          {t("Close")}
        </Button>
        <Card>
          <div style={{ padding: "2vh" }}>
            {fData.length > 0 ? (
              <>
                <div>
                  <TableContainer>
                    <Table style={{ overflow: "scroll" }}>
                      <TableHead>
                        <TableRow>
                          {/* Add a header for SN */}
                          <TableCell style={{ fontWeight: "bold" }}>
                            SN
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            WPfx
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {t("Workflow Name")}
                          </TableCell>
                          {Object.keys(fData[0])
                            .filter(
                              (key) =>
                                key.toUpperCase() !== "ID" &&
                                key.toUpperCase() !== "WORKFLOW" &&
                                key.toUpperCase() !== "USERID" &&
                                key.toUpperCase() !== "APPROVEDBY" &&
                                key.toUpperCase() !== "REJECTEDBY" &&
                                key.toUpperCase() !== "FINALAPPROVAL"
                            )
                            .map((key) => (
                              <TableCell
                                key={key}
                                style={{ fontWeight: "bold" }}
                              >
                                {key.toUpperCase()}
                              </TableCell>
                            ))}
                          <TableCell colSpan={2} style={{ fontWeight: "bold" }}>
                            Reviewer's Status
                          </TableCell>
                          <TableCell style={{ fontWeight: "bold" }}>
                            {t("ACTION")}
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {fData.map((rowData, rowIndex) => (
                          <TableRow key={rowIndex}>
                            {/* Display serial number starting from 1 */}
                            <TableCell>{rowIndex + 1}</TableCell>
                            <TableCell>{wfD.workflow_prefix} {rowData.id}</TableCell>
                            <TableCell>{wfD.workflow_name}</TableCell>
                            {Object.entries(rowData)
                              .filter(
                                ([key]) =>
                                  key.toUpperCase() !== "ID" &&
                                  key.toUpperCase() !== "WORKFLOW" &&
                                  key.toUpperCase() !== "USERID" &&
                                  key.toUpperCase() !== "APPROVEDBY" &&
                                  key.toUpperCase() !== "REJECTEDBY" &&
                                  key.toUpperCase() !== "FINALAPPROVAL"
                              )
                              .map(([key, value]) => (
                                <TableCell key={key}>
                                  {typeof value === "string" &&
                                    /\.(jpg|jpeg|png|gif|bmp)$/i.test(value) ? (
                                    <ImageViewComponent imageUrl={value} />
                                  ) : (
                                    value
                                  )}
                                </TableCell>
                              ))}
                            <TableCell colSpan={2}>
                              {rowData.ApprovedBy ? (
                                <span
                                  style={{
                                    backgroundColor: "lightgreen",
                                    marginRight: "10px",
                                  }}
                                >
                                  {rowData.ApprovedBy}
                                </span>
                              ) : null}
                              {rowData.RejectedBy ? (
                                <span
                                  style={{
                                    backgroundColor: "lightcoral",
                                    marginRight: "10px",
                                  }}
                                >
                                  {rowData.RejectedBy}
                                </span>
                              ) : null}
                            </TableCell>
                            <TableCell>
                              {console.log(
                                "rowData.ApprovedBy:",
                                rowData.ApprovedBy
                              )}
                              {console.log(
                                "rowData.RejectedBy:",
                                rowData.RejectedBy
                              )}
                              {console.log("var_myUname:", var_myUname)}

                              {rowData.ApprovedBy &&
                                rowData.ApprovedBy.split(",")
                                  .map((name) => name.trim())
                                  .includes(var_myUname) ? (
                                <Typography
                                  variant="body1"
                                  style={{ color: "green", fontWeight: "bold" }}
                                >
                                  {t("Approved by you")}
                                </Typography>
                              ) : rowData.RejectedBy &&
                                rowData.RejectedBy.split(",")
                                  .map((name) => name.trim())
                                  .includes(var_myUname) ? (
                                <Typography
                                  variant="body1"
                                  color="error"
                                  fontWeight="bold"
                                >
                                  {t("Rejected by you")}
                                </Typography>
                              ) : (
                                <>
                                  <Button
                                    style={{ margin: "2vh", width: "12vh" }}
                                    variant="contained"
                                    size="large"
                                    color="success"
                                    onClick={() => handleApprove(rowData.id)}
                                    disabled={btnEnable}
                                  >
                                    {t("Approve")}
                                  </Button>
                                  <Button
                                    style={{ margin: "2vh", width: "12vh" }}
                                    variant="contained"
                                    size="large"
                                    color="error"
                                    onClick={() => handleReject(rowData.id)}
                                    disabled={btnEnable}
                                  >
                                    {t("Reject")}
                                  </Button>
                                </>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </div>
              </>
            ) : (
              <div>
                <h4>No Data</h4>{" "}
                <Button
                  style={{ margin: "2vh", width: "12vh" }}
                  onClick={() => navigate("/dashboard/workflowReviewer")}
                  variant="contained"
                  size="large"
                  color="warning"
                >
                  Close
                </Button>
              </div>
            )}
          </div>
        </Card>
      </Container>
    </>
  );
};

export default UserWorkFlow;
