import axios from "axios";
import jsPDF from 'jspdf';

const apiUrl = process.env.REACT_APP_BASE_URL;
const apiUploadUrl = process.env.REACT_APP_UPLOAD_URL;

export const generateSignsHTMLForFillWorkflow = async (wfD, id) => {
  const reviewers = wfD.reviewer;
  const finalApprover = wfD.final_approval;
  if (!reviewers) {
    console.log("No reviewers found.");
    return '';
  }
  const usernames = reviewers.split(',');

  let htmlContent = '';


  for (const username of usernames) {
    try {
      const url = `${apiUploadUrl}/ateeb/get-sign?username=${username}`;

      const response = await axios.post(url, {
        tableName: wfD.form_name,
        id: id,
      });

      const userData = response.data;

      const { name, sign, status } = userData;

      if (status === 'Approved' || status === 'Rejected') {
        const reviewerHTML = `
          <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px; margin-top: 20px; ">
            <div>
              <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;">Workflow Review ${status} by (${name}):</p>
            </div>
            <div>
              <img src="${sign}" alt="Signature" style="width: 50px; height: 50px;" />
            </div>
          </div>
        `;
        htmlContent += reviewerHTML;
      }
    } catch (error) {
      console.error(`Error for username ${username}: ${error.message}`);
    }
  }

  try {
    const url = `${apiUploadUrl}/ateeb/get-sign?username=${finalApprover}`;

    const response = await axios.post(url, {
      tableName: wfD.form_name,
      id: id,
    });

    const userData = response.data;

    const { name, sign, status } = userData;


    const finalApprovalHTML = `
        <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px;">
          <div>
            <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;>Final approval (${name}):</p>
          </div>
          <div>
            <img src="${sign}" alt="Signature" style="width: 50px; height: 50px;" />
          </div>
        </div>
        `;
    htmlContent += finalApprovalHTML;

  } catch (error) {
    console.error(`Error for username ${finalApprover}: ${error.message}`);
  }

  return htmlContent;
};


export const handleGeneratePDFForFillWorkflow = async (uid, wfD, RevSigns, finalIncludeFields, identifier) => {
  const doc = new jsPDF('p', 'px');
  const response = await axios.get(`${apiUrl}/users/${uid}`);
  const data = response.data;
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(wfD.pdfContent, "text/html");

  replaceTextInElement(htmlDoc.body, "{{ID}}", data.u_id);
  replaceTextInElement(htmlDoc.body, "{{UserName}}", data.Username);
  replaceTextInElement(htmlDoc.body, "{{Name}}", data.Fname);
  replaceTextInElement(htmlDoc.body, "{{LName}}", data.Lname);
  replaceTextInElement(htmlDoc.body, "{{Country}}", data.Country);
  replaceTextInElement(htmlDoc.body, "{{Role}}", data.Role);
  replaceTextInElement(htmlDoc.body, "{{Address}}", data.Address);
  replaceTextInElement(htmlDoc.body, "{{City}}", data.City);
  var htmlContent = htmlDoc.body.innerHTML;
  htmlContent += RevSigns;



  htmlContent = generateRequiredFields(finalIncludeFields, identifier, htmlContent)

  htmlDoc.body.innerHTML = htmlContent;
  doc.html(htmlContent, {
    callback: function (doc) {
      doc.save();
    },
    margin: [20, 30, 25, 30],
    x: 0,
    y: 0,
    width: doc.internal.pageSize.width,
    windowWidth: 650,
    html2canvas: {
      allowTaint: true,
      useCORS: true
    }
  });


};

function generateRequiredFields(finalIncludeFields, identifier, htmlContent) {
  let modifiedHtmlContent = `
    <p style="text-align:center; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;">Document Identifier - ${identifier}</p>
  `;
  Object.keys(finalIncludeFields).forEach((field) => {
    modifiedHtmlContent += `
      <div style="display: flex; justify-content: flex-start; align-items: center;gap: 15">
      <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;"> ${field} - </p>
      <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;"> ${finalIncludeFields[field]} </p>
      </div>
    `
  })

  return modifiedHtmlContent + htmlContent;
}

function replaceTextInElement(element, searchText, replacementText) {
  if (element.nodeType === Node.TEXT_NODE) {
    element.nodeValue = element.nodeValue.replace(searchText, replacementText);
  } else if (element.nodeType === Node.ELEMENT_NODE) {
    for (let i = 0; i < element.childNodes.length; i++) {
      replaceTextInElement(element.childNodes[i], searchText, replacementText);
    }
  }
}
