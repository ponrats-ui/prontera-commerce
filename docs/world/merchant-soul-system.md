# Merchant Soul System

Sprint 18A introduces the Merchant Soul framework: a lightweight emotional layer
that makes merchants feel like characters instead of database records.

Prontera merchants should be remembered by name, story, voice, and ritual before
they are remembered by product category.

## MerchantSoul

`MerchantSoul` is local world metadata attached to a shop slug. It does not
change commerce schema or checkout authority.

Fields:

- `merchantName`
- `merchantClass`
- `personalityType`
- `communicationStyle`
- `backgroundStory`
- `personalGoal`
- `favoriteProduct`
- `catchPhrase`
- `region`
- `reputationLevel`

Extended story fields preserve the emotional archive:

- journey
- background
- motivation
- dream
- challenge
- why they started
- founder history
- milestones
- community contributions

## Examples

Luna is a warm Coffee Artisan whose goal is to create the most welcoming coffee
house in Artisan Valley. Her catch phrase is: “Every cup tells a story.”

Captain Arlo is a practical Harbor Merchant whose goal is to connect every
region through reliable trade. His catch phrase is: “Trade keeps the world
moving.”

Professor Byte is a curious Tech Merchant whose goal is to make innovation
accessible. His catch phrase is: “Every invention starts with a question.”

## UX rule

Merchant pages must answer:

```text
Who is this person?
Why did they start?
What do they care about?
What would I remember about them tomorrow?
```

before asking:

```text
What do they sell?
```
