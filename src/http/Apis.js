import axios from "axios";

export async function getFormDetails(formName) {
    try {
        const responseWF = await axios.get(`https://mainpcisv.pcisv.ro/formdetails?name=${formName}`);
        const response = responseWF?.data?.formDetails;
        return ({
            id: response?.id,
            name: response?.name,
            inputs: JSON.parse(response?.inputs),
            select_values: JSON.parse(response.select_vlaues)
        });
    } catch (error) {
        console.log(error);
    }
}