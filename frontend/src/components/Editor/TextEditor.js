import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { EditorState, RichUtils, Modifier } from "draft-js";
import { Editor } from "react-draft-wysiwyg";
import _ from "lodash";
import { Card, CardBody, CardFooter, Row, Col } from "reactstrap";

import parse from "html-react-parser";
import { toast } from "react-toastify";
import PDFviewer from "components/Editor/PDFviewer";

import KatexBlock from "../katex/components/KatexBlock";
import removeTexBlock from "../katex/modifiers/removeTexBlock";
import { KATEX_ENTITY } from "../katex/entity";
import control from "../katex/control";

const styleMap = {
  CODE: {
    overflowWrap: "break-word",
    borderRadius: "3px",
    padding: "1px 3px",
    fontFamily: "monospace",
    background: "grey",
  },
  HIGHLIGHT: {
    background: "#873939",
  },
  "HIGHLIGHT-PAST": {
    background: "#ad7b0d",
  },
};

function TextEditor(props) {
  const Con = control;
  const { setIsPDF, viewPdf, isPDF } = props
  const styles = ["HIGHLIGHT-PAST"];
  const [selected, setSelected] = useState({
    start: 0,
    end: 0,
  });
  const [original, setOriginal] = useState("");
  const [selectedText, setSelectedText] = useState("");
  const [compare, setCompare] = useState(false);
  const [editorState, setEditorState] = React.useState(() =>
    EditorState.createEmpty()
  );

  const notify = (msg) => toast.warn(msg, { theme: "dark" });
  const editor = React.useRef(null);
  function focusEditor() {
    editor.current.focus();
  }

  const contentWithoutStyles = _.reduce(
    styles,
    (newContentState, style) =>
      Modifier.removeInlineStyle(
        newContentState,
        editorState.getSelection(),
        style
      ),
    editorState.getCurrentContent()
  );

  const onChangeState = (editorState) => {
    setEditorState(editorState);
  };

  const handleKeyCommand = (command, editorState) => {
    const newState = RichUtils.handleKeyCommand(editorState, command);
    if (newState) {
      onChangeState(newState);
      return "handled";
    }
 
    const grammerCorrection = async (e) => {
      axios
        .post(
          "http://127.0.0.1:5000",
          { data: inputText },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "http://localhost:3000",
            },
          }
        )
        .then((response) => {
          setProcessedText(response.data.processedData);
        })
        .catch((error) => {
          console.error(error);
        });
    };
    function _onBoldClick() {
      onChangeState(RichUtils.toggleInlineStyle(editorState, "BOLD"));
    }
    const _onItalicClick = () => {
      onChangeState(RichUtils.toggleInlineStyle(editorState, "ITALIC"));
    };

    return "not-handled";
  }; 

  const [inputText, setInputText] = useState("");
  const [processedText, setProcessedText] = useState("");

  const handleInputChange = (event) => {
    setInputText(event.target.value);
  };

  
  const summarizer = async (e) => {
    let value = selectedText
    let body = {
        'text': value 

    }

    if (value.length > 0) {
    axios
        .post('http://127.0.0.1:5000/summarize', { 'data': body }, {
            headers: {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': "*"
            },
            withCredentials:true
        })
        .then((res) => {
           
            let text = res.data.summary
            if (text.length > 0) {
               
                setProcessedText(text);

            }
        })
        .catch((error) => {
            console.error(error);
        });
}
else {
    notify("Select Longer Sequence!!")
}
}



  const paraphrase = async (e) => {
    const currentfocus = editorState.getSelection().getFocusKey();
    const colorcheck = editorState
      .getCurrentInlineStyle(currentfocus)
      .has("HIGHLIGHT-PAST");

    // const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
    // const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
    let value = selectedText;

    if (value.length > 0) {
      if (!colorcheck) {
        onChangeState(RichUtils.toggleInlineStyle(editorState, "HIGHLIGHT"));
      }
      let body = {
        text: value,
        start: selected.start,
        end: selected.end,
      };

      axios
        .post(
          "http://127.0.0.1:5000/paraphrase",
          { data: body },
          {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          }
        )
        .then((res) => {
          console.log("Received Data from /paraphrase:", res.data);
          if (!colorcheck) {
            onChangeState(
              RichUtils.toggleInlineStyle(editorState, "HIGHLIGHT-PAST")
            );
          }
          let text = res.data.processedData;
          if (text.length > 0) {
            let split = text.split(" ");
            let error = res.data.error_words;
            let pos = res.data.pos;
            let arr = [];
            let stringg = "";
            console.log(pos)
            split.forEach((element, index) => {
              if (pos.length > 0) {
              pos.forEach((el, ind) => { 
                  if (pos[ind][0] == index) {
                    element = `<span classname = 'red'>${element}`;
                  } else if (pos[ind][1] == index) {
                    element = `${element}</span>`;
                    pos.shift();
                }
              });
            }
              stringg = stringg + " " + element;
            });
            setProcessedText(stringg);
            setOriginal(res.data.original);
          }
        })
        .catch((error) => {
          console.error(error);
        });
    } else {
      notify("Select Longer Sequence!!");
    }
  };

  const handleMouseUp = () => {
    const selection = window.getSelection();
    const selected = selection.toString();

    //Setting the start index and the end index of the selected words (making sure that the lower index is always the start)
    if (selected.length > 0) {
      setSelectedText(selected);
      let start = 0;
      let end = 0;

      if (selection.anchorOffset < selection.focusOffset) {
        start = selection.anchorOffset;
        end = selection.focusOffset;
      } else {
        start = selection.focusOffset;
        end = selection.anchorOffset;
      }

      let startend = {
        start: start,
        end: end,
      };
      console.log(startend);

      setSelected(startend);
    }
  };

  const clearHL = () => {
    setIsPDF(false)
    setCompare(false);
    setSelected("");
    setProcessedText("");
    onChangeState(
      EditorState.push(editorState, contentWithoutStyles, "change-inline-style")
    );
  };
  const handleKeyDown = () => {
    const currentfocus = editorState.getSelection().getFocusKey();
    const colorcheck = editorState
      .getCurrentInlineStyle(currentfocus)
      .has("HIGHLIGHT-PAST");
    if (colorcheck) {
      onChangeState(RichUtils.toggleInlineStyle(editorState, "HIGHLIGHT-PAST"));
    }
  };
  const blocksInEditingMode = new Map();
  const [readonly, setReadOnly] = useState(false);

  const getEditorState = () => {
    return editorState;
  };

  function myBlockRenderer(block) {
    if (block.getType() !== "atomic") return null;
    const contentState = getEditorState().getCurrentContent();

    const entity = block.getEntityAt(0);
    if (!entity) return null;
    const type = contentState.getEntity(entity).getType();
    if (type !== KATEX_ENTITY) return null;

    if (block.getType() == "atomic" && type == KATEX_ENTITY) {
      return {
        component: KatexBlock,
        editable: false,
        props: {
          getEditorState: getEditorState,
        },
      };
    }
  }

  return (
    <>
      <Card>
        <CardBody>
          <div
            onMouseUp={() => handleMouseUp()}
            onKeyDown={() => handleKeyDown()}
          >
            {/* <Con getEditorState ={getEditorState} onChange = {(es) => setEditorState(es)} value = {selectedText} ></Con> */}
            <Row>


              <Col lg="7">
                {
                  isPDF ?
                    <PDFviewer viewPdf={viewPdf} />
                    :
                    <Editor
                      customStyleMap={styleMap}
                      editorState={editorState}
                      handlePastedText={() => false}
                      wrapperClassName="rich-wrapper"
                      editorClassName="rich-editor"
                      toolbarClassName="rich-toolbar"
                      onEditorStateChange={(es) => setEditorState(es)}
                      toolbar={{
                        options: [
                          "inline",
                          "blockType",
                          "fontSize",
                          "list",
                          "textAlign",
                          "history",
                        ],
                        inline: { inDropdown: false },
                        list: { inDropdown: false },
                        textAlign: { inDropdown: false },
                        link: { inDropdown: false },
                        history: { inDropdown: false },
                        colorPicker: {
                          className: "colorpick",
                          popupClassName: "colorpick-pop",
                        },
                      }}
                      toolbarCustomButtons={[
                        <Con
                          getEditorState={getEditorState}
                          onChange={(es) => setEditorState(es)}
                          value={selectedText}
                        ></Con>,
                      ]}
                      readOnly={readonly}
                      customBlockRenderFunc={(e) => myBlockRenderer(e)}
                    />
                }

              </Col>
              <Col lg="5" md="12" sm="12" className="para-box">
                <div className="button-grp">
                  <button
                    type="button"
                    onClick={(e) => paraphrase(e)}
                    className="btn btn-transparent"
                  >
                    {/* <FontAwesomeIcon icon={'spell-check'} fill="currentColor"></FontAwesomeIcon> */}
                    <i className="fas fa-paper-plane"></i>
                    <span className="sr-only">Paraphrase</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => clearHL(e)}
                    className="btn btn-transparent"
                  >
                    {/* <FontAwesomeIcon icon={'spell-check'} fill="currentColor"></FontAwesomeIcon> */}
                    <i className="fas fa-times"></i>
                    <span className="sr-only">Paraphrase</span>
                  </button>
                  <button
                    type="button"
                    onClick={(e) => setCompare(!compare)}
                    className="btn btn-transparent"
                  >
                    {/* <FontAwesomeIcon icon={'spell-check'} fill="currentColor"></FontAwesomeIcon> */}

                    {compare ? (
                      <i class="fa fa-eye-slash"></i>
                    ) : (
                      <i class="fa fa-eye"></i>
                    )}
                    <span className="sr-only">Paraphrase</span>
                  </button>
                  <button type="button" onClick={(e) => summarizer(e)} className="btn btn-transparent">
                                    {/* <FontAwesomeIcon icon={'spell-check'} fill="currentColor"></FontAwesomeIcon> */}
                                    <i className="fas fa-book"></i>
                                    <span className="sr-only">Summarize</span>
                                </button>
                </div>

                {compare && original.length > 0 ? (
                  <div className="comparing-div">
                    {" "}
                    <b>Original:</b> &nbsp; {parse(original)}
                  </div>
                ) : (
                  <></>
                )}
                <div className="mt-3">{parse(processedText)} </div>
                
                      
                    
              </Col>
            </Row>
          </div>
        </CardBody>
        <CardFooter>
          <hr />
          <div className="stats">
            <i className="fa fa-history" /> Updated 3 minutes ago
          </div>
        </CardFooter>
      </Card>
    </>
  );
}

export default TextEditor;