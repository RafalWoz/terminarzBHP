# Posts

Ten katalog jest miejscem na artykuly JSON tworzone recznie albo przez n8n.

Endpoint publikacji:

`POST /api/n8n/v1/create`

Wymagany naglowek:

`Authorization: Bearer <N8N_API_TOKEN>`

Przykladowe body:

```json
{
  "title": "Tytul artykulu",
  "slug": "tytul-artykulu",
  "description": "Krotki opis widoczny na liscie wpisow.",
  "category": "Szkolenia",
  "content": [
    "Pierwszy akapit artykulu.",
    "Drugi akapit artykulu."
  ],
  "status": "publish"
}
```
