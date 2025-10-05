from transformers import GPT2Tokenizer, GPT2LMHeadModel, Trainer, TrainingArguments, TextDataset, DataCollatorForLanguageModeling
from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent.parent.parent / "data/ml_ready/text_suggestions.txt"
MODEL_OUT = Path(__file__).resolve().parent.parent.parent / "models/gpt_text_model"

tokenizer = GPT2Tokenizer.from_pretrained("gpt2")
model = GPT2LMHeadModel.from_pretrained("gpt2")

dataset = TextDataset(
    tokenizer=tokenizer,
    file_path=str(DATA_PATH),
    block_size=128
)
data_collator = DataCollatorForLanguageModeling(tokenizer=tokenizer, mlm=False)

training_args = TrainingArguments(
    output_dir=str(MODEL_OUT),
    overwrite_output_dir=True,
    num_train_epochs=3,
    per_device_train_batch_size=2,
    save_steps=500,
    save_total_limit=2,
    logging_steps=50
)

trainer = Trainer(
    model=model,
    args=training_args,
    data_collator=data_collator,
    train_dataset=dataset
)
trainer.train()
model.save_pretrained(MODEL_OUT)
tokenizer.save_pretrained(MODEL_OUT)
