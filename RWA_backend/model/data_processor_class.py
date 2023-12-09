from langchain import PromptTemplate, HuggingFaceHub, LLMChain
from .custom_model import CustomLLM
from tqdm import tqdm
from utilities.utils import split_text

class DataProcessor:

    def __init__(self, model_id, temperature, max_length):
        self.model_id = model_id
        self.temperature = temperature
        self.max_length = max_length 

    def process_data(self, data):
        template = "{sentences}"
        sentence_batches = split_text(data)
        processed = [] 
        prompt = PromptTemplate(template=template, input_variables=["sentences"])
        llm_chain = LLMChain(prompt=prompt, llm=CustomLLM(n=500, model_name=self.model_id))

        for batch in tqdm(
            sentence_batches, total=len(sentence_batches), desc="processing text.."
            ):  
            
            # llm_chain = LLMChain(prompt=prompt, llm=HuggingFaceHub(repo_id=self.model_id, model_kwargs={"temperature": self.temperature, "max_length": self.max_length}))
            
            processed_data = llm_chain.run(batch) 
            processed.append(processed_data)
        
        
        return " ".join(processed)
    
    

