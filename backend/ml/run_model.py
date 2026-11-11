"""
SpamOut - Machine Learning Phishing Classification Service

This script loads a fine-tuned RoBERTa transformer sequence classification model
to evaluate the likelihood of phishing or malicious intent in email text content.

Note: Requires fine-tuned weights file 'model.h5' in this directory.
To run:
    pip install torch transformers h5py
    python run_model.py
"""

import sys
from pathlib import Path
import torch
import h5py
from transformers import RobertaTokenizer, RobertaForSequenceClassification

MODEL_WEIGHTS_FILE = Path(__file__).resolve().parent / 'model.h5'

def load_classifier():
    """Load the RoBERTa model and tokenizer."""
    if not MODEL_WEIGHTS_FILE.exists():
        print(f"[-] Model weights file '{MODEL_WEIGHTS_FILE.name}' not found. Please provide 'model.h5'.")
        return None, None

    model = RobertaForSequenceClassification.from_pretrained('roberta-base', num_labels=2)
    state_dict = {}
    with h5py.File(str(MODEL_WEIGHTS_FILE), 'r') as f:
        for key in f.keys():
            state_dict[key] = torch.tensor(f[key][:])
    
    model.load_state_dict(state_dict)
    model.eval()
    tokenizer = RobertaTokenizer.from_pretrained('roberta-base')
    return model, tokenizer

def predict_phishing(text: str, model=None, tokenizer=None) -> int:
    """
    Predict whether text is benign (0) or phishing (1).
    """
    if model is None or tokenizer is None:
        model, tokenizer = load_classifier()
        if model is None:
            return -1

    encodings = tokenizer([text], truncation=True, padding=True, max_length=512, return_tensors='pt')
    with torch.no_grad():
        outputs = model(**encodings)
        prediction = outputs.logits.argmax(dim=-1).item()
    return prediction

if __name__ == '__main__':
    sample_text = sys.argv[1] if len(sys.argv) > 1 else "Urgent: Your account is suspended. Verify credentials immediately."
    result = predict_phishing(sample_text)
    print(f"Prediction for '{sample_text}': {result}")
