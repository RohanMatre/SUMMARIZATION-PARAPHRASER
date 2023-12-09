from langchain.llms.base import LLM
import torch
from typing import Mapping, Optional, Any, List
from langchain.callbacks.manager import CallbackManagerForLLMRun
from transformers import pipeline 
from utilities.utils import device
class CustomLLM(LLM):

    n: int
    model_name:str = "humarin/chatgpt_paraphraser_on_T5_base"
    pipeline = pipeline("text2text-generation", model=model_name, device=device, model_kwargs={"torch_dtype":torch.float32, "temperature" : 0.1})

    @property
    def _llm_type(self) -> str:
        return "custom"
    

    def _call(
        self,
        prompt: str,
        stop: Optional[List[str]] = None,
        run_manager: Optional[CallbackManagerForLLMRun] = None,
    ) -> str:
        if stop is not None:
            raise ValueError("stop kwargs are not permitted.")
        
        out = self.pipeline(prompt, max_length=9999)[0]["generated_text"]
        return out[:self.n]
    
    @property
    def _identifying_params(self) -> Mapping[str, Any]:
        """Get the identifying parameters."""
        return {"n": self.n}
