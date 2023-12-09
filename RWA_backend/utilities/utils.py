import difflib 

import torch
import re

device = torch.device('mps' if torch.backends.mps.is_available() else "cpu")

def split_text(text: str) -> list:
    """
    Split a string of text into a list of sentence batches.

    Parameters:
    text (str): The text to be split into sentence batches.

    Returns:
    list: A list of sentence batches. Each sentence batch is a list of sentences.
    """
    # Split the text into sentences using regex
    sentences = re.split(r"(?<=[^A-Z].[.?]) +(?=[A-Z])", text)

    # Initialize a list to store the sentence batches
    sentence_batches = []

    # Initialize a temporary list to store the current batch of sentences
    temp_batch = []

    # Iterate through the sentences
    for sentence in sentences:
        # Add the sentence to the temporary batch
        temp_batch.append(sentence)

        # If the length of the temporary batch is between 2 and 3 sentences, or if it is the last batch, add it to the list of sentence batches
        if len(temp_batch) >= 2 and len(temp_batch) <= 3 or sentence == sentences[-1]:
            sentence_batches.extend(temp_batch)
            temp_batch = []

    return sentence_batches

def detect_text_diff(original_string, edited_string):
    
    # initiate the Differ object
    d = difflib.Differ()
    # calculate the difference between the two texts
    diff = d.compare(original_string.split(), edited_string.split())
    change_result = {}

    passage_idx = 0
    is_free = True

    to_minus_idx = []
    to_plus = []
    for idx, item in enumerate(diff): 
        current_code = item[0]

        # event detected, start to gather the change
        if is_free and current_code != " ":
            is_free = False
            if current_code == "-":
                to_minus_idx.append(passage_idx)
            if current_code in ("+", ):
                to_plus.append(item.split()[-1])

        # event ended, save the change and reset
        elif not is_free and current_code == " ":
            is_free = True
            # this is hacky, if to_minus_idx is empty, we can assume that it is only insert
            if to_minus_idx:
                start_minus_index, stop_minus_index = to_minus_idx[0], to_minus_idx[-1] + 1
                plus_words = " ".join(to_plus)
                change_result[(start_minus_index, stop_minus_index)] = plus_words # save
            else:
                plus_words = " ".join(to_plus)
                change_result[(passage_idx)] = plus_words


        # not is_free, in the event, continue gathering the change
        else: 
            if current_code == "-":
                to_minus_idx.append(passage_idx)
            if current_code in ("+", ):
                to_plus.append(item.split()[-1])

        # keep track of real passage index, as well as the running minus index
        if current_code in (" ", "-"):
            passage_idx += 1
            if current_code == "-":
                current_minus_index = passage_idx

    return change_result
