import os
import json

try:
    from openai import OpenAI
    client = OpenAI(api_key=os.getenv("OPENAI_API_KEY"))
except Exception as e:
    client = None
    print("OpenAI client is not available:", e)


async def fetch_product_from_link(link: str) -> dict:
    if client is None:
        return {"title": "Product from page", "price": 99.99}

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": f"""Open this product page: {link}
Extract:
- exact product title
- current price (number only)
Return JSON: {{"title": "...", "price": 123.45}}""",
            }
        ],
    )
    return json.loads(resp.choices[0].message.content)


async def fetch_price_from_link(link: str) -> float:
    if client is None:
        return 99.99

    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[
            {
                "role": "user",
                "content": f"""Open this product page: {link}
Return JSON: {{"price": 123.45}}""",
            }
        ],
    )
    data = json.loads(resp.choices[0].message.content)
    return data["price"]


async def search_offers(title: str, country: str) -> list[dict]:
    if client is None:
        return [
            {"title": "Mock shop", "link": "https://example.com", "price": 100.0}
        ]

    prompt = f"""Find up to 5 online offers for the product "{title}" in {country}.
Return ONLY JSON array like:
[
  {{"title": "Shop A", "link": "https://...", "price": 99.99}}
]
"""
    resp = client.chat.completions.create(
        model="gpt-4o-mini",
        messages=[{"content": prompt, "role": "user"}],
    )
    return json.loads(resp.choices[0].message.content)
