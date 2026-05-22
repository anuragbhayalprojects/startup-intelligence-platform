import ollama

response = ollama.chat(
    model='qwen2.5:3b',
    messages=[
        {
            'role': 'user',
            'content': '''
            Analyze Razorpay for ICICI Group relevance.
            Return:
            - sector
	    - Bakground
            - use_cases
            - relevant_entities
            - priority_score
            '''
        }
    ]
)

print(response['message']['content'])
