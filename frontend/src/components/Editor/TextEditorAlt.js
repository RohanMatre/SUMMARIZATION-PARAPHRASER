import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { EditorState, RichUtils, Modifier } from 'draft-js';
import { Editor } from 'react-draft-wysiwyg';
import _ from 'lodash'
import {
    Card,
    CardBody,
    CardFooter,
    Row,
    Col,
} from "reactstrap";

import parse from 'html-react-parser' 
import { toast } from 'react-toastify';

import { DraftailEditor, BLOCK_TYPE, INLINE_STYLE  } from "draftail";
 
import createKatexPlugin from "../katex";
import "draft-js/dist/Draft.css";
import "draftail/dist/draftail.css";


const styleMap = {
    'CODE': {
        overflowWrap: "break-word",
        borderRadius: "3px",
        padding: "1px 3px",
        fontFamily: "monospace",
        background: 'grey',
    },
    'HIGHLIGHT': {
        background: '#873939',
    },
    'HIGHLIGHT-PAST': {
        background: '#ad7b0d',
    },
};

 
function TextEditor(props) {
    const katexPlugin = createKatexPlugin();
    const styles = [
        'HIGHLIGHT-PAST'
    ];
    const [selected, setSelected] = useState({
        start: 0,
        end: 0
    })
    const [selectedText, setSelectedText] = useState("")

    const [editorState, setEditorState] = React.useState(() =>
        EditorState.createEmpty()
    );

    const notify = (msg) => toast.warn(msg, { theme: "dark" });
    const editor = React.useRef(null);
    function focusEditor() {
        editor.current.focus();
    }

    const contentWithoutStyles = _.reduce(styles, (newContentState, style) => (
        Modifier.removeInlineStyle(
            newContentState,
            editorState.getSelection(),
            style
        )
    ), editorState.getCurrentContent());



    const onChangeState = (editorState) => {
        setEditorState(editorState)
    }


    const handleKeyCommand = (command, editorState) => {
        const newState = RichUtils.handleKeyCommand(editorState, command);
        if (newState) {
            onChangeState(newState)
            return 'handled';
        }

        return 'not-handled';
    }


    const [inputText, setInputText] = useState('');
    const [processedText, setProcessedText] = useState('');

    const handleInputChange = (event) => {
        setInputText(event.target.value);
    };

    const grammerCorrection = async (e) => {
        const currentfocus = editorState.getSelection().getFocusKey()
        const colorcheck = editorState.getCurrentInlineStyle(currentfocus).has("HIGHLIGHT-PAST")
       
        // const blocks = convertToRaw(editorState.getCurrentContent()).blocks;
        // const value = blocks.map(block => (!block.text.trim() && '\n') || block.text).join('\n');
        let value = selectedText

        if (value.length > 0) {
            if (!colorcheck) {
                onChangeState(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT'))
            }
            let body = {
                'text': value,
                'start': selected.start,
                'end': selected.end

            }

            axios
                .post('http://127.0.0.1:5000/paraphrase', { 'data': body }, {
                    headers: {
                        'Content-Type': 'application/json',
                        'Access-Control-Allow-Origin': "*"
                    },
                })
                .then((res) => {
                    if (!colorcheck) {
                        onChangeState(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT-PAST')) 
                    }
                    let text = res.data.processedData
                    if (text.length > 0) {
                        let split = text.split(" ")
                        let error = res.data.error_words
                        let pos = res.data.pos
                        let arr = []
                        let stringg = ""
                        split.forEach((element, index) => {
                            if (pos.length > 0) {
                                if (pos[0][0] == index) {
                                    element = `<span classname = 'red'>${element} `
                                }
                                else if (pos[0][1] == index) {
                                    element = `${element}</span>`
                                    pos.shift()
                                }
                            }
                            stringg = stringg + " " + element
                        })
                        setProcessedText(stringg);

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



    const handleMouseUp = () => {

        const selection = window.getSelection()
        const selected = selection.toString()

        //Setting the start index and the end index of the selected words (making sure that the lower index is always the start)
        if (selected.length > 0) {
            setSelectedText(selected)
            let start = 0
            let end = 0

            if (selection.anchorOffset < selection.focusOffset) {
                start = selection.anchorOffset
                end = selection.focusOffset
            } else {
                start = selection.focusOffset
                end = selection.anchorOffset
            }

            let startend = {
                start: start,
                end: end
            }
            console.log(startend)

            setSelected(startend)

        }
    }

    const clearHL = () => {
        onChangeState(EditorState.push(
            editorState,
            contentWithoutStyles,
            'change-inline-style'
        ))
    }
    const handleKeyDown = () => {
        const currentfocus = editorState.getSelection().getFocusKey()
        const colorcheck = editorState.getCurrentInlineStyle(currentfocus).has("HIGHLIGHT-PAST")
        if (colorcheck) {
            onChangeState(RichUtils.toggleInlineStyle(editorState, 'HIGHLIGHT-PAST'))
        }


    }
    const blocksInEditingMode = new Map();
    const [readonly, setReadOnly] = useState(false)
    
    const getEditorState = () => {
        return editorState
    }
 
    return (
        <>
            <Card>

                <CardBody>

                    <div onMouseUp={() => handleMouseUp()} onKeyDown={() => handleKeyDown()}> 
                        <Row>
                            <Col lg="6">
                            <DraftailEditor customStyleMap={styleMap} editorState={editorState} onChange={(es) => setEditorState(es)}  
                            spellCheck = {true}
                            blockTypes={[
                                         { type: BLOCK_TYPE.HEADER_ONE },
                                         { type: BLOCK_TYPE.HEADER_TWO },
                                        { type: BLOCK_TYPE.HEADER_THREE },
                                        { type: BLOCK_TYPE.BLOCKQUOTE },
                                        { type: 'code', label : "{ }" },
                                        { type: BLOCK_TYPE.UNORDERED_LIST_ITEM }
                                    ]}
                                inlineStyles={[
                                    { type: INLINE_STYLE.BOLD },
                                    { type: INLINE_STYLE.UNDERLINE },
                                    { type: INLINE_STYLE.ITALIC }, 
                                ]}
                                entityTypes={[katexPlugin.entityType]}
                                 controls={[katexPlugin.control]}
                                plugins={[katexPlugin]}
                                
                                /> 
                            </Col>
                            <Col lg="6" md="12" sm="12" className="para-box">
                                <button type="button" onClick={(e) => grammerCorrection(e)} className="btn btn-transparent">
                                    {/* <FontAwesomeIcon icon={'spell-check'} fill="currentColor"></FontAwesomeIcon> */}
                                    <i className="fas fa-paper-plane"></i>
                                    <span className="sr-only">Paraphrase</span>
                                </button>
                                <button type="button" onClick={(e) => clearHL(e)} className="btn btn-transparent">
                                    {/* <FontAwesomeIcon icon={'spell-check'} fill="currentColor"></FontAwesomeIcon> */}
                                    <i className="fas fa-times"></i>
                                    <span className="sr-only">Paraphrase</span>
                                </button>
                              
                                <div>{parse(processedText.length)}</div>
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
    )
}

 
 
  
export default TextEditor