# Live Commerce API

Live Commerce lets Pro, Business, and Enterprise shops manage YouTube live or video embeds for merchant storefront experiences.

Starter shops cannot enable Live Commerce. Attempts to create or activate a live channel return `403 Forbidden` with:

```text
Live Commerce is available on Pro plan and above.
```

## Access Rules

- `OWNER` and `MANAGER` can create, update, delete, go live, and end live channels.
- `CASHIER` and `STAFF` can read live channels.
- Public storefront access is planned for a future route such as `/shops/:shopSlug/live`.

## Supported Providers

Current sprint:

- `YOUTUBE`

Future-ready providers:

- `FACEBOOK`
- `TIKTOK`
- `CUSTOM_EMBED`

The API accepts these providers at the data-model level, but only YouTube URLs are fully supported in Sprint 8A.

## YouTube URL Support

Accepted formats:

- `https://www.youtube.com/watch?v=VIDEO_ID`
- `https://youtu.be/VIDEO_ID`
- `https://www.youtube.com/live/VIDEO_ID`
- `https://www.youtube.com/embed/VIDEO_ID`

The API stores:

- `videoUrl`: original merchant-provided URL
- `embedUrl`: normalized YouTube embed URL, such as `https://www.youtube.com/embed/VIDEO_ID`

Invalid YouTube URLs return `400 Bad Request`.

## Endpoints

### GET `/shops/:shopId/live-channels/access`

Returns whether the current shop can use Live Commerce.

Response:

```json
{
  "canUseLiveCommerce": true,
  "minimumPlan": "PRO"
}
```

### POST `/shops/:shopId/live-channels`

Creates a YouTube live channel.

Body:

```json
{
  "provider": "YOUTUBE",
  "title": "Friday Live Product Demo",
  "description": "Live selling session for new arrivals.",
  "videoUrl": "https://www.youtube.com/watch?v=VIDEO_ID",
  "thumbnailUrl": "https://cdn.example.com/live-thumb.jpg",
  "status": "DRAFT",
  "startsAt": "2026-06-15T12:00:00.000Z",
  "endsAt": "2026-06-15T13:00:00.000Z"
}
```

### GET `/shops/:shopId/live-channels`

Lists non-deleted live channel records for a shop.

### GET `/shops/:shopId/live-channels/active`

Returns the active `LIVE` channel for a shop, or `null`.

### GET `/live-channels/:id`

Returns one live channel.

### PATCH `/live-channels/:id`

Updates channel metadata, status, video URL, or schedule fields.

### DELETE `/live-channels/:id`

Soft deletes a channel and marks it `DISABLED`.

### POST `/live-channels/:id/go-live`

Sets a channel to `LIVE`.

Only one non-deleted `LIVE` channel is allowed per shop. If another channel is already live, the API returns `409 Conflict`.

### POST `/live-channels/:id/end`

Sets a channel to `ENDED` and records `endsAt`.

## Statuses

- `DRAFT`
- `SCHEDULED`
- `LIVE`
- `ENDED`
- `DISABLED`
