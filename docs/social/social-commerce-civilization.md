# Social Commerce Civilization

## Purpose

Sprint 17 changes Prontera from a world people can visit into a civilization
where they can form relationships and return with social context.

```text
Explore
  -> meet people
  -> follow merchants
  -> make friends
  -> join guilds
  -> attend events
  -> build reputation
  -> return daily
```

Prontera is not becoming a generic social network. Every social feature must
strengthen trust, merchant identity, regional belonging, or useful commerce
community.

## Foundation Architecture

Sprint 17 is schema-safe and local-first.

Existing World API data remains authoritative for:

- Published merchants
- Products
- Live stores
- Founder status
- Regions and districts

The first social contracts persist locally:

- Friends and friend requests
- Followed merchants
- Favorite shops
- Joined guilds
- Event attendance
- Daily visit state
- Conversation previews
- Customer reputation factors

These contracts are ready for future authenticated APIs without claiming
cross-device or multiplayer durability today.

## Civilization Surfaces

- `/commerce-square`
- `/friends`
- `/following`
- `/guilds`
- `/reputation`
- `/events`
- `/founder-hall`

## Commerce Square

Commerce Square is the social homepage. It combines:

- Community feed
- Merchant announcements
- New openings
- Founder updates
- Guild activity
- Events
- Featured merchant
- Region spotlight
- Daily discovery
- Daily visitor greeting
- Social AI guidance

## Commerce Messenger Foundation

Sprint 17 displays lightweight conversation history and store contact context.

Future work:

- Authenticated direct messaging
- Merchant inbox
- Delivery and read state
- Moderation
- Translation
- CRM integration
- AI-assisted drafts with human approval

## Social AI

The Town Guide can recommend published merchants, guilds, events, and citizens
from known civilization data.

It must:

- Disclose that it is AI
- Avoid impersonating citizens or merchants
- Avoid sending messages or joining communities for the player
- Preserve merchant and Founder authority
- Recommend from published information only

## Civilization Metrics

The civilization layer displays:

- Population
- Merchants
- Guilds
- Events
- Followers
- Friendships
- Reputation score
- Commerce activity

Network-scale values are presentation foundations until dedicated analytics
services exist.
