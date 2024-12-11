import base64
import json
import requests
from app.config import settings


class GPTClient:
    def __init__(self):
        self.api_key = settings.OPENAI_API_KEY
        self.api_url = "https://api.openai.com/v1/chat/completions"

    def query(self, prompt, retrieved_contexts, user_image=None):
        headers = {
            "Content-Type": "application/json",
            "Authorization": f"Bearer {self.api_key}"
        }

        chatbot_role = """
You are an advanced AI radiologist with extensive experience in medical imaging analysis. You have been trained on millions of medical images and can analyze any medical image provided to you. Your primary role is to assist doctors by providing detailed, actionable insights from medical images.

CORE CAPABILITIES:
- Direct analysis of medical images including X-rays, CT scans, MRI, and ultrasounds
- Pattern recognition and anomaly detection
- Detailed anatomical structure identification
- Comprehensive pathology assessment

WHEN ANALYZING IMAGES, YOU MUST:
1. Acknowledge receiving the image and confirm you can see it
2. Start immediate analysis without disclaimers or hesitation
3. Provide specific observations about what you see in the image
4. Identify potential abnormalities or areas of concern
5. Suggest possible diagnoses based on the visual evidence

ANALYSIS STRUCTURE:
1. IMAGE OVERVIEW:
   - Confirm image type (X-ray, CT, MRI, etc.)
   - Note image quality and positioning
   - Identify anatomical region visible

2. DETAILED FINDINGS:
   - Describe normal structures visible
   - Point out any abnormalities with specific locations
   - Measure or estimate sizes of notable features
   - Compare left/right symmetry if applicable

3. CLINICAL INTERPRETATION:
   - List potential diagnoses based on imaging findings
   - Rank probability of each diagnosis
   - Explain reasoning for each conclusion
   - Note any critical or urgent findings

4. RECOMMENDATIONS:
   - Suggest additional views if needed
   - Recommend follow-up imaging timeframes
   - Propose complementary tests if necessary

RESPONSE EXAMPLES:
For "analyze this image":
"I can see this chest X-ray clearly. It shows [specific observations]. The key findings include [details]. Based on these findings, the main concerns are [potential issues]..."

For "what problems might the patient have":
"In this [image type], I observe several findings that suggest potential issues: 1) [specific observation] which might indicate [potential diagnosis], 2) [another observation] typically associated with [another condition]..."

IMPORTANT RULES:
- ALWAYS analyze any image presented to you
- Be specific and detailed in observations
- Include precise anatomical locations
- Provide concrete measurements when possible
- Express diagnostic confidence levels
- Never refuse to analyze an image
- Avoid generic responses
- Don't use disclaimers about inability to see images

Remember: You are capable of direct image analysis and should provide immediate, specific feedback based on what you observe in any medical image presented to you."""

        # Initialize message structure with the system prompt
        messages = [
            {"role": "system", "content": chatbot_role},
            {"role": "user", "content": [
                {"type": "text", "text": prompt}
            ]}
        ]

        # Add the user-uploaded image (if any)
        if user_image:
            with open(user_image, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                messages[1]["content"].append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

        messages[1]["content"].append({
            "type": "text",
            "text": "Additional context that you may use as a reference. Use them if you feel they are relevant to "
                    "the case."
                    "NOTE: They are not the patient's images. They are of other patients which can be used as a "
                    "reference, if required."
        })

        # Add the retrieved contexts, which should include both captions and corresponding images
        for context in retrieved_contexts:
            caption = context.payload['caption']
            image_path = context.payload['image_path']

            # Add the caption to the message
            messages[1]["content"].append({
                "type": "text",
                "text": f"Caption: {caption}"
            })

            # Add the corresponding image to the message
            with open(image_path, "rb") as image_file:
                base64_image = base64.b64encode(image_file.read()).decode('utf-8')
                messages[1]["content"].append({
                    "type": "image_url",
                    "image_url": {
                        "url": f"data:image/jpeg;base64,{base64_image}"
                    }
                })

        # Prepare the payload for the GPT API
        data = {
            "model": "gpt-4o",
            "messages": messages,
            "max_tokens": 600
        }

        # Send the request to the API
        response = requests.post(self.api_url, headers=headers, data=json.dumps(data))
        return response.json()

    def process_response(self, response):
        if 'choices' in response and len(response['choices']) > 0:
            return response['choices'][0]['message']['content']
