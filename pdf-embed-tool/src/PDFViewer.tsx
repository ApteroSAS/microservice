import React, {useEffect, useState} from 'react';
import PDFObject from 'pdfobject';
import {PdfUrlInputForm} from "./PdfUrlInputForm";


export const PDFViewer = () => {
    const [pdfUrl, setPdfUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUrlProvided, setIsUrlProvided] = useState(false);

    const checkUrlAccessibility = async (url:string) => {
        if(!url.startsWith("https")) {
            return false;
        }
        try {
            const response = await fetch(url, {
                method: 'HEAD', // Use HEAD to fetch headers only
                mode: 'no-cors'  // Prevent CORS errors
            });

            return response.ok; // True if status code is 2xx
        } catch (error) {
            console.error('Error checking URL:', error);
            return false;
        }
    };

    const embedPDF = async (originalUrl:string) => {
        let url = originalUrl;
        const isAccessible = await checkUrlAccessibility(originalUrl);
        if (!isAccessible) {
            //look in public test folder for blocked sample PDFs.
            // Try using CORS proxy
            let isProxyAccessible = false;
            if(process.env.CORS_PROXY) {
                const corsProxyUrl = process.env.CORS_PROXY+encodeURIComponent(originalUrl);
                isProxyAccessible = await checkUrlAccessibility(corsProxyUrl);
                url = isProxyAccessible ? corsProxyUrl : originalUrl;
            }
            if (!isProxyAccessible && process.env.FINAL_FALLBACK_URL) {
                window.location.href = process.env.FINAL_FALLBACK_URL+encodeURIComponent(originalUrl); // Use fallback URL
            }
        }
        //PDF JS is used for IPHONE and mac. Use browserstack to test if needed
        const PDFJS_URL = 'web/viewer.html'; // Update this path
        PDFObject.embed(url, '#pdf-viewer', { height: '100vh', width: '100vw',PDFJS_URL: PDFJS_URL,forcePDFJS : false });
        setIsUrlProvided(true);
        setIsLoading(false);
    };

    useEffect(() => {
        const query = new URLSearchParams(window.location.search);
        const url = query.get('url');

        if (url) {
            setPdfUrl(url);
            embedPDF(url);
        } else {
            setIsLoading(false);
        }
    }, []);

    const handleUrlSubmit = () => {
        if (pdfUrl) {
            // Update the URL query string
            const newUrl = new URL(window.location.href);
            newUrl.searchParams.set('url', pdfUrl);
            window.history.pushState({}, '', newUrl);

            embedPDF(pdfUrl);
        }
    };

    return (<>
            {isLoading ? (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                    <img src="/PDF_file_icon.png" alt="Loading" style={{ maxHeight: '50%', maxWidth: '50%' }} />
                </div>
            ) : !isUrlProvided ? (
                <PdfUrlInputForm
                    pdfUrl={pdfUrl}
                    setPdfUrl={setPdfUrl}
                    onSubmit={handleUrlSubmit}
                />
            ) : null}
            <div id="pdf-viewer" style={{
                width: '100%',
                height: '100vh',
                overflow: 'hidden',
                visibility: isUrlProvided ? 'visible' : 'hidden'
            }} />

        </>
    );
};
