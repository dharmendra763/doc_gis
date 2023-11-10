import { Box, Button, Modal } from '@mui/material'
import React from 'react'

function SignSelectionModal({ isOpen, closeModal, openAddSign, openUploadSign }) {
    return (
        <Modal
            open={isOpen}
            onClose={closeModal}
            aria-labelledby="sign-selection-modal"
            aria-describedby="sign-upload-by-selection"
        >
            <Box
                style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    backgroundColor: 'white',
                    padding: '40px',
                    display: 'flex',
                    alignItems: 'center', // Center content horizontally
                }}
            >
                <Button
                    style={{
                        height: '50px',
                        margin: '10px',
                        marginBottom: '20px',
                        width: '230px',
                        background: 'orange',
                        marginRight: '20px',
                    }}
                    onClick={openUploadSign}
                    variant="contained"
                >
                    Upload Image
                </Button>
                <Button
                    style={{
                        height: '50px',
                        margin: '10px',
                        marginBottom: '20px',
                        width: '230px',
                        background: 'orange',
                        marginRight: '20px',
                    }}
                    onClick={openAddSign}
                    variant="contained"
                >
                    Add your sign
                </Button>
                <Button
                    style={{
                        height: '50px',
                        margin: '10px',
                        marginBottom: '20px',
                        width: '80px',
                        background: 'red',
                        marginRight: '20px',
                    }}
                    onClick={closeModal}
                    variant="contained"
                >
                    Close
                </Button>
            </Box>
        </Modal>
    )
}

export default SignSelectionModal