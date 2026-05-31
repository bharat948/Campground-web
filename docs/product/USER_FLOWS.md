# YelpCamp — User Flow Analysis

> **Last audited:** 2026-05-31

---

## Entry Points

| Entry | URL | Auth Required |
|-------|-----|---------------|
| Home | `/` | No |
| Campground index | `/campgrounds` | No |
| Campground detail | `/campgrounds/:id` | No |
| Register | `/register` | No |
| Login | `/login` | No |
| User profile | `/users/:id` | No |

---

## User Journey Maps

### 1. Guest Discovery Flow

```mermaid
flowchart TD
    A[Land on Home /] --> B[View stats]
    B --> C[Browse /campgrounds]
    C --> D{Search?}
    D -->|Yes| E[Filter by title/location]
    D -->|No| F[View all paginated]
    E --> F
    F --> G[Interact with cluster map]
    G --> H[Click campground]
    H --> I[View show page]
    I --> J[Read reviews]
    J --> K{Want to review?}
    K -->|Yes| L[Redirect to /login]
    K -->|No| M[Continue browsing]
```

### 2. Registration & Login Flow

```mermaid
sequenceDiagram
    participant U as User
    participant App as Express App
    participant DB as MongoDB
    participant P as Passport

    U->>App: GET /register
    App->>U: Render register form
    U->>App: POST /register (username, email, password)
    App->>DB: User.register()
    DB->>App: New user
    App->>P: req.login()
    P->>App: Session created
    App->>U: Redirect /campgrounds + flash success

    Note over U,App: Login with returnTo
    U->>App: GET /campgrounds/new (unauthenticated)
    App->>U: Redirect /login, set session.returnTo
    U->>App: POST /login
    App->>P: passport.authenticate('local')
    P->>App: Success
    App->>U: Redirect to returnTo or /campgrounds
```

### 3. Create Campground Flow

```mermaid
flowchart TD
    A[GET /campgrounds/new] --> B{Authenticated?}
    B -->|No| C[Redirect /login]
    B -->|Yes| D[Render form]
    D --> E[Fill title, location, price, description]
    E --> F[Upload 1-6 images]
    F --> G[POST /campgrounds]
    G --> H{Images present?}
    H -->|No| I[Flash error, redirect back]
    H -->|Yes| J[Geocode location via Mapbox]
    J --> K{Location found?}
    K -->|No| I
    K -->|Yes| L[Save to MongoDB + Cloudinary]
    L --> M[Redirect to show page]
```

### 4. Review & Social Interaction Flow

```mermaid
flowchart TD
    A[Campground show page] --> B{Logged in?}
    B -->|No| C[See reviews only]
    B -->|Yes| D[Submit review form]
    D --> E[POST /campgrounds/:id/reviews]
    E --> F[Validate + save]
    F --> G[Redirect to show page]

    G --> H[Like review]
    H --> I[POST .../reviews/:reviewId/like]
    I --> J{Already liked?}
    J -->|Yes| K[Remove like]
    J -->|No| L[Add like]
    K --> M[Redirect show page]
    L --> M

    G --> N[Post reply]
    N --> O[POST .../reviews/:reviewId/replies]
    O --> P[Redirect show page]
```

### 5. Edit / Delete Campground (Author Only)

```mermaid
stateDiagram-v2
    [*] --> ViewShow: GET /campgrounds/:id
    ViewShow --> EditForm: Author clicks Edit
    EditForm --> UpdateCampground: PUT /campgrounds/:id
    UpdateCampground --> ViewShow: Success redirect
    ViewShow --> Deleted: Author clicks Delete
    Deleted --> Index: DELETE → redirect /campgrounds
    ViewShow --> Denied: Non-author attempts edit
    Denied --> ViewShow: Flash error redirect
```

---

## State Transitions

### Session States

| State | Transitions |
|-------|-------------|
| Anonymous | → Authenticated (login/register) |
| Authenticated | → Anonymous (logout) |
| Authenticated + returnTo | → Redirect to protected URL after login |

### Campground States

| State | Created By | Transitions |
|-------|-----------|-------------|
| Draft (N/A) | — | No draft state; publish on create |
| Published | POST /campgrounds | → Updated, → Deleted |
| Deleted | DELETE | Cascade deletes reviews + Cloudinary images |

### Review States

| State | Transitions |
|-------|-------------|
| Active | → Deleted (author only) |
| Liked by user N | Toggle like on/off |

---

## Edge Cases

| Scenario | Current Behavior | Risk |
|----------|------------------|------|
| Invalid campground ID | Flash error, redirect `/campgrounds` | Low |
| Non-author edit attempt | Flash error, redirect to show page | Low |
| Review on wrong campground URL | Redirect with "Review not found" | Medium — IDOR prevented |
| Geocode failure | Flash error, stay on form | Low |
| Duplicate email registration | Flash error with passport message | Low |
| Upload > 6 images | Multer error → flash + redirect back | Low |
| Upload > 2MB | Multer LIMIT_FILE_SIZE → error handler | Low |
| Empty reply body | Joi validation → 400 error page | Low |
| Access profile of non-existent user | Flash error, redirect `/campgrounds` | Low |
| `register` handler error with `next` | **Bug:** `next` undefined in catch block | Medium |
| Default star rating = 1 | User may submit 1-star without intending | Low UX |
| Search regex injection | User input passed to `$regex` | Medium — ReDoS potential |

---

## Authorization Matrix

| Action | Guest | Auth User | Author | Review Author |
|--------|-------|-----------|--------|---------------|
| View campgrounds | ✅ | ✅ | ✅ | ✅ |
| Create campground | ❌ | ✅ | — | — |
| Edit/delete campground | ❌ | ❌ | ✅ own | — |
| Post review | ❌ | ✅ | ✅ | — |
| Delete review | ❌ | ❌ | — | ✅ own |
| Like review | ❌ | ✅ | ✅ | ✅ |
| Post reply | ❌ | ✅ | ✅ | ✅ |
| Delete reply | ❌ | ❌ | — | ✅ own reply |

---

## UI Layout Patterns

| Page | Layout | Notes |
|------|--------|-------|
| Most pages | `layouts/boilerplate.ejs` | Navbar, flash, footer, Mapbox CDN |
| Auth pages | `layouts/auth.ejs` | Minimal layout for login/register |
| Home | Custom hero in `home.ejs` | Stats from DB counts |

---

## Related Documentation

- [BUSINESS_LOGIC.md](./BUSINESS_LOGIC.md)
- [../architecture/ARCHITECTURE.md](../architecture/ARCHITECTURE.md)
- [../security/SECURITY_AUDIT.md](../security/SECURITY_AUDIT.md)
