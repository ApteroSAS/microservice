import React from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

export const PdfUrlInputForm: React.FC<{ pdfUrl: string, setPdfUrl: React.Dispatch<React.SetStateAction<string>>, onSubmit: () => void }> = ({pdfUrl, setPdfUrl, onSubmit}) => {
    const handleUrlChange = (event: { target: { value: any; }; }) => {
        setPdfUrl(event.target.value);
    };

    return (
        <Box sx={{textAlign: 'center'}}>
            <TextField
                label="Enter the URL of the PDF"
                type="text"
                value={pdfUrl}
                onChange={handleUrlChange}
                variant="outlined"
                fullWidth
                margin="normal"
            />
            <Button variant="contained" color="primary" onClick={onSubmit}>
                Load PDF
            </Button>
        </Box>
    );
};
