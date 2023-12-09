import React, { useState } from "react";
import { Viewer, Worker } from "@react-pdf-viewer/core";
import { defaultLayoutPlugin } from "@react-pdf-viewer/default-layout";
import "@react-pdf-viewer/core/lib/styles/index.css";
import "@react-pdf-viewer/default-layout/lib/styles/index.css";

function PDFviewer({viewPdf}) {
  const [urlLink, setUrlLink] = useState(''); // State to hold the URL link
  const [errorMsg, setErrorMsg] = useState(''); // State to hold any error messages

  const handleWebScrape = () => {
    // Placeholder function for your web scraping logic
    // Here you can make an API call to your backend which will handle the scraping
    // Based on the response, you can either set the PDF to display or show an error message
  };

  const viewPdfs = viewPdf;
  const newplugin = defaultLayoutPlugin();

  return (
    <div className="container">
      <div>
        <label htmlFor="webScrapeLink">Link for Web Scraping:</label>
        <input 
          type="text" 
          id="webScrapeLink" 
          value={urlLink} 
          onChange={(e) => setUrlLink(e.target.value)} 
          placeholder="Enter URL link here"
        />
        <button onClick={handleWebScrape}>Scrape</button>
        {errorMsg && <p style={{color: 'red'}}>{errorMsg}</p>}
      </div>
      <div className="pdf-container">
        <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.4.120/build/pdf.worker.min.js">
          {viewPdfs && (
            <Viewer
              fileUrl={viewPdfs}
              plugins={[newplugin]}
            />
          )}
          {!viewPdfs && <>No pdf</>}
        </Worker>
      </div>
    </div>
  );
}

export default PDFviewer;
