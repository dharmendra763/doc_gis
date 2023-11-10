import React, { useMemo, useState, useRef } from 'react';
import { Modal, Button, Box, Stack } from '@mui/material';
import CanvasDraw from 'react-canvas-draw';
import axios from 'axios';

/**
 * 
 * @param {signType}  string  image or signature
 * @returns 
 */
const SignatureModal = ({ isOpen, onClose, onSave, fetchUserData, signType }) => {
  const signature = useRef(null);
  const [imageLink, setImageLink] = useState(null);
  const user = localStorage.getItem("adminInfo");
  const data = JSON.parse(user);
  const [currentTab, setCurrentTab] = useState(0);
  const [image, setImage] = useState(null);
  const imageSrc = useMemo(() => image ? URL.createObjectURL(image) : "", [image])
  const apiUploadUrl = process.env.REACT_APP_UPLOAD_URL;

  const saveImage = async () => {
    if (image) {
      const isConfirmed = window.confirm(
        "Are you sure you want to save your signature? This action cannot be undone or changed."
      );

      if (isConfirmed) {
        try {
          const formData = new FormData();
          formData.append('files', image, 'sign.png');
          formData.append('type', 'signatures');
          formData.append('category', data?.username);

          console.log('Uploading file...');

          const response = await axios.post(
            `${apiUploadUrl}/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data'
              }
            }
          );

          console.log('Server Response:', response.data);

          const imageLink = response.data.downloadLinks[0];
          // setImageLink(imageLink);

          const nextApiResponse = await axios.put(
            `${apiUploadUrl}/ateeb/admins`,
            {
              id: data?.id,
              sign: imageLink, // Image link from the previous API response
            },
            {
              headers: {
                'Content-Type': 'application/json', // Add this header
              },
            }
          );

          console.log('Next API Response:', nextApiResponse.data);
          fetchUserData();
          localStorage.setItem("my_signature", imageLink);
          onClose();
          window.localStorage.setItem("adminInfo", JSON.stringify({ ...data, sign_added: "True" }));
        } catch (error) {
          console.error('Adding signature Error:', error);
        }
      }
    }
  };


  const handleSave = async () => {
    if (signature) {
      const isConfirmed = window.confirm(
        "Are you sure you want to save your signature? This action cannot be undone or changed."
      );

      if (isConfirmed) {
        try {
          const signatureDataURL = signature.current.canvasContainer.children[1].toDataURL();
          const blob = await fetch(signatureDataURL).then((res) => res.blob());

          const formData = new FormData();
          formData.append('files', blob, 'sign.png');
          formData.append('type', 'signatures');
          formData.append('category', data?.username);

          console.log('Uploading file...');

          const response = await axios.post(
            `${apiUploadUrl}/upload`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          console.log('Server Response:', response.data);

          const imageLink = response.data.downloadLinks[0];
          setImageLink(imageLink);

          const nextApiResponse = await axios.put(
            `${apiUploadUrl}/ateeb/admins`,
            {
              id: data?.id,
              sign: imageLink, // Image link from the previous API response
            },
            {
              headers: {
                'Content-Type': 'application/json', // Add this header
              },
            }
          );

          console.log('Next API Response:', nextApiResponse.data);
          fetchUserData();
          localStorage.setItem("my_signature", imageLink);
          onClose();
          window.localStorage.setItem("adminInfo", JSON.stringify({ ...data, sign_added: "True", sign: imageLink }));
        } catch (error) {
          console.error('Adding signature Error:', error);
        }
      }
    }
  };


  const handleReset = () => {
    // console.log(signature.current.getSaveData());
    signature.current?.clear();
    signature.current?.resetView();
    signature.current?.eraseAll();

    // if (signature && signature.current) {
    //   if (timeout) {
    //     clearTimeout(timeout)
    //   }
    //   timeout = setTimeout(() => {
    //     signature.current.clear();
    //     signature.current.resetView();
    //     signature.current.eraseAll();

    //   }, 1000);


    // signature.clear();
    // setImageLink(null);
    // }
  };
  console.log(signature)

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="signature-modal"
      aria-describedby="signature-modal-description"
    >
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: 'max-content',
          backgroundColor: "white"
        }}>
        {
          signType === "signature" &&
          <div
            style={{
              display: "flex",
              width: 'max-content',
              flexWrap: "wrap"
            }}
          >
            <div
              style={{
                backgroundColor: 'white',
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center', // Center content horizontally
              }}
            >
              <div
                style={{
                  border: '2px solid black', // Add black border
                  width: '200px', // Set a fixed width
                  height: '200px', // Set a fixed height
                  display: 'flex',
                  justifyContent: 'center', // Center content vertically
                }}
              >
                <CanvasDraw
                  ref={signature}
                  hideGrid
                  canvasWidth={196} // Adjust canvas width to account for the border
                  canvasHeight={196} // Adjust canvas height to account for the border
                  brushRadius={2}
                  lazyRadius={0}
                  immediateLoading
                />
              </div>
              <div style={{ marginTop: '10px' }}>
                <Button
                  style={{
                    height: "50px",
                    margin: "10px",
                    marginBottom: "20px",
                    width: "80px",
                    background: "green",
                    marginRight: "20px",
                  }}
                  onClick={handleSave}
                  variant="contained"
                >
                  Save
                </Button>
                <Button
                  style={{
                    height: "50px",
                    margin: "10px",
                    marginBottom: "20px",
                    width: "80px",
                    background: "orange",
                    marginRight: "20px",
                  }}
                  onClick={handleReset}
                  variant="contained"
                >
                  Reset
                </Button>
                <Button
                  style={{
                    height: "50px",
                    margin: "10px",
                    marginBottom: "20px",
                    width: "80px",
                    background: "red",
                    marginRight: "20px",
                  }}
                  onClick={onClose}
                  variant="contained"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        }
        {
          signType === "image" &&
          <Box
            style={{
              backgroundColor: 'white',
              padding: '20px',
              display: 'flex',
              flexDirection: "column",
              alignItems: 'center', // Center content horizontally
            }}
          >
            {imageSrc && (
              <img src={imageSrc} alt="Uploaded Image" height="200" width="200" style={{ border: "2px solid black" }} />
            )}
            <Stack direction="row" alignItems="center" spacing={2} style={{ margin: 10 }}>
              <Button
                style={{
                  height: '50px',
                  margin: '10px',
                  marginBottom: '20px',
                  width: '80px',
                  background: "green",
                  marginRight: '20px',
                }}
                variant="contained"
                component="span"
                disabled={!image}
                onClick={saveImage}
              >
                Save
              </Button>
              <label htmlFor="upload-image">
                <Button
                  style={{
                    height: '50px',
                    margin: '10px',
                    marginBottom: '20px',
                    width: '80px',
                    background: 'orange',
                    marginRight: '20px',
                  }}
                  variant="contained"
                  component="span"
                >
                  Choose
                </Button>
                <input id="upload-image" hidden accept="image/*" type="file" onChange={(e) => setImage(e.target.files[0])} />
              </label>
              <Button
                style={{
                  height: '50px',
                  margin: '10px',
                  marginBottom: '20px',
                  width: '80px',
                  background: 'red',
                  marginRight: '20px',
                }}
                variant="contained"
                component="span"
                onClick={onClose}
              >
                Close
              </Button>
            </Stack>
          </Box>
        }
      </Box>
    </Modal >
  );
};

export default SignatureModal;
