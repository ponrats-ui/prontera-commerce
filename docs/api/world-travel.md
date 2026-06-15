# World Travel API

The World Travel API powers the Commerce Gate Network foundation for future Open World Commerce navigation.

Admin APIs create world topology. Customer APIs read active travel destinations and available Commerce Gates.

## Admin APIs

Admin write routes require JWT authentication and the `admin` role.

### POST `/world/zones`

Creates a city or major commerce zone.

Body:

```json
{
  "code": "PRONTERA",
  "name": "Prontera",
  "description": "Central commerce city",
  "status": "ACTIVE",
  "thumbnailUrl": "https://cdn.example.com/prontera.jpg",
  "mapImageUrl": "https://cdn.example.com/prontera-map.jpg",
  "sortOrder": 1
}
```

### GET `/world/zones`

Lists active world zones.

### POST `/world/districts`

Creates a commercial district inside a zone.

Body:

```json
{
  "zoneId": "zone-uuid",
  "code": "FASHION_STREET",
  "name": "Fashion Street",
  "description": "Fashion and apparel shops",
  "category": "FASHION",
  "sortOrder": 1
}
```

### GET `/world/districts`

Lists world districts.

### POST `/world/gates`

Creates a Commerce Gate between zones or districts.

Body:

```json
{
  "sourceZoneId": "source-zone-uuid",
  "destinationZoneId": "destination-zone-uuid",
  "sourceDistrictId": null,
  "destinationDistrictId": "destination-district-uuid",
  "title": "Prontera Fashion Gate",
  "description": "Fast travel to Fashion Street",
  "gateType": "DISTRICT_GATE",
  "status": "ACTIVE"
}
```

### GET `/world/gates`

Lists Commerce Gates.

## Customer APIs

Customer read routes are public foundation APIs for future storefront and Open World navigation.

### GET `/world/travel`

Returns travel overview:

- zones
- districts
- active gates
- smart travel recommendations

Optional query:

```text
?searchTerm=keyboard
```

Example recommendation response:

```json
{
  "recommendations": [
    {
      "label": "AI District",
      "destinationType": "DISTRICT",
      "zoneCode": "JUNO",
      "districtCode": "AI_DISTRICT",
      "reason": "Technology and smart commerce keywords map to AI District."
    }
  ]
}
```

### GET `/world/zones/:id`

Returns one zone with districts.

### GET `/world/zones/:id/districts`

Returns districts for a zone.

### GET `/world/gates/available`

Returns active Commerce Gates available for customer travel.

## Gate Types

- `CITY_GATE`
- `DISTRICT_GATE`
- `SPECIAL_GATE`

## Statuses

World zone statuses:

- `ACTIVE`
- `DISABLED`

Commerce Gate statuses:

- `ACTIVE`
- `DISABLED`

## Smart Travel Foundation

The current implementation uses simple keyword routing only:

- `keyboard` -> AI District
- `fashion` -> Fashion Street
- `wholesale` -> Morroc Wholesale Zone

No AI routing or marketplace search engine is implemented in this sprint.
