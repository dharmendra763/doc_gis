import axios from "axios";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

const apiUrl = process.env.REACT_APP_BASE_URL;
const apiUploadUrl = process.env.REACT_APP_UPLOAD_URL;

export const generateSignsHTML = async (wfD, id) => {
  const reviewers = wfD.reviewer;
  if (!reviewers) {
    console.log("No reviewers found.");
    return "";
  }
  const usernames = reviewers.split(",");

  let htmlContent = "";

  for (const username of usernames) {
    try {
      const url = `${apiUploadUrl}/ateeb/get-sign?username=${username}`;

      const response = await axios.post(url, {
        tableName: wfD.form_name,
        id: id,
      });

      const userData = response.data;

      const { name, sign, status } = userData;

      if (status === "Approved" || status === "Rejected") {
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

  return htmlContent;
};

// export const handleGeneratePDF = async (
//   uid,
//   wfD,
//   var_myName,
//   var_mySignature,
//   RevSigns,
//   finalIncludeFields,
//   identifier
// ) => {
//   const doc = new jsPDF("p", "px");
//   const str = `${uid}`;
//   const [item1, item2, item3] = str.split("&");
//   const response = await axios.get(`${apiUrl}/users/${item3}`);
//   const data = response.data;
//   const parser = new DOMParser();
//   const htmlDoc = parser.parseFromString(wfD.pdfContent, "text/html");
//   function replaceTextInElement(element, searchText, replacementText) {
//     if (element.nodeType === Node.TEXT_NODE) {
//       element.nodeValue = element.nodeValue.replace(
//         searchText,
//         replacementText
//       );
//     } else if (element.nodeType === Node.ELEMENT_NODE) {
//       for (let i = 0; i < element.childNodes.length; i++) {
//         replaceTextInElement(
//           element.childNodes[i],
//           searchText,
//           replacementText
//         );
//       }
//     }
//   }
//   replaceTextInElement(htmlDoc.body, "{{ID}}", data.u_id);
//   replaceTextInElement(htmlDoc.body, "{{UserName}}", data.Username);
//   replaceTextInElement(htmlDoc.body, "{{Name}}", data.Fname);
//   replaceTextInElement(htmlDoc.body, "{{LName}}", data.Lname);
//   replaceTextInElement(htmlDoc.body, "{{Country}}", data.Country);
//   replaceTextInElement(htmlDoc.body, "{{Role}}", data.Role);
//   replaceTextInElement(htmlDoc.body, "{{Address}}", data.Address);
//   replaceTextInElement(htmlDoc.body, "{{City}}", data.City);
//   var htmlContent = "";
//   htmlContent += htmlDoc.body.innerHTML;
//   htmlContent += RevSigns;
//   htmlContent += `
//     <div style="display: flex; justify-content: flex-start; align-items: center; gap: 15px;">
//       <div>
//         <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;">Final approval (${var_myName}):</p>
//       </div>
//       <div>
//         <img src="${var_mySignature}" alt="Signature" style="width: 50px; height: 50px;" />
//       </div>
//     </div>
//   `;
//   let div = document.createElement("div");
//   document.body.appendChild(div);
//   htmlContent = generateRequiredFields(
//     finalIncludeFields,
//     identifier,
//     htmlContent
//   );
//   if (div) {
//     div.innerHTML = htmlContent;
//     console.log(div);
//     doc.html(div, {
//       callback: function (doc) {
//         doc.save();
//       },
//       margin: [20, 30, 25, 30],
//       x: 0,
//       y: 0,
//       height: doc.internal.pageSize.height,
//       width: doc.internal.pageSize.width,
//       windowWidth: doc.internal.pageSize.width,
//     });
//   }
// };

// function generateRequiredFields(finalIncludeFields, identifier, htmlContent) {
//   let modifiedHtmlContent = `
//     <p style="text-align:center; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;">Document Identifier - ${identifier}</p>
//   `;
//   Object.keys(finalIncludeFields).forEach((field) => {
//     modifiedHtmlContent += `
//       <div style="display: flex; justify-content: flex-start; align-items: center;gap: 15">
//       <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;"> ${field} - </p>
//       <p style="text-align: left; margin: 0; font-family: 'Times New Roman', serif; font-size: 12px;"> ${finalIncludeFields[field]} </p>
//       </div>
//     `;
//   });

//   return modifiedHtmlContent + htmlContent;
// }
export const handleGeneratePDF = async (
  uid,
  wfD,
  var_myName,
  var_mySignature,
  RevSigns,
  finalIncludeFields,
  identifier
) => {
  const doc = new jsPDF("p", "px");
  const str = `${uid}`;
  const [item1, item2, item3] = str.split("&");
  const response = await axios.get(`${apiUrl}/users/${item3}`);
  const data = response.data;
  const parser = new DOMParser();
  const htmlDoc = parser.parseFromString(wfD.pdfContent, "text/html");


  function replaceTextInElement(element, searchText, replacementText) {
    if (element.nodeType === Node.TEXT_NODE) {
      element.nodeValue = element.nodeValue.replace(
        searchText,
        replacementText
      );
    } else if (element.nodeType === Node.ELEMENT_NODE) {
      for (let i = 0; i < element.childNodes.length; i++) {
        replaceTextInElement(
          element.childNodes[i],
          searchText,
          replacementText
        );
      }
    }
  }


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

  const reviewerHTML = `
          <div style="display: flex;">
            <p style="text-align: left;  font-family: 'Times New Roman', serif; font-size: 16px;"'>Final approval (${var_myName}):</p>
            <img src=${var_mySignature} alt="Signature" style="width: 50px; height: 50px;" />
   </div>`;
  htmlContent += reviewerHTML;

  // let div = document.createElement("div");
  // document.body.appendChild(div);
  htmlContent = generateRequiredFields(
    finalIncludeFields,
    identifier,
    htmlContent
  );
  // if (div) {
    // div.innerHTML = htmlContent;
    // console.log(div.innerHTML);
    doc.html(htmlContent, {
            callback: function (doc) {
              doc.save();
            },
            margin: [20, 30, 25, 30],
            x: 0,
            y: 0,
            height: doc.internal.pageSize.height,
            width: doc.internal.pageSize.width,
            windowWidth: doc.internal.pageSize.width,
          });

          /** 
           * HTML2CANVAS IS PRINTING BLURRY IMAGES
           * FOR SOME REASON AND THE OLD HTML IS INVALID
          */
    // html2canvas(div, { allowTaint: true, useCORS: true,scale: 1 }).then(
    //   async (canvas) => {
    //     let pdfData = new jsPDF("p", "px");
    //     pdfData.addImage(
    //       canvas.toDataURL("image/png"),
    //       "PNG",
    //       50,
    //       10,
    //       pdfData.internal.pageSize.width,
    //       pdfData.internal.pageSize.height,
    //       "",
    //       "NONE"
    //     );
    //     pdfData.save("invoice.pdf");
    //     document.body.removeChild(div);
    //   }
    // );


    
  // }
};
function generateRequiredFields(finalIncludeFields, identifier, htmlContent) {
  let modifiedHtmlContent = `
   <div style = 'margin: 10px;display: flex; align_items:center; justify-content:center'>
      <p style="text-align:center; margin:10px; font-family: 'Times New Roman', serif; font-size: 20px;">Document Identifier - ${identifier}</p>
    </div>
  `;
  // Object.keys(finalIncludeFields).forEach((field) => {
  //   modifiedHtmlContent += `
  //     <div style="display: flex;">
  //     <span style="text-align: left; font-family: 'Times New Roman', serif; font-size: 16px;"> ${field} - </span>
  //     <span style="text-align: left; font-family: 'Times New Roman', serif; font-size: 16px;"> ${finalIncludeFields[field]} </span>
  //     </div>
  //   `;
  // });

  return modifiedHtmlContent + htmlContent;
}