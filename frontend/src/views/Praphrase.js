import TextEditor from "components/Editor/TextEditor";
import React, { useState } from "react";
import { Row, Col } from "reactstrap";

function Paraphrase() {
  const [pdfFile, setPDFFile] = useState(null);
  const [viewPdf, setViewPdf] = useState(null);
  const [isPDF, setIsPDF] = useState(false);
  const [url, setUrl] = useState('');
  const [processedText, setProcessedText] = useState(""); // Added this line
  const [processedSummary, setProcessedSummary] = useState(""); // Added this line


  const handleChange = (e) => {
    let selectedFile = e.target.files[0];
    let fileType = ["application/pdf"];
    if (selectedFile) {
      if (selectedFile && fileType.includes(selectedFile.type)) {
        let reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = (e) => {
          setPDFFile(e.target.result);
        };
      } else {
        setPDFFile(null);
      }
    } else {
      console.log("please select");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pdfFile !== null) {
      setIsPDF(true);
      setViewPdf(pdfFile);
    } else {
      setViewPdf(null);
    }
  };

  const handleGetParaphrase = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://127.0.0.1:5000/scrape_and_paraphrase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ url: url })
      });

      const data = await response.json();
      console.log("Received Data from /scrape_and_paraphrase:", data);
      setProcessedText(data.processedData);
      console.log("Updated processedText:", processedText);

    } catch (error) {
      console.error("Error fetching summary:", error);
    }
  };
  const handleGetSummary = async (e) => {
    e.preventDefault();
    try {
        const response = await fetch('http://127.0.0.1:5000/scrape_and_summary', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ url: url })
        });

        const data = await response.json();
        setProcessedSummary(data.processedSummary);

    } catch (error) {
        console.error("Error fetching summary:", error);
    }
};



  return (
    <>
      <div className="content">
        <Row>
          <Col md="12">
            <form onSubmit={handleSubmit}>
              <input
                type="file"
                className="form-control"
                onChange={(e) => handleChange(e)}
              />
              <button type="submit" className="btn btn-success">
                View PDF
              </button>
            </form>
            <div>
              <input 
                  type= "url" 
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="form-control" 
                  placeholder="Enter URL"
              />
              <br></br>
              <button onClick={handleGetParaphrase} className="btn btn-success">
                  Get Paraphrase
              </button>
              <br></br>
              <button onClick={handleGetSummary} className="btn btn-success">
                  Get Summary
              </button>
            </div>

            <TextEditor setIsPDF={setIsPDF} viewPdf={viewPdf} isPDF={isPDF} />
            
            <div className="card">
  <div className="card-body">
      <div className="row">
         {/* Paraphrased Content */}
        <div className="para-box col-sm-12 col-md-6 col-lg-6">
            <div className="mt-3">
              <h3>web scrapping</h3>
              <h4>Paraphrased Content:</h4>
              <p>{processedText}</p>
            </div>
        </div>
         {/* Summary Content */}
        <div className="summary-box col-sm-12 col-md-6 col-lg-6">
            <div className="mt-3">
              <h4>Summary:</h4>
              <p>{processedSummary}</p>
               {/* Assuming you have a state or prop named processedSummary */}
            </div>
        </div>
      </div>
  </div>
</div>

          </Col>
        </Row>
      </div>
    </>
  );
}

export default Paraphrase;