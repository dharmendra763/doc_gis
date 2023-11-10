import React, { useEffect, useState } from "react";
import axios from "axios";
import { Button } from "@mui/material";

// interface LocationError {
//   showError: boolean;
//   message?: string;
// }

let watchId;

const GeolocationButton = ({ setFormValues, formValues, fieldName }) => {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState({ showError: false });
    const [position, setPosition] = useState();

    const getLocation = async (position) => {
        try {
            navigator.geolocation.getCurrentPosition(
                async (position) => {
                    const response = await axios.get(
                        "https://maps.googleapis.com/maps/api/geocode/json?address=" +
                        position.coords.latitude +
                        "," +
                        position.coords.longitude +
                        "&key=" +
                        "AIzaSyBuiiOnOXY5Dr5T4bRD3YD01vU4yUGb14E"
                    );
                    if (response) {
                        setFormValues({
                            ...formValues,
                            [fieldName]: response?.data?.results?.[0]?.formatted_address,
                        });
                    }
                },
                (error) => {
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            alert("User denied the request for Geolocation.")
                            break;
                        case error.POSITION_UNAVAILABLE:
                            alert("Location information is unavailable.")
                            break;
                        case error.TIMEOUT:
                            alert("The request to get user location timed out.")
                            break;
                        case error.UNKNOWN_ERROR:
                            alert("An unknown error occurred.")
                            break;
                    }
                }
            )
        } catch (error) { }
    };
    return (
        <>
            <Button
                color="primary"
                type="button"
                variant="contained"
                onClick={getLocation}
                style={{ padding: 10, marginTop: "24px", marginLeft: "10px" }}
            >
                Fetch
                {/* position ? `${position.coords.latitude} ${position.coords.longitude}` : */}
            </Button>
        </>
    );
};

export default GeolocationButton;
