from factorsum.model import FactorSum # makes long text convert to into breif summary
import collections as ct  # It provides ds like counting elements repeated,named fields,ordered items,etc in lists
import string # provide constants and functions working with strings like character sets,string formatting,etc
import nltk 
# why do we need this? -->
# 1. Preprocessing - NLTK provides tools for tokenization, stopword removal, and other text preprocessing tasks, which are essential for preparing text data for summarization.
# 2. Algorithms: NLTK offers a variety of algorithms and tools for text analysis and summarization, such as the TextRank algorithm 
# 3. Resources: NLTK includes various language resources, such as pre-trained models and corpora, which can be useful for building and fine-tuning summarization models.
import sys # working with sys files

# Add 'factorsum' to the path if it's not there, and initialize variables.
if 'factorsum' not in sys.path:
    sys.path.append('factorsum')
    last_training_domain = None
    last_dataset = None
    last_split = None

try:
    nltk.data.find("tokenizers/punkt")  # It has the Punkt tokenizer model needed for sentence tokenization. 
except:
    nltk.download("punkt", quiet=True) # If it's not available, it downloads it.

# Summarize class
class Summarizer:

    # arxiv - researchers share and access scientific articles before formal publication.    
    def __init__(self, domain = 'arxiv'):
        
        self.model = FactorSum(domain)

    def get_summary(self, document):
        # Use the summarization model to create a summary with specific parameters.
        summary = self.model.summarize(
                document, # a document string 
                target_budget=200,  
                verbose=True,
            )
        # Process and filter the generated summary.
        res = self.filter_summary(summary[0])
        return res

    def filter_summary(self, summary):
        
        # create an empty tmp list
        tmp = []

        # punctuation characters to be removed
        punct =  string.punctuation.replace('.', '')
        punct =   punct.replace(',', '')
        punct =   punct.replace('?', '')
        punct =   punct.replace('!', '')
        punct =   punct.replace('.', '')
        # print(summary)
        
        # Iterate through each sentence in the summary.
        for summ in summary:
            #  Calculate the count of punctuation in the sentence.
            count  = sum(v for k, v in ct.Counter(summ).items() if k in punct)
        #    print(count)
            # Capitalize the first letter of the sentence.
            summ = summ[0].capitalize() + summ[1:]
            # Append the sentence to the filtered summary if it has less than 5 punctuation characters
            if(count < 5):
                tmp.append(summ)

        # join the list 
        return " ".join(tmp)