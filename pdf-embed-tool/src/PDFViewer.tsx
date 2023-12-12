import React, {useEffect, useState} from 'react';
import PDFObject from 'pdfobject';
import {PdfUrlInputForm} from "./PdfUrlInputForm";

/**
 * To test
 * (normal unprotected works in iframe) https://www.antennahouse.com/hubfs/xsl-fo-sample/pdf/basic-link-1.pdf
 * (normal unprotected works in iframe) https://www.clickdimensions.com/links/TestPDFfile.pdf
 * (normal unprotected works in iframe)  https://www.pdf995.com/samples/pdf.pdf
 * (HTTP PDF -> convert to https and should work) http://www.africau.edu/images/default/sample.pdf
 * (cors PDF -> should trigger fallback url) https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf
 * @constructor
 */


export const PDFViewer = () => {
    const [pdfUrl, setPdfUrl] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isUrlProvided, setIsUrlProvided] = useState(false);

    const checkUrlAccessibility = async (url: string): Promise<boolean> => {
        if (!url.startsWith("https")) {
            return false;
        }
        try {
            const response = await fetch(url, {
                method: 'HEAD', // Use HEAD to minimize data transfer
                mode: 'no-cors' // This avoids sending the preflight request
            });
            return response.ok; // This will always be false in 'no-cors' mode, but we can check the type of error in the catch block
        } catch (error) {
            if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
                // This indicates a possible CORS issue
                console.error('CORS error:', error);
                return true; // Return true if a CORS issue is detected
            } else {
                // Other types of errors
                console.error('Error checking URL:', error);
                return false;
            }
        }
    };

    const embedPDF = async (originalUrl:string) => {
        let url = originalUrl;
        const isAccessible = await checkUrlAccessibility(originalUrl);
        if (!isAccessible) {
            let properties:{
                CORS_PROXY:string,
                FORCE_CORS_PROXY:string,
                FINAL_FALLBACK_URL:string
            } = (window as any).properties;
            console.log('original URL is not accessible (not iframable or downloadable)');
            //look in public test folder for blocked sample PDFs.
            // Try using CORS proxy
            let isProxyAccessible = false;
            if(properties.CORS_PROXY) {
                const corsProxyUrl = properties.CORS_PROXY+originalUrl;
                isProxyAccessible = await checkUrlAccessibility(corsProxyUrl);
                console.log(`using cors proxy : ${properties.CORS_PROXY}`);
                console.log('proxy URL is accessible:', isProxyAccessible);
                url = isProxyAccessible ? corsProxyUrl : originalUrl;
            }
            if (!isProxyAccessible && properties.FINAL_FALLBACK_URL) {
                let fallbackURL = properties.FINAL_FALLBACK_URL+originalUrl;
                console.log('using fallback URL : ', fallbackURL);
                window.location.href = fallbackURL; // Use fallback URL
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
